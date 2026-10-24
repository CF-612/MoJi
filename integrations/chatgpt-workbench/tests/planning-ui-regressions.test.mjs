import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {emptyWorkspace,reconcile,applyStory,objectIndex} from '../vendor/cuigengji/src/domain/story-workspace.mjs';
import {createService} from '../server/service.mjs';
import {legacyCanvasSvg} from '../vendor/cuigengji/src/client/shared/canvas-export-legacy.mjs';
import {planningConnection,planningSvg,planningPalette} from '../vendor/cuigengji/src/client/shared/planning-canvas-geometry.mjs';
const root=new URL('../../../',import.meta.url).pathname,ui=new URL('../vendor/cuigengji/src/client/',import.meta.url).pathname;
const source=ui+'features/planning/UnifiedPlanning.jsx',folder=await mkdtemp(join(tmpdir(),'moji-planning-ui-'));
const stub=`export const useModules=()=>globalThis.testPlanningModules||({pages:true,timeline:true,foreshadow:true,evolution:true}),useDialog=()=>globalThis.testPlanningDialog||({ask:async()=>null,confirm:async()=>true}),useRelationClock=()=>globalThis.testPlanningRelationClock||({}),useResource=()=>({value:[]}),useWorkbenchPreferences=()=>({preferences:globalThis.testPlanningPreferences||{planningView:'timeline'}}),usePreference=(key,value)=>globalThis.testPlanningPreferenceHook?globalThis.testPlanningPreferenceHook(key,value):[key.endsWith('area')?'canvas':value,()=>{}],SessionScope={};
export const PositionFields=()=>null,TimelineCardEditorShell=()=>null,InternalPoints=()=>null,CanvasExport=()=>null,RelationPointManager=()=>null,Modal=()=>null,GraphControls=()=>null,CastAvatars=()=>null,CardChapterLinks=()=>null,Foreshadows=()=>null,PlotForeshadows=()=>null,UnifiedTimeline=()=>null,StoryTimeAxis=()=>null,Icon=()=>null,PlanningToolsDialog=()=>null,PlanningToolGroup=()=>null;
export const relationEditStyle='',foreshadowStyle='',unifiedStoryStyle='',useGraph=options=>globalThis.testPlanningGraph?.(options)||({}),curve=()=>'',CARD_WIDTH=248,CARD_HEIGHT=208,narrationChapters=()=>[];`;
await build({stdin:{contents:`export{UnifiedPlanning,UnifiedCanvas}from${JSON.stringify(source)};import React from'react';export{React};`,resolveDir:root},outfile:join(folder,'ui.cjs'),bundle:true,platform:'node',format:'cjs',loader:{'.png':'dataurl'},alias:{react:root+'node_modules/react'},plugins:[{name:'contexts-only',setup(b){b.onResolve({filter:/.*/},a=>a.importer===source&&!a.path.startsWith('react')&&!/avatar-presets\.js|card-appearance\.tsx|CanvasMenu\.tsx|planning-card-menu\.mjs|planning-selection\.mjs|outline-fold-preference\.mjs|story-event-draft\.mjs|OutlineRow\.jsx|outline-row-style\.mjs|outline-row-interaction\.mjs|story-tracks\.mjs|story-workspace\.mjs|story-create-intent\.mjs|planning-canvas-geometry\.mjs|planning-card-presentation\.mjs|resource-error\.mjs|drafts\.js/.test(a.path)?{path:'contexts',namespace:'qa'}:undefined);b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:stub}));}}]});
const require=createRequire(import.meta.url),{UnifiedPlanning,UnifiedCanvas,React}=require(join(folder,'ui.cjs'));
const all=el=>!el||typeof el!=='object'?[]:[el,...React.Children.toArray(el.props?.children).flatMap(all)];
const text=el=>typeof el==='string'||typeof el==='number'?String(el):!el||typeof el!=='object'?'':React.Children.toArray(el.props?.children).map(text).join('');
function mount(call,novelId,initial){let index=0,seeded=false;const slots=[];const dispatcher={useContext(){return 'stable-user';},useState(initialValue){const i=index++;if(!(i in slots)){if(initialValue===null&&!seeded){slots[i]=initial;seeded=true;}else slots[i]=typeof initialValue==='function'?initialValue():initialValue;}return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},useRef(value){const i=index++;return slots[i]??={current:value};},useEffect(){},useMemo(create,deps){const i=index++,old=slots[i];if(!old||!deps||!old.deps||deps.length!==old.deps.length||deps.some((value,n)=>!Object.is(value,old.deps[n])))slots[i]={value:create(),deps:deps?.slice()};return slots[i].value;}};const render=()=>{index=0;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current=dispatcher;try{return UnifiedPlanning({call,novelId,tick:0,busy:false});}finally{holder.current=null;}};return {render,button:label=>all(render()).find(e=>e.type==='button'&&text(e)===label),editor:()=>all(render()).find(e=>e.type?.name==='CardEditor')};}
const value={title:'same author intent',summary:'保留原创建',content:'',status:'idea',purpose:'情节',cast:[],scope:[],time:{}};
function memoryStorage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};}
async function setup(){const base=join(folder,'data');await mkdir(base,{recursive:true});const service=await createService(await mkdtemp(join(base,'service-'))),novelId=(await service.rpc('novel.create',{title:'Synthetic planning UI'},'qa','human')).id,rpc=(action,args={})=>service.rpc(action,{novelId,...args},'qa','human');return {rpc,novelId};}
test('actual create handler preserves exact request through response loss, duplicate clicks, refresh/remount and newer data',async()=>{
 globalThis.localStorage=memoryStorage();const {rpc,novelId}=await setup(),initial=await rpc('story.get'),calls=[];let lose=true;
 const call=async(action,args)=>{if(action==='story.apply')calls.push(structuredClone(args));const result=await rpc(action,args);if(action==='story.apply'&&lose){lose=false;throw Object.assign(new Error('lost AFTER commit'),{code:'NETWORK_ERROR'});}return result;};
 let ui=mount(call,novelId,initial);ui.button('＋ 新建').props.onClick();ui.button('新建剧情卡').props.onClick();const save=ui.editor().props.save;await Promise.all([save(value),save({...value,title:'second accidental click'})]);
 assert.equal(calls.length,1);assert.equal(Object.keys((await rpc('story.get')).state.cards).length,1);assert.ok(ui.button('核对上次创建'));assert.equal(ui.editor(),undefined);
 const current=await rpc('story.get');await rpc('story.apply',{expectedRevision:current.state.revision,operation:{type:'card.create',value:{...value,title:'other device'},pageId:'main'}});
 ui=mount(call,novelId,await rpc('story.get'));assert.ok(ui.button('核对上次创建'));await ui.button('核对上次创建').props.onClick();assert.deepEqual(calls[1],calls[0]);assert.equal(Object.keys((await rpc('story.get')).state.cards).length,2);assert.equal(globalThis.localStorage.map.size,0);assert.equal(ui.button('核对上次创建'),undefined);
 const canvas=all(ui.render()).find(e=>e.type?.name==='UnifiedCanvas');assert.equal(Object.keys(canvas.props.state.cards).length,2,'receipt does not roll UI back over newer state');
});
test('actual create handler blocks send if durable retry intent cannot be saved',async()=>{
 globalThis.localStorage={getItem:()=>null,setItem(){throw new Error('QuotaExceededError');},removeItem(){}};const {rpc,novelId}=await setup();let writes=0;const ui=mount(async(a,args)=>{if(a==='story.apply')writes++;return rpc(a,args);},novelId,await rpc('story.get'));ui.button('＋ 新建').props.onClick();ui.button('新建剧情卡').props.onClick();await ui.editor().props.save(value);assert.equal(writes,0);assert.ok(text(ui.render()).includes('尚未发出新的创建请求'));assert.ok(ui.editor(),'draft remains editable');
});
test('actual create handler keeps editable draft after definitive validation failure rather than trapping pending receipt',async()=>{
 globalThis.localStorage=memoryStorage();const {rpc,novelId}=await setup();const ui=mount(async(a,args)=>{if(a==='story.apply')throw Object.assign(new Error('invalid time'),{code:'STORY_INVALID'});return rpc(a,args);},novelId,await rpc('story.get'));ui.button('＋ 新建').props.onClick();ui.button('新建剧情卡').props.onClick();await ui.editor().props.save(value);assert.ok(ui.editor());assert.equal(ui.button('核对上次创建'),undefined);assert.equal(globalThis.localStorage.map.size,0);
});
test('SVG uses live card dimensions, vertical containment, horizontal precedence arrow and theme-consistent colors',()=>{
 const nodes=[{id:'a',title:'卷<&',kind:'volume',width:248,height:208},{id:'b',title:'章',kind:'chapter',width:248,height:208}],points={a:{x:-300,y:40},b:{x:120,y:500}},edges=[{from:'a',to:'b',type:'contains'},{from:'b',to:'a',type:'precedence'}];
 const containment=planningConnection(edges[0],points,nodes),precedence=planningConnection(edges[1],points,nodes);assert.deepEqual(containment.from,{x:-176,y:248});assert.deepEqual(containment.to,{x:244,y:500});assert.deepEqual(precedence.from,{x:368,y:604});
 for(const theme of ['light','dark']){const {svg,w,h}=planningSvg(nodes,edges,points,theme);assert.match(svg,/width="248" height="208"/);assert.ok(svg.includes(containment.path));assert.ok(svg.includes(precedence.path));assert.ok(svg.includes(`stroke="${planningPalette[theme].contains}" stroke-width="2" stroke-dasharray="7 5"`));assert.ok(svg.includes(`stroke="${planningPalette[theme].precedence}" stroke-width="2" marker-end=`));assert.ok(svg.includes('卷&lt;&amp;'));assert.ok(w>668&&h>668);}
});

