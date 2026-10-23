import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {emptyWorkspace,reconcile,applyStory,moveError,objectIndex} from '../vendor/cuigengji/src/domain/story-workspace.mjs';
const bundle=await build({entryPoints:[fileURLToPath(new URL('../vendor/cuigengji/src/client/shared/graph.tsx',import.meta.url))],bundle:true,jsx:"transform",write:false,format:'iife',globalName:'Graph',plugins:[{name:'hooks',setup(b){b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},()=>({path:'react',namespace:'shim'}));b.onLoad({filter:/.*/,namespace:'shim'},()=>({contents:'export const jsx=()=>null,jsxs=jsx,Fragment="fragment"; export const {useContext,useEffect,useLayoutEffect,useRef,useState}=globalThis.testReact; export default globalThis.testReact;'}));b.onLoad({filter:/[/\\]dialog\.tsx$/},()=>({contents:'export const useDialog=()=>({confirm:async()=>true});'}));b.onLoad({filter:/[/\\]shared[/\\]state\.js$/},()=>({contents:'export const SessionScope={}; export const readLocal=key=>key.endsWith(":draft")?null:globalThis.initialCamera||null;'}));}}]});
function mount(options={},withEffects=false,initialCamera=null){
  let cursor=0,pointTarget;const hooks=[],timers=[],effects=[],resizeObservers=[],listeners=new Map();
  const eventTarget={addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener(name,fn){listeners.get(name)?.delete(fn);}};
  class Element{constructor(edit=false,dataset={}){this.edit=edit;this.dataset=dataset;}closest(selector){if(this.edit&&/input|textarea|graph-editor/.test(selector))return this;if(this.dataset.graphPort&&selector.includes('[data-graph-port]'))return this;if(this.dataset.nodeId&&selector.includes('[data-node-id]'))return this;if(this.dataset.graphPort&&/(^|,)button/.test(selector))return this;return null;}getBoundingClientRect(){return {left:0,top:0};}setPointerCapture(){}focus(){}contains(){return true;}addEventListener(){}removeEventListener(){}}
  const element=new Element();Object.assign(element,{clientWidth:390,clientHeight:550,offsetWidth:390});
  const react={useContext:()=> 'touch-test',useEffect(fn,deps){if(!withEffects)return;const n=cursor++,old=hooks[n];if(!old||deps.some((d,i)=>d!==old.deps[i])){hooks[n]={deps,cleanup:old?.cleanup};effects.push(()=>{hooks[n].cleanup?.();hooks[n].cleanup=fn();});}},useLayoutEffect(fn,deps){react.useEffect(fn,deps);},createElement(){},useRef(value){const n=cursor++;return hooks[n]??=( {current:value});},useState(value){const n=cursor++;hooks[n]??={value:typeof value==='function'?value():value};return [hooks[n].value,v=>{hooks[n].value=typeof v==='function'?v(hooks[n].value):v;}];}};
  const ctx={testReact:react,Element,initialCamera,ResizeObserver:class{constructor(fn){this.fn=fn;resizeObservers.push(fn);}observe(){this.fn();}disconnect(){}},localStorage:{setItem(){},removeItem(){}},window:{...eventTarget,clearTimeout(){},setTimeout:fn=>(timers.push(fn),timers.length)},document:{...eventTarget,elementFromPoint:()=>pointTarget||element,activeElement:element},crypto,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){},structuredClone};runInNewContext(bundle.outputFiles[0].text,ctx);
  const render=()=>{cursor=0;const graph=ctx.Graph.useGraph({nodes:[],edges:[],fallback:{},busy:false,scopeKey:'test',onLayout:()=>{throw new Error('Camera movement must not save novel data');},onConnect(){},...options});graph.scroll.current=element;graph.surface.current=element;while(effects.length)effects.shift()();return graph;};
  const event=(id,x,y,edit=false)=>({button:0,pointerType:'touch',pointerId:id,clientX:x,clientY:y,target:new Element(edit),currentTarget:element,preventDefault(){this.prevented=true;},stopPropagation(){}});
  return {render,event,resize:(width,height)=>{element.clientWidth=width;element.clientHeight=height;for(const fn of resizeObservers)fn();},unmount:()=>{for(const hook of hooks)hook?.cleanup?.();},flush:()=>timers.at(-1)?.(),port:(id,side)=>new Element(false,{nodeId:id,graphPort:side}),pointAt:target=>{pointTarget=target;},key:key=>{const e={key,target:element,preventDefault(){this.prevented=true;}};for(const fn of listeners.get('keydown')||[])fn(e);return e;}};
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

