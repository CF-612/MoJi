import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, symlink, mkdir, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { crc32 } from 'node:zlib';
import { buildPlugin, normalizeMcpUrl, archivePaths, writePluginZip } from '../scripts/package-chatgpt-plugin.mjs';

const address = 'https://my-moji.account.workers.dev'; // synthetic; never contacted
function unzipStored(zip) {
  const entries = new Map(); let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(zip.readUInt16LE(offset + 8), 0);
    const size = zip.readUInt32LE(offset + 18), nameLength = zip.readUInt16LE(offset + 26);
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
    const data = zip.subarray(offset + 30 + nameLength, offset + 30 + nameLength + size);
    assert.equal(crc32(data), zip.readUInt32LE(offset + 14));
    assert.equal(entries.has(name), false); entries.set(name, data);
    offset += 30 + nameLength + size;
  }
  const start = offset;
  for (const [name, data] of entries) {
    assert.equal(zip.readUInt32LE(offset), 0x02014b50);
    const n = zip.readUInt16LE(offset + 28);
    assert.equal(zip.subarray(offset + 46, offset + 46 + n).toString(), name);
    assert.equal(zip.readUInt32LE(offset + 24), data.length);
    assert.equal(zip.readUInt32LE(zip.readUInt32LE(offset + 42)), 0x04034b50);
    offset += 46 + n;
  }
  assert.equal(zip.readUInt32LE(offset), 0x06054b50);
  assert.equal(zip.readUInt16LE(offset + 10), entries.size);
  assert.equal(zip.readUInt32LE(offset + 12), offset - start);
  assert.equal(zip.readUInt32LE(offset + 16), start);
  assert.equal(zip.length, offset + 22);
  return entries;
}

test('root and MCP input normalize to the same personal endpoint', () => {
  for (const suffix of ['', '/', '/mcp', '/mcp/']) assert.equal(normalizeMcpUrl(address + suffix), address + '/mcp');
});

test('reject unsafe addresses and secrets without echoing input', () => {
  for (const input of ['http://public.workers.dev', 'file:///mcp', 'https://localhost', 'https://x.local/mcp', 'https://x.internal', 'https://example.com', 'https://your-instance.example/mcp', 'https://127.1', 'https://2130706433', 'https://0x7f000001', 'https://10.0.0.1', 'https://169.254.169.254', 'https://192.168.0.1', 'https://[::1]', 'https://[::ffff:127.0.0.1]', 'https://user:secret@public.workers.dev', address + '?token=secret', address + '/mcp#secret', address + '/mcp?', address + ':8443', address + '/private', address + '/%6dcp', address + '\\mcp', ' ' + address, address + '.']) {
    assert.throws(() => normalizeMcpUrl(input), error => !error.message.includes('secret') && /HTTPS/.test(error.message), input);
  }
});

test('documented portable schema contract, original branding, remote OAuth only', async () => {
  const { entries, zip } = await buildPlugin(address);
  const unpacked = unzipStored(zip);
  assert.deepEqual([...unpacked.keys()], archivePaths);
  assert.deepEqual([...unpacked], entries);
  const plugin = JSON.parse(unpacked.get('plugin.json'));
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(plugin.name, 'moji'); assert.equal(plugin.version, pkg.version); assert.equal(plugin.description, pkg.description);
  const ui = plugin.extensions['com.openai'].interface;
  assert.equal(ui.displayName, pkg.displayName);
  assert.ok([...ui.shortDescription].length <= 30);
  for (const key of ['composerIcon', 'logo']) assert.ok(unpacked.has(ui[key].slice(2)));
  const icon = unpacked.get('assets/icon.png');
  assert.equal(icon.readUInt32BE(16), 256); assert.equal(icon.readUInt32BE(20), 256); assert.equal(icon.length, 9484);
  assert.deepEqual(JSON.parse(unpacked.get('mcp.json')), {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { moji: { type: 'streamable-http', url: address + '/mcp', extensions: { 'com.openai': { auth: { type: 'oauth', client: { mode: 'dcr' } } } } } }
  });
  assert.equal(plugin.extensions['com.openai'].apps, undefined);
  assert.equal(plugin.extensions['com.openai'].hooks, undefined);
});

test('deterministic ZIP allowlist excludes local config, tokens, tools and novels', async () => {
  const previous = process.env.MOJI_OWNER_KEY;
  process.env.MOJI_OWNER_KEY = 'SENTINEL_PRIVATE_OWNER_KEY_DO_NOT_PACKAGE';
  try {
    const first = await buildPlugin(address), second = await buildPlugin(address + '/mcp');
    assert.deepEqual(first.zip, second.zip);
    for (const text of ['SENTINEL_PRIVATE', 'clientSecret', 'client_secret', 'Authorization', 'plugin_asdk_app']) assert.equal(first.zip.includes(Buffer.from(text)), false);
    assert.throws(() => normalizeMcpUrl('https://owner:secret@public.workers.dev'));
  } finally { if (previous === undefined) delete process.env.MOJI_OWNER_KEY; else process.env.MOJI_OWNER_KEY = previous; }
});

test('personal output is ignored while template source is tracked-capable', () => {
  const path = 'integrations/chatgpt-workbench/cloud/plugin/';
  assert.equal(execFileSync('git', ['check-ignore', path + 'moji-personal.zip'], { encoding: 'utf8' }).trim(), path + 'moji-personal.zip');
  assert.throws(() => execFileSync('git', ['check-ignore', path + 'template/plugin.json']));
});


test('output rejects symlinks/nonregular files and atomically replaces only the ZIP', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'moji-package-test-'));
  try {
    const output = join(directory, 'moji-personal.zip'), target = join(directory, 'unrelated.txt');
    await writeFile(target, 'KEEP_UNRELATED');
    await symlink(target, output);
    await assert.rejects(writePluginZip(output, Buffer.from('new zip')), /普通文件/);
    assert.equal(await readFile(target, 'utf8'), 'KEEP_UNRELATED');
    await rm(output); await mkdir(output);
    await assert.rejects(writePluginZip(output, Buffer.from('new zip')), /普通文件/);
    await rm(output, { recursive: true });
    await writePluginZip(output, Buffer.from('first zip'));
    await writePluginZip(output, Buffer.from('second zip'));
    assert.equal(await readFile(output, 'utf8'), 'second zip');
    assert.equal(await readFile(target, 'utf8'), 'KEEP_UNRELATED');
    assert.deepEqual((await readdir(directory)).sort(), ['moji-personal.zip', 'unrelated.txt']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
