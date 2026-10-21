// A relationship phase is a real state transition, not every story event.
const fields=['active','name','category','style','content'];
const state=edge=>({active:edge.baseActive!==false,name:edge.name||'',category:edge.category||'other',style:edge.style||'solid',content:edge.content||''});
const differs=(a,b)=>fields.some(key=>a[key]!==b[key]);
export function relationshipMilestones(board,{includePlanned=false}={}){
 const events=(board?.events||[]).filter(e=>!e.deleted&&(includePlanned||!e.planned)).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
 const edges=new Map((board?.edges||[]).filter(e=>!e.deleted).map(e=>[e.id,state(e)]));
 const result=[{id:'base',eventId:null,title:'基础关系',changeCount:0}];
 const changes=new Map();for(const c of board?.relationshipChanges||[]){if(c.deleted||c.excluded||!edges.has(c.edgeId))continue;const list=changes.get(c.eventId)||[];list.push(c);changes.set(c.eventId,list);}
 for(const event of events){
  const before=new Map();
  for(const change of (changes.get(event.id)||[]).sort((a,b)=>a.id.localeCompare(b.id))){
   if(!before.has(change.edgeId))before.set(change.edgeId,edges.get(change.edgeId));
   const value=Object.fromEntries(Object.entries(change.value||{}).filter(([key,value])=>fields.includes(key)&&value!==undefined));
   edges.set(change.edgeId,{...edges.get(change.edgeId),...value});
  }
  const count=[...before].filter(([id,value])=>differs(value,edges.get(id))).length;
  if(count)result.push({id:event.id,eventId:event.id,title:event.title||'未命名关键事件',time:event.storyDate||event.storyTime||'',planned:!!event.planned,changeCount:count});
 }
 return result;
}
export function relationshipStageAt(board,eventId,options){
 const phases=relationshipMilestones(board,options);
 if(eventId==='latest')return phases.at(-1);
 const events=(board?.events||[]).filter(e=>!e.deleted).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
 const rank=new Map(events.map((e,i)=>[e.id,i])),at=rank.get(eventId);
 return at===undefined?phases[0]:phases.filter(p=>p.eventId===null||rank.get(p.eventId)<=at).at(-1);
}
