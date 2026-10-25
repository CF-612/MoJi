// Offline, allowlisted portable package. No deployment, registration or credentials.
import { readFile, mkdir, writeFile, lstat, open, realpath, mkdtemp, rename, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { isIP } from 'node:net';
import { constants } from 'node:fs';
import { crc32, inflateRawSync } from 'node:zlib';

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
  if (args.length === 2 && args[0] === '--update-from' && args[1]) return { updateFrom: args[1] };
  if (args.length === 1) return { input: args[0], guideOnly: true };
  if (args.length === 3 && args[1] === '--app-id') return { input: args[0], appId: normalizeAppId(args[2]) };
  if (args.length === 5 && args[1] === '--app-id' && args[3] === '--plugin-name') return { input: args[0], appId: normalizeAppId(args[2]), pluginName: normalizePluginName(args[4]) };
  if (args.length === 2 && args[1] === '--desktop-only') return { input: args[0], desktopOnly: true };
  throw new Error('官方流程：先创建自定义 MCP，再用 URL --app-id 本人应用ID 生成原位更新包；可加 --plugin-name 导出包中的name。电脑测试：URL --desktop-only。');
}

export function normalizePluginName(input) {
  if (typeof input !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,127}$/.test(input)) throw new Error('插件名称必须是导出配置中的合法 name，不是显示名称。');
  return input;
}

export async function buildConnectionGuide(input) {
  const url = normalizeMcpUrl(input);
  const settings = JSON.parse(await readFile(new URL('connection.json', template), 'utf8'));
  return `${settings.displayName} — 官方安装流程\n1. 添加自定义 MCP：${url}，认证 ${settings.authentication}，完成授权。已有连接直接复用。\n2. 从应用设置复制 asdk_app_… ID，运行：npm run package:plugin -- "${url}" --app-id "本人应用ID"。\n3. 在同一插件详情选择“上传新版本”，上传 moji-cloud-update.zip；不要从目录新增上传。\n图标：${fileURLToPath(new URL(settings.icon, template))}\n更新后核对图标、GitHub 网站、应用 ID、授权和单一入口。手机使用相同账号和工作区。\nZIP 引用不能恢复已删除的应用。各端需要分别实测。本次只输出说明，不生成 ZIP。`;
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

export async function buildPlugin(input, { appId, desktopOnly = false, pluginName } = {}) {
  // An existing app mapping owns its endpoint/OAuth on the host; never invent or replace either.
  const url = input === undefined && appId !== undefined && !desktopOnly ? undefined : normalizeMcpUrl(input);
  if (typeof desktopOnly !== 'boolean' || (desktopOnly && (appId !== undefined || pluginName !== undefined))) throw new Error('应用关联与桌面直连不能同时启用。');
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
    // The auto-created cloud plugin uses dev-<app suffix>; an exported name can override it.
    plugin.name = normalizePluginName(pluginName ?? registeredAppId.replace(/^asdk_app_/, 'dev-'));
    apps.apps = { [plugin.name]: { id: registeredAppId } };
    plugin.extensions['com.openai'].apps = './.app.json';
    connection = ['.app.json', Buffer.from(JSON.stringify(apps, null, 2) + '\n')];
  } else {
    delete plugin.extensions['com.openai'].apps;
    connection = ['mcp.json', Buffer.from(JSON.stringify(mcp, null, 2) + '\n')];
  }
  const entries = [['plugin.json', Buffer.from(JSON.stringify(plugin, null, 2) + '\n')], connection,
    ['assets/icon.png', await readFile(new URL('assets/icon.png', template))]];
  return { url, appId: registeredAppId, mode: desktopOnly ? 'desktop-only' : 'cloud-update', entries, zip: createZip(entries) };
}


