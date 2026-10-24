import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, symlink, mkdir, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { crc32 } from 'node:zlib';
import { buildConnectionGuide, buildPlugin, normalizeMcpUrl, normalizeAppId, parsePluginArgs, archivePaths, writePluginZip } from '../scripts/package-chatgpt-plugin.mjs';

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

test('desktop-compatible portable connection, original branding, no embedded credentials', async () => {
  const { entries, zip } = await buildPlugin(address, { desktopOnly: true });
  const unpacked = unzipStored(zip);
  assert.deepEqual([...unpacked.keys()], archivePaths.filter(p => p !== '.app.json'));
  assert.deepEqual([...unpacked], entries);
  const plugin = JSON.parse(unpacked.get('plugin.json'));
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(plugin.name, 'moji'); assert.equal(plugin.version, '0.11.3'); assert.equal(plugin.description, pkg.description);
  const ui = plugin.extensions['com.openai'].interface;
  assert.equal(ui.displayName, pkg.displayName);
  assert.ok([...ui.shortDescription].length <= 30);
  for (const key of ['composerIcon', 'logo']) assert.ok(unpacked.has(ui[key].slice(2)));
  const icon = unpacked.get('assets/icon.png');
  assert.equal(icon.readUInt32BE(16), 256); assert.equal(icon.readUInt32BE(20), 256); assert.equal(icon.length, 9484);
  assert.deepEqual(JSON.parse(unpacked.get('mcp.json')), {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { moji: { type: 'streamable-http', url: address + '/mcp' } }
  });
  assert.equal(plugin.extensions['com.openai'].apps, undefined);
  assert.equal(plugin.extensions['com.openai'].hooks, undefined);
});

test('deterministic ZIP allowlist excludes local config, tokens, tools and novels', async () => {
  const previous = process.env.MOJI_OWNER_KEY;
  process.env.MOJI_OWNER_KEY = 'SENTINEL_PRIVATE_OWNER_KEY_DO_NOT_PACKAGE';
  try {
    const first = await buildPlugin(address, { desktopOnly: true }), second = await buildPlugin(address + '/mcp', { desktopOnly: true });
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


test('output rejects nonregular files and atomically replaces only the ZIP', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'moji-package-test-'));
  try {
    const output = join(directory, 'moji-personal.zip'), target = join(directory, 'unrelated.txt');
    await writeFile(target, 'KEEP_UNRELATED');
    await t.test('reject symlink without modifying its target', async subtest => {
      try { await symlink(target, output); }
      catch (error) {
        if (process.platform === 'win32' && error.code === 'EPERM') {
          subtest.skip('Windows account lacks symlink privilege; other output safety checks still run');
          return;
        }
        throw error;
      }
      await assert.rejects(writePluginZip(output, Buffer.from('new zip')), /普通文件/);
      assert.equal(await readFile(target, 'utf8'), 'KEEP_UNRELATED');
      await rm(output);
    });
    await mkdir(output);
    await assert.rejects(writePluginZip(output, Buffer.from('new zip')), /普通文件/);
    await rm(output, { recursive: true });
    await writePluginZip(output, Buffer.from('first zip'));
    await writePluginZip(output, Buffer.from('second zip'));
    assert.equal(await readFile(output, 'utf8'), 'second zip');
    assert.equal(await readFile(target, 'utf8'), 'KEEP_UNRELATED');
    assert.deepEqual((await readdir(directory)).sort(), ['moji-personal.zip', 'unrelated.txt']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

const appId = 'asdk_app_0123456789abcdef0123456789abcdef';
test('explicit extra-entry wrapper references one app and no desktop MCP', async () => {
  const a = await buildPlugin(address, { appId, allowExtraEntry: true });
  const b = await buildPlugin(address, { appId: 'plugin_' + appId, allowExtraEntry: true });
  assert.deepEqual(a.zip, b.zip);
  const files = unzipStored(a.zip);
  assert.deepEqual([...files.keys()], ['plugin.json', '.app.json', 'assets/icon.png']);
  assert.equal(JSON.parse(files.get('plugin.json')).extensions['com.openai'].apps, './.app.json');
  assert.deepEqual(JSON.parse(files.get('.app.json')), { apps: { moji: { id: appId, required: true } } });
  assert.equal(a.zip.includes(Buffer.from(address)), false);
  assert.equal(a.zip.includes(Buffer.from('REPLACE_WITH')), false);
});
test('missing or invalid app mapping never silently creates desktop package', async () => {
  await assert.rejects(buildPlugin(address), /应用/);
  await assert.rejects(buildPlugin(address, { appId, desktopOnly: true }), /不能同时/);
  for (const input of ['', 'Plugin_0123456789abcdef0123456789abcdef', 'asdk_app_bad', 'secret', appId + '/x']) {
    assert.throws(() => normalizeAppId(input), /应用/);
  }
  assert.deepEqual(parsePluginArgs([address]), { input: address, guideOnly: true });
  await assert.rejects(buildPlugin(address, { appId }), /增加入口/);
  assert.throws(() => parsePluginArgs([address, '--app-id', appId]), /增加入口/);
  assert.throws(() => parsePluginArgs([address, '--app-id', appId, '--desktop-only']));
  assert.deepEqual(parsePluginArgs([address, '--app-id', 'plugin_' + appId, '--allow-extra-entry']), { input: address, appId, allowExtraEntry: true });
  assert.deepEqual(parsePluginArgs([address, '--desktop-only']), { input: address, desktopOnly: true });
});

test('single-entry guide preserves branding and does not generate a ZIP', async () => {
  const guide = await buildConnectionGuide(address);
  assert.ok(guide.includes('墨叽 · 小说工作台'));
  assert.ok(!guide.includes('（云端）'));
  assert.ok(guide.includes(address + '/mcp'));
  assert.ok(guide.includes('不生成 ZIP'));
  assert.ok(guide.includes('分别实测'));
  assert.ok(guide.includes('icon.png'));
  assert.ok(guide.includes('不能恢复已删除的应用'));
  assert.ok(guide.includes('不是可导入的云端应用定义'));
});
