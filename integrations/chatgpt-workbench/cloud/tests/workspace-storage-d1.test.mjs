import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createCloudService} from '../service.mjs';
import {decodeWorkspace} from '../workspace-storage.mjs';

test('synthetic D1 story trees survive restart, undo/redo and a rolled-back fragment batch',async()=>{
  const persist=await mkdtemp(join(tmpdir(),'moji-story-fragments-'));await mkdir(join(persist,'tmp'));
  const previousTemp={TEMP:process.env.TEMP,TMP:process.env.TMP};process.env.TEMP=process.env.TMP=join(persist,'tmp');
  const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:join(persist,'tmp'),modules:true,script:'export default{fetch(){return new Response("synthetic test")}}',compatibilityDate:'2026-10-10',d1Databases:{DB:'synthetic-story-only'}}));
  try{
    const db=await mf.getD1Database('DB');
    for(const path of ['0001_workspace.sql','0002_workspace_blobs.sql']){
      const sql=await readFile(new URL('../migrations/'+path,import.meta.url),'utf8');
      for(const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(statement).run();
    }
    const owner='synthetic-story-owner',service=createCloudService(db,owner),initial=await service.bootstrap('synthetic');
    const novelId=initial.books[0].id,rpc=(action,args={})=>service.rpc(action,{novelId,...args},'synthetic','human');
    const chapter=await rpc('chapter.create',{title:'合成阈值测试',content:'合成正文，非作者资料。'.repeat(18000)});
    const person=await rpc('graph.create',{type:'character_card',name:'合成人物',content:'仅供独立测试。'});
    await rpc('writing.card.update',{nodeId:person.id,expectedRevision:0,values:{'character:occupation':'测试员'}});
    let story=await rpc('story.get');
    story=await rpc('story.apply',{expectedRevision:story.state.revision,operation:{type:'page.create',name:'保留空页面'}});
    story=await rpc('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.create',value:{title:'原卡片',scope:[chapter.id]}}});
    const card=Object.values(story.state.cards)[0];
    const beforeRow=await db.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first();
    assert.equal(JSON.parse(beforeRow.state).format,'moji-workspace-fragments');
    const beforeState=await decodeWorkspace(beforeRow.state,db,owner);
    const beforeCount=(await db.prepare('SELECT count(*) AS count FROM workspace_blobs WHERE owner=?').bind(owner).first()).count;
    await db.prepare("CREATE TRIGGER reject_synthetic_save BEFORE UPDATE ON workspaces WHEN NEW.event LIKE '%blocked-save%' BEGIN SELECT RAISE(ABORT, 'synthetic interruption'); END;").run();
    const args={reason:'blocked-save',requestId:'synthetic-failed-save',expectedRevision:story.state.revision,operation:{type:'card.update',id:card.id,expectedRevision:card.revision,value:{title:'不应提交'}}};
    await assert.rejects(rpc('story.apply',args),/synthetic interruption/);
    assert.deepEqual(await db.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first(),beforeRow,'failed transaction must not publish the manifest');
    assert.equal((await db.prepare('SELECT count(*) AS count FROM workspace_blobs WHERE owner=?').bind(owner).first()).count,beforeCount,'new immutable tree blobs roll back with the failed update');
    await db.prepare('DROP TRIGGER reject_synthetic_save').run();
    story=await rpc('story.apply',{...args,reason:'authorized synthetic retry',operation:{...args.operation,value:{title:'已提交'}}});
    assert.equal(story.state.cards[card.id].title,'已提交');
    const reopened=createCloudService(db,owner);
    assert.deepEqual((await reopened.rpc('story.get',{novelId},'synthetic')).state,story.state);
    story=await rpc('story.undo',{expectedRevision:story.state.revision});assert.equal(story.state.cards[card.id].title,'原卡片');
    assert.equal((await createCloudService(db,owner).rpc('story.get',{novelId},'synthetic')).canRedo,true);
    story=await rpc('story.redo',{expectedRevision:story.state.revision});assert.equal(story.state.cards[card.id].title,'已提交');
    const backup=await rpc('workspace.export');
    assert.deepEqual(backup.payload.state.novels[novelId].story.state,story.state);
    assert.equal(backup.payload.state.novels[novelId].writing.cards[person.id].values['character:occupation'],'测试员');
    assert.deepEqual(await decodeWorkspace(beforeRow.state,db,owner),beforeState,'the previous physical snapshot still resolves after several later revisions');
    await assert.rejects(decodeWorkspace(beforeRow.state,db,'other-synthetic-owner'),{code:'CORRUPT_STORE'});
  }finally{
    await mf.dispose();
    for(const key of ['TEMP','TMP'])if(previousTemp[key]===undefined)delete process.env[key];else process.env[key]=previousTemp[key];
    await rm(persist,{recursive:true,force:true});
  }
});
