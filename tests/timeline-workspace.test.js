import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {buildSync} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url);
function load(file){const compiled=buildSync({entryPoints:[new URL(file,base).pathname],bundle:true,write:false,platform:'node',format:'cjs',external:['react']}).outputFiles[0].text;const module={exports:{}};new Function('require','module','exports',compiled)(createRequire(import.meta.url),module,module.exports);return module.exports;}
const {TimelineWorkspace}=load('TimelineWorkspace.jsx'),{TimelineTray}=load('TimelineTray.jsx');
const el=React.createElement;
test('shared workspace renders position, axis, pending tray and relations in a single structure',()=>{
 const html=renderToStaticMarkup(el(TimelineWorkspace,{positionLabel:'当前时刻',positionHint:'尺度信息',tray:el('aside',null,'待安排内容'),divider:el('button',null,'关系折叠'),relations:el('aside',null,'关系内容'),editor:el('form',null,'编辑内容')},el('div',null,'时间线主体')));
 assert.match(html,/aria-label="情节与待安排"/);
 assert.ok(html.indexOf('当前时刻')<html.indexOf('时间线主体'));
 assert.ok(html.indexOf('时间线主体')<html.indexOf('待安排内容'));
 assert.ok(html.indexOf('待安排内容')<html.indexOf('关系内容'));
 assert.match(html,/class="u-timeline-editor-region"/);
});
test('pending tray uses the same controlled collapse and compact empty state for both axes',()=>{
 const closed=renderToStaticMarkup(el(TimelineTray,{open:false,count:1},el('article',null,'剧情卡')));
 assert.match(closed,/aria-expanded="false"/);assert.ok(!closed.includes('剧情卡'));
 const empty=renderToStaticMarkup(el(TimelineTray,{open:true,count:0}));
 assert.match(empty,/aria-expanded="true"/);assert.match(empty,/都已安排妥当/);
});
test('pending tray preserves drop target and saving feedback without creating content',()=>{
 const html=renderToStaticMarkup(el(TimelineTray,{open:true,count:1,canReceive:true,returning:true,saving:true},el('article',null,'原剧情卡')));
 assert.match(html,/can-receive drop-target/);assert.match(html,/正在移回…/);assert.match(html,/原剧情卡/);
});
