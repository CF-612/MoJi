import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlacementQueue} from '../vendor/cuigengji/src/client/features/structure/event-placement-queue.mjs';
import {placementRequest} from '../../../src/domain/placement-request.js';
import {createService} from '../server/service.mjs';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});
async function setup(){const s=await createService(await mkdtemp(join(root,'direct-'))),call=(a,args={})=>s.rpc(a,{novelId:s.novelId,...args},'direct','human'),a=await call('chapter.get',{chapterId:s.chapterId}),b=await call('chapter.create',{title:'第二章'}),c=await call('chapter.create',{title:'第三章'}),e=await call('writing.event.create',{value:{title:'未命名事件',order:10,narrativeKind:'linear',chapterRefs:[{chapterId:a.id,revision:a.revision,evidence:''}]},confirmed:true});return {call,a,b,c,e,board:await call('writing.board.get')};}
test('直接拖动连续排队，先预览再后台写入；只接续自己的版本，不阻塞下一次拖动',async()=>{
 const {call,a,b,c,e,board}=await setup();let release;const gate=new Promise(r=>release=r),calls=[];
 const q=createPlacementQueue({send:async args=>{calls.push(args);if(calls.length===1)await gate;return call('writing.event.place',args);}});
 q.enqueue(placementRequest(board,e.id,'narration',{operation:'move',startChapterId:b.id,endChapterId:b.id}));await Promise.resolve();
 const shown=q.project(board);assert.equal(shown.events.find(x=>x.id===e.id).chapterRefs[0].chapterId,b.id);
 q.enqueue(placementRequest(shown,e.id,'narration',{operation:'resize-end',startChapterId:b.id,endChapterId:c.id}));assert.equal(q.snapshot().jobs.length,2);assert.equal(calls.length,1);release();await q.flush();
 const saved=await call('writing.event.get',{id:e.id});assert.deepEqual(saved.chapterRefs.map(r=>r.chapterId),[b.id,c.id]);assert.equal(saved.revision,e.revision+2);assert.equal(q.snapshot().jobs.length,0);assert.equal(calls[1].expectedRevision,e.revision+1);assert.notEqual(calls[0].requestId,calls[1].requestId);
});
test('丢失回复后重开仍用相同请求重试，不重复保存；外端修改保持冲突和草稿',async()=>{
 const {call,b,e,board}=await setup();let storage,args;
 const q=createPlacementQueue({write:x=>storage=structuredClone(x),send:async x=>{args=x;await call('writing.event.place',x);throw new Error('回复丢失');}});
 q.enqueue(placementRequest(board,e.id,'narration',{operation:'move',startChapterId:b.id,endChapterId:b.id}));await q.flush();assert.equal(q.snapshot().jobs.length,1);
 const reopened=createPlacementQueue({read:()=>storage,send:x=>{assert.deepEqual(x,args);return call('writing.event.place',x);}});await reopened.retry();assert.equal((await call('writing.event.get',{id:e.id})).revision,e.revision+1);
 const stale=placementRequest(board,e.id,'narration',{operation:'move',startChapterId:b.id,endChapterId:b.id}),conflict=createPlacementQueue({send:x=>call('writing.event.place',x)});conflict.enqueue(stale);await conflict.flush();assert.match(conflict.snapshot().error,/版本|变化|修改/);assert.equal(conflict.snapshot().jobs.length,1);
});
test('占位事件可以稍后补内容并删除；删除保留可恢复历史',async()=>{
 const {call,e}=await setup();assert.equal(e.content,'');const v=await call('writing.event.update',{id:e.id,expectedRevision:e.revision,confirmed:true,value:{title:'之后补充的事件',content:'补充经过'}});await call('writing.event.delete',{id:e.id,expectedRevision:v.revision,confirmed:true});assert.equal((await call('writing.event.list')).some(x=>x.id===e.id),false);const history=await call('writing.history',{collection:'events',id:e.id});assert.ok(history.versions.some(x=>x.value.content==='补充经过'));
});
test('故事顺序连续拖动接续所有受影响版本，章节叙述和日期保持独立',async()=>{
 const {call,a,e}=await setup(),others=[];for(let i=2;i<=3;i++)others.push(await call('writing.event.create',{confirmed:true,value:{title:`事件${i}`,order:i*10,storyDate:'1938-09-01',narrativeKind:'linear',chapterRefs:[{chapterId:a.id,revision:a.revision,evidence:''}]}}));
 const board=await call('writing.board.get');let release;const gate=new Promise(r=>release=r);let first=true;const q=createPlacementQueue({send:async args=>{if(first){first=false;await gate;}return call('writing.event.place',args);}});
 q.enqueue(placementRequest(board,others[1].id,'story',{operation:'move',beforeEventId:e.id}));const preview=q.project(board);q.enqueue(placementRequest(preview,others[0].id,'story',{operation:'move',beforeEventId:others[1].id}));release();await q.flush();assert.equal(q.snapshot().error,'');
 const saved=await call('writing.board.get');assert.deepEqual([...saved.events].sort((a,b)=>a.order-b.order).map(x=>x.id),[others[0].id,others[1].id,e.id]);assert.ok(saved.events.filter(x=>x.id!==e.id).every(x=>x.storyDate==='1938-09-01'));assert.equal(saved.events.find(x=>x.id===e.id).chapterOrders[a.id],10);
});
