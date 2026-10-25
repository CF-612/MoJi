import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const base=resolve('integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared');
await mkdir('.test-runtime',{recursive:true});
const dir=await mkdtemp(resolve('.test-runtime/workbench-menu-'));
after(()=>rm(dir,{recursive:true,force:true}));
// Expose the sheet body for server rendering; all menu entries and host contexts are real.
const result=await build({stdin:{resolveDir:base,contents:`
 export {WorkbenchHeader} from './WorkbenchHeader.tsx';
 export {DshConnectionContext} from './dsh-connection.tsx';
 export {DeploymentAgentContext} from './CloudDeploymentGuide.tsx';
 export {getSheetProps} from './ToolSheet.tsx';
`},bundle:true,write:false,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'},plugins:[{
 name:'expose-sheet-body',setup(build){build.onLoad({filter:/[/\\]ToolSheet\.tsx$/},()=>({loader:'tsx',contents:`
 let sheetProps;
 export const getSheetProps=()=>sheetProps;
 export function ToolSheet(props){sheetProps=props;return props.children;}
 `}));},
}]});
const file=join(dir,'menu.mjs');await writeFile(file,result.outputFiles[0].text);
const ui=await import(pathToFileURL(file));
const noop=()=>{};
function renderMenu({dsh=false,deployment=false,...overrides}={}){
 const props={home:false,novelTitle:'测试作品',tab:'chapters',busy:false,refreshing:false,onHome:noop,onTab:noop,onRefresh:noop,onSettings:noop,onAbout:noop,onSearch:noop,...overrides};
 const html=renderToStaticMarkup(React.createElement(ui.DshConnectionContext.Provider,{value:dsh?{status:'当前：本地保存',open:noop}:null},
   React.createElement(ui.DeploymentAgentContext.Provider,{value:deployment?{host:dsh?'dsh':'mcp',send:null}:null},React.createElement(ui.WorkbenchHeader,props))));
 const sheet=ui.getSheetProps(),items=sheet.children.props.children;
 const labels=[...html.matchAll(/<(?:button|section)\b[^>]*aria-label="([^"]+)"/g)].map(match=>match[1]).filter(label=>['本地 / 云端','连接与云端','搜索作品','刷新当前页面','写作要求','作品与备份','导入 / 导出','设置','关于墨叽'].includes(label));
 return {html,items,sheet,labels};
}

test('DSH keeps Settings second after Local/Cloud on both work and home screens',()=>{
 for(const deployment of [false,true]){
  assert.deepEqual(renderMenu({dsh:true,deployment}).labels,['本地 / 云端','设置','搜索作品','刷新当前页面','写作要求','作品与备份','关于墨叽']);
  assert.deepEqual(renderMenu({dsh:true,deployment,home:true}).labels,['本地 / 云端','设置','刷新当前页面','关于墨叽']);
 }
});

test('hosts without native connection capability start with Settings and keep all valid actions',()=>{
 assert.deepEqual(renderMenu().labels,['设置','搜索作品','刷新当前页面','写作要求','作品与备份','关于墨叽']);
 assert.deepEqual(renderMenu({home:true}).labels,['设置','刷新当前页面','关于墨叽']);
 assert.deepEqual(renderMenu({onSearch:undefined}).labels,['设置','刷新当前页面','写作要求','作品与备份','关于墨叽']);
 assert.deepEqual(renderMenu({novelTitle:''}).labels,['设置','刷新当前页面','关于墨叽']);
 assert.deepEqual(renderMenu({deployment:true}).labels,['设置','搜索作品','刷新当前页面','写作要求','作品与备份','关于墨叽']);
 assert.deepEqual(renderMenu({deployment:true,home:true}).labels,['设置','刷新当前页面','关于墨叽']);
});

test('reordered rows retain actions, dismiss behavior, disabled states and refresh without an arrow',()=>{
 const calls=[],{html,items,sheet}=renderMenu({dsh:true,onSettings:()=>calls.push('settings'),onSearch:()=>calls.push('search'),onRefresh:()=>calls.push('refresh'),onAbout:()=>calls.push('about'),onTab:tab=>calls.push(tab)});
 for(const key of ['settings','search','refresh','preset','manage','about'])items.find(item=>item.key===key).props.onClick();
 assert.deepEqual(calls,['settings','search','refresh','preset','manage','about']);
 assert.equal(sheet.dismissOnAction,true);
 const refreshButton=html.match(/<button\b[^>]*aria-label="刷新当前页面"[\s\S]*?<\/button>/)?.[0];
 assert.ok(refreshButton);assert.doesNotMatch(refreshButton,/workbench-menu-arrow/);
 const settingsButton=html.match(/<button\b[^>]*aria-label="设置"[\s\S]*?<\/button>/)?.[0];
 assert.match(settingsButton,/workbench-menu-arrow/);
 for(const state of [{busy:true},{refreshing:true}]){
  const current=renderMenu(state).items;
  assert.equal(current.find(item=>item.key==='refresh').props.disabled,true);
  assert.equal(current.find(item=>item.key==='search').props.disabled,!!state.busy);
 }
});

 test('embedded MCP hosts expose no cloud deployment controls and retain backups',()=>{
 const {html,items}=renderMenu({deployment:true});
 assert.doesNotMatch(html,/连接与云端|本地 \/ 云端|个人云端部署引导|发送部署提示词|复制部署提示词/);
 assert.ok(items.find(item=>item.key==='manage'));
 });


test('empty-library recovery actions live in More without adding page clutter',()=>{
 const calls=[],{items,labels,sheet}=renderMenu({home:true,novelTitle:'',onImport:()=>calls.push('import'),onManage:()=>calls.push('manage')});
 assert.deepEqual(labels,['设置','刷新当前页面','导入 / 导出','作品与备份','关于墨叽']);
 items.find(item=>item.key==='empty-import').props.onClick();
 items.find(item=>item.key==='empty-manage').props.onClick();
 assert.deepEqual(calls,['import','manage']);
 assert.equal(sheet.dismissOnAction,true);
 const busy=renderMenu({home:true,novelTitle:'',busy:true,onImport:noop,onManage:noop}).items;
 assert.equal(busy.find(item=>item.key==='empty-import').props.disabled,true);
 assert.equal(busy.find(item=>item.key==='empty-manage').props.disabled,true);
});
