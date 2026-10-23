import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../src/application/store.js';
import {copyWork,copyInto} from '../src/application/transfer/copy.ts';
import {HUMAN_ACTIONS,TOOL_ACTIONS} from '../src/contracts/actions.js';
async function setup(t){const root=await mkdtemp(join(tmpdir(),'moji-types-'));t.after(()=>rm(root,{recursive:true,force:true}));const store=new Store(root),n=await store.dispatch('novel.create',{title:'类型测试'}),call=(action,args={})=>store.dispatch(action,{novelId:n.id,...args},{kind:'human'});return {store,root,n,call};}
test('custom relationship CRUD, CAS, persistence, isolation and all edge projections',async t=>{
 const {store,root,n,call}=await setup(t),a=await call('graph.create',{name:'甲',type:'character_card'}),b=await call('graph.create',{name:'乙',type:'character_card'});
 const type=await call('writing.relationshipType.create',{name:'朋友',color:'#FF9900'});assert.equal(type.color,'#ff9900');
 const edge=await call('edge.create',{from:a.id,to:b.id,name:'父子（原有文字）',typeId:type.id});assert.equal(edge.relationColor,'#ff9900');assert.equal(edge.typeName,'朋友');
 for(const action of ['list','create','update','delete']){assert.ok(HUMAN_ACTIONS.includes('writing.relationshipType.'+action));assert.ok(TOOL_ACTIONS.moji_structure.includes('writing.relationshipType.'+action));}
 await assert.rejects(call('writing.relationshipType.create',{name:'朋友',color:'#112233'}),/同名/);
 await assert.rejects(call('writing.relationshipType.update',{id:type.id,expectedRevision:0,name:'错误'}),{code:'CONFLICT'});
 const updated=await call('writing.relationshipType.update',{id:type.id,expectedRevision:type.revision,name:'同伴',color:'#aa5500'});assert.equal(updated.versions[0].value.name,'朋友');
 const loaded=await new Store(root).dispatch('edge.get',{novelId:n.id,edgeId:edge.id},{kind:'human'});assert.equal(loaded.typeName,'同伴');assert.equal(loaded.name,'父子（原有文字）');assert.equal(loaded.relationColor,'#aa5500');
 assert.equal((await call('writing.board.get')).edges[0].typeId,type.id);assert.equal((await call('writing.cardRelations.get',{nodeId:a.id})).edges[0].relationColor,'#aa5500');assert.equal((await call('writing.relationship.list'))[0].typeName,'同伴');
 await assert.rejects(call('writing.relationshipType.delete',{id:type.id,expectedRevision:updated.revision,confirmed:true}),{code:'RELATIONSHIP_TYPE_IN_USE'});
 const n2=await store.dispatch('novel.create',{title:'另一部'});assert.deepEqual(await call('writing.relationshipType.list',{novelId:n2.id}),[]);await assert.rejects(call('edge.create',{novelId:n2.id,from:a.id,to:b.id,typeId:type.id}));
 const a2=await call('graph.create',{novelId:n2.id,name:'另一甲',type:'character_card'}),b2=await call('graph.create',{novelId:n2.id,name:'另一乙',type:'character_card'});await assert.rejects(call('edge.create',{novelId:n2.id,from:a2.id,to:b2.id,typeId:type.id}),/本作品/);
 const unused=await call('writing.relationshipType.create',{name:'待删除',color:'#001122'});await call('writing.relationshipType.delete',{id:unused.id,expectedRevision:1,confirmed:true});assert.equal((await call('writing.relationshipType.list')).length,1);
 const legacy=await call('edge.update',{edgeId:edge.id,expectedRevision:edge.revision,typeId:null,category:'family'});assert.equal(legacy.typeName,null);assert.equal(legacy.name,'父子（原有文字）');assert.equal(legacy.relationColor,'#8a94a6');
});
test('relationship types survive evolution, backups and remapped copies',async t=>{
 const {store,call}=await setup(t),a=await call('graph.create',{name:'甲',type:'character_card'}),b=await call('graph.create',{name:'乙',type:'character_card'}),type=await call('writing.relationshipType.create',{name:'朋友',color:'#ff9900'});
 const edge=await call('edge.create',{from:a.id,to:b.id,name:'旧标签',typeId:type.id}),event=await call('writing.event.create',{confirmed:true,value:{title:'重逢',order:0,narrativeKind:'linear'}});
 const change=await call('writing.relationshipChange.create',{confirmed:true,value:{edgeId:edge.id,eventId:event.id,value:{name:'仍保留的阶段文字',typeId:type.id}}});
 assert.equal((await call('writing.stage.get',{eventId:event.id})).edges[0].relationColor,'#ff9900');
 const cleared=await call('writing.relationshipChange.update',{id:change.id,expectedRevision:1,confirmed:true,value:{value:{name:'无类型',typeId:null}}});await call('edge.update',{edgeId:edge.id,expectedRevision:1,typeId:null});
 await assert.rejects(call('writing.relationshipType.delete',{id:type.id,expectedRevision:1,confirmed:true}),{code:'RELATIONSHIP_TYPE_IN_USE'});
 const backup=await call('novel.export'),book=backup.novel;assert.equal(book.writing.relationshipChanges[cleared.id].versions[0].value.value.typeId,type.id);
 const copied=copyWork(book,{}),copiedType=Object.values(copied.writing.relationshipTypes)[0],copiedChange=Object.values(copied.writing.relationshipChanges)[0];assert.notEqual(copiedType.id,type.id);assert.equal(copiedChange.versions[0].value.value.typeId,copiedType.id);
 copyInto(book,copied,{});assert.equal(Object.values(copied.writing.relationshipTypes).length,2);assert.equal(new Set(Object.values(copied.writing.relationshipTypes).map(t=>t.name)).size,2);
 const other=new Store(join(store.root,'restore'));await other.dispatch('novel.import',{backup},{kind:'human'});assert.equal((await other.dispatch('writing.relationshipType.list',{novelId:book.id},{kind:'human'}))[0].color,'#ff9900');
 const bad=structuredClone(backup);bad.novel.writing.relationshipTypes[type.id].color='url(evil)';await assert.rejects(other.dispatch('novel.import',{backup:bad}),/颜色/);
});
test('modern plot changes preserve type IDs, resolve renamed colors, and protect undo history',async t=>{
 const {call}=await setup(t),a=await call('graph.create',{name:'甲',type:'character_card'}),b=await call('graph.create',{name:'乙',type:'character_card'}),type=await call('writing.relationshipType.create',{name:'朋友',color:'#ff9900'});
 let story=await call('story.get');story=await call('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.create',value:{title:'相识'}}});const card=Object.values(story.state.cards)[0];
 story=await call('story.apply',{expectedRevision:story.state.revision,operation:{type:'relation.save',cardId:card.id,expectedRevision:card.revision,location:{story:10},value:{from:a.id,to:b.id,name:'旧名称',typeId:type.id}}});
 const current=story.state.cards[card.id],point=current.points[0],r=point.relationships[0];assert.equal(r.typeId,type.id);assert.equal(story.sources.relationshipTypes[0].name,'朋友');
 const {relationSnapshot}=await import('../src/domain/story-relations.mjs');const snapshot=relationSnapshot(story.state.cards,[],story.sources.chapters,'story',12,true,{relationshipTypes:story.sources.relationshipTypes});assert.equal(snapshot.relations[0].relationColor,'#ff9900');assert.equal(snapshot.relations[0].typeName,'朋友');assert.equal(snapshot.relations[0].name,'旧名称');
 const backup=await call('novel.export'),copied=copyWork(backup.novel,{}),copiedRelation=Object.values(copied.story.state.cards)[0].points[0].relationships[0];assert.notEqual(copiedRelation.typeId,type.id);assert.ok(copied.writing.relationshipTypes[copiedRelation.typeId]);
 story=await call('story.apply',{expectedRevision:story.state.revision,operation:{type:'relation.delete',source:{cardId:card.id,revision:current.revision,pointId:point.id,changeId:r.id}}});
 await assert.rejects(call('writing.relationshipType.delete',{id:type.id,expectedRevision:1,confirmed:true}),{code:'RELATIONSHIP_TYPE_IN_USE'});
 const bad=structuredClone(backup);bad.novel.story.state.cards[card.id].points[0].relationships[0].typeId='not-in-this-work';await assert.rejects(call('novel.import',{backup:bad}),/关系类型/);
});

