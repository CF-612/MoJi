import {timelineOrderScope} from './story-workspace.js';
const fail=(message,code='INVALID_WRITING')=>{throw Object.assign(new Error(message),{code});};
export function moveEventOrder(n,w,a,update,cas){
 if(a.confirmed!==true)fail('请确认时间节点排序','CONFIRM_REQUIRED');
 const absolute=Object.hasOwn(a,'beforeEventId');
 if(!['story','narration'].includes(a.view)||absolute&&(a.view!=='story'||a.direction!==undefined)||!absolute&&!['up','down'].includes(a.direction))fail('请选择排序轴及上移／下移');
 const chapterId=a.view==='narration'?(a.chapterId||null):null;
 if(chapterId){const ch=n.chapters[chapterId];if(!ch||ch.deleted)fail('章节不存在','NOT_FOUND');cas(ch,a.expectedChapterRevision);}
 const board={chapters:Object.values(n.chapters).filter(c=>!c.deleted),events:Object.values(w.events||{}).filter(e=>!e.deleted).map(e=>({...e,chapterRefs:e.chapterRefs.map(r=>({...r,excluded:!!n.chapters[r.chapterId]?.deleted}))}))};
 const scope=timelineOrderScope(board,a.view,chapterId);
 if(!Array.isArray(a.expectedOrder)||a.expectedOrder.length!==scope.length||scope.some((e,i)=>a.expectedOrder[i]?.id!==e.id||a.expectedOrder[i]?.revision!==e.revision))fail('时间线已有变化，请核对最新顺序后重试','CONFLICT');
 const from=scope.findIndex(e=>e.id===a.id),to=from+(a.direction==='up'?-1:1);
 if(from<0)fail('事件不在当前排序范围','NOT_FOUND');
 if(!absolute&&(to<0||to>=scope.length))fail(chapterId?'已到本章事件边界；跨章位置请编辑章节关联':'已到当前排序范围边界');
 let next;
 if(absolute){if(a.beforeEventId!==null&&(typeof a.beforeEventId!=='string'||!scope.some(e=>e.id===a.beforeEventId)))fail('目标事件不在当前故事顺序中');if(a.beforeEventId===a.id)return {view:a.view,chapterId,eventId:a.id,order:scope.map(e=>e.id),events:[]};next=scope.filter(e=>e.id!==a.id);const target=a.beforeEventId===null?next.length:next.findIndex(e=>e.id===a.beforeEventId);next.splice(target,0,scope[from]);}
 else {next=[...scope];[next[from],next[to]]=[next[to],next[from]];}
 if(next.every((e,i)=>e.id===scope[i].id))return {view:a.view,chapterId,eventId:a.id,order:scope.map(e=>e.id),events:[]};
 const patches=new Map(),patch=(id,value)=>patches.set(id,{...patches.get(id),...value});
 if(a.view==='story'){
  // Freeze the legacy narration fallback before changing story order. Multi-chapter
  // events get independent chapter positions; dates and prose references stay intact.
  for(const chapter of board.chapters)timelineOrderScope(board,'narration',chapter.id).forEach((e,i)=>patch(e.id,{chapterOrders:{...e.chapterOrders,...patches.get(e.id)?.chapterOrders,[chapter.id]:(i+1)*10}}));
  timelineOrderScope(board,'narration').forEach((e,i)=>patch(e.id,{narrationOrder:(i+1)*10}));
  next.forEach((e,i)=>{if(e.order!==(i+1)*10)patch(e.id,{order:(i+1)*10});});
 }else next.forEach((e,i)=>chapterId?patch(e.id,{chapterOrders:{...e.chapterOrders,[chapterId]:(i+1)*10}}):patch(e.id,{narrationOrder:(i+1)*10}));
 const events=[];for(const [id,value]of patches){const old=w.events[id];if(Object.entries(value).every(([key,v])=>JSON.stringify(old[key])===JSON.stringify(v)))continue;events.push(update(old,value));}
 return {view:a.view,chapterId,eventId:a.id,order:next.map(e=>e.id),events};
}
