// Developer acceptance: use DSH's real native package operation in a disposable
// profile with no Git/global Node in PATH. Never touches the user's profile.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import {runPluginCommand} from '@deepseek-ai/dsh-plugin-manager/operations';

const args = process.argv.slice(2), arg = name => {const index=args.indexOf(name);return index < 0 ? undefined : args[index+1];};
const currentManifest=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const desktopExe = arg('--desktop-exe'), packageSpec = arg('--package'), oldPackage = args.includes('--old-package') ? arg('--old-package') : undefined;
if (!desktopExe || !packageSpec || process.platform !== 'win32') throw new Error('Windows: --desktop-exe <exe> --package <local.tgz or URL> [--old-package <tgz>] [--report <json>]');
const workspace = await mkdtemp(join(tmpdir(),'cuigengji-native-install-')), profile = join(workspace,'profile'), data = join(workspace,'novel-data');
const runtime = join(dirname(resolve(desktopExe)),'resources/runtime'), windows = process.env.SystemRoot || 'C:\\Windows';
const env = {...process.env,PATH:[join(runtime,'bin'),join(windows,'System32'),windows].join(';'),
  DSH_DESKTOP_NODE_EXECUTABLE:resolve(desktopExe),ELECTRON_RUN_AS_NODE:'1',CI:'true',PNPM_HOME:join(workspace,'pnpm')};
delete env.NODE_OPTIONS;
assert.notEqual(spawnSync(join(windows,'System32/where.exe'),['git'],{env,encoding:'utf8',windowsHide:true}).status,0,'Git must not be on PATH');
const nodePaths = spawnSync(join(windows,'System32/where.exe'),['node'],{env,encoding:'utf8',windowsHide:true}).stdout.trim();
assert.ok(nodePaths.includes('runtime\\bin\\node.cmd'),'only the desktop Node shim should be available');
const pnpmEntry=[join(runtime,'primary-runtime/dependencies/pnpm/bin/pnpm.mjs'),join(runtime,'pnpm/bin/pnpm.mjs')].find(existsSync);
assert.ok(pnpmEntry,'desktop bundled pnpm must exist');
const options = {command:resolve(desktopExe),args:['--expose-internals',pnpmEntry],env,
  execution:'service',outputBytes:4000,activateNewBundles:true,lockWaitMs:10000,idleTimeoutMs:120000,lookupTimeoutMs:20000};
const context = {profile:'desktop',dir:profile,cwd:process.cwd(),installAnchor:fileURLToPath(import.meta.resolve('@deepseek-ai/dsh/package.json')),home:join(workspace,'home')};
const report = {gitAvailable:false,globalNode:false,packageSpec,steps:[],ok:false};
try {
  await mkdir(profile,{recursive:true}); await mkdir(data);
  await writeFile(join(profile,'package.json'),JSON.stringify({name:'isolated-release-test',private:true,customField:{keep:true},dsh:{profile:{bundles:[]}}},null,2));
  await writeFile(join(profile,'cordis.patch.yml'),'# unrelated host config remains untouched\n');
  const install = async spec => {
    const result = await runPluginCommand(context,['add',spec],options);
    assert.equal(result.exitCode,0,result.output); assert.notEqual(result.timedOut,true);
    const manifest = JSON.parse(await readFile(join(profile,'package.json'),'utf8'));
    assert.equal(manifest.customField.keep,true); assert.ok(manifest.dsh.profile.bundles.includes('dsh-cuigengji'));
    assert.equal(await readFile(join(profile,'cordis.patch.yml'),'utf8'),'# unrelated host config remains untouched\n');
    return JSON.parse(await readFile(join(profile,'node_modules/dsh-cuigengji/package.json'),'utf8')).version;
  };
  if (oldPackage) {
    assert.equal(await install(resolve(oldPackage)),'0.3.13');
    await copyFile(new URL('../tests/fixtures/public-0.3.13/store.json',import.meta.url),join(data,'store.json'));
    report.steps.push({operation:'install-old',version:'0.3.13'});
  }
  assert.equal(await install(/^https?:/.test(packageSpec) ? packageSpec : resolve(packageSpec)),currentManifest.version);
  for (const path of ['runtime/index.js','runtime/application/maintenance/upgrade.js','runtime/infrastructure/persistence/upgrade-backup.js','lib/client.js','skills/cuigengji-maintenance/SKILL.md']) {
    const hash = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash(await readFile(join(profile,'node_modules/dsh-cuigengji',path))),hash(await readFile(new URL('../'+path,import.meta.url))),`installed ${path} must match this build`);
  }
  report.steps.push({operation:oldPackage?'update':'fresh-install',version:currentManifest.version});
  const smoke = spawnSync(resolve(desktopExe),['--expose-internals',fileURLToPath(new URL('./installed-release-smoke.mjs',import.meta.url)),join(profile,'node_modules/dsh-cuigengji'),data],
    {env,encoding:'utf8',windowsHide:true,timeout:120000});
  assert.equal(smoke.status,0,smoke.stderr || smoke.stdout);
  report.smoke = JSON.parse(smoke.stdout.trim().split(/\r?\n/).at(-1)); report.ok = true;
  if (args.includes('--report')) {await mkdir(dirname(resolve(arg('--report'))),{recursive:true}); await writeFile(resolve(arg('--report')),JSON.stringify(report,null,2));}
  console.log(JSON.stringify(report));
} finally {await rm(workspace,{recursive:true,force:true});}
