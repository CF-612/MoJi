import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createService} from '../server/service.mjs';

test('完整工作台：独立作品选择、设定关系、规划事务、写作要求、并发冲突和备份恢复',async()=>{
  const base=resolve(import.meta.dirname,'../.data/tests');await mkdir(base,{recursive:true});
  const directory=await mkdtemp(join(base,'workbench-'));
  const ui=await createService(directory),agent=await createService(directory);
  const novelId=ui.novelId,chapterId=ui.chapterId;
  const human=(action,args={})=>ui.rpc(action,{novelId,...args},'chat-a','human');
  const model=(action,args={})=>agent.rpc(action,{novelId,...args},'chat-a','agent');
  await ui.bootstrap('chat-a');await ui.bootstrap('chat-b');
  const other=await ui.rpc('novel.create',{title:'另一部演示作品'},'chat-b','human');
  const reopened=await createService(directory);
  assert.equal((await reopened.rpc('novel.list',{},'reopened','agent')).length,2);
  await ui.rpc('binding.set',{novelId:other.id},'chat-b','human');
  assert.equal((await human('binding.get')).novelId,novelId);
  assert.equal((await ui.rpc('binding.get',{},'chat-b','human')).novelId,other.id);
  await assert.rejects(agent.rpc('chapter.get',{chapterId},'model','agent'),{code:'NOVEL_REQUIRED'});
  const group=await human('graph.group.create',{name:'人物'});
  const person=await human('graph.create',{name:'演示人物',type:'character_card',groupId:group.id,summary:'用于协作验收',content:'她珍惜朋友。'});
  const world=await human('graph.create',{name:'雨夜街道',type:'world_entry',content:'街道与窗边的灯。'});
  await human('edge.create',{from:person.id,to:world.id,name:'生活于',content:'她居住在这里。'});
  const read=await model('graph.get',{nodeId:person.id});
  const written=await model('graph.update',{nodeId:person.id,expectedRevision:read.revision,content:'她珍惜朋友，也害怕失去朋友。',reason:'按作者要求补充动机'});
  assert.equal(written.revision,read.revision+1);
  await assert.rejects(human('graph.update',{nodeId:person.id,expectedRevision:read.revision,content:'过期草稿'}),{code:'CONFLICT'});
  assert.equal((await human('graph.get',{nodeId:person.id})).content,written.content);
  const events=await agent.collaborationHistory({novelId,entityId:person.id});
  assert.equal(events[0].actor.kind,'agent');assert.equal(events[0].before.content,'她珍惜朋友。');
  const page=await human('planning.page.create',{name:'雨夜来信',requestId:crypto.randomUUID()});
  const tx=await model('planning.apply',{requestId:crypto.randomUUID(),reason:'讨论两种后续',operations:[
    {op:'node.create',ref:'a',value:{title:'收到来信',pageId:page.id,content:'伏笔：信的来历尚未揭晓。',memoryRefs:[person.id]}},
    {op:'node.create',ref:'b',value:{title:'寻找寄信人',pageId:page.id}},
    {op:'edge.create',value:{from:'a',to:'b'}},
    {op:'decoration.create',value:{kind:'note',pageId:page.id,content:'先讨论动机，不直接写正文。'}}
  ]});
  assert.equal((await human('planning.list',{pageId:page.id})).items.length,2);
  assert.equal((await model('planning.get',{nodeId:tx.mapping.a})).node.memoryRefs[0],person.id);
  await model('planning.revert',{transactionId:tx.transactionId,requestId:crypto.randomUUID()});
  assert.equal((await human('planning.list',{pageId:page.id})).items.length,0);
  const preset=await human('preset.set',{expectedRevision:0,preset:{name:'写作要求',enabled:true,blocks:[{identifier:'voice',name:'文风',enabled:true,content:'第三人称，不替作者决定情节。'}]}});
  assert.match((await model('preset.read')).content,/第三人称/);
  await model('preset.set',{expectedRevision:preset.revision,preset:{...preset,blocks:[{...preset.blocks[0],content:'第三人称；保留段落和标点。'}]}});
  await assert.rejects(model('preset.set',{expectedRevision:preset.revision,preset}),{code:'CONFLICT'});
  const chapter=await model('chapter.get',{chapterId});
  const text='　　雨停了。\n\n“请进。”——她说。';
  await model('chapter.update',{chapterId,expectedRevision:chapter.revision,content:text,reason:'段落保真验收'});
  const exported=await human('transfer.export',{selection:{kind:'chapters',novelId,chapterIds:[chapterId]},format:'md'});
  assert.ok(exported.content.includes(text));
  const backup=await human('workspace.export');
  assert.ok(backup.payload.files.some(file=>file.content.includes('按作者要求补充动机')));
  const restored=await createService(await mkdtemp(join(base,'restored-')));
  await restored.rpc('workspace.import',{backup},'restore','human');
  assert.equal((await restored.rpc('chapter.get',{novelId,chapterId},'restore','agent')).content,text);
  assert.equal((await restored.collaborationHistory({novelId,entityId:person.id}))[0].before.content,'她珍惜朋友。');
});
