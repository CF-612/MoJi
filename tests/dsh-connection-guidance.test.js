import test from 'node:test';import assert from 'node:assert/strict';
import {build} from 'esbuild';import {mkdtemp,writeFile,readFile} from 'node:fs/promises';import {join,resolve} from 'node:path';import {tmpdir} from 'node:os';import {pathToFileURL} from 'node:url';
import {sendMcpDeployment} from '../integrations/chatgpt-workbench/client/deployment-agent.mjs';
import {sendNativeReference} from '../src/client/native-reference.js';
import {cloudDeploymentPrompt} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/cloud-deployment-prompt.mjs';
test('MCP deployment uses current conversation text only, checks capability and refusal',async()=>{
 let calls=[];const app={getHostCapabilities:()=>({message:{text:{}}}),sendMessage:async value=>{calls.push(value);return {};}};
 assert.match(await sendMcpDeployment(app,cloudDeploymentPrompt),/已交给/);assert.deepEqual(calls,[{role:'user',content:[{type:'text',text:cloudDeploymentPrompt}]}]);
 await assert.rejects(sendMcpDeployment({...app,getHostCapabilities:()=>({})},'x'),/未提供/);assert.equal(calls.length,1);
 await assert.rejects(sendMcpDeployment({...app,sendMessage:async()=>({isError:true})},'x'),/拒绝/);
 await assert.rejects(sendMcpDeployment({...app,sendMessage:async()=>{throw new Error('断连');}},'x'),/断连/);
});
test('DSH deployment uses exact current session and propagates errors without starting another task',async()=>{
 let sent,session;const ctx={sessions:{using:async(id,options,fn)=>{session=id;await fn({ready:Promise.resolve(),binding:{ctx:{conversation:{send:async text=>{sent=text;}}}}});}},conversation:{},layout:{selectPanel(){}}};
 await sendNativeReference(ctx,'current-session',cloudDeploymentPrompt);assert.equal(session,'current-session');assert.equal(sent,cloudDeploymentPrompt);
 await assert.rejects(sendNativeReference({},'id','x'),/未提供/);
 const failure={...ctx,sessions:{using:async()=>{throw new Error('会话不可用');}}};await assert.rejects(sendNativeReference(failure,'id','x'),/会话不可用/);
});
test('deployment prompt is current, generic and requires separate resource and migration approval',()=>{
 assert.match(cloudDeploymentPrompt,/blob\/moji-release\/docs\/cloud-agent-deployment.md/);assert.match(cloudDeploymentPrompt,/实际资源变更前请让我明确确认/);assert.match(cloudDeploymentPrompt,/本机作品不会自动上传或同步/);assert.match(cloudDeploymentPrompt,/不在聊天里索要密码/);assert.doesNotMatch(cloudDeploymentPrompt,/v31|\/workspace\/|\/home\/|Bearer/);
});
test('real card and guide components gate host capabilities, show status and render copy fallback',async()=>{
 const result=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`import React from 'react';import {renderToStaticMarkup as render} from 'react-dom/server';import {DshConnectionCard,DshConnectionContext} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/dsh-connection.tsx';import {CloudDeploymentGuide,DeploymentAgentContext} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/CloudDeploymentGuide.tsx';export const absent=render(<DshConnectionCard/>);export const local=render(<DshConnectionContext.Provider value={{status:'当前：本地保存',open(){}}}><DshConnectionCard/></DshConnectionContext.Provider>);export const cloud=render(<DshConnectionContext.Provider value={{status:'个人云端 · 已连接',open(){}}}><DshConnectionCard/></DshConnectionContext.Provider>);export const fallback=render(<DeploymentAgentContext.Provider value={{host:'mcp',send:null}}><CloudDeploymentGuide/></DeploymentAgentContext.Provider>);export const supported=render(<DeploymentAgentContext.Provider value={{host:'mcp',send:async()=>''}}><CloudDeploymentGuide/></DeploymentAgentContext.Provider>);`},bundle:true,write:false,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl','.jpg':'dataurl'}});
 const dir=await mkdtemp(resolve('.test-runtime/deployment-render-')),file=join(dir,'fixture.mjs');await writeFile(file,result.outputFiles[0].text);const output=await import(pathToFileURL(file));assert.equal(output.absent,'');assert.match(output.local,/当前：本地保存/);assert.match(output.local,/aria-label="本地 \/ 云端"/);assert.match(output.cloud,/个人云端 · 已连接/);assert.match(output.fallback,/复制部署提示词/);assert.doesNotMatch(output.fallback,/发送部署提示词给当前 Agent/);assert.match(output.supported,/发送部署提示词给当前 Agent/);
 const source=await readFile('src/client/native-connection.tsx','utf8');assert.doesNotMatch(source,/moji-connection-trigger/);assert.match(source,/!showWorkbench&&<nav/);assert.match(source,/不会自动迁移/);
});

test('workbench More panel gives every action a coherent compact card without a connection hero',async()=>{
 const {workbenchMenuStyles}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/workbench-menu-style.ts');
 assert.match(workbenchMenuStyles,/workbench-more-options>button\{[^}]*min-height:70px/);
 assert.match(workbenchMenuStyles,/border:1px solid var\(--cg-line\)/);
 assert.match(workbenchMenuStyles,/workbench-menu-icon\{[^}]*width:34px;height:34px/);
 assert.doesNotMatch(workbenchMenuStyles,/#2867d9|--mn-blue/);
 const header=await readFile('integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/WorkbenchHeader.tsx','utf8');
 assert.match(header,/workbench-more-options/);assert.match(header,/<MenuRow icon="refresh" navigation=\{false\}/);assert.match(header,/navigation&&<span className="workbench-menu-arrow"/);assert.match(header,/<MenuRow icon="settings"/);assert.match(header,/<MenuRow icon="about"/);
});
