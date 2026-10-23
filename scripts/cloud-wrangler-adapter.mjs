import {spawnSync} from 'node:child_process';
import {isAbsolute, join} from 'node:path';
import {readFileSync} from 'node:fs';

// Verified against the installed Wrangler 4.149 and 4.151.3 command source. Never print raw
// stdout/stderr: auth token and failed secret commands can contain credentials.
export function createWranglerRunner({root, cli = join(root, 'integrations/chatgpt-workbench/node_modules/wrangler/bin/wrangler.js'), executor = spawnSync, fetchImpl = globalThis.fetch, env = process.env, readConfig = path => JSON.parse(readFileSync(path, 'utf8'))} = {}) {
  let verifiedAccount;
  let subdomain;
  const fail = (message) => { throw new Error(message); };
  function command(args, data, {json = false, input} = {}) {
    if (!isAbsolute(data.configPath || '') || !/^[a-f0-9]{32}$/.test(data.accountId || '')) fail('Explicit absolute config path and account ID required.');
    const options = {
      cwd: root, shell: false, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024,
      env: {...env, CLOUDFLARE_ACCOUNT_ID: data.accountId, CI: 'true', WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false', WRANGLER_LOG_SANITIZE: 'true', FORCE_COLOR: '0'},
      input,
    };
    let result;
    try { result = executor(process.execPath, [cli, ...args, '--config', data.configPath], options); }
    catch { fail('Wrangler command failed; remote result may be uncertain. Reinspect before retrying.'); }
    if (result.error || result.status !== 0) fail('Wrangler command failed; remote result may be uncertain. Reinspect before retrying.');
    if (!json) return result.stdout || '';
    try { return JSON.parse(result.stdout); } catch { fail('Wrangler returned an unexpected response. Reinspect before retrying.'); }
  }
  function headers(data) {
    const credentials = command(['auth', 'token', '--json'], data, {json: true});
    if (credentials.type === 'api_key' && credentials.key && credentials.email) return {'X-Auth-Key': credentials.key, 'X-Auth-Email': credentials.email};
    if (['api_token', 'oauth'].includes(credentials.type) && credentials.token) return {Authorization: `Bearer ${credentials.token}`};
    fail('Unsupported Cloudflare credentials.');
  }
  async function get(path, data, auth) {
    let response, body;
    try {
      response = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${data.accountId}${path}`, {method: 'GET', headers: auth, redirect: 'error', signal: AbortSignal.timeout(30000)});
      body = await response.json();
    } catch { fail('Cloudflare inspection failed; no mutation is safe until inspection succeeds.'); }
    if (!response.ok || body.success !== true) fail('Cloudflare inspection failed; verify account access and existing workers.dev subdomain.');
    // The scripts-list endpoint is unpaginated. Fail closed if that changes.
    if (body.result_info?.total_pages > 1 || body.result_info?.cursor) fail('Incomplete Cloudflare inventory; refusing writes.');
    return body.result;
  }
  const databases = data => command(['d1', 'list', '--json'], data, {json: true}).map(item => ({name: item.name, id: item.uuid}));
  const namespaces = data => command(['kv', 'namespace', 'list'], data, {json: true}).map(item => ({name: item.title, id: item.id}));
  function one(items, name, expectedId) {
    const matches = items.filter(item => item.name === name);
    if (!expectedId || matches.length !== 1 || matches[0].id !== expectedId) fail('Created resource identity is uncertain. Reinspect; do not create again.');
    return {id: matches[0].id};
  }
  return async function run(operation, data) {
    let config;
    try { config = readConfig(data.configPath); } catch { fail('Cannot read explicit generated configuration.'); }
    if (config.account_id !== data.accountId || config.name !== data.names?.worker) fail('Configuration account or Worker mismatch.');
    if (!['inspect', 'createDatabase', 'createNamespace'].includes(operation)) {
      const db = data.resources?.database, kv = data.resources?.namespace;
      if (!db || !kv || !config.d1_databases?.some(binding => binding.binding === 'DB' && binding.database_id === db) || !config.kv_namespaces?.some(binding => binding.binding === 'OAUTH_KV' && binding.id === kv)) fail('Explicit resource IDs must match the generated configuration.');
    }
    if (operation === 'inspect') {
      verifiedAccount = undefined;
      const user = command(['whoami', '--json'], data, {json: true});
      if (!user.loggedIn || !user.accounts?.some(account => account.id === data.accountId)) fail('Selected account is not available to the current login.');
      const auth = headers(data);
      const scripts = await get('/workers/scripts', data, auth);
      if (!Array.isArray(scripts)) fail('Invalid Worker inventory.');
      const workers = scripts.map(script => ({name: script.id, bindings: []}));
      const selected = workers.find(worker => worker.name === data.names.worker);
      if (selected) {
        const settings = await get(`/workers/scripts/${encodeURIComponent(data.names.worker)}/settings`, data, auth);
        if (!Array.isArray(settings.bindings)) fail('Missing Worker binding evidence.');
        selected.bindings = settings.bindings.map(binding => ({name: binding.name, type: binding.type, id: binding.type === 'kv_namespace' ? binding.namespace_id : binding.id}));
      }
      const domain = await get('/workers/subdomain', data, auth);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(domain?.subdomain || '')) fail('Register a workers.dev subdomain separately before deploying.');
      subdomain = domain.subdomain;
      const result = {accountId: data.accountId, serviceUrl: `https://${data.names.worker}.${subdomain}.workers.dev`, workers, databases: databases(data), namespaces: namespaces(data)};
      verifiedAccount = data.accountId;
      return result;
    }
    if (verifiedAccount !== data.accountId) fail('Inspect the selected account before any deployment operation.');
    switch (operation) {
      case 'createDatabase': {
        const output = command(['d1', 'create', data.names.database, '--update-config=false'], data);
        const id = output.match(/"database_id"\s*:\s*"([a-f0-9-]{36})"/i)?.[1];
        return one(databases(data), data.names.database, id);
      }
      case 'createNamespace': {
        const output = command(['kv', 'namespace', 'create', data.names.namespace, '--update-config=false'], data);
        const id = output.match(/"id"\s*:\s*"([a-f0-9]{32})"/i)?.[1];
        return one(namespaces(data), data.names.namespace, id);
      }
      case 'upload': {
        const output = command(['deploy', '--experimental-provision=false', '--experimental-auto-create=false'], data);
        const version = output.match(/Current Version ID:\s*([a-f0-9-]{36})/i)?.[1];
        if (!version) fail('Upload returned no version evidence. Reinspect before retrying.');
        return {url: `https://${data.names.worker}.${subdomain}.workers.dev`, version};
      }
      case 'migrate': return void command(['d1', 'migrations', 'apply', 'DB', '--remote'], data);
      case 'secrets': return command(['secret', 'list', '--format', 'json'], data, {json: true}).map(({name}) => ({name}));
      case 'putSecret':
        if (typeof data.secret !== 'string' || /[\r\n]/.test(data.secret)) fail('Invalid secret input.');
        return void command(['secret', 'put', 'MOJI_OWNER_KEY'], data, {input: `${data.secret}\n`});
      default: fail('Unknown deployment operation.');
    }
  };
}
