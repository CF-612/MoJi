import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {projectStage,timelineNodes} from '../../../src/domain/story-workspace.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'timeline-context-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'timeline-context','human');return {s,call};}
test('没有事件也能从章节新建同一网格规划；重复请求、正文版本冲突不留下半张卡',async()=>{
 const {s,call}=await setup(),chapter=await call('chapter.get',{chapterId:s.chapterId});
 const args={chapterId:chapter.id,expectedChapterRevision:chapter.revision,confirmed:true,value:{title:'章节中的计划',content:'之后再写正文'},requestId:'chapter-plan-intent'};
 const saved=await call('writing.chapterPlan.create',args);assert.equal((await call('writing.chapterPlan.create',args)).nodeId,saved.nodeId);
 const board=await call('writing.board.get');assert.equal(board.events.length,0);assert.equal(board.chapters.length,1);assert.equal(timelineNodes(board)[0].eventId,null);assert.equal(projectStage(board,null,{chapterId:chapter.id}).planning[0].id,saved.nodeId);
 const plan=(await call('planning.get',{nodeId:saved.nodeId})).node;assert.equal(plan.status,'idea');assert.deepEqual(plan.chapterRefs,[{chapterId:chapter.id,revision:chapter.revision}]);
 await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,content:chapter.content+'新的正文。'});
 await assert.rejects(call('writing.chapterPlan.create',{...args,requestId:'stale-plan'}),{code:'CONFLICT'});assert.equal((await call('planning.list')).total,1);
 assert.equal((await call('writing.cardRelations.get',{nodeId:(await call('writing.card.create',{type:'character_card',name:'岑予'})).id})).edges.length,0);
});
test('时间节点上的伏笔新建与事件关联原子保存；计划不自动埋设或回收；同一 ID 编辑',async()=>{
 const {call}=await setup(),event=await call('writing.event.create',{confirmed:true,value:{title:'来信',order:10,narrativeKind:'linear'}}),value={title:'铜钥匙',content:'门边有一把钥匙',status:'planned',memoryRefs:[],evidence:[],targetChapterId:null,abandonReason:''};
 await assert.rejects(call('writing.timelineForeshadow.create',{eventId:event.id,expectedEventRevision:0,confirmed:true,value}),{code:'CONFLICT'});assert.equal((await call('writing.foreshadow.list')).length,0);
 await assert.rejects(call('writing.timelineForeshadow.create',{eventId:event.id,expectedEventRevision:event.revision,confirmed:true,value:{...value,status:'recovered'}}),{code:'INVALID_WRITING'});assert.equal((await call('writing.foreshadow.list')).length,0);
 const args={eventId:event.id,expectedEventRevision:event.revision,confirmed:true,value,requestId:'event-shadow-intent'},saved=await call('writing.timelineForeshadow.create',args);assert.equal((await call('writing.timelineForeshadow.create',args)).foreshadowId,saved.foreshadowId);
 let shadow=await call('writing.foreshadow.get',{id:saved.foreshadowId});assert.equal(shadow.status,'planned');assert.equal(shadow.versions,undefined);assert.deepEqual((await call('writing.event.get',{id:event.id})).foreshadowRefs,[shadow.id]);
 shadow=await call('writing.foreshadow.update',{id:shadow.id,expectedRevision:shadow.revision,confirmed:true,value:{title:'银钥匙'}});assert.equal(projectStage(await call('writing.board.get'),event.id).foreshadows[0].title,'银钥匙');assert.equal(projectStage(await call('writing.board.get'),event.id).foreshadows[0].stageStatus,'计划');
});
test('节点关联分别呈现参与、正式出场和提及；改写复核；未定关系可就地生效',async()=>{
 const {s,call}=await setup(),chapter=await call('chapter.update',{chapterId:s.chapterId,expectedRevision:1,content:'岑予接过铜钥匙。他想起了江遥。'}),a=await call('writing.card.create',{type:'character_card',name:'岑予'}),b=await call('writing.card.create',{type:'character_card',name:'江遥'});
 const e=await call('writing.event.create',{confirmed:true,value:{title:'来信',order:10,narrativeKind:'linear',memoryRefs:[b.id],chapterRefs:[{chapterId:chapter.id,revision:chapter.revision,evidence:''}]}});
 await call('writing.link.create',{confirmed:true,nodeId:a.id,chapterId:chapter.id,expectedChapterRevision:chapter.revision,kind:'appearance',evidence:'岑予接过铜钥匙。'});
 await call('writing.link.create',{confirmed:true,nodeId:b.id,chapterId:chapter.id,expectedChapterRevision:chapter.revision,kind:'mention',evidence:'他想起了江遥。'});
 const relation=await call('writing.relationship.create',{nodeId:a.id,targetId:b.id,expectedNodeRevision:a.revision,expectedTargetRevision:b.revision,confirmed:true,name:'合作',timing:'undated',category:'partner'});
 let stage=projectStage(await call('writing.board.get'),e.id);assert.equal(stage.materials.participating[0].id,b.id);assert.deepEqual(stage.materials.prose.map(r=>r.kind),['appearance','mention']);assert.equal((await call('writing.card.get',{nodeId:b.id})).firstAppearance,null);assert.equal(stage.unplacedRelationships[0].id,relation.edge.id);
 await call('writing.relationshipChange.create',{confirmed:true,value:{edgeId:relation.edge.id,eventId:e.id,value:{name:'合作',category:'partner',active:true}}});stage=projectStage(await call('writing.board.get'),e.id);assert.equal(stage.unplacedRelationships.length,0);assert.equal(stage.edges[0].id,relation.edge.id);
 await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,content:'岑予独自接过钥匙。'});assert.ok(projectStage(await call('writing.board.get'),e.id).materials.prose.every(r=>r.review));
});
