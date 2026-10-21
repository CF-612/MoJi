// Preview projection only. No source records or chapter evidence are mutated.
export const DEFAULT_LAYOUT={revision:0,tracks:[{id:'main',name:'主线',color:'#67889b'}],placements:{}};
const statuses={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
export function timelineItems(board){
 const people=(board.nodes||[]).filter(n=>n.type==='character_card');
 const known=new Set(people.map(n=>n.id));
 const plans=(board.planning||[]).map(p=>({key:`planning:${p.id}`,kind:'planning',id:p.id,title:p.title,summary:p.summary||'',status:statuses[p.status]||'规划中',cast:p.cast||[],related:(p.cast||[]).filter(r=>r.kind==='appearance').map(r=>r.nodeId),chapterIds:(p.chapterRefs||[]).filter(r=>!r.excluded).map(r=>r.chapterId),foreshadows:p.foreshadowRefs||[],source:p}));
 const events=(board.events||[]).filter(e=>!e.deleted).map(e=>({key:`event:${e.id}`,kind:'event',id:e.id,title:e.title,summary:e.content||e.summary||'',status:e.planned?'计划情境':'已记录事件',cast:[],related:(e.memoryRefs||[]).filter(id=>known.has(id)),chapterIds:(e.chapterRefs||[]).filter(r=>!r.excluded).map(r=>r.chapterId),foreshadows:e.foreshadowRefs||[],source:e}));
 const shadows=(board.foreshadows||[]).map(f=>({key:`foreshadow:${f.id}`,kind:'foreshadow',id:f.id,title:f.title,summary:f.content||'',status:({planned:'计划埋设',planted:'待回收',developing:'推进中',recovered:'已回收',abandoned:'已放弃'})[f.status]||'伏笔',cast:[],related:(f.memoryRefs||[]).filter(id=>known.has(id)),chapterIds:[...new Set([...(f.evidence||[]).map(r=>r.chapterId),...(f.targetChapterId?[f.targetChapterId]:[])])],foreshadows:[],source:f}));
 const appearances=(board.chapters||[]).flatMap(c=>(c.references||[]).filter(r=>r.kind==='appearance'&&known.has(r.nodeId)).map(r=>{const p=people.find(p=>p.id===r.nodeId);return {key:`person:${p.id}:${c.id}`,kind:'person',id:p.id,title:p.name,summary:p.summary||'',status:r.review?'出场待复核':'正文出场',cast:[],related:[p.id],chapterIds:[c.id],foreshadows:[],source:p};}));
 return [...plans,...events,...shadows,...appearances];
}
export function timelineSlots(board,mode){
 if(mode==='story')return [...(board.events||[])].filter(e=>!e.deleted).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)).map((e,i)=>({id:`event:${e.id}`,eventId:e.id,title:e.storyDate||e.storyTime||`顺序 ${i+1}`,subtitle:e.title}));
 return [...(board.chapters||[]).map(c=>({id:`chapter:${c.id}`,chapterId:c.id,title:c.title,subtitle:(board.stats?.volumes||[]).find(v=>v.id===c.volumeId)?.title||'未分卷'})),{id:'future:1',title:'待写位置',subtitle:'尚无正文也能安排'}];
}
export function anchorAt(value,slots){const n=Math.max(0,Math.min(slots.length-.001,value)),index=Math.floor(n);return {anchorId:slots[index]?.id,offset:Math.round((n-index)*1000)/1000};}
export function anchorValue(anchor,slots){const i=slots.findIndex(s=>s.id===anchor?.anchorId);return i<0?null:i+Math.max(0,Math.min(.999,Number(anchor.offset)||0));}
export function itemBounds(item,board,mode,layout,slots){
 const stored=layout.placements?.[item.key];
 if(stored&&Object.hasOwn(stored,mode)){
  if(!stored[mode])return null;
  const start=anchorValue(stored[mode].start,slots),end=anchorValue(stored[mode].end,slots);
  return start===null||end===null?null:{start,end:Math.max(start,end)};
 }
 let indices=[];
 if(mode==='narration')indices=item.chapterIds.map(id=>slots.findIndex(s=>s.chapterId===id)).filter(i=>i>=0);
 else {
  const ids=item.kind==='event'?[item.id]:(board.events||[]).filter(e=>!e.deleted&&(item.kind==='planning'?(e.planningRefs||[]).includes(item.id):item.kind==='foreshadow'?(e.foreshadowRefs||[]).includes(item.id):(e.memoryRefs||[]).includes(item.id))).map(e=>e.id);
  indices=ids.map(id=>slots.findIndex(s=>s.eventId===id)).filter(i=>i>=0);
 }
 if(!indices.length)return null;
 const first=Math.min(...indices),last=Math.max(...indices);
 // A visible span describes arrangement, never evidence in the chapters between.
 return {start:first+.12,end:last>first?last+.8:first+.12};
}
export function visibleTimelineItems(items,{kinds=['event','person','foreshadow'],person=''}={}){
 return items.filter(item=>kinds.includes(item.kind==='planning'?'event':item.kind)&&(!person||item.related.includes(person)));
}
export function packTimeline(items,board,mode,layout,slots,unit,cardWidth=250,cardHeight=140){
 const waiting=[],lanes=layout.tracks.map(track=>({track,items:[],height:168}));
 for(const item of items){const bounds=itemBounds(item,board,mode,layout,slots);if(!bounds){waiting.push(item);continue;}const place=layout.placements?.[item.key]||{};const lane=lanes.find(l=>l.track.id===place.trackId)||lanes[0];if(!lane)continue;lane.items.push({...item,...bounds,color:place.color||lane.track.color,width:Math.max(cardWidth,(bounds.end-bounds.start)*unit),cardWidth});}
 for(const lane of lanes){const ends=[];lane.items.sort((a,b)=>a.start-b.start||a.key.localeCompare(b.key));for(const item of lane.items){const left=item.start*unit;let row=ends.findIndex(end=>end+18<=left);if(row<0)row=ends.length;ends[row]=left+item.width;item.row=row;item.top=18+row*(cardHeight+22);}lane.height=Math.max(168,ends.length*(cardHeight+22)+30);}
 return {lanes,waiting,cardHeight,width:Math.max(slots.length*unit+cardWidth,...lanes.flatMap(l=>l.items.map(i=>i.start*unit+i.width+36))),height:lanes.reduce((n,l)=>n+l.height,0)};
}
