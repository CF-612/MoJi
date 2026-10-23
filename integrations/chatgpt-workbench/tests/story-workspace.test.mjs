import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {ageAt,calendarDate} from '../../../src/domain/story-workspace.js';
import {timelineItems} from '../../../src/domain/story-timeline.mjs';
import {relationOverview} from '../../../src/domain/story-relations.mjs';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'workspace-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'stage-test','human');return {s,call};}
async function workspace(call){let current=await call('story.get');return {
 get:()=>current,
 async refresh(){return current=await call('story.get');},
 async apply(operation,extra={}){return current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation,...extra});},
 async create(value,extra={}){const before=new Set(Object.keys(current.state.cards));current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation:{type:'card.create',value,...extra}});return Object.values(current.state.cards).find(c=>!before.has(c.id));},
};}
const narration=chapterId=>({trackId:'main',startChapterId:chapterId,endChapterId:chapterId,startOffset:0,endOffset:1});

test('倒叙双轴、年龄资料、计划出场和关系不污染正文事实；复制重映射出场计划',async()=>{
 const {s,call}=await setup(),a=await call('writing.card.create',{type:'character_card',name:'岑予',values:{'character:birth':'1920-09-02','character:age':'青年'}}),b=await call('writing.card.create',{type:'character_card',name:'江遥',values:{'character:age':'青年，20岁'}}),edge=await call('edge.create',{from:a.id,to:b.id,name:'陌生'}),ch=await call('chapter.get',{chapterId:s.chapterId}),c2=await call('chapter.create',{title:'第二章倒叙',content:'回忆'}),w=await workspace(call);
 await call('graph.update',{nodeId:a.id,expectedRevision:a.revision,appearancePlan:{chapterId:ch.id,offset:0,story:10}});await call('graph.update',{nodeId:b.id,expectedRevision:b.revision,appearancePlan:{chapterId:ch.id,offset:0,story:10}});
 const early=await w.create({title:'初识',storyDateText:'1938-09-01',time:{story:{trackId:'main',start:10,end:11},narration:narration(ch.id)}}),late=await w.create({title:'生日之后',storyDateText:'1938-09-03',time:{story:{trackId:'main',start:20,end:21},narration:narration(ch.id)}}),flash=await w.create({title:'回忆',time:{story:{trackId:'main',start:0,end:1},narration:narration(c2.id)}});
 await w.apply({type:'relation.save',cardId:early.id,expectedRevision:1,location:{story:10},value:{from:a.id,to:b.id,name:'计划朋友'}});
 const nodes=await Promise.all([a,b].map(n=>call('graph.get',{nodeId:n.id}))),project=(cursor,plans=true,all=false)=>relationOverview(w.get().state.cards,[edge],nodes,w.get().sources.chapters,'story',cursor,plans,all);
 assert.equal(timelineItems(w.get().state.cards,w.get().sources.chapters,'story')[0].id,flash.id);assert.equal(timelineItems(w.get().state.cards,w.get().sources.chapters,'narration').at(-1).id,flash.id);
 assert.equal(project(0).nodes.length,0);assert.equal(project(0,true,true).nodes.length,2);assert.ok(project(0,true,true).nodes.every(n=>!n.active));assert.equal(project(10).relations[0].name,'计划朋友');assert.equal(project(10,false).nodes.length,0);
 assert.equal(ageAt('1920-09-02',w.get().state.cards[early.id].storyDateText),17);assert.equal(ageAt('1920-09-02',w.get().state.cards[late.id].storyDateText),18);assert.equal((await call('writing.card.get',{nodeId:b.id})).values['character:age'],'青年，20岁');assert.equal(calendarDate('1938-02-31'),null);assert.equal(ageAt('青年','1938-09-01'),null);
 assert.equal((await call('writing.card.get',{nodeId:a.id})).firstAppearance,null);assert.equal((await call('edge.get',{edgeId:edge.id})).name,'陌生');
 const backup=await call('novel.export');assert.equal(backup.novel.nodes[a.id].appearancePlan.chapterId,ch.id);
 const file={name:'stage.json',json:backup},options={mode:'copy'},preview=await call('transfer.preview',{file,options}),copy=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),copied=(await s.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human')).novel;
 const copiedA=Object.values(copied.nodes).find(n=>n.name==='岑予'),copiedEarly=Object.values(copied.story.state.cards).find(c=>c.title==='初识');assert.notEqual(copiedA.id,a.id);assert.notEqual(copiedA.appearancePlan.chapterId,ch.id);assert.ok(copied.chapters[copiedA.appearancePlan.chapterId]);assert.equal(copiedEarly.storyDateText,'1938-09-01');assert.equal(copiedEarly.points[0].relationships[0].from,copiedA.id);
 await assert.rejects(call('writing.event.create',{value:{enteringRefs:[a.id]}}),{code:'NOT_ALLOWED'});
});
test('一张剧情卡复用多页；创建幂等、双版本冲突无孤儿、移除展示不删除内容',async()=>{
 const {call}=await setup(),w=await workspace(call),before=await call('chapter.list');
 const request={requestId:'same-intent',expectedRevision:w.get().state.revision,operation:{type:'card.create',pageId:'main',value:{title:'计划卡片',content:'先规划，后写正文'}}};
 const saved=await call('story.apply',request);assert.deepEqual(await call('story.apply',request),saved);await w.refresh();const id=Object.keys(saved.state.cards)[0],ref='card:'+id;
 await assert.rejects(call('story.apply',{...request,requestId:'stale'}),{code:'CONFLICT'});assert.equal(Object.keys((await call('story.get')).state.cards).length,1);assert.deepEqual(await call('chapter.list'),before);
 await w.apply({type:'page.create',name:'另一讨论页'});const pageId=w.get().state.pages.at(-1).id;await w.apply({type:'instance.add',pageId,ref,position:{x:300,y:100}});assert.ok(w.get().state.pages[0].instances[ref]);assert.ok(w.get().state.pages[1].instances[ref]);assert.equal(Object.keys(w.get().state.cards).length,1);
 await w.apply({type:'instance.remove',pageId:'main',ref});assert.ok(w.get().state.cards[id]);assert.ok(w.get().state.pages[1].instances[ref]);
 await w.apply({type:'card.update',id,expectedRevision:1,value:{title:'网格修改'}});assert.equal((await call('writing.board.get')).planning[0].title,'网格修改');
 const current=structuredClone(w.get().state);await assert.rejects(w.apply({type:'instance.layout',pageId,points:{[ref]:{x:600,y:200}},revisions:{[ref]:0}}),{code:'CONFLICT'});assert.deepEqual((await call('story.get')).state,current);
 await w.apply({type:'instance.layout',pageId,points:{[ref]:{x:600,y:200}},revisions:{[ref]:current.pages[1].instances[ref].revision}});assert.deepEqual(w.get().state.pages[1].instances[ref],{x:600,y:200,revision:2});assert.equal(w.get().state.cards[id].title,'网格修改');
 await assert.rejects(call('writing.timelinePlan.create',{}),{code:'NOT_ALLOWED'});
});