test('planning survives blocked localStorage getter and ignores malformed cached intent',async()=>{
 const {rpc,novelId}=await setup(),initial=await rpc('story.get');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError');}});
 let calls=0;const ui=mount(async(a,args)=>{if(a==='story.apply')calls++;return rpc(a,args);},novelId,initial);assert.ok(ui.render());ui.button('＋ 新建').props.onClick();ui.button('新建剧情卡').props.onClick();await ui.editor().props.save(value);assert.equal(calls,0);assert.ok(text(ui.render()).includes('尚未发出新的创建请求'));
 const storage=memoryStorage();Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:storage});
 storage.setItem(`cuigengji:story-create:stable-user:${novelId}`,JSON.stringify({novelId,requestId:'malformed',expectedRevision:0,operation:{type:'card.create'}}));
 const next=mount(rpc,novelId,initial);assert.ok(next.render());assert.equal(next.button('核对上次创建'),undefined);
});

test('actual Generate UI requires opt-in before relayout of all-already-visible hierarchy, preserves unrelated card',async()=>{
 globalThis.localStorage=memoryStorage();globalThis.testPlanningModules={pages:false,timeline:true,foreshadow:true};const sources={volumes:[{id:'v',title:'卷',order:0}],chapters:[{id:'a',title:'甲章',volumeId:'v',order:0},{id:'b',title:'乙章',volumeId:'v',order:1}]};let state=emptyWorkspace();reconcile(state,sources);state=applyStory(state,sources,{type:'card.create',value:{title:'自由卡'},pageId:'main',position:{x:999,y:111}},()=> 'loose');for(const [i,ref]of Object.keys(objectIndex(state,sources)).entries())if(!state.pages[0].instances[ref])state=applyStory(state,sources,{type:'instance.add',ref,pageId:'main',position:{x:30,y:50+i*250}},()=> 'unused');
 const before=structuredClone(state),writes=[],ui=mount(async(action,args)=>{writes.push(args);state=applyStory(state,sources,args.operation,()=> 'unused');return {state,sources,history:[{revision:state.revision,at:Date.now(),reason:'generation'}]};},'synthetic-generate',{state,sources,history:[]});
 all(ui.render()).find(e=>e.type==='button'&&e.props['aria-label']==='规划更多操作').props.onClick();ui.button('生成大纲视图').props.onClick();assert.equal(ui.button('确认生成').props.disabled,true);assert.ok(text(ui.render()).includes('尚未选择重排范围'));const checkbox=all(ui.render()).find(e=>e.type==='input'&&e.props.type==='checkbox');assert.ok(checkbox);checkbox.props.onChange({target:{checked:true}});assert.equal(ui.button('确认生成').props.disabled,false);await ui.button('确认生成').props.onClick();assert.equal(writes.length,1);assert.equal(writes[0].operation.pageId,'main');assert.equal(writes[0].operation.adoptHierarchy,true);assert.equal(writes[0].expectedRevision,before.revision);assert.deepEqual(state.pages[0].instances['card:loose'],before.pages[0].instances['card:loose']);assert.equal(state.pages[0].instances['chapter:a'].y,state.pages[0].instances['chapter:b'].y);delete globalThis.testPlanningModules;
});

