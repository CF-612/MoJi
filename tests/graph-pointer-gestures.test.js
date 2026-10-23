// Exercise shipped pointer handlers without launching a browser. Effects are intentionally
// omitted; geometry and pointer capture are supplied by an isolated viewport double.
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({entryPoints:['src/client/shared/graph.tsx'],bundle:true,write:false,format:'esm',platform:'node',jsx:'transform',plugins:[{name:'hook-harness',setup(b){
 b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},()=>({path:'react',namespace:'harness'}));
 b.onResolve({filter:/^\.\/state\.js$/},()=>({path:'state',namespace:'harness'}));
 b.onLoad({filter:/.*/,namespace:'harness'},args=>({contents:args.path==='state'?`export const SessionScope={};export const readLocal=()=>null;`:`
 export const useRef=v=>{const h=globalThis.__graphHooks,i=h.index++;return h.values[i]??=( {current:v} );};
 export const useState=v=>{const h=globalThis.__graphHooks,i=h.index++;if(!(i in h.values))h.values[i]=v;return [h.values[i],n=>h.values[i]=typeof n==='function'?n(h.values[i]):n];};
 export const jsx=()=>null,jsxs=()=>null,Fragment=Symbol();export const useContext=()=>'';export const useEffect=()=>{};export const useLayoutEffect=()=>{};export default {};`}));
}}]});
const {useGraph}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
class Target {closest(){return null;}}
function harness(t){
 const oldElement=globalThis.Element,oldStorage=globalThis.localStorage;
 globalThis.Element=Target;globalThis.localStorage={setItem(){}};
 t.after(()=>{globalThis.Element=oldElement;globalThis.localStorage=oldStorage;delete globalThis.__graphHooks;});
 globalThis.__graphHooks={index:0,values:[]};
 const captured=new Set(),contexts=[],writes=[];
 const viewport={getBoundingClientRect:()=>({left:20,top:30}),focus(){},setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id)};
 const opts={nodes:[{id:'a',revision:1,position:{x:40,y:40}},{id:'b',revision:1,position:{x:400,y:40}},{id:'other-row',revision:1,position:{x:40,y:600}}],edges:[],fallback:{},busy:false,scopeKey:'test',onLayout:async points=>{writes.push(points);return true;},onConnect:async()=>true,onContext:v=>contexts.push(v)};
 let graph;const render=()=>{globalThis.__graphHooks.index=0;graph=useGraph(opts);graph.scroll.current=viewport;return graph;};render();
 const event=(x,y,button=0,extra={})=>({clientX:x,clientY:y,button,pointerId:7,pointerType:'mouse',shiftKey:false,ctrlKey:false,metaKey:false,target:new Target(),currentTarget:viewport,preventDefault(){},stopPropagation(){},...extra});
 return {render,event,contexts,writes,captured,opts};
}
test('left blank pans only after threshold, releases capture, and never persists cards',t=>{
 const h=harness(t);let g=h.render();g.select(['a']);g=h.render();
 g.scrollProps.onPointerDown(h.event(800,400));assert.ok(h.captured.has(7));
 g.scrollProps.onPointerMove(h.event(802,402));assert.equal(h.render().camera.x,0);
 g.scrollProps.onPointerMove(h.event(850,420));g.scrollProps.onPointerUp(h.event(850,420));g=h.render();
 assert.deepEqual(g.camera,{x:50,y:20,zoom:1});assert.deepEqual(g.selected,['a']);assert.equal(h.captured.size,0);assert.equal(h.writes.length,0);
 g.scrollProps.onPointerDown(h.event(800,400));g.scrollProps.onPointerUp(h.event(800,400));assert.deepEqual(h.render().selected,[]);
});
test('right blank marquee selects only intersecting cards; cancel restores prior selection',t=>{
 const h=harness(t);let g=h.render();g.select(['other-row']);g=h.render();
 g.scrollProps.onPointerDown(h.event(30,40,2));g.scrollProps.onContextMenu(h.event(30,40,2));assert.equal(h.contexts.length,0);
 g.scrollProps.onPointerMove(h.event(700,260,2));assert.deepEqual(h.render().selected,['a','b']);assert.ok(h.render().lasso);
 g.scrollProps.onPointerCancel();g=h.render();assert.deepEqual(g.selected,['other-row']);assert.equal(g.lasso,null);assert.equal(h.captured.size,0);
 g.scrollProps.onPointerDown(h.event(30,40,2,{ctrlKey:true}));g.scrollProps.onPointerMove(h.event(700,260,2));g.scrollProps.onPointerUp(h.event(700,260,2));
 g.scrollProps.onContextMenu(h.event(700,260,2));assert.equal(h.contexts.length,0);assert.deepEqual(h.render().selected,['other-row','a','b']);assert.equal(h.writes.length,0);
});
test('right click still opens menu, left card click selects without opening, busy allows pan',t=>{
 const h=harness(t);let g=h.render();
 g.scrollProps.onPointerDown(h.event(900,400,2));g.scrollProps.onPointerUp(h.event(901,401,2));g.scrollProps.onContextMenu(h.event(901,401,2));assert.equal(h.contexts.length,1);
 let opened=0;g.cardProps('a',()=>opened++).onClick(h.event(70,80,0,{detail:1}));assert.equal(opened,0);assert.deepEqual(h.render().selected,['a']);
 h.opts.busy=true;g=h.render();g.scrollProps.onPointerDown(h.event(800,400));g.scrollProps.onPointerMove(h.event(830,420));g.scrollProps.onPointerUp(h.event(830,420));assert.equal(h.render().camera.x,30);assert.equal(h.writes.length,0);
});
