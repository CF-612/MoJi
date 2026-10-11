import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {runInNewContext} from 'node:vm';

async function startup(hasOpeningResult){
  const source=await readFile(new URL('../client/workbench.tsx',import.meta.url),'utf8');
  const start=source.slice(source.indexOf('async function start(){'),source.lastIndexOf('start();'));
  const code=(await transform(start,{loader:'tsx'})).code;
  const root={textContent:''},calls=[];let rendered=false;
  class HostApp{
    async connect(){if(hasOpeningResult)this.ontoolresult({structuredContent:{result:{contextId:'mobile-chat',books:[]}}});}
    getHostContext(){return {displayMode:'inline'};}
    async callServerTool(args){calls.push(args);if(hasOpeningResult)throw new Error('MCP error -32000: Failed to fetch');return {structuredContent:{result:{books:[]}}};}
  }
  const sandbox={App:HostApp,embedded:true,app:null,sessionId:'desktop',initialReceived:false,hostContext(){},unpack:r=>r.structuredContent.result,
    document:{getElementById:()=>root},window:{dispatchEvent(){}},Event:class{},NativeSurface(){},React:{createElement:()=>({})},
    createRoot:()=>({render(){rendered=true;}}),setTimeout:fn=>{queueMicrotask(fn);}};
  await runInNewContext(code+'start();',sandbox);
  return {root,calls,rendered};
}
test('宿主已返回作品时，即使重复 bootstrap 会 Failed to fetch 也正常显示卡片',async()=>{
  const result=await startup(true);assert.equal(result.rendered,true,result.root.textContent);assert.equal(result.calls.length,0);
});
test('没有首次工具结果时仍通过受保护工具初始化',async()=>{
  const result=await startup(false);assert.equal(result.rendered,true,result.root.textContent);assert.equal(result.calls[0].name,'workbench_bootstrap');
});