test('unrelated material graph export keeps relationship names instead of reclassifying them as plot precedence',()=>{
 const {svg}=legacyCanvasSvg([{id:'a',name:'甲'},{id:'b',name:'乙'}],[{from:'a',to:'b',name:'师徒'}],{a:{x:0,y:0},b:{x:400,y:40}});assert.ok(svg.includes('师徒'));assert.ok(!svg.includes('data-relation="precedence"'));
});


test('actual planning view honors new-work global default and preserves per-work remembered view',async()=>{
 globalThis.localStorage=memoryStorage();const {rpc,novelId}=await setup(),initial=await rpc('story.get');
 try{
  for(const configured of ['timeline','canvas','outline']){
   globalThis.testPlanningPreferences={planningView:configured};
   globalThis.testPlanningPreferenceHook=(key,fallback)=>[fallback,()=>{}];
   let ui=mount(rpc,novelId,initial);assert.ok(ui.render().props.className.includes(`area-${configured}`));
   globalThis.testPlanningPreferenceHook=(key,fallback)=>[key.endsWith('v31-area')?'canvas':fallback,()=>{}];
   ui=mount(rpc,novelId,initial);assert.ok(ui.render().props.className.includes('area-canvas'),'remembered per-work view wins over global default');
  }
  globalThis.testPlanningPreferences={planningView:'timeline'};globalThis.testPlanningModules={pages:true,timeline:false,foreshadow:false,evolution:false};globalThis.testPlanningPreferenceHook=(key,fallback)=>[fallback,()=>{}];
  assert.ok(mount(rpc,novelId,initial).render().props.className.includes('area-outline'),'disabled timeline gets an available default');
 }finally{delete globalThis.testPlanningPreferences;delete globalThis.testPlanningPreferenceHook;delete globalThis.testPlanningModules;}
});


