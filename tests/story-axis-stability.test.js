import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storyViewportSize,centerStoryLayout,storyLaneLayout,storyDragDrop} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
import {timelineWheelIntent} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/timeline-wheel.mjs';
const root=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url);
const source=name=>readFileSync(new URL(name,root),'utf8');
test('fractional content-box dimensions never round a fitted world above available space',()=>{
 for(const width of [320.125,605.859375,1070.71875])for(const height of [420.5,580.71875,640.999]){
  const size=storyViewportSize({width,height});assert.ok(size.width<=width);assert.ok(size.height<=height);
  const layout=centerStoryLayout({line:120,height:320,lanes:[{y:0}]},size.height);
  assert.ok(layout.height<=height);assert.equal(layout.line,size.height/2);
 }
 assert.deepEqual(storyViewportSize({width:0,height:0}),{width:0,height:0});
});
test('observer measures fractional content box, not rounded clientHeight feedback',()=>{
 const s=source('StoryTimeAxis.jsx');assert.match(s,/storyViewportSize\(entry.contentRect\)/);assert.doesNotMatch(s,/setViewportSize\(old=>old.width===el.clientWidth/);
 assert.match(source('story-axis-style.mjs'),/sa-axis-column\{[^}]*overflow:hidden/);
 assert.match(source('story-axis-style.mjs'),/sa-axis-column>\.sa-viewport\{[^}]*scrollbar-gutter:stable/);
});
test('both timelines reuse wheel policy: zoom vertical, pan horizontal/shift, normalize units',()=>{
 for(const ctrlKey of [false,true])for(const metaKey of [false,true]){
  assert.deepEqual(timelineWheelIntent({deltaY:-100,ctrlKey,metaKey}),{kind:'zoom',delta:-100});
 }
 assert.deepEqual(timelineWheelIntent({deltaY:3,deltaMode:1}),{kind:'zoom',delta:48});
 assert.deepEqual(timelineWheelIntent({deltaY:-1,deltaMode:2},{clientHeight:400}),{kind:'zoom',delta:-400});
 assert.deepEqual(timelineWheelIntent({deltaX:70,deltaY:8}),{kind:'pan',delta:70});
 assert.deepEqual(timelineWheelIntent({deltaX:0,deltaY:-80,shiftKey:true}),{kind:'pan',delta:-80});
 assert.deepEqual(timelineWheelIntent({deltaX:80,deltaY:0,shiftKey:true}),{kind:'pan',delta:80});
 assert.deepEqual(timelineWheelIntent({deltaX:0,deltaY:0}),{kind:'zoom',delta:0});
 for(const file of ['StoryTimeAxis.jsx','UnifiedTimeline.jsx']){const s=source(file);assert.match(s,/timelineWheelIntent\(e,el\)/);assert.match(s,/passive:false/);assert.match(s,/input,select,textarea,\[contenteditable=true\]/);}
});
test('origin edits the persisted anchor instead of creating a misleading separate marker',()=>{
 const origin=source('StoryTimeAxis.jsx').match(/<button className="sa-origin"[\s\S]*?<\/button>/)?.[0];
 assert.ok(origin);assert.match(origin,/axis.anchor.label\|\|'故事起点'/);assert.match(origin,/编辑故事起点/);assert.match(origin,/setPanel\(\{kind:'setup'\}\)/);assert.doesNotMatch(origin,/＋|kind:'marker'/);
});
test('track controller stays mounted without an extra persistent summary card',()=>{
 assert.match(source('StoryTimeAxis.jsx'),/<StoryTrackControls compact catalog=/);
 const controls=source('StoryTrackControls.jsx');assert.match(controls,/<details hidden=\{compact\}/);assert.match(controls,/controlRef.current=handlers/);
 assert.match(source('StoryTimeAxis.jsx'),/<StoryTrackLane/);assert.match(source('StoryTimeAxis.jsx'),/onReorder=/);
});

test('pending tray drop uses absolute release coordinate rather than tray-origin delta',()=>{
 const projection={xToTime:x=>Math.round(x*2),timeToX:t=>t/2},rect={left:10,right:900,top:50},layout={line:300,lanes:[{side:'above',y:0,trackKey:'shared:t'}],cardInset:36,rowHeight:64};
 const gesture={pending:true,x:400,scroll:0,card:{time:{story:{start:100,trackId:'t',trackSource:'shared'}}}};
 const drop=storyDragDrop(projection,rect,20,400,150,layout,gesture);
 assert.equal(drop.start,(400-10+20-64)*2);
 assert.equal(storyDragDrop(projection,rect,0,400,150,layout,{...gesture,pending:false}).start,100);
});
