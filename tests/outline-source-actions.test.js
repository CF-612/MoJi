import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {readFileSync} from 'node:fs';
const built=await build({entryPoints:['integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/OutlineRow.jsx'],bundle:true,write:false,format:'esm',platform:'node',tsconfigRaw:{compilerOptions:{jsx:'react'}},plugins:[{name:'outline-hooks',setup(b){b.onResolve({filter:/^react$/},()=>({path:'react',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const useRef=v=>({current:v});export const useEffect=()=>{};export default {createElement:(type,props,...children)=>({type,props:{...props,children}})};`}));}}]});
const {OutlineSourceTitle,OutlineSourceSummary}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const event=(detail=1)=>({detail,button:0,pointerId:1,clientX:0,clientY:0,pointerType:'mouse',preventDefault(){},stopPropagation(){}});
test('immutable source title click toggles once; double-click never edits or reverses the toggle; keyboard click works',()=>{
 let toggles=0;const el=OutlineSourceTitle({title:'第一章',fold:false,onToggle:()=>toggles++});el.props.onClick(event(1));el.props.onClick(event(2));el.props.onDoubleClick(event(2));assert.equal(toggles,1);el.props.onClick(event(0));assert.equal(toggles,2);assert.equal(el.props['aria-expanded'],true);
 assert.equal(el.props.children[0].type,'span');assert.equal(el.props.children[1].type,'svg');
});
test('summary single click does not edit; double-click and keyboard edit existing summary once',()=>{
 let edits=0;const el=OutlineSourceSummary({title:'第一章',summary:'梗概',onEdit:()=>edits++});el.props.onPointerDown(event());el.props.onPointerUp();el.props.onClick(event());assert.equal(edits,0);el.props.onDoubleClick(event(2));assert.equal(edits,1);el.props.onKeyDown({...event(),key:'Enter'});assert.equal(edits,2);
 const disabled=OutlineSourceSummary({title:'卷',summary:'梗概',disabled:true,onEdit:()=>edits++});disabled.props.onDoubleClick(event(2));disabled.props.onKeyDown({...event(),key:'Enter'});assert.equal(edits,2);
});
test('summary touch long press edits once, drag cancels; source titles bypass these edit gestures',async()=>{
 let edits=0;let el=OutlineSourceSummary({title:'章',summary:'梗概',onEdit:()=>edits++});el.props.onPointerDown({...event(),pointerType:'touch'});await new Promise(r=>setTimeout(r,580));el.props.onPointerUp();el.props.onClick(event());assert.equal(edits,1);
 el=OutlineSourceSummary({title:'章',summary:'梗概',onEdit:()=>edits++});el.props.onPointerDown({...event(),pointerType:'touch'});el.props.onPointerMove({...event(),clientX:20});await new Promise(r=>setTimeout(r,580));assert.equal(edits,1);
});
test('volume and chapter share title folding while multiselect and plot editing remain distinct',()=>{
 const source=readFileSync('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx','utf8');assert.match(source,/obj.kind!=='card'&&!multi\?<OutlineSourceTitle/);assert.match(source,/obj.kind!=='card'&&!multi\?<OutlineSourceSummary/);assert.match(source,/onClick={\(\)=>multi\?choose\(ref\):open\(ref\)}/);assert.match(source,/OutlineRow volume={false}/);
});