test('generation focuses committed canvas nodes once, never stale nodes or ordinary edits',async()=>{
 globalThis.localStorage=memoryStorage();globalThis.testPlanningModules={pages:false,timeline:true,foreshadow:true};
 const sources={volumes:[{id:'v',title:'卷',order:0}],chapters:[{id:'a',title:'甲章',volumeId:'v',order:0}]};
 let state=emptyWorkspace();reconcile(state,sources);state=applyStory(state,sources,{type:'card.create',value:{title:'自由卡'},pageId:'main',position:{x:999,y:111}},()=> 'loose');
 const before=structuredClone(state),ui=mount(async(action,args)=>{state=applyStory(state,sources,args.operation,()=> 'generated');return {state,sources,history:[]};},'focus',{state,sources,history:[]});
 const canvas=()=>all(ui.render()).find(e=>e.type===UnifiedCanvas);
 assert.equal(canvas().props.generationFocus,null);
 all(ui.render()).find(e=>e.type==='button'&&e.props['aria-label']==='规划更多操作').props.onClick();ui.button('生成大纲视图').props.onClick();
 await ui.button('确认生成').props.onClick();
 const props=canvas().props;assert.deepEqual(props.generationFocus,{pageId:'main',revision:state.revision});
 const effects=[],fits=[];let selected=['card:loose'],rendered=false;
 globalThis.testPlanningGraph=({nodes})=>({points:Object.fromEntries(nodes.map(n=>[n.id,n.position])),scroll:{current:{}},selected,select(ids){selected=ids;},fit(){assert.equal(rendered,true,'fit happens after render');assert.deepEqual(selected,[],'old selection cannot hide new outline');fits.push(nodes.map(n=>n.id));},cardProps:()=>({}),portProps:()=>({})});
 const renderCanvas=overrides=>{rendered=false;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current={useEffect:fn=>effects.push(fn),useState:value=>[typeof value==='function'?value():value,()=>{}],useRef:value=>({current:value})};try{UnifiedCanvas({...props,...overrides});}finally{holder.current=null;}rendered=true;while(effects.length)effects.shift()();};
 try{
  renderCanvas({state:before,page:before.pages[0],objects:objectIndex(before,sources)});assert.equal(fits.length,0,'old revision must not consume request');
  renderCanvas({page:{...props.page,id:'other'}});assert.equal(fits.length,0,'other page must not consume request');
  renderCanvas({unavailable:true});assert.equal(fits.length,0,'wait until save settles');
  renderCanvas({});assert.deepEqual(fits,[['card:loose','volume:v','chapter:a']]);assert.equal(canvas().props.generationFocus,null,'request consumed in parent, including across remounts');
  renderCanvas({generationFocus:null});assert.equal(fits.length,1,'ordinary edits do not refit');
  assert.deepEqual(state.pages[0].instances['card:loose'],before.pages[0].instances['card:loose']);
 }finally{delete globalThis.testPlanningGraph;delete globalThis.testPlanningModules;}
});

