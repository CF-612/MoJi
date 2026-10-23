import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtime from '../src/domain/story-workspace.mjs';
import * as client from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-workspace.mjs';
import {storyAction} from '../src/domain/story-v31.js';
const sources={volumes:[{id:'v',title:'卷',order:0}],chapters:[{id:'ch',title:'章',volumeId:'v',order:0}]};
for(const [name,domain] of [['runtime',runtime],['client',client]]){
 function fixture(){let state=domain.emptyWorkspace(),id=0;domain.reconcile(state,sources);const apply=operation=>(state=domain.applyStory(state,sources,operation,()=>`item-${++id}`));const card=(title,parent)=>{apply({type:'card.create',value:{title},parent});return Object.values(state.cards).find(c=>c.title===title).id;};return {get state(){return state;},apply,card};}
 test(`${name}: batch deletion promotes unselected descendants and cleans every page without deleting source chapters`,()=>{
  const f=fixture(),parent=f.card('父'),child=f.card('子',`card:${parent}`),keep=f.card('保留',`card:${child}`);
  f.apply({type:'move',refs:['chapter:ch'],parent:`card:${parent}`});
  f.apply({type:'precedence',from:`card:${parent}`,to:`card:${keep}`});
  f.apply({type:'page.generate'});
  const before=structuredClone(f.state),sourceBefore=structuredClone(sources);
  f.apply({type:'card.deleteMany',ids:[parent,child,parent]});
  assert.deepEqual(Object.keys(f.state.cards),[keep]);
  assert.equal(f.state.placements[`card:${keep}`].parent,domain.ROOT);
  assert.equal(f.state.placements['chapter:ch'].parent,domain.ROOT);
  assert.ok(f.state.placements['volume:v']);assert.deepEqual(sources,sourceBefore);
  assert.deepEqual(f.state.cards[keep],before.cards[keep]);assert.equal(f.state.precedence.length,0);
  for(const p of f.state.pages)for(const id of [parent,child]){assert.equal(p.instances[`card:${id}`],undefined);assert.ok(!p.outline?.refs.includes(`card:${id}`));}
  assert.equal(f.state.revision,before.revision+1);assert.doesNotThrow(()=>domain.validateRestore(f.state,sources));
 });
 test(`${name}: mixed invalid/stale batch IDs fail without partial mutation`,()=>{
  const f=fixture(),id=f.card('保留'),before=structuredClone(f.state);
  for(const ids of [[id,'missing'],[id,'volume:v'],[id,'chapter:ch']]){
   assert.throws(()=>f.apply({type:'card.deleteMany',ids}));assert.deepEqual(f.state,before);
  }
 });
 test(`${name}: grouping selected ancestor and descendant preserves subtree and source ownership`,()=>{
  const f=fixture(),parent=f.card('父'),child=f.card('子',`card:${parent}`);f.apply({type:'move',refs:['chapter:ch'],parent:`card:${child}`});
  const before=structuredClone(sources);f.apply({type:'group',refs:[`card:${parent}`,`card:${child}`],title:'成组',pageId:'main'});
  const group=Object.values(f.state.cards).find(c=>c.title==='成组');assert.ok(group);
  assert.equal(f.state.placements[`card:${parent}`].parent,`card:${group.id}`);
  assert.equal(f.state.placements[`card:${child}`].parent,`card:${parent}`);
  assert.equal(f.state.placements['chapter:ch'].parent,`card:${child}`);
  assert.ok(f.state.pages[0].instances[`card:${group.id}`]);assert.deepEqual(sources,before);
 });
 test(`${name}: group APIs and restore reject inherited or duplicate member references`,()=>{
  const f=fixture(),id=f.card('真实卡'),before=structuredClone(f.state);
  for(const ref of ['constructor','__proto__','toString']){
   assert.throws(()=>f.apply({type:'group.create',name:'非法分组',refs:[ref]}));assert.deepEqual(f.state,before);
   const malformed={...structuredClone(before),groups:[{id:'bad',name:'非法分组',refs:[ref]}]};
   assert.throws(()=>domain.validateRestore(malformed,sources));
  }
  const duplicate={...structuredClone(before),groups:[{id:'one',name:'一',refs:[`card:${id}`]},{id:'two',name:'二',refs:[`card:${id}`]}]};
  assert.throws(()=>domain.validateRestore(duplicate,sources));
 });
 test(`${name}: custom group assignment/deletion is separate from containment and clears removed references`,()=>{
  const f=fixture(),a=f.card('甲'),b=f.card('乙'),before=structuredClone(f.state);
  f.apply({type:'group.create',name:'自定义',refs:[`card:${a}`,'chapter:ch']});const group=f.state.groups[0];
  for(const key of ['cards','placements','pages','precedence'])assert.deepEqual(f.state[key],before[key]);
  f.apply({type:'group.create',name:'另组',refs:[`card:${b}`]});const other=f.state.groups[1];
  f.apply({type:'group.assign',id:other.id,refs:[`card:${a}`]});
  assert.deepEqual(f.state.groups[0].refs,['chapter:ch']);assert.deepEqual(f.state.groups[1].refs,[`card:${b}`,`card:${a}`]);
  f.apply({type:'card.deleteMany',ids:[b]});assert.deepEqual(f.state.groups[1].refs,[`card:${a}`]);
  const data=structuredClone(f.state);f.apply({type:'group.delete',id:group.id});
  for(const key of ['cards','placements','pages','precedence'])assert.deepEqual(f.state[key],data[key]);
  assert.doesNotThrow(()=>domain.validateRestore(f.state,sources));
 });
 test(`${name}: deleting a group removes only its wrapper and preserves contained cards and chapter`,()=>{
  const f=fixture(),id=f.card('剧情');f.apply({type:'group',refs:[`card:${id}`,'chapter:ch'],title:'篇章'});
  const group=Object.values(f.state.cards).find(c=>c.title==='篇章'),before=structuredClone(f.state),parent=before.placements[`card:${group.id}`].parent;
  f.apply({type:'card.deleteMany',ids:[group.id]});
  assert.deepEqual(f.state.cards[id],before.cards[id]);assert.equal(f.state.placements[`card:${id}`].parent,parent);
  assert.equal(f.state.placements['chapter:ch'].parent,parent);assert.ok(f.state.placements['volume:v']);
  assert.doesNotThrow(()=>domain.validateRestore(f.state,sources));
 });
 test(`${name}: regeneration replaces stale projections but retains manual instances and every source object`,()=>{
  const f=fixture(),id=f.card('自由卡');
  f.apply({type:'instance.add',pageId:'main',ref:`card:${id}`,position:{x:-700,y:900}});
  f.apply({type:'page.generate',pageId:'main'});
  const before=structuredClone(f.state),manual=structuredClone(f.state.pages[0].instances[`card:${id}`]);
  f.apply({type:'page.generate'});
  assert.deepEqual(f.state.pages.find(p=>p.id==='main').instances,{[`card:${id}`]:manual});
  assert.equal(f.state.pages.find(p=>p.id==='main').outline,undefined);
  for(const key of ['cards','placements','precedence'])assert.deepEqual(f.state[key],before[key]);
  const generated=f.state.pages.find(p=>p.generated);
  // Older backups can contain multiple auto-generated projections.
  const duplicate=structuredClone(generated);duplicate.id='stale-generated';f.state.pages.push(duplicate);
  f.apply({type:'page.generate'});
  assert.equal(f.state.pages.filter(p=>p.generated).length,1);
  assert.equal(f.state.pages.some(p=>p.id==='stale-generated'),false);
  assert.deepEqual(f.state.pages.find(p=>p.id==='main').instances,{[`card:${id}`]:manual});
  assert.doesNotThrow(()=>domain.validateRestore(f.state,sources));
 });
 test(`${name}: deleting a generated page leaves shared domain content intact`,()=>{
  const f=fixture();f.card('共享剧情');f.apply({type:'page.generate'});const page=f.state.pages.find(p=>p.generated),before=structuredClone(f.state);
  f.apply({type:'page.delete',pageId:page.id});
  for(const key of ['cards','placements','precedence','tracks'])assert.deepEqual(f.state[key],before[key]);
  assert.deepEqual(f.state.pages,[before.pages.find(p=>p.id==='main')]);
  const last=structuredClone(f.state);f.apply({type:'page.delete',pageId:'main'});
  assert.equal(f.state.pages.length,1);assert.deepEqual(f.state.pages[0].instances,{});
  for(const key of ['cards','placements','precedence','tracks'])assert.deepEqual(f.state[key],last[key]);
  assert.doesNotThrow(()=>domain.validateRestore(f.state,sources));
 });
}
test('service transaction blocks an entire batch linked to foreshadow and undo restores the successful batch',()=>{
 const n={id:'novel',revision:1,volumes:{},chapters:{},nodes:{},writing:{foreshadows:{}}};
 const call=(action,args={})=>storyAction(n,action,args,{kind:'human'},()=>{});let result=call('story.get');
 const apply=operation=>(result=call('story.apply',{expectedRevision:result.state.revision,operation}));
 apply({type:'card.create',value:{title:'第一张'}});apply({type:'card.create',value:{title:'第二张'}});
 const ids=Object.keys(result.state.cards);n.writing.foreshadows.protected={id:'protected',title:'不可断开',plotNodes:[{cardId:ids[1]}]};
 const before=structuredClone(n);assert.throws(()=>apply({type:'card.deleteMany',ids}),/伏笔/);assert.deepEqual(n,before);
 n.writing.foreshadows={};const cards=structuredClone(result.state.cards),history=n.story.history.length;
 apply({type:'card.deleteMany',ids});assert.deepEqual(result.state.cards,{});assert.equal(n.story.history.length,history+1);
 result=call('story.undo',{expectedRevision:result.state.revision});assert.deepEqual(result.state.cards,cards);
 result=call('story.redo',{expectedRevision:result.state.revision});assert.deepEqual(result.state.cards,{});
});

