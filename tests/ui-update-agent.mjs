import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
test('update UI distinguishes unsupported/check failure, gates sends, prevents duplicate clicks and copies fallback',async()=>{
 const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`import React from 'react';import{createRoot}from'react-dom/client';import{UpdatePanel}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/UpdateNotice.tsx';import{DeploymentAgentContext}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/CloudDeploymentGuide.tsx';window.calls=[];const mode=new URLSearchParams(location.search).get('mode');createRoot(document.getElementById('root')).render(<DeploymentAgentContext.Provider value={{host:'dsh',send:mode==='absent'?null:async text=>{window.calls.push(text);await new Promise(r=>setTimeout(r,150));if(mode==='fail')throw Error('SECRET');return 'ok';}}}><UpdatePanel/></DeploymentAgentContext.Provider>);`},bundle:true,write:false,platform:'browser',format:'iife',alias:{react:new URL('../node_modules/react',import.meta.url).pathname,'react-dom':new URL('../node_modules/react-dom',import.meta.url).pathname},define:{'process.env.NODE_ENV':'"production"'}});
 const browser=await chromium.launch({headless:true,executablePath:process.env.MOJI_TEST_CHROMIUM});
 const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<div id="root"></div><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{
 const page=await browser.newPage();const url=`http://127.0.0.1:${server.address().port}`;
 await page.route('https://raw.githubusercontent.com/**',route=>route.abort());
 await page.goto(url+'?mode=absent');await page.getByRole('button',{name:'准备更新请求',exact:true}).click();assert.match(await page.getByLabel('墨叽更新请求').inputValue(),/AUTO_UPDATE_UNAVAILABLE/);assert.equal(await page.evaluate(()=>window.calls.length),0);
 await page.getByRole('button',{name:'收起',exact:true}).click();assert.equal(await page.getByLabel('墨叽更新请求').count(),0);
 await page.getByRole('button',{name:'检查更新',exact:true}).click();await page.getByText('暂时无法检查更新（RELEASE_CHECK_FAILED）',{exact:false}).waitFor();await page.getByRole('button',{name:'准备更新请求',exact:true}).click();assert.match(await page.getByLabel('墨叽更新请求').inputValue(),/RELEASE_CHECK_FAILED/);
 await page.goto(url+'?mode=fail');await page.getByRole('button',{name:'GitHub 更新（Agent 执行）',exact:true}).dblclick();await page.getByText('未能确认发送（AGENT_HANDOFF_UNCONFIRMED）',{exact:false}).waitFor();assert.equal(await page.evaluate(()=>window.calls.length),1);assert.doesNotMatch(await page.locator('body').innerText(),/SECRET/);
 await page.goto(url+'?mode=ok');await page.getByRole('button',{name:'更新已有个人云端',exact:true}).click();await page.getByText('更新请求已交给当前 Agent；尚未确认更新完成。',{exact:true}).waitFor();assert.match(await page.evaluate(()=>window.calls[0]),/deploy:update/);assert.equal(await page.evaluate(()=>window.calls.length),1);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
