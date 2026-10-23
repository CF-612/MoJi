import {randomBytes, createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, readdirSync, openSync, closeSync, unlinkSync, lstatSync} from 'node:fs';
import {resolve, dirname, join, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

export const root = fileURLToPath(new URL('../', import.meta.url));
const phases = ['resources', 'migration', 'upload', 'secret', 'readiness'];
class DeploymentError extends Error {}
const fail = message => { throw new DeploymentError(message); };
export function validSecret(value) {
  return typeof value === 'string' && value.length >= 24 && !/[\r\n]/.test(value) && value !== 'replace-with-your-own-secret-key';
}
function rejectSymlinks(path) {
  let current = resolve(path);
  while (true) {
    try { if (lstatSync(current).isSymbolicLink()) fail('Symlinked state paths are not supported.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
function save(path, value) {
  rejectSymlinks(path);
  mkdirSync(dirname(path), {recursive: true, mode: 0o700});
  const temporary = `${path}.${randomBytes(8).toString('hex')}.tmp`;
  try {
    writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', {mode: 0o600, flag: 'wx'});
    renameSync(temporary, path);
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
function validateManifest(m, path, accountId) {
  if (!m || m.schema !== 1 || m.owner !== 'moji-personal-cloud' || m.manifestPath !== path || m.accountId !== accountId || !/^[a-f0-9]{12}$/.test(m.nonce || '') || !/^[a-z][a-z0-9-]{1,30}$/.test(m.instance || '')) fail('Manifest ownership/account/instance mismatch.');
  const allowedFields = ['schema', 'owner', 'manifestPath', 'accountId', 'instance', 'nonce', 'intent', 'names', 'resources', 'stages', 'clientAcceptance', 'sourceVersion', 'configPath', 'pendingCreation', 'pendingUpload', 'url', 'deploymentVersion'];
  if (Object.keys(m).some(key => !allowedFields.includes(key)) || m.clientAcceptance !== 'not-tested' || !/^(?:unknown|[a-f0-9]{40})$/.test(m.sourceVersion || '') || (m.deploymentVersion !== undefined && !/^[a-f0-9-]{36}$/i.test(m.deploymentVersion))) fail('Invalid manifest metadata.');
  if (!m.names || Object.keys(m.names).length !== 3) fail('Invalid manifest names.');
  const prefix = `moji-${m.instance}-${m.nonce}`;
  if (m.names?.worker !== prefix || m.names?.database !== `${prefix}-db` || m.names?.namespace !== `${prefix}-oauth` || m.configPath !== join(dirname(path), `${prefix}.wrangler.json`) || dirname(resolve(m.configPath)) !== dirname(path)) fail('Manifest resource ownership mismatch.');
  if (!['new', 'update'].includes(m.intent) || !m.resources || !m.stages || typeof m.resources !== 'object' || typeof m.stages !== 'object' || Array.isArray(m.resources) || Array.isArray(m.stages)) fail('Invalid manifest state.');
  if (Object.keys(m.resources).some(key => !['database', 'namespace'].includes(key)) || Object.keys(m.stages).some(key => ![...phases, 'preflight'].includes(key)) || Object.values(m.stages).some(value => !['running', 'complete', 'failed'].includes(value))) fail('Invalid manifest stages/resources.');
  if (m.resources.database !== undefined && !/^[a-f0-9-]{36}$/i.test(m.resources.database)) fail('Invalid manifest database ID.');
  if (m.resources.namespace !== undefined && !/^[a-f0-9]{32}$/i.test(m.resources.namespace)) fail('Invalid manifest namespace ID.');
  if (m.pendingCreation !== undefined && !['database', 'namespace'].includes(m.pendingCreation)) fail('Invalid pending creation.');
  if (m.pendingUpload !== undefined && typeof m.pendingUpload !== 'boolean') fail('Invalid pending upload.');
  if (m.url !== undefined) {
    let url; try { url = new URL(m.url); } catch { fail('Invalid manifest service URL.'); }
    if (url.protocol !== 'https:' || !url.hostname.startsWith(`${prefix}.`) || !url.hostname.endsWith('.workers.dev') || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) fail('Invalid manifest service URL.');
  }
  rejectSymlinks(m.configPath);
}
function sourceVersion(base) {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], {cwd: base, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim(); }
  catch { return 'unknown'; }
}
function configFor(base, manifest) {
  const config = JSON.parse(readFileSync(join(base, 'wrangler.jsonc'), 'utf8'));
  config.name = manifest.names.worker;
  config.account_id = manifest.accountId;
  config.main = resolve(base, config.main);
  config.assets.directory = resolve(base, config.assets.directory);
  config.build.cwd = base;
  config.d1_databases = manifest.resources.database ? [{binding: 'DB', database_name: manifest.names.database, database_id: manifest.resources.database, migrations_dir: resolve(base, 'integrations/chatgpt-workbench/cloud/migrations')}] : [];
  config.kv_namespaces = manifest.resources.namespace ? [{binding: 'OAUTH_KV', id: manifest.resources.namespace}] : [];
  return config;
}
function verifyInventory(m, inventory, {initial = false} = {}) {
  if (m.url && inventory.serviceUrl && m.url !== inventory.serviceUrl) fail('Manifest URL does not match the selected account Worker.');
  if (inventory.accountId !== m.accountId) fail('Account mismatch; no resources changed.');
  for (const [kind, list, name] of [['database', inventory.databases, m.names.database], ['namespace', inventory.namespaces, m.names.namespace]]) {
    if (!Array.isArray(list)) fail('Incomplete resource inventory.');
    const matches = list.filter(item => item.name === name);
    if ((initial || (!m.resources[kind] && m.pendingCreation !== kind)) && matches.length) fail(`${kind} name collision; choose another instance.`);
    if (m.resources[kind] && (matches.length !== 1 || matches[0].id !== m.resources[kind])) fail(`${kind} ID mismatch or missing resource; refusing replacement.`);
  }
  if (!Array.isArray(inventory.workers)) fail('Incomplete Worker inventory.');
  const workers = inventory.workers.filter(item => item.name === m.names.worker);
  if (initial && workers.length) fail('Worker name collision; refusing overwrite.');
  if (m.stages.upload === 'complete' || m.intent === 'update' || (m.pendingUpload && workers.length)) {
    if (workers.length !== 1) fail('Worker missing or ambiguous; refusing update.');
    for (const [name, type, id] of [['DB', 'd1', m.resources.database], ['OAUTH_KV', 'kv_namespace', m.resources.namespace]]) {
      if (!workers[0].bindings?.some(b => b.name === name && b.type === type && b.id === id)) fail('Worker binding mismatch; refusing update.');
    }
  } else if (workers.length && !m.pendingUpload) fail('Unexpected Worker collision; refusing overwrite.');
}

/** No network on import. Tests supply run, probe and getSecret; production is loaded only by main(). */
async function deployUnlocked({mode, accountId, instance, manifestPath, base = root, run, probe, getSecret, log = console.log, resume = false}) {
  if (!['new', 'update'].includes(mode)) fail('Choose deploy:new or deploy:update explicitly.');
  if (!/^[a-f0-9]{32}$/.test(accountId || '')) fail('An explicit 32-character account ID is required.');
  if (!manifestPath) fail('Select an explicit local manifest path.');
  const path = resolve(manifestPath);
  let m;
  if (mode === 'new' && !resume) {
    if (existsSync(path)) fail('Manifest already exists; use --resume, never overwrite it.');
    if (!/^[a-z][a-z0-9-]{1,30}$/.test(instance || '')) fail('Instance must use 2–31 lowercase letters, numbers or hyphens.');
    const nonce = randomBytes(6).toString('hex');
    const prefix = `moji-${instance}-${nonce}`;
    m = {schema: 1, owner: 'moji-personal-cloud', manifestPath: path, accountId, instance, nonce, intent: 'new', names: {worker: prefix, database: `${prefix}-db`, namespace: `${prefix}-oauth`}, resources: {}, stages: {}, clientAcceptance: 'not-tested', sourceVersion: sourceVersion(base), configPath: join(dirname(path), `${prefix}.wrangler.json`)};
  } else {
    if (!existsSync(path)) fail('Manifest is required; updates never create replacement resources.');
    m = JSON.parse(readFileSync(path, 'utf8'));
    validateManifest(m, path, accountId);
    if (mode === 'update' && !resume) {
      if (!m.resources.database || !m.resources.namespace || m.stages.upload !== 'complete') fail('Incomplete instance; resume new deployment first.');
      m.intent = 'update';
      m.stages = {resources: 'complete'};
      m.clientAcceptance = 'not-tested';
      m.sourceVersion = sourceVersion(base);
    }
    if (m.intent !== mode) fail('Resume using the original deployment mode.');
  }
  const persist = () => save(path, m);
  const config = () => save(m.configPath, configFor(base, m));
  const call = (operation, data = {}) => run(operation, {accountId, configPath: m.configPath, names: m.names, resources: {...m.resources}, ...data});
  let phase = 'preflight';
  try {
    // Local preflight configuration omits uncreated bindings. Adapter rejects deploy/migrate until exact IDs exist.
    const migrationDir = join(base, 'integrations/chatgpt-workbench/cloud/migrations');
    const approved = {'0001_workspace.sql': 'f239ed5673b1ab67142100ea8f806f2bb23b1fd535678b24b7fd28a58c38c17c', '0002_workspace_blobs.sql': '2eda8d52c7c32abe9ec7f0f99a44ca8a1da60ebe6069b5f3b5a4a9204653732f'};
    const migrationFiles = readdirSync(migrationDir).filter(file => file.endsWith('.sql'));
    if (migrationFiles.length !== Object.keys(approved).length) fail('Migration set changed: compatibility review required.');
    for (const file of migrationFiles) {
      if (createHash('sha256').update(readFileSync(join(migrationDir, file))).digest('hex') !== approved[file]) fail('Unreviewed migration: explicit compatibility review required before deployment.');
    }
    config();
    const inventory = await call('inspect');
    verifyInventory(m, inventory, {initial: mode === 'new' && !resume});
    persist();
    for (const current of phases) {
      phase = current;
      if (m.stages[current] === 'complete' && current !== 'readiness') continue;
      m.stages[current] = 'running'; persist();
      if (current === 'resources') {
        for (const [kind, collection, operation] of [['database', 'databases', 'createDatabase'], ['namespace', 'namespaces', 'createNamespace']]) {
          if (m.resources[kind]) continue;
          if (mode !== 'new') fail('Update cannot create resources.');
          if (m.pendingCreation === kind) {
            const matches = (await call('inspect'))[collection].filter(item => item.name === m.names[kind]);
            if (matches.length !== 1) fail('Creation outcome unresolved; reconcile remotely before retry. No automatic recreation.');
            fail('Creation outcome requires explicit ownership reconciliation; name alone is not proof. No automatic adoption.');
          } else {
            m.pendingCreation = kind; persist();
            const created = await call(operation);
            if (!created?.id) fail('Creation outcome unknown; resume to look up the resource.');
            m.resources[kind] = created.id;
          }
          delete m.pendingCreation; persist(); config();
        }
      } else if (current === 'migration') {
        // Both current SQL migrations are additive/idempotent. No destructive rollback.
        await call('migrate');
      } else if (current === 'upload') {
        // Recheck bindings and collisions immediately before upload, including resumed writes.
        verifyInventory(m, await call('inspect'));
        m.pendingUpload = true; persist();
        const uploaded = await call('upload');
        if (uploaded?.url) m.url = uploaded.url;
        if (uploaded?.version) m.deploymentVersion = uploaded.version;
        delete m.pendingUpload;
      } else if (current === 'secret') {
        const secrets = await call('secrets');
        if (!secrets.some(item => item.name === 'MOJI_OWNER_KEY')) {
          if (mode === 'update') fail('Existing key missing; explicit recovery required. It will not be rotated automatically.');
          const secret = await getSecret();
          if (!validSecret(secret)) fail('Service uploaded; valid workbench key still required (24+ characters, no placeholder).');
          await call('putSecret', {secret});
        }
      } else if (current === 'readiness') {
        if (!m.url) fail('Worker URL unavailable; readiness remains unverified.');
        if (!await probe(m.url)) fail('Readiness failed; service is not yet confirmed ready.');
      }
      m.stages[current] = 'complete'; persist();
    }
    log(`Service readiness verified: ${m.url}/mcp. Client acceptance remains NOT TESTED.`);
    return m;
  } catch (error) {
    // Never relay subprocess output, exceptions or input values: they may contain credentials.
    m.stages[phase] = 'failed'; persist();
    const hint = `npm run deploy:${mode} -- --account ${accountId} --manifest ${JSON.stringify(path)} --resume`;
    if (error instanceof DeploymentError) log(error.message);
    log(`Deployment stopped at ${phase}. No automatic deletion or rollback. Resume: ${hint}`);
    throw new Error(`Deployment failed at ${phase}; see safe resume hint.`);
  }
}

// One local process owns a manifest at a time. Stale locks require explicit review,
// never auto-unlock while another deploy might still be changing resources.
export async function deploy(options) {
  if (!options.manifestPath) fail('Select an explicit local manifest path.');
  const lock = `${resolve(options.manifestPath)}.lock`;
  rejectSymlinks(resolve(options.manifestPath));
  mkdirSync(dirname(lock), {recursive: true, mode: 0o700});
  let descriptor;
  try { descriptor = openSync(lock, 'wx', 0o600); }
  catch { fail('Manifest locked; verify no deployment is running before removing a stale local lock.'); }
  try { return await deployUnlocked(options); }
  finally { closeSync(descriptor); unlinkSync(lock); }
}

export async function hiddenSecret(input = process.stdin, output = process.stderr) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') return '';
  output.write('Workbench key (hidden; 24+ characters): ');
  const wasRaw = input.isRaw;
  input.setRawMode(true); input.resume();
  return new Promise(resolveSecret => {
    let value = '';
    const done = result => { input.off('data', onData); input.setRawMode(wasRaw); input.pause(); output.write('\n'); resolveSecret(result); };
    const onData = chunk => {
      for (const char of chunk.toString()) {
        if (char === '\u0003' || char === '\u0004') return done('');
        if (char === '\r' || char === '\n') return done(value);
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    input.on('data', onData);
  });
}
async function main() {
  const args = process.argv.slice(2), mode = args.shift(), options = {};
  while (args.length) {
    const arg = args.shift();
    if (arg === '--resume') options.resume = true;
    else if (['--account', '--manifest', '--instance'].includes(arg)) options[arg.slice(2)] = args.shift();
    else fail('Unknown option. Secrets must never be supplied as arguments.');
  }
  if (!['new', 'update'].includes(mode)) fail('Use deploy:new or deploy:update with --account ID --manifest .moji-cloud/INSTANCE.json (new also needs --instance NAME).');
  const {createWranglerRunner} = await import('./cloud-wrangler-adapter.mjs');
  if (!options.manifest || !resolve(options.manifest).startsWith(resolve(root, '.moji-cloud') + sep)) fail('Store manifests inside the ignored .moji-cloud directory.');
  await deploy({mode, accountId: options.account, manifestPath: options.manifest, instance: options.instance, resume: options.resume, run: createWranglerRunner({root}), getSecret: hiddenSecret, probe: async url => {
    const base = new URL(url);
    if (base.protocol !== 'https:' || !base.hostname.endsWith('.workers.dev')) return false;
    for (const path of ['/', '/.well-known/oauth-authorization-server', '/health']) {
      const response = await fetch(new URL(path, base), {redirect: 'error', signal: AbortSignal.timeout(15000)});
      if (!response.ok) return false;
      if (path === '/health' && (await response.json()).ready !== true) return false;
    }
    return true;
  }});
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error instanceof DeploymentError ? error.message : 'Deployment did not complete; inspect the safe phase/resume message above.'); process.exitCode = 1; });
