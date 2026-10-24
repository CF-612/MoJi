// Offline, allowlisted portable package. No deployment, registration or credentials.
import { readFile, mkdir, writeFile, lstat, mkdtemp, rename, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { isIP } from 'node:net';
import { crc32 } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const template = new URL('../integrations/chatgpt-workbench/cloud/plugin/template/', import.meta.url);
export const archivePaths = Object.freeze(['plugin.json', '.app.json', 'mcp.json', 'assets/icon.png']);

export function normalizeAppId(input) {
  if (typeof input !== 'string' || !/^(?:plugin_)?asdk_app_[a-f0-9]{32}$/.test(input)) {
    throw new Error('请提供本人已注册应用的 asdk_app_… 或 plugin_asdk_app_… ID；不是 ZIP 插件的 Plugin_… ID，也不是密钥。');
  }
  return input.replace(/^plugin_/, '');
}

export function parsePluginArgs(args) {
  if (args.length === 1) return { input: args[0], guideOnly: true };
  if (args.length === 4 && args[1] === '--app-id' && args[3] === '--allow-extra-entry') return { input: args[0], appId: normalizeAppId(args[2]), allowExtraEntry: true };
  if (args.length === 2 && args[1] === '--desktop-only') return { input: args[0], desktopOnly: true };
  throw new Error('单入口：只填 URL 查看连接说明。额外外壳：URL --app-id 本人应用ID --allow-extra-entry（增加入口）。电脑测试：URL --desktop-only。');
}

export async function buildConnectionGuide(input) {
  const url = normalizeMcpUrl(input);
  const settings = JSON.parse(await readFile(new URL('connection.json', template), 'utf8'));
  return `${settings.displayName} — 单入口连接说明\nMCP：${url}\n认证：${settings.authentication}\n创建表单图标：${fileURLToPath(new URL(settings.icon, template))}\n此说明不是可导入的云端应用定义；ZIP 引用不能恢复已删除的应用。\n已有应用直接复用；首次使用注册一次并授权，不再上传 ZIP 外壳。手机使用相同账号和工作区。\n各端发现应用、调用工具、打开界面需要分别实测。本命令不部署、不注册、不生成 ZIP。`;
}

export function normalizeMcpUrl(input) {
  const fail = () => { throw new Error('请输入自己的公开 HTTPS 根地址或 /mcp 地址；不接受凭据、查询串、片段、本机/IP 地址、特殊端口或其他路径。'); };
  if (typeof input !== 'string' || input.length > 2048 || /[\s\\?#]/.test(input)) fail();
  let url;
  try { url = new URL(input); } catch { fail(); }
  const host = url.hostname;
  if (url.protocol !== 'https:' || url.username || url.password || url.port || isIP(host) || host.includes(':') ||
      !host.includes('.') || !/^[a-z0-9.-]+$/.test(host) ||
      host.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) ||
      /(?:^|\.)(?:localhost|local|internal|lan|home|test|invalid|example|onion)$/.test(host) ||
      /(?:^|\.)example\.(?:com|net|org)$/.test(host) ||
      !['/', '/mcp', '/mcp/'].includes(url.pathname)) fail();
  // No DNS lookup: this guards syntax, not endpoint ownership or DNS rebinding.
  return `${url.origin}/mcp`;
}

// Minimal ZIP32 "stored" writer for allowlisted files. UTF-8 names, fixed timestamp,
// no symlinks, recursion, shell invocation or dependency installation.
export function createZip(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const [path, bytes] of entries) {
    if (!archivePaths.includes(path)) throw new Error('Unexpected package file');
    const name = Buffer.from(path), data = Buffer.from(bytes), checksum = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(33, 12); header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x800, 8); directory.writeUInt16LE(33, 14); directory.writeUInt32LE(checksum, 16);
    directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(data.length, 24);
    directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
    central.push(directory, name); offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

// Reject non-regular destinations; atomic replacement never follows a destination
// symlink even if another process swaps it after lstat. Temporary data stays beside
// the output, so rename is same-filesystem and failed writes preserve the old ZIP.
export async function writePluginZip(output, bytes) {
  try {
    const current = await lstat(output);
    if (!current.isFile() || current.isSymbolicLink()) throw new Error('ZIP 输出路径不是普通文件；请移除链接或改名后重试。');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = await mkdtemp(join(dirname(output), '.moji-plugin-'));
  try {
    const staging = join(temporary, 'package.zip');
    await writeFile(staging, bytes, { mode: 0o600, flag: 'wx' });
    await rename(staging, output);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function buildPlugin(input, { appId, desktopOnly = false, allowExtraEntry = false } = {}) {
  const url = normalizeMcpUrl(input);
  if (typeof desktopOnly !== 'boolean' || (desktopOnly && appId !== undefined)) throw new Error('应用关联与桌面直连不能同时启用。');
  if (!desktopOnly && allowExtraEntry !== true) throw new Error('单入口请直接使用已注册应用；额外应用外壳需要 --allow-extra-entry，会增加入口。');
  const registeredAppId = desktopOnly ? undefined : normalizeAppId(appId);
  const plugin = JSON.parse(await readFile(new URL('plugin.json', template), 'utf8'));
  const mcp = JSON.parse(await readFile(new URL('mcp.json', template), 'utf8'));
  // Reconstruct the connection allowlist: never copy ambient env/config credentials.
  // Desktop 0.164.0-alpha.11.1 rejects MCP-level `extensions` before connecting.
  // Keep OAuth discovery on the protected server; never embed auth credentials.
  mcp.mcpServers = { moji: { type: 'streamable-http', url } };
  // App mappings reference existing registrations; they do not create or restore them.
  // Host availability and permissions must be verified separately.
  let connection;
  if (registeredAppId) {
    const apps = JSON.parse(await readFile(new URL('.app.json', template), 'utf8'));
    apps.apps = { moji: { id: registeredAppId, required: true } };
    plugin.extensions['com.openai'].apps = './.app.json';
    connection = ['.app.json', Buffer.from(JSON.stringify(apps, null, 2) + '\n')];
  } else {
    delete plugin.extensions['com.openai'].apps;
    connection = ['mcp.json', Buffer.from(JSON.stringify(mcp, null, 2) + '\n')];
  }
  const entries = [['plugin.json', Buffer.from(JSON.stringify(plugin, null, 2) + '\n')], connection,
    ['assets/icon.png', await readFile(new URL('assets/icon.png', template))]];
  return { url, appId: registeredAppId, mode: desktopOnly ? 'desktop-only' : 'app-wrapper-extra-entry', entries, zip: createZip(entries) };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') {
      console.log('单入口：npm run package:plugin -- "https://你的实例.workers.dev"\n高级外壳（增加入口）：URL --app-id 本人应用ID --allow-extra-entry\n电脑测试：URL --desktop-only\n单入口无需上传 ZIP；离线说明不代表各端通过验收。');
    } else {
      const { input, ...options } = parsePluginArgs(args);
      if (options.guideOnly) { console.log(await buildConnectionGuide(input)); } else {
      const result = await buildPlugin(input, options);
      const directory = resolve(root, 'integrations/chatgpt-workbench/cloud/plugin');
      await mkdir(directory, { recursive: true });
      const output = resolve(directory, options.desktopOnly ? 'moji-desktop-only.zip' : 'moji-app-wrapper.zip');
      await writePluginZip(output, result.zip);
      console.log(`已生成: ${output}\n模式: ${result.mode}\n核对应用连接的 MCP: ${result.url}\n${result.appId ? `关联应用: ${result.appId}` : '仅供电脑直连，不保证聊天和手机可用。'}\n只要一个入口时不要上传本包；直接使用已注册应用。个人包请勿作为通用包发布。授权及各端可视化界面仍需验收；本命令不验证线上服务。`);
      }
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
