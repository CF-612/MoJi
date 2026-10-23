import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Windows packaging includes the HTML resource required by local MCP', async () => {
  const packaging = await readFile(new URL('../scripts/package-moji.mjs', import.meta.url), 'utf8');
  const mcp = await readFile(new URL('../integrations/chatgpt-workbench/server/mcp.mjs', import.meta.url), 'utf8');
  assert.match(mcp, /dist\/native-paused\.html/);
  assert.match(packaging, /copyFile\(resolve\(integration,'dist\/native-paused\.html'\),resolve\(out,'dist\/native-paused\.html'\)\)/);
});
