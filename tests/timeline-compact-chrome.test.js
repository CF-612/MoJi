import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import {buildSync} from 'esbuild';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {timelineWorkspaceStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-workspace-style.mjs';
const base='integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/';
function load(file){const code=buildSync({entryPoints:[base+file],bundle:true,write:false,platform:'node',format:'cjs',external:['react']}).outputFiles[0].text,m={exports:{}};new Function('require','module','exports',code)(createRequire(import.meta.url),m,m.exports);return m.exports;}
const {TimelineToolbar}=load('TimelineToolbar.jsx'),{RelationSidebarDivider}=load('RelationSidebar.jsx');
test('narrow relationship action is inline toolbar; no reserved navigation row on timeline page',()=>{
 const html=renderToStaticMarkup(React.createElement(TimelineToolbar,{mode:'narration',onRelations:()=>{},selectionTools:React.createElement('button',null,'多选')}));assert.match(html,/class="timeline-toolbar-actions"><button[^>]*class="timeline-toolbar-relations"/);assert.match(html,/查看人物关系/);assert.match(html,/多选/);
 assert.equal(renderToStaticMarkup(React.createElement(RelationSidebarDivider,{sidebar:{layout:'pages',collapsed:true}})),'');
 const back=renderToStaticMarkup(React.createElement(RelationSidebarDivider,{sidebar:{layout:'pages',collapsed:false,toggle:()=>{},separator:{}}}));assert.match(back,/返回时间线/);
 const desktop=renderToStaticMarkup(React.createElement(RelationSidebarDivider,{sidebar:{layout:'wide',collapsed:true,toggle:()=>{},separator:{}}}));assert.match(desktop,/relation-sidebar-resize/);assert.match(desktop,/展开人物关系/);
});
test('both timeline projections use shared compact entry and move selection tools inside toolbar, without projection changes',()=>{
 for(const file of ['UnifiedTimeline.jsx','StoryTimeAxis.jsx']){const source=readFileSync(base+file,'utf8');assert.match(source,/onRelations={evolution&&relationSidebar.layout==='pages'\?relationSidebar.toggle:undefined}/);assert.match(source,/selectionTools={<TimelineSelectionTools/);assert.doesNotMatch(source,/<\/TimelineToolbar><TimelineSelectionTools|\/>\s*<TimelineSelectionTools/);}
 assert.match(timelineWorkspaceStyle,/@container timeline \(max-width:600px\)/);assert.match(timelineWorkspaceStyle,/container-name:timeline/);assert.match(timelineWorkspaceStyle,/\.timeline-toolbar-relations\{grid-column:3;grid-row:1/);assert.match(timelineWorkspaceStyle,/min-height:36px/);assert.match(timelineWorkspaceStyle,/return-strip button\{min-height:36px/);
});
test('writing-speed display has no external settings button; settings selector remains in existing settings component',()=>{
 const s=readFileSync('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/WritingSession.jsx','utf8');assert.doesNotMatch(s.slice(s.indexOf('export function WritingSpeed'),s.indexOf('export function WritingSessionSettings')),/onSettings|aria-label="码字时速设置"/);assert.match(s,/aria-label="码字时速显示方式"/);
});
