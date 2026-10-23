import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=resolve(process.env.MOJI_BUNDLE_ROOT||'.');
async function load({result={ok:true,value:{accepted:true}},supported=true}={}){
 let plugin,view;const calls=[];
 runInNewContext(await readFile(resolve(root,'lib/client.js'),'utf8'),{window:{addEventListener(){},removeEventListener(){},__ModuleLoader__:{load({id,factory}){assert.equal(id,'dsh-moji');plugin=factory(require);}}},document:{addEventListener(){},removeEventListener(){},createElement:()=>({})},console,URL,setTimeout,clearTimeout,TextEncoder,TextDecoder,AbortController});
 const ctx={effect:fn=>fn(),sidebarRightTabs:{register(){}},sidebarRight:{mounted:{}},workspaces:{list:{}},uiWorkspace:{},layout:{selectPanel(v){calls.push(['close',v]);}},sessions:{list:{},...(supported?{async using(id,opts,fn){calls.push(['retain',id,opts]);try{return await fn({sessionId:id,ready:Promise.resolve(),binding:{sessionId:id,get ctx(){throw new Error('scoped ctx must not be accessed');},session:{sessionId:id,async prompt(parts,mode){calls.push(['prompt',parts,mode]);return result;}}}});}finally{calls.push(['release']);}}}:{})},slots:{inject:(_name,fn)=>fn(),register(def,Component){if(def.name==='sidebar.right.pane.tab')view=Component;}}};
 Object.defineProperty(ctx,'conversation',{get(){throw new Error('capability probe accessed conversation');}});
 plugin.applyWithRPC(ctx,async()=>{});
 const element=view({useTabInfo:()=>({tab:{navigation:{address:'dsh-resource://cuigengji/current'}}})});
 return {plugin,calls,send:element.props.value.send};
}
test('actual built native entry exposes deployment sender without probing conversation and sends once',async()=>{
 const f=await load();assert.match(await f.send('部署'),/已交给/);assert.equal(f.calls[0][1],'current');assert.equal(f.calls[1][1][0].text,'部署');assert.equal(f.calls[1][2],'queue');assert.deepEqual(f.calls.slice(-2),[['release'],['close',null]]);
 const manifest=JSON.parse(await readFile(resolve(root,'package.json')));assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-session'));assert.ok(f.plugin.inject.includes('sessions'));
});
test('actual built native entry propagates refused admission without closing or false success',async()=>{
 const f=await load({result:{ok:false,error:{message:'拒绝'}}});await assert.rejects(f.send('部署'),/拒绝/);assert.deepEqual(f.calls.map(x=>x[0]),['retain','prompt','release']);
});
test('actual built native entry disables sender when public session channel is absent',async()=>{
 const f=await load({supported:false});assert.equal(f.send,null);assert.deepEqual(f.calls,[]);
});
