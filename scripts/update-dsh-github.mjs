// Explicit, offline-host updater. Never runs on import; no token, registry or credential creation.
import {readFile,writeFile,mkdir,cp,readdir,lstat,realpath,statfs,unlink,rmdir,open} from 'node:fs/promises';
import {resolve,join,dirname,relative,isAbsolute} from 'node:path';
import {createReadStream} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
const exec=promisify(execFile), NAME='dsh-moji', MAX_BYTES=128*1024*1024, MAX_BACKUP=2*1024*1024*1024;
const fail=code=>{throw Object.assign(new Error(code),{code});};
const version=v=>typeof v==='string'&&/^\d+\.\d+\.\d+$/.test(v);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=['package.json','pnpm-lock.yaml','cordis.patch.yml'];
// This updater is shipped as a standalone script, so keep the accepted physical
// identities explicit rather than importing TypeScript application modules.
// Upstream cuigengji-library v5 is NOT MoJi's same-numbered layout.
function supportedLibraryEvidence(library,evidence){
 if(library?.format==='moji-library'&&library.storageVersion===5)return evidence.toStorageFormat==='moji-library'&&evidence.toStorageVersion===5;
 if(library?.format!=='cuigengji-library'||![2,3,4].includes(library.storageVersion))return false;
 // Historical reports omitted the format and sometimes the target version.
 // When identity fields are present, they must agree with the actual library.
 return (evidence.toStorageFormat===undefined||evidence.toStorageFormat===library.format)
   &&(evidence.toStorageVersion===undefined||evidence.toStorageVersion===library.storageVersion);
}
export function releaseUrls(target){
 if(!version(target))fail('INVALID_VERSION');
 const base=`https://github.com/CF-612/MoJi/releases/download/moji-v${target}`;
 return {asset:`${base}/${NAME}-${target}.tgz`,checksums:`${base}/SHA256SUMS-${target}.txt`};
}
export function expectedChecksum(text,target){
 const matches=String(text).split(/\r?\n/).filter(line=>line.endsWith(`  ${NAME}-${target}.tgz`));
 if(matches.length!==1||!new RegExp(`^[a-f0-9]{64}  dsh-moji-${target.replaceAll('.','\\.')}\\.tgz$`).test(matches[0]))fail('CHECKSUM_INVALID');
 return matches[0].slice(0,64);
}
export function validateTarball(bytes,target){
 let tar;try{tar=gunzipSync(bytes,{maxOutputLength:MAX_BYTES});}catch{fail('PACKAGE_INVALID');}
 if(tar.length%512!==0)fail('PACKAGE_INVALID');
 let manifest=null,terminated=false;const names=new Set();
 for(let offset=0;offset+512<=tar.length;){
  const h=tar.subarray(offset,offset+512);if(h.every(x=>x===0)){if(tar.length-offset<1024||!tar.subarray(offset).every(x=>x===0))fail('PACKAGE_INVALID');terminated=true;break;}
  const checksum=h.subarray(148,156).toString().replace(/\0/g,'').trim();let sum=0;for(let i=0;i<512;i++)sum+=i>=148&&i<156?32:h[i];if(!/^[0-7]+$/.test(checksum)||parseInt(checksum,8)!==sum)fail('PACKAGE_HEADER_CHECKSUM');
  const str=(a,b)=>h.subarray(a,b).toString().split('\0')[0];
  const name=[str(345,500),str(0,100)].filter(Boolean).join('/'),type=str(156,157);
  if(!name.startsWith('package/')||name.includes('\\')||name.includes(':')||name.replace(/\/$/,'').split('/').some(p=>!p||p==='..'||p==='.')||names.has(name)||!['','0','5'].includes(type))fail('PACKAGE_UNSAFE');
  names.add(name);const raw=str(124,136).trim();if(!/^[0-7]+$/.test(raw))fail('PACKAGE_INVALID');const size=parseInt(raw,8);
  if(!Number.isSafeInteger(size)||size<0||offset+512+size>tar.length)fail('PACKAGE_INVALID');
  if(name==='package/package.json'){try{manifest=JSON.parse(tar.subarray(offset+512,offset+512+size));}catch{fail('PACKAGE_INVALID');}}
  offset+=512+Math.ceil(size/512)*512;
 }
 if(!terminated)fail('PACKAGE_INVALID');
 if(manifest?.name!==NAME||manifest?.version!==target||!manifest.dsh?.bundle)fail('PACKAGE_IDENTITY_MISMATCH');
 return manifest;
}
export async function downloadRelease(url,{limit=MAX_BYTES,fetcher=fetch}={}){
 // Only publisher URLs and GitHub's asset delivery redirect are allowed; no credentials forwarded.
 let current=new URL(url);
 for(let redirects=0;redirects<=4;redirects++){
  if(current.protocol!=='https:'||current.username||current.password||!(current.hostname==='github.com'||current.hostname==='release-assets.githubusercontent.com'||current.hostname==='objects.githubusercontent.com'))fail('DOWNLOAD_ORIGIN_DENIED');
  const response=await fetcher(current.href,{redirect:'manual',credentials:'omit',signal:AbortSignal.timeout(60000)});
  if([301,302,303,307,308].includes(response.status)){const next=response.headers.get('location');if(!next)fail('DOWNLOAD_FAILED');await response.body?.cancel();current=new URL(next,current);continue;}
  if(!response.ok||!response.body)fail('DOWNLOAD_FAILED');
  if(Number(response.headers.get('content-length'))>limit)fail('DOWNLOAD_TOO_LARGE');
  const chunks=[];let count=0;for await(const chunk of response.body){count+=chunk.length;if(count>limit)fail('DOWNLOAD_TOO_LARGE');chunks.push(chunk);}return Buffer.concat(chunks);
 }
 fail('DOWNLOAD_REDIRECT_LIMIT');
}
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function noSymlinkParents(path){let p=resolve(path);while(true){if(await exists(p)&&(await lstat(p)).isSymbolicLink())fail('SYMLINK_PATH_DENIED');const next=dirname(p);if(next===p)return;p=next;}}
async function treeBytes(path,{allowRootSymlink=false}={}){
 const info=await lstat(path);if(info.isSymbolicLink()){if(allowRootSymlink)return treeBytes(await realpath(path));fail('SYMLINK_BACKUP_DENIED');}
 if(info.isFile())return info.size;if(!info.isDirectory())fail('SPECIAL_FILE_DENIED');
 let bytes=0;for(const item of await readdir(path)){bytes+=await treeBytes(join(path,item));if(bytes>MAX_BACKUP)fail('BACKUP_TOO_LARGE');}return bytes;
}
async function fingerprint(path){
 const info=await lstat(path);if(info.isSymbolicLink())fail('SYMLINK_BACKUP_DENIED');
 if(info.isFile()){const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}
 if(!info.isDirectory())fail('SPECIAL_FILE_DENIED');
 const result=[];for(const name of (await readdir(path)).sort())result.push([name,await fingerprint(join(path,name))]);return sha(JSON.stringify(result));
}
function inside(parent,child){const rel=relative(parent,child);return !rel||(!rel.startsWith('..')&&!isAbsolute(rel));}
/** Adapter hostStopped/install are trusted local host integration, not browser parameters. */
export async function updateDsh(options){
 const profile=resolve(options.profile);await noSymlinkParents(profile);
 const lock=profile+'.moji-update-lock',nonce=randomUUID();
 try{await mkdir(lock,{mode:0o700});}catch(error){if(error.code==='EEXIST')fail('UPDATE_ALREADY_RUNNING_OR_STALE_LOCK');throw error;}
 try{await writeFile(join(lock,'owner'),nonce,{flag:'wx',mode:0o600});return await updateUnlocked(options);}
 finally{try{if(await readFile(join(lock,'owner'),'utf8')===nonce){await unlink(join(lock,'owner'));await rmdir(lock);}}catch{}}
}
async function updateUnlocked({target,profile,dataRoot,backupRoot,hostStopped,install,preflight,download=downloadRelease}){
 const urls=releaseUrls(target);profile=resolve(profile);dataRoot=resolve(dataRoot);backupRoot=resolve(backupRoot);
 if(typeof hostStopped!=='function'||typeof install!=='function')fail('HOST_ADAPTER_UNAVAILABLE');
 if(inside(profile,backupRoot)||inside(dataRoot,backupRoot)||inside(backupRoot,profile)||inside(backupRoot,dataRoot)||inside(profile,dataRoot)||inside(dataRoot,profile))fail('PATH_OVERLAP');
 for(const path of [profile,dataRoot,backupRoot])await noSymlinkParents(path);
 if(!await hostStopped())fail('HOST_RUNNING');
 const original=new Map();for(const file of files){const path=join(profile,file);if(await exists(path)){await noSymlinkParents(path);original.set(file,await readFile(path));}}
 let manifest;try{manifest=JSON.parse(original.get('package.json'));}catch{fail('PROFILE_INVALID');}
 if(!manifest.dependencies?.[NAME]||!manifest.dsh?.profile?.bundles?.includes(NAME))fail('MOJI_NOT_INSTALLED');
 if(['dsh-cuigengji','dsh-cuigengji-plugin'].some(name=>manifest.dependencies?.[name]||manifest.dsh.profile.bundles.includes(name)))fail('LEGACY_PLUGIN_CONFLICT');
 const installedPath=join(profile,'node_modules',NAME),installedReal=await realpath(installedPath);
 const old=JSON.parse(await readFile(join(installedReal,'package.json')));if(old.name!==NAME||!version(old.version))fail('INSTALLED_IDENTITY_MISMATCH');
 if(old.version.split('.').map(Number).some((n,i,a)=>n>Number(target.split('.')[i])&&a.slice(0,i).every((x,j)=>x===Number(target.split('.')[j]))))fail('DOWNGRADE_DENIED');
 validatePreflight(preflight,{profile,dataRoot,installedVersion:old.version});
 if(old.version===target)return {ok:true,status:'already-current',version:old.version,cloud:'not-deployed'};
 // Require a real, ready local Moji library previously opened by this installed version.
 // The operator must obtain this exact resolved root via settings.get before stopping DSH.
 let evidence,library;try{evidence=JSON.parse(await readFile(join(dataRoot,'runtime','upgrade.json')));library=JSON.parse(await readFile(join(dataRoot,'library.json')));}catch{fail('LOCAL_LIBRARY_EVIDENCE_REQUIRED');}
 if(evidence.format!=='cuigengji-upgrade'||evidence.version!==1||evidence.status!=='ready'||evidence.pluginVersion!==old.version||typeof evidence.dataRoot!=='string'||resolve(evidence.dataRoot)!==dataRoot||!supportedLibraryEvidence(library,evidence))fail('LOCAL_LIBRARY_EVIDENCE_MISMATCH');

 const checksums=await download(urls.checksums,{limit:1024*1024}),bytes=await download(urls.asset,{limit:MAX_BYTES});
 if(sha(bytes)!==expectedChecksum(checksums.toString(),target))fail('CHECKSUM_MISMATCH');validateTarball(bytes,target);
 const size=await treeBytes(dataRoot)+await treeBytes(installedReal);if(size>MAX_BACKUP)fail('BACKUP_TOO_LARGE');
 await mkdir(backupRoot,{recursive:true,mode:0o700});const space=await statfs(backupRoot);if(Number(space.bavail)*Number(space.bsize)<size*2+bytes.length+64*1024*1024)fail('BACKUP_SPACE_INSUFFICIENT');
 const backup=join(backupRoot,'moji-update-'+randomUUID());await mkdir(backup,{mode:0o700});
 // No installation begins until every snapshot and staged artifact is complete.
 const workFingerprint=await fingerprint(dataRoot);
 await cp(dataRoot,join(backup,'works'),{recursive:true,errorOnExist:true,force:false});
 if(await fingerprint(join(backup,'works'))!==workFingerprint||await fingerprint(dataRoot)!==workFingerprint)fail('WORKS_CHANGED_DURING_BACKUP');
 const packageFingerprint=await fingerprint(installedReal);
 await cp(installedReal,join(backup,'previous-package'),{recursive:true,errorOnExist:true,force:false});
 if(await fingerprint(join(backup,'previous-package'))!==packageFingerprint||await fingerprint(installedReal)!==packageFingerprint)fail('PACKAGE_CHANGED_DURING_BACKUP');
 await mkdir(join(backup,'profile'));for(const [file,value] of original)await writeFile(join(backup,'profile',file),value,{mode:0o600});
 const candidate=join(backup,`${NAME}-${target}.tgz`);await writeFile(candidate,bytes,{flag:'wx',mode:0o600});
 if(!await hostStopped())fail('HOST_STARTED_DURING_PREPARATION');
 // Detect a concurrent manifest edit before giving control to the host manager.
 for(const file of files){const now=await exists(join(profile,file))?await readFile(join(profile,file)):undefined;if(!original.get(file)?.equals(now||Buffer.alloc(0))&&(original.has(file)||now))fail('PROFILE_CHANGED');}
 let attempted=false;
 try{
  attempted=true;await install(candidate);
  if(!await hostStopped())fail('HOST_STARTED_DURING_INSTALL');
  if(await fingerprint(dataRoot)!==workFingerprint)fail('WORKS_CHANGED_DURING_INSTALL');
  const after=JSON.parse(await readFile(join(profile,'package.json'))),actual=JSON.parse(await readFile(join(profile,'node_modules',NAME,'package.json')));
  if(actual.name!==NAME||actual.version!==target)fail('INSTALLED_VERSION_MISMATCH');
  const withoutMoji=obj=>{const result=structuredClone(obj);delete result.dependencies[NAME];return JSON.stringify(result);};
  if(withoutMoji(after)!==withoutMoji(manifest))fail('UNRELATED_PROFILE_CHANGED');
  for(const file of ['cordis.patch.yml']){const now=await exists(join(profile,file))?await readFile(join(profile,file)):undefined;if(!original.get(file)?.equals(now||Buffer.alloc(0))&&(original.has(file)||now))fail('UNRELATED_PROFILE_CHANGED');}
  await writeFile(join(backup,'result.json'),JSON.stringify({status:'installed-restart-required',from:old.version,to:target,sha256:sha(bytes)}),{mode:0o600});
  return {ok:true,status:'installed-restart-required',version:target,previousVersion:old.version,backupId:backup.split(/[\\/]/).pop(),cloud:'not-deployed'};
 }catch{
  if(await fingerprint(dataRoot)!==workFingerprint)fail('UPDATE_FAILED_WORKS_CHANGED_MANUAL_RECOVERY');
  // Another manager or operator may have changed unrelated configuration: never overwrite it.
  try{const current=JSON.parse(await readFile(join(profile,'package.json')));const clean=value=>{const clone=structuredClone(value);delete clone.dependencies[NAME];return JSON.stringify(clone);};if(clean(current)!==clean(manifest))fail('EXTERNAL_PROFILE_CHANGE');for(const file of ['cordis.patch.yml']){const now=await exists(join(profile,file))?await readFile(join(profile,file)):undefined;if(!original.get(file)?.equals(now||Buffer.alloc(0))&&(original.has(file)||now))fail('EXTERNAL_PROFILE_CHANGE');}}catch{fail('UPDATE_FAILED_EXTERNAL_PROFILE_CHANGE');}
  if(attempted&&!await hostStopped())fail('UPDATE_UNCONFIRMED_HOST_RUNNING');
  try{
   await install(join(backup,'previous-package'));
   if(!await hostStopped())fail('HOST_STARTED_DURING_ROLLBACK');
   if(await fingerprint(dataRoot)!==workFingerprint)fail('WORKS_CHANGED_DURING_ROLLBACK');
   // The host's own transaction updates only Moji; never overwrite profile snapshots over concurrent edits.
   const rolled=JSON.parse(await readFile(join(profile,'package.json')));const clean=value=>{const clone=structuredClone(value);delete clone.dependencies[NAME];return JSON.stringify(clone);};if(clean(rolled)!==clean(manifest))fail('ROLLBACK_UNRELATED_PROFILE_CHANGED');
   for(const file of ['cordis.patch.yml']){const now=await exists(join(profile,file))?await readFile(join(profile,file)):undefined;if(!original.get(file)?.equals(now||Buffer.alloc(0))&&(original.has(file)||now))fail('ROLLBACK_UNRELATED_PROFILE_CHANGED');}
   const recovered=JSON.parse(await readFile(join(profile,'node_modules',NAME,'package.json')));if(recovered.name!==NAME||recovered.version!==old.version)fail('ROLLBACK_VERSION_MISMATCH');
  }catch{fail('UPDATE_FAILED_ROLLBACK_REQUIRED');}
  fail('UPDATE_FAILED_ROLLED_BACK');
 }
}
export function validatePreflight(evidence,{profile,dataRoot,installedVersion,now=Date.now()}){
 if(!evidence||evidence.format!=='moji-update-preflight'||evidence.operatorVerified!==true||!['settings.get','maintenance.status'].includes(evidence.source)||typeof evidence.profile!=='string'||resolve(evidence.profile)!==resolve(profile))fail('PREFLIGHT_PROFILE_UNVERIFIED');
 const time=Date.parse(evidence.observedAt);if(!Number.isFinite(time)||time>now||now-time>15*60*1000)fail('PREFLIGHT_STALE');
 const observed=evidence.observed;
 if(!observed||typeof observed.dataRoot!=='string'||!isAbsolute(observed.dataRoot)||resolve(observed.dataRoot)!==resolve(dataRoot)||observed.pluginVersion!==installedVersion)fail('PREFLIGHT_ROOT_VERSION_MISMATCH');
 if(evidence.source==='maintenance.status'&&observed.status!=='ready')fail('PREFLIGHT_NOT_READY');
 if(evidence.source==='settings.get'&&observed.host!=='DSH 原生工作台')fail('PREFLIGHT_HOST_MISMATCH');
}
export function windowsHostAdapter({executable,cli,profileName='desktop'}){
 if(process.platform!=='win32')fail('WINDOWS_HOST_REQUIRED');
 if(!/^[a-z0-9_-]+$/i.test(profileName))fail('INVALID_PROFILE');
 return {
  hostStopped:async()=>{try{const {stdout}=await exec('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$p=Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $_.Name -eq 'DeepSeek Harness.exe' }; if ($p) { 'running' } else { 'stopped' }"],{timeout:15000,windowsHide:true,maxBuffer:4096});return stdout.trim()==='stopped';}catch{fail('HOST_STATE_UNVERIFIED');}},
  install:async path=>{try{await exec(executable,['--expose-internals',cli,'plugin','--profile',profileName,'add',path],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1',DSH_DESKTOP_NODE_EXECUTABLE:executable},windowsHide:true,maxBuffer:1024*1024});}catch{fail('HOST_INSTALL_FAILED');}}
 };
}
async function main(){
 const args=process.argv.slice(2);if(args.length!==12||args[0]!=='--version'||args[2]!=='--profile'||args[4]!=='--data-root'||args[6]!=='--backup-root'||args[8]!=='--preflight'||args[10]!=='--confirm-update')fail('USAGE_VERSION_PROFILE_DATA_BACKUP_CONFIRM');
 if(args[11]!=='yes')fail('UPDATE_CONFIRMATION_REQUIRED');
 const profile=resolve(args[3]),home=process.env.USERPROFILE,local=process.env.LOCALAPPDATA;if(!home||!local)fail('WINDOWS_HOST_REQUIRED');
 const safeBackup=join(local,'Moji','update-backups');if(resolve(args[7]).toLowerCase()!==resolve(safeBackup).toLowerCase())fail('PRIVATE_BACKUP_DIRECTORY_REQUIRED');
 const expectedProfile=join(home,'.dsh','profiles','desktop');if(profile.toLowerCase()!==resolve(expectedProfile).toLowerCase())fail('DESKTOP_PROFILE_REQUIRED');
 const executable=join(local,'Programs','DeepSeek Harness','DeepSeek Harness.exe'),cli=join(local,'Programs','DeepSeek Harness','resources','app.asar','dsh','node_modules','@deepseek-ai','dsh-desktop-host','lib','cli.js');
 if(!await exists(executable)||!await exists(cli))fail('HOST_LAYOUT_UNSUPPORTED');
 let preflight;try{await noSymlinkParents(args[9]);const handle=await open(args[9],'r');try{const info=await handle.stat();if(!info.isFile()||info.size>16384)fail('PREFLIGHT_INVALID');const bytes=Buffer.alloc(16385);let count=0;while(count<bytes.length){const part=await handle.read(bytes,count,bytes.length-count,count);if(!part.bytesRead)break;count+=part.bytesRead;}if(count>16384)fail('PREFLIGHT_INVALID');preflight=JSON.parse(bytes.subarray(0,count));}finally{await handle.close();}}catch{fail('PREFLIGHT_REQUIRED');}
 const result=await updateDsh({preflight,target:args[1],profile,dataRoot:args[5],backupRoot:args[7],...windowsHostAdapter({executable,cli})});console.log(JSON.stringify(result));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(JSON.stringify({ok:false,code:/^[A-Z_]+$/.test(error.code||'')?error.code:'UPDATE_FAILED',cloud:'not-deployed'}));process.exitCode=1;});
