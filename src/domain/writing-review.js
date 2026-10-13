import {createHash,randomUUID} from 'node:crypto';
// Suggestions are a separate inbox, never a second store of story facts.
const clone=structuredClone,object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const fail=(message,code='INVALID_REVIEW')=>{throw Object.assign(new Error(message),{code});};
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const safe=id=>typeof id==='string'&&id.length>0&&id.length<160&&!['__proto__','constructor','prototype'].includes(id);
const text=(v,label,max=20000)=>{if(typeof v!=='string'||v.length>max)fail(`${label}无效`);return v;};
const get=(map,id)=>safe(id)&&Object.hasOwn(map||{},id)?map[id]:fail('建议关联的记录不存在','NOT_FOUND');
const collection=(n,key)=>['chapters','nodes','edges'].includes(key)?n[key]:key==='planning'?n.planning?.nodes:n.writing?.[key];
const stateOf=(n,key,id)=>key==='eventOrder'?hash(Object.values(n.writing?.events||{}).map(e=>[e.id,e.revision,e.deleted]).sort()):get(collection(n,key),id).revision;
const now=()=>new Date().toISOString();
function dependencies(n,chapterId,item){
 const refs=new Map(),add=(collection,id)=>{if(id)refs.set(`${collection}:${id}`,{collection,id,revision:stateOf(n,collection,id)});};
 add('chapters',chapterId);
 if(item.kind==='link')add('nodes',item.nodeId);
 if(item.kind==='event'){
  add('eventOrder','events');
  for(const id of [...item.value.memoryRefs||[],...item.value.enteringRefs||[]])add('nodes',id);
  for(const id of item.value.planningRefs||[])add('planning',id);
  for(const id of item.value.foreshadowRefs||[])add('foreshadows',id);
 }
 if(item.kind==='foreshadow'){
  if(item.targetId)add('foreshadows',item.targetId);
  const value={...n.writing?.foreshadows?.[item.targetId],...item.value};
  for(const id of value.memoryRefs||[])add('nodes',id);
  for(const e of value.evidence||[])add('chapters',e.chapterId);
  add('chapters',value.targetChapterId);
 }
 return [...refs.values()];
}
function executeItem(n,chapterId,chapterRevision,item,execute,reason){
 if(item.kind==='link')return execute(n,'writing.link.create',{chapterId,expectedChapterRevision:chapterRevision,nodeId:item.nodeId,kind:item.linkKind,evidence:item.evidence,confirmed:true,reason});
 if(item.kind==='event')return execute(n,'writing.event.create',{value:{...item.value,chapterRefs:[{chapterId,revision:chapterRevision,evidence:item.evidence}]},confirmed:true,reason});
 return execute(n,item.targetId?'writing.foreshadow.update':'writing.foreshadow.create',{id:item.targetId,expectedRevision:item.expectedRevision??0,value:item.value,confirmed:true,reason});
}
function prepare(n,a,execute){
 const ch=get(n.chapters,a.chapterId);if(ch.deleted||ch.revision!==a.expectedChapterRevision)fail('正文版本已变化，请重新读取并整理','CONFLICT');
 const title=text(a.title||'本章整理建议','建议标题',200);if(!title.trim())fail('请填写建议标题');
 if(!Array.isArray(a.items)||!a.items.length||a.items.length>30)fail('每批建议需要 1 至 30 项');
 if(JSON.stringify(a.items).length>100000)fail('建议内容过长，请分批整理');
 let eventIndex=0;const seen=new Set(),items=a.items.map(raw=>{
  if(!object(raw)||!safe(raw.id)||seen.has(raw.id)||!['link','event','foreshadow'].includes(raw.kind))fail('候选标识或类型无效');seen.add(raw.id);
  const item={id:raw.id,kind:raw.kind,reason:text(raw.reason||'','候选理由',2000)};
  if(raw.kind==='link')Object.assign(item,{nodeId:raw.nodeId,linkKind:raw.linkKind||'mention',evidence:text(raw.evidence,'正文依据',2000)});
  else {
   if(!object(raw.value))fail('候选内容需要对象');
   item.value=clone(raw.value);
   if(raw.kind==='event'){
    item.evidence=text(raw.evidence,'事件正文依据',2000);if(!item.evidence.trim())fail('事件建议需要正文依据');
    // Never accept hidden chapter bindings/deletions from candidate payloads.
    delete item.value.chapterRefs;delete item.value.chapterOrders;delete item.value.deleted;
    item.value.order??=Math.max(0,...Object.values(n.writing?.events||{}).filter(e=>!e.deleted).map(e=>e.order))+10*(++eventIndex);
    item.value.narrativeKind??='linear';
   }else {
    item.targetId=raw.targetId||null;item.expectedRevision=raw.expectedRevision??0;
    if(item.targetId){const old=get(n.writing?.foreshadows,item.targetId);if(old.revision!==item.expectedRevision)fail('伏笔版本已变化','CONFLICT');item.beforeStatus=old.status;}
    const value={...n.writing?.foreshadows?.[item.targetId],...item.value};
    if(!Array.isArray(value.evidence)||!value.evidence.some(e=>e.chapterId===ch.id&&e.revision===ch.revision))fail('伏笔建议需要本章已保存正文依据');
   }
  }
  const checked=executeItem(clone(n),ch.id,ch.revision,item,execute,'仅校验候选，不保存');
  if(item.kind!=='link'){const keys=item.kind==='event'?['title','storyTime','storyDate','plannedChapter','narrationOrder','planned','enteringRefs','order','narrativeKind','content','memoryRefs','planningRefs','foreshadowRefs']:['title','status','content','memoryRefs','targetChapterId','evidence','abandonReason'];item.value=Object.fromEntries(keys.map(key=>[key,checked[key]]));}
  item.dependencies=dependencies(n,ch.id,item);
  return item;
 });
 const result={chapterId:ch.id,chapterRevision:ch.revision,title,items};
 return {...result,proof:hash(result),candidateOnly:true};
}
function view(n,r){
 return {...clone(r),chapterTitle:n.chapters[r.chapterId]?.title||'缺失章节',items:r.items.map(item=>({...clone(item),stale:item.state==='pending'&&item.dependencies.some(d=>{try{return stateOf(n,d.collection,d.id)!==d.revision;}catch{return true;}})})),candidateOnly:true};
}
export function reviewAction(n,action,a,actor,execute){
 const reviews=n.writing?.reviews||{};
 if(action==='writing.review.preview')return prepare(n,a,execute);
 if(action==='writing.review.list')return Object.values(reviews).filter(r=>!a.chapterId||r.chapterId===a.chapterId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(r=>{const v=view(n,r);return {id:r.id,revision:r.revision,title:r.title,chapterId:r.chapterId,chapterRevision:r.chapterRevision,chapterTitle:v.chapterTitle,createdAt:r.createdAt,pending:v.items.filter(i=>i.state==='pending').length,stale:v.items.some(i=>i.stale),total:r.items.length};});
 if(action==='writing.review.get')return view(n,get(reviews,a.id));
 if(!safe(a.requestId)||!a.requestId.trim())fail('请提供稳定 requestId，避免重复提交');
 if(action==='writing.review.submit'){
  const p=prepare(n,a,execute);if(a.proof!==p.proof)fail('预览后资料或建议已变化，请重新预览','CONFLICT');
  const time=now(),r={id:randomUUID(),revision:1,title:p.title,chapterId:p.chapterId,chapterRevision:p.chapterRevision,items:p.items.map(i=>({...i,state:'pending',result:null})),createdAt:time,updatedAt:time,actor:{kind:actor.kind==='human'?'human':'agent',sessionId:actor.sessionId||null}};
  n.writing??={version:1,fields:{},cards:{},links:{},foreshadows:{},goal:null};n.writing.version=2;n.writing.reviews??={};n.writing.reviews[r.id]=r;n.revision++;n.updatedAt=time;
  return view(n,r);
 }
 const old=get(reviews,a.id);if(old.revision!==a.expectedRevision)fail('建议已在另一端处理，请重新读取','CONFLICT');
 if(!Array.isArray(a.itemIds)||!a.itemIds.length||new Set(a.itemIds).size!==a.itemIds.length)fail('请选择待处理建议');
 const selected=a.itemIds.map(id=>old.items.find(i=>i.id===id));if(selected.some(i=>!i||i.state!=='pending'))fail('建议已处理或不存在','CONFLICT');
 if(!['writing.review.apply','writing.review.dismiss'].includes(action))fail('不支持的建议操作');
 if(a.confirmed!==true)fail('请核对并确认选择的建议','CONFIRM_REQUIRED');
 const draft=clone(n),time=now();let record=draft.writing.reviews[old.id];
 if(action==='writing.review.apply'){
  // Check the entire selected batch before writing any item. Each candidate
  // carries its own snapshot; unrelated edits need not invalidate the inbox.
  if(view(n,old).items.some(i=>a.itemIds.includes(i.id)&&i.stale))fail('正文或关联资料已变化；候选保留，请重新整理后确认','CONFLICT');
  for(const item of selected){const result=executeItem(draft,old.chapterId,old.chapterRevision,item,execute,a.reason||'作者确认 AI 整理建议');record=draft.writing.reviews[old.id];const target=record.items.find(i=>i.id===item.id);target.state='applied';target.result={id:result.id,kind:item.kind};target.processedAt=time;target.processedBy={kind:actor.kind==='human'?'human':'agent',sessionId:actor.sessionId||null};}
 }else for(const item of selected){const target=record.items.find(i=>i.id===item.id);target.state='dismissed';target.processedAt=time;target.processedBy={kind:actor.kind==='human'?'human':'agent',sessionId:actor.sessionId||null};}
 record.revision++;record.updatedAt=time;Object.assign(n,draft);n.revision++;n.updatedAt=time;return view(n,record);
}
export function validateReviews(n){
 const reviews=n.writing?.reviews;if(reviews===undefined)return;
 if(!object(reviews))fail('整理建议格式无效','INVALID_BACKUP');
 for(const [id,r]of Object.entries(reviews)){
  if(!safe(id)||r.id!==id||!Number.isSafeInteger(r.revision)||r.revision<1||!safe(r.chapterId)||!Number.isSafeInteger(r.chapterRevision)||typeof r.title!=='string'||!Array.isArray(r.items)||!r.items.length||r.items.length>30)fail('整理建议记录无效','INVALID_BACKUP');
  const chapter=get(n.chapters,r.chapterId);if(!chapter.versions.some(v=>v.revision===r.chapterRevision)||typeof r.createdAt!=='string'||typeof r.updatedAt!=='string')fail('建议来源版本或时间无效','INVALID_BACKUP');const seen=new Set();
  for(const i of r.items){if(!safe(i.id)||seen.has(i.id)||!['link','event','foreshadow'].includes(i.kind)||!['pending','applied','dismissed'].includes(i.state)||!Array.isArray(i.dependencies))fail('整理候选无效','INVALID_BACKUP');seen.add(i.id);
   if(i.kind==='link'){get(n.nodes,i.nodeId);text(i.evidence,'候选依据',2000);if(!['appearance','mention','reference'].includes(i.linkKind))fail('候选关联类型无效','INVALID_BACKUP');}
   else {if(!object(i.value)||JSON.stringify(i.value).length>100000)fail('整理候选内容无效','INVALID_BACKUP');for(const id of [...i.value.memoryRefs||[],...i.value.enteringRefs||[]])get(n.nodes,id);for(const id of i.value.planningRefs||[])get(n.planning?.nodes,id);for(const id of i.value.foreshadowRefs||[])get(n.writing?.foreshadows,id);if(i.targetId)get(n.writing?.foreshadows,i.targetId);if(i.value.targetChapterId)get(n.chapters,i.value.targetChapterId);for(const e of i.value.evidence||[])get(n.chapters,e.chapterId);}
   for(const d of i.dependencies){if(!['chapters','nodes','planning','foreshadows','eventOrder'].includes(d.collection)||!safe(d.id))fail('候选引用无效','INVALID_BACKUP');if(d.collection!=='eventOrder'){get(collection(n,d.collection),d.id);if(!Number.isSafeInteger(d.revision))fail('候选版本无效','INVALID_BACKUP');}}
  }
 }
}
export function copyReviews(source,target,maps,shadowIds,eventIds,linkIds){
 if(!source.writing?.reviews)return;target.writing.version=2;target.writing.reviews??={};
 const mapId=(collection,id)=>collection==='eventOrder'?id:(collection==='foreshadows'?shadowIds:maps[collection==='planning'?'planning':collection]).get(id);
 for(const r of Object.values(source.writing.reviews)){
  const copy=clone(r);copy.id=randomUUID();copy.chapterId=maps.chapters.get(r.chapterId);
  for(const i of copy.items){i.dependencies=i.dependencies.map(d=>({...d,id:mapId(d.collection,d.id),revision:d.collection==='eventOrder'?(d.revision===stateOf(source,'eventOrder','events')?stateOf(target,'eventOrder','events'):'stale:'+d.revision):d.revision}));
   if(i.kind==='link')i.nodeId=maps.nodes.get(i.nodeId);
   else {for(const field of ['memoryRefs','enteringRefs'])if(i.value[field])i.value[field]=i.value[field].map(id=>maps.nodes.get(id));if(i.value.planningRefs)i.value.planningRefs=i.value.planningRefs.map(id=>maps.planning.get(id));if(i.value.foreshadowRefs)i.value.foreshadowRefs=i.value.foreshadowRefs.map(id=>shadowIds.get(id));if(i.targetId)i.targetId=shadowIds.get(i.targetId);if(i.value.targetChapterId)i.value.targetChapterId=maps.chapters.get(i.value.targetChapterId);if(i.value.evidence)i.value.evidence=i.value.evidence.map(e=>({...e,chapterId:maps.chapters.get(e.chapterId)}));}
   if(i.result)i.result.id=(i.kind==='link'?linkIds:i.kind==='event'?eventIds:shadowIds).get(i.result.id)||null;
  }
  target.writing.reviews[copy.id]=copy;
 }
}
export function sliceReviews(w,target){let omitted=0;if(!w.reviews)return omitted;w.reviews=Object.fromEntries(Object.entries(w.reviews).filter(([,r])=>{const keep=!!target.chapters[r.chapterId]&&r.items.every(i=>i.dependencies.every(d=>d.collection==='eventOrder'||!!collection({...target,writing:w},d.collection)?.[d.id]));if(!keep)omitted++;return keep;}));return omitted;}
