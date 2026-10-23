import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ToolRuntime } from '@deepseek-ai/dsh-tools';
import { Session, canonicalHeader } from '@deepseek-ai/dsh-session';
import { snapshotJsonValue } from '@deepseek-ai/dsh-util-values';
import { apply } from '../src/index.js';
import { TOOL_ACTIONS } from '../src/contracts/actions.js';
import { testCredentials } from './helpers/credentials.js';

test('every registered tool survives official DSH request/header serialization without an LLM', async t => {
  const root = await mkdtemp(join(tmpdir(), 'moji-request-header-'));
  const registered = [], effects = [];
  const ctx = { credentials: testCredentials(),
    tools: { register: tool => registered.push(tool), guard() {} },
    skills: { register() {} }, connection: { fetch: { register() {} } },
    on() {}, effect: fn => effects.push(fn()), provide: (key, value) => { ctx[key] = value; },
  };
  t.after(async () => { for (const dispose of effects) await dispose(); await rm(root, { recursive: true, force: true }); });
  await apply(ctx, { dataRoot: root });
  assert.deepEqual(registered.map(tool => tool.name), [...Object.keys(TOOL_ACTIONS), 'moji_maintenance']);
  const schemas = registered.map(tool => {
    assert.equal(typeof tool.description, 'string', `${tool.name}.description must be a string`);
    assert.ok(tool.description.trim(), `${tool.name}.description must not be empty`);
    // Use the host's real projection, not JSON.stringify (which silently drops undefined).
    const schema = ToolRuntime.prototype.schemaOf.call({}, tool, true);
    assert.notEqual(snapshotJsonValue(schema), undefined, `${tool.name} must be lossless JSON`);
    return schema;
  });
  const data = { header: canonicalHeader({ config: { provider: 'mock', model: 'mock' }, tools: schemas }), reason: 'initial' };
  assert.equal(new Session('moji-header-regression').append('request/header', data).type, 'request/header');
  const invalid = { ...data, header: { ...data.header, tools: schemas.map(tool => tool.name === 'moji_structure' ? { ...tool, description: undefined } : tool) } };
  assert.throws(() => new Session('moji-header-old-bug').append('request/header', invalid), /session event "request\/header" carries non-JSON-serializable data/);
});
