import {changeKey,proofReview} from './story-relation-edit.mjs';
export function relationPoint(point,mode,chapters,card,options={}){
 const location=point.location?.[mode];
 if(mode==='story'){
  // Numeric legacy points are explicitly absolute: moving a card must not migrate them.
  if(Number.isFinite(location))return options.storyAxis?null:location;
  const binding=location?.binding,time=card?.time?.story;
  if(binding?.kind!=='card'||time?.axisVersion!==1||!Number.isSafeInteger(time.start)||!Number.isSafeInteger(time.end))return null;
  const ratio=binding.ratio??0,offset=binding.offset??0;
  if(!Number.isFinite(ratio)||ratio<0||ratio>1||!Number.isSafeInteger(offset))return null;
  const position=time.start+(time.end-time.start)*ratio+offset;
  return Number.isSafeInteger(position)&&Math.abs(position)<=100000000000000?position:null;
 }
 const index=chapters.findIndex(c=>c.id===location?.chapterId);
 return index>=0&&Number.isFinite(location.offset)?index+location.offset:null;
}
export const pair=(from,to)=>[from,to].sort().join(':');
export function relationSnapshot(cards,edges,chapters,mode,cursor,includePlans=true,options={}){
 const current=new Map(edges.filter(e=>!e.deleted&&e.baseActive!==false).map(e=>[pair(e.from,e.to),{...e,name:e.name||'未命名关系',planned:false}]));
 const all=Object.values(cards).filter(card=>card.status!=='dropped').flatMap(card=>(card.points||[]).flatMap(point=>{
  const position=relationPoint(point,mode,chapters,card,options);
  return (point.relationships||[]).map((change,index)=>({...change,id:card.id+':'+point.id+':'+changeKey(change,index),changeId:changeKey(change,index),cardId:card.id,cardTitle:card.title,pointId:point.id,position,order:point.order||0,changeOrder:index,planned:!change.evidence,review:proofReview(change.evidence,chapters)}));
 })).sort((a,b)=>(a.position??Infinity)-(b.position??Infinity)||a.order-b.order||a.pointId.localeCompare(b.pointId)||a.changeOrder-b.changeOrder||a.id.localeCompare(b.id));
 const changes=all.filter(c=>c.position!==null&&(includePlans||!c.planned)),undated=all.filter(c=>c.position===null&&(includePlans||!c.planned));
 for(const change of changes)if(change.position<=cursor&&!change.review)current.set(pair(change.from,change.to),change);
 return {relations:[...current.values()],changes,undated,current:changes.filter(c=>c.position<=cursor&&!c.review).at(-1)||null,next:changes.find(c=>c.position>cursor&&!c.review)||null};
}

// Appearance and changes are planning projections, never evidence of confirmed prose.
export function relationOverview(cards,edges,characters,chapters,mode,cursor,includePlans=true,showAll=false,options={}){
 const valid=new Set(characters.map(c=>c.id)),safeEdges=edges.filter(e=>!e.deleted&&valid.has(e.from)&&valid.has(e.to));
 const snapshot=relationSnapshot(cards,safeEdges,chapters,mode,cursor,includePlans,options);
 snapshot.undated=snapshot.undated.filter(e=>valid.has(e.from)&&valid.has(e.to));
 snapshot.changes=snapshot.changes.filter(e=>valid.has(e.from)&&valid.has(e.to));
 snapshot.relations=snapshot.relations.filter(e=>valid.has(e.from)&&valid.has(e.to));
 const first=new Map(),introduce=(id,position)=>{if(valid.has(id)&&Number.isFinite(position))first.set(id,Math.min(first.get(id)??Infinity,position));};
 for(const person of characters){for(const appearance of person.appearances||[]){const i=chapters.findIndex(c=>c.id===appearance.chapterId);if(mode==='narration'&&i>=0)introduce(person.id,i+(appearance.offset||0));}if(includePlans){const plan=person.appearancePlan;if(mode==='story'){if(!options.storyAxis||plan?.storyAxisVersion===1)introduce(person.id,plan?.story);}else{const i=chapters.findIndex(c=>c.id===plan?.chapterId);if(i>=0)introduce(person.id,i+(plan.offset||0));}}}
 for(const card of Object.values(cards).filter(c=>includePlans&&c.status!=='dropped')){
  const time=card.time?.[mode];
  const index=mode==='narration'?chapters.findIndex(c=>c.id===time?.startChapterId):-1;
  const position=mode==='story'?(options.storyAxis&&time?.axisVersion!==1?null:time?.start):index>=0?index+(time.startOffset||0):null;
  for(const cast of card.cast||[])if(cast.kind==='appearance')introduce(cast.nodeId,position);
 }
 for(const change of relationSnapshot(cards,safeEdges,chapters,mode,cursor,includePlans,options).changes.filter(c=>!c.review)){introduce(change.from,change.position);introduce(change.to,change.position);}
 const allNodes=characters.map(c=>{const firstAt=first.get(c.id);return {...c,firstAt,active:firstAt!==undefined&&firstAt<=cursor};});
 const nodes=allNodes.filter(c=>showAll||c.active),visible=new Set(allNodes.filter(c=>c.active).map(c=>c.id));
 return {...snapshot,allNodes,nodes,relations:snapshot.relations.filter(e=>visible.has(e.from)&&visible.has(e.to)),pending:allNodes.filter(c=>!c.active).length};
}

// Both relationship views use the same time domain and label.
export function relationRange(cards,chapters,mode){
 const all=Object.values(cards),times=all.filter(c=>c.status!=='dropped').map(c=>c.time?.story).filter(Boolean),points=all.filter(c=>c.status!=='dropped').flatMap(c=>(c.points||[]).map(p=>relationPoint(p,'story',chapters,c))).filter(Number.isFinite),starts=[...times.map(t=>t.start),...points];
 const origin=mode==='story'&&starts.length?Math.floor(Math.min(...starts)):0;
 return {origin,count:mode==='narration'?Math.max(1,chapters.length):Math.max(8,...times.map(t=>t.end-origin),...points.map(p=>p-origin+1))};
}
export function relationTimeLabel(chapters,mode,position){
 return mode==='narration'?(chapters[Math.floor(position)]?.title||'暂无章节')+' · '+Math.round(position%1*100)+'%':'故事时间 '+position.toFixed(1);
}
export function appearanceLabel(node,chapters,mode){
 return node?.firstAt===undefined?'未安排出场':(mode==='narration'?'首次出现：':'首次出现于 ')+relationTimeLabel(chapters,mode,node.firstAt);
}
