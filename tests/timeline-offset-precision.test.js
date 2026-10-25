import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import React from 'react';
import {applyStory,emptyWorkspace,reconcile} from '../src/domain/story-workspace.mjs';
const path=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url);
const code=buildSync({entryPoints:[new URL('NarrationOffsetInput.jsx',path).pathname],bundle:true,write:false,platform:'node',format:'cjs',external:['react']}).outputFiles[0].text;
function render(edge,value,percent=false){
 let message;const changes=[];
 const mock={...React,useRef:()=>({current:{setCustomValidity:v=>message=v}}),useEffect:fn=>fn()};
 const module={exports:{}},require=createRequire(import.meta.url);
 new Function('require','module','exports',code)(id=>id==='react'?mock:require(id),module,module.exports);
 const element=module.exports.NarrationOffsetInput({edge,value,percent,onChange:v=>changes.push(v)});
 return {props:element.props,message,changes};
}
test('chapter inputs preserve arbitrary drag/import precision and valid near-boundary offsets',()=>{
 for(const [edge,values] of [['start',[0,0.184375,0.999999]],['end',[0.000001,0.784375,1]]])for(const value of values){
  const {props,message}=render(edge,value);assert.equal(props.value,value);assert.equal(props.step,'any');assert.equal(props.required,true);assert.equal(message,'');
 }
});
test('empty, nonfinite, and exclusive-boundary offsets cannot silently become zero',()=>{
 for(const [edge,values] of [['start',['',null,NaN,Infinity,-Infinity,-0.1,1]],['end',['',null,NaN,Infinity,-Infinity,0,1.1]]])for(const value of values)assert.notEqual(render(edge,value).message,'');
 const {props,changes}=render('start',0.184375);
 props.onChange({target:{value:'',valueAsNumber:NaN}});props.onChange({target:{value:'0.184375',valueAsNumber:0.184375}});
 assert.deepEqual(changes,['',0.184375]);
});
test('invalid fields reveal every enclosing collapsed details element',()=>{
 const outer={tagName:'DETAILS',open:false,parentElement:null},inner={tagName:'DETAILS',open:false,parentElement:outer};
 render('start','').props.onInvalid({currentTarget:{parentElement:{tagName:'LABEL',parentElement:inner}}});
 assert.equal(inner.open,true);assert.equal(outer.open,true);
});
test('actual story model retains drag precision through edit-save and rejects invalid offsets',()=>{
 const sources={volumes:[],chapters:[{id:'a'},{id:'b'},{id:'c'}]};
 let state=emptyWorkspace();reconcile(state,sources);
 state=applyStory(state,sources,{type:'card.create',value:{title:'Synthetic',time:{narration:{startChapterId:'c',startOffset:0.184375,endChapterId:'c',endOffset:0.784375,trackId:'main'}}}},()=> 'test-card');
 const id=Object.keys(state.cards)[0],original=structuredClone(state.cards[id].time);
 state=applyStory(state,sources,{type:'card.update',id,expectedRevision:state.cards[id].revision,value:{...state.cards[id],storyDateText:'edited after drag'}},()=> 'unused');
 assert.deepEqual(state.cards[id].time,original);assert.equal(state.cards[id].storyDateText,'edited after drag');
 for(const [key,values] of [['startOffset',['',NaN,Infinity,-1,1]],['endOffset',['',NaN,Infinity,0,2]]])for(const value of values)assert.throws(()=>applyStory(state,sources,{type:'card.update',id,expectedRevision:state.cards[id].revision,value:{time:{narration:{...original.narration,[key]:value}}}},()=> 'unused'),/叙述跨度/);
});
test('shared CardEditor and DSH boundary use the precision-preserving control',()=>{
 const source=readFileSync(new URL('UnifiedPlanning.jsx',path),'utf8');assert.match(source,/<NarrationOffsetInput edge=\{key\}/);assert.doesNotMatch(source,/step="0\.01"/);
 const shared=readFileSync(new URL('../integrations/chatgpt-workbench/client/native-shared-ui.mjs',import.meta.url),'utf8');assert.match(shared,/vendor\/cuigengji\/src\/client\/index.tsx/);
});

// Execute the shipped drag scheduler, rather than duplicating its conversion math.
test('drag scheduler yields the precise chapter offsets accepted by the editor',()=>{
 const source=readFileSync(new URL('UnifiedTimeline.jsx',path),'utf8');
 const expression=source.slice(source.indexOf('const schedule=')+'const schedule='.length,source.indexOf('\n const unschedule=' )).trim().replace(/;$/,'');
 const chapters=[{id:'a'},{id:'b'},{id:'c'}],calls=[];
 const schedule=new Function('chapters','mode','origin','clamp','save','return ('+expression+');')(chapters,'narration',0,(v,a,b)=>Math.max(a,Math.min(b,v)),operation=>calls.push(operation));
 schedule({id:'c',revision:1,time:{}},2.184375,2.784375,'main',0);
 const time=calls[0].value.time.narration;
 assert.equal(time.startChapterId,'c');assert.equal(time.startOffset,2.184375-2);
 assert.equal(render('start',time.startOffset).message,'');assert.equal(render('end',time.endOffset).message,'');
 assert.notEqual(time.startOffset*100%1,0,'old step=0.01 would reject the unchanged drag coordinate');
});

test('internal point percentages preserve near-boundary precision and validate the same domain',()=>{
 const {props,message,changes}=render('start',0.999999,true);assert.equal(message,'');assert.equal(props.value,99.9999);assert.equal(props.step,'any');assert.equal(props.max,100);
 props.onChange({target:{value:'18.4375',valueAsNumber:18.4375}});assert.deepEqual(changes,[0.184375]);
 assert.notEqual(render('start',1,true).message,'');
 const source=readFileSync(new URL('InternalPoints.jsx',path),'utf8');assert.match(source,/<NarrationOffsetInput edge="start" percent/);assert.doesNotMatch(source,/Math.round\(p.location.narration.offset/);
});

test('relation occurrence editor uses precise percentages without quantizing existing points',()=>{
 const source=readFileSync(new URL('RelationChangeEditor.jsx',path),'utf8');assert.match(source,/<NarrationOffsetInput edge="start" percent label="章内位置" disabled=/);assert.doesNotMatch(source,/Math.round\(location.narration.offset/);
});
