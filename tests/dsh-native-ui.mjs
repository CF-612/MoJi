// Exercise the shipped ModuleLoader bundle, rather than a second UI entry.
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdtemp,readFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createService} from '../integrations/chatgpt-workbench/server/service.mjs';
import {createDshRuntime} from '../src/adapters/dsh/runtime.js';
import {testCredentials} from './helpers/credentials.js';
const root=resolve(import.meta.dirname,'..'),directory=await mkdtemp(join(tmpdir(),'dsh-native-ui-'));
const local=await createService(join(directory,'local')),cloud=await createService(join(directory,'cloud'));
for(const [service,title] of [[local,'本机原生测试作品'],[cloud,'同一云端测试作品']]){
  const {books}=await service.bootstrap('ui-native');await service.rpc('novel.update',{novelId:books[0].id,expectedRevision:books[0].revision,title},'ui-native');
}
const calls=[];
const runtime=await createDshRuntime({credentials:testCredentials(),cloudClient:{status:async()=>({authenticated:true,pending:false}),rpc:async(origin,action,args,sid,kind)=>cloud.rpc(action,args,sid,kind),close(){}},createLocal:async()=>({dispatch:(a,b,c)=>local.rpc(a,b,c.sessionId,c.kind),maintenance:{ensureReady:async()=>{}},memory:{close:async()=>{}}})});
const host=await build({stdin:{resolveDir:root,loader:'tsx',contents:`
import React from 'react';import * as jsx from 'react/jsx-runtime';import * as dom from 'react-dom';import{createRoot}from'react-dom/client';
const rpc=async(action,args={},sessionId='ui-native')=>{const r=await fetch('/dispatch',{method:'POST',body:JSON.stringify({action,args,sessionId})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;};
window.__ModuleLoader__={load({factory}){
const plugin=factory(name=>name==='react'?React:name==='react/jsx-runtime'?jsx:name==='react-dom'?dom:(()=>{throw new Error('Unexpected host import '+name)})());
window.nativeInject=plugin.inject;const slots={inject:(name,fn)=>fn(),register:(definition,Component)=>{if(definition.name==='sidebar.right.pane.tab'){createRoot(document.getElementById('root')).render(<Component useTabInfo={()=>({tab:{navigation:{address:'dsh-resource://cuigengji/ui-native'}}})}/>);}else{const {hooks,...props}=definition.inject();if(!hooks.sessions)throw new Error('Missing native sessions hook');createRoot(document.getElementById('launcher')).render(<Component {...props} wide={true} useNovelSession={selector=>selector('ui-native')} useNovelWorkspaces={selector=>selector({items:[],phase:'ready'})} useSessions={selector=>selector({byId:{'ui-native':{id:'ui-native',retainedBy:{mainView:1}}}})}/>);}return()=>{};}};
const ctx={slots,effect:fn=>fn(),sidebarRightTabs:{register:()=>()=>{}},sidebarRight:{mounted:{},openResource(){}},workspaces:{list:{}},uiWorkspace:{openWorkspace(){}},layout:{selectPanel(){}},sessions:{list:{}}};plugin.applyWithRPC(ctx,rpc);
}};
`},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}});
const bundle=await readFile(join(root,'lib/client.js'));
const server=createServer(async(req,res)=>{try{
  if(req.url==='/dispatch'){let text='';for await(const part of req)text+=part;const {action,args,sessionId}=JSON.parse(text);calls.push(action);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await runtime.rpc(action,args,sessionId)));return;}
  if(req.url==='/host.js'||req.url==='/plugin.js'){res.setHeader('Content-Type','text/javascript');res.end(req.url==='/host.js'?host.outputFiles[0].contents:bundle);return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<html><meta charset="utf-8"><style>html,body{margin:0;height:100%}#root{height:calc(100% - 55px)}</style><div id="launcher"></div><div id="root"></div><script src="/host.js"></script><script src="/plugin.js"></script></html>');
}catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.getByText('本机原生测试作品',{exact:true}).first().waitFor();
  assert.ok((await page.evaluate(()=>window.nativeInject)).includes('sessions'));
  assert.equal(await page.getByRole('dialog').count(),0,'连接面板默认隐藏');
  assert.equal(await page.getByRole('button',{name:'打开墨叽'}).getByAltText('烟灰蛸').count(),1);
  await page.getByRole('button',{name:'连接设置',exact:true}).click();await page.getByRole('radio',{name:/个人云端/}).click();await page.getByLabel('个人云端地址').fill('https://cloud.example');await page.getByRole('button',{name:'保存并切换'}).click();
  await page.getByText('同一云端测试作品',{exact:true}).first().waitFor();
  assert.equal(await page.getByText('本机原生测试作品',{exact:true}).count(),0);
  assert.deepEqual(errors,[]);assert.ok(calls.includes('connection.configure'));assert.ok(calls.includes('binding.get'));
  assert.equal(await page.getByRole('dialog').count(),0,'连接后收起设置');
  await mkdir(join(root,'.data/dsh-candidate'),{recursive:true});await page.screenshot({path:join(root,'.data/dsh-candidate/native-ui.png'),fullPage:true});
  await page.getByRole('button',{name:'连接设置',exact:true}).click();await page.screenshot({path:join(root,'.data/dsh-candidate/native-connection.png'),fullPage:true});
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.getByRole('button',{name:'连接设置',exact:true}).evaluate(el=>el===document.activeElement),true);
  await page.setViewportSize({width:360,height:760});await page.getByRole('button',{name:'连接设置',exact:true}).click();
  assert.equal(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true,'窄侧栏中面板不横向溢出');await page.screenshot({path:join(root,'.data/dsh-candidate/native-connection-narrow.png'),fullPage:true});
  await page.getByRole('button',{name:'关闭连接设置'}).click();assert.equal(await page.getByRole('dialog').count(),0);
  console.log(JSON.stringify({ok:true,shippedBundle:true,localAndCloud:true,launcher:true,pageErrors:errors.length}));
}finally{await browser?.close();await runtime.close();await new Promise(resolve=>server.close(resolve));}