test('persisted RPC batch delete is one revision, idempotent, undoable and survives restart without chapter changes',async t=>{
 const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const {createService}=await import('../integrations/chatgpt-workbench/server/service.mjs');
 const directory=await mkdtemp(join(tmpdir(),'moji-batch-delete-rpc-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const service=await createService(directory),novelId=service.novelId;
 const call=(action,args={})=>service.rpc(action,{novelId,...args},'independent-selection-review','human');let result=await call('story.get');
 for(const title of ['甲','乙'])result=await call('story.apply',{expectedRevision:result.state.revision,operation:{type:'card.create',pageId:'main',value:{title}}});
 const before=structuredClone(result),chapters=await call('chapter.list'),ids=Object.keys(result.state.cards);
 const request={requestId:crypto.randomUUID(),expectedRevision:result.state.revision,operation:{type:'card.deleteMany',ids}};
 const deleted=await call('story.apply',request);assert.equal(deleted.state.revision,before.state.revision+1);assert.deepEqual(deleted.state.cards,{});
 assert.deepEqual(await call('story.apply',request),deleted);
 const reopened=await createService(directory),reloaded=await reopened.rpc('story.get',{novelId},'independent-selection-review','human');assert.deepEqual(reloaded.state,deleted.state);
 result=await call('story.undo',{expectedRevision:deleted.state.revision});
 for(const key of ['cards','placements','pages','precedence'])assert.deepEqual(result.state[key],before.state[key]);
 assert.deepEqual(await call('chapter.list'),chapters);
});

test('full backup copy import remaps custom groups and retains source membership',async t=>{
 const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const {createService}=await import('../integrations/chatgpt-workbench/server/service.mjs');
 const directory=await mkdtemp(join(tmpdir(),'moji-group-copy-rpc-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const service=await createService(directory),novelId=service.novelId,session='independent-group-copy';
 const call=(action,args={})=>service.rpc(action,{novelId,...args},session,'human');let result=await call('story.get');
 const apply=async operation=>(result=await call('story.apply',{expectedRevision:result.state.revision,operation}));
 await apply({type:'card.create',pageId:'main',value:{title:'组内卡'}});const id=Object.keys(result.state.cards)[0],chapter=result.sources.chapters[0].id;
 await apply({type:'group.create',name:'保存的分组',refs:[`card:${id}`,`chapter:${chapter}`]});
 const before=structuredClone(result.state),backup=await call('novel.export');
 const file={name:'custom-groups.json',json:backup},options={mode:'copy'},preview=await call('transfer.preview',{file,options});
 const imported=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()});
 const copy=await service.rpc('story.get',{novelId:imported.novelIds[0]},session,'human');
 assert.equal(copy.state.groups?.length,1);const group=copy.state.groups[0];
 assert.equal(group.name,'保存的分组');assert.notEqual(group.id,before.groups[0].id);
 assert.equal(group.refs.length,2);assert.ok(group.refs.every(ref=>!before.groups[0].refs.includes(ref)));
 assert.ok(group.refs.every(ref=>runtime.objectIndex(copy.state,copy.sources)[ref]));
 assert.deepEqual((await call('story.get')).state,before);
 const restart=await createService(directory),reloaded=await restart.rpc('story.get',{novelId:imported.novelIds[0]},session,'human');assert.deepEqual(reloaded.state.groups,copy.state.groups);
});
