// Invoked by check-release-install.mjs with the DSH desktop executable in Node
// mode. Loads the package from node_modules, not the source tree.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const [packagePath,dataRoot] = process.argv.slice(2);
const manifest = JSON.parse(await readFile(join(packagePath,'package.json'),'utf8'));
const expectedVersion = JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version;
assert.equal(manifest.version,expectedVersion);
const {apply} = await import(pathToFileURL(join(packagePath,manifest.main)));
const registered = new Map(), effects = [], routes = [];
const ctx = {tools:{register:tool=>registered.set(tool.name,tool)},skills:{register(){}},connection:{fetch:{register:route=>routes.push(route)}},
  on(){},effect:fn=>effects.push(fn()),provide:(key,value)=>{ctx[key]=value;}};
try {
  await apply(ctx,{dataRoot});
  const execute = async (name,action,args={}) => JSON.parse(await registered.get(name).execute({action,args},
    {agent:{id:'synthetic-upgrade-author'},callId:'smoke-read',signal:new AbortController().signal}));
  const status = await execute('cuigengji_maintenance','status'); assert.equal(status.status,'ready',JSON.stringify(status.error));
  const verification = await execute('cuigengji_maintenance','verify',{expectedVersion,expectedDataRoot:resolve(dataRoot)});
  assert.equal(verification.verified,true);
  if (verification.summary.counts.novels) {
    const info = await execute('cuigengji_project','novel.handoff'); assert.equal(info.novel.title,'雾港 · 公开合成升级样例');
    assert.ok((await execute('cuigengji_memory','graph.list')).length >= 3,'actual MCP in desktop Node mode');
    assert.ok((await execute('cuigengji_plan','planning.pages')).length >= 2);
    assert.ok((await execute('cuigengji_context','preset.read')).content.includes('动作推进'));
  }
  console.log(JSON.stringify({ok:true,installedVersion:manifest.version,node:process.version,electron:process.versions.electron,
    fromStorageVersion:status.fromStorageVersion,migrated:status.migrated,counts:verification.summary.counts,backupPath:status.backupPath}));
} finally {for (const dispose of effects) await dispose();}
