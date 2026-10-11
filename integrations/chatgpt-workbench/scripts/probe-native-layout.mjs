import {createServer} from 'node:http';
import {readFile,mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createService} from '../server/service.mjs';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const runtimeModules=process.env.CUIGENGJI_TEST_NODE_MODULES||'C:/Users/fangcheng612/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=await import(pathToFileURL(resolve(runtimeModules,'playwright/index.mjs')).href);
await mkdir(resolve(root,'.data/tests'),{recursive:true});
const data=await mkdtemp(resolve(root,'.data/tests/native-layout-'));
const service=await createService(data);
const inline=process.argv.includes('--inline');
const mobile=process.argv.includes('--mobile');
const hostWidth=mobile?390:480;
const frameHtml=(await readFile(resolve(root,'dist/workbench-dev.html'),'utf8')).replace('<html ','<html data-mcp-app="true" ');
const hostHtml=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}.layout{display:flex;height:760px;${mobile?'flex-direction:column;':''}}.chat{flex:${mobile?'none':'1'};overflow:auto;padding:16px}.sidebar{width:${hostWidth}px;overflow:auto}iframe{display:block;width:100%;height:600px;border:0}</style></head><body><div class="layout"><section class="chat"><p id="chat-text">聊天正文必须可见</p></section><aside class="sidebar"><iframe src="/frame"></iframe></aside></div><script>
window.probe={sizes:[],calls:[],errors:[]};const iframe=document.querySelector('iframe');
addEventListener('error',event=>probe.errors.push(event.message));
addEventListener('message',async event=>{
 if(event.source!==iframe.contentWindow)return;const m=event.data;if(!m||m.jsonrpc!=='2.0')return;
 const send=result=>event.source.postMessage({jsonrpc:'2.0',id:m.id,result},'*');
 if(m.method==='ui/initialize')send({protocolVersion:m.params.protocolVersion,hostInfo:{name:'isolated-layout-host',version:'1.0.0'},hostCapabilities:{serverTools:{},openLinks:{}},hostContext:{displayMode:${JSON.stringify(inline?'inline':'fullscreen')},theme:'light',platform:${JSON.stringify(mobile?'mobile':'desktop')},containerDimensions:{width:${hostWidth},height:600}}});
 else if(m.method==='ui/notifications/initialized')event.source.postMessage({jsonrpc:'2.0',method:'ui/notifications/tool-result',params:{content:[],structuredContent:{result:{contextId:'layout-probe'}}}},'*');
 else if(m.method==='ui/notifications/size-changed'){probe.sizes.push(m.params);iframe.style.height=Math.min(m.params.height,20000)+'px';}
 else if(m.method==='tools/call'){probe.calls.push(m.params.name);const response=await fetch('/rpc',{method:'POST',body:JSON.stringify(m.params)});send(await response.json());}
 else if(m.method==='ui/request-display-mode'){iframe.style.height='600px';event.source.postMessage({jsonrpc:'2.0',method:'ui/notifications/host-context-changed',params:{displayMode:m.params.mode,containerDimensions:{width:${hostWidth},height:600}}},'*');send({mode:m.params.mode});}
 else if(m.id!==undefined)send({});
});</script></body></html>`;
const server=createServer(async(req,res)=>{
 try{
  if(req.url==='/host'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(hostHtml);}
  else if(req.url==='/frame'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(frameHtml);}
  else if(req.url==='/rpc'){
   let body='';for await(const chunk of req)body+=chunk;
   const {name,arguments:args}=JSON.parse(body);
   const result=name==='workbench_bootstrap'?await service.bootstrap(args.sessionId):await service.rpc(args.action,args.args||{},args.sessionId,'human');
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({content:[{type:'text',text:JSON.stringify(result)}],structuredContent:{result}}));
  }else res.writeHead(404).end();
 }catch(error){res.end(JSON.stringify({isError:true,content:[{type:'text',text:error.message}]}));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CUIGENGJI_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/host`);
 const frame=page.frameLocator('iframe');
 const before={};
 if(inline){
   await frame.getByRole('button',{name:'展开侧栏工作台'}).waitFor();
   before.summary=await page.frames()[1].locator('.native-summary').count();
   before.workbench=await page.frames()[1].locator('.cuigengji').count();
   before.height=await page.locator('iframe').evaluate(el=>el.getBoundingClientRect().height);
   const expand=frame.getByRole('button',{name:'展开侧栏工作台'});if(mobile)await expand.tap();else await expand.click();
 }
 await frame.locator('.cuigengji').waitFor({state:'attached',timeout:10000}).catch(error=>errors.push(error.message));
 const chapter=frame.getByText('第一章 雨夜来信',{exact:true});if(mobile)await chapter.tap();else await chapter.click();
 await page.waitForTimeout(2500);
 const report=await page.evaluate(()=>({...probe,frameHeight:document.querySelector('iframe').getBoundingClientRect().height,chatVisible:document.querySelector('#chat-text').checkVisibility()}));
 report.frameErrors=errors;
 report.inlineBeforeExpand=inline?before:null;
 report.frameLayout=await page.frames()[1].evaluate(()=>({text:document.body.innerText.slice(0,300),root:document.querySelector('#root').getBoundingClientRect().height,body:document.body.getBoundingClientRect().height,scroll:document.documentElement.scrollHeight,viewport:innerHeight,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,touch:matchMedia('(pointer:coarse)').matches}));
 const suffix=`${mobile?'mobile-390-':''}${inline?'inline':'fullscreen'}`;
 await page.screenshot({path:resolve(root,`qa/native-layout-${suffix}.png`)});
 await writeFile(resolve(root,`qa/native-layout-${suffix}.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
 if(process.argv.includes('--check')){
   assert.equal(report.sizes.length,inline?1:0,'侧栏不应收到自动尺寸通知；聊天内仅发一次固定卡片高度');
   if(inline){assert.deepEqual(before,{summary:1,workbench:0,height:160});assert.equal(report.sizes[0].height,160);}
   assert.equal(report.frameHeight,600,'工作台必须保留宿主分配的高度');
   assert.equal(report.chatVisible,true);
   assert.equal(report.frameErrors.length,0);
   assert.ok(report.frameLayout.scrollWidth<=report.frameLayout.width,'工作台不应造成整个页面横向溢出');
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
