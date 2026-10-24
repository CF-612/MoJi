import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {storyLaneLayout,storyDisplayCards,storyCardHeight} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
import {createStoryProjection} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url),jsx=readFileSync(new URL('StoryTimeAxis.jsx',base),'utf8'),css=readFileSync(new URL('story-axis-style.mjs',base),'utf8');
// Validate the shared toolbar declaration independently of attribute order.
// Restrict assertions to this JSX declaration so another mode prop cannot satisfy them.
const toolbarStart=jsx.indexOf(' const toolbar='),toolbarSource=jsx.slice(toolbarStart,jsx.indexOf(' return <section',toolbarStart));
const compiledToolbar=transformSync(toolbarSource,{loader:'jsx'}).code;
const axis={anchor:{coordinate:1000},tracks:[{id:'above',name:'上方',side:'above'},{id:'below',name:'下方',side:'below'}]};
test('unset axis offers explicit setup; configured empty axis shares the same toolbar',()=>{
 assert.match(jsx,/设置故事坐标系 →/);assert.match(jsx,/尚未设置，不会写入任何时间安排/);
 assert.equal((toolbarSource.match(/<TimelineToolbar\b/g)||[]).length,1);assert.match(compiledToolbar,/mode: "story"/);
 assert.match(jsx,/!axis&&toolbar/);assert.match(jsx,/<TimelineWorkspace[^>]*toolbar=\{toolbar\}/);
 assert.doesNotMatch(jsx,/className="sa-empty"/);
 assert.match(css,/\.sa-lane\{[^}]*min-height:0\}/);
});
test('empty, first and multiple cards preserve clear axis/origin band on both sides',()=>{
 for(const count of [0,1,6]){
  const cards=Array.from({length:count},(_,i)=>({id:String(i),time:{story:{start:1000+i,end:1001+i,trackId:i%2?'below':'above',side:i%2?'below':'above',row:0}}}));
  const before=structuredClone(cards),p=createStoryProjection([1000,...cards.map(c=>c.time.story.start)]),display=storyDisplayCards(cards,p,axis),layout=storyLaneLayout(axis,display);
  for(const lane of layout.lanes){assert.ok(lane.side==='above'?lane.y+lane.height<=layout.line-20:lane.y>=layout.line+30);
   for(const card of display.filter(c=>c.displaySide===lane.side)){const y=lane.y+26+card.displayRow*64;assert.ok(lane.side==='above'?y+storyCardHeight<layout.line-43:y>layout.line+30);}
  }
  assert.deepEqual(cards,before);
 }
});
test('shared create menu exposes event, marker and track workflows without duplicate CTA',()=>{
 for(const label of ['新建剧情卡','添加事件','新建时间点','新建轨道'])assert.ok(jsx.includes("label:'"+label+"'"));
 assert.match(jsx,/<Modal title="添加事件"/);assert.match(jsx,/StoryPlacementEditor/);
 assert.match(jsx,/id:'track',label:'新建轨道',onClick:\(\)=>setPanel\(\{kind:'track'\}\)/);
 assert.doesNotMatch(jsx,/添加第一个事件/);
});

test('new placement starts at selected date; existing dates take priority and are only saved on submit',()=>{
 const panels=readFileSync(new URL('StoryAxisPanels.jsx',base),'utf8');
 assert.ok(panels.includes('useState(existing?.start??initialCoordinate??axis.anchor.coordinate)'));
 assert.ok(panels.includes('useState(existing?existing.end-1:initialCoordinate??axis.anchor.coordinate)'));
 assert.match(jsx,/<StoryPlacementEditor initialCoordinate=\{cursor\}/);
 assert.match(panels,/onSubmit=\{e=>\{e.preventDefault\(\);void submission.submit/);
});
test('shared zoom and anchor controls retain bounded zoom actions',()=>{
 const view=readFileSync(new URL('TimelineToolbar.jsx',base),'utf8');
 assert.match(compiledToolbar,/mode: "story"/);
 for(const name of ['onLocate','onZoomOut','onZoomIn','zoomOutDisabled','zoomInDisabled'])assert.ok(compiledToolbar.includes(name+':'),`shared toolbar retains ${name}`);
 assert.match(compiledToolbar,/onZoomOut:[\s\S]*?Math.max\(-4, zoom - 1\)/);
 assert.match(compiledToolbar,/onZoomIn:[\s\S]*?Math.min\(zoomLevels.daily, zoom \+ 1\)/);
 assert.match(view,/aria-label="定位时间指针"/);assert.match(view,/aria-label="时间线缩放"/);
 assert.ok(jsx.includes('setZoom(Math.max(-4,zoom-1))'));assert.ok(jsx.includes('setZoom(Math.min(zoomLevels.daily,zoom+1))'));assert.ok(jsx.includes('setZoom(zoomLevels[key])'));
 assert.match(jsx,/locate\(axis.anchor.coordinate\)/);
});
test('shared custom menus suppress inherited duplicate chevrons',()=>{
 const style=readFileSync(new URL('timeline-toolbar-style.mjs',base),'utf8');
 assert.match(style,/details>summary::after/);assert.match(style,/details>summary::before/);assert.match(style,/content:none!important;display:none!important/);
});
test('compact track controller stays mounted while management moves into More',()=>{
 const tracks=readFileSync(new URL('StoryTrackControls.jsx',base),'utf8');
 assert.match(jsx,/<StoryTrackControls compact catalog=\{catalog\}/);assert.match(jsx,/label:'管理轨道',onClick:\(\)=>setPanel\(\{kind:'tracks'\}\)/);
 assert.match(tracks,/controlRef.current=handlers/);assert.match(tracks,/track.reorder/);assert.match(tracks,/compact/);
});

test('compact track summary keeps heading and count intact on narrow screens',()=>{
 const tracks=readFileSync(new URL('StoryTrackControls.jsx',base),'utf8');
 assert.match(tracks,/点名称改名 · 拖动排序/);
 assert.match(tracks,/<small>\{catalog.length\} 条<\/small>/);
 assert.doesNotMatch(tracks,/展开全部/);
 assert.match(tracks,/summary strong\{[^}]*white-space:nowrap;flex:none/);
 assert.match(tracks,/summary>small\{white-space:nowrap;flex:none/);
});
