import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {projectStage} from '../../../src/domain/story-workspace.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'card-relations-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'relations-test','human');return {s,call};}
const character=(call,name,values={})=>call('writing.card.create',{type:'character_card',name,values});
const organization=(call,name)=>call('writing.card.create',{type:'world_book',name,values:{'world:category':'组织'}});
const selection=(data,ids)=>({expectedNodeRevision:data.nodeRevision,organizationIds:ids,organizationRevisions:Object.fromEntries(data.organizations.map(o=>[o.id,o.revision])),edgeRevisions:Object.fromEntries(data.affiliations.map(e=>[e.id,e.revision])),confirmed:true});
test('组织按稳定 ID 选择、同名不误连；图和卡共享；旧文字保留、并发不覆盖',async()=>{
 const {call}=await setup(),actor=await character(call,'岑予',{'character:organization':'旧邮局（旧文字）'}),one=await organization(call,'邮局'),two=await organization(call,'邮局'),world=await call('writing.card.create',{type:'world_book',name:'旧街道',values:{'world:category':'地点'}});
 let data=await call('writing.cardRelations.get',{nodeId:actor.id});assert.equal(data.organizations.length,2);assert.equal(data.affiliations.length,0);
 const args={nodeId:actor.id,...selection(data,[two.id]),requestId:'organization-intent'};
 await call('writing.affiliation.set',args);await call('writing.affiliation.set',args);
 data=await call('writing.cardRelations.get',{nodeId:actor.id});assert.equal(data.affiliations.length,1);assert.equal(data.affiliations[0].to,two.id);assert.equal(data.affiliations[0].category,'affiliation');
 assert.equal((await call('writing.card.get',{nodeId:actor.id})).values['character:organization'],'旧邮局（旧文字）');
 await assert.rejects(call('writing.affiliation.set',{nodeId:actor.id,...selection(data,[world.id]),organizationRevisions:{[world.id]:world.revision}}),{code:'INVALID_INPUT'});
 await call('graph.update',{nodeId:two.id,expectedRevision:two.revision,name:'明日邮局'});assert.equal((await call('writing.cardRelations.get',{nodeId:actor.id})).organizations.find(o=>o.id===two.id).name,'明日邮局');
 const edge=data.affiliations[0];await call('edge.update',{edgeId:edge.id,expectedRevision:edge.revision,name:'夜班成员'});
 await assert.rejects(call('writing.affiliation.set',{nodeId:actor.id,...selection(data,[])}),{code:'CONFLICT'});
 data=await call('writing.cardRelations.get',{nodeId:actor.id});assert.equal(data.affiliations[0].name,'夜班成员');
 await call('edge.delete',{edgeId:edge.id,expectedRevision:data.affiliations[0].revision,confirm:true});assert.equal((await call('writing.cardRelations.get',{nodeId:actor.id})).affiliations.length,0);
 assert.ok((await call('graph.get',{nodeId:one.id})).id);
});
test('新建角色与组织连线原子保存，非法组织或陈旧版本不会留下半个角色',async()=>{
 const {call}=await setup(),org=await organization(call,'守夜会'),before=(await call('graph.list')).length;
 await assert.rejects(call('writing.card.create',{type:'character_card',name:'失败角色',organizationIds:[org.id],organizationRevisions:{[org.id]:0}}),{code:'CONFLICT'});assert.equal((await call('graph.list')).length,before);
 const actor=await call('writing.card.create',{type:'character_card',name:'成功角色',organizationIds:[org.id],organizationRevisions:{[org.id]:org.revision}});assert.equal((await call('writing.cardRelations.get',{nodeId:actor.id})).affiliations[0].to,org.id);
});
test('多条同人物关系、事件起点、未定时间、计划隔离和原子冲突；完整备份复制可还原',async()=>{
 const {s,call}=await setup(),a=await character(call,'岑予'),b=await character(call,'江遥'),org=await organization(call,'邮局');
 const event=(title,order,planned=false)=>call('writing.event.create',{confirmed:true,value:{title,order,planned,narrativeKind:'linear'}}),early=await event('初识',0),start=await event('结盟',10),later=await event('后续',20),planned=await event('反目计划',30,true);
 const args={nodeId:a.id,targetId:b.id,expectedNodeRevision:a.revision,expectedTargetRevision:b.revision,confirmed:true,name:'伙伴',category:'partner',style:'dashed',timing:'event',eventId:start.id,expectedEventRevision:start.revision,requestId:'relation-intent'};
 const relation=await call('writing.relationship.create',args);assert.equal((await call('writing.relationship.create',args)).edge.id,relation.edge.id);
 const family=await call('writing.relationship.create',{...args,name:'兄妹',category:'family',style:'solid',timing:'base',requestId:'family'}),unknown=await call('writing.relationship.create',{...args,name:'待定师生',timing:'undated',category:'mentor',requestId:'unknown'});
 let board=await call('writing.board.get');assert.equal(projectStage(board,early.id).edges.length,1);assert.equal(projectStage(board,start.id).edges.length,2);assert.equal(projectStage(board,later.id).edges.find(e=>e.id===relation.edge.id).style,'dashed');assert.equal(projectStage(board,later.id).edges.some(e=>e.id===unknown.edge.id),false);
 await call('writing.relationshipChange.create',{confirmed:true,value:{edgeId:relation.edge.id,eventId:planned.id,value:{name:'敌人',category:'enemy',active:true}}});
 assert.equal(projectStage(await call('writing.board.get'),planned.id).edges.find(e=>e.id===relation.edge.id).name,'敌人');assert.equal((await call('writing.relationship.list',{phase:'latest'})).find(e=>e.id===relation.edge.id).name,'伙伴');
 const count=(await call('edge.list')).length;await assert.rejects(call('writing.relationship.create',{...args,expectedEventRevision:0,requestId:'stale'}),{code:'CONFLICT'});assert.equal((await call('edge.list')).length,count);
 await call('writing.affiliation.set',{nodeId:a.id,...selection(await call('writing.cardRelations.get',{nodeId:a.id}),[org.id])});
 const exported=await call('novel.export'),file={name:'relations.json',json:exported},options={mode:'copy'},preview=await call('transfer.preview',{file,options}),copy=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),copied=(await s.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human')).novel;
 const copiedPartner=Object.values(copied.edges).find(e=>e.name==='伙伴');assert.notEqual(copiedPartner.id,relation.edge.id);assert.equal(copiedPartner.baseActive,false);assert.equal(copiedPartner.category,'partner');assert.ok(copied.nodes[copiedPartner.from]);assert.ok(Object.values(copied.writing.relationshipChanges).some(c=>c.edgeId===copiedPartner.id&&copied.writing.events[c.eventId]));
 assert.ok(Object.values(copied.edges).some(e=>e.category==='affiliation'&&copied.writing.cards[e.to].values['world:category']==='组织'));
 assert.equal((await call('writing.relationship.list',{phase:'base'})).find(e=>e.id===family.edge.id).category,'family');
});
