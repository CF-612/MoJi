import test from 'node:test';
import assert from 'node:assert/strict';
import {handleNativeDsh} from '../native-dsh.mjs';
const auth={owner:'original-owner',clientId:'dsh-client',scopes:new Set(['novel:read','novel:write'])};
function call(body,{identity=auth,headers={},method='POST',binding={novelId:'bound-work'}}={}){
  const calls=[];const factory=(env,owner)=>{assert.equal(owner,'original-owner');return {rpc:async(...args)=>{calls.push(args);return args[0]==='binding.get'?binding:{id:'result'};}};};
  return handleNativeDsh(new Request('https://cloud.example/mcp/dsh/dispatch',{method,headers:{'Content-Type':'application/json',...headers},...(method==='POST'?{body:JSON.stringify(body)}:{})}),{},identity,factory).then(async response=>({status:response.status,body:await response.json(),calls}));
}
test('原生作者与 Agent 使用原 owner；会话按 OAuth 客户端隔离，忽略伪造身份',async()=>{
  const body={action:'chapter.get',args:{novelId:'bound-work',chapterId:'c',owner:'evil',sessionId:'evil'},sessionId:'s',kind:'agent'};
  const a=await call(body);assert.equal(a.status,200);assert.equal(a.calls[1][3],'agent');assert.equal(a.calls[1][1].owner,undefined);assert.equal(a.calls[1][1].sessionId,undefined);
  const b=await call({...body,kind:'human'});assert.equal(b.calls[0][2],a.calls[0][2]);
  const c=await call(body,{identity:{...auth,clientId:'other-client'}});assert.notEqual(a.calls[0][2],c.calls[0][2]);
});
test('模型只能访问作者绑定的小说，不能伪装绑定或跨小说',async()=>{
  assert.equal((await call({action:'chapter.get',args:{novelId:'other'},sessionId:'s',kind:'agent'})).status,403);
  assert.equal((await call({action:'binding.set',args:{novelId:'other'},sessionId:'s',kind:'agent'})).status,403);
  assert.equal((await call({action:'chapter.get',args:{},sessionId:'s',kind:'agent'},{binding:null})).status,409);
});
test('缺少授权、写权限或非法来源时拒绝；读取可用',async()=>{
  const body={action:'novel.list',args:{},sessionId:'s',kind:'human'};
  assert.equal((await call(body,{identity:null})).status,401);
  const readOnly={...auth,scopes:new Set(['novel:read'])};
  assert.equal((await call(body,{identity:readOnly})).status,200);
  assert.equal((await call({...body,action:'chapter.update'},{identity:readOnly})).status,403);
  assert.equal((await call(body,{headers:{Origin:'https://evil.example'}})).status,403);
  assert.equal((await call({...body,sessionId:''})).status,400);
});
