import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {runInNewContext} from 'node:vm';

const source=await readFile(new URL('../vendor/cuigengji/src/client/shared/ui.jsx',import.meta.url),'utf8');
const code=(await transform(source.replace("import React from 'react';",'').replaceAll('export function','function'),{loader:'jsx'})).code;
const ResourceState=runInNewContext(code+'ResourceState;',{React});
const render=value=>renderToStaticMarkup(React.createElement(ResourceState,{resource:{value,error:'连接暂时中断',loading:false,retry(){}}},React.createElement('p',null,value?'原有资料':'添加第一张角色卡')));
test('初次读取失败不能显示空库引导，保留可重试入口',()=>{
  const html=render(null);assert.match(html,/连接暂时中断/);assert.match(html,/重试/);assert.doesNotMatch(html,/添加第一张角色卡/);
});
test('后台刷新失败仍显示原有资料',()=>assert.match(render(['原有资料']),/原有资料/));
