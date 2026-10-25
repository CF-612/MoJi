// Run the shipped native bundle inside a shared-document host with its own wallpaper.
// No DSH profile, owner data, account configuration, or personal cloud is opened.
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..'),shots=join(root,'test-results','dsh-theme-isolation');
await mkdir(shots,{recursive:true});
const host=await build({stdin:{resolveDir:root,loader:'tsx',contents:`
import {emptyWorkspace} from './src/domain/story-workspace.mjs';
import {Workbench} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/index.tsx';
import React from 'react';import * as jsx from 'react/jsx-runtime';import * as dom from 'react-dom';import{createRoot}from'react-dom/client';
let fixtureHost=new URLSearchParams(location.search).get('host')==='mcp'?'mcp':'dsh';let Pane;const roots=new Map();window.fetch=async()=>new Response('{}',{status:503});
const books=[];let binding=null;const chapters=[];const calls=[];const tourKey='moji:workbench:page-tour:v1';
const report=()=>{const out=document.getElementById('tour-audit');if(out)out.textContent=JSON.stringify({calls,books:books.length,preference:localStorage.getItem(tourKey),settings:localStorage.getItem('cuigengji:workbench:preferences:v1'),viewPreferences:Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('cuigengji:ui:')||key.startsWith('cuigengji:scroll:')||key.startsWith('cuigengji:camera:')))});};
const stats={words:0,chapters:0,goal:{target:0},rows:[],volumes:[]};
const rpc=async(action,args={})=>{calls.push(action);queueMicrotask(report);
 if(action==='connection.status')return{mode:'local',authenticated:false};
 if(action==='novel.list')return [...books];
 if(action==='binding.get')return binding;
 if(action==='novel.create'){const book={...args,id:'fixture-'+(books.length+1),revision:1,updatedAt:'2026-10-25T00:00:00Z'};books.push(book);document.getElementById('fixture-status').textContent='已创建 '+books.length+' 部测试作品：'+book.title;return book;}
 if(action==='binding.set'){binding={novelId:args.novelId};return binding;}
 if(action==='novel.get')return books.find(book=>book.id===args.novelId);
 if(action==='writing.stats.get')return stats;
 if(action==='writing.board.get')return{stats,chapters:[],planning:[],nodes:[],foreshadows:[],events:[]};
 if(action==='chapter.list')return chapters.filter(chapter=>chapter.novelId===args.novelId);
 if(action==='chapter.get')return{...chapters.find(chapter=>chapter.id===args.chapterId),nextStart:null};
 if(action==='chapter.history')return[];
 if(['volume.list','graph.list','edge.list','graph.groups','writing.relationshipType.list','writing.foreshadow.list','planning.groups','writing.link.list'].includes(action))return[];
 if(action==='story.get')return{state:emptyWorkspace(),sources:{chapters:[],volumes:[]},history:[],canRedo:false};
 if(action==='planning.list')return{items:[],edges:[],sequence:0,nextOffset:null};
 if(action==='planning.decorations')return{items:[],nextOffset:null};
 if(action==='planning.pages')return[{id:null,name:'主画布',nodeCount:0,decorationCount:0}];
 if(action==='transfer.catalog')return{books:[...books],bindings:binding?1:0};
 if(action==='transfer.snapshots')return[];
 throw new Error('Unexpected RPC '+action);
};
window.__ModuleLoader__={load({factory}){
 const plugin=factory(name=>name==='react'?React:name==='react/jsx-runtime'?jsx:name==='react-dom'?dom:(()=>{throw new Error('Unexpected host import '+name)})());
 const slots={inject:(name,fn)=>fn(),register:(definition,Component)=>{if(definition.name==='sidebar.right.pane.tab')Pane=Component;return()=>{};}};
 plugin.applyWithRPC({slots,effect:fn=>fn(),sidebarRightTabs:{register:()=>()=>{}},sidebarRight:{mounted:{},openResource(){}},workspaces:{list:{}},uiWorkspace:{openWorkspace(){}},layout:{selectPanel(){}},sessions:{list:{}}},rpc);
}};
window.mountMoji=(id='pane')=>{if(roots.has(id))return;const node=document.getElementById(id);node.hidden=false;const root=createRoot(node);roots.set(id,root);root.render(fixtureHost==='mcp'?<Workbench sessionId={'fixture-mcp:'+id} rpc={rpc}/>:<Pane useTabInfo={()=>({tab:{navigation:{address:'dsh-resource://cuigengji/'+id}}})}/>);};
window.unmountMoji=(id='pane')=>{roots.get(id)?.unmount();roots.delete(id);document.getElementById(id).hidden=true;};
document.getElementById('open').onclick=()=>window.mountMoji();document.getElementById('close').onclick=()=>window.unmountMoji();
document.getElementById('open2').onclick=()=>window.mountMoji('pane2');document.getElementById('close2').onclick=()=>window.unmountMoji('pane2');
document.getElementById('host-modal').onclick=()=>document.getElementById('host-dialog').showModal();
document.getElementById('audit').onclick=report;
document.getElementById('seed-blank').onclick=()=>{if(!binding)return;chapters.push({id:'blank-test',novelId:binding.novelId,title:'空白测试章',content:'',summary:'',volumeId:null,revision:1,order:0,wordCount:0,textCount:0,contentHash:'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',updatedAt:'2026-10-25T00:00:00Z'});window.unmountMoji();window.mountMoji();report();};
document.getElementById('existing').onclick=()=>{window.unmountMoji();books.push({id:'imported',title:'已导入的作品',revision:1});binding={novelId:'imported'};window.mountMoji();report();};
document.getElementById('reset-preferences').onclick=()=>{window.unmountMoji();for(const key of Object.keys(localStorage))if(key.startsWith('cuigengji:')||key===tourKey)localStorage.removeItem(key);window.mountMoji();report();};
document.getElementById('modules-off').onclick=()=>{window.unmountMoji();localStorage.setItem('cuigengji:workbench:preferences:v1',JSON.stringify({theme:'light',motion:'reduce',modules:{timeline:false,foreshadow:false,evolution:false,overview:false,pages:false,groups:false,summary:false}}));window.mountMoji();report();};
document.getElementById('reset-tour').onclick=()=>{localStorage.removeItem(tourKey);location.reload();};
document.getElementById('host-capability').value=fixtureHost;document.getElementById('host-capability').onchange=e=>{window.unmountMoji();fixtureHost=e.target.value;window.mountMoji();};
document.getElementById('width').onchange=e=>{document.getElementById('pane').style.width=e.target.value;document.getElementById('pane').style.flex='none';};
`},bundle:true,write:false,format:'iife',alias:{react:join(root,'node_modules/react'),'react-dom':join(root,'node_modules/react-dom')},loader:{'.png':'dataurl','.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"development"'}});
const bundle=await readFile(join(root,'lib/client.js'));
const html=`<!doctype html><html lang="zh" data-theme="dark" data-theme-preference="host-owned" data-backdrop-blur="true"><meta charset="utf-8"><style>
html{height:100%;color-scheme:dark;--dsw-alias-bg-base:transparent;--dsw-alias-label-primary:#f2f8ff}body{height:100%;margin:0;background:linear-gradient(140deg,#173c63 0%,#2e8c9c 38%,#ac9a67 65%,#345c52 100%);color:#f2f8ff;font:16px/1.7 system-ui}*{box-sizing:border-box}main{height:100%;display:flex;gap:16px;padding:24px}#conversation{flex:1;min-width:260px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}#conversation h1{font-size:22px}#pane,#pane2{width:48%;height:100%;min-width:0}#host-dialog::backdrop{background:#1234;backdrop-filter:blur(7px)}#host-dialog{background:#234;color:white}button{cursor:pointer}#conversation p{max-width:480px}
</style><body class="host-wallpaper"><main><section id="conversation"><h1>DSH 宿主 · 壁纸隔离回归</h1><p>这块区域属于宿主。打开、关闭墨叽，以及切换墨叽的浅色 / 深色主题，不应改变这里的壁纸、文字、主题变量或弹窗背景。</p><button id="open">打开墨叽</button> <button id="close">关闭墨叽</button><p><button id="open2">打开第二实例</button> <button id="close2">关闭第二实例</button> <button id="host-modal">宿主弹窗</button></p><label>宿主能力 <select id="host-capability"><option value="dsh">DSH 原生连接</option><option value="mcp">Codex / ChatGPT 云端</option></select></label><label>侧栏宽度 <select id="width"><option value="48%">自动</option><option value="320px">320px</option><option value="390px">390px</option><option value="400px">400px</option><option value="500px">500px</option><option value="600px">600px</option><option value="1000px">1000px</option></select></label><p><button id="existing">载入已有作品（模拟导入）</button> <button id="reset-preferences">重置测试偏好</button><button id="modules-off">模块全关闭（测试）</button> <button id="audit">查看导览审计</button> <button id="seed-blank">准备空白测试章节</button> <button id="reset-tour">重置测试导览</button></p><output id="tour-audit" style="display:block;font-size:10px;overflow-wrap:anywhere;max-width:420px;max-height:180px;overflow:auto"></output><output id="fixture-status">已创建 0 部测试作品</output><dialog id="host-dialog">宿主自己的弹窗</dialog></section><aside id="pane" hidden></aside><aside id="pane2" hidden></aside></main><script src="/host.js"></script><script src="/plugin.js"></script></body></html>`;
const fixture=join(shots,'fixture.html');
await writeFile(fixture,html.replace('<script src="/host.js"></script><script src="/plugin.js"></script>',()=>`<script>${host.outputFiles[0].text.replaceAll('</script','<\\/script')}</script><script>${bundle.toString().replaceAll('</script','<\\/script')}</script>`));
// A real nested viewport for mobile layout/screenshots, not a CSS-scaled approximation.
const previewHtml=await readFile(fixture,'utf8');
const standalone=previewHtml.replace('</style>','body{background:transparent}main{display:block;padding:0}#conversation{display:none}#pane{width:100%;height:100%}</style>').replace('</body>','<script>window.mountMoji();</script></body>');
await writeFile(join(shots,'standalone.html'),standalone);
await writeFile(join(shots,'review.html'),`<!doctype html><html lang="zh"><meta charset="utf-8"><style>body{margin:0;padding:16px;font:14px system-ui;background:#e8edf4}nav{display:flex;gap:12px;align-items:center;margin-bottom:16px}iframe{display:block;border:0;width:960px;height:720px;max-width:100%;margin:auto;background:white}</style><nav><label>预览宽度 <select id="device-width"><option value="960">桌面 960px</option><option value="600">600px</option><option value="390">手机 390px</option><option value="320">手机 320px</option></select></label><label>预览高度 <select id="device-height"><option value="720">720px</option><option value="620">620px</option><option value="480">480px</option></select></label><label>宿主能力 <select id="review-host"><option value="dsh">DSH 原生连接</option><option value="mcp">Codex / ChatGPT 云端</option></select></label><small>真实组件 · 合成数据</small></nav><iframe id="device" title="墨叽预览" src="standalone.html"></iframe><script>document.getElementById('review-host').onchange=e=>document.getElementById('device').src='standalone.html?host='+e.target.value;document.getElementById('device-width').onchange=e=>document.getElementById('device').style.width=e.target.value+'px';document.getElementById('device-height').onchange=e=>document.getElementById('device').style.height=e.target.value+'px';</script></html>`);
if(process.argv.includes('--fixture-only')){console.log(fixture);process.exit(0);}
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/'?'text/html; charset=utf-8':'text/javascript');res.end(req.url==='/host.js'?host.outputFiles[0].contents:req.url==='/plugin.js'?bundle:html);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/`;
if(process.argv.includes('--serve')){console.log(JSON.stringify({url,mode:'shipped native bundle, synthetic wallpaper host, no user data'}));await new Promise(()=>{});}
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900},colorScheme:'dark'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 // This test is offline: prevent automatic update checks from reaching any server.
 await page.route('https://**',route=>route.abort());await page.goto(url);
 const snapshot=()=>page.evaluate(()=>{
  const style=node=>{const s=getComputedStyle(node);return{background:s.background,color:s.color,colorScheme:s.colorScheme,base:s.getPropertyValue('--dsw-alias-bg-base'),label:s.getPropertyValue('--dsw-alias-label-primary')};};
  return{htmlAttributes:[...document.documentElement.attributes].map(a=>[a.name,a.value]),bodyAttributes:[...document.body.attributes].map(a=>[a.name,a.value]),html:style(document.documentElement),body:style(document.body),conversation:style(document.getElementById('conversation')),hostBackdrop:getComputedStyle(document.getElementById('host-dialog'),'::backdrop').backdropFilter};
 });
 const before=await snapshot();await page.screenshot({path:join(shots,'host-before.png')});
 await page.getByRole('button',{name:'打开墨叽',exact:true}).click();await expect(page.locator('#pane .cuigengji')).toBeVisible();await expect(page.getByRole('button',{name:'创建第一部作品',exact:true})).toBeVisible();
 await page.screenshot({path:join(shots,'host-open-system.png')});const opened=await snapshot();
 await writeFile(join(shots,'host-snapshots.json'),JSON.stringify({before,opened},null,2));
 assert.deepEqual(opened,before,'Mounting MoJi must not change host wallpaper, theme tokens, attributes, text or modal backdrop');
 const assertHost=async label=>assert.deepEqual(await snapshot(),before,label);
 const settings=async()=>{await page.locator('#pane').getByRole('button',{name:'工作台更多功能'}).click();await page.getByRole('button',{name:'设置',exact:true}).click();};
 for(const [label,scheme] of [['浅色','light'],['深色','dark'],['跟随系统','dark']]){
  await settings();await page.getByRole('radio',{name:label,exact:true}).click();
  assert.equal(await page.locator('#pane .cuigengji').evaluate(el=>getComputedStyle(el).colorScheme),scheme,`${label} applies within MoJi`);
  await assertHost(`${label} must not theme the host`);await page.getByRole('button',{name:'关闭设置',exact:true}).click();
  await page.screenshot({path:join(shots,`host-open-${label}.png`)});
 }
 // Plugin backdrop preferences must not restyle a host dialog, even while open.
 await settings();await page.getByRole('button',{name:'其他',exact:true}).click();await page.getByRole('checkbox',{name:/^背景模糊/}).check();
 assert.equal(await page.getByRole('dialog',{name:'设置',exact:true}).evaluate(el=>getComputedStyle(el,'::backdrop').backdropFilter),'blur(3px)');await assertHost('Backdrop blur stays inside MoJi');await page.keyboard.press('Escape');
 await page.evaluate(()=>document.getElementById('host-dialog').showModal());await assertHost('Host dialog keeps its own blur');await page.keyboard.press('Escape');
 // Native connection lives beside the workbench preference scope, but stays themed.
 await page.locator('#pane').getByRole('button',{name:'工作台更多功能'}).click();await page.getByRole('button',{name:'本地 / 云端',exact:true}).click();await expect(page.getByRole('dialog',{name:'本地 / 云端',exact:true})).toBeVisible();await page.keyboard.press('Escape');await assertHost('Native connection modal does not alter host');
 // Mount another instance, then close the first. Neither can mutate a shared html state.
 await page.evaluate(()=>window.mountMoji('pane2'));await expect(page.locator('#pane2 .cuigengji')).toBeVisible();await assertHost('Two instances leave host unchanged');await page.evaluate(()=>window.unmountMoji());await expect(page.locator('#pane2 .cuigengji')).toBeVisible();await assertHost('Closing one instance leaves host unchanged');await page.evaluate(()=>window.unmountMoji('pane2'));
 for(let i=0;i<3;i++){await page.evaluate(()=>window.mountMoji());await expect(page.locator('#pane .cuigengji')).toBeVisible();await assertHost(`Reopen ${i}`);await page.evaluate(()=>window.unmountMoji());await assertHost(`Close ${i}`);}
 await page.screenshot({path:join(shots,'host-after-close.png')});assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,shippedBundle:true,checks:['host wallpaper/tokens/attributes untouched','system/light/dark themes','plugin and host dialog backdrop isolation','native connection dialog','multiple instances','three close/reopen cycles'],screenshots:shots}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