test('generation requests only the explicit successful destination, never a failed save',async()=>{
 globalThis.localStorage=memoryStorage();
 const sources={volumes:[{id:'v',title:'卷',order:0}],chapters:[]};
 try{
  for(const dedicated of [false,true])for(const fail of [false,true]){
   globalThis.testPlanningModules={pages:dedicated,timeline:true,foreshadow:true};
   let state=emptyWorkspace();reconcile(state,sources);const before=structuredClone(state),destinations=[];
   globalThis.testPlanningPreferenceHook=(key,fallback)=>[key.endsWith('v31-area')?'canvas':fallback,value=>{if(key.endsWith('v31-page'))destinations.push(value);}];
   const ui=mount(async(action,args)=>{if(fail)throw new Error('save rejected');state=applyStory(state,sources,args.operation,()=> 'dedicated');return {state,sources,history:[]};},`destination-${dedicated}-${fail}`,{state,sources,history:[]});
   all(ui.render()).find(e=>e.type==='button'&&e.props['aria-label']==='规划更多操作').props.onClick();ui.button('生成大纲视图').props.onClick();await ui.button('确认生成').props.onClick();
   const canvas=all(ui.render()).find(e=>e.type===UnifiedCanvas);
   if(fail){assert.equal(canvas.props.generationFocus,null);assert.deepEqual(destinations,[]);assert.deepEqual(state,before);}
   else{const destination=dedicated?state.pages.find(p=>p.generated).id:'main';assert.equal(canvas.props.generationFocus.pageId,destination);assert.deepEqual(destinations,dedicated?[destination]:[]);if(dedicated)assert.deepEqual(state.pages[0],before.pages[0],'dedicated generation leaves free page untouched');}
  }
 }finally{delete globalThis.testPlanningModules;delete globalThis.testPlanningPreferenceHook;}
});


