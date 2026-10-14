import {timelineOrderScope} from './story-workspace.js';
export function placementRequest(board,id,view,intent){
 const event=board.events.find(e=>e.id===id&&!e.deleted);if(!event)throw new Error('事件已移除，请读取最新时间线');
 return {id,view,...intent,expectedRevision:event.revision,expectedChapterOrder:board.chapters.map(c=>c.id),chapterRevisions:Object.fromEntries(board.chapters.map(c=>[c.id,c.revision])),expectedOrder:timelineOrderScope(board,'story').map(e=>({id:e.id,revision:e.revision})),source:{title:event.title,chapterRefs:event.chapterRefs.map(r=>({chapterId:r.chapterId,revision:r.revision}))},chapters:board.chapters.map(c=>({id:c.id,title:`${board.stats.volumes.find(v=>(v.id||null)===(c.volumeId||null))?.title||'未分卷'} · ${c.title}`,revision:c.revision})),story:timelineOrderScope(board,'story').map(e=>({id:e.id,title:[e.storyDate||e.storyTime,e.title].filter(Boolean).join(' · ')}))};
}
export function placementArguments(request){const {source,chapters,story,...args}=request;return args;}
