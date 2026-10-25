import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createCloudService} from '../service.mjs';
import {Store} from '../../../../src/application/store.js';
import {createTransfer} from '../../server/transfer-service.mjs';

test('synthetic upstream 0.5.0 wholebook crosses local → D1 → local without logical data loss',async()=>{
 const root=await mkdtemp(join(tmpdir(),'moji-upstream050-cloud-'));
 await mkdir(join(root,'tmp'));const previous={TEMP:process.env.TEMP,TMP:process.env.TMP};process.env.TEMP=process.env.TMP=join(root,'tmp');
 const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:root,resourceTmpPath:join(root,'tmp'),modules:true,script:'export default{fetch(){return new Response("test")}}',compatibilityDate:'2026-10-10',d1Databases:{DB:'synthetic-migration'}}));
 try {
  const db=await mf.getD1Database('DB');
  for(const name of ['0001_workspace.sql','0002_workspace_blobs.sql']) {
   const sql=await readFile(new URL('../migrations/'+name,import.meta.url),'utf8');
   for(const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(statement).run();
  }
  const packet=JSON.parse(await readFile(new URL('../../../../tests/fixtures/upstream-050/wholebook.json',import.meta.url),'utf8'));
  const expected=packet.payload.projects[0],actor={kind:'human',sessionId:'synthetic-migration'},options={mode:'restore'};
  const expectedMoji=structuredClone(expected);for(const edge of Object.values(expectedMoji.edges))Object.assign(edge,{category:'other',timing:'base',baseActive:true,style:'solid'});
  const local=createTransfer(new Store(join(root,'source'))),file={name:'upstream050.json',json:packet};
  const first=await local.preview({file,options});assert.ok(first.valid);
  await local.import({file,options,proof:first.proof,requestId:crypto.randomUUID()},actor);
  const fromLocal=await local.export({selection:{kind:'works',novelIds:[expected.id]}});
  const cloud=createCloudService(db,'synthetic-owner'),rpc=(action,args={})=>cloud.rpc(action,args,'synthetic-migration','human');
  const cloudFile={name:fromLocal.filename,text:fromLocal.content},preview=await rpc('transfer.preview',{file:cloudFile,options});assert.ok(preview.valid);
  const request={file:cloudFile,options,proof:preview.proof,requestId:crypto.randomUUID()};
  await rpc('transfer.import',request);assert.equal((await rpc('transfer.import',request)).repeated,true);
  const revisionBefore=(await db.prepare('SELECT revision FROM workspaces WHERE owner=?').bind('synthetic-owner').first()).revision;
  const pages=await rpc('planning.pages',{novelId:expected.id}),legacy=await rpc('planning.list',{novelId:expected.id,limit:200}),decorations=await rpc('planning.decorations',{novelId:expected.id,limit:200});
  assert.equal(pages.length,2);assert.equal(legacy.items.length,2);assert.equal(decorations.items.length,2);
  const detail=await rpc('planning.get',{novelId:expected.id,nodeId:legacy.items[0].id});assert.ok(detail.node.content);
  await assert.rejects(cloud.rpc('planning.list',{novelId:expected.id},'synthetic-agent','agent'),{code:'NOT_ALLOWED'});
  await assert.rejects(rpc('planning.apply',{novelId:expected.id}),{code:'NOT_ALLOWED'});
  assert.equal((await db.prepare('SELECT revision FROM workspaces WHERE owner=?').bind('synthetic-owner').first()).revision,revisionBefore);
  const exported=await rpc('transfer.export',{selection:{kind:'works',novelIds:[expected.id]}});
  const text=exported.gzipBase64?gunzipSync(Buffer.from(exported.gzipBase64,'base64')).toString('utf8'):exported.content;
  assert.deepEqual(JSON.parse(text).payload.projects,[expectedMoji]);
  const destination=new Store(join(root,'destination')),to=createTransfer(destination),back={name:exported.filename,text};
  const last=await to.preview({file:back,options});assert.ok(last.valid);
  await to.import({file:back,options,proof:last.proof,requestId:crypto.randomUUID()},actor);
  assert.deepEqual((await new Store(destination.root).load()).novels[expected.id],expectedMoji);
 } finally {
  await mf.dispose();for(const key of ['TEMP','TMP'])if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];
  await rm(root,{recursive:true,force:true});
 }
});
