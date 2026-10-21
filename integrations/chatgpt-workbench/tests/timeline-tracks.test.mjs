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
const file=join(folder,'tracks.mjs');await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/features/structure/TimelineTracks.jsx')],outfile:file,bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'}});const {TimelineTracks}=await import(pathToFileURL(file));
test('实际投影渲染跨章长条、每章规划且不挤入常驻操作按钮，没有同章次数计数和空事件卡',async()=>{
 const s=await createService(join(folder,'ranges')),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'ranges','human'),a=await call('chapter.get',{chapterId:s.chapterId}),b=await call('chapter.create',{title:'第二章'}),c=await call('chapter.create',{title:'第三章'}),e=await call('writing.event.create',{confirmed:true,value:{title:'跨章寻信',order:10,narrativeKind:'linear',chapterRefs:[{chapterId:a.id,revision:a.revision,evidence:''},{chapterId:c.id,revision:c.revision,evidence:''}]}});
 await call('writing.chapterPlan.create',{chapterId:b.id,expectedChapterRevision:b.revision,confirmed:true,requestId:crypto.randomUUID(),value:{title:'独立章节规划',status:'selected'}});const board=await call('writing.board.get'),html=renderToStaticMarkup(React.createElement(TimelineTracks,{board,novelId:s.novelId,mode:'narration',current:{key:e.id,eventId:e.id},choose(){},onPlan(){},onEvent(){},onMemory(){},onShadow(){}}));assert.equal((html.match(new RegExp(`data-track-id="event:${e.id}"`,'g'))||[]).length,1);assert.match(html,/data-range-start="0" data-range-end="2"/);assert.match(html,/独立章节规划/);assert.doesNotMatch(html,/添加规划 第二章|添加事件 第三章/);assert.match(html,/时间线内容筛选/);assert.doesNotMatch(html,/class="track-event-settings"/);assert.doesNotMatch(html,/尚无事件|2 规划|伏笔台账/);
});