test('outline mixed-selection Delete sends one atomic card-only operation and protects source chapters',async()=>{
 globalThis.localStorage=memoryStorage();globalThis.testPlanningPreferenceHook=(key,value)=>[key.endsWith('v31-area')?'outline':value,()=>{}];
 const sources={volumes:[{id:'v',title:'Volume',order:0}],chapters:[{id:'c',title:'Chapter',volumeId:'v',order:0}]};let state=emptyWorkspace();reconcile(state,sources);state=applyStory(state,sources,{type:'card.create',value:{title:'Plot'}},()=> 'plot');
 const confirmations=[],writes=[];globalThis.testPlanningDialog={ask:async()=>null,confirm:async text=>(confirmations.push(text),true)};
 const ui=mount(async(action,args)=>{writes.push(args);state=applyStory(state,sources,args.operation,()=> 'new');return {state,sources,history:[]};},'mixed-delete',{state,sources,history:[]});
 try{
  ui.button('多选').props.onClick();
  for(const title of ['Volume','Chapter','Plot'])all(ui.render()).find(e=>e.type==='input'&&e.props['aria-label']===`选择${title}`).props.onChange();
  assert.equal(ui.button('删除剧情卡／篇章（1）').props.disabled,false);
  const root=ui.render(),checkbox=all(root).find(e=>e.type==='input'&&e.props['aria-label']==='选择Plot');assert.equal(checkbox.props['data-planning-selection'],'true');const target={closest:selector=>selector.includes('input:not([data-planning-selection="true"])')?null:{}};let prevented=0;
  root.props.onKeyDown({key:'Delete',target,preventDefault(){prevented++;},stopPropagation(){}});
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(prevented,1);assert.equal(writes.length,1);assert.deepEqual(writes[0].operation,{type:'card.deleteMany',ids:['plot']});assert.match(confirmations[0],/2 个正文卷／章节将保留/);assert.match(confirmations[0],/不只是隐藏本页展示/);assert.ok(state.placements['chapter:c']);assert.ok(state.placements['volume:v']);assert.equal(state.cards.plot,undefined);
 }finally{delete globalThis.testPlanningPreferenceHook;delete globalThis.testPlanningDialog;}
});

test('outline search clears stale selected cards; cancelling batch confirmation leaves every source untouched',async()=>{
 globalThis.localStorage=memoryStorage();globalThis.testPlanningPreferenceHook=(key,value)=>[key.endsWith('v31-area')?'outline':value,()=>{}];
 const sources={volumes:[],chapters:[]};let state=emptyWorkspace();state=applyStory(state,sources,{type:'card.create',value:{title:'HiddenPlot'}},()=> 'a');let writes=0;
 globalThis.testPlanningDialog={ask:async()=>null,confirm:async()=>false};const ui=mount(async()=>{writes++;},'search-delete',{state,sources,history:[]});
 try{
  ui.button('多选').props.onClick();all(ui.render()).find(e=>e.type==='input'&&e.props['aria-label']==='选择HiddenPlot').props.onChange();await ui.button('删除剧情卡／篇章（1）').props.onClick();assert.equal(writes,0);
  all(ui.render()).find(e=>e.type==='input'&&e.props['aria-label']==='搜索大纲').props.onChange({target:{value:'no matches'}});
  assert.equal(ui.button('删除剧情卡／篇章（0）').props.disabled,true);assert.equal(writes,0);
 }finally{delete globalThis.testPlanningPreferenceHook;delete globalThis.testPlanningDialog;}
});

