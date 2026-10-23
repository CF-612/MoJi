import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storyLaneLayout,storyDisplayCards,storyCardHeight} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
import {createStoryProjection} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url),jsx=readFileSync(new URL('StoryTimeAxis.jsx',base),'utf8'),css=readFileSync(new URL('story-axis-style.mjs',base),'utf8');
const axis={anchor:{coordinate:1000},tracks:[{id:'above',name:'上方',side:'above'},{id:'below',name:'下方',side:'below'}]};
test('empty guidance occupies normal flow outside the coordinate viewport',()=>{
 assert.ok(jsx.indexOf('className="sa-empty"')<jsx.indexOf('ref={viewport}'));
 assert.match(css,/\.sa-empty\{position:relative;flex:none;min-width:0;/);
 assert.match(css,/\.sa-lane\{[^}]*min-height:0\}/);
 assert.doesNotMatch(css,/\.sa-empty\{[^}]*position:absolute/);
 assert.match(css,/\.sa-anchor-pill\{min-width:0;/);
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
test('first-use CTA and create menu expose event, marker and track workflows',()=>{
 assert.match(jsx,/添加第一个事件/);
 assert.match(jsx,/\['reference','添加事件','plus'\]/);assert.match(jsx,/\['marker','添加时间标记','flag'\]/);assert.match(jsx,/\['track','新建轨道','route'\]/);
 assert.match(jsx,/<Modal title="添加事件"/);assert.match(jsx,/保存位置|StoryPlacementEditor/);
 assert.match(jsx,/onClick=\{\(\)=>\{if\(!dragged.current\)\{setSelected\(card.id\);setCursor\(t.start\);open\(card\);/);
});

test('new placement starts at selected date; existing dates take priority and are only saved on submit',()=>{
 const panels=readFileSync(new URL('StoryAxisPanels.jsx',base),'utf8');
 assert.ok(panels.includes('useState(existing?.start??initialCoordinate??axis.anchor.coordinate)'));
 assert.ok(panels.includes('useState(existing?existing.end-1:initialCoordinate??axis.anchor.coordinate)'));
 assert.match(jsx,/<StoryPlacementEditor initialCoordinate=\{cursor\}/);
 assert.match(panels,/onSubmit=\{e=>\{e.preventDefault\(\);void submission.submit/);
});
test('zoom and anchor controls are visible, custom styled and retain bounded zoom actions',()=>{
 const view=readFileSync(new URL('StoryAxisViewControls.jsx',base),'utf8');
 assert.match(jsx,/<StoryAxisViewControls zoom=\{zoom\} preset=\{zoomPreset\}/);
 assert.doesNotMatch(view,/<select/);
 assert.match(view,/aria-label="故事轴查看尺度"/);assert.match(view,/aria-label="回到锚点"/);assert.match(view,/<Icon name="locate"/);
 assert.ok(view.includes('onZoom(Math.max(-4,zoom-1))'));assert.ok(view.includes('onZoom(Math.min(levels.daily,zoom+1))'));assert.ok(view.includes('onZoom(levels[key])'));
 assert.match(css,/\.sa-zoom-control>\.sa-zoom-step\{width:44px;height:44px;min-height:44px/);
 assert.match(css,/\.sa-scale-menu>summary:focus-visible/);
});

test('custom controls suppress inherited duplicate chevrons and guide stays compact without hiding the CTA',()=>{
 assert.match(css,/details\.sa-tool-menu>summary::after/);assert.match(css,/details\.sa-scale-menu>summary::after/);
 assert.match(css,/\.sa-empty\{display:grid;grid-template-columns:minmax\(0,1fr\) auto/);
 assert.match(css,/\.sa-empty-create\{grid-column:2;grid-row:1\/3;margin:0/);
 assert.match(jsx,/添加第一个事件/);
});

test('track strip starts collapsed even before the first event without removing its heading',()=>{
 const tracks=readFileSync(new URL('StoryTrackControls.jsx',base),'utf8');
 assert.doesNotMatch(tracks,/<details open=/);assert.match(tracks,/<details><summary><strong>故事轨道/);assert.match(tracks,/新建轨道/);
});

test('compact track summary keeps heading and count intact on narrow screens',()=>{
 const tracks=readFileSync(new URL('StoryTrackControls.jsx',base),'utf8');
 assert.match(tracks,/点名称改名 · 拖动排序/);
 assert.match(tracks,/<small>\{catalog.length\} 条<\/small>/);
 assert.doesNotMatch(tracks,/展开全部/);
 assert.match(tracks,/summary strong\{[^}]*white-space:nowrap;flex:none/);
 assert.match(tracks,/summary>small\{white-space:nowrap;flex:none/);
});
