import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {updateDsh,releaseUrls,expectedChecksum,validateTarball,downloadRelease,validatePreflight} from '../scripts/update-dsh-github.mjs';
const digest=b=>createHash('sha256').update(b).digest('hex');
function tar(name='package/package.json',value={name:'dsh-moji',version:'0.11.5',dsh:{bundle:{patch:'./cordis.patch.yml'}}},type='0'){
 const content=Buffer.from(JSON.stringify(value)),header=Buffer.alloc(512);header.write(name);header.write(content.length.toString(8).padStart(11,'0')+'\0',124);header.write(type,156);header.fill(32,148,156);const sum=header.reduce((a,b)=>a+b,0);header.write(sum.toString(8).padStart(6,'0')+'\0 ',148);return gzipSync(Buffer.concat([header,content,Buffer.alloc((512-content.length%512)%512),Buffer.alloc(1024)]));
}
async function fixture(t,{modify,hostStopped=async()=>true,downloadFail=false}={}){
 const root=await mkdtemp(join(tmpdir(),'moji-updater-'));t.after(()=>rm(root,{recursive:true,force:true}));const profile=join(root,'profile'),dataRoot=join(root,'works'),backupRoot=join(root,'backups');
 await mkdir(join(profile,'node_modules','dsh-moji'),{recursive:true});await mkdir(join(dataRoot,'runtime'),{recursive:true});await writeFile(join(dataRoot,'runtime','upgrade.json'),JSON.stringify({format:'cuigengji-upgrade',version:1,status:'ready',pluginVersion:'0.11.4',dataRoot}));await writeFile(join(dataRoot,'library.json'),JSON.stringify({format:'cuigengji-library',storageVersion:4}));await writeFile(join(dataRoot,'work.json'),'MY WORK');
 const manifest={dependencies:{'dsh-moji':'file:old.tgz',other:'1.0.0'},dsh:{profile:{bundles:['other','dsh-moji']}}};await writeFile(join(profile,'package.json'),JSON.stringify(manifest));await writeFile(join(profile,'pnpm-lock.yaml'),'old lock');await writeFile(join(profile,'cordis.patch.yml'),'safe: yes');await writeFile(join(profile,'node_modules','dsh-moji','package.json'),JSON.stringify({name:'dsh-moji',version:'0.11.4'}));
 const bytes=tar(),calls=[];
 const preflight={format:'moji-update-preflight',operatorVerified:true,source:'settings.get',profile,observedAt:new Date().toISOString(),observed:{dataRoot,pluginVersion:'0.11.4',host:'DSH 原生工作台'}};
 const options={target:'0.11.5',profile,dataRoot,backupRoot,preflight,hostStopped,download:async url=>{calls.push(['download',url]);if(downloadFail)throw Error('secret');return url.endsWith('.txt')?Buffer.from(`${digest(bytes)}  dsh-moji-0.11.5.tgz\n`):bytes;},install:async path=>{calls.push(['install',path]);const isRollback=path.endsWith('previous-package');await writeFile(join(profile,'node_modules','dsh-moji','package.json'),JSON.stringify({name:'dsh-moji',version:isRollback?'0.11.4':'0.11.5'}));await writeFile(join(profile,'package.json'),JSON.stringify({...manifest,dependencies:{...manifest.dependencies,'dsh-moji':path}}));if(modify)await modify({path,isRollback,profile});}};
 return {root,options,calls,profile,dataRoot,manifest};
}
test('strict official release URLs; malformed versions and checksum ambiguity denied',()=>{
 assert.equal(releaseUrls('0.11.5').asset,'https://github.com/CF-612/MoJi/releases/download/moji-v0.11.5/dsh-moji-0.11.5.tgz');
 for(const version of ['latest','../x','1.2.3;whoami','1.2.3-beta','https://evil'])assert.throws(()=>releaseUrls(version));
 assert.throws(()=>expectedChecksum('a'.repeat(64)+'  other.tgz','0.11.5'));assert.throws(()=>expectedChecksum(('a'.repeat(64)+'  dsh-moji-0.11.5.tgz\n').repeat(2),'0.11.5'));
});
test('archive identity, links and traversal denied before install',()=>{
 assert.equal(validateTarball(tar(),'0.11.5').name,'dsh-moji');
 for(const bytes of [tar('package/../evil'),tar('/absolute'),tar('package/C:evil'),tar('package/./evil'),tar('package//evil'),tar('package/package.json',{},'2'),tar('package/package.json',{name:'evil',version:'0.11.5'})])assert.throws(()=>validateTarball(bytes,'0.11.5'));
});
test('bounded download rejects foreign redirects and overlarge response',async()=>{
 await assert.rejects(downloadRelease('https://evil/a'),/DOWNLOAD_ORIGIN_DENIED/);
 await assert.rejects(downloadRelease(releaseUrls('0.11.5').asset,{fetcher:async()=>new Response('',{status:302,headers:{location:'https://evil/a'}})}),/DOWNLOAD_ORIGIN_DENIED/);
 await assert.rejects(downloadRelease(releaseUrls('0.11.5').asset,{limit:2,fetcher:async()=>new Response('large')}),/DOWNLOAD_TOO_LARGE/);
});
test('successful update snapshots works, preserves other plugins and reports restart not cloud deployed',async t=>{
 const f=await fixture(t);const result=await updateDsh(f.options);assert.equal(result.status,'installed-restart-required');assert.equal(result.cloud,'not-deployed');assert.equal(f.calls.filter(c=>c[0]==='install').length,1);assert.equal(await readFile(join(f.options.backupRoot,result.backupId,'works','work.json'),'utf8'),'MY WORK');assert.equal(await readFile(join(f.dataRoot,'work.json'),'utf8'),'MY WORK');assert.doesNotMatch(JSON.stringify(result),new RegExp(f.root));
});
test('running host or failed download cannot install or mutate original files',async t=>{
 for(const config of [{hostStopped:async()=>false},{downloadFail:true}]){const f=await fixture(t,config);await assert.rejects(updateDsh(f.options));assert.equal(f.calls.filter(c=>c[0]==='install').length,0);assert.deepEqual(JSON.parse(await readFile(join(f.profile,'package.json'))),f.manifest);}
});
test('checksum mismatch, overlap and symlink fail before install',async t=>{
 const f=await fixture(t);const download=f.options.download;f.options.download=async url=>url.endsWith('.txt')?Buffer.from('0'.repeat(64)+'  dsh-moji-0.11.5.tgz'):download(url);await assert.rejects(updateDsh(f.options),/CHECKSUM_MISMATCH/);assert.equal(f.calls.filter(c=>c[0]==='install').length,0);
 await assert.rejects(updateDsh({...f.options,backupRoot:join(f.dataRoot,'nested')}),/PATH_OVERLAP/);
});
test('failed install restores prior package through host manager without overwriting profile or works',async t=>{
 const f=await fixture(t,{modify:async({isRollback})=>{if(!isRollback)throw Error('secret-token');}});await assert.rejects(updateDsh(f.options),/UPDATE_FAILED_ROLLED_BACK/);assert.equal(f.calls.filter(c=>c[0]==='install').length,2);const after=JSON.parse(await readFile(join(f.profile,'package.json')));assert.equal(after.dependencies.other,f.manifest.dependencies.other);assert.match(after.dependencies['dsh-moji'],/previous-package$/);assert.equal(await readFile(join(f.profile,'pnpm-lock.yaml'),'utf8'),'old lock');assert.equal(await readFile(join(f.dataRoot,'work.json'),'utf8'),'MY WORK');
});
test('host restart or unrelated change refuses automatic rollback and preserves external state',async t=>{
 let checks=0;const restarted=await fixture(t,{hostStopped:async()=>++checks<3});await assert.rejects(updateDsh(restarted.options),/UPDATE_UNCONFIRMED_HOST_RUNNING/);assert.equal(restarted.calls.filter(c=>c[0]==='install').length,1);
 const external=await fixture(t,{modify:async({profile})=>{await writeFile(join(profile,'cordis.patch.yml'),'external edit');}});await assert.rejects(updateDsh(external.options),/UPDATE_FAILED_EXTERNAL_PROFILE_CHANGE/);assert.equal(await readFile(join(external.profile,'cordis.patch.yml'),'utf8'),'external edit');assert.equal(external.calls.filter(c=>c[0]==='install').length,1);
});
test('failed rollback is explicit and never claims restored or installed',async t=>{
 const f=await fixture(t,{modify:async()=>{throw Error('secret');}});await assert.rejects(updateDsh(f.options),/UPDATE_FAILED_ROLLBACK_REQUIRED/);
});
test('transaction lease rejects concurrent updater through install and rollback',async t=>{
 const f=await fixture(t);let release,entered;const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r);const original=f.options.install;f.options.install=async path=>{entered();await gate;return original(path);};const first=updateDsh(f.options);await started;await assert.rejects(updateDsh(f.options),/UPDATE_ALREADY_RUNNING_OR_STALE_LOCK/);release();await first;
});
test('rollback host restart never reports recovered; lease is released after failure',async t=>{
 let checks=0;const f=await fixture(t,{hostStopped:async()=>++checks<4,modify:async({isRollback})=>{if(!isRollback)throw Error('failed');}});await assert.rejects(updateDsh(f.options),/UPDATE_FAILED_ROLLBACK_REQUIRED/);await assert.rejects(updateDsh({...f.options,hostStopped:async()=>false}),/HOST_RUNNING/);
});
test('symlinked works, downgrade and latest legacy plugin rejected before installation',async t=>{
 const {symlink}=await import('node:fs/promises');const f=await fixture(t);await symlink(join(f.profile,'package.json'),join(f.dataRoot,'link'));await assert.rejects(updateDsh(f.options),/SYMLINK_BACKUP_DENIED/);assert.equal(f.calls.filter(c=>c[0]==='install').length,0);
 const lower=await fixture(t);await assert.rejects(updateDsh({...lower.options,target:'0.10.1'}),/DOWNGRADE_DENIED/);
 const legacy=await fixture(t);await writeFile(join(legacy.profile,'package.json'),JSON.stringify({...legacy.manifest,dependencies:{...legacy.manifest.dependencies,'dsh-cuigengji-plugin':'0.5.0'}}));await assert.rejects(updateDsh(legacy.options),/LEGACY_PLUGIN_CONFLICT/);
});

