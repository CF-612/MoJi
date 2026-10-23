import test from 'node:test';
import assert from 'node:assert/strict';
import {createService} from '../server/service.mjs';
import {storyFixture,narration} from './fixtures/story-protocol.mjs';

test('统一卡片连续保存接续已确认版本；同一版本并发拖动不能覆盖已保存位置',async()=>{
 const x=await storyFixture('direct'),[a,b,c]=x.chapters,e=await x.create({title:'未命名事件',time:{narration:narration(a)}});
 const first=await x.request(e.id,{time:{narration:narration(b)}}),competing=await x.request(e.id,{time:{narration:narration(c)}});
 const saved=await x.call('story.apply',first);await assert.rejects(x.call('story.apply',competing),{code:'CONFLICT'});
 assert.equal((await x.read()).state.cards[e.id].time.narration.startChapterId,b.id);
 const second=await x.request(e.id,{time:{narration:narration(b,c)}});assert.equal(second.operation.expectedRevision,saved.state.cards[e.id].revision);assert.notEqual(first.requestId,second.requestId);
 const grown=await x.call('story.apply',second);assert.equal(grown.state.cards[e.id].revision,e.revision+2);assert.equal(grown.state.cards[e.id].time.narration.endChapterId,c.id);
 await assert.rejects(x.call('writing.event.place',{}),{code:'NOT_ALLOWED'});
});
test('保存回复丢失后重启以相同请求核对，不重复保存；其他端修改保留冲突',async()=>{
 const x=await storyFixture('direct-retry'),e=await x.create({title:'位置草稿',time:{narration:narration(x.chapters[0])}}),args=await x.request(e.id,{time:{narration:narration(x.chapters[1])}});
 const receipt=await x.call('story.apply',args); // Simulate a committed response lost before the client sees it.
 const restarted=await createService(x.directory),rpc=(action,a={})=>restarted.rpc(action,{novelId:x.novelId,...a},'direct-retry','human');
 const current=await rpc('story.get');await rpc('story.apply',{requestId:'other-device',expectedRevision:current.state.revision,operation:{type:'card.update',id:e.id,expectedRevision:current.state.cards[e.id].revision,value:{title:'其他端改名'}}});
 assert.deepEqual(await rpc('story.apply',args),receipt,'retry retrieves exact committed receipt even after newer edits');
 const after=await rpc('story.get');assert.equal(after.state.cards[e.id].revision,e.revision+2);assert.equal(after.state.cards[e.id].title,'其他端改名');assert.equal(after.state.cards[e.id].time.narration.startChapterId,x.chapters[1].id);
 await assert.rejects(rpc('story.apply',{...args,requestId:'new-stale-request'}),{code:'CONFLICT'});assert.deepEqual((await rpc('story.get')).state,after.state);
});
test('占位剧情卡可补充、删除并由工作区历史撤销恢复',async()=>{
 const x=await storyFixture('direct-history'),e=await x.create({title:'占位事件'});assert.equal(e.content,'');await x.apply({type:'card.update',id:e.id,expectedRevision:e.revision,value:{title:'之后补充的事件',content:'补充经过'}});
 const before=await x.read();await x.apply({type:'card.delete',id:e.id});const removed=await x.read();assert.equal(removed.state.cards[e.id],undefined);assert.ok(removed.history.length>before.history.length);
 const restored=await x.call('story.undo',{expectedRevision:removed.state.revision});assert.deepEqual(restored.state.cards[e.id],before.state.cards[e.id]);assert.deepEqual(restored.state.pages,before.state.pages);
});
test('故事位置连续修改只改变当前轴；章节叙述、日期说明与固定关系点保留',async()=>{
 const x=await storyFixture('direct-axes'),e=await x.create({title:'事件',storyDateText:'1938年秋',time:{narration:narration(x.chapters[0]),story:{trackId:'main',start:20,end:21}},points:[{id:'fixed',location:{story:20},relationships:[]}]});
 for(const start of [10,5]){const current=(await x.read()).state.cards[e.id];await x.apply({type:'card.update',id:e.id,expectedRevision:current.revision,value:{time:{...current.time,story:{trackId:'main',start,end:start+1}}}});}
 const saved=(await x.read()).state.cards[e.id];assert.equal(saved.time.story.start,5);assert.equal(saved.revision,e.revision+2);assert.deepEqual(saved.time.narration,e.time.narration);assert.equal(saved.storyDateText,e.storyDateText);assert.deepEqual(saved.points,e.points);
});
