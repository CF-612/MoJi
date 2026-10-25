import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {build,transform} from 'esbuild';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {novelFormStyles} from '../vendor/cuigengji/src/client/shared/novel-form-style.ts';

const source=fileURLToPath(new URL('../vendor/cuigengji/src/client/shared/presentation.tsx',import.meta.url));
// Execute the actual form and its event handlers. Modal lifecycle/keyboard focus is
// covered by the native-bundle browser fixture, not approximated in this unit test.
const result=await build({entryPoints:[source],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',loader:{'.png':'dataurl','.jpg':'dataurl'},plugins:[{name:'modal-boundary',setup(builder){builder.onResolve({filter:/^\.\/preferences\.tsx$/},()=>({path:'modal',namespace:'fixture'}));builder.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function Modal(props){return props.children}',loader:'js'}));}}]});
const module={exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {NovelForm,PixelCoverHelp,readImage}=module.exports;
const children=node=>React.Children.toArray(node?.props?.children);
const all=node=>!node||typeof node!=='object'?[]:[node,...children(node).flatMap(all)];
const text=node=>typeof node==='string'||typeof node==='number'?String(node):children(node).map(text).join('');
function mount(overrides={}){
 const props={busy:false,save:async()=>{},close(){},...overrides},slots=[];
 let index=0;
 const dispatcher={useState(initial){const i=index++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];}};
 const render=()=>{index=0;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current=dispatcher;try{return NovelForm(props);}finally{holder.current=null;}};
 return {props,render,find:predicate=>all(render()).find(predicate),button:label=>all(render()).find(node=>node.type==='button'&&(node.props['aria-label']===label||text(node)===label)),field:label=>all(render()).find(node=>node.type==='label'&&text(node).startsWith(label))?.props.children.find?.(node=>node?.type==='input'||node?.type==='textarea')};
}

test('new-work form retains fields and title validation without always-visible cover options',()=>{
 const ui=mount();
 assert.equal(ui.render().props.title,'新建作品');
 for(const label of ['书名','类型','简介','创作状态'])assert.ok(ui.field(label),label);
 assert.equal(ui.field('书名').props.required,true);
 assert.doesNotMatch(text(ui.render()),/仅影响缩放显示/);
 assert.ok(ui.find(node=>node.type===PixelCoverHelp));
 assert.ok(!all(ui.find(node=>node.type==='label'&&node.props.className==='inline-check')).some(node=>node.type===PixelCoverHelp),'hint trigger is outside the checkbox label');
 assert.equal(ui.field('类型').props.maxLength,80);
 assert.equal(ui.field('创作状态').props.maxLength,80);
 assert.equal(ui.button('创建作品').props.disabled,true);
 ui.field('书名').props.onChange({target:{value:'   '}});
 assert.equal(ui.button('创建作品').props.disabled,true);
 ui.field('书名').props.onChange({target:{value:'第一部故事'}});
 assert.equal(ui.button('创建作品').props.disabled,false);
 assert.equal(ui.button('选择作品封面').props['aria-expanded'],false);
 assert.equal(ui.button('选择作品封面').props['aria-haspopup'],'dialog');
 assert.equal(ui.find(node=>node.props?.title==='选择封面'),undefined);
 assert.equal(ui.button('使用内置封面 1'),undefined);
});

test('cover options open in a secondary modal, close independently and preserve selection/upload behavior',()=>{
 const ui=mount();
 ui.button('选择作品封面').props.onClick();
 assert.equal(ui.button('选择作品封面').props['aria-expanded'],true);
 let picker=ui.find(node=>node.props?.title==='选择封面');
 assert.ok(picker,'cover choices use the existing modal focus and Escape lifecycle');
 let stopped=false;ui.find(node=>node.props?.className==='novel-cover-dialog-boundary').props.onCancel({stopPropagation(){stopped=true;}});
 assert.equal(stopped,true,'secondary Escape must not bubble into the create dialog');
 assert.equal(all(picker).filter(node=>node.type==='button'&&/^使用内置封面/.test(node.props['aria-label']||'')).length,3);
 assert.ok(all(picker).find(node=>node.props?.label==='上传自己的封面'));
 picker.props.close();
 assert.equal(ui.button('选择作品封面').props['aria-expanded'],false);
 ui.button('选择作品封面').props.onClick();
 ui.button('使用内置封面 2').props.onClick();
 assert.equal(ui.find(node=>node.props?.title==='选择封面'),undefined);
 assert.match(ui.find(node=>node.type?.name==='BookCover').props.book.coverImage,/^data:image\/jpeg;base64,/);
 ui.button('选择作品封面').props.onClick();
 const upload=ui.find(node=>node.props?.label==='上传自己的封面');
 upload.props.onChange('data:image/png;base64,synthetic');
 assert.equal(ui.find(node=>node.type?.name==='BookCover').props.book.coverImage,'data:image/png;base64,synthetic');
 assert.equal(ui.find(node=>node.props?.title==='选择封面'),undefined);
});

