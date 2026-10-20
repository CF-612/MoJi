import {timelineNodes,chapterLabel,narrationCompare} from './story-workspace.js';
// Display spans join existing references; they never manufacture a new event
// for each chapter, or infer that an event happened in an unreferenced gap.
export function timelineTracks(board,mode='narration',filter='all',zoom=1){
 const includes=kind=>Array.isArray(filter)?filter.includes(kind):filter==='all'||kind===filter;
 const chapters=board.chapters||[],events=(board.events||[]).filter(e=>!e.deleted),rank=new Map(chapters.map((c,i)=>[c.id,i]));
 const ordered=timelineNodes(board,'story'),slots=mode==='story'?ordered.map(r=>({...r,title:r.event.storyTime||r.event.storyDate||'时间未注明',subtitle:r.chapterId?chapterLabel(board,r.chapterId):r.event.plannedChapter||'待写事件',plans:board.planning.filter(p=>r.event.planningRefs.includes(p.id))})):chapters.map(c=>({key:`chapter:${c.id}`,chapterId:c.id,eventId:null,event:null,title:c.title,subtitle:board.stats.volumes.find(v=>(v.id||null)===(c.volumeId||null))?.title||'未分卷',plans:board.planning.filter(p=>p.chapterRefs.some(r=>r.chapterId===c.id)||events.some(e=>e.planningRefs.includes(p.id)&&e.chapterRefs.some(r=>!r.excluded&&r.chapterId===c.id)))}));
 if(mode==='narration')for(const e of events.filter(e=>!e.chapterRefs.some(r=>!r.excluded&&rank.has(r.chapterId))).sort((a,b)=>narrationCompare(a,b)))slots.push({key:e.id,eventId:e.id,event:e,chapterId:null,title:e.plannedChapter||'待写位置',subtitle:e.storyTime||'未关联正文',plans:board.planning.filter(p=>e.planningRefs.includes(p.id))});
 const eventSlots=new Map(slots.map((r,i)=>[r.eventId,i])),markers=[],waiting=[];
 for(const e of events){const members=mode==='story'?[eventSlots.get(e.id)]:e.chapterRefs.filter(r=>!r.excluded&&rank.has(r.chapterId)).map(r=>rank.get(r.chapterId));if(mode==='narration'&&!members.length)members.push(eventSlots.get(e.id));const positions=[...new Set(members.filter(Number.isInteger))].sort((a,b)=>a-b);if(!positions.length)continue;markers.push({key:`event:${e.id}`,kind:'event',id:e.id,eventId:e.id,event:e,title:e.title,start:positions[0],end:positions.at(-1),members:positions,planned:!!e.planned,review:e.review});}
 if(mode==='narration'){
  for(const [i,ch]of chapters.entries())for(const ref of ch.references||[]){const node=board.nodes.find(n=>n.id===ref.nodeId);if(node?.type!=='character_card'||!['appearance','mention'].includes(ref.kind)||markers.some(m=>m.key===`person:${node.id}:${ch.id}:${ref.kind}`))continue;markers.push({key:`person:${node.id}:${ch.id}:${ref.kind}`,kind:'person',id:node.id,title:node.name,start:i,end:i,members:[i],referenceKind:ref.kind,review:ref.review});}
  for(const f of board.foreshadows){const evidence=f.evidence.filter(e=>rank.has(e.chapterId)),plant=evidence.filter(e=>e.kind==='plant').map(e=>rank.get(e.chapterId)),recover=evidence.filter(e=>e.kind==='recover').map(e=>rank.get(e.chapterId)),positions=[...new Set(evidence.map(e=>rank.get(e.chapterId)))].sort((a,b)=>a-b),target=rank.get(f.targetChapterId);if(Number.isInteger(target)&&!['recovered','abandoned'].includes(f.status)&&!positions.includes(target))positions.push(target);positions.sort((a,b)=>a-b);if(!positions.length){waiting.push({kind:'foreshadow',...f});continue;}markers.push({key:`foreshadow:${f.id}`,kind:'foreshadow',id:f.id,title:f.title,start:plant.length?Math.min(...plant):positions[0],end:recover.length?Math.max(Math.min(...recover),plant.length?Math.min(...plant):positions[0]):positions.at(-1),members:positions,evidence,target,plannedEnd:Number.isInteger(target)&&!recover.length,status:f.status,review:f.review});}
 }else{
  for(const [i,row]of slots.entries()){
   for(const id of [...new Set([...row.event.memoryRefs,...row.event.enteringRefs||[]])]){const n=board.nodes.find(n=>n.id===id);if(n?.type==='character_card')markers.push({key:`person:${id}:${row.eventId}`,kind:'person',id,title:n.name,start:i,end:i,members:[i],referenceKind:row.event.enteringRefs?.includes(id)?'entering':'participating'});}
   for(const id of row.event.foreshadowRefs||[]){const f=board.foreshadows.find(f=>f.id===id);if(f)markers.push({key:`foreshadow:${id}:${row.eventId}`,kind:'foreshadow',id,title:f.title,start:i,end:i,members:[i],linkedOnly:true});}
  }
  for(const f of board.foreshadows)if(!markers.some(m=>m.kind==='foreshadow'&&m.id===f.id))waiting.push({kind:'foreshadow',...f});
 }
 const kindOrder={event:0,person:1,foreshadow:2},shown=markers.filter(m=>includes(m.kind)).sort((a,b)=>a.start-b.start||kindOrder[a.kind]-kindOrder[b.kind]||b.end-a.end||a.key.localeCompare(b.key)),lanes=[];
 for(const m of shown){let lane=lanes.findIndex(end=>end<m.start);if(lane<0)lane=lanes.length;lanes[lane]=m.end;m.lane=lane;}
 let height=44;const scale=Number.isFinite(zoom)?Math.max(.35,Math.min(1.6,zoom)):1;for(const slot of slots){slot.top=height;slot.height=Math.max(100,Math.max(160,120+slot.plans.length*72)*scale);height+=slot.height;}
 return {slots,markers:shown,allMarkers:markers,lanes:Math.max(1,lanes.length),height,waiting:waiting.filter(m=>includes(m.kind)),policy:'跨度连接已引用的章节；中间未引用的章不自动成为事件呈现。伏笔章节依据不推断同章事件先后。'};
}
export function trackSelections(board,mode='narration'){
 const track=timelineTracks(board,mode,'event');if(mode==='story')return track.slots;
 let previous=null;
 return track.slots.flatMap((s,i)=>{const presented=track.markers.filter(m=>m.start===i).sort((a,b)=>narrationCompare(a.event,b.event,s.chapterId)),confirmed=presented.filter(m=>!m.event.planned);if(confirmed.length)previous=confirmed.at(-1).event;return [{...s,stageEvent:s.event?null:previous},...presented.filter(m=>m.eventId!==s.eventId).map(m=>({key:m.eventId,eventId:m.eventId,event:m.event,chapterId:s.chapterId}))];});
}

export function unplacedPlanning(board,mode='narration'){
 const chapters=new Set(board.chapters.map(c=>c.id));
 return board.planning.filter(p=>!board.events.some(e=>!e.deleted&&e.planningRefs.includes(p.id))&&(mode==='story'||!p.chapterRefs.some(r=>!r.excluded&&chapters.has(r.chapterId))));
}