const keyClick=()=>({detail:0,stopPropagation(){}});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function planningFixture(){
 const sources={volumes:[{id:'v',order:0},{id:'w',order:1}],chapters:[{id:'a',volumeId:'v',order:0},{id:'b',volumeId:'w',order:0}]};let state=emptyWorkspace();reconcile(state,sources);state=applyStory(state,sources,{type:'card.create',value:{title:'卷中的中间卡'},parent:'volume:v'},()=> 'under-volume');state=applyStory(state,sources,{type:'card.create',value:{title:'章中的中间卡'},parent:'chapter:a'},()=> 'under-chapter');
 const nodes=Object.keys(objectIndex(state,sources)).map((id,i)=>({id,revision:1,position:{x:i*300,y:20},width:248,height:208}));
 const canConnect=(from,to,axis)=>from!==to&&(axis==='vertical'?state.placements[to]?.parent!==from&&!moveError(state,sources,[to],from):!state.precedence.some(e=>e.from===from&&e.to===to));
 return {state,sources,nodes,canConnect};
}
test('四固定端口：开始后仅同轴反向且业务合法的目标激活，源点可取消',()=>{
 const fixture=planningFixture(),{render}=mount({nodes:fixture.nodes,canConnect:fixture.canConnect},true);let graph=render();for(const side of ['top','bottom','left','right'])assert.equal(graph.portProps('volume:v',side,'上卷').disabled,false);graph.portProps('volume:v','bottom','上卷').onClick(keyClick());graph=render();assert.equal(graph.wireAxis,'vertical');assert.equal(graph.portProps('chapter:b','top','乙章').disabled,false);assert.equal(graph.portProps('volume:v','bottom','上卷').disabled,false);
 for(const side of ['bottom','left','right'])assert.equal(graph.portProps('chapter:b',side,'乙章').disabled,true);assert.equal(graph.portProps('volume:v','top','上卷').disabled,true);assert.equal(graph.portProps('volume:w','top','下卷').disabled,true);assert.match(graph.portProps('volume:w','top','下卷').className,/port-unavailable/);graph.portProps('volume:v','bottom','上卷').onClick(keyClick());assert.equal(render().wire,null);
 graph=render();graph.portProps('chapter:b','left','乙章').onClick(keyClick());graph=render();assert.equal(graph.wireAxis,'horizontal');assert.equal(graph.portProps('chapter:a','right','甲章').disabled,false);for(const side of ['top','bottom','left'])assert.equal(graph.portProps('chapter:a',side,'甲章').disabled,true);
});
test('四端口目标复用共享层级校验：直接、经剧情卡间接包含同类卷章和祖先循环均禁用',()=>{
 const fixture=planningFixture(),{render}=mount({nodes:fixture.nodes,canConnect:fixture.canConnect},true);
 for(const [from,to] of [['volume:v','volume:w'],['card:under-volume','volume:w'],['chapter:a','chapter:b'],['card:under-chapter','chapter:b'],['card:under-volume','volume:v']]){
  let graph=render();graph.portProps(from,'bottom',from).onClick(keyClick());graph=render();assert.equal(graph.portProps(to,'top',to).disabled,true,`${from} must not contain ${to}`);graph.cancel();
  graph=render();graph.portProps(to,'top',to).onClick(keyClick());graph=render();assert.equal(graph.portProps(from,'bottom',from).disabled,true,`reverse gesture must keep ${from} -> ${to} invalid`);graph.cancel();
 }
});
test('真实键盘处理器：Enter/Space 的合成点击开始，Esc 取消，重新选择合法目标完成包含',async()=>{
 const fixture=planningFixture(),calls=[],options={nodes:fixture.nodes,canConnect:fixture.canConnect,edges:[],onConnect:async(from,to,axis)=>{calls.push({from,to,axis});options.edges=[{from,to,type:'contains'}];return true;}},h=mount(options,true);let graph=h.render();graph.portProps('volume:v','bottom','上卷').onClick(keyClick());assert.equal(h.render().wire.id,'volume:v');assert.equal(h.key('Escape').prevented,true);assert.equal(h.render().wire,null);assert.equal(calls.length,0);
 graph=h.render();graph.portProps('chapter:b','top','乙章').onClick(keyClick());graph=h.render();assert.equal(graph.portProps('volume:v','bottom','上卷').disabled,false);graph.portProps('volume:v','bottom','上卷').onClick(keyClick());await settle();graph=h.render();assert.deepEqual(calls,[{from:'volume:v',to:'chapter:b',axis:'vertical'}]);assert.equal(graph.wire,null);h.render();assert.equal(h.render().saving,false);
});
test('章节左右先后允许反向既有关系，不偷偷引入 DAG；相同方向重复和自身禁用',async()=>{
 const fixture=planningFixture(),calls=[];fixture.state.precedence.push({id:'ab',from:'chapter:a',to:'chapter:b'});const options={nodes:fixture.nodes,edges:fixture.state.precedence,canConnect:fixture.canConnect,onConnect:async(from,to,axis)=>{calls.push({from,to,axis});fixture.state.precedence.push({id:'ba',from,to});options.edges=[...fixture.state.precedence];return true;}},h=mount(options,true);let graph=h.render();graph.portProps('chapter:b','right','乙章').onClick(keyClick());graph=h.render();assert.equal(graph.portProps('chapter:a','left','甲章').disabled,false);assert.equal(graph.portProps('chapter:b','left','乙章').disabled,true);graph.portProps('chapter:a','left','甲章').onClick(keyClick());await settle();h.render();graph=h.render();assert.deepEqual(calls,[{from:'chapter:b',to:'chapter:a',axis:'horizontal'}]);assert.equal(fixture.state.precedence.length,2);
 graph.portProps('chapter:a','right','甲章').onClick(keyClick());graph=h.render();assert.equal(graph.portProps('chapter:b','left','乙章').disabled,true);assert.equal(fixture.canConnect('chapter:a','chapter:b','vertical'),false);
});
test('真实触屏拖线：目标端口按轴命中，使用当前卡片尺寸的上下端点完成',async()=>{
 const fixture=planningFixture(),calls=[],h=mount({nodes:fixture.nodes,canConnect:fixture.canConnect,onConnect:async(...args)=>{calls.push(args);return false;}},true);let graph=h.render();const source=h.port('volume:v','bottom'),target=h.port('chapter:b','top'),down={...h.event(9,124,228),target:source,currentTarget:source};graph.portProps('volume:v','bottom','上卷').onPointerDown(down);h.pointAt(target);graph.scrollProps.onPointerMove(h.event(9,500,500));graph=h.render();assert.equal(graph.wire.target,'chapter:b');assert.match(graph.preview,/M124 228/);graph.scrollProps.onPointerUp(h.event(9,500,500));await settle();assert.deepEqual(calls,[['volume:v','chapter:b','vertical']]);assert.equal(h.render().wire,null);
});
test('等待位置保存时取消并改起点，不得提交旧连线意图',async()=>{
 const fixture=planningFixture(),calls=[];let finish;const h=mount({nodes:fixture.nodes,canConnect:fixture.canConnect,onLayout:()=>new Promise(resolve=>{finish=resolve;}),onConnect:async(...args)=>{calls.push(args);return false;}},true);let graph=h.render();graph.arrange({'chapter:a':{x:31,y:42}});graph=h.render();graph.portProps('chapter:a','right','甲章').onClick(keyClick());graph=h.render();graph.portProps('chapter:b','left','乙章').onClick(keyClick());await settle();assert.equal(typeof finish,'function');graph=h.render();graph.cancel();graph=h.render();graph.portProps('volume:w','right','下卷').onClick(keyClick());finish(true);await settle();assert.equal(calls.length,0,'cancelled connection must not write after its layout await resolves');assert.equal(h.render().wire.id,'volume:w');
});
test('等待位置保存时取消后从同一点重开，旧目标仍然失效',async()=>{
 const fixture=planningFixture(),calls=[];let finish;const h=mount({nodes:fixture.nodes,canConnect:fixture.canConnect,onLayout:()=>new Promise(resolve=>{finish=resolve;}),onConnect:async(...args)=>{calls.push(args);return false;}},true);let graph=h.render();graph.arrange({'chapter:a':{x:31,y:42}});graph=h.render();graph.portProps('chapter:a','right','甲章').onClick(keyClick());graph=h.render();graph.portProps('chapter:b','left','乙章').onClick(keyClick());await settle();graph=h.render();graph.cancel();graph=h.render();graph.portProps('chapter:a','right','甲章').onClick(keyClick());finish(true);await settle();assert.equal(calls.length,0);assert.equal(h.render().wire.id,'chapter:a');
});
test('等待位置保存时仅移动指针，不取消已经确认的连线目标',async()=>{
 const fixture=planningFixture(),calls=[];let finish;const h=mount({nodes:fixture.nodes,canConnect:fixture.canConnect,onLayout:()=>new Promise(resolve=>{finish=resolve;}),onConnect:async(...args)=>{calls.push(args);return false;}},true);let graph=h.render();graph.arrange({'chapter:a':{x:31,y:42}});graph=h.render();graph.portProps('chapter:a','right','甲章').onClick(keyClick());graph=h.render();graph.portProps('chapter:b','left','乙章').onClick(keyClick());await settle();graph=h.render();graph.scrollProps.onPointerMove(h.event(7,123,456));finish(true);await settle();assert.deepEqual(calls,[['chapter:a','chapter:b','horizontal']]);assert.equal(h.render().wire,null);
});

