import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';import {readFile} from 'node:fs/promises';
import {timelineEditorStyle} from '../vendor/cuigengji/src/client/features/planning/timeline-editor-style.mjs';
const {outputFiles}=await build({stdin:{resolveDir:fileURLToPath(new URL('../',import.meta.url)),loader:'jsx',contents:`
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {StoryTimeAxis} from './vendor/cuigengji/src/client/features/planning/StoryTimeAxis.jsx';import {UnifiedTimeline} from './vendor/cuigengji/src/client/features/planning/UnifiedTimeline.jsx';import {TimelineCardEditorShell} from './vendor/cuigengji/src/client/features/planning/TimelineCardEditorShell.jsx';import {DialogProvider} from './vendor/cuigengji/src/client/dialog.tsx';
const axis={schemaVersion:1,calendar:{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor:{coordinate:739617,label:'第一章'},coordinateUnit:'day',primaryTick:{unit:'year',step:1},tracks:[{id:'t',name:'自由轨道',color:'#778899',side:'above'}],markers:[]};
const state={revision:1,storyAxis:axis,tracks:[{id:'n',name:'自由轨道'}],cards:{c:{id:'c',title:'只显示这个标题',summary:'不应常驻的摘要',purpose:'情节',content:'完整正文只在编辑页',cast:[],status:'selected',points:[],time:{story:{axisVersion:1,start:739617,end:739618,trackId:'t',row:0},narration:{startChapterId:'ch',startOffset:0,endChapterId:'ch',endOffset:1,trackId:'n'}}}}};
export function render(mode,editing=false){const Component=mode==='story'?StoryTimeAxis:UnifiedTimeline;return renderToStaticMarkup(<DialogProvider><Component state={state} sources={{chapters:[{id:'ch',title:'第一章'}]}} people={[]} relations={[]} evolution foreshadowIds={new Set(['c'])} relationClock={{mode:'narration',setMode(){},cursor:0,setCursor(){}}} novelId="timeline-editor-regression" save={async()=>true} editor={editing?<TimelineCardEditorShell title="编辑剧情卡" close={()=>{}}><form><input aria-label="测试编辑字段"/><button>保存</button></form></TimelineCardEditorShell>:null}/></DialogProvider>);}
`},bundle:true,write:false,format:'iife',globalName:'TimelineTest',platform:'node',loader:{'.png':'dataurl'},define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'ssr-locale-snapshot-only',setup(b){b.onLoad({filter:/[/\\]locale\.js$/},async args=>({contents:(await readFile(args.path,'utf8')).replace('locale ? () => locale.getSnapshot() : emptySnapshot);','locale ? () => locale.getSnapshot() : emptySnapshot, emptySnapshot);'),loader:'js'}));}}]});
const {render}=new Function('require',outputFiles[0].text+';return TimelineTest;')(createRequire(import.meta.url));
test('两种时间线均显示标题与状态属性，不常驻摘要、头像或编辑按钮',()=>{for(const mode of ['story','narration']){const html=render(mode);assert.match(html,/只显示这个标题/);assert.doesNotMatch(html,/不应常驻的摘要|完整正文只在编辑页|编辑内容 ↗|详情 ↗/);assert.match(html,/data-card-state="selected"/);assert.match(html,/data-foreshadow-linked="true"/);assert.doesNotMatch(html,/<div class="u-strip-meta"/);}});
test('编辑只注入一个原位二级页，原关系图不卸载或新增第三栏',()=>{for(const mode of ['story','narration']){const html=render(mode,true);assert.equal((html.match(/class="u-timeline-editor-region"/g)||[]).length,1);assert.match(html,/aria-label="返回时间线"/);assert.match(html,/aria-label="测试编辑字段"/);assert.match(html,/class="u-relation-network/);assert.doesNotMatch(html,/<dialog/);}});
test('宽屏编辑替换关系栏，窄屏全内容二级页；两者均按实际容器宽度',()=>{assert.match(timelineEditorStyle,/\.sa-workspace\.sa-editing>\.sa-axis-column,\.cuigengji \.sa-workspace\.sa-editing>\.sa-relations-region\{display:none\}/);assert.match(timelineEditorStyle,/@container story-workspace \(min-width:900px\)/);assert.match(timelineEditorStyle,/@container narrative-workspace \(min-width:900px\)/);assert.match(timelineEditorStyle,/grid-template-columns:minmax\(0,1fr\) 360px/);assert.match(timelineEditorStyle,/overflow:auto;overscroll-behavior:contain/);});
test('复用原CardEditor保存与未保存确认，拖动不会打开编辑',async()=>{const base=new URL('../vendor/cuigengji/src/client/features/planning/',import.meta.url),source=await readFile(new URL('UnifiedPlanning.jsx',base),'utf8'),story=await readFile(new URL('StoryTimeAxis.jsx',base),'utf8'),narration=await readFile(new URL('UnifiedTimeline.jsx',base),'utf8');assert.match(source,/const Frame=embedded\?TimelineCardEditorShell:Modal/);assert.match(source,/save=\{editSave\}/);assert.match(source,/editorGuard.current&&!await editorGuard.current\(\)/);assert.match(source,/日期修改随本次“保存”一起提交/);});

test('编辑面板明确标示编辑状态并提供常驻保存、取消、关闭入口',()=>{for(const mode of ['story','narration']){const html=render(mode,true);assert.match(html,/正在编辑剧情卡/);assert.match(html,/剧情卡编辑面板/);assert.match(html,/取消编辑/);assert.match(html,/关闭 ×/);assert.match(html,/编辑中暂不能移动卡片，请先保存或取消编辑。/);assert.match(html,/class="u-timeline-editor-actions"/);}});

// Execute the shipped card handler expressions with controlled dependencies. This
// covers handler behavior, not browser dispatch/capture (covered by CUA separately).
test('实际卡片处理器：单击只选择、双击编辑、拖动后不误开编辑',async()=>{
 const base=new URL('../vendor/cuigengji/src/client/features/planning/',import.meta.url);
 for(const [file,marker,refName] of [['StoryTimeAxis.jsx','data-story-card=','dragged'],['UnifiedTimeline.jsx','data-time-item=','pointerDragged']]){
  const source=await readFile(new URL(file,base),'utf8'),cardSource=source.slice(source.indexOf(marker));
  const expressions=['onClick','onDoubleClick'].map(name=>{const match=cardSource.match(new RegExp(name+'=\\{([\\s\\S]*?)\\} (?=on[A-Z])'));assert.ok(match,name);return match[1];});
  const card={id:'c'},item={card,start:42},t={start:42},ref={current:false},calls=[];
  let selectionAllowed=true;
  const scope={card,item,t,[refName]:ref,editor:null,marquee:{select:(id,add)=>{calls.push(['select',id,!!add]);return selectionAllowed;}},setCursor:value=>calls.push(['cursor',value]),open:value=>calls.push(['open',value.id])};
  const [click,doubleClick]=expressions.map(expression=>new Function(...Object.keys(scope),'return ('+expression+');')(...Object.values(scope)));
  const event={shiftKey:false,ctrlKey:false,metaKey:false,target:{closest:()=>null}};
  click(event);assert.deepEqual(calls,[['select','c',false],['cursor',42]]);
  calls.length=0;doubleClick(event);assert.deepEqual(calls,[['open','c']]);
  calls.length=0;ref.current=true;click(event);doubleClick(event);assert.deepEqual(calls,[]);
  ref.current=false;selectionAllowed=false;click(event);assert.deepEqual(calls,[['select','c',false]],'edit-lock selection refusal cannot move cursor');
 }
});
