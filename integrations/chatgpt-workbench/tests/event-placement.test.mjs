import test from 'node:test';
import assert from 'node:assert/strict';
import {storyFixture,narration} from './fixtures/story-protocol.mjs';
import {narrationChapters,timelineItems} from '../../../src/domain/story-timeline.mjs';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';

test('叙述范围移动与扩展原子保存；证据、独立规划与正式出场不转移，撤销可恢复',async()=>{
 const x=await storyFixture('placement'),c=x.chapters,node=await x.call('writing.card.create',{type:'character_card',name:'林照'}),e=await x.create({title:'跨章寻找',storyDateText:'1938-09-01',scope:[c[0].id],evidence:[{chapterId:c[0].id,revision:c[0].revision,evidence:'林照找到钥匙。'}],cast:[{nodeId:node.id,kind:'appearance'}],time:{narration:narration(c[0],c[2]),story:{trackId:'main',start:10,end:11}}});
 await x.call('writing.link.create',{nodeId:node.id,chapterId:c[0].id,expectedChapterRevision:c[0].revision,kind:'appearance',evidence:'林照找到钥匙。',confirmed:true});const plan=await x.create({title:'原章规划',scope:[c[0].id]}),before=await x.call('novel.export');
 const args=await x.request(e.id,{time:{...e.time,narration:narration(c[1],c[3])}}),saved=await x.call('story.apply',args);assert.deepEqual(await x.call('story.apply',args),saved);
 const moved=saved.state.cards[e.id];assert.deepEqual(narrationChapters(moved,saved.sources.chapters).map(ch=>ch.id),c.slice(1,4).map(ch=>ch.id));
 for(const field of ['evidence','scope','cast','storyDateText'])assert.deepEqual(moved[field],e[field]);assert.deepEqual(moved.time.story,e.time.story);
 const after=(await x.call('novel.export')).novel;assert.deepEqual(after.chapters,before.novel.chapters);assert.deepEqual(after.writing.links,before.novel.writing.links);assert.deepEqual(after.story.state.cards[plan.id],before.novel.story.state.cards[plan.id]);
 const grown=await x.apply({type:'card.update',id:e.id,expectedRevision:moved.revision,value:{time:{...moved.time,narration:narration(c[1],c[4])}}});assert.equal(grown.state.cards[e.id].time.narration.endChapterId,c[4].id);
 let undo=await x.call('story.undo',{expectedRevision:grown.state.revision});undo=await x.call('story.undo',{expectedRevision:undo.state.revision});assert.deepEqual(undo.state.cards[e.id],e);
});
test('工作区与卡片冲突拒绝整次位移；纯正文修改不改变布局，证据写入另行核验版本',async()=>{
 const x=await storyFixture('placement-cas'),c=x.chapters,e=await x.create({title:'事件',time:{narration:narration(c[0])}}),args=await x.request(e.id,{time:{narration:narration(c[1])}});
 await x.call('chapter.update',{chapterId:c[1].id,expectedRevision:c[1].revision,content:'改写目标章'});await x.call('story.apply',args); // Coordinates are chapter identities, not claims about prose.
 const stale=await x.request(e.id,{time:{narration:narration(c[2])}});await x.apply({type:'card.update',id:e.id,expectedRevision:stale.operation.expectedRevision,value:{title:'其他端改名'}});const before=await x.read();await assert.rejects(x.call('story.apply',stale),{code:'CONFLICT'});assert.deepEqual((await x.read()).state,before.state);
 await assert.rejects(x.call('story.apply',{...stale,requestId:crypto.randomUUID(),expectedRevision:before.state.revision}),{code:'CONFLICT'},'fresh workspace revision cannot bypass stale card revision');
 const proof=await x.request(e.id,{evidence:[{chapterId:c[1].id,revision:c[1].revision,evidence:c[1].content}]});await assert.rejects(x.call('story.apply',proof),{code:'CONFLICT'});assert.deepEqual((await x.read()).state,before.state);
 const deleted=await x.request(e.id,{time:{narration:narration(c[4])}});await x.call('chapter.delete',{chapterId:c[4].id,expectedRevision:c[4].revision,confirm:true});await assert.rejects(x.call('story.apply',deleted),{code:'CONFLICT'});
});
test('故事轴独立排序不平移固定关系点；无效范围和旧位置写入不能部分保存',async()=>{
 const x=await storyFixture('placement-story'),a=await x.call('writing.card.create',{type:'character_card',name:'岑予'}),b=await x.call('writing.card.create',{type:'character_card',name:'江遥'}),cards=[];
 for(let i=0;i<4;i++)cards.push(await x.create({title:`事件${i}`,storyDateText:'1938年秋',time:{narration:narration(x.chapters[0],x.chapters[0],i/4,(i+1)/4),story:{trackId:'main',start:10*(i+1),end:10*(i+1)+1}}}));
 let target=(await x.read()).state.cards[cards[3].id];await x.apply({type:'relation.save',cardId:target.id,expectedRevision:target.revision,location:{story:40},value:{from:a.id,to:b.id,name:'计划敌对'}});target=(await x.read()).state.cards[target.id];
 const args=await x.request(target.id,{time:{...target.time,story:{trackId:'main',start:15,end:16}}});const result=await x.call('story.apply',args);assert.deepEqual(await x.call('story.apply',args),result);
 assert.deepEqual(timelineItems(result.state.cards,result.sources.chapters,'story').map(r=>r.id),[cards[0].id,cards[3].id,cards[1].id,cards[2].id]);assert.deepEqual(timelineItems(result.state.cards,result.sources.chapters,'narration').map(r=>r.id),cards.map(c=>c.id));
 assert.equal(relationSnapshot(result.state.cards,[],result.sources.chapters,'story',20,true).relations.length,0);assert.equal(relationSnapshot(result.state.cards,[],result.sources.chapters,'story',40,true).relations[0].name,'计划敌对');assert.deepEqual(result.state.cards[target.id].points,target.points);
 const invalid=await x.request(target.id,{time:{...target.time,story:{trackId:'main',start:20,end:20}}});await assert.rejects(x.call('story.apply',invalid),{code:'STORY_INVALID'});assert.deepEqual((await x.read()).state,result.state);await assert.rejects(x.call('writing.event.place',{}),{code:'NOT_ALLOWED'});
});
