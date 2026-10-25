// Real components, mocked host/RPC only: never contacts an Agent or cloud service.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve('artifacts/dsh-connection-card');await mkdir(out,{recursive:true});
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
import React from 'react';import {createRoot} from 'react-dom/client';
import {NativeConnection} from './src/client/native-connection.tsx';
import {WorkbenchHeader} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/WorkbenchHeader.tsx';
import {styles} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/style.ts';
import {DeploymentAgentContext} from '#moji-shared-ui';
const mode=new URLSearchParams(location.search).get('mode')||'dsh';window.calls=[];window.sent=[];
let state={mode:'local',authenticated:false,pending:false,instanceUrl:''};
window.completeLogin=()=>{state={...state,authenticated:true,pending:false};};
const rpc=async(action,args)=>{window.calls.push(action);if(action==='connection.status'){if(mode==='error'&&!window.recovered)throw new Error('连接状态读取失败');if(mode==='loading')await new Promise(r=>setTimeout(r,1000));return {...state};}if(action==='connection.configure'){state={...state,...args};window.recovered=true;return {};}if(action==='connection.login'){state.pending=true;return {authorizationUrl:'https://example.invalid/authorize'};}if(action==='connection.logout'){state.authenticated=false;return {};}throw new Error(action);};
const send=mode==='unsupported'?null:async text=>{window.sent.push(text);if(mode==='send-error')throw new Error('宿主拒绝');return '部署提示词已交给当前 Agent';};
function Workbench(){return <div className="moji-preferences" data-theme-preference={new URLSearchParams(location.search).has('dark')?'dark':'light'} style={{display:'contents'}}><section className="cuigengji"><style>{styles}</style><WorkbenchHeader home tab="" busy={false} refreshing={false} onHome={()=>{}} onTab={()=>{}} onRefresh={()=>{}} onSettings={()=>{}} onAbout={()=>{}}/><h1>测试作品</h1></section></div>}
const dsh=!['web','mcp','unsupported','send-error'].includes(mode);
const content=dsh?<NativeConnection rpc={rpc} sessionId="test" Workbench={Workbench}/>:<Workbench/>;
createRoot(document.getElementById('root')).render(mode==='web'?content:<DeploymentAgentContext.Provider value={{host:dsh?'dsh':'mcp',send}}>{content}</DeploymentAgentContext.Provider>);
`},bundle:true,write:false,format:'iife',alias:{react:resolve('node_modules/react'),'react-dom':resolve('node_modules/react-dom')},loader:{'.png':'dataurl','.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"development"'}});
const html=`<!doctype html><html><meta charset="utf-8"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script>if(new URLSearchParams(location.search).has('narrow')){const frame=document.createElement('iframe');frame.title='360px 侧栏';frame.style='width:360px;height:700px;border:0';frame.src=location.href.replace('&narrow=1','');document.getElementById('root').append(frame);}else{${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}}</script></html>`;
await writeFile(resolve(out,'fixture.html'),html);
if(process.argv.includes('--fixture-only')){console.log(out);process.exit(0);}
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const visit=async mode=>{await page.goto('file://'+resolve(out,'fixture.html')+'?mode='+mode);};
 const menu=()=>page.getByRole('button',{name:'工作台更多功能'}).click();
 const card=()=>page.getByRole('button',{name:'本地 / 云端',exact:true});
 await visit('dsh');await menu();await card().waitFor();assert.match(await card().innerText(),/当前：本地保存/);assert.equal(await page.locator('.moji-connection-trigger').count(),0);
 await page.screenshot({path:resolve(out,'dsh-menu.png')});await card().click();await page.getByRole('dialog',{name:'本地 / 云端'}).waitFor();
 assert.equal(await page.getByRole('dialog').count(),1);await page.getByRole('radio',{name:/个人云端/}).click();assert.equal(await page.getByRole('button',{name:'发送部署提示词给当前 Agent'}).count(),1);assert.deepEqual(await page.evaluate(()=>window.sent),[]);
 await page.getByRole('button',{name:'发送部署提示词给当前 Agent'}).click();assert.equal((await page.evaluate(()=>window.sent)).length,1);
 await page.getByLabel('个人云端地址').fill('https://cloud.example');await page.getByRole('button',{name:'保存并切换'}).click();await page.getByRole('button',{name:'登录个人云端'}).click();await page.getByRole('button',{name:'等待授权…'}).waitFor();await page.evaluate(()=>window.completeLogin());await page.getByRole('button',{name:'退出此云端连接'}).waitFor();
 await page.getByRole('button',{name:'关闭本地与云端设置'}).click();await menu();assert.match(await card().innerText(),/个人云端 · 已连接/);await card().click();await page.keyboard.press('Escape');await page.waitForTimeout(50);assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.getByRole('button',{name:'工作台更多功能'}).evaluate(el=>el===document.activeElement),true);
 await visit('error');await card().click();await page.getByRole('button',{name:'保存并切换'}).click();await page.getByText('测试作品',{exact:true}).waitFor();
 await visit('loading');await card().waitFor();await card().click();await page.getByRole('dialog',{name:'本地 / 云端'}).waitFor();
 for(const mode of ['web','mcp','unsupported','send-error']){await visit(mode);await menu();assert.equal(await card().count(),0);assert.equal(await page.getByLabel('连接与云端',{exact:true}).count(),0);assert.equal(await page.getByLabel('个人云端部署引导',{exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'发送部署提示词给当前 Agent'}).count(),0);assert.equal(await page.getByRole('button',{name:'复制部署提示词'}).count(),0);assert.deepEqual(await page.evaluate(()=>window.sent),[]);if(mode==='mcp')await page.screenshot({path:resolve(out,'mcp-menu.png')});}
 await visit('dsh');await page.setViewportSize({width:360,height:760});await menu();await card().click();await page.getByRole('radio',{name:/个人云端/}).click();assert.equal(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await page.screenshot({path:resolve(out,'dsh-connection-narrow.png')});
 assert.deepEqual(errors,[]);console.log('PASS: DSH menu card, non-DSH gate, local/cloud/login/polling, focus, loading/error recovery, DSH mocked Agent send, embedded deployment controls absent, narrow layout');
}finally{await browser.close();}
