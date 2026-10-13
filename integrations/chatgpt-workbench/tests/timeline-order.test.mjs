import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {timelineNodes,timelineOrderScope,projectStage} from '../../../src/domain/story-workspace.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'timeline-order-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'timeline-order','human');return {s,call};}
async function moveArgs(call,id,view,direction,chapterId=null){const board=await call('writing.board.get');return {id,view,direction,chapterId,expectedChapterRevision:board.chapters.find(c=>c.id===chapterId)?.revision,expectedOrder:timelineOrderScope(board,view,chapterId).map(e=>({id:e.id,revision:e.revision})),confirmed:true,requestId:crypto.randomUUID()};}
const ids=(board,view,chapterId)=>timelineOrderScope(board,view,chapterId).map(e=>e.id);

test('故事改序重新计算阶段关系，保留章节叙述、日期、正文依据、规划与伏笔；重复请求不会二次移动',async()=>{
 const {s,call}=await setup(),chapter=await call('chapter.get',{chapterId:s.chapterId}),actor=await call('writing.card.create',{type:'character_card',name:'岑予'}),world=await call('writing.card.create',{type:'world_book',name:'旧街道'}),edge=await call('edge.create',{from:actor.id,to:world.id,name:'居住'});
 const create=(title,order)=>call('writing.event.create',{confirmed:true,value:{title,order,storyDate:'1938-09-01',narrativeKind:'linear',chapterRefs:[{chapterId:chapter.id,revision:chapter.revision,evidence:chapter.content.slice(0,8)}]}});
 const a=await create('来信',10),b=await create('迁居',10),c=await create('返回',10);
 const initial=await call('writing.board.get'),ordered=ids(initial,'story'),first=ordered[0],last=ordered[2];
 await call('writing.relationshipChange.create',{confirmed:true,value:{eventId:first,edgeId:edge.id,value:{name:'住在旧街道',active:true}}});
 await call('writing.relationshipChange.create',{confirmed:true,value:{eventId:last,edgeId:edge.id,value:{name:'已搬离',active:false}}});
 const plan=await call('writing.timelinePlan.create',{eventId:first,expectedEventRevision:1,confirmed:true,value:{title:'处理来信'},requestId:crypto.randomUUID()}),shadow=await call('writing.timelineForeshadow.create',{eventId:first,expectedEventRevision:plan.eventRevision,confirmed:true,value:{title:'信上的火漆',status:'planned',evidence:[]},requestId:crypto.randomUUID()});
 const before=await call('writing.event.get',{id:first}),args=await moveArgs(call,last,'story','up'),result=await call('writing.event.move',args);assert.deepEqual(await call('writing.event.move',args),result);
 let board=await call('writing.board.get');assert.deepEqual(ids(board,'story'),[ordered[0],ordered[2],ordered[1]]);assert.deepEqual(ids(board,'narration',chapter.id),ordered);assert.equal(projectStage(board,ordered[1]).edges.length,0);
 const after=await call('writing.event.get',{id:first});for(const key of ['chapterRefs','storyDate','storyTime','memoryRefs','planningRefs','foreshadowRefs'])assert.deepEqual(after[key],before[key]);assert.equal(after.planningRefs[0],plan.nodeId);assert.equal(after.foreshadowRefs[0],shadow.foreshadowId);
 assert.ok((await call('writing.history',{collection:'events',id:last})).versions.length);assert.equal(result.events[0].versions,undefined);
 // Narration moves never change the relationship stage or story order.
 await call('writing.event.move',await moveArgs(call,last,'narration','up',chapter.id));board=await call('writing.board.get');assert.deepEqual(ids(board,'narration',chapter.id),[ordered[0],ordered[2],ordered[1]]);assert.deepEqual(ids(board,'story'),[ordered[0],ordered[2],ordered[1]]);assert.equal(projectStage(board,ordered[1]).edges.length,0);
});