test('save receives the same complete payload, failed saves retain edits, and cancel remains separate',async()=>{
 const saved=[];let cancelled=0;
 const ui=mount({save:async value=>{saved.push(value);return false;},close:()=>cancelled++});
 for(const [label,value] of [['书名','新故事'],['类型','奇幻'],['简介','一句简介'],['创作状态','计划中']])ui.field(label).props.onChange({target:{value}});
 ui.find(node=>node.type==='input'&&node.props.type==='checkbox').props.onChange({target:{checked:true}});
 await ui.find(node=>node.type==='form').props.onSubmit({preventDefault(){}});
 assert.deepEqual(saved,[{title:'新故事',genre:'奇幻',description:'一句简介',workStatus:'计划中',coverImage:null,coverMode:'pixel'}]);
 assert.equal(ui.field('书名').props.value,'新故事');
 assert.match(text(ui.render()),/保存未完成/);
 assert.equal(cancelled,0);
 ui.button('取消').props.onClick();assert.equal(cancelled,1);
 const edit=mount({initial:{id:'existing',title:'原作',genre:'短篇',description:'简介',workStatus:'完结',coverImage:'original',coverMode:'pixel'},busy:true});
 assert.equal(edit.render().props.title,'作品详情');
 assert.equal(edit.button('保存详情').props.disabled,true);
 assert.equal(edit.button('选择作品封面').props.disabled,true);
 assert.equal(edit.field('书名').props.value,'原作');
 assert.equal(edit.find(node=>node.type?.name==='BookCover').props.book.coverImage,'original');
 await assert.rejects(readImage({type:'text/plain',size:1}),/PNG/);
 await assert.rejects(readImage({type:'image/png',size:1024*1024+1}),/1 MB/);
});

test('form styling is local, responsive and keeps all interactive controls reachable',async()=>{
 assert.doesNotMatch(novelFormStyles,/(?:^|[}\n])\s*(?:html|body|:root)\b/);
 assert.match(novelFormStyles,/@container cg-novel-form/);
 assert.match(novelFormStyles,/min-height:44px/);
 assert.match(novelFormStyles,/\.novel-cover-modal/);
 assert.match(novelFormStyles,/button:focus-visible/);
 assert.match(novelFormStyles,/\.inline-check>span \{min-width:0;overflow-wrap:anywhere;/);
 assert.deepEqual((await transform(novelFormStyles,{loader:'css'})).warnings,[]);
});


test('pixel-cover hint supports mouse, keyboard, touch toggle, Escape and outside dismissal',()=>{
 const listeners=new Map(),original=globalThis.document;
 globalThis.document={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type);}};
 let state=false,cleanup,refIndex=0;const ref={current:{contains:target=>target==='inside',querySelector:()=>({matches:()=>false})}};
 const refs=[ref,{current:false}];
 const dispatcher={useState:()=>[state,next=>state=typeof next==='function'?next(state):next],useId:()=>':pixel-help-test:',useRef:()=>refs[refIndex++],useEffect:effect=>{cleanup?.();cleanup=effect();}};
 const render=()=>{refIndex=0;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current=dispatcher;try{return PixelCoverHelp();}finally{holder.current=null;}};
 const trigger=()=>all(render()).find(node=>node.type==='button');
 const tooltip=()=>all(render()).find(node=>node.props?.role==='tooltip');
 try{
  assert.equal(tooltip(),undefined);
  assert.equal(trigger().props['aria-label'],'像素图封面说明');
  // Touch focus is not focus-visible: the subsequent click must open, not undo focus-open.
  trigger().props.onFocus({currentTarget:{matches:()=>false}});
  trigger().props.onClick();assert.ok(tooltip());
  assert.equal(trigger().props['aria-describedby'],tooltip().props.id);
  assert.equal(text(tooltip()),'仅影响缩放显示，适合像素画；普通插画、照片无需勾选。');
  trigger().props.onClick();assert.equal(tooltip(),undefined);
  render().props.onPointerEnter({pointerType:'touch'});assert.equal(tooltip(),undefined);
  render().props.onPointerEnter({pointerType:'mouse'});assert.ok(tooltip());
  render().props.onPointerLeave({pointerType:'mouse'});assert.equal(tooltip(),undefined);
  render().props.onPointerEnter({pointerType:'mouse'});trigger().props.onClick();assert.ok(tooltip(),'first pointer click pins the hover-open hint');
  render().props.onPointerLeave({pointerType:'mouse'});assert.ok(tooltip(),'pinned hint remains until explicitly dismissed');
  trigger().props.onClick();assert.equal(tooltip(),undefined);
  trigger().props.onFocus({currentTarget:{matches:()=>true}});assert.ok(tooltip());
  let prevented=false,stopped=false;
  listeners.get('keydown')({key:'Escape',preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});
  assert.equal(tooltip(),undefined);assert.equal(prevented,true);assert.equal(stopped,true);
  trigger().props.onClick();assert.ok(tooltip());
  listeners.get('pointerdown')({target:'inside'});assert.ok(tooltip());
  listeners.get('pointerdown')({target:'outside'});assert.equal(tooltip(),undefined);
  trigger().props.onFocus({currentTarget:{matches:()=>true}});assert.ok(tooltip());
  trigger().props.onBlur();assert.equal(tooltip(),undefined);
  assert.match(novelFormStyles,/width:min\(280px,100%\)/);
  assert.match(novelFormStyles,/bottom:100%/);
 }finally{cleanup?.();globalThis.document=original;}
});
