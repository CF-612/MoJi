import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {timelineItems} from '../../../src/domain/story-timeline.mjs';
import {navigationModules,profileModules} from '../vendor/cuigengji/src/client/modules/registry.mjs';
test('统一规划导航没有独立时间线；两轴均保留当前页面范围内的所有卡片',async()=>{
 const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'unified-plan-'))),call=(a,args={})=>s.rpc(a,{novelId:s.novelId,...args},'unified','human'),chapter=await call('chapter.get',{chapterId:s.chapterId});
 let story=await call('story.get');const apply=async operation=>(story=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation}));
 await apply({type:'page.create',name:'虚构支线'});const pageId=story.state.pages.at(-1).id;
 const make=async value=>{const old=new Set(Object.keys(story.state.cards));await apply({type:'card.create',pageId,value});return Object.keys(story.state.cards).find(id=>!old.has(id));};
 const eventId=await make({title:'事件关联卡片',scope:[chapter.id],time:{narration:{trackId:'main',startChapterId:chapter.id,endChapterId:chapter.id,startOffset:0,endOffset:1}}}),chapterId=await make({title:'章节关联卡片',scope:[chapter.id]}),looseId=await make({title:'尚未安排'});
 const pageCards=state=>Object.fromEntries(Object.keys(state.pages.find(p=>p.id===pageId).instances).filter(ref=>ref.startsWith('card:')).map(ref=>[ref.slice(5),state.cards[ref.slice(5)]]));
 const cards=pageCards(story.state);assert.equal(Object.keys(cards).length,3);assert.equal(navigationModules(profileModules('complete')).some(([id])=>id==='timeline'),false);
 for(const mode of ['narration','story']){const placed=timelineItems(cards,story.sources.chapters,mode),unplaced=Object.values(cards).filter(c=>!c.time[mode]);assert.deepEqual(new Set([...placed.map(p=>p.id),...unplaced.map(p=>p.id)]),new Set([eventId,chapterId,looseId]));}
 assert.equal(timelineItems(cards,story.sources.chapters,'narration')[0].id,eventId);assert.equal(cards[chapterId].time.story,undefined);assert.deepEqual(cards[looseId].time,{});
 await apply({type:'card.update',id:eventId,expectedRevision:cards[eventId].revision,value:{title:'同一张卡片已改名'}});
 const after=await call('story.get');assert.equal(pageCards(after.state)[eventId].title,'同一张卡片已改名');assert.equal(Object.keys(pageCards(after.state)).length,3);assert.deepEqual(after.state.cards[eventId].scope,[chapter.id]);
});
