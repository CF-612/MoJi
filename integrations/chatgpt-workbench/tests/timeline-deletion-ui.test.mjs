import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const root=new URL('../../../',import.meta.url).pathname;
const source=new URL('../vendor/cuigengji/src/client/features/planning/TimelineSelectionTools.jsx',import.meta.url).pathname;
const folder=await mkdtemp(join(tmpdir(),'moji-timeline-delete-'));
await build({stdin:{contents:`export * from ${JSON.stringify(source)};import React from 'react';export {React};`,resolveDir:root},outfile:join(folder,'ui.cjs'),bundle:true,platform:'node',format:'cjs',alias:{react:root+'node_modules/react'}});
const require=createRequire(import.meta.url),{TimelineSelectionTools,useTimelineDeletion,React}=require(join(folder,'ui.cjs'));
const all=el=>!el||typeof el!=='object'?[]:[el,...React.Children.toArray(el.props?.children).flatMap(all)];
const text=el=>typeof el==='string'||typeof el==='number'?String(el):!el||typeof el!=='object'?'':React.Children.toArray(el.props?.children).map(text).join('');
function mountHook(props){let index=0;const slots=[];const dispatcher={useState(value){const i=index++;if(!(i in slots))slots[i]=typeof value==='function'?value():value;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},useRef(value){return slots[index++]??={current:value};},useEffect(){},useMemo(create){index++;return create();},useCallback(fn){index++;return fn;}};return {render(){index=0;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current=dispatcher;try{return useTimelineDeletion(props);}finally{holder.current=null;}},props};}

test('shared timeline toolbar exposes touch buttons for single and bulk selection without viewport restrictions',async()=>{
 for(const width of [375,430,1280])for(const ids of [['a'],['a','b']]){
  globalThis.innerWidth=width;let deletes=0,toggles=0,clears=0;
  const view=TimelineSelectionTools({multi:ids.length>1,onMulti:()=>toggles++,selectedIds:ids,onClear:()=>clears++,onDelete:()=>deletes++});
  const buttons=all(view).filter(e=>e.type==='button'),remove=buttons.find(e=>text(e)===`删除剧情卡／篇章（${ids.length}）`);
  assert.ok(remove,`tap delete button is rendered at width ${width}`);assert.ok(!remove.props.disabled);assert.notEqual(remove.props.style?.display,'none');
  await remove.props.onClick();assert.equal(deletes,1);
  buttons.find(e=>text(e)===(ids.length>1?'退出多选':'多选')).props.onClick();assert.equal(toggles,1);
  buttons.find(e=>text(e)==='取消选择').props.onClick();assert.equal(clears,1);
 }
 delete globalThis.innerWidth;
});

test('shared timeline toolbar disables mutations during editing or a pending operation',()=>{
 const view=TimelineSelectionTools({multi:true,onMulti:()=>{},selectedIds:['a'],onClear:()=>{},onDelete:()=>{},disabled:true});
 const remove=all(view).find(e=>e.type==='button'&&text(e)==='删除剧情卡／篇章（1）');assert.equal(remove.props.disabled,true);
});

test('timeline deletion retains selection on cancel/failure, filters stale IDs and clears only after success',async()=>{
 const calls=[],clears=[],state={cards:{a:{id:'a'},b:{id:'b'},keep:{id:'keep'}}};let accepted=false;
 const marquee={selectedIds:['a','missing','b','a'],select:id=>clears.push(id)};
 const hook=mountHook({state,marquee,onDelete:async refs=>(calls.push(refs),accepted),blocked:false});
 assert.deepEqual(hook.render().selectedIds,['a','b']);
 assert.equal(await hook.render().remove(),false);assert.deepEqual(calls,[['card:a','card:b']]);assert.deepEqual(clears,[]);
 accepted=true;assert.equal(await hook.render().remove(),true);assert.deepEqual(clears,[null]);
 hook.props.blocked=true;await hook.render().remove();assert.equal(calls.length,2,'blocked editing cannot submit deletion');
});

test('timeline pending deletion is single-flight and desktop Delete ignores input fields',async()=>{
 let finish,calls=0;const clears=[];
 const hook=mountHook({state:{cards:{a:{id:'a'}}},marquee:{selectedIds:['a'],select:id=>clears.push(id)},onDelete:()=>{calls++;return new Promise(resolve=>{finish=resolve;});},blocked:false});
 const pending=hook.render().remove();assert.equal(hook.render().pending,true);await hook.render().remove();assert.equal(calls,1);finish(false);await pending;assert.equal(hook.render().pending,false);assert.deepEqual(clears,[]);
 hook.render().deleteKey({key:'Delete',target:{closest:()=>({})},preventDefault(){throw new Error('input Delete must not be intercepted');},stopPropagation(){}});assert.equal(calls,1);
 let prevented=0;hook.render().deleteKey({key:'Delete',target:{closest:()=>null},preventDefault(){prevented++;},stopPropagation(){}});assert.equal(prevented,1);assert.equal(calls,2);finish(true);await new Promise(resolve=>setTimeout(resolve,0));assert.deepEqual(clears,[null]);
});

test.after(async()=>{await rm(folder,{recursive:true,force:true});});


test('both axes wire the shared touch selection toolbar, additive tapping and desktop Delete',async()=>{
 for(const name of ['UnifiedTimeline','StoryTimeAxis']){
  const source=await readFile(new URL(`../vendor/cuigengji/src/client/features/planning/${name}.jsx`,import.meta.url),'utf8');
  assert.match(source,/useTimelineDeletion\(\{state,marquee,onDelete,blocked:unavailable\|\|!!editor/);
  assert.match(source,/<TimelineSelectionTools multi=\{multi\}/);
  assert.match(source,/selectedIds=\{deletion.selectedIds\}/);assert.match(source,/onDelete=\{deletion.remove\}/);
  assert.match(source,/onKeyDown=\{deletion.deleteKey\}/);assert.match(source,/toolbar=\{toolbar\}/);
  assert.equal((source.match(/marquee.select\((?:item.card|card).id,multi\|\|e.shiftKey\|\|e.ctrlKey\|\|e.metaKey\)/g)||[]).length,2,'axis and pending tray both support additive touch selection');
 }
});

test('both timeline More menus expose the shared undo command directly with history availability',async()=>{
 for(const name of ['UnifiedTimeline','StoryTimeAxis']){
  const source=await readFile(new URL(`../vendor/cuigengji/src/client/features/planning/${name}.jsx`,import.meta.url),'utf8');
  assert.match(source,/id:'undo',label:'撤销规划修改',disabled:!canUndo(?:\|\|!!intent)?,onClick:\(\)=>onUndo\?\.\(\)/);
 }
});
