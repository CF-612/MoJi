// Shared, pure projection: changing the cursor never writes or fetches records.
export function calendarDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number),date=new Date(0);date.setUTCFullYear(y,m-1,d);date.setUTCHours(0,0,0,0);
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?{y,m,d}:null;
}
export function ageAt(birth,now){const b=calendarDate(birth),t=calendarDate(now);if(!b||!t||now<birth)return null;return t.y-b.y-(t.m<b.m||t.m===b.m&&t.d<b.d?1:0);}
export function dateLabel(value){const d=calendarDate(value);return d?`${d.y}年${d.m}月${d.d}日`:value||'';}
export function timelineNodes(board,mode='narration'){
 const events=board.events.filter(e=>!e.deleted),rank=new Map(board.chapters.map((c,i)=>[c.id,i]));
 if(mode==='story')return [...events].sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)).map(e=>({key:e.id,eventId:e.id,event:e,chapterId:e.chapterRefs.find(r=>!r.excluded&&rank.has(r.chapterId))?.chapterId||null}));
 const rows=board.chapters.flatMap(c=>{const linked=events.filter(e=>e.chapterRefs.some(r=>!r.excluded&&r.chapterId===c.id)).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));return linked.length?linked.map(e=>({key:`${c.id}:${e.id}`,eventId:e.id,event:e,chapterId:c.id})):[{key:`chapter:${c.id}`,eventId:null,event:null,chapterId:c.id}];});
 // Unwritten planning locations never create empty manuscript chapters.
 return [...rows,...events.filter(e=>!e.chapterRefs.some(r=>!r.excluded&&rank.has(r.chapterId))).sort((a,b)=>(a.narrationOrder??Infinity)-(b.narrationOrder??Infinity)||a.order-b.order||a.id.localeCompare(b.id)).map(e=>({key:e.id,eventId:e.id,event:e,chapterId:null}))];
}
export function chapterLabel(board,id){const ch=board.chapters.find(c=>c.id===id);if(!ch)return '';const volume=board.stats.volumes.find(v=>(v.id||null)===(ch.volumeId||null));return `${volume?.title||'未分卷'} · ${ch.title}`;}
export function projectStage(board,eventId,{complete=false,chapterId=null}={}){
 const ordered=timelineNodes(board,'story'),rank=new Map(ordered.map((r,i)=>[r.eventId,i])),at=rank.get(eventId),event=ordered.find(r=>r.eventId===eventId)?.event;
 const entry=new Map();for(const row of ordered)if(event?.planned||!row.event.planned)for(const id of row.event.enteringRefs||[])if(!entry.has(id))entry.set(id,row.eventId);
 const nodes=board.nodes.map(n=>{const start=entry.get(n.id),future=!!start&&(at===undefined||rank.get(start)>at);return {...n,entryEventId:start||null,future,age:ageAt(n.birth,event?.storyDate),ageLabel:ageAt(n.birth,event?.storyDate)!==null?`${ageAt(n.birth,event?.storyDate)}岁`:n.ageDescription||'',entryUnset:!start};}).filter(n=>complete||!n.future);
 const visible=new Set(nodes.filter(n=>!n.future).map(n=>n.id)),allIds=new Set(nodes.map(n=>n.id));
 const edges=(board.edges||[]).map(e=>{const changes=(board.relationshipChanges||[]).filter(c=>!c.deleted&&!c.excluded&&c.edgeId===e.id&&rank.has(c.eventId)&&at!==undefined&&rank.get(c.eventId)<=at&&(event?.planned||!ordered[rank.get(c.eventId)].event.planned)).sort((a,b)=>rank.get(a.eventId)-rank.get(b.eventId)||a.id.localeCompare(b.id)),last=changes.at(-1);return {...e,active:e.baseActive!==false,category:e.category||'other',style:e.style||'solid',...last?.value,stageChangeId:last?.id||null,stageEventId:last?.eventId||null,future:!visible.has(e.from)||!visible.has(e.to)};}).filter(e=>e.active&&allIds.has(e.from)&&allIds.has(e.to));
 const selectedChapter=chapterId||event?.chapterRefs.find(r=>!r.excluded)?.chapterId,chapterRank=new Map(board.chapters.map((c,i)=>[c.id,i])),cr=chapterRank.get(selectedChapter);
 const foreshadows=board.foreshadows.filter(f=>event?.foreshadowRefs.includes(f.id)||f.evidence.some(r=>r.chapterId===selectedChapter)||f.targetChapterId===selectedChapter).map(f=>{const evidence=f.evidence.filter(r=>cr!==undefined&&chapterRank.has(r.chapterId)&&chapterRank.get(r.chapterId)<=cr);return {...f,stageStatus:evidence.some(r=>r.kind==='recover')?'已回收':evidence.some(r=>r.kind==='progress')?'推进中':evidence.some(r=>r.kind==='plant')?'已埋设':'计划',due:cr!==undefined&&chapterRank.has(f.targetChapterId)&&cr>=chapterRank.get(f.targetChapterId)&&!evidence.some(r=>r.kind==='recover')&&f.status!=='abandoned'};});
 return {event:event||null,nodes,edges,foreshadows,planning:board.planning.filter(p=>event?.planningRefs.includes(p.id)||p.chapterRefs.some(r=>r.chapterId===selectedChapter)),policy:'未指定进入位置的资料保留可见；事件参与不自动确认出场。计划情境不等于已确认正文。'};
}
