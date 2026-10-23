import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Windows packaging includes the HTML resource required by local MCP', async () => {
  const packaging = await readFile(new URL('../scripts/package-moji.mjs', import.meta.url), 'utf8');
  const mcp = await readFile(new URL('../integrations/chatgpt-workbench/server/mcp.mjs', import.meta.url), 'utf8');
  assert.match(mcp, /dist\/native-paused\.html/);
  assert.match(packaging, /copyFile\(resolve\(integration,'dist\/native-paused\.html'\),resolve\(out,'dist\/native-paused\.html'\)\)/);
});

test('Moji packaging keeps legacy data in place while naming the new distribution correctly', async () => {
  const source = await readFile(new URL('../scripts/package-moji.mjs', import.meta.url), 'utf8');
  assert.match(source, /`Moji-\$\{version\}-windows-x64`/);
  assert.match(source, /LOCALAPPDATA 'MoJi\\workbench'/);
  assert.match(source, /Moji bundled third-party notices/);
  assert.match(source, /github\.com\/mistnest\/dsh-cuigengji-plugin/);
});

test('DSH installers reject a legacy installation before mutating the profile', async () => {
  const native = await readFile(new URL('../scripts/install-dsh-native.mjs', import.meta.url), 'utf8');
  const desktop = await readFile(new URL('../scripts/install-desktop.ps1', import.meta.url), 'utf8');
  assert.ok(native.indexOf("!before.dependencies?.['dsh-cuigengji']") < native.indexOf('const backup='));
  assert.ok(desktop.indexOf("$existing.dependencies.'dsh-cuigengji'") < desktop.indexOf('& npm.cmd pack'));
  assert.match(native, /expected\.version/);
  assert.doesNotMatch(native, /0\.10\.2/);
  assert.match(native, /保留数据目录/);
  assert.match(desktop, /保留数据目录/);
});
