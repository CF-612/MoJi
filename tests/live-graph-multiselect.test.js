// Shipped shared graph pointer handlers. Synthetic pointer capture is explicit;
// this is not a claim about native OS right-button gestures or physical touch.
import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
const built=await build({entryPoints:['integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph.tsx'],bundle:true,write:false,format:'esm',platform:'node',jsx:'transform',plugins:[{name:'shared-graph-hooks',setup(b){
 b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},()=>({path:'react',namespace:'harness'}));
 b.onResolve({filter:/^\.\/state\.js$|^\.\.\/dialog\.tsx$|^\.\/layout-queue\.mjs$/},()=>({path:'contexts',namespace:'harness'}));
 b.onLoad({filter:/.*/,namespace:'harness'},args=>({contents:args.path==='contexts'?`export const SessionScope={};export const readLocal=()=>null;export const useDialog=()=>({confirm:async()=>true});export const sharedLayoutQueue=()=>({snapshot:()=>({dirty:false}),flush:async()=>true,enqueue(){},sync(){},points:()=>({})});`:`
 export const useRef=value=>{const h=globalThis.__liveGraphHooks,index=h.index++;return h.values[index]??=({current:value});};
 export const useState=value=>{const h=globalThis.__liveGraphHooks,index=h.index++;if(!(index in h.values))h.values[index]=typeof value==='function'?value():value;return [h.values[index],next=>h.values[index]=typeof next==='function'?next(h.values[index]):next];};
 export const jsx=()=>null,jsxs=()=>null,Fragment=Symbol();export const useContext=()=>'';export const useEffect=()=>{};export const useLayoutEffect=()=>{};export default {};`}));
}}]});
const {useGraph}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
class Target{constructor(id){this.dataset=id?{nodeId:id}:{};}closest(selector){return selector==='[data-node-id]'&&this.dataset.nodeId?this:null;}}
function fixture(t){
 const before={Element:globalThis.Element,localStorage:globalThis.localStorage,window:globalThis.window};Object.assign(globalThis,{Element:Target,localStorage:{setItem(){}},window:{setTimeout,clearTimeout}});globalThis.__liveGraphHooks={index:0,values:[]};
 t.after(()=>{Object.assign(globalThis,before);delete globalThis.__liveGraphHooks;});
 const capture=new Set(),contexts=[],viewport=new Target();let focused=0;
 Object.assign(viewport,{getBoundingClientRect:()=>({left:0,top:0}),focus(){focused++;},setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)});
 const options={nodes:[{id:'a',revision:1,position:{x:0,y:0}},{id:'b',revision:1,position:{x:400,y:0}}],edges:[],fallback:{},busy:false,scopeKey:'test',onLayout:async()=>true,onConnect:async()=>true,onContext:context=>contexts.push(context)};
 const render=()=>{globalThis.__liveGraphHooks.index=0;const graph=useGraph(options);graph.scroll.current=viewport;return graph;};
 const event=(target=new Target(),extra={})=>({target,currentTarget:viewport,button:0,pointerId:1,pointerType:'mouse',clientX:20,clientY:20,detail:1,preventDefault(){},stopPropagation(){},...extra});
 return {render,event,options,viewport,contexts,focused:()=>focused};
}
test('live graph optional multiselect toggles cards without modifier and normal click still replaces selection',t=>{
 const h=fixture(t);let graph=h.render();graph.select(['a']);h.options.multiSelect=true;graph=h.render();graph.cardProps('b',()=>{}).onClick(h.event(new Target('b')));assert.deepEqual(h.render().selected,['a','b']);
 graph=h.render();graph.cardProps('a',()=>{}).onClick(h.event(new Target('a')));assert.deepEqual(h.render().selected,['b']);
 h.options.multiSelect=false;graph=h.render();graph.cardProps('a',()=>{}).onClick(h.event(new Target('a')));assert.deepEqual(h.render().selected,['a']);
});
test('captured touch-up toggles pressed B, not first selected A, and never opens editor in multiselect',async t=>{
 const h=fixture(t);h.options.multiSelect=true;let graph=h.render(),opened=[];graph.select(['a','b']);graph=h.render();graph.cardProps('a',()=>opened.push('a'));graph.cardProps('b',()=>opened.push('b'));
 graph.scrollProps.onPointerDown(h.event(new Target('b'),{pointerType:'touch'}));
 graph.scrollProps.onPointerUp(h.event(h.viewport,{pointerType:'touch'}));await Promise.resolve();
 assert.deepEqual(h.render().selected,['a']);assert.deepEqual(opened,[]);
});
test('desktop card pointerdown focuses canvas so subsequent Delete reaches its scoped handler',t=>{
 const h=fixture(t),graph=h.render();graph.cardProps('a',()=>{}).onPointerDown(h.event(new Target('a')));assert.equal(h.focused(),1);
});
test('live graph right-blank marquee retains selected refs for context menu without a content mutation',t=>{
 const h=fixture(t);let graph=h.render();graph.scrollProps.onPointerDown(h.event(new Target(),{button:2,clientX:-10,clientY:-10}));graph.scrollProps.onPointerMove(h.event(new Target(),{button:2,clientX:700,clientY:300}));graph.scrollProps.onPointerUp(h.event(new Target(),{button:2,clientX:700,clientY:300}));graph=h.render();assert.deepEqual(graph.selected,['a','b']);assert.equal(h.contexts.length,0);
 graph.scrollProps.onPointerDown(h.event(new Target(),{button:2,clientX:900,clientY:400}));graph.scrollProps.onPointerUp(h.event(new Target(),{button:2,clientX:900,clientY:400}));assert.deepEqual(h.contexts[0].selected,['a','b']);
});
