import test from 'node:test';
import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import {sendNativeReference} from '../src/client/native-reference.js';
const accepted={ok:true,value:{accepted:true}};
function fixture({result=accepted,prompt,ready=Promise.resolve(),referenceId='current',bindingId='current',sessionId='current',close}={}){
 const calls=[],root=new Context();let bare;
 root.plugin(ctx=>ctx.provide('conversation',{send(){throw new Error('wrong conversation');}}));
 root.plugin(ctx=>{bare=ctx;});
 const reference={sessionId:referenceId,ready,binding:{sessionId:bindingId,get ctx(){return bare;},session:{sessionId,prompt:prompt||async function(...args){calls.push(['prompt',...args]);return result;}}}};
 const ctx={sessions:{async using(id,options,fn){calls.push(['retain',id,options]);try{return await fn(reference);}finally{calls.push(['release']);}}},layout:{selectPanel(value){calls.push(['close',value]);return close?.();}}};
 Object.defineProperty(ctx,'conversation',{get(){throw new Error('root conversation must not be read');}});
 return {ctx,reference,calls,get bare(){return bare;}};
}
test('real Cordis no-inject Session scope reproduces old conversation guard',async()=>{
 const f=fixture();await new Promise(r=>setTimeout(r,0));assert.throws(()=>f.bare.conversation,/cannot get property "conversation" without inject/);
});
test('sender bypasses Cordis conversation guard using exact retained public SessionFace once',async()=>{
 const f=fixture();await new Promise(r=>setTimeout(r,0));assert.throws(()=>f.reference.binding.ctx.conversation,/without inject/);await sendNativeReference(f.ctx,'current','部署提示词');
 assert.deepEqual(f.calls,[['retain','current',{source:'cuigengji'}],['prompt',[{type:'text',text:'部署提示词'}],'queue'],['release'],['close',null]]);
});
test('waits for reference ready and admission before closing, holding reference until settlement',async()=>{
 let ready,admit;const pending=new Promise(r=>ready=r),admission=new Promise(r=>admit=r),f=fixture({ready:pending,prompt:async()=>{f.calls.push(['prompt']);return admission;}});
 const done=sendNativeReference(f.ctx,'current','x');await Promise.resolve();assert.equal(f.calls.length,1);
 ready();await Promise.resolve();assert.equal(f.calls.at(-1)[0],'prompt');assert.equal(f.calls.length,2);
 admit(accepted);await done;assert.deepEqual(f.calls.slice(-2),[['release'],['close',null]]);
});
for(const key of ['referenceId','bindingId','sessionId'])test(`rejects wrong ${key} without sending or closing`,async()=>{
 const f=fixture({[key]:'other'});await assert.rejects(sendNativeReference(f.ctx,'current','x'),/会话不匹配/);assert.deepEqual(f.calls.map(x=>x[0]),['retain','release']);
});
for(const result of [{ok:false,error:{message:'denied'}},{ok:true,value:{accepted:false}},undefined])test(`non-acceptance ${JSON.stringify(result)} retains UI and releases reference`,async()=>{
 const f=fixture({prompt:async()=>{f.calls.push(['prompt']);return result;}});await assert.rejects(sendNativeReference(f.ctx,'current','x'),/未被接受/);assert.deepEqual(f.calls.map(x=>x[0]),['retain','prompt','release']);
});
test('transport error propagates once without retry, fallback session or closing',async()=>{
 const f=fixture({prompt:async()=>{f.calls.push(['prompt']);throw new Error('offline');}});await assert.rejects(sendNativeReference(f.ctx,'current','x'),/offline/);assert.deepEqual(f.calls.map(x=>x[0]),['retain','prompt','release']);
});
test('missing public prompt and invalid current session fail closed',async()=>{
 const f=fixture();f.reference.binding.session.prompt=null;await assert.rejects(sendNativeReference(f.ctx,'current','x'),/未提供/);await assert.rejects(sendNativeReference(f.ctx,'','x'),/会话不可用/);await assert.rejects(sendNativeReference({},'current','x'),/未提供/);assert.deepEqual(f.calls.map(x=>x[0]),['retain','release']);
});
test('accepted send remains successful if subsequent UI navigation fails; no duplicate retry',async()=>{
 const f=fixture({close:()=>{throw new Error('panel unavailable');}});await sendNativeReference(f.ctx,'current','x');assert.equal(f.calls.filter(x=>x[0]==='prompt').length,1);
});
