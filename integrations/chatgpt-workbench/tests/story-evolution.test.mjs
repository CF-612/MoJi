import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createService} from '../server/service.mjs';
import {timelineItems} from '../../../src/domain/story-timeline.mjs';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';
import {directorySnapshot} from '../../../src/domain/chapters/order.ts';
async function setup(){const path=resolve(import.meta.dirname,'../.data/tests');await mkdir(path,{recursive:true});const s=await createService(await mkdtemp(join(path,'story-')));return {s,novelId:s.novelId,call:(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'story-test','human')};}
async function workspace(call){let current=await call('story.get');return {
 get:()=>current,
 async refresh(){return current=await call('story.get');},
 async apply(operation,extra={}){return current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation,...extra});},
 async create(value,extra={}){const before=new Set(Object.keys(current.state.cards));current=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:current.state.revision,operation:{type:'card.create',value,...extra}});return Object.values(current.state.cards).find(c=>!before.has(c.id));},
};}
const narration=chapterId=>({trackId:'main',startChapterId:chapterId,endChapterId:chapterId,startOffset:0,endOffset:1});

test('统一剧情双时间顺序、多章与背景；参与不等于出场；依据复核、冲突和删除撤销',async()=>{
 const {s,call}=await setup(),node=await call('graph.create',{name:'林照',type:'character_card'}),a=await call('chapter.get',{chapterId:s.chapterId}),created=await call('chapter.create',{title:'第二章',content:'林照想起童年。'}),b=await call('chapter.get',{chapterId:created.id}),w=await workspace(call);
 const cast=[{nodeId:node.id,kind:'participant'}],proof=ch=>({chapterId:ch.id,revision:ch.revision,evidence:ch.content});
 const request={requestId:'event-single-intent',expectedRevision:w.get().state.revision,operation:{type:'card.create',value:{title:'长大后',cast,evidence:[proof(a)],time:{story:{trackId:'main',start:20,end:21},narration:narration(a.id)}}}};
 const receipt=await call('story.apply',request);assert.deepEqual(await call('story.apply',request),receipt);await w.refresh();const later=Object.values(receipt.state.cards)[0];
 const earlier=await w.create({title:'童年的回忆',cast,evidence:[proof(b)],time:{story:{trackId:'main',start:10,end:11},narration:narration(b.id)}}),background=await w.create({title:'城镇建立',cast,time:{story:{trackId:'main',start:0,end:1}}});
 const ids=mode=>timelineItems(w.get().state.cards,w.get().sources.chapters,mode).map(i=>i.id);
 assert.deepEqual(ids('story'),[background.id,earlier.id,later.id]);assert.deepEqual(ids('narration'),[later.id,earlier.id]);assert.equal(w.get().state.cards[background.id].time.narration,undefined);
 assert.equal((await call('writing.card.get',{nodeId:node.id})).firstAppearance,null);assert.equal((await call('writing.board.get')).events.filter(e=>e.memoryRefs.includes(node.id)).length,3);
 const before=structuredClone(w.get().state);
 await assert.rejects(w.create({title:'未保存依据',evidence:[{...proof(a),evidence:'未保存的原文'}]}),{code:'STORY_INVALID'});assert.deepEqual((await call('story.get')).state,before);
 await w.apply({type:'card.update',id:earlier.id,expectedRevision:earlier.revision,value:{scope:[a.id,b.id],evidence:[proof(a),proof(b)]}});
 const board=await call('writing.board.get');assert.ok(board.chapters.every(ch=>ch.events.includes(earlier.id)),'one card can reference multiple chapters without duplicate content');
 await assert.rejects(w.apply({type:'card.update',id:earlier.id,expectedRevision:earlier.revision,value:{title:'冲突'}}),{code:'CONFLICT'});
 await call('chapter.move',{chapterId:b.id,volumeId:null,beforeChapterId:a.id,requestId:crypto.randomUUID(),expectedDirectory:directorySnapshot(await call('chapter.list'),await call('volume.list'))});await w.refresh();assert.deepEqual(ids('narration'),[earlier.id,later.id]);assert.deepEqual(ids('story'),[background.id,earlier.id,later.id]);
 await call('chapter.update',{chapterId:b.id,expectedRevision:(await call('chapter.get',{chapterId:b.id})).revision,content:'新的回忆'});assert.equal((await call('writing.board.get')).events.find(e=>e.id===earlier.id).review,true);
 await w.refresh();const saved=structuredClone(w.get().state.cards[earlier.id]);await w.apply({type:'card.delete',id:earlier.id});assert.equal(Object.keys(w.get().state.cards).length,2);
 const undone=await call('story.undo',{expectedRevision:w.get().state.revision});assert.deepEqual(undone.state.cards[earlier.id],saved);
 await assert.rejects(call('writing.event.create',{}),{code:'NOT_ALLOWED'});
});
test('关系发生点保留基础关系；计划过滤、固定位置、删除撤销、正文依据与上下文容量',async()=>{
 const {s,call}=await setup(),a=await call('graph.create',{name:'林照',type:'character_card'}),b=await call('graph.create',{name:'周宁',type:'character_card'}),ch=await call('chapter.get',{chapterId:s.chapterId}),edge=await call('edge.create',{from:a.id,to:b.id,name:'陌生人'}),w=await workspace(call);
 const e1=await w.create({title:'相识',time:{story:{trackId:'main',start:10,end:11}}}),e2=await w.create({title:'争执',time:{story:{trackId:'main',start:20,end:21}}});
 const confirmedRelation={type:'relation.save',cardId:e1.id,expectedRevision:1,location:{story:10,narration:{chapterId:ch.id,offset:0}},value:{from:a.id,to:b.id,name:'朋友',evidence:{chapterId:ch.id,revision:ch.revision,evidence:ch.content}},confirmed:true};
 const beforeProof=structuredClone(w.get().state);await assert.rejects(s.rpc('story.apply',{novelId:s.novelId,requestId:'agent-cannot-confirm',expectedRevision:beforeProof.revision,operation:confirmedRelation},'agent','agent'),{code:'HUMAN_REQUIRED'});assert.deepEqual((await call('story.get')).state,beforeProof);
 await w.apply(confirmedRelation);
 await w.apply({type:'relation.save',cardId:e2.id,expectedRevision:1,location:{story:20},value:{from:a.id,to:b.id,name:'分开计划'}});
 const at=(cursor,plans=true)=>relationSnapshot(w.get().state.cards,[edge],w.get().sources.chapters,'story',cursor,plans);
 assert.equal(at(0).relations[0].name,'陌生人');assert.equal(at(10).relations[0].name,'朋友');assert.equal(at(20).relations[0].name,'分开计划');assert.equal(at(20,false).relations[0].name,'朋友');assert.equal((await call('edge.get',{edgeId:edge.id})).name,'陌生人');
 const current=w.get().state.cards[e1.id],point=current.points[0];
 await assert.rejects(w.apply({type:'relation.save',cardId:e1.id,expectedRevision:0,value:{from:a.id,to:b.id,name:'错误'}}),{code:'CONFLICT'});
 const context=await call('writing_context.get',{chapterId:ch.id,maxChars:2000});assert.match(context.candidatePolicy,/不证明其实际出场/);assert.ok(JSON.stringify(context).length<=2000);
 await w.apply({type:'card.update',id:e1.id,expectedRevision:current.revision,value:{time:{story:{trackId:'main',start:30,end:31}}}});assert.equal(w.get().state.cards[e1.id].points[0].location.story,10,'moving card cannot silently move fixed fact');assert.equal(at(20,false).relations[0].name,'朋友');
 await w.apply({type:'relation.delete',source:{cardId:e1.id,revision:w.get().state.cards[e1.id].revision,pointId:point.id,changeId:point.relationships[0].id}});assert.equal(at(20,false).relations[0].name,'陌生人');
 await call('story.undo',{expectedRevision:w.get().state.revision});await w.refresh();assert.equal(at(20,false).relations[0].name,'朋友');
 await w.apply({type:'card.delete',id:e1.id});assert.equal(at(20,false).relations[0].name,'陌生人');assert.equal(at(20).relations[0].name,'分开计划');
 await assert.rejects(call('writing.relationshipChange.create',{}),{code:'NOT_ALLOWED'});
});
test('完整备份保留剧情历史；复制重映射卡片、正文证据、关系点、伏笔和页面；范围导出无悬空引用',async()=>{
 const {s,novelId,call}=await setup(),a=await call('graph.create',{name:'林照',type:'character_card'}),b=await call('graph.create',{name:'周宁',type:'character_card'}),ch=await call('chapter.get',{chapterId:s.chapterId}),w=await workspace(call);
 await call('edge.create',{from:a.id,to:b.id,name:'同事'});
 const card=await w.create({title:'点亮灯',cast:[{nodeId:a.id,kind:'participant'}],scope:[ch.id],evidence:[{chapterId:ch.id,revision:ch.revision,evidence:ch.content}]},{pageId:'main'});
 const f=await call('writing.foreshadow.create',{confirmed:true,value:{title:'灯',memoryRefs:[a.id],evidence:[],plotNodes:[{id:'lamp',cardId:card.id,kind:'plant',note:'灯光线索',evidence:null}],resolution:'active'}});
 await w.apply({type:'card.update',id:card.id,expectedRevision:1,value:{title:'共同点亮灯',foreshadowRefs:[f.id]}});
 await w.apply({type:'relation.save',cardId:card.id,expectedRevision:2,location:{narration:{chapterId:ch.id,offset:0}},value:{from:a.id,to:b.id,name:'挚友',evidence:{chapterId:ch.id,revision:ch.revision,evidence:ch.content}},confirmed:true});
 const backup=await call('workspace.export'),other=await setup();await other.s.rpc('workspace.import',{backup},'restore','human');const restored=await other.s.rpc('novel.export',{novelId},'restore','human');assert.deepEqual(restored.novel.story,(await call('novel.export')).novel.story,'full backup preserves workspace and history');
 const file={name:'剧情作品.json',json:await call('novel.export')},options={mode:'copy',title:'剧情副本'},preview=await call('transfer.preview',{file,options});assert.equal(preview.valid,true);const result=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()});
 const copy=(await s.rpc('novel.export',{novelId:result.novelIds[0]},'copy','human')).novel,cc=Object.values(copy.story.state.cards).find(c=>c.title==='共同点亮灯'),point=cc.points[0],relation=point.relationships[0];
 assert.notEqual(cc.id,card.id);assert.notEqual(cc.cast[0].nodeId,a.id);assert.ok(copy.nodes[cc.cast[0].nodeId]);assert.ok(copy.chapters[cc.evidence[0].chapterId]);assert.notEqual(cc.evidence[0].chapterId,ch.id);assert.equal(relation.evidence.chapterId,cc.evidence[0].chapterId);assert.ok(copy.nodes[relation.from]&&copy.nodes[relation.to]);assert.notEqual(point.id,w.get().state.cards[card.id].points[0].id);
 assert.ok(copy.story.state.pages.some(p=>p.instances['card:'+cc.id]));assert.equal(copy.writing.foreshadows[cc.foreshadowRefs[0]].plotNodes[0].cardId,cc.id);assert.ok(copy.story.history.some(h=>h.reason==='导入统一剧情卡'),'copy starts destination-owned history, not unremapped source history');
 const partial=await call('transfer.export',{selection:{kind:'memory',novelId,nodeIds:[a.id,b.id]},format:'package'}),picked=JSON.parse(partial.content).payload.projects[0];assert.equal(Object.keys(picked.story?.state.cards||{}).length,0);assert.equal(Object.keys(picked.writing.events).length,0);assert.equal(Object.keys(picked.writing.relationshipChanges).length,0);
 const invalid=structuredClone(file.json.novel);invalid.story.state.cards[card.id].evidence[0].chapterId='missing';assert.throws(()=>s.store.validateProject(invalid));
 const historical=structuredClone(file.json.novel),snapshot=historical.story.history.find(h=>h.state.cards[card.id]?.evidence.length);snapshot.state.cards[card.id].evidence[0].chapterId='missing';assert.throws(()=>s.store.validateProject(historical));
});
