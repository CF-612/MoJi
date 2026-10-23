import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, symlinkSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deploy, validSecret, root} from '../scripts/deploy-personal-cloud.mjs';
const accountId = 'a'.repeat(32);
const secret = 'synthetic-only-never-a-real-secret';
function harness(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'moji-deploy-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  const manifestPath = join(dir, 'instance.json'), calls = [], logs = [];
  const inventory = {accountId, workers: [], databases: [], namespaces: []};
  const state = {secrets: [], fail: options.fail, probe: true};
  const run = async (op, d) => {
    calls.push({op, args: {...d, secret: d.secret ? '[redacted test capture]' : undefined}});
    if (op === 'inspect') {
      inventory.serviceUrl = `https://${d.names.worker}.example.workers.dev`;
      if (options.collision) { const [collection, name] = options.collision; inventory[collection] = [{name: d.names[name], id: 'existing'}]; }
      if (options.wrongAccount) return {...inventory, accountId: 'b'.repeat(32)};
      return structuredClone(inventory);
    }
    if (state.fail === op) throw new Error(`Synthetic failure ${secret}`);
    if (op === 'createDatabase') { inventory.databases.push({name: d.names.database, id: '12345678-1234-1234-1234-123456789012'}); return {id: '12345678-1234-1234-1234-123456789012'}; }
    if (op === 'createNamespace') { inventory.namespaces.push({name: d.names.namespace, id: '1'.repeat(32)}); return {id: '1'.repeat(32)}; }
    if (op === 'upload') { inventory.workers = [{name: d.names.worker, bindings: [{name: 'DB', type: 'd1', id: d.resources.database}, {name: 'OAUTH_KV', type: 'kv_namespace', id: d.resources.namespace}]}]; return {url: `https://${d.names.worker}.example.workers.dev`, version: '12345678-1234-1234-1234-123456789012'}; }
    if (op === 'secrets') return state.secrets;
    if (op === 'putSecret') { assert.equal(d.secret, secret); state.secrets = [{name: 'MOJI_OWNER_KEY'}]; }
  };
  const args = {mode: 'new', accountId, instance: 'test', manifestPath, run, probe: async () => state.probe, getSecret: async () => secret, log: line => logs.push(line)};
  return {args, state, inventory, calls, logs, manifest: () => JSON.parse(readFileSync(manifestPath, 'utf8'))};
}
test('new creates isolated explicit resources, migrates before upload, separates client acceptance', async t => {
  const h = harness(t); const m = await deploy(h.args);
  assert.equal(m.stages.readiness, 'complete'); assert.equal(m.clientAcceptance, 'not-tested');
  assert.match(m.names.worker, /^moji-test-[a-f0-9]{12}$/);
  assert.ok(h.calls.findIndex(c => c.op === 'migrate') < h.calls.findIndex(c => c.op === 'upload'));
  const config = JSON.parse(readFileSync(m.configPath));
  assert.equal(config.d1_databases[0].database_id, '12345678-1234-1234-1234-123456789012'); assert.equal(config.kv_namespaces[0].id, '1'.repeat(32));
  assert.ok(!JSON.stringify(m).includes(secret)); assert.ok(!h.logs.join().includes(secret));
});
for (const collision of [['workers', 'worker'], ['databases', 'database'], ['namespaces', 'namespace']]) test(`collision ${collision[0]} never writes remotely, including retry`, async t => {
  const h = harness(t, {collision}); await assert.rejects(deploy(h.args));
  await assert.rejects(deploy({...h.args, resume: true}));
  assert.ok(h.calls.every(c => c.op === 'inspect'));
});
test('wrong account never writes', async t => {
  const h = harness(t, {wrongAccount: true}); await assert.rejects(deploy(h.args)); assert.deepEqual(h.calls.map(c => c.op), ['inspect']);
});
for (const op of ['createDatabase', 'createNamespace', 'migrate', 'upload', 'secrets', 'putSecret']) test(`failure ${op} stops with safe hint and no overall success`, async t => {
  const h = harness(t, {fail: op}); await assert.rejects(deploy(h.args));
  assert.equal(h.calls.at(-1).op, op); assert.ok(!h.logs.join().includes('readiness verified')); assert.ok(!h.logs.join().includes(secret));
  assert.match(h.logs.join(), /--resume/);
  assert.ok(!readFileSync(h.args.manifestPath, 'utf8').includes(secret));
  h.state.fail = null;
  if (op.startsWith('create')) { await assert.rejects(deploy({...h.args, resume: true})); assert.equal(h.calls.filter(c => c.op === op).length, 1); }
  else { const m = await deploy({...h.args, resume: true}); assert.equal(m.stages.readiness, 'complete'); assert.equal(h.calls.filter(c => c.op === 'createDatabase').length, 1); }
});
test('ambiguous creation looks up but never adopts even a matching name', async t => {
  const h = harness(t, {fail: 'createDatabase'}); await assert.rejects(deploy(h.args));
  h.inventory.databases.push({name: h.manifest().names.database, id: 'uncertain'}); h.state.fail = null;
  await assert.rejects(deploy({...h.args, resume: true}));
  assert.equal(h.calls.filter(c => c.op === 'createDatabase').length, 1); assert.equal(h.manifest().resources.database, undefined);
});
test('readiness fails closed and resume rechecks without repeating completed writes', async t => {
  const h = harness(t); h.state.probe = false; await assert.rejects(deploy(h.args)); h.state.probe = true;
  await deploy({...h.args, resume: true}); assert.equal(h.calls.filter(c => c.op === 'upload').length, 1);
});
test('update preserves exact IDs and existing secret, never creates resources', async t => {
  const h = harness(t); await deploy(h.args); h.calls.length = 0;
  await deploy({...h.args, mode: 'update', getSecret: () => assert.fail('must preserve secret')});
  assert.ok(!h.calls.some(c => ['createDatabase', 'createNamespace', 'putSecret'].includes(c.op)));
});
test('update ID mismatch or binding mismatch never writes', async t => {
  for (const mismatch of ['resource', 'binding']) {
    const h = harness(t); await deploy(h.args); h.calls.length = 0;
    if (mismatch === 'resource') h.inventory.databases[0].id = 'wrong'; else h.inventory.workers[0].bindings[0].id = 'wrong';
    await assert.rejects(deploy({...h.args, mode: 'update'})); assert.ok(h.calls.every(c => c.op === 'inspect'));
  }
});
test('missing update manifest and moved/tampered manifest fail before executor', async t => {
  const h = harness(t); await assert.rejects(deploy({...h.args, mode: 'update'})); assert.equal(h.calls.length, 0);
  await deploy(h.args); const m = h.manifest(); m.manifestPath += 'other'; writeFileSync(h.args.manifestPath, JSON.stringify(m)); h.calls.length = 0;
  await assert.rejects(deploy({...h.args, resume: true})); assert.equal(h.calls.length, 0);
});
test('cancelled/invalid key never reaches upload secret or readiness', async t => {
  const h = harness(t); await assert.rejects(deploy({...h.args, getSecret: async () => ''}));
  assert.equal(h.manifest().stages.secret, 'failed'); assert.ok(!h.calls.some(c => c.op === 'putSecret'));
  assert.equal(validSecret('replace-with-your-own-secret-key'), false); assert.equal(validSecret('short'), false);
});
test('manifest lock prevents concurrent commands and releases after failure', async t => {
  const h = harness(t); writeFileSync(`${h.args.manifestPath}.lock`, '');
  await assert.rejects(deploy(h.args), /locked/); assert.equal(h.calls.length, 0);
  rmSync(`${h.args.manifestPath}.lock`); await deploy(h.args);
});
test('missing old secret on update stops without rotating or claiming readiness', async t => {
  const h = harness(t); await deploy(h.args); h.state.secrets = []; h.calls.length = 0; h.logs.length = 0;
  await assert.rejects(deploy({...h.args, mode: 'update', getSecret: () => assert.fail('never solicit replacement automatically')}));
  assert.ok(!h.calls.some(c => c.op === 'putSecret')); assert.equal(h.manifest().stages.secret, 'failed');
  assert.ok(!h.logs.join().includes('readiness verified'));
});