// Read metadata in memory only: never extract files or execute archive contents.
// ZIP32 stored/deflate only, bounded sizes, no encryption/symlinks/duplicates.
export function readPluginZipMetadata(zip) {
  const fail = () => { throw new Error('现有 ZIP 格式或配置不受支持；请使用原应用 ID 与 name 显式生成，勿粘贴密钥。'); };
  try {
    if (!Buffer.isBuffer(zip) || zip.length < 22 || zip.length > 4 * 1024 * 1024) fail();
    let end = -1;
    for (let at = zip.length - 22; at >= Math.max(0, zip.length - 65557); at--) {
      if (zip.readUInt32LE(at) === 0x06054b50 && at + 22 + zip.readUInt16LE(at + 20) === zip.length) { end = at; break; }
    }
    if (end < 0 || zip.readUInt16LE(end + 4) || zip.readUInt16LE(end + 6)) fail();
    const count = zip.readUInt16LE(end + 10), size = zip.readUInt32LE(end + 12), start = zip.readUInt32LE(end + 16);
    if (!count || count > 16 || count !== zip.readUInt16LE(end + 8) || start + size !== end) fail();
    const entries = new Map(), regions = []; let offset = start;
    for (let i = 0; i < count; i++) {
      if (offset + 46 > end || zip.readUInt32LE(offset) !== 0x02014b50) fail();
      const flags = zip.readUInt16LE(offset + 8), method = zip.readUInt16LE(offset + 10), crc = zip.readUInt32LE(offset + 16);
      const compressed = zip.readUInt32LE(offset + 20), expanded = zip.readUInt32LE(offset + 24);
      const n = zip.readUInt16LE(offset + 28), extra = zip.readUInt16LE(offset + 30), comment = zip.readUInt16LE(offset + 32), local = zip.readUInt32LE(offset + 42);
      if (flags & ~0x808 || ![0, 8].includes(method) || expanded > 1024 * 1024 || compressed > 1024 * 1024 || zip.readUInt16LE(offset + 34)) fail();
      if (((zip.readUInt32LE(offset + 38) >>> 16) & 0xf000) === 0xa000 || offset + 46 + n + extra + comment > end) fail();
      const name = zip.subarray(offset + 46, offset + 46 + n).toString('utf8');
      if (!archivePaths.includes(name) || entries.has(name) || local + 30 > start || zip.readUInt32LE(local) !== 0x04034b50) fail();
      const localN = zip.readUInt16LE(local + 26), localExtra = zip.readUInt16LE(local + 28), dataStart = local + 30 + localN + localExtra, dataEnd = dataStart + compressed;
      if (zip.readUInt16LE(local + 6) !== flags || zip.readUInt16LE(local + 8) !== method || dataEnd > start || zip.subarray(local + 30, local + 30 + localN).toString('utf8') !== name) fail();
      if (!(flags & 8) && (zip.readUInt32LE(local + 14) !== crc || zip.readUInt32LE(local + 18) !== compressed || zip.readUInt32LE(local + 22) !== expanded)) fail();
      if (regions.some(([a, b]) => local < b && dataEnd > a)) fail(); regions.push([local, dataEnd]);
      const packed = zip.subarray(dataStart, dataEnd), data = method === 0 ? packed : inflateRawSync(packed, { maxOutputLength: 1024 * 1024 });
      if (data.length !== expanded || crc32(data) !== crc) fail();
      entries.set(name, data); offset += 46 + n + extra + comment;
    }
    if (offset !== end || !entries.has('plugin.json')) fail();
    const json = name => { const data = entries.get(name); if (!data || data.length > 64 * 1024) fail(); return JSON.parse(data.toString('utf8')); };
    const plugin = json('plugin.json');
    // Use original identity only. Everything executable/unknown is rejected, not copied.
    if (plugin.repository !== 'https://github.com/CF-612/MoJi' || Object.keys(plugin).some(k => !['$schema','name','version','description','author','repository','license','extensions'].includes(k))) fail();
    if (typeof plugin.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(plugin.version)) fail();
    const pluginName = normalizePluginName(plugin.name), extension = plugin.extensions?.['com.openai'];
    if (!extension || Object.keys(plugin.extensions).some(k => k !== 'com.openai') || Object.keys(extension).some(k => !['interface','apps'].includes(k))) fail();
    if (entries.has('.app.json')) {
      if (entries.has('mcp.json') || extension.apps !== './.app.json') fail();
      const apps = json('.app.json');
      if (Object.keys(apps).some(k => !['$schema','apps'].includes(k)) || !apps.apps || Object.keys(apps.apps).length !== 1 || !Object.hasOwn(apps.apps, pluginName)) fail();
      const mapping = apps.apps[pluginName];
      if (!mapping || Object.keys(mapping).some(k => !['id','required'].includes(k)) || (mapping.required !== undefined && typeof mapping.required !== 'boolean')) fail();
      return { pluginName, appId: normalizeAppId(mapping.id), required: mapping.required, version: plugin.version, mode: 'cloud-update' };
    }
    if (extension.apps !== undefined) fail();
    const mcp = json('mcp.json');
    if (Object.keys(mcp).some(k => !['$schema','mcpServers'].includes(k)) || !mcp.mcpServers || Object.keys(mcp.mcpServers).join() !== 'moji') fail();
    const server = mcp.mcpServers.moji;
    if (!server || server.type !== 'streamable-http' || Object.keys(server).some(k => !['type','url'].includes(k))) fail();
    return { pluginName, url: normalizeMcpUrl(server.url), version: plugin.version, mode: 'desktop-only' };
  } catch { fail(); }
}