test('切换画布卸载后，后台布局完成不再提交旧页面连线',async()=>{
 const fixture=planningFixture(),calls=[];let finish;const h=mount({nodes:fixture.nodes,canConnect:fixture.canConnect,onLayout:()=>new Promise(resolve=>{finish=resolve;}),onConnect:async(...args)=>{calls.push(args);return false;}},true);let graph=h.render();graph.arrange({'chapter:a':{x:31,y:42}});graph=h.render();graph.portProps('chapter:a','right','甲章').onClick(keyClick());graph=h.render();graph.portProps('chapter:b','left','乙章').onClick(keyClick());await settle();h.unmount();finish(true);await settle();assert.equal(calls.length,0);
});

test('窄屏初次打开恢复视野外的旧相机；后续主动平移不被自动打断，适应仅改视图',()=>{
 const nodes=[{id:'a',revision:1,position:{x:590,y:60},width:248,height:208}],h=mount({nodes,recoverOffscreen:true},true,{x:0,y:0,zoom:1});h.render();let graph=h.render();assert.equal(graph.outOfView,false);assert.ok(graph.camera.x<0);assert.equal(graph.points.a.x,590);
 graph.scrollProps.onPointerDown(h.event(1,100,100));graph.scrollProps.onPointerMove(h.event(1,-1900,100));graph.scrollProps.onPointerUp(h.event(1,-1900,100));graph=h.render();assert.equal(graph.outOfView,true);const pan=graph.camera.x;h.render();assert.equal(h.render().camera.x,pan);graph.fit();graph=h.render();assert.equal(graph.outOfView,false);assert.equal(graph.points.a.x,590);h.unmount();
});
test('画布缩窄导致原本可见的全部内容离屏时恢复视图，保留已保存坐标',()=>{
 const nodes=[{id:'a',revision:1,position:{x:590,y:60},width:248,height:208}],h=mount({nodes,recoverOffscreen:true},true,{x:-500,y:0,zoom:1});h.render();h.resize(1200,550);let graph=h.render();assert.equal(graph.outOfView,false);h.resize(200,550);graph=h.render();assert.equal(graph.outOfView,false);assert.equal(graph.points.a.x,590);h.unmount();
});

