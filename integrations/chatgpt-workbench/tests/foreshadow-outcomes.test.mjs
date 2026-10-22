import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createService} from '../server/service.mjs';
import {legacyForeshadow,nodeProgress} from '../../../src/domain/foreshadow-nodes.js';

async function setup(t){const path=await mkdtemp(join(tmpdir(),'moji-outcomes-'));t.after(()=>rm(path,{recursive:true,force:true}));const s=await createService(path);return {s,call:(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'outcome-test','human')};}
const value={title:'未回收的信',content:'保留作者说明',memoryRefs:[],evidence:[],plotNodes:[],resolution:'active'};
test('active progress is retained; new open outcomes rejected with or without nodes; abandoned requires a reason',async t=>{
 const {call,s}=await setup(t);
 for(const invalid of [{status:'open'},{resolution:'open'},{resolution:'open',plotNodes:undefined}])await assert.rejects(call('writing.foreshadow.create',{confirmed:true,value:{...value,...invalid}}),{code:'INVALID_WRITING'});
 const active=await call('writing.foreshadow.create',{confirmed:true,value});assert.equal(active.status,'planned');
 await assert.rejects(call('writing.foreshadow.update',{id:active.id,expectedRevision:active.revision,confirmed:true,value:{resolution:'open'}}),{code:'INVALID_WRITING'});
 await assert.rejects(call('writing.foreshadow.update',{id:active.id,expectedRevision:active.revision,confirmed:true,value:{resolution:'abandoned'}}),{code:'INVALID_WRITING'});
 const ended=await call('writing.foreshadow.update',{id:active.id,expectedRevision:active.revision,confirmed:true,value:{resolution:'abandoned',abandonReason:'支线已删，保留来路'}});assert.equal(ended.status,'abandoned');assert.equal((await call('writing.foreshadow.get',{id:ended.id})).due,false);
 const resumed=await call('writing.foreshadow.update',{id:ended.id,expectedRevision:ended.revision,confirmed:true,value:{resolution:'active'}});assert.equal(resumed.status,'planned');assert.equal(resumed.abandonReason,ended.abandonReason);
 const fail=m=>{throw Error(m);};for(const [kinds,status]of [[[],'planned'],[['plant'],'planted'],[['plant','progress'],'developing'],[['plant','recover'],'partial']])assert.equal(nodeProgress([],kinds.map(kind=>({kind})),'active',fail),status);
 assert.throws(()=>nodeProgress([],[],'complete',fail));assert.equal(nodeProgress([],[{kind:'plant'},{kind:'recover'}],'complete',fail),'recovered');
 const ch=await call('chapter.get',{chapterId:s.chapterId}),saved=await call('chapter.update',{chapterId:ch.id,expectedRevision:ch.revision,content:'发现信件。信件的秘密揭开。'});
 const recovered=await call('writing.foreshadow.create',{confirmed:true,value:{...value,resolution:'complete',evidence:[{kind:'plant',chapterId:saved.id,revision:saved.revision,evidence:'发现信件。'},{kind:'recover',chapterId:saved.id,revision:saved.revision,evidence:'信件的秘密揭开。'}]}});assert.equal(recovered.status,'recovered');
});
test('legacy load/import reads abandoned, preserves backup/history/evidence and updates safely',async t=>{
 const {s,call}=await setup(t),ch=await call('chapter.get',{chapterId:s.chapterId}),saved=await call('chapter.update',{chapterId:ch.id,expectedRevision:ch.revision,content:'旧版埋设的信件仍在原文中。'}),created=await call('writing.foreshadow.create',{confirmed:true,value:{...value,evidence:[{kind:'plant',chapterId:saved.id,revision:saved.revision,evidence:'旧版埋设的信件仍在原文中。'}]}});
 const backup=await call('novel.export'),legacy=backup.novel.writing.foreshadows[created.id];legacy.status='open';legacy.resolution='open';legacy.versions=[{revision:0,value:{...structuredClone(legacy),versions:undefined},timestamp:legacy.createdAt,actor:legacy.actor,reason:'旧版记录'}];
 const mismatched=structuredClone(backup.novel);mismatched.writing.foreshadows[created.id].status='planned';assert.throws(()=>s.store.validateProject(mismatched));
 const original=structuredClone(backup.novel);s.store.validateProject(backup.novel);assert.deepEqual(backup.novel,original,'validation must not rewrite backups');
 const options={mode:'copy',title:'旧版导入'},file={name:'旧版.json',json:backup};const preview=await call('transfer.preview',{file,options});assert.equal(preview.valid,true,preview.conflicts?.join(','));
 const imported=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),novelId=imported.novelIds[0];const rpc=(action,args={})=>s.rpc(action,{novelId,...args},'legacy-test','human');
 const [read]=await rpc('writing.foreshadow.list');assert.equal(read.status,'abandoned');assert.equal(read.resolution,'abandoned');assert.match(read.abandonReason,/旧版/);assert.equal(read.content,legacy.content);assert.deepEqual(read.evidence.map(({chapterId,...e})=>e),legacy.evidence.map(({chapterId,...e})=>e));assert.equal((await rpc('chapter.get',{chapterId:read.evidence[0].chapterId})).content,'旧版埋设的信件仍在原文中。');assert.equal(read.due,false);
 assert.equal((await rpc('writing.foreshadow.get',{id:read.id})).status,'abandoned');assert.equal((await rpc('writing.board.get')).foreshadows[0].status,'abandoned');
 const raw=(await rpc('novel.export')).novel.writing.foreshadows[read.id];assert.equal(raw.status,'open');assert.equal(raw.versions[0].value.resolution,'open');
 const history=await rpc('writing.history',{collection:'foreshadows',id:read.id});assert.equal(history.versions[0].value.status,'open');
 const edited=await rpc('writing.foreshadow.update',{id:read.id,expectedRevision:read.revision,confirmed:true,value:{content:'只修改说明'}});assert.equal(edited.status,'abandoned');assert.equal(edited.id,read.id);assert.deepEqual(edited.plotNodes,raw.plotNodes);assert.equal(edited.versions.at(-1).value.status,'open');
 const restored=await rpc('writing.restore',{collection:'foreshadows',id:read.id,expectedRevision:edited.revision,targetRevision:read.revision});assert.equal(restored.status,'abandoned');assert.equal((await rpc('writing.foreshadow.get',{id:read.id})).status,'abandoned');
 assert.equal(legacyForeshadow({...legacy,plotNodes:undefined,resolution:undefined}).status,'abandoned');
 assert.equal(legacyForeshadow({...legacy,status:'planned',resolution:'active'}).status,'planned');
});
test('UI offers abandonment with a reason, not open ending, including dashboard and chapter ribbon',async()=>{
 const base=new URL('../vendor/cuigengji/src/client/',import.meta.url);
 for(const path of ['features/planning/StoryForeshadows.jsx','features/structure/Overview.jsx','shared/ChapterRibbon.jsx']){const source=await readFile(new URL(path,base),'utf8');assert.doesNotMatch(source,/开放结局|\['open'/);assert.match(source,/abandoned/);if(path.includes('StoryForeshadows')){assert.match(source,/放弃原因/);assert.match(source,/abandonReason:value.abandonReason/);}}
});

test('actual progress editor offers active/complete/abandoned and submits the reason without losing nodes',async t=>{
 const {build}=await import('esbuild'),{createRequire}=await import('node:module');
 const folder=await mkdtemp(join(tmpdir(),'moji-outcome-ui-'));t.after(()=>rm(folder,{recursive:true,force:true}));
 const root=new URL('../../../',import.meta.url).pathname,source=new URL('../vendor/cuigengji/src/client/features/planning/StoryForeshadows.jsx',import.meta.url).pathname;
 const stub=`export const useResource=()=>({value:null}),usePreference=(k,v)=>[v,()=>{}],useDraft=(k,initial)=>{globalThis.outcomeDraft??=initial;return {value:globalThis.outcomeDraft,base:initial,change:f=>globalThis.outcomeDraft=f(globalThis.outcomeDraft),accept:()=>{},dirty:true}},useWritingRequest=call=>call,useDialog=()=>({confirm:async()=>true}),Modal=()=>null,WritingHistory=()=>null,foreshadowStyle='';`;
 await build({stdin:{contents:`export{ShadowEditor}from${JSON.stringify(source)};import React from'react';export{React};`,resolveDir:root},outfile:join(folder,'ui.cjs'),bundle:true,platform:'node',format:'cjs',alias:{react:root+'node_modules/react'},plugins:[{name:'editor-harness',setup(b){b.onLoad({filter:/StoryForeshadows\.jsx$/},async()=>({contents:(await readFile(source,'utf8'))+'\nexport {ShadowEditor};',loader:'jsx'}));b.onResolve({filter:/.*/},a=>a.importer===source&&!a.path.startsWith('react')?{path:'contexts',namespace:'qa'}:undefined);b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:stub}));}}]});
 const {ShadowEditor,React}=createRequire(import.meta.url)(join(folder,'ui.cjs')),calls=[],f={...value,id:'f',status:'planned',revision:3,plotNodes:[{id:'n',cardId:'c',kind:'plant',note:'原节点',evidence:null}]};
 let index=0;const slots=[],dispatcher={useState(v){const i=index++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],n=>slots[i]=n];}};
 delete globalThis.outcomeDraft;t.after(()=>delete globalThis.outcomeDraft);
 const render=()=>{index=0;const holder=React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;holder.current=dispatcher;try{return ShadowEditor({call:async(a,args)=>calls.push({a,args}),novelId:'novel',storyRevision:4,f,mode:'resolution',cards:new Map(),chapters:[],saved:()=>{},close:()=>{}});}finally{holder.current=null;}};
 const all=el=>!el||typeof el!=='object'?[]:[el,...React.Children.toArray(el.props?.children).flatMap(all)];
 let tree=all(render());assert.deepEqual(tree.filter(e=>e.type==='input'&&e.props.type==='radio').map(e=>e.props.value),['active','complete','abandoned']);
 tree.find(e=>e.type==='input'&&e.props.value==='abandoned').props.onChange();tree=all(render());assert.ok(tree.find(e=>e.type==='textarea').props.required);assert.ok(tree.find(e=>e.type==='button'&&e.props.type==='submit').props.disabled);
 tree.find(e=>e.type==='textarea').props.onChange({target:{value:'支线取消，依据保留'}});tree=all(render());assert.equal(tree.find(e=>e.type==='button'&&e.props.type==='submit').props.disabled,false);
 tree.find(e=>e.type==='form').props.onSubmit({preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));assert.equal(calls.length,1);assert.equal(calls[0].a,'story.foreshadow.save');assert.equal(calls[0].args.value.resolution,'abandoned');assert.equal(calls[0].args.value.abandonReason,'支线取消，依据保留');assert.deepEqual(calls[0].args.value.plotNodes,f.plotNodes);assert.equal(calls[0].args.expectedForeshadowRevision,3);
});