export async function readExistingPluginZip(path) {
  const initial = await lstat(path);
  if (!initial.isFile() || initial.isSymbolicLink() || initial.size > 4 * 1024 * 1024) throw new Error('请提供不超过 4 MiB 的普通个人插件 ZIP，不能使用链接。');
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW || 0) | (constants.O_NONBLOCK || 0));
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > 4 * 1024 * 1024) throw new Error('请提供不超过 4 MiB 的普通个人插件 ZIP 文件。');
    // Read at most the cap + 1, even if a concurrent writer grows the file.
    const bytes = Buffer.alloc(Math.min(stat.size + 1, 4 * 1024 * 1024 + 1));
    let bytesRead = 0;
    while (bytesRead < bytes.length) {
      const read = await handle.read(bytes, bytesRead, bytes.length - bytesRead, bytesRead);
      if (!read.bytesRead) break; bytesRead += read.bytesRead;
    }
    if (bytesRead !== stat.size) throw new Error('ZIP 在读取时发生变化；请重新选择稳定的文件。');
    return bytes.subarray(0, bytesRead);
  } finally { await handle.close(); }
}

export async function buildPluginFromZip(zip) {
  const old = readPluginZipMetadata(zip);
  const result = old.mode === 'cloud-update'
    ? await buildPlugin(undefined, { appId: old.appId, pluginName: old.pluginName })
    : await buildPlugin(old.url, { desktopOnly: true });
  // Keep identity and optional app-required flag exactly; never copy OAuth secrets.
  const plugin = JSON.parse(result.entries[0][1]);
  const previous = old.version.split('.').map(Number), next = plugin.version.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (previous[i] > next[i]) throw new Error('现有插件版本比当前生成器新；请先获取最新正式生成器，不降级。');
    if (previous[i] < next[i]) break;
  }
  plugin.name = old.pluginName;
  result.entries[0][1] = Buffer.from(JSON.stringify(plugin, null, 2) + '\n');
  if (old.mode === 'cloud-update' && old.required !== undefined) {
    const app = JSON.parse(result.entries[1][1]); app.apps[old.pluginName].required = old.required;
    result.entries[1][1] = Buffer.from(JSON.stringify(app, null, 2) + '\n');
  }
  result.zip = createZip(result.entries);
  return { ...result, sourceMode: old.mode, uploadRequired: true, cloudDeployed: false };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') {
      console.log('从现有个人 ZIP 自动生成更新包：npm run package:plugin -- --update-from ./原插件.zip（保留原文件；生成后可由 Agent 内置浏览器或用户在同一插件上传新版本）\n单入口：npm run package:plugin -- "https://你的实例.workers.dev"\n原位更新包：URL --app-id 本人应用ID [--plugin-name 导出配置name]\n电脑测试：URL --desktop-only\n先创建自定义 MCP，再在同一插件上传新版本；不要新增插件。');
    } else {
      const { input, ...options } = parsePluginArgs(args);
      if (options.guideOnly) { console.log(await buildConnectionGuide(input)); } else {
        const result = options.updateFrom ? await buildPluginFromZip(await readExistingPluginZip(options.updateFrom)) : await buildPlugin(input, options);
        const directory = resolve(root, 'integrations/chatgpt-workbench/cloud/plugin');
        await mkdir(directory, { recursive: true });
        const output = resolve(directory, result.mode === 'desktop-only' ? 'moji-desktop-only.zip' : 'moji-cloud-update.zip');
        if (options.updateFrom && (resolve(options.updateFrom) === output || await realpath(options.updateFrom) === await realpath(output).catch(error => { if (error.code === 'ENOENT') return undefined; throw error; }))) throw new Error('请保留旧 ZIP 作为备份；输入 ZIP 不能与输出路径相同。');
        await writePluginZip(output, result.zip);
        console.log(`已生成: ${output}\n模式: ${result.mode}\n核对应用连接的 MCP: ${result.url || '由原应用管理；本次未读取或更改端点及 OAuth'}\n${result.appId ? `关联应用: ${result.appId}` : '仅供电脑直连，不保证聊天和手机可用。'}\n生成后可由 Agent 使用已授权内置浏览器继续上传，也可由用户手动上传；只有实际登录/权限/确认阻塞时才交接。云端更新包只能在对应插件详情选择“上传新版本”；不要新增插件或删除云端应用。个人包请勿作为通用包发布。授权及各端可视化界面仍需验收；本命令不验证线上服务。`);
      }
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