test('canvas custom-group filter hides unrelated cards without dropping canonical graph nodes or deleting hidden selection',()=>{
 const sources={volumes:[],chapters:[]};let state=emptyWorkspace();for(const id of ['a','b'])state=applyStory(state,sources,{type:'card.create',value:{title:id},pageId:'main'},()=>id);
 state=applyStory(state,sources,{type:'group.create',name:'Custom',refs:['card:b']},()=> 'group');
 const selected=['card:a','card:b'],calls=[],holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;let graphOptions;
 globalThis.testPlanningGraph=options=>(graphOptions=options,{points:Object.fromEntries(options.nodes.map(n=>[n.id,n.position])),selected,scroll:{current:null},cardProps:()=>({}),portProps:()=>({}),select:()=>{},fit:()=>{}});
 holder.current={useState:value=>[value,()=>{}],useRef:value=>({current:value}),useEffect:()=>{}};
 let view;
 try{view=UnifiedCanvas({state,sources,objects:objectIndex(state,sources),page:state.pages[0],people:[],groups:state.groups,groupFilter:'group',groupsEnabled:true,onDelete:async refs=>(calls.push(refs),true),save:async()=>true});}finally{holder.current=null;delete globalThis.testPlanningGraph;}
 assert.deepEqual(graphOptions.nodes.map(n=>n.id),['card:a','card:b'],'layout queue retains canonical nodes');assert.deepEqual(graphOptions.visibleIds,['card:b']);assert.deepEqual(all(view).filter(e=>e.type==='section'&&e.props['data-node-id']).map(e=>e.props['data-node-id']),['card:b']);
 const scroll=all(view).find(e=>e.props?.className?.includes('planning-canvas-scroll'));
 const toolbar=all(view).find(e=>e.props?.['aria-label']==='画布多选操作');assert.equal(toolbar.props.onKeyDown,scroll.props.onKeyDown,'selection toolbar also receives Delete after clicking Select All');
 toolbar.props.onKeyDown({key:'Delete',target:{closest:()=>null},preventDefault(){},stopPropagation(){}});assert.deepEqual(calls,[['card:b']]);
});

test('empty custom group explains how to add members rather than offering an ineffective offscreen fit',()=>{
 const sources={volumes:[],chapters:[]};let state=emptyWorkspace();state=applyStory(state,sources,{type:'card.create',value:{title:'Outside group'},pageId:'main'},()=> 'a');state=applyStory(state,sources,{type:'group.create',name:'Empty',refs:[]},()=> 'empty');
 const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
 globalThis.testPlanningGraph=options=>({points:Object.fromEntries(options.nodes.map(n=>[n.id,n.position])),selected:[],outOfView:true,scroll:{current:null},cardProps:()=>({}),portProps:()=>({}),select:()=>{},fit:()=>{throw new Error('empty group must not offer fit');}});
 holder.current={useState:value=>[value,()=>{}],useRef:value=>({current:value}),useEffect:()=>{}};let view;
 try{view=UnifiedCanvas({state,sources,objects:objectIndex(state,sources),page:state.pages[0],people:[],groups:state.groups,groupFilter:'empty',groupsEnabled:true,save:async()=>true});}finally{holder.current=null;delete globalThis.testPlanningGraph;}
 assert.match(text(view),/此分组在本页暂无内容/);assert.doesNotMatch(text(view),/内容在视野外/);assert.equal(all(view).filter(e=>e.type==='button'&&text(e)==='适应视图').length,0);
});


