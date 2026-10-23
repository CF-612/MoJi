import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const manifest=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const required=['runtime/index.js','runtime/application/maintenance/upgrade.js','runtime/infrastructure/persistence/upgrade-backup.js','lib/client.js','skills/cuigengji-maintenance/SKILL.md','docs/agent-installation.md','docs/upgrade.md','LICENSE'];
test('release audit derives current version and still rejects stale versions/private data/missing capabilities',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'moji-pack-audit-'));t.after(()=>rm(dir,{recursive:true,force:true}));const file=join(dir,'pack.json');
 const run=async override=>{await writeFile(file,JSON.stringify([{name:manifest.name,version:manifest.version,unpackedSize:123,files:required.map(path=>({path})),...override}]));return spawnSync(process.execPath,[new URL('../scripts/audit-release.mjs',import.meta.url).pathname,file],{encoding:'utf8'});};
 const valid=await run({});assert.equal(valid.status,0,valid.stderr);assert.equal(JSON.parse(valid.stdout).version,manifest.version);
 assert.notEqual((await run({version:'0.4.0'})).status,0);
 assert.notEqual((await run({files:[...required,'src/.env'].map(path=>({path}))})).status,0);
 assert.notEqual((await run({files:required.filter(path=>path!=='lib/client.js').map(path=>({path}))})).status,0);
});
test('installation guide states source-build limits rather than sending users to obsolete release assets',async()=>{
 const doc=await readFile(new URL('../docs/agent-installation.md',import.meta.url),'utf8');
 assert.match(doc,/暂无当前版本的 Windows 成品安装包/);assert.match(doc,/npm pack/);assert.match(doc,/package\.json/);assert.doesNotMatch(doc,/https:\/\/github\.com\/mistnest\/.*releases/);assert.doesNotMatch(doc,/"expectedVersion":"0\.4\.0"/);
});
