import test from 'node:test';
import assert from 'node:assert/strict';
import {storyAxisStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-style.mjs';
import {timelineInteractionStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-interaction-style.mjs';
test('only story date stems are subtle dashed and remain pointer-transparent',()=>{
 const stem=storyAxisStyle.match(/\.sa-card:before\{([^}]+)\}/)[1];
 assert.match(stem,/width:1px/); assert.match(stem,/height:var\(--stem,30px\)/);
 assert.match(stem,/repeating-linear-gradient\(to bottom,.*0 3px,transparent 3px 7px\)/);
 assert.match(stem,/pointer-events:none/); assert.match(storyAxisStyle,/\.sa-card.below:before\{top:auto;bottom:100%\}/);
});
test('existing major date and chapter ticks use matching visible theme-aware hierarchy',()=>{
 assert.match(storyAxisStyle,/\.sa-tick\{[^}]*width:2px;height:14px/);
 assert.match(storyAxisStyle,/\.sa-anchor-tick\{height:17px/);
 assert.match(timelineInteractionStyle,/\.u-time-ruler>span::before\{[^}]*width:2px;height:14px/);
 for(const css of [storyAxisStyle,timelineInteractionStyle]) assert.match(css,/color-mix\(in srgb,var\(--cg-ink\) 72%,var\(--cg-paper\)\)/);
});

import {storyMarkerLabels} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
test('origin and same-date names use separate display rows without rewriting dates',()=>{
 const axis={anchor:{coordinate:100,label:'故事起点',cardId:'existing-card'},markers:[{id:'a',coordinate:100,label:'同一天的节点'},{id:'b',coordinate:100,label:'另一时间点'},{id:'c',coordinate:500,label:'远处'}]},before=JSON.stringify(axis);
 const result=storyMarkerLabels(axis,{timeToX:x=>x});assert.equal(JSON.stringify(axis),before);
 assert.equal(result.markers.find(m=>m.id==='a').displayRow,1);assert.equal(result.markers.find(m=>m.id==='b').displayRow,2);assert.equal(result.markers.find(m=>m.id==='c').displayRow,0);assert.equal(result.rowCount,3);
 assert.match(storyAxisStyle,/\.sa-origin-dot\{[^}]*width:22px;height:22px;border-radius:50%/);
 assert.match(storyAxisStyle,/\.sa-marker-tick\{[^}]*height:17px/);
 assert.match(storyAxisStyle,/\.sa-marker\{[^}]*background:transparent!important/);
});
test('out-of-box point and tick symbols remain directly clickable, names have roomy targets',()=>{
 assert.match(storyAxisStyle,/\.sa-origin-dot\{[^}]*pointer-events:auto/);
 assert.match(storyAxisStyle,/\.sa-marker-tick\{[^}]*pointer-events:auto/);
 assert.match(storyAxisStyle,/\.sa-marker\{[^}]*height:44px;min-height:44px/);
 assert.match(storyAxisStyle,/\.sa-origin\{z-index:8\}/);
});
