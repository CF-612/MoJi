import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {readPlanningSnapshot} from '../vendor/cuigengji/src/client/features/planning/data.js';
import {timelineTracks,unplacedPlanning} from '../../../src/domain/timeline-tracks.js';
import {navigationModules,profileModules} from '../vendor/cuigengji/src/client/modules/registry.mjs';
test('统一规划导航没有独立时间线；两轴均保留当前规划范围内的所有卡片',async()=>{
 const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'unified-plan-'))),call=(a,args={})=>s.rpc(a,{novelId:s.novelId,requestId:crypto.randomUUID(),...args},'unified','human'),chapter=await call('chapter.get',{chapterId:s.chapterId}),page=await call('planning.page.create',{name:'虚构支线'}),event=await call('writing.event.create',{confirmed:true,value:{title:'跨端事件',order:10,narrativeKind:'linear',chapterRefs:[{chapterId:chapter.id,revision:chapter.revision,evidence:''}]}});
 const eventPlan=await call('writing.timelinePlan.create',{eventId:event.id,expectedEventRevision:event.revision,confirmed:true,value:{title:'事件关联规划',pageId:page.id}}),chapterPlan=await call('writing.chapterPlan.create',{chapterId:chapter.id,expectedChapterRevision:chapter.revision,confirmed:true,value:{title:'章节关联规划',pageId:page.id}}),loose=await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'loose',value:{title:'尚未安排',pageId:page.id}}]});
 const snapshot=await readPlanningSnapshot(call,s.novelId,{pageId:page.id}),board={...await call('writing.board.get'),planning:snapshot.items};assert.equal(snapshot.items.length,3);assert.equal(navigationModules(profileModules('complete')).some(([id])=>id==='timeline'),false);
 for(const mode of ['narration','story']){const track=timelineTracks(board,mode),visible=new Set([...track.slots.flatMap(r=>r.plans.map(p=>p.id)),...unplacedPlanning(board,mode).map(p=>p.id)]);assert.deepEqual(visible,new Set(snapshot.items.map(p=>p.id)));}
 assert.ok(timelineTracks(board,'narration').slots[0].plans.some(p=>p.id===eventPlan.nodeId));assert.ok(unplacedPlanning(board,'story').some(p=>p.id===chapterPlan.nodeId));assert.ok(unplacedPlanning(board).some(p=>p.id===loose.mapping.loose));
 const edited=await call('planning.get',{nodeId:eventPlan.nodeId});await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.update',id:edited.node.id,expectedRevision:edited.node.revision,value:{title:'同一张卡片已改名'}}]});const after=await readPlanningSnapshot(call,s.novelId,{pageId:page.id});assert.equal(after.items.find(p=>p.id===eventPlan.nodeId).title,'同一张卡片已改名');assert.equal(after.items.length,3);
});
