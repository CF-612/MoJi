// Exercise shipped pointer handlers without launching a browser. Effects are intentionally
// omitted; geometry and pointer capture are supplied by an isolated viewport double.
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({entryPoints:['integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/useTimelineMarquee.jsx'],bundle:true,write:false,format:'esm',platform:'node',jsx:'transform',plugins:[{name:'hook-harness',setup(b){
 b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},()=>({path:'react',namespace:'harness'}));
 b.onResolve({filter:/^\.\/state\.js$/},()=>({path:'state',namespace:'harness'}));
 b.onLoad({filter:/.*/,namespace:'harness'},args=>({contents:args.path==='state'?`export const SessionScope={};export const readLocal=()=>null;`:`
 export const useRef=v=>{const h=globalThis.__graphHooks,i=h.index++;return h.values[i]??=( {current:v} );};
 export const useState=v=>{const h=globalThis.__graphHooks,i=h.index++;if(!(i in h.values))h.values[i]=v;return [h.values[i],n=>h.values[i]=typeof n==='function'?n(h.values[i]):n];};
 export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment=Symbol();export const useContext=()=>'';export const useEffect=()=>{};export const useLayoutEffect=()=>{};export default {};`}));
}}]});
const {useTimelineMarquee}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
class Target {constructor(card=false){this.card=card;}closest(){return this.card?this:null;}}
function harness(t){
 const oldElement=globalThis.Element,oldWindow=globalThis.window;globalThis.Element=Target;globalThis.window={addEventListener(){},removeEventListener(){}};
 t.after(()=>{globalThis.Element=oldElement;globalThis.window=oldWindow;delete globalThis.__graphHooks;});globalThis.__graphHooks={index:0,values:[]};
 const capture=new Set(),blocked=[],chosen=[],cards=[{id:'a',left:200,top:150,width:50,height:40},{id:'b',left:260,top:150,width:50,height:40},{id:'same-column',left:200,top:300,width:50,height:40}];
 const viewport={current:{scrollLeft:40,scrollTop:70,getBoundingClientRect:()=>({left:100,top:80}),setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id),querySelectorAll:()=>cards.map(card=>({getBoundingClientRect:()=>card,getAttribute:()=>card.id}))}};
 const opts={viewport,cardSelector:'.card',idAttribute:'data-id',editing:false,onBlocked:e=>blocked.push(e),onSelection:id=>chosen.push(id)};
 const render=()=>{globalThis.__graphHooks.index=0;return useTimelineMarquee(opts);};
 const event=(x,y,extra={})=>({clientX:x,clientY:y,button:2,pointerId:9,pointerType:'mouse',shiftKey:false,ctrlKey:false,metaKey:false,target:new Target(),preventDefault(){},stopPropagation(){},...extra});
 return{render,event,opts,capture,blocked,chosen};
}
test('timeline marquee uses actual rendered rectangles and scroll-aware overlay; right card is not consumed',t=>{
 const h=harness(t);let m=h.render();assert.equal(m.onPointerDown(h.event(180,130,{target:new Target(true)})),false);
 assert.equal(m.onPointerDown(h.event(180,130)),true);assert.ok(h.capture.has(9));
 assert.equal(m.onPointerMove(h.event(182,132)),true);assert.deepEqual(h.render().selectedIds,[]);
 m.onPointerMove(h.event(320,210));m=h.render();assert.deepEqual(m.selectedIds,['a','b']);
 assert.deepEqual({...m.overlay.props.style,left:undefined,top:undefined}.position,'absolute');assert.equal(m.overlay.props.style.left,120);assert.equal(m.overlay.props.style.top,120);
 assert.equal(m.onContextMenu(h.event(320,210)),true);assert.equal(m.onPointerUp(h.event(320,210)),true);assert.equal(h.capture.size,0);assert.equal(h.render().overlay,null);
 assert.equal(m.onContextMenu(h.event(320,210)),true);m.onPointerDown(h.event(200,160,{target:new Target(true)}));assert.equal(m.onContextMenu(h.event(200,160)),false);
});
test('timeline canceled additive selection restores previous IDs; wrong pointer ignored; touch preserved',t=>{
 const h=harness(t);let m=h.render();m.select('same-column');m=h.render();
 assert.equal(m.onPointerDown(h.event(180,130,{pointerType:'touch'})),false);
 m.onPointerDown(h.event(180,130,{shiftKey:true}));assert.equal(m.onPointerMove(h.event(320,210,{pointerId:88})),false);
 m.onPointerMove(h.event(320,210));assert.deepEqual(h.render().selectedIds,['same-column','a','b']);assert.equal(m.onPointerCancel(h.event(320,210,{pointerId:88})),false);
 m.onPointerCancel(h.event(320,210));assert.deepEqual(h.render().selectedIds,['same-column']);assert.equal(h.capture.size,0);
});
test('active editing refuses marquee and selection without clearing or calling selection callback',t=>{
 const h=harness(t);let m=h.render();m.select('a');h.opts.editing=true;m=h.render();const count=h.chosen.length;
 assert.equal(m.onPointerDown(h.event(180,130)),false);assert.equal(m.select('b'),false);assert.deepEqual(h.render().selectedIds,['a']);assert.equal(h.chosen.length,count);assert.equal(h.blocked.length,2);assert.equal(h.capture.size,0);
});
test('early platform contextmenu is deferred for a click but discarded for a drag',t=>{
 const h=harness(t),menus=[];h.opts.onBlankContextMenu=e=>menus.push(e);let m=h.render();
 m.onPointerDown(h.event(180,130));assert.equal(m.onContextMenu(h.event(180,130)),true);assert.equal(menus.length,0);m.onPointerUp(h.event(181,131));assert.equal(menus.length,1);
 m.onPointerDown(h.event(180,130));m.onContextMenu(h.event(180,130));m.onPointerMove(h.event(320,210));m.onPointerUp(h.event(320,210));assert.equal(menus.length,1);
});
