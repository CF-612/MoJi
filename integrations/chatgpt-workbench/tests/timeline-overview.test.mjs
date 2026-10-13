import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {createService} from '../server/service.mjs';
import {timelineNodes,projectStage} from '../../../src/domain/story-workspace.js';
import {timelineGroups,timelineGroupRows,timelineGroupPath} from '../../../src/domain/timeline-navigation.js';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const folder=await mkdtemp(join(root,'timeline-overview-'));
const output=join(folder,'navigator.mjs');await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/features/structure/TimelineNavigation.jsx')],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});const {TimelineNavigation}=await import(pathToFileURL(output));

test('卷章折叠保留空章、多章事件和待写节点；故事轴只折叠连续同时间，不重排倒叙',()=>{
 const board={stats:{volumes:[{id:'v1',title:'第一卷'},{id:'v2',title:'第二卷'}]},chapters:[{id:'c1',title:'第一章',volumeId:'v1'},{id:'c2',title:'第二章',volumeId:'v1'},{id:'c3',title:'第一章',volumeId:'v2'}],events:[{id:'a',title:'初识',order:10,storyDate:'1938-09-01',chapterRefs:[{chapterId:'c1'},{chapterId:'c3'}]},{id:'b',title:'回忆',order:20,storyDate:'1938-08-31',chapterRefs:[{chapterId:'c1'}]},{id:'c',title:'重访',order:30,storyDate:'1938-09-01',chapterRefs:[]},{id:'d',title:'同日的信',order:40,storyDate:'1938-09-01',chapterRefs:[]},{id:'deleted',deleted:true,order:5,chapterRefs:[]}]},before=structuredClone(board);
 const chapters=timelineGroups(board),rows=chapters.flatMap(timelineGroupRows);assert.deepEqual(rows.map(r=>r.key),timelineNodes(board).map(r=>r.key));assert.equal(rows.find(r=>r.chapterId==='c2').eventId,null);assert.equal(rows.filter(r=>r.eventId==='a').length,2);assert.deepEqual(timelineGroupPath(chapters,'c3:a'),['volume:v2','chapter:c3']);assert.equal(chapters.at(-1).key,'waiting');
 const story=timelineGroups(board,'story');assert.deepEqual(story.map(g=>g.label),['1938年9月1日','1938年8月31日','1938年9月1日']);assert.deepEqual(story.flatMap(timelineGroupRows).map(r=>r.eventId),['a','b','c','d']);assert.deepEqual(board,before);
 const current=rows.find(r=>r.key==='c3:a'),html=renderToStaticMarkup(React.createElement(TimelineNavigation,{board,mode:'narration',current,choose(){},activeButton:{current:null},renderRow:r=>React.createElement('button',{'data-visible-event':r.key,key:r.key},r.event?.title||'空章')}));assert.match(html,/跳转时间节点/);assert.match(html,/data-visible-event="c3:a"/);assert.doesNotMatch(html,/data-visible-event="c1:a"|data-visible-event="chapter:c2"/);assert.match(html,/第二卷/);assert.match(html,/aria-expanded="false"/);
});

