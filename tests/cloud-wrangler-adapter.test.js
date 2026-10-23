import test from 'node:test';
import assert from 'node:assert/strict';
import {createWranglerRunner} from '../scripts/cloud-wrangler-adapter.mjs';

const accountId = 'a'.repeat(32);
const data = {accountId, configPath: '/tmp/isolated/wrangler.json', resources: {database: '12345678-1234-1234-1234-123456789012', namespace: '12345678123412341234123456789012'}, names: {worker: 'moji-test', database: 'moji-test-db', namespace: 'moji-test-kv'}};
function fixture({wrongAccount = false, failure = false, noDomain = false, existing = false, secretTimeout = false, createMismatch = false} = {}) {
  const calls = [], requests = [];
  const run = createWranglerRunner({root: '/tmp/isolated', env: {}, readConfig: () => ({account_id: accountId, name: data.names.worker, d1_databases: [{binding: 'DB', database_id: data.resources.database}], kv_namespaces: [{binding: 'OAUTH_KV', id: data.resources.namespace}]}), executor(file, args, options) {
    calls.push({file, args, options});
    if (failure) return {status: 1, stderr: 'sensitive token and secret', stdout: 'sensitive token and secret'};
    if (secretTimeout && args[1] === 'secret' && args[2] === 'put') return {status: null, error: new Error(options.input), stdout: options.input};
    let output;
    if (args[1] === 'whoami') output = {loggedIn: true, accounts: [{id: wrongAccount ? 'b'.repeat(32) : accountId}]};
    else if (args[1] === 'auth') output = {type: 'oauth', token: 'private-auth-value'};
    else if (args[1] === 'd1' && args[2] === 'list') output = [{name: data.names.database, uuid: '12345678-1234-1234-1234-123456789012'}];
    else if (args[1] === 'kv' && args[3] === 'list') output = [{title: data.names.namespace, id: '12345678123412341234123456789012'}];
    else if (args[1] === 'd1' && args[2] === 'create') output = {database_id: createMismatch ? '00000000-0000-0000-0000-000000000000' : data.resources.database};
    else if (args[1] === 'kv' && args[3] === 'create') output = {id: data.resources.namespace};
    else if (args[1] === 'secret' && args[2] === 'list') output = [{name: 'MOJI_OWNER_KEY', type: 'secret_text'}];
    else if (args[1] === 'deploy') return {status: 0, stdout: 'Current Version ID: 12345678-1234-1234-1234-123456789012'};
    return {status: 0, stdout: JSON.stringify(output ?? {})};
  }, async fetchImpl(url, options) {
    requests.push({url, options});
    let result;
    if (url.endsWith('/settings')) result = {bindings: [{name: 'DB', type: 'd1', id: '12345678-1234-1234-1234-123456789012'}, {name: 'OAUTH_KV', type: 'kv_namespace', namespace_id: '12345678123412341234123456789012'}, {name: 'MOJI_OWNER_KEY', type: 'secret_text', text: 'never-retain'}]};
    else if (url.endsWith('/scripts')) result = existing ? [{id: data.names.worker}] : [];
    else result = {subdomain: noDomain ? null : 'example'};
    return {ok: true, json: async () => ({success: true, result})};
  }});
  return {run, calls, requests};
}

test('adapter is inert until called and rejects mutation before account inspection', async () => {
  const f = fixture();
  assert.equal(f.calls.length, 0); assert.equal(f.requests.length, 0);
  await assert.rejects(f.run('upload', data), /Inspect/);
  assert.equal(f.calls.length, 0);
});
test('all subprocesses use explicit config, account, no shell or log files; secrets only stdin', async () => {
  const f = fixture();
  const inventory = await f.run('inspect', data);
  assert.equal(inventory.accountId, accountId);
  assert.equal(inventory.serviceUrl, 'https://moji-test.example.workers.dev');
  assert.deepEqual(await f.run('createDatabase', data), {id: '12345678-1234-1234-1234-123456789012'});
  assert.deepEqual(await f.run('createNamespace', data), {id: '12345678123412341234123456789012'});
  assert.deepEqual(await f.run('upload', data), {url: 'https://moji-test.example.workers.dev', version: '12345678-1234-1234-1234-123456789012'});
  await f.run('migrate', data);
  assert.deepEqual(await f.run('secrets', data), [{name: 'MOJI_OWNER_KEY'}]);
  await f.run('putSecret', {...data, secret: 'private-owner-value;$(echo unsafe)'});
  for (const call of f.calls) {
    assert.equal(call.options.shell, false);
    assert.equal(call.options.env.CLOUDFLARE_ACCOUNT_ID, accountId);
    assert.equal(call.options.env.WRANGLER_WRITE_LOGS, 'false');
    assert.deepEqual(call.args.slice(-2), ['--config', data.configPath]);
    assert(!JSON.stringify(call.args).includes('private-owner-value'));
    assert(!JSON.stringify(call.options.env).includes('private-owner-value'));
  }
  const put = f.calls.find(call => call.args[1] === 'secret' && call.args[2] === 'put');
  assert.equal(put.options.input, 'private-owner-value;$(echo unsafe)\n');
  const deploy = f.calls.find(call => call.args[1] === 'deploy');
  assert(deploy.args.includes('--experimental-provision=false'));
  assert(deploy.args.includes('--experimental-auto-create=false'));
  assert(f.requests.every(request => request.options.method === 'GET'));
});
test('wrong account prevents even API inspections and missing subdomain prevents writes', async () => {
  const wrong = fixture({wrongAccount: true});
  await assert.rejects(wrong.run('inspect', data), /Selected account/);
  assert.equal(wrong.requests.length, 0);
  const missing = fixture({noDomain: true});
  await assert.rejects(missing.run('inspect', data), /Register/);
  await assert.rejects(missing.run('upload', data), /Inspect/);
});
test('normalize exact Worker IDs without exposing secret values', async () => {
  const f = fixture({existing: true});
  const result = await f.run('inspect', data);
  assert.deepEqual(result.workers[0].bindings.slice(0, 2), [{name: 'DB', type: 'd1', id: '12345678-1234-1234-1234-123456789012'}, {name: 'OAUTH_KV', type: 'kv_namespace', id: '12345678123412341234123456789012'}]);
  assert(!JSON.stringify(result).includes('never-retain'));
  assert(!JSON.stringify(result).includes('private-auth-value'));
});
test('captured subprocess errors never disclose credentials', async () => {
  const f = fixture({failure: true});
  await assert.rejects(f.run('inspect', data), error => !String(error).includes('sensitive') && /uncertain/.test(error.message));
});

test('secret timeout errors are generic and create response ID must match inventory', async () => {
  const timed = fixture({secretTimeout: true});
  await timed.run('inspect', data);
  await assert.rejects(timed.run('putSecret', {...data, secret: 'never-expose-this-owner-secret'}), error => /uncertain/.test(error.message) && !String(error).includes('never-expose'));
  const mismatch = fixture({createMismatch: true});
  await mismatch.run('inspect', data);
  await assert.rejects(mismatch.run('createDatabase', data), /identity is uncertain/);
});
test('config binding mismatch rejects upload before subprocess invocation', async () => {
  const f = fixture();
  await f.run('inspect', data);
  const before = f.calls.length;
  await assert.rejects(f.run('upload', {...data, resources: {database: 'wrong', namespace: data.resources.namespace}}), /resource IDs/);
  assert.equal(f.calls.length, before);
});
