import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createCloudService} from '../service.mjs';
test('真实本地 D1：双端保存、冲突、人物、规划、预设、历史和完整备份',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'test-');
  // Miniflare 5 also creates built-in email storage in os.tmpdir(), regardless
  // of resourceTmpPath. Scope that directory to this isolated test process.
  await mkdir(persist+'/tmp',{recursive:true});process.env.TEMP=process.env.TMP=persist+'/tmp';
  const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-10-10',d1Databases:{DB:'demo'}}));
  try{
    const db=await mf.getD1Database('DB');
    const sql=await readFile(new URL('../migrations/0001_workspace.sql',import.meta.url),'utf8');
    for(const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(statement).run();
    const ui=createCloudService(db,'author'),ai=createCloudService(db,'author');
    const bootstrap=await ui.bootstrap('mobile'),novelId=bootstrap.books[0].id;
    const rpc=(action,args={},kind='human')=>(kind==='human'?ui:ai).rpc(action,{novelId,...args},kind==='human'?'mobile':'model',kind);
    const chapters=await rpc('chapter.list');const chapterId=chapters[0].id;
    const initial=await rpc('chapter.get',{chapterId});
    const content='　　手机保存。\n\n“请进。”——她说。';
    await rpc('chapter.update',{chapterId,expectedRevision:initial.revision,content});
    const latest=await rpc('chapter.get',{chapterId},'agent');assert.equal(latest.content,content);
    await assert.rejects(rpc('chapter.update',{chapterId,expectedRevision:initial.revision,content:'过期草稿'},'agent'),{code:'CONFLICT'});
    await rpc('chapter.update',{chapterId,expectedRevision:latest.revision,append:'\n\n电脑续写。'},'agent');
    assert.match((await rpc('chapter.get',{chapterId})).content,/电脑续写/);
    const history=await ai.collaborationHistory({novelId,entityId:chapterId});assert.equal(history[0].actor.kind,'agent');assert.equal(history[0].before.content,content);
    const person=await rpc('graph.create',{name:'演示人物',type:'character_card',content:'珍惜朋友。'});
    await rpc('graph.update',{nodeId:person.id,expectedRevision:person.revision,content:'害怕失去朋友。'},'agent');
    assert.equal((await rpc('graph.get',{nodeId:person.id})).content,'害怕失去朋友。');
    const page=await rpc('planning.page.create',{name:'手机规划',requestId:crypto.randomUUID()});
    const tx=await rpc('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'a',value:{title:'收到来信',pageId:page.id}}]},'agent');
    assert.equal((await rpc('planning.get',{nodeId:tx.mapping.a})).node.title,'收到来信');
    const preset=await rpc('preset.set',{expectedRevision:0,preset:{name:'要求',enabled:true,blocks:[{identifier:'voice',name:'文风',content:'保留段落。',enabled:true}]}});
    assert.match((await rpc('preset.read',{},'agent')).content,/保留段落/);
    await assert.rejects(rpc('preset.set',{expectedRevision:0,preset},'agent'),{code:'CONFLICT'});
    await assert.rejects(ai.rpc('chapter.get',{chapterId},'model','agent'),{code:'NOVEL_REQUIRED'});
    const reopened=createCloudService(db,'author');assert.equal((await reopened.bootstrap('mobile')).books[0].id,novelId);
    const backup=await rpc('workspace.export');assert.equal(backup.payload.state.novels[novelId].chapters[chapterId].content,(await rpc('chapter.get',{chapterId})).content);
    assert.ok(backup.payload.history.length>=5);
    // Force two services to read the same database revision before either commits.
    let count=0,release;const gate=new Promise(r=>release=r);
    const racing={prepare(sql){const stmt=db.prepare(sql);return {bind(...v){const bound=stmt.bind(...v);return {async first(){const row=await bound.first();if(sql.startsWith('SELECT *')){if(++count===2)release();await gate;}return row;},run:()=>bound.run(),all:()=>bound.all()};}};}};
    const a=createCloudService(racing,'author'),b=createCloudService(racing,'author');
    const outcomes=await Promise.allSettled([a.rpc('novel.create',{title:'A'},'race-a'),b.rpc('novel.create',{title:'B'},'race-b')]);
    assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(outcomes.find(r=>r.status==='rejected').reason.code,'CONFLICT');
  }finally{await mf.dispose();}
});
