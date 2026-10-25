import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createCloudService} from '../service.mjs';
import {decodeWorkspace} from '../workspace-storage.mjs';

test('云端大作品批量导入、预览冲突、快照恢复、旧备份与作者隔离',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'import-');await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:'export default{fetch(){return new Response("test")}}',compatibilityDate:'2026-10-10',d1Databases:{DB:'import-demo'}}));
  try{
    const db=await mf.getD1Database('DB');const sql=await Promise.all(['../migrations/0001_workspace.sql','../migrations/0002_workspace_blobs.sql'].map(p=>readFile(new URL(p,import.meta.url),'utf8'))).then(v=>v.join('\n'));for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();
    const service=createCloudService(db,'author'),rpc=(action,args={})=>service.rpc(action,args,'import','human');
    const original=await service.bootstrap('import'),novelId=original.books[0].id;
    const prose='　　“请进。”——她说。\n\n'.repeat(1200);
    const manuscript=Array.from({length:60},(_,i)=>`## 第${i+1}章 长篇\n\n${prose}`).join('\n\n');
    const file={name:'batch.json',json:{format:'cuigengji-batch',version:1,files:[{file:{name:'长篇.md',gzipBase64:gzipSync(manuscript).toString('base64')},kind:'chapters'},{file:{name:'角色.md',text:'## 目标\n守护邮局。'},kind:'character'}]}};
    const options={mode:'copy',targetId:novelId};
    let preview=await rpc('transfer.preview',{file,options});assert.ok(preview.capacity.rawBytes>3_000_000);assert.ok(preview.valid);
    await rpc('graph.create',{novelId,name:'并发人物',type:'character_card',content:'作者另页修改。'});
    await assert.rejects(rpc('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),{code:'CONFLICT'});
    preview=await rpc('transfer.preview',{file,options});const args={file,options,proof:preview.proof,requestId:crypto.randomUUID()};
    await rpc('transfer.import',args);assert.ok((await rpc('transfer.import',args)).repeated);
    assert.equal((await rpc('chapter.list',{novelId})).length,61);
    const raw=await db.prepare('SELECT state FROM workspaces WHERE owner=?').bind('author').first();assert.equal(JSON.parse(raw.state).format,'moji-workspace-fragments');assert.ok((await decodeWorkspace(raw.state,db,'author')).novels[novelId]);
    const storedCount=(await db.prepare('SELECT count(*) AS count FROM workspace_blobs WHERE owner=?').bind('author').first()).count;
    const backup=await rpc('transfer.export',{selection:{kind:'workspace'},format:'package'});const restoreFile={name:backup.filename,...(backup.gzipBase64?{gzipBase64:backup.gzipBase64}:{text:backup.content})};assert.equal((await rpc('transfer.inspect',{file:restoreFile})).kind,'workspace');
    const chapters=await rpc('chapter.list',{novelId}),chapterId=chapters.find(c=>c.title==='第1章 长篇').id;
    const before=await rpc('chapter.get',{novelId,chapterId,maxChars:200000});assert.equal(before.content,prose.trimEnd());
    await rpc('chapter.update',{novelId,chapterId,expectedRevision:before.revision,content:'删改后的内容'});
    const afterCount=(await db.prepare('SELECT count(*) AS count FROM workspace_blobs WHERE owner=?').bind('author').first()).count;assert.ok(afterCount-storedCount<=2,'一次章节保存只新增章节和作品元数据片段');
    const restoreOptions={mode:'restore',replaceExisting:true};const restoration=await rpc('transfer.preview',{file:restoreFile,options:restoreOptions});assert.ok(restoration.valid);
    await rpc('transfer.import',{file:restoreFile,options:restoreOptions,proof:restoration.proof,requestId:crypto.randomUUID()});
    const after=await rpc('chapter.get',{novelId,chapterId,maxChars:200000});assert.equal(after.content,before.content);assert.ok(after.revision>before.revision+1);
    const snapshots=await rpc('transfer.snapshots');assert.equal(snapshots.length,2);
    const saved=await rpc('transfer.snapshot.get',{id:snapshots[0].id});assert.ok((await rpc('transfer.inspect',{file:saved})).restorable);
    assert.deepEqual(await createCloudService(db,'other').rpc('transfer.snapshots',{},'other'),[]);
    await assert.rejects(createCloudService(db,'other').rpc('transfer.snapshot.get',{id:snapshots[0].id},'other'),{code:'NOT_FOUND'});
    const aiFile={name:'AI.txt',text:'第1章 作者授权\n\n原文标点：——“保留”。'},aiOptions={mode:'copy',title:'AI 导入验收'};
    await assert.rejects(service.rpc('transfer.import',{file:aiFile,options:aiOptions,proof:'expired',requestId:crypto.randomUUID()},'ai','agent'),{code:'CONFLICT'});
    const aiPreview=await service.rpc('transfer.preview',{file:aiFile,options:aiOptions},'ai','agent');
    const aiArgs={file:aiFile,options:aiOptions,proof:aiPreview.proof,requestId:crypto.randomUUID()};
    const aiResult=await service.rpc('transfer.import',aiArgs,'ai','agent');assert.equal(aiResult.novelIds.length,1);
    assert.ok((await service.rpc('transfer.import',aiArgs,'ai','agent')).repeated);
    const event=JSON.parse((await db.prepare('SELECT event FROM workspaces WHERE owner=?').bind('author').first()).event);assert.equal(event.actor.kind,'agent');
  }finally{await mf.dispose();}
});
