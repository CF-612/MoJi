import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {storyFixture} from './fixtures/story-protocol.mjs';
import {relationSnapshot} from '../../../src/domain/story-relations.mjs';
import {timelineNodes} from '../../../src/domain/story-workspace.js';
import {timelineGroups,timelineGroupRows,timelineGroupPath} from '../../../src/domain/timeline-navigation.js';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const folder=await mkdtemp(join(root,'timeline-overview-'));
const output=join(folder,'navigator.mjs');await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/features/structure/TimelineNavigation.jsx')],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});const {TimelineNavigation}=await import(pathToFileURL(output));

test('历史只读导航：卷章折叠保留空章、多章事件和待写节点；故事轴只折叠连续同时间，不重排倒叙',()=>{
 const board={stats:{volumes:[{id:'v1',title:'第一卷'},{id:'v2',title:'第二卷'}]},chapters:[{id:'c1',title:'第一章',volumeId:'v1'},{id:'c2',title:'第二章',volumeId:'v1'},{id:'c3',title:'第一章',volumeId:'v2'}],events:[{id:'a',title:'初识',order:10,storyDate:'1938-09-01',chapterRefs:[{chapterId:'c1'},{chapterId:'c3'}]},{id:'b',title:'回忆',order:20,storyDate:'1938-08-31',chapterRefs:[{chapterId:'c1'}]},{id:'c',title:'重访',order:30,storyDate:'1938-09-01',chapterRefs:[]},{id:'d',title:'同日的信',order:40,storyDate:'1938-09-01',chapterRefs:[]},{id:'deleted',deleted:true,order:5,chapterRefs:[]}]},before=structuredClone(board);
 const chapters=timelineGroups(board),rows=chapters.flatMap(timelineGroupRows);assert.deepEqual(rows.map(r=>r.key),timelineNodes(board).map(r=>r.key));assert.equal(rows.find(r=>r.chapterId==='c2').eventId,null);assert.equal(rows.filter(r=>r.eventId==='a').length,2);assert.deepEqual(timelineGroupPath(chapters,'c3:a'),['volume:v2','chapter:c3']);assert.equal(chapters.at(-1).key,'waiting');
 const story=timelineGroups(board,'story');assert.deepEqual(story.map(g=>g.label),['1938年9月1日','1938年8月31日','1938年9月1日']);assert.deepEqual(story.flatMap(timelineGroupRows).map(r=>r.eventId),['a','b','c','d']);assert.deepEqual(board,before);
 const current=rows.find(r=>r.key==='c3:a'),html=renderToStaticMarkup(React.createElement(TimelineNavigation,{board,mode:'narration',current,choose(){},activeButton:{current:null},renderRow:r=>React.createElement('button',{'data-visible-event':r.key,key:r.key},r.event?.title||'空章')}));assert.match(html,/跳转时间节点/);assert.match(html,/data-visible-event="c3:a"/);assert.doesNotMatch(html,/data-visible-event="c1:a"|data-visible-event="chapter:c2"/);assert.match(html,/第二卷/);assert.match(html,/aria-expanded="false"/);
});

test('当前关系投影按明确发生点读取；未来计划、丢弃卡和删除变化不成为当前事实',async()=>{
 const x=await storyFixture('overview-relations'),a=await x.call('writing.card.create',{type:'character_card',name:'岑予'}),b=await x.call('writing.card.create',{type:'character_card',name:'江遥'}),ch=x.chapters[0];
 const add=async(title,position,name,evidence=null,status='idea')=>{const card=await x.create({title,status});await x.apply({type:'relation.save',cardId:card.id,expectedRevision:card.revision,location:{narration:{chapterId:ch.id,offset:position}},confirmed:!!evidence,value:{from:a.id,to:b.id,name,evidence}});return card;};
 const first=await add('初识',.1,'陌生',{chapterId:ch.id,revision:ch.revision,evidence:'林照找到钥匙。'}),plan=await add('争执计划',.3,'计划敌对'),late=await add('信任',.6,'伙伴',{chapterId:ch.id,revision:ch.revision,evidence:'江遥接过钥匙。'}),same=await add('继续信任',.8,'伙伴');
 let story=await x.read();const before=structuredClone(story.state),at=cursor=>relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',cursor,false);
 assert.equal(at(.2).relations[0].name,'陌生');assert.equal(at(.4).relations[0].name,'陌生');assert.equal(at(.7).relations[0].name,'伙伴');assert.equal(relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',.4,true).relations[0].name,'计划敌对');assert.equal(at(.7).current.cardId,late.id);assert.deepEqual(story.state,before);assert.equal((await x.call('writing.card.get',{nodeId:a.id})).firstAppearance,null);
 const planned=story.state.cards[plan.id];story=await x.apply({type:'card.update',id:plan.id,expectedRevision:planned.revision,value:{status:'dropped'}});assert.equal(relationSnapshot(story.state.cards,[],story.sources.chapters,'narration',.4,true).relations[0].name,'陌生');
 const current=story.state.cards[late.id],point=current.points[0];story=await x.apply({type:'relation.delete',source:{cardId:late.id,revision:current.revision,pointId:point.id,changeId:point.relationships[0].id}});assert.equal(at(.7).relations[0].name,'陌生');assert.equal(at(.7).changes.some(c=>c.cardId===late.id),false);assert.ok(story.state.cards[same.id]);
 await assert.rejects(x.call('writing.relationshipChange.create',{}),{code:'NOT_ALLOWED'});
});

test('伏笔正文依据只归属指定章节；同章多个卡片不推断回收先后，计划节点不成为事实',async()=>{
 const x=await storyFixture('overview-shadow'),ch=x.chapters[0],next=x.chapters[1],first=await x.create({title:'前半章',scope:[ch.id]}),second=await x.create({title:'后半章',scope:[ch.id]});
 const f=await x.call('writing.foreshadow.create',{confirmed:true,value:{title:'钥匙的用处',status:'recovered',evidence:[{kind:'plant',chapterId:ch.id,revision:ch.revision,evidence:'林照找到钥匙。'},{kind:'recover',chapterId:ch.id,revision:ch.revision,evidence:'江遥接过钥匙。'}]}});
 const story=await x.read(),plan=await x.call('story.foreshadow.save',{expectedRevision:story.state.revision,value:{title:'尚未写下的来信',resolution:'active',evidence:[],plotNodes:[{id:'planned-plant',kind:'plant',cardId:first.id,note:'计划',evidence:null}]}});
 const board=await x.call('writing.board.get'),before=await x.call('novel.export'),row=board.chapters.find(c=>c.id===ch.id);assert.deepEqual(row.foreshadows.filter(r=>r.id===f.id).map(r=>r.kind),['plant','recover']);assert.ok(row.events.includes(first.id)&&row.events.includes(second.id));assert.equal(board.chapters.find(c=>c.id===next.id).foreshadows.length,0);assert.equal(row.foreshadows.some(r=>r.id===plan.id),false);
 assert.equal(board.foreshadows.find(r=>r.id===plan.id).status,'planned');assert.deepEqual(board.events.find(e=>e.id===first.id).foreshadowRefs,[plan.id]);assert.equal(board.events.find(e=>e.id===second.id).foreshadowRefs.length,0);assert.equal(board.foreshadows.find(r=>r.id===f.id).firstRecoveryChapterId,ch.id);assert.deepEqual((await x.call('novel.export')).novel,before.novel);
});
