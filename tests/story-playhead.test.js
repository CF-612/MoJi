import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createStoryProjection,formatStoryDate} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
import {axisProjectionOptions} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
const source=readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryTimeAxis.jsx',import.meta.url),'utf8');
const handler=name=>source.split('\n').find(s=>s.startsWith(` const ${name}=`)).trim().replace(/^const /,'');
for(const calendar of [{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},{kind:'custom',name:'星历',era:'星纪',monthLengths:[30,30,30],visibility:{year:true,month:true,day:true}}])test(`playhead production handlers: ${calendar.kind}, scroll, zoom and fold`,async()=>{
 const axis={calendar,anchor:{coordinate:706258},primaryTick:{unit:'year',step:1}};
 for(const zoom of [0,3,10]){
  const projection=createStoryProjection([706258,736258],axisProjectionOptions(axis,zoom));
  const viewport={current:{scrollLeft:345,getBoundingClientRect:()=>({left:101})}};
  const latest={current:{projection}},gesture={current:null},dragged={current:false};let cursor=axis.anchor.coordinate,captured=null;
  const state=JSON.stringify(axis);const setCursor=n=>{cursor=n};const focusCoordinate=setCursor;const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const setup=new Function('viewport','latest','setCursor','gesture','dragged','focusCoordinate','axis','clamp',`let editor=null;${handler('seekPlayhead')}${handler('beginPlayhead')}return {seekPlayhead,beginPlayhead,key:cursor=>{${handler('keyPlayhead')}return keyPlayhead;}}`);
  const {seekPlayhead,beginPlayhead,key}=setup(viewport,latest,setCursor,gesture,dragged,focusCoordinate,axis,clamp);
  beginPlayhead({button:0,pointerId:9,preventDefault(){},stopPropagation(){},currentTarget:{setPointerCapture:id=>captured=id}});assert.equal(captured,9);assert.equal(gesture.current.playhead,true);
  for(const seg of projection.segments)for(const ratio of [.2,.7]){
   const x=seg.x+seg.width*ratio;seekPlayhead(x+101-345+64);assert.equal(cursor,projection.xToTime(x));assert.ok(Number.isSafeInteger(cursor));assert.ok(formatStoryDate(cursor,calendar));
  }
  seekPlayhead(-1e10);assert.equal(cursor,projection.segments[0].start);seekPlayhead(1e10);assert.equal(cursor,projection.segments.at(-1).end);seekPlayhead(NaN);assert.ok(Number.isSafeInteger(cursor));
  const press=k=>key(cursor)({key:k,preventDefault(){},stopPropagation(){}});press('Home');assert.equal(cursor,706258);press('+');assert.equal(cursor,706259);press('-');assert.equal(cursor,706258);assert.equal(JSON.stringify(axis),state);
 }
});
test('playhead leaves writes/card interactions separate',()=>{
 assert.match(source,/if\(g\.playhead\)\{e\.preventDefault\(\);dragged\.current=true;seekPlayhead\(e\.clientX\);return;\}/);
 assert.match(source,/if\(g\.playhead\)\{if\(dragged\.current\)seekPlayhead\(e\.clientX\);return;\}/);
 assert.match(source,/button,input,select,textarea,\[data-track-control\],\[data-story-card\]/);
 assert.match(source,/onPointerCancel=\{cancel\}/);
 assert.match(source,/valueText=\{formatStoryDate\(cursor,axis.calendar\)\}/);
});

test('shared playhead uses font-independent CSS thumb and overrides global button reset',()=>{
 assert.match(source,/<TimelinePlayhead/);
 const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url),component=readFileSync(new URL('TimelinePlayhead.jsx',base),'utf8'),css=readFileSync(new URL('timeline-playhead-style.mjs',base),'utf8');
 assert.match(component,/className="timeline-playhead-thumb" aria-hidden="true"/);assert.match(component,/aria-valuetext=\{valueText\}/);assert.doesNotMatch(component,/>Ⅱ</);
 assert.match(css,/\.cuigengji \.timeline-playhead>\.timeline-playhead-handle\{[^}]*transform:translateX\(-50%\)/);assert.match(css,/pointer-events:none/);
});