test('unknown, modified or missing SQL fails before executor', async t => {
  for (const mutation of ['unknown', 'modified', 'missing']) {
    const h = harness(t);
    const base = join(h.args.manifestPath, '..', 'source');
    const migrations = join(base, 'integrations/chatgpt-workbench/cloud/migrations');
    mkdirSync(migrations, {recursive: true});
    cpSync(join(root, 'wrangler.jsonc'), join(base, 'wrangler.jsonc'));
    cpSync(join(root, 'integrations/chatgpt-workbench/cloud/migrations'), migrations, {recursive: true});
    if (mutation === 'unknown') writeFileSync(join(migrations, '0003_drop.sql'), 'DROP TABLE workspaces;');
    else if (mutation === 'modified') writeFileSync(join(migrations, '0001_workspace.sql'), 'DROP TABLE workspaces;');
    else rmSync(join(migrations, '0001_workspace.sql'));
    await assert.rejects(deploy({...h.args, base}));
    assert.equal(h.calls.length, 0);
  }
});

test('crafted resume instance cannot escape the selected state directory', async t => {
  const h = harness(t); await deploy(h.args);
  const m = h.manifest(), parent = join(h.args.manifestPath, '..');
  m.instance = 'x/../../outside';
  const prefix = `moji-${m.instance}-${m.nonce}`;
  m.names = {worker: prefix, database: `${prefix}-db`, namespace: `${prefix}-oauth`};
  m.configPath = join(parent, `${prefix}.wrangler.json`);
  writeFileSync(h.args.manifestPath, JSON.stringify(m)); h.calls.length = 0;
  await assert.rejects(deploy({...h.args, resume: true}), /instance mismatch/);
  assert.equal(h.calls.length, 0); assert.equal(existsSync(m.configPath), false);
});
test('symlinked manifest, generated config and state parent are rejected before executor', async t => {
  for (const kind of ['manifest', 'config', 'parent']) {
    const h = harness(t); await deploy(h.args); const m = h.manifest();
    const target = join(h.args.manifestPath, '..', 'unrelated.txt'); writeFileSync(target, 'preserve');
    let args = {...h.args, resume: true};
    if (kind === 'manifest') { rmSync(h.args.manifestPath); symlinkSync(target, h.args.manifestPath); }
    else if (kind === 'config') { rmSync(m.configPath); symlinkSync(target, m.configPath); }
    else { const linked = join(h.args.manifestPath, '..', 'linked'); symlinkSync(join(h.args.manifestPath, '..'), linked, 'dir'); args.manifestPath = join(linked, 'instance.json'); }
    h.calls.length = 0;
    await assert.rejects(deploy(args), /Symlink/); assert.equal(h.calls.length, 0);
    assert.equal(readFileSync(target, 'utf8'), 'preserve');
  }
});
test('invalid persisted stages, resource IDs and URL are rejected without commands', async t => {
  for (const change of [m => {m.stages.upload = 'anything';}, m => {m.resources.database = '../other';}, m => {m.url = 'https://elsewhere.example/';}]) {
    const h = harness(t); await deploy(h.args); const m = h.manifest(); change(m);
    writeFileSync(h.args.manifestPath, JSON.stringify(m)); h.calls.length = 0;
    await assert.rejects(deploy({...h.args, resume: true}), /Invalid/); assert.equal(h.calls.length, 0);
  }
});

test('resume URL must match verified account subdomain even with the same Worker name', async t => {
  const h = harness(t); await deploy(h.args); const m = h.manifest();
  m.url = `https://${m.names.worker}.different-account.workers.dev`;
  writeFileSync(h.args.manifestPath, JSON.stringify(m)); h.calls.length = 0;
  await assert.rejects(deploy({...h.args, resume: true}));
  assert.deepEqual(h.calls.map(call => call.op), ['inspect']);
});