test('merging a maximum-length type name keeps the import suffix within validation limits',async t=>{
 const {call}=await setup(t);await call('writing.relationshipType.create',{name:'友'.repeat(80),color:'#ff9900'});
 const {novel}=await call('novel.export'),copied=copyWork(novel,{});copyInto(novel,copied,{});
 const names=Object.values(copied.writing.relationshipTypes).map(t=>t.name);assert.equal(new Set(names).size,2);assert.ok(names.every(n=>n.length<=80));
});

test('legacy named stages do not inherit a subsequently typed base; typed change reads project color',async t=>{
 const {call}=await setup(t),a=await call('graph.create',{name:'甲',type:'character_card'}),b=await call('graph.create',{name:'乙',type:'character_card'}),type=await call('writing.relationshipType.create',{name:'朋友',color:'#ff9900'}),edge=await call('edge.create',{from:a.id,to:b.id,name:'旧基础',typeId:type.id}),event=await call('writing.event.create',{confirmed:true,value:{title:'变化',order:0,narrativeKind:'linear'}});
 const change=await call('writing.relationshipChange.create',{confirmed:true,value:{edgeId:edge.id,eventId:event.id,value:{name:'父子（旧阶段）'}}});
 for(const e of [(await call('writing.relationship.list'))[0],(await call('writing.stage.get',{eventId:event.id})).edges[0]]){assert.equal(e.name,'父子（旧阶段）');assert.equal(e.typeName,null);assert.equal(e.relationColor,'#8a94a6');}
 await call('writing.relationshipChange.update',{id:change.id,expectedRevision:change.revision,confirmed:true,value:{value:{name:'原文',typeId:type.id}}});
 const row=(await call('writing.relationshipChange.list'))[0];assert.equal(row.value.typeName,'朋友');assert.equal(row.value.relationColor,'#ff9900');
});
