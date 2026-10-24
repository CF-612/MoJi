export const linkedTypeLabels={character:'人物',world:'世界书',card:'剧情卡',foreshadow:'伏笔'};
const typeOrder=Object.keys(linkedTypeLabels);
const proofKey=p=>JSON.stringify([p.start,p.end,p.revision,p.contentHash,p.evidence]);
// Sweep boundaries: overlapping types retain separate color bands, never blend.
function typedSegments(ranges){
 const events=new Map();for(const r of ranges)for(const [at,delta] of [[r.start,1],[r.end,-1]]){if(!events.has(at))events.set(at,[]);for(const type of r.types||['card'])events.get(at).push([type,delta]);}
 const points=[...events.keys()].sort((a,b)=>a-b),counts={},out=[];for(let i=0;i<points.length-1;i++){const start=points[i],end=points[i+1];for(const [type,delta] of events.get(start))counts[type]=(counts[type]||0)+delta;const types=typeOrder.filter(t=>counts[t]>0);if(!types.length)continue;const last=out.at(-1);if(last&&last.end===start&&last.types.join()===types.join())last.end=end;else out.push({start,end,types});}return out;
}
const normalize=value=>String(value||'').replace(/\r\n?/g,'\n');
// Never search by quote: repeated names and stale revisions are not safe anchors.
export function linkedProseRanges(data,chapter,content){
 const candidates=[];if(!data||!chapter)return {ranges:[],skipped:0,total:0};
 const nodes=new Map((data.nodes||[]).map(n=>[n.id,n])),shadowProofs=new Map();
 for(const item of data.foreshadows||[])if(!item.deleted)for(const node of item.plotNodes||[])if(node.evidence?.chapterId===chapter.id){candidates.push({proof:node.evidence,type:'foreshadow'});if(node.cardId){if(!shadowProofs.has(node.cardId))shadowProofs.set(node.cardId,new Set());shadowProofs.get(node.cardId).add(proofKey(node.evidence));}}
 for(const link of data.links||[])if(!link.deleted&&!link.excluded&&link.chapterId===chapter.id){const node=nodes.get(link.nodeId);if(node&&!node.deleted)candidates.push({proof:link.review?{chapterId:link.chapterId}:link.selection||{chapterId:link.chapterId},type:node.type==='character_card'?'character':'world'});}
 for(const card of data.cards||[])if(!card.deleted)for(const proof of card.evidence||[])if(proof.chapterId===chapter.id&&!shadowProofs.get(card.id)?.has(proofKey(proof)))candidates.push({proof,type:'card'});
 const text=normalize(content),clean=text===normalize(chapter.content),ranges=[],seen=new Set();let skipped=0;
 for(const {proof,type} of candidates){const key=type+proofKey(proof);if(seen.has(key))continue;seen.add(key);
  const valid=clean&&proof.coordinate==='lf-utf16'&&proof.revision===chapter.revision&&!!proof.contentHash&&proof.contentHash===chapter.contentHash&&Number.isSafeInteger(proof.start)&&Number.isSafeInteger(proof.end)&&proof.start>=0&&proof.end>proof.start&&proof.end<=text.length&&typeof proof.evidence==='string'&&text.slice(proof.start,proof.end)===proof.evidence;
  if(valid)ranges.push({start:proof.start,end:proof.end,types:[type]});else skipped++;
 }
 return {ranges:typedSegments(ranges),skipped,total:seen.size};
}
// Search marks take visual priority; linked marks only supply the remaining spans.
export function proseHighlightSegments(content,state,linkedRanges=[]){
 const searches=state?.matches||[],valid=r=>Number.isSafeInteger(r.start)&&Number.isSafeInteger(r.end)&&r.start>=0&&r.end>r.start&&r.end<=content.length;
 const linked=typedSegments(linkedRanges.filter(valid));
 const matches=searches.map((r,index)=>({...r,index})).filter(valid).sort((a,b)=>a.start-b.start),points=[...new Set([0,content.length,...[...matches,...linked].flatMap(r=>[r.start,r.end])])].sort((a,b)=>a-b);
 let searchIndex=0,linkedIndex=0;
 return points.slice(0,-1).map((start,i)=>{const end=points[i+1];while(matches[searchIndex]?.end<=start)searchIndex++;while(linked[linkedIndex]?.end<=start)linkedIndex++;const candidate=matches[searchIndex],match=candidate?.start<=start&&candidate.end>=end?candidate:null,range=linked[linkedIndex];return {start,end,text:content.slice(start,end),matchIndex:match?.index,current:match?.index===state?.current,linked:!!range&&range.start<=start&&range.end>=end,types:range&&range.start<=start&&range.end>=end?range.types:[]};});
}

const typeColor=type=>`var(--linked-${type})`;
export function linkedHighlightStyle(types=[]){if(!types.length)return undefined;return {backgroundColor:types.length===1?`color-mix(in srgb,${typeColor(types[0])} 22%,transparent)`:'transparent',backgroundImage:`linear-gradient(to bottom,${types.flatMap((type,i)=>[`${typeColor(type)} ${i/types.length*100}%`,`${typeColor(type)} ${(i+1)/types.length*100}%`]).join(',')})`,backgroundSize:`100% ${types.length*2}px`,backgroundPosition:'left bottom',backgroundRepeat:'no-repeat'};}
