import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {buildSync} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {timelinePlayheadStyle as css} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-playhead-style.mjs';
const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url);
const compiled=buildSync({entryPoints:[new URL('TimelinePlayhead.jsx',base).pathname],bundle:true,write:false,platform:'node',format:'cjs',external:['react']}).outputFiles[0].text;
const module={exports:{}};
new Function('require','module','exports',compiled)(createRequire(import.meta.url),module,module.exports);
const {TimelinePlayhead}=module.exports;
const render=props=>renderToStaticMarkup(React.createElement(TimelinePlayhead,props));

test('shared playhead separates a slim themed thumb from an accessible transparent hit target',()=>{
 assert.match(css,/\.timeline-playhead\{[^}]*width:1px;[^}]*pointer-events:none/);
 assert.match(css,/--playhead-color:var\(--cg-accent,#234d7b\)/);
 assert.match(css,/\.timeline-playhead-thumb\{[^}]*width:12px;height:18px/);
 assert.match(css,/width:32px!important;[^}]*height:32px!important/);
 assert.match(css,/@media\(pointer:coarse\)[^}]*width:44px!important;[^}]*height:44px!important/);
 assert.match(css,/background:transparent!important;[^}]*pointer-events:auto;[^}]*touch-action:none/);
 assert.match(css,/:focus-visible \.timeline-playhead-thumb/);
 assert.doesNotMatch(css,/scale\(|chevron|border-right/);
});

test('projection and handle anchor change without changing visible playhead geometry',()=>{
 const common={left:120,min:0,max:200,value:40,valueText:'第 40 章',ariaLabel:'当前叙述时间'};
 const narrative=render(common),story=render({...common,top:12,height:600,handleOffset:280});
 for(const markup of [narrative,story]){
  assert.match(markup,/role="slider" aria-label="当前叙述时间" aria-description="时间指针" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="200" aria-valuenow="40" aria-valuetext="第 40 章"/);
  assert.match(markup,/class="timeline-playhead-thumb" aria-hidden="true"/);
  assert.doesNotMatch(markup,/>第 40 章</);
 }
 assert.match(narrative,/style="left:120px;top:0;bottom:0"/);
 assert.match(story,/style="left:120px;top:12px;height:600px"/);
 assert.match(story,/class="timeline-playhead-handle" style="top:280px"/);
});

test('pointer and keyboard handlers remain owned by the axis, and clicks do not create markers',()=>{
 const pointer=()=>{},keyboard=()=>{};let stopped=0,clicked=0;
 const tree=TimelinePlayhead({left:0,onPointerDown:pointer,onKeyDown:keyboard,onClick:()=>clicked++,disabled:true,dragging:true});
 const line=tree.props.children[1],button=line.props.children;
 assert.equal(button.props.onPointerDown,pointer);
 assert.equal(button.props.onKeyDown,keyboard);
 assert.equal(button.props.disabled,true);
 assert.equal(button.props.type,'button');
 assert.equal(line.props.className,'timeline-playhead dragging');
 button.props.onClick({stopPropagation:()=>stopped++});
 assert.equal(stopped,1);assert.equal(clicked,1);
});

test('both timelines consume the same playhead instead of duplicating pointer markup',()=>{
 for(const name of ['UnifiedTimeline.jsx','StoryTimeAxis.jsx']){
  const source=readFileSync(new URL(name,base),'utf8');
  assert.match(source,/import \{TimelinePlayhead\} from '\.\/TimelinePlayhead.jsx'/);
  assert.match(source,/<TimelinePlayhead /);
  assert.doesNotMatch(source,/className="(?:u-time-pointer|u-story-cursor)"/);
 }
});

test('start-edge keeps the line exact while exposing the full handle and grip inside the world',()=>{
 for(const left of [0,4,20]){
  const line=TimelinePlayhead({left}).props.children[1],button=line.props.children;
  assert.equal(line.props.style.left,left);
  assert.match(button.props.className,/at-start/);
  assert.equal(button.props.style.left,-left);
  assert.equal(button.props.style['--playhead-thumb-inset'],Math.max(2,left-6)+'px');
 }
 assert.match(css,/handle.at-start\{transform:none;justify-items:start/);
 const button=TimelinePlayhead({left:50}).props.children[1].props.children;
 assert.doesNotMatch(button.props.className,/at-start/);
});

test('playhead paints above the sticky ruler without covering gesture overlays',()=>{
 const layer=Number(css.match(/\.timeline-playhead\{[^}]*z-index:(\d+)/)[1]);
 assert.ok(layer>8,'sticky timeline ruler uses layer 8');
 assert.ok(layer<30,'marquee and gesture overlays remain above the playhead');
});
