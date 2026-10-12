import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createService} from '../server/service.mjs';
import {createResourceCache,resourceKey} from '../vendor/cuigengji/src/client/shared/resource-cache.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'charts-')));return {s,call:(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'charts-test','human')};}
test('新建角色／世界一次保存名称、默认字段和别名；失败不留下半张卡，重试不重复',async()=>{
 const {call}=await setup(),args={name:'林照',type:'character_card',values:{'character:gender':'女','character:occupation':'管理员'},aliases:['小林'],requestId:'create-complete-card'};
 const card=await call('writing.card.create',args);assert.equal((await call('writing.card.create',args)).id,card.id);assert.deepEqual((await call('graph.get',{nodeId:card.id})).aliases,['小林']);assert.equal((await call('writing.card.get',{nodeId:card.id})).values['character:gender'],'女');
 const oldCount=(await call('graph.list')).length;await assert.rejects(call('writing.card.create',{name:'失败卡片',type:'character_card',values:{unknown:'不应保存'}}));assert.equal((await call('graph.list')).length,oldCount);
 const world=await call('writing.card.create',{name:'邮局',type:'world_entry',values:{'world:category':'地点'}});assert.deepEqual((await call('graph.list')).find(n=>n.id===world.id).cardTags,['地点']);
 const continued=await call('writing.card.create',{name:'旅行者',type:'character_card',values:{'character:occupation':'信使'},connection:{id:card.id,side:'out',expectedRevision:(await call('graph.get',{nodeId:card.id})).revision}});assert.equal((await call('writing.card.get',{nodeId:continued.node.id})).values['character:occupation'],'信使');assert.ok((await call('edge.list')).some(e=>e.to===continued.node.id));
});
test('章节图只用确认出场；事件参与、规划、埋设与实际回收共享记录，正文改写提示复核',async()=>{
 const {s,call}=await setup(),node=await call('writing.card.create',{name:'林照',type:'character_card'}),a=await call('chapter.update',{chapterId:s.chapterId,expectedRevision:1,content:'林照找到一把钥匙。'}),created=await call('chapter.create',{title:'第二章',content:'林照用钥匙打开门。'}),b=await call('chapter.get',{chapterId:created.id});
 const event=await call('writing.event.create',{confirmed:true,value:{title:'开门',storyTime:'次日',order:20,narrativeKind:'linear',memoryRefs:[node.id],chapterRefs:[{chapterId:b.id,revision:b.revision}]}});
 assert.equal((await call('writing.board.get')).chapters.find(c=>c.id===b.id).characters.length,0,'事件参与不能自动成为正式出场');
 await call('writing.link.create',{nodeId:node.id,chapterId:b.id,expectedChapterRevision:b.revision,kind:'appearance',evidence:'林照用钥匙打开门。',confirmed:true});
 const f=await call('writing.foreshadow.create',{confirmed:true,value:{title:'钥匙',status:'recovered',memoryRefs:[node.id],targetChapterId:b.id,evidence:[{chapterId:a.id,revision:a.revision,kind:'plant',evidence:'找到一把钥匙'},{chapterId:b.id,revision:b.revision,kind:'recover',evidence:'用钥匙打开门'}]}});
 const planning=await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'p',value:{title:'找到钥匙',chapterRefs:[{chapterId:a.id,revision:a.revision}],memoryRefs:[node.id]}}]});
 const board=await call('writing.board.get');assert.equal(board.chapters.find(c=>c.id===b.id).events[0],event.id);assert.equal(board.chapters.find(c=>c.id===b.id).characters[0].id,node.id);assert.equal(board.chapters.find(c=>c.id===a.id).foreshadows[0].kind,'plant');assert.equal(board.chapters.find(c=>c.id===b.id).foreshadows[0].kind,'recover');assert.equal(board.chapters.find(c=>c.id===a.id).planning[0],planning.mapping.p);assert.equal(board.foreshadows.find(v=>v.id===f.id).firstRecoveryChapterId,b.id);assert.equal(board.events[0].versions,undefined);assert.equal(board.events[0].content,undefined);assert.equal(board.chapters[0].content,undefined);
 await call('chapter.update',{chapterId:b.id,expectedRevision:b.revision,content:'新的正文'});const fresh=await call('writing.board.get');assert.equal(fresh.events[0].review,true);assert.equal(fresh.chapters.find(c=>c.id===b.id).characters[0].review,true);assert.equal(fresh.foreshadows[0].review,true);
});
test('页面缓存保留已读取界面，按会话隔离；旧请求不能覆盖保存后的缓存，容量有界',()=>{
 const cache=createResourceCache(2),a=resourceKey('a','book:board'),b=resourceKey('b','book:board');cache.put(a,{revision:1});assert.equal(cache.get(b),undefined);const oldEpoch=cache.epoch();cache.invalidate();cache.put(a,{revision:2});assert.equal(cache.put(a,{revision:1},oldEpoch),false);assert.equal(cache.get(a).value.revision,2);cache.put('second',{});cache.put('third',{});assert.equal(cache.get(a),undefined);
});
