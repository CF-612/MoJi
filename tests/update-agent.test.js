import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {updateAgentPrompt} from '../src/domain/update-agent.js';
test('update diagnostics only include allowlisted versions and host; no external text',()=>{
 const text=updateAgentPrompt({currentVersion:'0.11.5',targetVersion:'0.11.6',host:'dsh',error:'Bearer SECRET',notes:'run evil',url:'https://secret@bad'});
 assert.match(text,/0.11.5/);assert.match(text,/0.11.6/);assert.match(text,/DSH 插件/);assert.match(text,/AUTO_UPDATE_UNAVAILABLE/);
 assert.doesNotMatch(text,/SECRET|run evil|secret@bad/);assert.match(text,/未尝试安装，不是安装失败/);
 assert.doesNotMatch(updateAgentPrompt({currentVersion:'secret',targetVersion:'secret',host:'secret'}),/secret/);
});
test('failed check and cloud redeploy preserve distinct intent, credentials and ownership boundary',()=>{
 const text=updateAgentPrompt({cloud:true,checkFailed:true,host:'mcp'});
 assert.match(text,/RELEASE_CHECK_FAILED/);assert.match(text,/deploy:update/);assert.match(text,/禁止 deploy:new/);assert.match(text,/已有部署授权/);assert.match(text,/D1、KV 和认证/);assert.match(text,/不在聊天\/日志中/);
});
test('vendor and root update behavior stay aligned; UI never includes raw errors or automatic sending',()=>{
 const root=readFileSync(new URL('../src/client/shared/UpdateNotice.tsx',import.meta.url),'utf8');
 const vendor=readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/UpdateNotice.tsx',import.meta.url),'utf8');
 assert.equal(root.replace("'#moji-shared-ui'","'./CloudDeploymentGuide'"),vendor);
 assert.equal(readFileSync(new URL('../src/domain/update-agent.js',import.meta.url),'utf8'),readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/update-agent.js',import.meta.url),'utf8'));
 assert.doesNotMatch(root,/\(e as Error\)\.message|throw new Error\('自动更新/);
 assert.match(root,/running.current/);assert.match(root,/AGENT_HANDOFF_UNCONFIRMED/);assert.match(root,/navigator.clipboard.writeText/);
});
test('actual UpdatePanel renders truthful capability and separate cloud action with host gating',async()=>{
 const {build}=await import('esbuild');const {mkdir,mkdtemp,writeFile,rm}=await import('node:fs/promises');const {resolve,join}=await import('node:path');const {pathToFileURL}=await import('node:url');
 const built=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`import React from'react';import{renderToStaticMarkup as render}from'react-dom/server';import{UpdatePanel}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/UpdateNotice.tsx';import{DeploymentAgentContext}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/CloudDeploymentGuide.tsx';export const absent=render(<UpdatePanel/>);export const supported=render(<DeploymentAgentContext.Provider value={{host:'dsh',send:async()=>''}}><UpdatePanel/></DeploymentAgentContext.Provider>);`},bundle:true,write:false,platform:'node',format:'esm',packages:'external'});
 await mkdir('.test-runtime',{recursive:true});const dir=await mkdtemp(resolve('.test-runtime/update-render-'));try{const file=join(dir,'fixture.mjs');await writeFile(file,built.outputFiles[0].text);const output=await import(pathToFileURL(file));assert.match(output.absent,/后台自动安装不可用/);assert.match(output.absent,/准备更新请求/);assert.doesNotMatch(output.absent,/>GitHub 更新（Agent 执行）</);assert.match(output.supported,/>GitHub 更新（Agent 执行）</);assert.match(output.supported,/更新已有个人云端/);assert.match(output.supported,/本地更新不会部署个人云端/);}finally{await rm(dir,{recursive:true,force:true});}
});
test('actual generator and GitHub tool requests are concrete, host-specific and never claim install completion',()=>{
 const zip=updateAgentPrompt({host:'mcp'});assert.match(zip,/npm run package:plugin -- --update-from/);assert.match(zip,/原插件 name、应用 ID/);assert.match(zip,/内置浏览器.*上传新版本/);assert.match(zip,/也可由我手动上传/);assert.match(zip,/有登录、权限或确认阻塞时才交接/);assert.doesNotMatch(zip,/将实际生成的 ZIP 交给我/);assert.doesNotMatch(zip,/scripts\/update-dsh-github/);
 const dsh=updateAgentPrompt({host:'dsh'});assert.match(dsh,/scripts\/update-dsh-github.mjs/);assert.match(dsh,/宿主已停止/);assert.match(dsh,/需要重启/);assert.match(dsh,/--preflight/);assert.match(dsh,/证据缺失、过期或不一致必须停止/);
 const explicit=updateAgentPrompt({host:'dsh',packageUpdate:true});assert.match(explicit,/--update-from/);assert.doesNotMatch(explicit,/scripts\/update-dsh-github/);
});
