import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {createService} from '../server/service.mjs';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const folder=await mkdtemp(join(root,'tracks-'));
const file=join(folder,'tracks.mjs');await build({stdin:{contents:"export {UnifiedTimeline} from './features/planning/UnifiedTimeline.jsx'; export {TimelineTray} from './features/planning/TimelineTray.jsx';",resolveDir:resolve(import.meta.dirname,'../vendor/cuigengji/src/client'),loader:'tsx'},outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'},plugins:[{name:'static-dialog',setup(b){b.onLoad({filter:/dialog\.tsx$/},()=>({contents:'export const useDialog=()=>({ask:async()=>null,confirm:async()=>false});',loader:'js'}));}}]});const {UnifiedTimeline,TimelineTray}=await import(pathToFileURL(file));
// Current application mounts UnifiedTimeline; the retired TimelineTracks renderer
// is not a public authoring path. Preserve span/one-card/tray behavior here.
test('当前时间线渲染跨章长条一次、独立章节卡与待安排，不伪造同章次数或空事件',async()=>{
 const s=await createService(join(folder,'ranges')),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'ranges','human'),a=await call('chapter.get',{chapterId:s.chapterId}),b=await call('chapter.create',{title:'第二章'}),c=await call('chapter.create',{title:'第三章'});
 let story=await call('story.get');const apply=async operation=>(story=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation}));
 const create=async value=>{const before=new Set(Object.keys(story.state.cards));await apply({type:'card.create',value});return Object.keys(story.state.cards).find(id=>!before.has(id));};
 const span=await create({title:'跨章寻信',scope:[a.id,c.id],time:{narration:{trackId:'main',startChapterId:a.id,startOffset:0,endChapterId:c.id,endOffset:1}}});
 const single=await create({title:'独立章节规划',status:'selected',scope:[b.id],time:{narration:{trackId:'main',startChapterId:b.id,startOffset:0,endChapterId:b.id,endOffset:1,row:1}}});
 await create({title:'尚未安排的灵感'});
 const html=renderToStaticMarkup(React.createElement(UnifiedTimeline,{state:story.state,sources:story.sources,people:[],novelId:s.novelId,call,evolution:false,save(){},open(){},onMemory(){}}));
 assert.equal((html.match(new RegExp(`data-time-item="${span}"`,'g'))||[]).length,1);
 assert.match(html,/跨章寻信[^"]*，0\.0 至 3\.0/);assert.match(html,/width:960px/);
 assert.equal((html.match(new RegExp(`data-time-item="${single}"`,'g'))||[]).length,1);
 assert.match(html,/独立章节规划/);assert.doesNotMatch(html,/尚未安排的灵感/);assert.match(html,/aria-expanded="false"[^>]*>待安排 <strong>1<\/strong>/);
 const expanded=renderToStaticMarkup(React.createElement(TimelineTray,{open:true,count:1,onToggle(){}},React.createElement('div',null,'尚未安排的灵感')));
 assert.match(expanded,/aria-expanded="true"/);assert.match(expanded,/class="u-tray-cards"/);assert.match(expanded,/尚未安排的灵感/);
 let toggled=0;const closed=TimelineTray({open:false,count:1,onToggle:()=>toggled++,children:'尚未安排的灵感'});
 const toggle=React.Children.toArray(closed.props.children).find(child=>child.type==='button');toggle.props.onClick();assert.equal(toggled,1);
 assert.doesNotMatch(html,/添加规划 第二章|添加事件 第三章|尚无事件|2 规划|伏笔台账/);
 assert.deepEqual(story.state.cards[span].scope,[a.id,c.id],'visual span does not fabricate evidence in middle chapter');
 assert.deepEqual(story.state.cards[span].evidence,[]);
 const before=structuredClone(story.state);await assert.rejects(call('writing.event.create',{confirmed:true,value:{title:'旧事件'}}),{code:'NOT_ALLOWED'});await assert.rejects(call('writing.chapterPlan.create',{}),{code:'NOT_ALLOWED'});assert.deepEqual((await call('story.get')).state,before);
});
