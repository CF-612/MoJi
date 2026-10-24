import test from 'node:test';import assert from 'node:assert/strict';import{mkdtemp,rm}from'node:fs/promises';import{tmpdir}from'node:os';import{join}from'node:path';import{randomUUID}from'node:crypto';
import{createService}from'../integrations/chatgpt-workbench/server/service.mjs';
import{selectionCreateNames,selectionMaterialLink}from'../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/selection-create-defaults.mjs';
import{relationOverview}from'../src/domain/story-relations.mjs';
test('selection defaults preserve editable full names per material kind, not foreshadow title',()=>{
 const value='长'.repeat(500),names=selectionCreateNames({evidence:'  '+value+'  '});assert.equal(names.character,value);assert.equal(names.world,value);assert.equal(names.foreshadow,'');assert.equal(names.card,'');
 for(const kind of ['character','world'])for(const mode of ['new','existing']){assert.deepEqual(selectionMaterialLink(kind,mode,false),{linkKind:'reference'});assert.deepEqual(selectionMaterialLink(kind,mode,true),{linkKind:'appearance'});}
 assert.deepEqual(selectionMaterialLink('foreshadow','new',true),{});
});
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'moji-selection-material-'));t.after(()=>rm(root,{recursive:true,force:true}));const service=await createService(root),novelId=(await service.rpc('novel.create',{title:'选区资料合成测试'},'selection-qa','human')).id;const call=(action,args={})=>service.rpc(action,{novelId,...args},'selection-qa','human');const created=await call('chapter.create',{title:'雨夜',content:'😀序言。\r\n沈知夏来到雾港。\r\n故事结束。'});const chapter=await call('chapter.get',{chapterId:created.id,maxChars:200000});const body=chapter.content.replace(/\r\n?/g,'\n');const proof=name=>({chapterId:chapter.id,revision:chapter.revision,contentHash:chapter.contentHash,start:body.indexOf(name),end:body.indexOf(name)+name.length,evidence:name});const apply=async(target,selection)=>call('story.selection.apply',{requestId:randomUUID(),confirmed:true,expectedRevision:(await call('story.get')).state.revision,selection,target});return{root,novelId,call,chapter,body,proof,apply};}
for(const kind of ['character','world'])for(const checked of [false,true])test(`${kind} new selection preserves name/evidence and opt-in appearance through restart`,async t=>{
 const s=await fixture(t),name=kind==='character'?'沈知夏':'雾港',proof=s.proof(name),target={kind,title:name,...selectionMaterialLink(kind,'new',checked)};
 const args={requestId:randomUUID(),confirmed:true,expectedRevision:(await s.call('story.get')).state.revision,selection:{...proof,contentLength:1},target};const result=await s.call('story.selection.apply',args);assert.equal(result.title,name);assert.equal((await s.call('story.selection.apply',args)).id,result.id,'receipt retry must not create twice');
 const nodes=await s.call('graph.list'),node=nodes.find(n=>n.id===result.id);assert.equal(nodes.length,1);assert.equal(node.name,name);assert.equal(node.appearances.length,checked?1:0);if(checked)assert.equal(node.appearances[0].offset,proof.start/s.body.length);
 const links=await s.call('writing.link.list',{nodeId:node.id});assert.equal(links.length,1);assert.equal(links[0].kind,checked?'appearance':'reference');assert.deepEqual(links[0].selection,{...proof,coordinate:'lf-utf16',contentLength:s.body.length});
 const reopened=await createService(s.root),restored=await reopened.rpc('graph.list',{novelId:s.novelId},'selection-qa','human');assert.deepEqual(restored.find(n=>n.id===node.id).appearances,node.appearances);
});
for(const kind of ['character','world'])test(`${kind} existing association retains identity and earliest formal timeline position`,async t=>{
 const s=await fixture(t),name=kind==='character'?'沈知夏':'雾港',node=await s.call('graph.create',{type:kind==='character'?'character_card':'world_entry',name:'已创建的'+name,content:'保留原内容'}),proof=s.proof(name);
 await s.apply({kind,id:node.id,expectedRevision:node.revision,...selectionMaterialLink(kind,'existing',false)},proof);assert.equal((await s.call('graph.list'))[0].appearances.length,0);
 await s.apply({kind,id:node.id,expectedRevision:node.revision,...selectionMaterialLink(kind,'existing',true)},proof);
 const laterCreated=await s.call('chapter.create',{title:'后来',content:name+'再次出现。'}),later=await s.call('chapter.get',{chapterId:laterCreated.id});await s.apply({kind,id:node.id,expectedRevision:node.revision,linkKind:'appearance'},{chapterId:later.id,revision:later.revision,contentHash:later.contentHash,start:0,end:name.length,evidence:name});
 const nodes=await s.call('graph.list'),story=await s.call('story.get');assert.equal(nodes.length,1);assert.equal(nodes[0].id,node.id);assert.equal(nodes[0].name,node.name);assert.equal((await s.call('graph.get',{nodeId:node.id})).content,'保留原内容');
 const first=proof.start/s.body.length,overview=relationOverview({},[],nodes,story.sources.chapters,'narration',first,false);assert.equal(overview.nodes[0].firstAt,first);assert.equal(relationOverview({},[],nodes,story.sources.chapters,'narration',first-.01,false).nodes.length,0);
});
test('legacy unanchored appearance stays at chapter start and world mention remains rejected',async t=>{
 const s=await fixture(t),node=await s.call('graph.create',{type:'world_entry',name:'雾港'});await s.call('writing.link.create',{nodeId:node.id,chapterId:s.chapter.id,expectedChapterRevision:s.chapter.revision,evidence:'雾港',kind:'appearance',confirmed:true});assert.equal((await s.call('graph.list'))[0].appearances[0].offset,0);
 await assert.rejects(s.call('writing.link.create',{nodeId:node.id,chapterId:s.chapter.id,expectedChapterRevision:s.chapter.revision,evidence:'雾港',kind:'mention',confirmed:true}));
});
test('foreshadow still uses the selected text as plot-node evidence, not an automatic title',async t=>{
 const s=await fixture(t),proof=s.proof('雾港'),result=await s.apply({kind:'foreshadow',title:'港口的秘密',stage:'plant'},proof),rows=await s.call('writing.foreshadow.list');assert.equal(rows[0].title,'港口的秘密');assert.equal(rows[0].plotNodes[0].evidence.evidence,'雾港');assert.equal(rows[0].id,result.id);
});
test('existing foreshadow adds a linked stage card, never another entity; failed and repeated requests stay atomic',async t=>{
 const s=await fixture(t),proof=s.proof('雾港');await s.apply({kind:'foreshadow',title:'港口的秘密',stage:'plant'},proof);
 let rows=await s.call('writing.foreshadow.list'),story=await s.call('story.get');assert.equal(rows.length,1);assert.equal(Object.keys(story.state.cards).length,1);assert.equal(rows[0].plotNodes[0].cardId,Object.keys(story.state.cards)[0]);
 const target={kind:'foreshadow',id:rows[0].id,expectedRevision:rows[0].revision,stage:'progress',cardTitle:'推进港口秘密'},args={requestId:randomUUID(),confirmed:true,expectedRevision:story.state.revision,selection:proof,target};
 await assert.rejects(s.call('story.selection.apply',{...args,requestId:randomUUID(),selection:{...proof,evidence:'不匹配'}}));assert.equal((await s.call('writing.foreshadow.list')).length,1);assert.equal(Object.keys((await s.call('story.get')).state.cards).length,1);
 const result=await s.call('story.selection.apply',args);assert.equal((await s.call('story.selection.apply',args)).cardId,result.cardId);
 rows=await s.call('writing.foreshadow.list');story=await s.call('story.get');assert.equal(rows.length,1);assert.equal(rows[0].plotNodes.length,2);assert.equal(Object.keys(story.state.cards).length,2);const point=rows[0].plotNodes.find(p=>p.id===result.nodeId);assert.equal(point.kind,'progress');assert.equal(point.cardId,result.cardId);assert.equal(point.evidence.evidence,proof.evidence);assert.equal(story.state.cards[result.cardId].evidence[0].start,proof.start);
});
