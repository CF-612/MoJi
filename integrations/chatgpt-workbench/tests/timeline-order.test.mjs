import test from 'node:test';
import assert from 'node:assert/strict';
import {storyFixture,narration} from './fixtures/story-protocol.mjs';
import {timelineItems} from '../../../src/domain/story-timeline.mjs';
import {timelineOrderScope} from '../../../src/domain/story-workspace.js';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';
const ordered=(story,mode)=>timelineItems(story.state.cards,story.sources.chapters,mode).map(c=>c.id);

test('故事位置与叙述位置可独立改序，保留证据、卡片与伏笔；重试不二次移动',async()=>{
 const x=await storyFixture('order-independent'),ch=x.chapters[0],a=await x.call('writing.card.create',{type:'character_card',name:'岑予'}),b=await x.call('writing.card.create',{type:'character_card',name:'江遥'}),cards=[];
 for(let i=0;i<3;i++)cards.push(await x.create({title:'事件'+i,storyDateText:'1938年秋',time:{story:{trackId:'main',start:10+i*10,end:11+i*10},narration:narration(ch,ch,i/4,(i+1)/4)},evidence:[{chapterId:ch.id,revision:ch.revision,evidence:'林照找到钥匙。'}]}));
 await x.apply({type:'relation.save',cardId:cards[0].id,expectedRevision:cards[0].revision,location:{story:10},value:{from:a.id,to:b.id,name:'计划伙伴'}});
 const plan=await x.create({title:'处理来信',scope:[ch.id]});let story=await x.read();const shadow=await x.call('story.foreshadow.save',{expectedRevision:story.state.revision,value:{title:'火漆',resolution:'active',evidence:[],plotNodes:[{id:'plant',cardId:cards[0].id,kind:'plant',note:'计划',evidence:null}]}});
 story=await x.read();const before=structuredClone(story.state),last=story.state.cards[cards[2].id],args=await x.request(last.id,{time:{...last.time,story:{trackId:'main',start:15,end:16}}});const result=await x.call('story.apply',args);assert.deepEqual(await x.call('story.apply',args),result);
 assert.deepEqual(ordered(result,'story'),[cards[0].id,cards[2].id,cards[1].id]);assert.deepEqual(ordered(result,'narration'),cards.map(c=>c.id));assert.deepEqual(result.state.cards[plan.id],before.cards[plan.id]);
 for(const id of cards.map(c=>c.id))for(const field of ['evidence','scope','cast','storyDateText','points'])assert.deepEqual(result.state.cards[id][field],before.cards[id][field]);assert.equal((await x.call('writing.foreshadow.get',{id:shadow.id})).plotNodes[0].cardId,cards[0].id);
 const card=result.state.cards[last.id];story=await x.apply({type:'card.update',id:last.id,expectedRevision:card.revision,value:{time:{...card.time,narration:narration(ch,ch,.1,.2)}}});assert.deepEqual(ordered(story,'narration'),[cards[0].id,cards[2].id,cards[1].id]);assert.deepEqual(ordered(story,'story'),ordered(result,'story'));
 assert.equal(relationSnapshot(story.state.cards,[],story.sources.chapters,'story',25,true).relations[0].name,'计划伙伴');assert.ok(story.history.length>result.history.length);
});
test('跨章卡片与未安排卡独立；复制重映射当前及历史章节、卡片和位置引用',async()=>{
 const x=await storyFixture('order-copy'),[c1,c2]=x.chapters,a=await x.create({title:'跨章事件',scope:[c1.id,c2.id],time:{narration:narration(c1,c2),story:{trackId:'main',start:10,end:11}}}),b=await x.create({title:'另一事件',time:{narration:narration(c1,c2,.5,.5),story:{trackId:'main',start:20,end:21}}}),p=await x.create({title:'待写一'}),q=await x.create({title:'待写二'});
 await x.apply({type:'card.update',id:b.id,expectedRevision:b.revision,value:{time:{...b.time,narration:narration(c1,c2,.1,.9)}}});
 const story=await x.read();assert.deepEqual(ordered(story,'story'),[a.id,b.id]);assert.ok(!ordered(story,'narration').includes(p.id)&&!ordered(story,'narration').includes(q.id));assert.deepEqual(story.state.cards[a.id].scope,[c1.id,c2.id]);
 const file={name:'order.json',json:await x.call('novel.export')},options={mode:'copy'},preview=await x.call('transfer.preview',{file,options}),copy=await x.call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),copied=await x.service.rpc('story.get',{novelId:copy.novelIds[0]},'copy','human');
 assert.deepEqual(ordered(copied,'narration').map(id=>copied.state.cards[id].title),ordered(story,'narration').map(id=>story.state.cards[id].title));assert.deepEqual(ordered(copied,'story').map(id=>copied.state.cards[id].title),ordered(story,'story').map(id=>story.state.cards[id].title));
 const exported=(await x.service.rpc('novel.export',{novelId:copy.novelIds[0]},'copy','human')).novel;for(const snapshot of [exported.story.state,...exported.story.history.map(h=>h.state)])for(const c of Object.values(snapshot.cards)){assert.ok(!story.state.cards[c.id]);for(const id of c.scope)assert.ok(exported.chapters[id]);if(c.time.narration){assert.ok(exported.chapters[c.time.narration.startChapterId]);assert.ok(exported.chapters[c.time.narration.endChapterId]);}}
 assert.ok(Object.values(copied.state.cards).filter(c=>!c.time.narration&&!c.time.story).length===2);
});
test('其他卡片新增、删除和修改令工作区快照失效；非法章节和范围原子拒绝',async()=>{
 const x=await storyFixture('order-conflict'),a=await x.create({title:'第一卡',time:{narration:narration(x.chapters[0])}}),b=await x.create({title:'第二卡'});
 const draft=()=>x.request(a.id,{time:{narration:narration(x.chapters[1])}});
 for(const mutate of [()=>x.apply({type:'card.update',id:b.id,expectedRevision:1,value:{title:'其他端改名'}}),()=>x.create({title:'新节点'}),()=>x.apply({type:'card.delete',id:b.id})]){const stale=await draft();await mutate();const before=await x.read();await assert.rejects(x.call('story.apply',stale),{code:'CONFLICT'});assert.deepEqual((await x.read()).state,before.state);}
 const before=await x.read();for(const time of [narration({id:'unknown'}),narration(x.chapters[2],x.chapters[1]),narration(x.chapters[0],x.chapters[0],.9,.1)])await assert.rejects(x.call('story.apply',await x.request(a.id,{time:{narration:time}})),{code:'STORY_INVALID'});assert.deepEqual((await x.read()).state,before.state);
 await assert.rejects(x.call('writing.event.move',{}),{code:'NOT_ALLOWED'});await assert.rejects(x.call('writing.event.update',{}),{code:'NOT_ALLOWED'});
});
test('历史只读投影保留旧逐章排序及无排序回退，不把旧键误写入统一卡片',()=>{
 const board={chapters:[{id:'c1'},{id:'c2'}],events:[{id:'a',order:10,chapterRefs:[{chapterId:'c1'},{chapterId:'c2'}],chapterOrders:{c1:20,c2:10}},{id:'b',order:20,chapterRefs:[{chapterId:'c1'},{chapterId:'c2'}],chapterOrders:{c1:10,c2:20}},{id:'p',order:30,narrationOrder:40,chapterRefs:[]},{id:'q',order:40,narrationOrder:30,chapterRefs:[]}]},before=structuredClone(board);
 const ids=chapter=>timelineOrderScope(board,'narration',chapter).map(e=>e.id);assert.deepEqual(ids('c1'),['b','a']);assert.deepEqual(ids('c2'),['a','b']);assert.deepEqual(ids(null),['q','p']);assert.deepEqual(board,before);
 const old=structuredClone(board);for(const e of old.events)delete e.chapterOrders;assert.deepEqual(timelineOrderScope(old,'narration','c1').map(e=>e.id),['a','b']);
});
