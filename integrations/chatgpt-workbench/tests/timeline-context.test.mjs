import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'timeline-context-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'timeline-context','human');return {s,call};}
async function card(call,value){const before=await call('story.get'),saved=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:before.state.revision,operation:{type:'card.create',pageId:'main',value}});return {story:saved,card:Object.values(saved.state.cards).find(c=>!before.state.cards[c.id])};}
test('章节可创建同一网格剧情卡；重复请求与失效正文证据不留下半张卡',async()=>{
 const {s,call}=await setup(),initial=await call('chapter.get',{chapterId:s.chapterId}),chapter=await call('chapter.update',{chapterId:initial.id,expectedRevision:initial.revision,content:'她收到一封来信。'}),before=await call('story.get');
 const args={expectedRevision:before.state.revision,operation:{type:'card.create',pageId:'main',value:{title:'章节中的计划',content:'之后再写正文',scope:[chapter.id],evidence:[{chapterId:chapter.id,revision:chapter.revision,evidence:(await call('chapter.get',{chapterId:chapter.id})).content}]}},requestId:'chapter-plan-intent'};
 const saved=await call('story.apply',args);assert.deepEqual(await call('story.apply',args),saved);
 const plan=Object.values(saved.state.cards)[0];assert.equal(plan.status,'idea');assert.deepEqual(plan.scope,[chapter.id]);assert.equal(plan.evidence[0].revision,chapter.revision);assert.ok(saved.state.pages[0].instances['card:'+plan.id]);assert.equal(saved.sources.chapters.length,1);
 await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,content:'她收到一封来信。新的正文。'});
 const current=await call('story.get');await assert.rejects(call('story.apply',{...args,expectedRevision:current.state.revision,requestId:'stale-plan'}),{code:'CONFLICT'});assert.equal(Object.keys((await call('story.get')).state.cards).length,1);
 assert.equal((await call('writing.cardRelations.get',{nodeId:(await call('writing.card.create',{type:'character_card',name:'岑予'})).id})).edges.length,0);
 await assert.rejects(call('writing.chapterPlan.create',{}),{code:'NOT_ALLOWED'});
});
test('剧情卡伏笔节点原子保存；计划不自动埋设或回收；同一 ID 编辑',async()=>{
 const {call}=await setup(),{story,card:plot}=await card(call,{title:'来信'}),value={title:'铜钥匙',content:'门边有一把钥匙',resolution:'active',plotNodes:[{id:'plant',cardId:plot.id,kind:'plant',note:'计划在这里出现',evidence:null}],evidence:[]};
 await assert.rejects(call('story.foreshadow.save',{expectedRevision:story.state.revision-1,value}),{code:'CONFLICT'});assert.equal((await call('writing.foreshadow.list')).length,0);
 await assert.rejects(call('story.foreshadow.save',{expectedRevision:story.state.revision,value:{...value,resolution:'complete'}}),{code:'INVALID_WRITING'});assert.equal((await call('writing.foreshadow.list')).length,0);
 const args={expectedRevision:story.state.revision,value,requestId:'plot-shadow-intent'},saved=await call('story.foreshadow.save',args);assert.deepEqual(await call('story.foreshadow.save',args),saved);
 let shadow=await call('writing.foreshadow.get',{id:saved.id});assert.equal(shadow.status,'planned');assert.equal(shadow.versions,undefined);assert.equal(shadow.plotNodes[0].cardId,plot.id);assert.equal(shadow.plotNodes[0].evidence,null);
 shadow=await call('writing.foreshadow.update',{id:shadow.id,expectedRevision:shadow.revision,confirmed:true,value:{title:'银钥匙'}});assert.equal(shadow.title,'银钥匙');assert.equal(shadow.status,'planned');assert.equal((await call('writing.foreshadow.list')).length,1);
 await assert.rejects(call('story.apply',{expectedRevision:(await call('story.get')).state.revision,operation:{type:'card.delete',id:plot.id}}),/仍关联伏笔/);assert.ok((await call('story.get')).state.cards[plot.id]);
});
test('卡片参与不等于正式出场或提及；关系计划需作者正文确认，改写后标记复核',async()=>{
 const {s,call}=await setup(),chapter=await call('chapter.update',{chapterId:s.chapterId,expectedRevision:1,content:'岑予接过铜钥匙。他想起了江遥。'}),a=await call('writing.card.create',{type:'character_card',name:'岑予'}),b=await call('writing.card.create',{type:'character_card',name:'江遥'});
 let {story,card:plot}=await card(call,{title:'来信',cast:[{nodeId:b.id,kind:'appearance'}],scope:[chapter.id],time:{narration:{startChapterId:chapter.id,startOffset:0,endChapterId:chapter.id,endOffset:1,trackId:'main'}}});
 assert.deepEqual((await call('writing.link.list',{nodeId:b.id})),[],'参与计划不能制造正式正文关联');
 await call('writing.link.create',{confirmed:true,nodeId:a.id,chapterId:chapter.id,expectedChapterRevision:chapter.revision,kind:'appearance',evidence:'岑予接过铜钥匙。'});
 await call('writing.link.create',{confirmed:true,nodeId:b.id,chapterId:chapter.id,expectedChapterRevision:chapter.revision,kind:'mention',evidence:'他想起了江遥。'});
 assert.equal((await call('writing.card.get',{nodeId:b.id})).firstAppearance,null);
 story=await call('story.get');const operation={type:'relation.save',cardId:plot.id,expectedRevision:plot.revision,location:{narration:{chapterId:chapter.id,offset:0.5}},value:{from:a.id,to:b.id,name:'合作',reason:'计划合作'}};
 story=await call('story.apply',{expectedRevision:story.state.revision,operation});let projection=relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',1,true);assert.equal(projection.relations[0].planned,true);assert.equal(relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',1,false).relations.length,0);
 const point=story.state.cards[plot.id].points[0],change=point.relationships[0];const confirm={...operation,expectedRevision:story.state.cards[plot.id].revision,pointId:point.id,source:{cardId:plot.id,revision:story.state.cards[plot.id].revision,pointId:point.id,changeId:change.id},confirmed:true,value:{...operation.value,evidence:{chapterId:chapter.id,revision:chapter.revision,evidence:(await call('chapter.get',{chapterId:chapter.id})).content}}};
 await assert.rejects(s.rpc('story.apply',{novelId:s.novelId,expectedRevision:story.state.revision,operation:confirm},'agent','agent'),{code:'HUMAN_REQUIRED'});
 story=await call('story.apply',{expectedRevision:story.state.revision,operation:confirm});assert.equal(relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',1,false).relations[0].planned,false);
 await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,content:'岑予独自接过钥匙。'});story=await call('story.get');projection=relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',1,false);assert.equal(projection.changes[0].review,true);assert.equal(projection.relations.length,0,'失效证据不能继续充当当前事实');
});
