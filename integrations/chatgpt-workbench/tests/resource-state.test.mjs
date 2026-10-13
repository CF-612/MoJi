import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});
const folder=await mkdtemp(join(root,'resource-state-')),output=join(folder,'ui.mjs');
await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/shared/ui.jsx')],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
const {ResourceState}=await import(pathToFileURL(output));
const render=value=>renderToStaticMarkup(React.createElement(ResourceState,{resource:{value,error:'连接暂时中断',loading:false,retry(){}}},React.createElement('p',null,value?'原有资料':'添加第一张角色卡')));
test('初次读取失败不能显示空库引导，保留可重试入口',()=>{
  const html=render(null);assert.match(html,/连接暂时中断/);assert.match(html,/重试/);assert.doesNotMatch(html,/添加第一张角色卡/);
});
test('后台刷新失败仍显示原有资料',()=>assert.match(render(['原有资料']),/原有资料/));
