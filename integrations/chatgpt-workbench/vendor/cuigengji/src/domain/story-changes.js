const snapshot=e=>({name:e.name||'',category:e.category||'other',style:e.style||'solid',active:e.active!==false});
export function storyChanges(board,ordered,event,selectedChapter,nodes){
 const rank=new Map(ordered.map((r,i)=>[r.eventId,i])),at=rank.get(event?.id),eligible=c=>!c.deleted&&!c.excluded&&rank.has(c.eventId)&&(event?.planned||!ordered[rank.get(c.eventId)].event.planned);
 const relationships=[];
 if(at!==undefined)for(const change of board.relationshipChanges.filter(c=>eligible(c)&&c.eventId===event.id)){
  const edge=board.edges.find(e=>e.id===change.edgeId);if(!edge)continue;
  const previous=board.relationshipChanges.filter(c=>eligible(c)&&c.edgeId===edge.id&&rank.get(c.eventId)<at).sort((a,b)=>rank.get(a.eventId)-rank.get(b.eventId)||a.id.localeCompare(b.id)).at(-1);
  const before={...edge,active:edge.baseActive!==false,...previous?.value},after={...before,...change.value},beforeValue=snapshot(before),afterValue=snapshot(after),contentChanged=(before.content||'')!==(after.content||'');
  if(!contentChanged&&JSON.stringify(beforeValue)===JSON.stringify(afterValue))continue;
  relationships.push({edgeId:edge.id,changeId:change.id,from:edge.from,to:edge.to,kind:!beforeValue.active&&afterValue.active?'added':beforeValue.active&&!afterValue.active?'ended':'changed',before:beforeValue,after:afterValue,contentChanged});
 }
 const chapterForeshadows=selectedChapter?board.foreshadows.flatMap(f=>{const kinds=[...new Set(f.evidence.filter(r=>r.chapterId===selectedChapter).map(r=>r.kind))];return kinds.length?[{id:f.id,title:f.title,chapterId:selectedChapter,kinds,review:!!f.review}]:[];}):[];
 return {previousEventId:at===undefined?null:ordered.slice(0,at).filter(r=>event?.planned||!r.event.planned).at(-1)?.eventId||null,planned:!!event?.planned,entering:nodes.filter(n=>event&&n.entryEventId===event.id&&!n.future).map(n=>({id:n.id,name:n.name,type:n.type})),relationships,chapterForeshadows,eventForeshadows:board.foreshadows.filter(f=>event?.foreshadowRefs.includes(f.id)).map(f=>({id:f.id,title:f.title})),policy:'进入故事不等于正式出场；伏笔依据属于整章，不推断同章事件先后。'};
}
