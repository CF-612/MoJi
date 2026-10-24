// Offline, allowlisted portable package. No deployment, registration or credentials.
import { readFile, mkdir, writeFile, lstat, mkdtemp, rename, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { isIP } from 'node:net';
import { crc32 } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const template = new URL('../integrations/chatgpt-workbench/cloud/plugin/template/', import.meta.url);
export const archivePaths = Object.freeze(['plugin.json', 'mcp.json', 'assets/icon.png']);

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

// Minimal ZIP32 "stored" writer for three fixed files. UTF-8 names, fixed timestamp,
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

export async function buildPlugin(input) {
  const url = normalizeMcpUrl(input);
  const plugin = JSON.parse(await readFile(new URL('plugin.json', template), 'utf8'));
  const mcp = JSON.parse(await readFile(new URL('mcp.json', template), 'utf8'));
  // Reconstruct the connection allowlist: never copy ambient env/config credentials.
  // Desktop 0.164.0-alpha.11.1 rejects MCP-level `extensions` before connecting.
  // Keep OAuth discovery on the protected server; never embed auth credentials.
  mcp.mcpServers = { moji: { type: 'streamable-http', url } };
  const entries = [['plugin.json', Buffer.from(JSON.stringify(plugin, null, 2) + '\n')],
    ['mcp.json', Buffer.from(JSON.stringify(mcp, null, 2) + '\n')],
    ['assets/icon.png', await readFile(new URL('assets/icon.png', template))]];
  return { url, entries, zip: createZip(entries) };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 1 || args[0] === '--help') {
      console.log('用法: npm run package:plugin -- "https://你的实例.workers.dev"\n只需公开根地址或 /mcp；不要输入密钥。离线生成，不部署、不上传。');
      if (args[0] !== '--help') process.exitCode = 1;
    } else {
      const result = await buildPlugin(args[0]);
      const directory = resolve(root, 'integrations/chatgpt-workbench/cloud/plugin');
      await mkdir(directory, { recursive: true });
      const output = resolve(directory, 'moji-personal.zip');
      await writePluginZip(output, result.zip);
      console.log(`已生成: ${output}\nMCP: ${result.url}\n此包包含你的实例地址，请勿作为通用包发布。上传后仍须 OAuth 授权并验收可视化界面；本命令不验证线上服务。`);
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
