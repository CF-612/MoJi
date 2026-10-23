import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';
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
async function workspace(call){let current=await call('story.get');return {
 get:()=>current,
 async refresh(){return current=await call('story.get');},
 async apply(operation,extra={}){return current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation,...extra});},
 async create(value,extra={}){const before=new Set(Object.keys(current.state.cards));current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation:{type:'card.create',value,...extra}});return Object.values(current.state.cards).find(c=>!before.has(c.id));},
};}
const narration=chapterId=>({trackId:'main',startChapterId:chapterId,endChapterId:chapterId,startOffset:0,endOffset:1});

test('同人物基础关系和发生点独立；未定位置、计划隔离、原子冲突与复制引用完整',async()=>{
 const {s,call}=await setup(),a=await character(call,'岑予'),b=await character(call,'江遥'),org=await organization(call,'邮局'),w=await workspace(call);
 const family=await call('writing.relationship.create',{nodeId:a.id,targetId:b.id,expectedNodeRevision:a.revision,expectedTargetRevision:b.revision,confirmed:true,name:'兄妹',category:'family',timing:'base',requestId:'family'});
 const start=await w.create({title:'结盟'}),planned=await w.create({title:'反目计划'}),unknown=await w.create({title:'未定师生'});
 const relation={requestId:'relation-intent',expectedRevision:w.get().state.revision,operation:{type:'relation.save',cardId:start.id,expectedRevision:1,location:{story:10},value:{from:a.id,to:b.id,name:'伙伴'}}};
 const saved=await call('story.apply',relation);assert.deepEqual(await call('story.apply',relation),saved);await w.refresh();
 await w.apply({type:'relation.save',cardId:unknown.id,expectedRevision:1,location:{},value:{from:a.id,to:b.id,name:'待定师生'}});
 await w.apply({type:'relation.save',cardId:planned.id,expectedRevision:1,location:{story:30},value:{from:a.id,to:b.id,name:'敌人计划'}});
 const base=await call('edge.list'),at=(cursor,plans=true)=>relationSnapshot(w.get().state.cards,base,w.get().sources.chapters,'story',cursor,plans);
 assert.equal(at(0).relations[0].name,'兄妹');assert.equal(at(10).relations[0].name,'伙伴');assert.equal(at(30).relations[0].name,'敌人计划');assert.equal(at(30,false).relations[0].name,'兄妹');assert.equal(at(30).undated[0].name,'待定师生');assert.equal(at(30).changes.length,2);
 const before=structuredClone(w.get().state);await assert.rejects(w.apply({type:'relation.save',cardId:start.id,expectedRevision:0,value:{from:a.id,to:b.id,name:'错误'}}),{code:'CONFLICT'});assert.deepEqual((await call('story.get')).state,before);assert.equal((await call('edge.list')).length,base.length);
 await call('writing.affiliation.set',{nodeId:a.id,...selection(await call('writing.cardRelations.get',{nodeId:a.id}),[org.id])});
 const file={name:'relations.json',json:await call('novel.export')},options={mode:'copy'},preview=await call('transfer.preview',{file,options}),copy=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),copied=(await s.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human')).novel;
 const copiedCard=Object.values(copied.story.state.cards).find(c=>c.title==='结盟'),partner=copiedCard.points[0].relationships[0];assert.notEqual(copiedCard.id,start.id);assert.notEqual(partner.from,a.id);assert.ok(copied.nodes[partner.from]&&copied.nodes[partner.to]);assert.equal(partner.name,'伙伴');assert.equal(partner.evidence,null);
 assert.ok(Object.values(copied.edges).some(e=>e.category==='affiliation'&&copied.writing.cards[e.to].values['world:category']==='组织'));assert.ok(Object.values(copied.edges).some(e=>e.category==='family'&&e.id!==family.edge.id));assert.equal((await call('edge.get',{edgeId:family.edge.id})).name,'兄妹');
 await assert.rejects(call('writing.relationshipChange.create',{}),{code:'NOT_ALLOWED'});
});
