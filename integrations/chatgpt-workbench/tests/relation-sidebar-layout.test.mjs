import test from 'node:test';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {timelineRelationsStyle} from '../vendor/cuigengji/src/client/features/planning/timeline-relations-style.mjs';
import {storyAxisStyle} from '../vendor/cuigengji/src/client/features/planning/story-axis-style.mjs';
import {timelineInteractionStyle} from '../vendor/cuigengji/src/client/features/planning/timeline-interaction-style.mjs';
const {outputFiles}=await build({stdin:{resolveDir:fileURLToPath(new URL('../',import.meta.url)),loader:'jsx',contents:`
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {StoryTimeAxis} from './vendor/cuigengji/src/client/features/planning/StoryTimeAxis.jsx';
const axis={schemaVersion:1,calendar:{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor:{coordinate:739617,label:'第一章'},coordinateUnit:'day',primaryTick:{unit:'year',step:1},tracks:[{id:'t',name:'明线',color:'#778899',side:'above'}],markers:[]};
export function render(evolution=true,relationTarget=null){return renderToStaticMarkup(<StoryTimeAxis state={{revision:1,storyAxis:axis,cards:{}}} sources={{chapters:[]}} people={[]} relationTarget={relationTarget} relations={[]} evolution={evolution} relationClock={{setMode(){}}} novelId="sidebar-regression" save={async()=>true}/>);}
`},bundle:true,write:false,format:'iife',globalName:'SidebarTest',platform:'node',loader:{'.png':'dataurl'}});
const {render}=new Function('require',outputFiles[0].text+';return SidebarTest;')(createRequire(import.meta.url));
test('故事轴与真实人物关系图同时保留在组件树，不以切页卸载',()=>{
 for(const target of [null,{}]){const html=render(true,target);assert.match(html,/class="timeline-workspace-column sa-axis-column"/);assert.match(html,/class="sa-relations-region"/);assert.match(html,/class="u-relation-network[^"]*"/);assert.match(html,/人物关系演变/);assert.match(html,/aria-label="情节与待安排"/);}
});
test('未启用演化时只渲染故事轴，没有幽灵侧栏或切页入口',()=>{
 const html=render(false);assert.match(html,/class="timeline-workspace-column sa-axis-column"/);assert.doesNotMatch(html,/class="sa-relations-region"/);assert.doesNotMatch(html,/aria-label="故事时间内容"/);
});
test('两种时间线均以具名内容容器900px为断点，宽屏规则可覆盖切页状态',()=>{
 assert.match(storyAxisStyle,/@container story-workspace \(min-width:900px\)/);assert.match(timelineInteractionStyle,/@container narrative-workspace \(min-width:900px\)/);
 assert.match(storyAxisStyle,/\.sa-has-relations \.sa-workspace>\.sa-axis-column\{display:flex\}/);
 assert.match(timelineInteractionStyle,/\.cuigengji \.relation-view \.u-timeline-grid>\.u-timeline-column\{display:flex\}/);
 assert.match(storyAxisStyle,/\.sa-workspace>\.sa-relations-region\{display:none;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain/);
});

test('独立故事页加载关系图布局样式，宽屏标签隐藏高于全局nav',()=>{
 assert.match(timelineRelationsStyle,/\.u-network-heading\{display:flex/);
 assert.match(timelineRelationsStyle,/\.u-network-tools\{display:flex/);
 assert.match(timelineRelationsStyle,/\.u-relation-network>svg\{display:block/);
 assert.doesNotMatch(timelineInteractionStyle,/\.u-network-tools\{display:flex/);
 assert.match(storyAxisStyle,/\.cuigengji \.story-axis>\.sa-content-switch\{display:none\}/);
 assert.match(timelineRelationsStyle,/@container story-workspace \(min-width:900px\)/);
});
