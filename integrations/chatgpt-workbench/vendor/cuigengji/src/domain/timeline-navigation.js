import {timelineNodes,chapterLabel,dateLabel} from './story-workspace.js';
export function timelineGroups(board,mode='narration'){
 const rows=timelineNodes(board,mode),groups=[];
 if(mode==='story'){
  for(const row of rows){const time=row.event?.storyDate||row.event?.storyTime||'',last=groups.at(-1);if(last&&last.time===time)last.rows.push(row);else groups.push({key:`date:${row.key}`,label:dateLabel(time)||'时间待定',time,rows:[row]});}
  return groups;
 }
 for(const chapter of board.chapters){const volumeId=chapter.volumeId||null,key=`volume:${volumeId||'unassigned'}`;let volume=groups.find(g=>g.key===key);if(!volume){volume={key,label:board.stats.volumes.find(v=>(v.id||null)===volumeId)?.title||'未分卷',children:[]};groups.push(volume);}volume.children.push({key:`chapter:${chapter.id}`,label:chapter.title,rows:rows.filter(r=>r.chapterId===chapter.id)});}
 const waiting=rows.filter(r=>!r.chapterId);if(waiting.length)groups.push({key:'waiting',label:'待写／背景事件',rows:waiting});
 return groups;
}
export function timelineGroupRows(group){return group.rows||group.children.flatMap(timelineGroupRows);}
export function timelineGroupPath(groups,rowKey){for(const group of groups){if(group.rows?.some(r=>r.key===rowKey))return [group.key];if(group.children){const path=timelineGroupPath(group.children,rowKey);if(path.length)return [group.key,...path];}}return [];}
export function timelineJumpLabel(board,row,mode){return `${mode==='story'?(row.chapterId?chapterLabel(board,row.chapterId):row.event?.plannedChapter||'待定卷章'):row.event?.plannedChapter||''}${row.event?.planned?' · 计划':''}${row.event?' · '+row.event.title:' · 尚无事件'}`.replace(/^ · /,'');}