test('变化使用当前事件与前一故事阶段，显示关系新增、更改和结束；未来计划、已删除变化与相同值不成为当前变化',async()=>{
 const s=await createService(join(folder,'stage')),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'overview','human'),a=await call('writing.card.create',{type:'character_card',name:'岑予'}),b=await call('writing.card.create',{type:'character_card',name:'江遥'}),edge=await call('edge.create',{from:a.id,to:b.id,name:'尚未建立',baseActive:false});
 const event=(title,order,extra={})=>call('writing.event.create',{confirmed:true,value:{title,order,narrativeKind:'linear',...extra}}),early=await event('初识',10,{enteringRefs:[a.id]}),plan=await event('未来争执',15,{planned:true,enteringRefs:[b.id]}),late=await event('信任',20),end=await event('离别',30),same=await event('未发生变化',40);
 const change=(e,name,active=true)=>call('writing.relationshipChange.create',{confirmed:true,value:{eventId:e.id,edgeId:edge.id,value:{name,category:'partner',active}}});await change(early,'陌生');await change(plan,'计划敌对');await change(late,'伙伴');await change(end,'伙伴',false);await change(same,'伙伴',false);
 const board=await call('writing.board.get'),before=structuredClone(board),first=projectStage(board,early.id),last=projectStage(board,late.id),ended=projectStage(board,end.id);
 assert.equal(first.changes.relationships[0].kind,'added');assert.equal(first.changes.entering[0].id,a.id);assert.equal((await call('writing.card.get',{nodeId:a.id})).firstAppearance,null);
 assert.equal(last.changes.previousEventId,early.id);assert.equal(last.changes.relationships[0].before.name,'陌生');assert.equal(last.changes.relationships[0].after.name,'伙伴');assert.equal(last.changes.relationships[0].kind,'changed');assert.equal(last.changes.entering.length,0);assert.equal(last.nodes.some(n=>n.id===b.id),true);assert.equal(last.nodes.find(n=>n.id===b.id).entryUnset,true);
 assert.equal(ended.changes.relationships[0].kind,'ended');assert.equal(ended.edges.length,0);assert.equal(projectStage(board,same.id).changes.relationships.length,0);assert.equal(projectStage(board,plan.id).changes.planned,true);assert.equal(projectStage(board,plan.id).changes.entering[0].id,b.id);
 assert.deepEqual(board,before);assert.deepEqual((await call('writing.stage.get',{eventId:late.id})).changes,last.changes);
 const currentChange=(await call('writing.relationshipChange.list',{eventId:late.id}))[0];await call('writing.relationshipChange.delete',{id:currentChange.id,expectedRevision:currentChange.revision,confirmed:true});assert.equal(projectStage(await call('writing.board.get'),late.id).changes.relationships.length,0);
});

test('伏笔依据只归属指定章节；同章多个事件不推断回收先后，未确认计划关联不成为埋设／回收事实',async()=>{
 const s=await createService(join(folder,'shadow')),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'overview-shadow','human'),ch=await call('chapter.update',{chapterId:s.chapterId,expectedRevision:1,content:'门边有铜钥匙。岑予找到了钥匙对应的锁。'}),next=await call('chapter.create',{title:'第二章',content:'继续写'}),create=(title,chapter)=>call('writing.event.create',{confirmed:true,value:{title,order:title==='前半章'?10:20,narrativeKind:'linear',chapterRefs:[{chapterId:chapter.id,revision:chapter.revision,evidence:''}]}}),first=await create('前半章',ch),second=await create('后半章',ch),f=await call('writing.foreshadow.create',{confirmed:true,value:{title:'钥匙的用处',status:'recovered',evidence:[{kind:'plant',chapterId:ch.id,revision:ch.revision,evidence:'门边有铜钥匙。'},{kind:'recover',chapterId:ch.id,revision:ch.revision,evidence:'岑予找到了钥匙对应的锁。'}]}}),plan=await call('writing.foreshadow.create',{confirmed:true,value:{title:'尚未写下的来信',status:'planned',evidence:[]}});
 await call('writing.event.update',{id:first.id,expectedRevision:first.revision,confirmed:true,value:{foreshadowRefs:[plan.id]}});const board=await call('writing.board.get'),before=await call('novel.export');
 for(const event of [first,second]){const changes=projectStage(board,event.id).changes;assert.deepEqual(changes.chapterForeshadows[0].kinds,['plant','recover']);assert.equal(changes.chapterForeshadows[0].chapterId,ch.id);assert.equal(changes.chapterForeshadows[0].id,f.id);assert.match(changes.policy,/不推断同章事件先后/);}
 assert.equal(projectStage(board,first.id).changes.eventForeshadows[0].id,plan.id);assert.equal(projectStage(board,null,{chapterId:next.id}).changes.chapterForeshadows.length,0);assert.deepEqual((await call('novel.export')).novel,before.novel);
});
