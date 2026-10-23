import test from 'node:test';
import assert from 'node:assert/strict';
import {createDshRuntime} from '../src/adapters/dsh/runtime.js';
import {referenceMessage,sendNativeReference} from '../src/client/native-reference.js';
import {testCredentials as credentials} from './helpers/credentials.js';

test('云端选择持久化；读取、写入失败均不初始化或回退本机库',async()=>{
  const creds=credentials(),calls=[];let localOpened=0;
  const cloudClient={status:async()=>({authenticated:true,pending:false}),rpc:async(...args)=>{calls.push(args);if(args[0].includes('offline'))throw Object.assign(new Error('离线'),{code:'NETWORK_ERROR'});return {ok:true};},close(){}};
  const options={credentials:creds,cloudClient,createLocal:async()=>{localOpened++;throw new Error('不应打开本机库');}};
  let runtime=await createDshRuntime(options);
  await runtime.control('connection.configure',{mode:'cloud',instanceUrl:'https://cloud.example/'});
  runtime=await createDshRuntime(options);
  await runtime.ready();await runtime.rpc('novel.list',{},'session-a');
  const signal=new AbortController().signal;
  await runtime.rawDispatch('chapter.get',{chapterId:'c'},{kind:'agent',sessionId:'session-a',signal});
  assert.deepEqual(calls[1],['https://cloud.example','chapter.get',{chapterId:'c'},'session-a','agent',{signal}]);
  assert.equal(localOpened,0);
  await runtime.control('connection.configure',{mode:'cloud',instanceUrl:'https://offline.example'});
  await assert.rejects(runtime.rpc('chapter.update',{content:'保留草稿'},'session-a'),{code:'NETWORK_ERROR'});
  assert.equal(localOpened,0);assert.equal((await runtime.status()).mode,'cloud');
  await runtime.close();
});
test('运行中的会话禁止切换数据来源，原选择保留',async()=>{
  const runtime=await createDshRuntime({credentials:credentials(),cloudClient:{close(){}},createLocal:async()=>{},isBusy:()=>true});
  await assert.rejects(runtime.control('connection.configure',{mode:'cloud',instanceUrl:'https://cloud.example'}),{code:'SESSION_BUSY'});
  assert.equal(runtime.mode(),'local');
});
test('本机模式保留维护、导入导出与原会话策略',async()=>{
  const calls=[];let opened=0;
  const backend={maintenance:{ensureReady:async()=>calls.push('ready')},transfer:{catalog:async a=>a},memory:{close:async()=>calls.push('closed')},dispatch:async(...args)=>calls.push(args),store:{dispatch:async(...args)=>calls.push(args)}};
  const runtime=await createDshRuntime({credentials:credentials(),cloudClient:{close(){}},createLocal:async()=>{opened++;return backend;}});
  assert.equal(opened,0);assert.deepEqual(await runtime.rpc('transfer.catalog',{format:'all'},'s'),{format:'all'});
  await runtime.rpc('chapter.get',{chapterId:'c'},'s');
  assert.deepEqual(calls.at(-1),['chapter.get',{chapterId:'c'},{kind:'human',sessionId:'s'}]);
  assert.equal(opened,1);await runtime.close();assert.equal(calls.at(-1),'closed');
});
test('引用通过原生会话通道发送，保留作品、版本与草稿标识',async()=>{
  const sent=[];const ctx={sessions:{using:async(id,opts,fn)=>{sent.push(id);return fn({sessionId:id,ready:Promise.resolve(),binding:{sessionId:id,session:{sessionId:id,prompt:async ([{text}],mode)=>{assert.equal(mode,'queue');sent.push(text);return {ok:true,value:{accepted:true}};}}}});}},conversation:{},layout:{selectPanel:v=>sent.push(v)}};
  await sendNativeReference(ctx,'author-session',referenceMessage({novelId:'novel-a',id:'chapter-b',kind:'chapter',revision:7,dirty:true},'选中正文'));
  assert.equal(sent[0],'author-session');assert.match(sent[1],/novel-a/);assert.match(sent[1],/读取版本：7/);assert.match(sent[1],/未保存草稿/);assert.match(sent[1],/选中正文/);assert.equal(sent[2],null);
});
