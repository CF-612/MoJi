const fail=message=>{throw Object.assign(new Error(message),{code:'INVALID_WRITING'});};
// Both the author preview and command engine use this projection. Only actual
// chapter identities retain evidence; a newly placed chapter gets an empty quote.
export function chapterPlacement(chapters,event,intent){
 const ids=chapters.map(c=>c.id),rank=new Map(ids.map((id,i)=>[id,i])),members=[...new Set(event.chapterRefs.filter(r=>rank.has(r.chapterId)).map(r=>rank.get(r.chapterId)))].sort((a,b)=>a-b);
 const start=rank.get(intent.startChapterId),end=rank.get(intent.endChapterId),first=members[0],last=members.at(-1),op=intent.operation;
 if(!['move','resize-start','resize-end','range'].includes(op)||start===undefined||end===undefined||start>end)fail('请选择有效的章节范围');
 let positions;
 if(op==='move'){
  const length=members.length?last-first:0;if(end-start!==length)fail('移动须保留原跨度；调整长度请使用首尾手柄');
  positions=members.length?members.map(i=>i+start-first):[start];
 }else if(op==='range')positions=Array.from({length:end-start+1},(_,i)=>start+i);
 else {
  if(!members.length||op==='resize-start'&&end!==last||op==='resize-end'&&start!==first)fail('调整首尾须保留另一端位置');
  const kept=members.filter(i=>i>=start&&i<=end),extra=op==='resize-start'?Array.from({length:Math.max(0,first-start)},(_,i)=>start+i):Array.from({length:Math.max(0,end-last)},(_,i)=>last+1+i);positions=[...new Set([...kept,...extra,start,end])].sort((a,b)=>a-b);
 }
 if(!positions.length||positions.length>200)fail('事件最多关联 200 章');
 const wanted=new Set(positions.map(i=>ids[i])),existing=new Set(event.chapterRefs.map(r=>r.chapterId)),added=[...wanted].filter(id=>!existing.has(id)),removed=[...new Set(event.chapterRefs.filter(r=>rank.has(r.chapterId)&&!wanted.has(r.chapterId)).map(r=>r.chapterId))];
 const chapterRefs=event.chapterRefs.filter(r=>!rank.has(r.chapterId)||wanted.has(r.chapterId)).map(({chapterId,revision,evidence=''})=>({chapterId,revision,evidence}));
 for(const id of added)chapterRefs.push({chapterId:id,revision:chapters[rank.get(id)].revision,evidence:''});
 chapterRefs.sort((a,b)=>(rank.get(a.chapterId)??Infinity)-(rank.get(b.chapterId)??Infinity));
 if(chapterRefs.length>200)fail('含已删除章节的保留引用，事件最多关联 200 章');
 return {chapterRefs,added,removed,kept:[...wanted].filter(id=>existing.has(id)),from:members.length?{start:first,end:last}:null,to:{start,end},changed:added.length>0||removed.length>0};
}
export function placementIntent(chapters,event,operation,targetIndex){
 const rank=new Map(chapters.map((c,i)=>[c.id,i])),members=event.chapterRefs.filter(r=>rank.has(r.chapterId)).map(r=>rank.get(r.chapterId)),first=members.length?Math.min(...members):0,last=members.length?Math.max(...members):0;
 if(!chapters.length)return null;
 let start=first,end=last;
 if(operation==='move'){start=Math.max(0,Math.min(chapters.length-1-(last-first),targetIndex));end=start+last-first;}
 else if(operation==='resize-start')start=Math.max(0,Math.min(last,targetIndex));
 else if(operation==='resize-end')end=Math.max(first,Math.min(chapters.length-1,targetIndex));
 else return null;
 return {operation,startChapterId:chapters[start].id,endChapterId:chapters[end].id};
}
export function timelineHit(slots,y){let best=0,distance=Infinity;for(let i=0;i<slots.length;i++){const s=slots[i];if(y>=s.top&&y<s.top+s.height)return i;const d=Math.min(Math.abs(y-s.top),Math.abs(y-s.top-s.height));if(d<distance){best=i;distance=d;}}return best;}
