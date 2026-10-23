import {useResource} from './state.js';
import {narrationChapters} from '../../domain/story-timeline.mjs';
export function useStoryLinks(call,novelId,tick){return useResource(()=>Promise.all([call('story.get',{novelId}),call('writing.link.list',{novelId}),call('graph.list',{novelId}),call('writing.foreshadow.list',{novelId})]).then(([story,links,nodes,foreshadows])=>{
 const cards=Object.values(story.state.cards).map(card=>({...card,chapterIds:[...new Set([...(card.scope||[]),...narrationChapters(card,story.sources.chapters).map(c=>c.id),...(card.evidence||[]).map(e=>e.chapterId)])]}));
 return {...story,cards,links,nodes,foreshadows};}),[call,novelId,tick]);}
export function chapterShadows(data,chapterId){return data.foreshadows.filter(f=>f.targetChapterId===chapterId||(f.plotNodes||[]).some(n=>n.evidence?.chapterId===chapterId||data.cards.find(c=>c.id===n.cardId)?.chapterIds.includes(chapterId)));}