test('both timeline axes reuse protected selected-only deletion, confirmation, cancellation and editing guard',async()=>{
 globalThis.localStorage=memoryStorage();globalThis.testPlanningPreferenceHook=(key,value)=>[key.endsWith('v31-area')?'timeline':value,()=>{}];
 try{
  for(const mode of ['story','narration']){
   globalThis.testPlanningRelationClock={mode};
   const sources={volumes:[{id:'v',title:'Volume',order:0}],chapters:[{id:'c',title:'Chapter',volumeId:'v',order:0}]};
   let state=emptyWorkspace();reconcile(state,sources);for(const id of ['a','b','keep'])state=applyStory(state,sources,{type:'card.create',value:{title:id},pageId:'main'},()=>id);
   const writes=[],confirmations=[];let accept=false;
   globalThis.testPlanningDialog={ask:async()=>null,confirm:async message=>(confirmations.push(message),accept)};
   const ui=mount(async(action,args)=>{writes.push(args);state=applyStory(state,sources,args.operation,()=> 'new');return {state,sources,history:[]};},`timeline-delete-${mode}`,{state,sources,history:[]});
   const timeline=()=>all(ui.render()).find(e=>e.type?.name===(mode==='story'?'StoryTimeAxis':'UnifiedTimeline'));
   assert.equal(typeof timeline().props.onDelete,'function');
   const before=structuredClone(state),refs=['volume:v','chapter:c','card:a','card:b'];
   assert.equal(await timeline().props.onDelete(refs),false);assert.equal(writes.length,0);assert.deepEqual(state,before,'cancel does not delete or mutate selection sources');
   accept=true;assert.equal(await timeline().props.onDelete(refs),true);
   assert.equal(writes.length,1);assert.deepEqual(writes[0].operation,{type:'card.deleteMany',ids:['a','b']});
   assert.match(confirmations.at(-1),/2 个正文卷／章节将保留/);assert.match(confirmations.at(-1),/撤销规划修改/);
   assert.ok(state.cards.keep);assert.ok(state.placements['volume:v']);assert.ok(state.placements['chapter:c']);assert.equal(state.cards.a,undefined);assert.equal(state.cards.b,undefined);
   timeline().props.open(state.cards.keep);assert.ok(timeline().props.editor,'draft editor is open');
   assert.equal(await timeline().props.onDelete(['card:keep']),false);assert.equal(writes.length,1);assert.ok(state.cards.keep,'editing guard never discards an open draft');
  }
 }finally{delete globalThis.testPlanningRelationClock;delete globalThis.testPlanningPreferenceHook;delete globalThis.testPlanningDialog;}
});

test('both timeline undo callbacks use persisted story history and restore exact deleted cards and placements',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'moji-timeline-undo-')),service=await createService(dir),novelId=service.novelId;
 const call=(action,args={})=>service.rpc(action,{novelId,...args},'timeline-undo-test','human');
 globalThis.localStorage=memoryStorage();globalThis.testPlanningPreferenceHook=(key,value)=>[key.endsWith('v31-area')?'timeline':value,()=>{}];globalThis.testPlanningDialog={confirm:async()=>true,ask:async()=>null};
 try{
  let data=await call('story.get');
  for(const title of ['restore-a','restore-b','untouched'])data=await call('story.apply',{expectedRevision:data.state.revision,operation:{type:'card.create',value:{title},pageId:'main',position:{x:123,y:456}}});
  for(const mode of ['story','narration']){
   globalThis.testPlanningRelationClock={mode};const before=structuredClone(data.state),ids=Object.values(data.state.cards).filter(c=>c.title.startsWith('restore-')).map(c=>c.id);
   const ui=mount(async(action,args)=>{data=await call(action,args);return data;},novelId,data),timeline=()=>all(ui.render()).find(e=>e.type?.name===(mode==='story'?'StoryTimeAxis':'UnifiedTimeline'));
   assert.equal(await timeline().props.onDelete(ids.map(id=>'card:'+id)),true);assert.equal(timeline().props.canUndo,true);
   const persisted=await call('story.get');for(const id of ids)assert.equal(persisted.state.cards[id],undefined);
   await timeline().props.onUndo();const restored=(await call('story.get')).state;
   assert.deepEqual(restored.cards,before.cards,'undo preserves card identities and all contents/time arrangements');assert.deepEqual(restored.placements,before.placements);assert.deepEqual(restored.pages,before.pages);
  }
 }finally{delete globalThis.testPlanningRelationClock;delete globalThis.testPlanningPreferenceHook;delete globalThis.testPlanningDialog;await rm(dir,{recursive:true,force:true});}
});
