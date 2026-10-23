// Relationship changes belong to a plot point. Ordering changes never moves prose.
export const changeKey=(change,index)=>change.id||`legacy-${index}`;
const fail=message=>{throw new Error(message);};
const cas=(card,revision)=>{if(!card)fail('剧情卡已不存在。');if(card.revision!==revision)throw Object.assign(new Error('关系节点所在剧情卡已有更新，请重新打开核对；填写内容已保留。'),{code:'CONFLICT'});};
const prune=(card,point)=>{if(!point.relationships.length&&Object.keys(point).every(k=>['id','order','location','relationships'].includes(k)))card.points=card.points.filter(p=>p!==point);};
export function editRelation(state,op,newId){
 const source=op.source&&state.cards[op.source.cardId];let point,index=-1;
 if(op.source){cas(source,op.source.revision);point=source.points.find(p=>p.id===op.source.pointId);index=point?.relationships?.findIndex((r,i)=>changeKey(r,i)===op.source.changeId)??-1;if(index<0)fail('这条关系变化已不存在，请重新打开。');}
 if(op.type==='relation.delete'){
  if(!source)fail('请选择关系变化。');point.relationships.splice(index,1);prune(source,point);source.revision++;return;
 }
 if(op.type==='relation.order'){
  if(!source)fail('请选择关系变化。');const target=index+(op.direction==='up'?-1:op.direction==='down'?1:0);
  if(target<0||target>=point.relationships.length||target===index)fail('已到同一发生点的排序边界。');
  // Stabilize identities before changing the legacy array order.
  point.relationships=point.relationships.map((r,i)=>({...r,id:r.id||`${point.id}:${i}`}));
  [point.relationships[index],point.relationships[target]]=[point.relationships[target],point.relationships[index]];source.revision++;return;
 }
 const target=state.cards[op.cardId];cas(target,op.expectedRevision);if(target.status==='dropped')fail('请先采用这张剧情卡，再安排关系变化。');
 let destination=op.pointId?target.points.find(p=>p.id===op.pointId):null;if(op.pointId&&!destination)fail('目标发生点已不存在。');
 const value={id:source?(point.relationships[index].id||`${point.id}:${index}`):newId(),from:op.value?.from,to:op.value?.to,name:String(op.value?.name||'').trim(),reason:String(op.value?.reason||'').trim(),...(op.value?.typeId!==undefined?{typeId:op.value.typeId}:source&&point.relationships[index].typeId?{typeId:point.relationships[index].typeId}:{}),evidence:op.value?.evidence?structuredClone(op.value.evidence):null};
 if(!destination){
  const location=structuredClone(op.location||{});
  // Only newly created points on a configured axis default to card binding.
  // Editing legacy absolute points preserves their coordinates unless explicitly changed.
  if(state.storyAxis&&location.story===undefined)location.story={binding:{kind:'card',offset:0}};
  destination={id:newId(),order:op.order??0,location,relationships:[]};target.points.push(destination);
 }
 else if(destination===point){destination.location=structuredClone(op.location??destination.location??{});destination.order=op.order??destination.order??0;}
 if(destination===point&&target===source)destination.relationships[index]=value;
 else {destination.relationships??=[];destination.relationships.push(value);if(source){point.relationships.splice(index,1);prune(source,point);}}
 target.revision++;if(source&&source!==target)source.revision++;
}

export function validateRelationPoints(points,chapters){
 const ids=new Set();
 for(const point of points){
  if(!point?.id||ids.has(point.id))fail('剧情发生点需要唯一 ID。');ids.add(point.id);
  if(point.order!==undefined&&(!Number.isSafeInteger(point.order)||point.order<0))fail('同位置顺序需要非负整数。');
  if(point.relationships===undefined)continue;
  if(!Array.isArray(point.relationships))fail('关系变化必须是列表。');
  const n=point.location?.narration,s=point.location?.story;
  // A removed chapter leaves a recoverable node, never silently relocates it.
  if(n&&(!n.chapterId||!Number.isFinite(n.offset)||n.offset<0||n.offset>=1))fail('关系变化的章节位置无效。');
  const binding=s?.binding;
  const bound=!!binding&&binding.kind==='card'&&Number.isFinite(binding.ratio??0)&&(binding.ratio??0)>=0&&(binding.ratio??0)<=1&&Number.isSafeInteger(binding.offset??0);
  if(s!==undefined&&s!==null&&!Number.isFinite(s)&&!bound)fail('故事时间位置无效。');
  const changes=new Set();for(const [i,r] of point.relationships.entries()){
   if(!r?.from||!r?.to||r.from===r.to||!String(r.name||'').trim())fail('关系变化需要不同的人物和关系名称。');
   const id=changeKey(r,i);if(changes.has(id))fail('同一发生点的变化 ID 重复。');changes.add(id);
   if(r.evidence&&(!n&&!Number.isFinite(s)&&!bound))fail('确认正文前需要明确关系发生位置。');
   if(r.evidence&&(!r.evidence.chapterId||!Number.isSafeInteger(r.evidence.revision)||r.evidence.revision<1||!r.evidence.evidence?.trim()))fail('正文依据需要章节、已保存版本与原文。');
  }
 }
}

export const proofReview=(evidence,chapters)=>!!evidence&&!chapters.some(c=>c.id===evidence.chapterId&&c.contentHash===evidence.contentHash);