test('material ports connect across axes and same sides without imposing plot direction, duplicate or cycle constraints',async()=>{
 for(const sourceSide of ['top','bottom','left','right'])for(const targetSide of ['top','bottom','left','right']){
  const calls=[],nodes=[{id:'character',revision:1,position:{x:0,y:0}},{id:'world',revision:1,position:{x:400,y:300}}],h=mount({nodes,edges:[{from:'character',to:'world'},{from:'world',to:'character'}],freePorts:true,canConnect:(a,b)=>a!==b,onConnect:async(...args)=>{calls.push(args);return false;}},true);
  let g=h.render();g.portProps('character',sourceSide,'人物').onClick(keyClick());g=h.render();assert.equal(g.portProps('world',targetSide,'世界').disabled,false);assert.equal(g.portProps('character',targetSide,'人物').disabled,sourceSide!==targetSide);g.portProps('world',targetSide,'世界').onClick(keyClick());await settle();assert.equal(calls.length,1);const [from,to,axis,ports]=calls[0];assert.equal(ports[from==='character'?'fromPort':'toPort'],sourceSide);assert.equal(ports[to==='world'?'toPort':'fromPort'],targetSide);assert.equal(axis,['top','bottom'].includes(sourceSide)?'vertical':'horizontal');
 }
});
