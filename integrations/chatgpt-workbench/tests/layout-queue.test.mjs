import test from 'node:test';
import assert from 'node:assert/strict';
import {createLayoutQueue} from '../vendor/cuigengji/src/client/shared/layout-queue.mjs';
const point=x=>({x,y:20});
function setup(persist,restored){let stored,timer;const q=createLayoutQueue({persist,read:()=>restored,write:v=>stored=structuredClone(v),schedule:fn=>(timer=fn,1),cancel:()=>timer=null});return {q,stored:()=>stored,fire:()=>timer?.()};}
test('连续拖动合并成一次请求，使用第一次读取版本，保留最后位置',async()=>{
 const calls=[],{q}=setup(async(...a)=>{calls.push(a);return true;});q.enqueue({a:point(1)},{a:3});q.enqueue({a:point(7),b:point(2)},{a:99,b:2});await q.flush();assert.equal(calls.length,1);assert.deepEqual(calls[0].slice(0,2),[{a:point(7),b:point(2)},{a:3,b:2}]);assert.equal(q.snapshot().dirty,false);
});
test('请求未完成仍接受拖动；后续请求使用已确认版本，不丢失较新位置',async()=>{
 let resolve;const calls=[],{q}=setup((...a)=>{calls.push(a);return calls.length===1?new Promise(r=>resolve=r):Promise.resolve(true);});q.enqueue({a:point(1)},{a:4});const saving=q.flush();await Promise.resolve();q.enqueue({a:point(8),b:point(3)},{a:4,b:2});assert.deepEqual(q.points().a,point(8));resolve(true);await saving;await q.flush();assert.equal(calls.length,2);assert.deepEqual(calls[1].slice(0,2),[{a:point(8),b:point(3)},{a:5,b:2}]);
});
test('断网和冲突保留已发送请求；重新打开及重试保持原 ID/参数',async()=>{
 let fail=true;const calls=[],{q,stored}=setup(async(...a)=>{calls.push(a);if(fail)throw new Error('CONFLICT');return true;});q.enqueue({a:point(1)},{a:3});await q.flush();q.enqueue({a:point(9)},{a:100});assert.equal(q.snapshot().error,'CONFLICT');const next=setup(async(...a)=>{calls.push(a);return true;},stored()).q;await next.retry();await next.flush();assert.deepEqual(calls[1],calls[0]);assert.equal(calls[2][1].a,4);assert.deepEqual(calls[2][0].a,point(9));
});
test('刷新期间不重定未保存版本；超过 200 卡分批提交；丢弃不删除作品',async()=>{
 const calls=[],{q}=setup(async(...a)=>{calls.push(a);return true;});const points=Object.fromEntries(Array.from({length:201},(_,i)=>['n'+i,point(i)])),revs=Object.fromEntries(Object.keys(points).map(id=>[id,1]));q.enqueue(points,revs);q.sync([{id:'n0',revision:7}]);q.enqueue({n0:point(300)},{n0:7});await q.flush();await q.flush();assert.deepEqual(calls.map(c=>Object.keys(c[0]).length),[200,1]);assert.equal(calls[0][1].n0,1);q.enqueue({n0:point(500)},{n0:2});assert.equal(q.discard(),true);assert.equal(q.snapshot().dirty,false);
});
test('版本冲突只有明确核对才更新基准，删除的卡片不能强制重存',async()=>{
 const calls=[],{q}=setup(async(...a)=>{calls.push(a);if(calls.length===1)throw Object.assign(new Error('另一端已改动'),{code:'CONFLICT'});return true;});q.enqueue({a:point(7)},{a:1});await q.flush();assert.equal(q.snapshot().errorCode,'CONFLICT');assert.equal(q.rebase([]),false);assert.equal(q.rebase([{id:'a',revision:3,deleted:true}]),false);assert.equal(q.rebase([{id:'a',revision:3}]),true);await q.flush();assert.deepEqual(calls[1].slice(0,2),[{a:point(7)},{a:3}]);assert.notEqual(calls[0][2],calls[1][2]);
});