test('同一事件跨章独立排序，待写事件独立；复制重映射当前及历史排序键，旧无排序备份仍可读取',async()=>{
 const {s,call}=await setup(),c1=await call('chapter.get',{chapterId:s.chapterId}),c2=await call('chapter.create',{title:'第二章',content:'回忆'}),refs=[c1,c2].map(c=>({chapterId:c.id,revision:c.revision,evidence:''})),create=(title,order,extra={})=>call('writing.event.create',{confirmed:true,value:{title,order,narrativeKind:'linear',...extra}});
 const a=await create('初识',10,{chapterRefs:refs}),b=await create('结盟',20,{chapterRefs:refs}),p=await create('待写一',30,{planned:true}),q=await create('待写二',40,{planned:true});
 await call('writing.event.move',await moveArgs(call,b.id,'narration','up',c1.id));let board=await call('writing.board.get');assert.deepEqual(ids(board,'narration',c1.id),[b.id,a.id]);assert.deepEqual(ids(board,'narration',c2.id),[a.id,b.id]);assert.deepEqual(ids(board,'story'),[a.id,b.id,p.id,q.id]);
 await call('writing.event.move',await moveArgs(call,q.id,'narration','up'));board=await call('writing.board.get');assert.deepEqual(ids(board,'narration'),[q.id,p.id]);assert.deepEqual(ids(board,'story'),[a.id,b.id,p.id,q.id]);
 await call('writing.event.move',await moveArgs(call,b.id,'story','up'));board=await call('writing.board.get');assert.deepEqual(ids(board,'narration',c1.id),[b.id,a.id]);assert.deepEqual(ids(board,'narration',c2.id),[a.id,b.id]);assert.deepEqual(ids(board,'narration'),[q.id,p.id]);
 const file={name:'order.json',json:await call('novel.export')},options={mode:'copy'},preview=await call('transfer.preview',{file,options}),copy=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),copied=await s.rpc('writing.board.get',{novelId:copy.novelIds[0]},'copy','human');
 for(let i=0;i<2;i++)assert.deepEqual(timelineOrderScope(copied,'narration',copied.chapters[i].id).map(e=>e.title),timelineOrderScope(board,'narration',board.chapters[i].id).map(e=>e.title));
 const exportCopy=await s.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human');for(const e of Object.values(exportCopy.novel.writing.events))for(const v of [e,...e.versions.map(v=>v.value)])for(const id of Object.keys(v.chapterOrders||{}))assert.ok(exportCopy.novel.chapters[id]);
 const old=structuredClone(file);for(const e of Object.values(old.json.novel.writing.events))for(const v of [e,...e.versions.map(v=>v.value)])delete v.chapterOrders;assert.equal((await call('transfer.preview',{file:old,options})).conflicts.length,0);
 const current=await call('writing.event.get',{id:a.id});await call('writing.event.update',{id:a.id,expectedRevision:current.revision,confirmed:true,value:{chapterRefs:[refs[1]]}});assert.equal((await call('writing.event.get',{id:a.id})).chapterOrders[c1.id],undefined);
});

test('变更、增加、删除与章节版本冲突整体停止；跨章及越界拒绝，确认必需；混合旧排序冻结不改叙述',async()=>{
 const {s,call}=await setup(),ch=await call('chapter.get',{chapterId:s.chapterId}),ref={chapterId:ch.id,revision:ch.revision,evidence:''},create=(title,order,extra={})=>call('writing.event.create',{confirmed:true,value:{title,order,narrativeKind:'linear',chapterRefs:[ref],...extra}}),a=await create('旧无排序',4),b=await create('新排序',5,{chapterOrders:{[ch.id]:5}}),c=await create('末尾',9);
 const stale=await moveArgs(call,a.id,'story','down');await call('writing.event.update',{id:c.id,expectedRevision:c.revision,confirmed:true,value:{title:'修改过末尾'}});const stable=(await call('novel.export')).novel;await assert.rejects(call('writing.event.move',stale),{code:'CONFLICT'});assert.deepEqual((await call('novel.export')).novel,stable);
 const insertedArgs=await moveArgs(call,a.id,'story','down'),d=await create('新节点',7);await assert.rejects(call('writing.event.move',insertedArgs),{code:'CONFLICT'});
 const deletedArgs=await moveArgs(call,a.id,'story','down');await call('writing.event.delete',{id:d.id,expectedRevision:d.revision,confirmed:true});await assert.rejects(call('writing.event.move',deletedArgs),{code:'CONFLICT'});
 const changedChapter=await moveArgs(call,a.id,'narration','down',ch.id);await call('chapter.update',{chapterId:ch.id,expectedRevision:ch.revision,content:ch.content+'新文本'});await assert.rejects(call('writing.event.move',changedChapter),{code:'CONFLICT'});
 const args=await moveArgs(call,a.id,'story','down');await assert.rejects(call('writing.event.move',{...args,confirmed:false}),{code:'CONFIRM_REQUIRED'});await assert.rejects(call('writing.event.move',{...args,direction:'up'}),{code:'INVALID_WRITING'});await call('writing.event.move',args);assert.deepEqual(ids(await call('writing.board.get'),'narration',ch.id),[a.id,b.id,c.id]);
 const invalid={name:'invalid.json',json:await call('novel.export')};invalid.json.novel.writing.events[a.id].chapterOrders={'unknown-chapter':1};await assert.rejects(call('transfer.preview',{file:invalid,options:{mode:'copy'}}));
});
