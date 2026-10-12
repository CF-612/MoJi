import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {timelineNodes,projectStage,ageAt,calendarDate} from '../../../src/domain/story-workspace.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'workspace-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'stage-test','human');return {s,call};}
test('单轴倒叙投影、出生日期、手写年龄描述、资料进入和计划关系不污染正文事实',async()=>{
 const {s,call}=await setup(),a=await call('writing.card.create',{type:'character_card',name:'岑予',values:{'character:birth':'1920-09-02','character:age':'青年'}}),b=await call('writing.card.create',{type:'character_card',name:'江遥',values:{'character:age':'青年，20岁'}}),edge=await call('edge.create',{from:a.id,to:b.id,name:'陌生'}),ch=await call('chapter.get',{chapterId:s.chapterId}),c2=await call('chapter.create',{title:'第二章倒叙',content:'回忆'});
 const event=(title,order,chapterId,date,extra={})=>call('writing.event.create',{confirmed:true,value:{title,order,storyDate:date,narrativeKind:'linear',chapterRefs:[{chapterId,revision:chapterId===ch.id?ch.revision:c2.revision,evidence:''}],...extra}});
 const early=await event('初识',10,ch.id,'1938-09-01',{enteringRefs:[a.id,b.id]}),late=await event('生日之后',20,ch.id,'1938-09-03'),flash=await event('回忆',0,c2.id,'1938-08-31',{narrativeKind:'flashback'}),plan=await event('未来计划',15,ch.id,'1938-09-02',{planned:true});
 await call('writing.relationshipChange.create',{confirmed:true,value:{eventId:early.id,edgeId:edge.id,value:{name:'朋友',category:'partner',active:true}}});
 await call('writing.relationshipChange.create',{confirmed:true,value:{eventId:plan.id,edgeId:edge.id,value:{name:'计划敌对',category:'enemy',active:true}}});
 const board=await call('writing.board.get');assert.equal(timelineNodes(board,'story')[0].eventId,flash.id);assert.equal(timelineNodes(board,'narration').at(-1).eventId,flash.id);
 assert.equal(projectStage(board,flash.id).nodes.length,0);assert.equal(projectStage(board,flash.id,{complete:true}).nodes[0].future,true);
 assert.equal(projectStage(board,early.id).nodes.find(n=>n.id===a.id).ageLabel,'17岁');assert.equal(projectStage(board,late.id).nodes.find(n=>n.id===a.id).ageLabel,'18岁');assert.equal(projectStage(board,late.id).nodes.find(n=>n.id===b.id).ageLabel,'青年，20岁');
 assert.equal(projectStage(board,late.id).edges[0].name,'朋友');assert.equal(projectStage(board,plan.id).edges[0].name,'计划敌对');assert.equal((await call('writing.relationship.list',{phase:'latest'}))[0].name,'朋友');
 assert.equal((await call('writing.card.get',{nodeId:a.id})).firstAppearance,null);assert.equal((await call('writing.stage.get',{eventId:early.id})).edges[0].name,'朋友');
 await assert.rejects(event('重复进入',30,ch.id,'1938-09-05',{enteringRefs:[a.id]}),{code:'INVALID_WRITING'});
 assert.equal(calendarDate('1938-02-31'),null);assert.equal(ageAt('1920-09-02','1938-09-01'),17);assert.equal(ageAt('青年','1938-09-01'),null);
 const backup=await call('novel.export');assert.equal(backup.novel.writing.events[early.id].enteringRefs[0],a.id);
 const preview=await call('transfer.preview',{file:{name:'stage.json',json:backup},options:{mode:'copy'}}),copy=await call('transfer.import',{file:{name:'stage.json',json:backup},options:{mode:'copy'},proof:preview.proof,requestId:crypto.randomUUID()}),copied=(await s.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human')).novel;
 const copiedEarly=Object.values(copied.writing.events).find(e=>e.title==='初识');assert.notEqual(copiedEarly.enteringRefs[0],a.id);assert.ok(copied.nodes[copiedEarly.enteringRefs[0]]);assert.equal(copiedEarly.storyDate,'1938-09-01');
});
test('时间线创建规划原子保存、复用网格、重复请求、冲突不创建孤儿；取消关联不删规划',async()=>{
 const {call}=await setup(),e=await call('writing.event.create',{confirmed:true,value:{title:'未写的情节',order:10,planned:true,plannedChapter:'第二卷 · 第三章',narrationOrder:3,narrativeKind:'linear'}});
 const args={eventId:e.id,expectedEventRevision:e.revision,confirmed:true,value:{title:'计划卡片',content:'先规划，后写正文'},requestId:'same-intent'};
 const saved=await call('writing.timelinePlan.create',args);assert.equal((await call('writing.timelinePlan.create',args)).nodeId,saved.nodeId);
 assert.equal((await call('chapter.list')).length,1);assert.ok((await call('planning.list')).items.some(p=>p.id===saved.nodeId));
 await assert.rejects(call('writing.timelinePlan.create',{...args,requestId:'stale'}),{code:'CONFLICT'});assert.equal((await call('planning.list')).items.length,1);
 const board=await call('writing.board.get');assert.equal(projectStage(board,e.id).planning[0].id,saved.nodeId);assert.equal(timelineNodes(board,'narration').at(-1).event.plannedChapter,'第二卷 · 第三章');
 await call('writing.event.update',{id:e.id,expectedRevision:saved.eventRevision,confirmed:true,value:{planningRefs:[]}});assert.equal((await call('planning.list')).items.length,1);
 const p=await call('planning.get',{nodeId:saved.nodeId});await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.update',id:saved.nodeId,expectedRevision:p.node.revision,value:{title:'网格修改'}}]});assert.equal((await call('writing.board.get')).planning[0].title,'网格修改');
 const other=await call('writing.event.create',{confirmed:true,value:{title:'新位置',order:20,narrativeKind:'linear',planningRefs:[saved.nodeId]}}),current=(await call('writing.event.get',{id:e.id})),updated=(await call('planning.get',{nodeId:saved.nodeId})).node;
 await assert.rejects(call('writing.timelinePlan.move',{nodeId:saved.nodeId,expectedRevision:updated.revision,eventId:e.id,eventRevisions:{[e.id]:current.revision,[other.id]:0},confirmed:true,requestId:crypto.randomUUID()}),{code:'CONFLICT'});
 assert.ok((await call('writing.event.get',{id:other.id})).planningRefs.includes(saved.nodeId));
 await call('writing.timelinePlan.move',{nodeId:saved.nodeId,expectedRevision:updated.revision,eventId:e.id,eventRevisions:{[e.id]:current.revision,[other.id]:other.revision},confirmed:true,requestId:crypto.randomUUID()});assert.equal((await call('writing.event.get',{id:other.id})).planningRefs.length,0);assert.ok((await call('writing.event.get',{id:e.id})).planningRefs.includes(saved.nodeId));
});