test('missing or mismatched local library runtime evidence refuses installation',async t=>{
 const f=await fixture(t);await rm(join(f.dataRoot,'runtime','upgrade.json'));await assert.rejects(updateDsh(f.options),/LOCAL_LIBRARY_EVIDENCE_REQUIRED/);assert.equal(f.calls.filter(c=>c[0]==='install').length,0);
 const mismatch=await fixture(t);await writeFile(join(mismatch.dataRoot,'runtime','upgrade.json'),JSON.stringify({format:'cuigengji-upgrade',version:1,status:'ready',pluginVersion:'0.11.4',dataRoot:'/unrelated'}));await assert.rejects(updateDsh(mismatch.options),/LOCAL_LIBRARY_EVIDENCE_MISMATCH/);
});
test('changed works are never restored over or reported safe, and malformed archive trailers rejected',async t=>{
 const f=await fixture(t);const install=f.options.install;f.options.install=async path=>{await install(path);await writeFile(join(f.dataRoot,'work.json'),'NEW WORK');};await assert.rejects(updateDsh(f.options),/UPDATE_FAILED_WORKS_CHANGED_MANUAL_RECOVERY/);assert.equal(await readFile(join(f.dataRoot,'work.json'),'utf8'),'NEW WORK');assert.equal(f.calls.filter(c=>c[0]==='install').length,1);
 const {gunzipSync}=await import('node:zlib');const plain=gunzipSync(tar());plain[0]^=1;assert.throws(()=>validateTarball(gzipSync(plain),'0.11.5'),/PACKAGE_HEADER_CHECKSUM/);assert.throws(()=>validateTarball(gzipSync(gunzipSync(tar()).subarray(0,1024)),'0.11.5'),/PACKAGE_INVALID/);
});

test('fresh operator-observed current-profile root is mandatory, even when another valid library exists',async t=>{
 const f=await fixture(t),other=await fixture(t);
 for(const preflight of [undefined,{...f.options.preflight,profile:other.profile},{...f.options.preflight,observedAt:'2000-01-01T00:00:00Z'},{...f.options.preflight,observed:{...f.options.preflight.observed,dataRoot:other.dataRoot}},{...f.options.preflight,observed:{}},{...f.options.preflight,operatorVerified:false}]){await assert.rejects(updateDsh({...f.options,preflight}),/PREFLIGHT_/);}
 assert.equal(f.calls.filter(c=>c[0]==='install').length,0);
});

test('future timestamps and non-ready maintenance observations fail closed',async t=>{
 const f=await fixture(t);for(const preflight of [{...f.options.preflight,observedAt:new Date(Date.now()+60000).toISOString()},{...f.options.preflight,source:'maintenance.status',observed:{...f.options.preflight.observed,status:'running'}}])await assert.rejects(updateDsh({...f.options,preflight}),/PREFLIGHT_/);
});
