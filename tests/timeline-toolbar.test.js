import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {buildSync} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {timelineToolbarStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-toolbar-style.mjs';
const component=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/TimelineToolbar.jsx',import.meta.url);
const source=readFileSync(component,'utf8');
const compiled=buildSync({entryPoints:[component.pathname],bundle:true,write:false,platform:'node',format:'cjs',external:['react']}).outputFiles[0].text;
const module={exports:{}};
new Function('require','module','exports',compiled)(createRequire(import.meta.url),module,module.exports);
const {TimelineToolbar}=module.exports;
const action={id:'track',label:'新建轨道',onClick:()=>{}};
const render=mode=>renderToStaticMarkup(React.createElement(TimelineToolbar,{mode,onModeChange:()=>{},createActions:[action],onLocate:()=>{},zoomLabel:'全景',onZoomOut:()=>{},onZoomIn:()=>{},moreActions:[{id:'settings',label:'时间设置',onClick:()=>{}}]}));
test('both axes render exactly the same toolbar with only the selected mode changed',()=>{
 const narration=render('narration'),story=render('story');
 assert.equal(narration.replaceAll(/aria-pressed="(?:true|false)"/g,''),story.replaceAll(/aria-pressed="(?:true|false)"/g,''));
 for(const label of ['叙述顺序','故事时间','新建时间线内容','定位时间指针','缩小时间线','放大时间线','时间线更多操作'])assert.ok(narration.includes(label));
 assert.equal((narration.match(/>新建轨道</g)||[]).length,1);
 assert.ok(!narration.includes('人物关系'));
});
test('projection-specific controls are optional menu content, not extra visible panels',()=>{
 const markup=renderToStaticMarkup(React.createElement(TimelineToolbar,{mode:'story',menuContent:React.createElement('select',{'aria-label':'轨道筛选'})}));
 assert.match(markup,/<details[^>]*class="timeline-toolbar-menu more"/);
 assert.match(markup,/<div class="timeline-toolbar-popover"[^>]*><select/);
 assert.doesNotMatch(markup,/<details[^>]* open/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-menu:not\(\[open\]\)>.timeline-toolbar-popover\{display:none\}/);
});
test('menus dismiss on outside pointer, Escape, action and mode change',()=>{
 assert.match(source,/document.addEventListener\('pointerdown',outside\)/);
 assert.match(source,/document.removeEventListener\('pointerdown',outside\)/);
 assert.match(source,/e.key==='Escape'/);
 assert.match(source,/querySelector\('summary'\)\?\.focus\(\)/);
 assert.match(source,/closeMenus\(\);action.onClick\?\.\(\)/);
 assert.match(source,/useEffect\(\(\)=>\{closeMenus\(\);\},\[mode,disabled\]\)/);
});
test('narrow layout reuses compact controls, without a summary card or fixed height',()=>{
 assert.match(timelineToolbarStyle,/@media\(max-width:600px\)/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-actions\{display:contents\}/);
 assert.match(timelineToolbarStyle,/max-width:calc\(100vw - 32px\)/);
 assert.doesNotMatch(timelineToolbarStyle,/min-height:[1-9]\d{2}px/);
});
test('mobile rows and both parent shells have explicit shared layout contracts',()=>{
 assert.match(timelineToolbarStyle,/grid-template-columns:minmax\(0,1fr\) auto auto/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-modes\{grid-column:1 \/ 3;grid-row:1/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-menu.create\{grid-column:3;grid-row:1/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-menu.more\{grid-column:3;grid-row:2/);
 assert.match(timelineToolbarStyle,/\.unified-story>\.u-timeline,\.cuigengji \.unified-story>\.story-axis\{gap:12px;padding:12px;background:var\(--cg-paper\)\}/);
 assert.match(timelineToolbarStyle,/\.u-timeline-grid,\.cuigengji \.unified-story \.sa-workspace\{margin:0\}/);
});

test('shared toolbar suppresses inherited disclosure pseudo arrows',()=>{
 const css=readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-toolbar-style.mjs',import.meta.url),'utf8');
 assert.match(css,/\.timeline-toolbar details>summary::after/);assert.match(css,/content:none!important;display:none!important/);
});

test('menu scroll viewport fits the actual clipping column and visual viewport',()=>{
 const {timelineMenuAvailableHeight}=module.exports;
 assert.equal(timelineMenuAvailableHeight({top:260,columnBottom:388,viewportBottom:400}),120);
 assert.equal(timelineMenuAvailableHeight({top:260,columnBottom:708,viewportBottom:720}),440);
 assert.equal(timelineMenuAvailableHeight({top:260,columnBottom:708,viewportBottom:350}),82);
 assert.equal(timelineMenuAvailableHeight({top:400,columnBottom:388,viewportBottom:400}),0);
 assert.match(source,/new ResizeObserver\(fitOpen\)/);
 assert.match(source,/fitMenu\(e.currentTarget\)/);
 assert.match(timelineToolbarStyle,/max-height:min\(60dvh,var\(--timeline-menu-height,60dvh\)\)/);
 assert.match(timelineToolbarStyle,/\.timeline-toolbar-popover>\*\{flex-shrink:0\}/);
});
