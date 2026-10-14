import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
const bundle=await build({entryPoints:[fileURLToPath(new URL('../vendor/cuigengji/src/client/shared/graph.tsx',import.meta.url))],bundle:true,jsx:"transform",write:false,format:'iife',globalName:'Graph',plugins:[{name:'hooks',setup(b){b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},()=>({path:'react',namespace:'shim'}));b.onLoad({filter:/.*/,namespace:'shim'},()=>({contents:'export const jsx=()=>null,jsxs=jsx,Fragment="fragment"; export const {useContext,useEffect,useLayoutEffect,useRef,useState}=globalThis.testReact; export default globalThis.testReact;'}));b.onLoad({filter:/[/\\]dialog\.tsx$/},()=>({contents:'export const useDialog=()=>({confirm:async()=>true});'}));b.onLoad({filter:/[/\\]shared[/\\]state\.js$/},()=>({contents:'export const SessionScope={}; export const readLocal=()=>null;'}));}}]});
function mount(options={}){
  let cursor=0;const hooks=[],timers=[];
  class Element{constructor(edit=false){this.edit=edit;}closest(selector){return this.edit&&/input|textarea|graph-editor/.test(selector)?this:null;}getBoundingClientRect(){return {left:0,top:0};}setPointerCapture(){}focus(){}contains(){return true;}}
  const element=new Element();Object.assign(element,{clientWidth:390,clientHeight:550});
  const react={useContext:()=> 'touch-test',useEffect(){},useLayoutEffect(){},createElement(){},useRef(value){const n=cursor++;return hooks[n]??=( {current:value});},useState(value){const n=cursor++;hooks[n]??={value:typeof value==='function'?value():value};return [hooks[n].value,v=>{hooks[n].value=typeof v==='function'?v(hooks[n].value):v;}];}};
  const ctx={testReact:react,Element,localStorage:{setItem(){},removeItem(){}},document:{elementFromPoint:()=>element},crypto,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},structuredClone};runInNewContext(bundle.outputFiles[0].text,ctx);
  const render=()=>{cursor=0;const graph=ctx.Graph.useGraph({nodes:[],edges:[],fallback:{},busy:false,scopeKey:'test',onLayout:()=>{throw new Error('Camera movement must not save novel data');},onConnect(){},...options});graph.scroll.current=element;return graph;};
  const event=(id,x,y,edit=false)=>({button:0,pointerType:'touch',pointerId:id,clientX:x,clientY:y,target:new Element(edit),currentTarget:element,preventDefault(){this.prevented=true;},stopPropagation(){}});
  return {render,event,flush:()=>timers.at(-1)?.()};
}
test('真实画布处理器：单指空白平移，双指锚点缩放，松手不改作品',()=>{
  const {render,event}=mount();let graph=render();graph.scrollProps.onPointerDown(event(1,100,100));graph.scrollProps.onPointerMove(event(1,140,150));graph=render();assert.equal(graph.camera.x,40);assert.equal(graph.camera.y,50);
  graph.scrollProps.onPointerDown(event(2,240,150));graph.scrollProps.onPointerMove(event(2,340,150));graph=render();assert.ok(graph.camera.zoom>1);graph.scrollProps.onPointerUp(event(2,340,150));graph.scrollProps.onPointerUp(event(1,140,150));assert.equal(render().lasso,null);
});
test('画布中的文字编辑不被平移和自定义菜单拦截',()=>{
  const {render,event}=mount();const graph=render(),down=event(1,50,50,true),menu=event(1,50,50,true);graph.scrollProps.onPointerDown(down);graph.scrollProps.onPointerMove(event(1,90,90,true));graph.scrollProps.onContextMenu(menu);assert.equal(menu.prevented,undefined);assert.equal(render().camera.x,0);
});
test('手指取消后下一次手势正常开始',()=>{
  const {render,event}=mount();let graph=render();graph.scrollProps.onPointerDown(event(1,30,30));graph.scrollProps.onPointerDown(event(2,130,30));graph.scrollProps.onPointerMove(event(2,160,30));graph.scrollProps.onPointerCancel();graph=render();const zoom=graph.camera.zoom;graph.scrollProps.onPointerDown(event(3,50,50));graph.scrollProps.onPointerMove(event(3,80,60));assert.equal(render().camera.zoom,zoom);
});
test('真实卡片拖动处理器：暂停前不写入，后台请求期间仍可继续移动',async()=>{
 const calls=[];let finish;const {render,event,flush}=mount({nodes:[{id:'a',revision:1,position:{x:40,y:60}}],onLayout:(...a)=>{calls.push(a);return new Promise(r=>finish=r);}});
 const mouse=(x,y)=>({...event(1,x,y),pointerType:'mouse'});
 let graph=render();graph.cardProps('a',()=>{}).onPointerDown(mouse(0,0));graph.scrollProps.onPointerMove(mouse(20,30));graph.scrollProps.onPointerUp(mouse(20,30));assert.equal(calls.length,0);
 flush();await Promise.resolve();graph=render();graph.cardProps('a',()=>{}).onPointerDown(mouse(20,30));graph.scrollProps.onPointerMove(mouse(50,70));graph.scrollProps.onPointerUp(mouse(50,70));graph=render();assert.equal(graph.points.a.x,90);assert.equal(graph.points.a.y,130);assert.equal(calls.length,1);finish(true);await Promise.resolve();await Promise.resolve();
});
