import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deflateRawSync,crc32} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {buildPlugin,buildPluginFromZip,createZip,readPluginZipMetadata,parsePluginArgs,readExistingPluginZip} from '../scripts/package-chatgpt-plugin.mjs';
const appId='asdk_app_0123456789abcdef0123456789abcdef', url='https://moji-own.account.workers.dev';
const edit=(result,name,fn)=>createZip(result.entries.map(([path,data])=>[path,path===name?Buffer.from(JSON.stringify(fn(JSON.parse(data)))):data]));
test('cloud update regenerates actual archive preserving app, name, required flag; host OAuth stays untouched',async()=>{
 const before=await buildPlugin(url,{appId,pluginName:'my-existing-moji'});
 const old=edit(before,'.app.json',value=>{value.apps['my-existing-moji'].required=false;return value;});
 const updated=await buildPluginFromZip(old), meta=readPluginZipMetadata(updated.zip);
 assert.deepEqual(meta,{appId,pluginName:'my-existing-moji',required:false,version:'1.0.7',mode:'cloud-update'});
 assert.equal(updated.url,undefined);assert.equal(updated.uploadRequired,true);assert.equal(updated.cloudDeployed,false);
 assert.equal(updated.zip.includes(Buffer.from(url)),false);assert.equal(updated.entries.some(([p])=>p==='mcp.json'),false);
 assert.equal(JSON.parse(updated.entries[0][1]).version,'1.0.7');
 assert.deepEqual(await buildPluginFromZip(updated.zip),updated);
});
test('desktop update preserves exact plugin identity and normalized original endpoint',async()=>{
 const original=await buildPlugin(url,{desktopOnly:true});
 const old=edit(original,'plugin.json',v=>({...v,name:'my-moji-desktop'}));
 const next=await buildPluginFromZip(old);
 assert.deepEqual(readPluginZipMetadata(next.zip),{pluginName:'my-moji-desktop',url:url+'/mcp',version:'1.0.7',mode:'desktop-only'});
 assert.equal(next.mode,'desktop-only');assert.equal(next.appId,undefined);
});
test('unsafe identity/config and credentials fail closed, do not leak input',async()=>{
 const cloud=await buildPlugin(url,{appId,pluginName:'my-moji'}), desktop=await buildPlugin(url,{desktopOnly:true});
 const bad=[
 edit(cloud,'plugin.json',p=>({...p,repository:'https://evil.invalid/SECRET'})),
 edit(cloud,'plugin.json',p=>({...p,hooks:{run:'SECRET'}})),
 edit(cloud,'plugin.json',p=>{p.extensions['com.openai'].apps='../SECRET';return p;}),
 edit(cloud,'.app.json',p=>{p.apps['my-moji'].client_secret='SECRET';return p;}),
 edit(cloud,'.app.json',p=>{p.apps.other={id:appId};return p;}),
 edit(desktop,'mcp.json',p=>{p.mcpServers.moji.headers={Authorization:'SECRET'};return p;}),
 edit(desktop,'mcp.json',p=>{p.mcpServers.moji.url=url+'?token=SECRET';return p;}),
 createZip([...cloud.entries,desktop.entries.find(([p])=>p==='mcp.json')])
 ];
 for(const zip of bad)assert.throws(()=>readPluginZipMetadata(zip),error=>/不受支持/.test(error.message)&&!error.message.includes('SECRET'));
});
test('bounded ZIP parser rejects corrupt CRC, duplicate entries, traversal, truncation and trailing payload',async()=>{
 const original=await buildPlugin(url,{appId});
 const corrupt=Buffer.from(original.zip);corrupt[40]^=1;
 const path=Buffer.from(original.zip);path.write('../evil.json',30,'utf8');
 const duplicate=createZip([...original.entries,original.entries[0]]);
 for(const zip of [corrupt,path,duplicate,original.zip.subarray(0,100),Buffer.concat([original.zip,Buffer.from('SECRET')]),Buffer.alloc(4*1024*1024+1)])assert.throws(()=>readPluginZipMetadata(zip),/不受支持/);
});
test('update-from CLI grammar is explicit and source remains unchanged',async()=>{
 assert.deepEqual(parsePluginArgs(['--update-from','old.zip']),{updateFrom:'old.zip'});
 assert.throws(()=>parsePluginArgs(['--update-from','old.zip','--app-id',appId]));
 const dir=await mkdtemp(join(tmpdir(),'moji-update-source-'));try{
 const path=join(dir,'old.zip'),old=(await buildPlugin(url,{appId})).zip;await writeFile(path,old);
 const read=await readExistingPluginZip(path);await buildPluginFromZip(read);assert.deepEqual(await readFile(path),old);
 const help=execFileSync(process.execPath,['scripts/package-chatgpt-plugin.mjs','--help'],{encoding:'utf8'});assert.match(help,/--update-from/);assert.match(help,/同一插件上传新版本/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('older metadata upgrades but newer metadata cannot be downgraded',async()=>{
 const result=await buildPlugin(url,{appId});
 const older=edit(result,'plugin.json',p=>({...p,version:'1.0.5'}));
 assert.equal(readPluginZipMetadata((await buildPluginFromZip(older)).zip).version,'1.0.7');
 const newer=edit(result,'plugin.json',p=>({...p,version:'1.0.8'}));
 await assert.rejects(buildPluginFromZip(newer),/不降级/);
});

// An independent ZIP-deflate writer exercises host-exported compression, not our stored writer.
function deflated(entries){
 const locals=[],central=[];let offset=0;
 for(const [path,data] of entries){
  const name=Buffer.from(path),packed=deflateRawSync(data),local=Buffer.alloc(30),entry=Buffer.alloc(46);
  local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(8,8);local.writeUInt32LE(crc32(data),14);local.writeUInt32LE(packed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
  entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(8,10);entry.writeUInt32LE(crc32(data),16);entry.writeUInt32LE(packed.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(name.length,28);entry.writeUInt32LE(offset,42);
  locals.push(local,name,packed);central.push(entry,name);offset+=30+name.length+packed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,end]);
}
test('deflated host export regenerates; oversized expansion and encrypted flags fail closed',async()=>{
 const old=await buildPlugin(url,{appId}),compressed=deflated(old.entries);
 assert.deepEqual((await buildPluginFromZip(compressed)).zip,old.zip);
 const bomb=deflated([['plugin.json',Buffer.alloc(1024*1024+1)]]);assert.throws(()=>readPluginZipMetadata(bomb),/不受支持/);
 const encrypted=Buffer.from(compressed);encrypted.writeUInt16LE(1,6);assert.throws(()=>readPluginZipMetadata(encrypted),/不受支持/);
});

test('source reader rejects directories, symlinks and oversized files before opening',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'moji-zip-source-'));try{
 await assert.rejects(readExistingPluginZip(dir),/普通个人插件 ZIP/);
 const file=join(dir,'file.zip');await writeFile(file,Buffer.alloc(4*1024*1024+1));await assert.rejects(readExistingPluginZip(file),/4 MiB/);
 const link=join(dir,'link.zip');try{await symlink(file,link);}catch(e){if(process.platform==='win32'&&e.code==='EPERM'){t.diagnostic('Windows symlink privilege unavailable');return;}throw e;}
 await assert.rejects(readExistingPluginZip(link),/不能使用链接/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
