import test from 'node:test';
import assert from 'node:assert/strict';
import {createReliableRpc} from '../client/reliable-rpc.mjs';

for(const action of ['chapter.list','graph.list','planning.list','preset.read','binding.get'])test(action+' 临时失败两次后无需刷新即可读到数据',async()=>{
  let calls=0;const waits=[];
  const rpc=createReliableRpc(async()=>{if(++calls<3)throw new Error('MCP error -32000: Failed to fetch');return ['资料'];},{sleep:async ms=>waits.push(ms)});
  assert.deepEqual(await rpc(action,{novelId:'demo'}),['资料']);assert.equal(calls,3);assert.deepEqual(waits,[400,1200]);
});
test('断网重试有上限，队列释放后可手动恢复',async()=>{
  let calls=0,offline=true;
  const rpc=createReliableRpc(async()=>{calls++;if(offline)throw new Error('Failed to fetch');return '恢复';},{sleep:async()=>{}});
  await assert.rejects(rpc('graph.list'),/连接暂时中断/);assert.equal(calls,3);
  offline=false;assert.equal(await rpc('graph.list'),'恢复');
});
test('保存、删除及规划事务遇到网络错误只发送一次，保留原版本参数',async()=>{
  for(const action of ['chapter.update','graph.create','graph.delete','planning.apply','preset.set','binding.set']){
    let calls=0;const args={expectedRevision:5,requestId:'request'};
    const rpc=createReliableRpc(async(a,value)=>{calls++;assert.equal(value,args);throw new Error('Failed to fetch');},{sleep:async()=>assert.fail('不应重发保存')});
    await assert.rejects(rpc(action,args));assert.equal(calls,1);
  }
});
test('鉴权、版本冲突及业务错误不会自动重试',async()=>{
  for(const message of ['FORBIDDEN: 作者身份不匹配','VERSION_CONFLICT: 版本变化','invalid arguments','MCP error -32000: Unauthorized']){
    let calls=0;const rpc=createReliableRpc(async()=>{calls++;throw new Error(message);},{sleep:async()=>assert.fail('不应重试业务错误')});
    await assert.rejects(rpc('graph.get'));assert.equal(calls,1);
  }
});
test('所有页面并发读取上限为二，相同未完成读取合并，完成后再读可获得新数据',async()=>{
  let active=0,peak=0,calls=0;
  const rpc=createReliableRpc(async()=>{calls++;active++;peak=Math.max(peak,active);await new Promise(setImmediate);active--;return calls;});
  await Promise.all(Array.from({length:20},(_,id)=>Promise.all([rpc('graph.get',{id}),rpc('graph.get',{id})])));
  assert.equal(calls,20);assert.ok(peak<=2,'实际并发 '+peak);
  await rpc('graph.get',{id:0});assert.equal(calls,21,'不能缓存旧版本读取');
});
