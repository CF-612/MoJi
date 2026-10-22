// Shared by the drag preview and the atomic save path.
export const overlaps=(a,b)=>a.start<b.end&&b.start<a.end;
export function timelineBounds(card,chapters,mode,origin=0){
 const t=card.time?.[mode];if(!t)return null;
 const a=mode==='narration'?chapters.findIndex(c=>c.id===t.startChapterId):-1,b=mode==='narration'?chapters.findIndex(c=>c.id===t.endChapterId):-1;
 if(mode==='narration'&&(a<0||b<0))return null;
 return {id:card.id,card,start:mode==='story'?t.start-origin:a+t.startOffset,end:mode==='story'?t.end-origin:b+t.endOffset,trackId:t.trackId,row:t.row};
}
function occupy(items){
 const placed=[];
 for(const item of items){let row=Number.isInteger(item.row)?item.row:0;while(placed.some(p=>p.trackId===item.trackId&&p.row===row&&overlaps(item,p)))row++;placed.push({...item,row});}
 return placed;
}
export function timelineItems(cards,chapters,mode,origin=0){
 const items=Object.values(cards).map(c=>timelineBounds(c,chapters,mode,origin)).filter(Boolean);
 return occupy(items.sort((a,b)=>(a.row??0)-(b.row??0)||a.start-b.start));
}
export function projectTimeline(items,candidate,requestedRow){
 const others=items.filter(p=>p.id!==candidate.id),target=others.filter(p=>p.trackId===candidate.trackId);
 const row=Math.max(0,Math.min(Number.isInteger(requestedRow)?requestedRow:0,Math.max(-1,...target.map(p=>p.row))+1));
 // The dragged card owns its chosen slot. Only overlapping cards cascade down.
 const result=occupy([{...candidate,row},...others.sort((a,b)=>a.row-b.row||a.start-b.start)]);
 const affected=new Set([candidate.trackId,items.find(p=>p.id===candidate.id)?.trackId]);
 // Close completely empty rows; no card changes its horizontal interval.
 for(const trackId of affected){const rows=[...new Set(result.filter(p=>p.trackId===trackId).map(p=>p.row))].sort((a,b)=>a-b);for(const item of result)if(item.trackId===trackId)item.row=rows.indexOf(item.row);}
 return result;
}


// Derived from the narration interval; manual scope and containment stay independent.
export function narrationChapters(card,chapters){
 const interval=timelineBounds(card,chapters,'narration');
 if(!interval||!Number.isFinite(interval.start)||!Number.isFinite(interval.end)||interval.end<=interval.start)return [];
 return chapters.filter((chapter,index)=>index+1>interval.start&&index<interval.end);
}
