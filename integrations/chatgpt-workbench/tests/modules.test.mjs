import test from 'node:test';import assert from 'node:assert/strict';
import {modules,normalizeModules,toggleModule,profileModules,navigationModules,pageAvailable} from '../vendor/cuigengji/src/client/modules/registry.mjs';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {build} from 'esbuild';import {mkdir,mkdtemp} from 'node:fs/promises';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';
const dir=resolve(import.meta.dirname,'../.data/tests');await mkdir(dir,{recursive:true});const output=join(await mkdtemp(join(dir,'modules-render-')),'ui.mjs');
await build({stdin:{contents:"export {DshConnectionContext} from './shared/dsh-connection.tsx';export {WorkbenchHeader} from './shared/WorkbenchHeader.tsx';export {ModuleSettings} from './modules/index.tsx';export {ModuleContext} from './modules/context.tsx';export {PreferencesProvider,useWorkbenchPreferences} from './shared/preferences.tsx';",resolveDir:resolve(import.meta.dirname,'../vendor/cuigengji/src/client'),loader:'tsx'},outfile:output,bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'}});const ui=await import(pathToFileURL(output));
test('所有模块默认开启；极简仍可主动选择；正文不受模块设置影响',()=>{for(const {id} of modules)assert.equal(normalizeModules()[id],true);assert.equal(normalizeModules({summary:true}).summary,true);assert.deepEqual(navigationModules(profileModules('minimal')),[]);assert.equal(pageAvailable('chapters',profileModules('minimal')),true);assert.equal(pageAvailable('timeline',profileModules('minimal')),false);assert.equal(new Set(modules.map(m=>m.id)).size,modules.length);});
test('开启关系演变带上时间线，关闭依赖同步隐藏关系演变；拒绝陌生配置字段',()=>{let m=toggleModule(profileModules('minimal'),'evolution',true);assert.equal(m.timeline,true);assert.equal(m.evolution,true);m=toggleModule(m,'timeline',false);assert.equal(m.evolution,false);assert.equal('unknown' in normalizeModules({unknown:true}),false);assert.equal(normalizeModules({timeline:'false'}).timeline,true);});
test('详情承载仪表盘，单行导航保留正文规划资料和管理入口',()=>{const props={novelTitle:'虚构作品',tab:'chapters'};const render=id=>renderToStaticMarkup(React.createElement(ui.ModuleContext.Provider,{value:profileModules(id)},React.createElement(ui.WorkbenchHeader,props)));for(const html of [render('minimal'),render('complete')]){assert.match(html,/详情/);assert.doesNotMatch(html,/>仪表盘<\/button>|>时间线<\/button>/);assert.ok(html.indexOf('正文')<html.indexOf('规划'));assert.match(html,/资料/);assert.match(html,/工作台更多功能/);}});
test('设置七个模块默认全部勾选并保留数据说明',()=>{const html=renderToStaticMarkup(React.createElement(ui.ModuleSettings));assert.equal((html.match(/type="checkbox"/g)||[]).length,7);assert.equal((html.match(/checked=""/g)||[]).length,7);assert.match(html,/显示Summary 本章梗概/);assert.match(html,/隐藏不删除资料/);assert.match(html,/AI 工具仍可读写/);for(const p of ['极简','标准','完整'])assert.match(html,new RegExp(p));});

test('旧偏好缺项默认开启，逐项显式关闭及保存重载不会被升级重置',()=>{
 for(const {id} of modules){
  const normalized=normalizeModules({[id]:false});
  assert.equal(normalized[id],false,id);
  assert.deepEqual(normalizeModules(JSON.parse(JSON.stringify(normalized))),normalized);
  for(const module of modules)if(module.id!==id&&!module.dependencies.includes(id))assert.equal(normalized[module.id],true,module.id);
 }
 const partial=normalizeModules({summary:false,groups:false});
 assert.equal(partial.summary,false);assert.equal(partial.groups,false);assert.equal(partial.pages,true);
 assert.deepEqual(normalizeModules(profileModules('minimal')),profileModules('minimal'));
 assert.equal(normalizeModules({timeline:false,evolution:true}).timeline,false);
 assert.equal(normalizeModules({timeline:false,evolution:true}).evolution,false);
 const enabled=toggleModule({timeline:false},'evolution',true);
 assert.equal(enabled.timeline,true);assert.equal(enabled.evolution,true);
});

test('实际偏好加载：新设备全开，旧保存缺项全开，显式关闭保留且不改其他偏好',()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 let stored;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>stored}});
 try{
  let actual;
  function Probe(){actual=ui.useWorkbenchPreferences().preferences;return null;}
  const load=()=>renderToStaticMarkup(React.createElement(ui.PreferencesProvider,null,React.createElement(Probe)));
  stored=null;load();assert.deepEqual(actual.modules,profileModules('complete'));
  stored=JSON.stringify({theme:'dark',motion:'reduce',directory:false,modules:{summary:false,timeline:false}});load();
  assert.equal(actual.modules.summary,false);assert.equal(actual.modules.timeline,false);assert.equal(actual.modules.evolution,false);
  for(const id of ['pages','groups','overview','foreshadow'])assert.equal(actual.modules[id],true);
  assert.equal(actual.theme,'dark');assert.equal(actual.motion,'reduce');assert.equal(actual.directory,false);
  const saved=actual;stored=JSON.stringify(saved);load();assert.deepEqual(actual,saved);
 }finally{if(old)Object.defineProperty(globalThis,'localStorage',old);else delete globalThis.localStorage;}
});

test('connection capability, not viewport or UA, controls the menu; embedded hosts start with Settings',()=>{
 const props={novelTitle:'合成作品',tab:'detail',onSearch:()=>{},tourMenuOpen:true};
 const render=connection=>renderToStaticMarkup(React.createElement(ui.DshConnectionContext.Provider,{value:connection},React.createElement(ui.WorkbenchHeader,props)));
 const dsh=render({status:'当前：本地保存',open:()=>{}}),embedded=render(null);
 assert.ok(dsh.indexOf('aria-label="本地 / 云端"')<dsh.indexOf('aria-label="设置"'));
 assert.ok(dsh.indexOf('aria-label="设置"')<dsh.indexOf('aria-label="搜索作品"'));
 assert.doesNotMatch(embedded,/aria-label="本地 \/ 云端"/);assert.ok(embedded.indexOf('aria-label="设置"')<embedded.indexOf('aria-label="搜索作品"'));
});
