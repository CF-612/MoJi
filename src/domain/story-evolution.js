import {calendarDate,narrationCompare} from './story-workspace.js';
// Canonical story records. Graph projections never modify the underlying edges.
const clone=structuredClone;
const fail=(message,code='INVALID_WRITING')=>{throw Object.assign(new Error(message),{code});};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const get=(map,id,label)=>typeof id==='string'&&Object.hasOwn(map||{},id)?map[id]:fail(`${label}不存在`,'NOT_FOUND');
const text=(v,label,required=false)=>{if(typeof v!=='string'||v.length>20000||required&&!v.trim())fail(`${label}无效`);return v;};
const active=map=>Object.values(map||{}).filter(v=>!v.deleted);
export const relationCategories={other:'其他',family:'亲属',partner:'伙伴',enemy:'敌对',mentor:'师生',affiliation:'归属'};
const refs=(ids,map,label)=>{if(!Array.isArray(ids)||ids.length>100||new Set(ids).size!==ids.length)fail(`${label}无效`);ids.forEach(id=>get(map,id,label));return clone(ids);};
const eventOrder=(a,b)=>a.order-b.order||a.id.localeCompare(b.id);
function chapterRanks(n){const volumes=active(n.volumes).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)),rank=id=>!id?volumes.length:volumes.findIndex(v=>v.id===id);return new Map(active(n.chapters).sort((a,b)=>rank(a.volumeId)-rank(b.volumeId)||a.order-b.order||a.id.localeCompare(b.id)).map((c,i)=>[c.id,i]));}
function checkedEvent(n,w,v){
 v={...v,chapterRefs:v.chapterRefs===undefined?[]:v.chapterRefs};
 if(!Number.isFinite(v.order))fail('故事排序需要明确数字');
 if(v.storyDate&&!calendarDate(v.storyDate))fail('故事日期请使用有效的 YYYY-MM-DD；不确定可留空');
 if(v.narrationOrder!==undefined&&v.narrationOrder!==null&&!Number.isFinite(v.narrationOrder))fail('计划叙述排序无效');
 if(!['linear','flashback','insert','background'].includes(v.narrativeKind))fail('叙述类型无效');
 if(!Array.isArray(v.chapterRefs)||v.chapterRefs.length>200)fail('事件章节引用无效');
 const chapterRefs=v.chapterRefs.map(r=>{if(!object(r))fail('事件章节引用无效');const ch=get(n.chapters,r.chapterId,'章节'),version=ch.versions.find(x=>x.revision===r.revision);if(!version)fail('章节版本不存在');const quote=text(r.evidence||'','事件正文依据');if(quote.length>2000||quote&&!version.content.includes(quote))fail('事件依据不在指定的已保存正文中');return {chapterId:ch.id,revision:version.revision,evidence:quote};});
 const chapterOrders=v.chapterOrders??{};
 if(!object(chapterOrders)||Object.keys(chapterOrders).length>200)fail('章节内事件排序无效');
 for(const [id,order]of Object.entries(chapterOrders)){get(n.chapters,id,'排序章节');if(!chapterRefs.some(r=>r.chapterId===id)||!Number.isFinite(order))fail('章节内事件排序需要明确数字和章节呈现');}
 const keptOrders=Object.fromEntries(Object.entries(chapterOrders).filter(([id])=>chapterRefs.some(r=>r.chapterId===id)));
 return {title:text(v.title,'事件名称',true),storyTime:text(v.storyTime||'','故事时间'),storyDate:v.storyDate||'',plannedChapter:text(v.plannedChapter||'','计划卷章'),narrationOrder:v.narrationOrder??null,chapterOrders:keptOrders,planned:!!v.planned,enteringRefs:refs(v.enteringRefs||[],n.nodes,'进入故事资料'),order:v.order,narrativeKind:v.narrativeKind,content:text(v.content||'','事件说明'),chapterRefs,memoryRefs:refs(v.memoryRefs||[],n.nodes,'关联资料'),planningRefs:refs(v.planningRefs||[],n.planning?.nodes||n.plan?.nodes,'关联规划'),foreshadowRefs:refs(v.foreshadowRefs||[],w.foreshadows,'关联伏笔'),deleted:!!v.deleted};
}
function refView(n,r){const ch=n.chapters[r.chapterId],version=ch?.versions.find(v=>v.revision===r.revision);return {...r,title:ch?.title||'缺失章节',excluded:!!ch?.deleted,review:!!ch&&!ch.deleted&&ch.contentHash!==version?.contentHash};}
export function eventView(n,e){const {versions,...current}=e;return {...clone(current),chapterRefs:e.chapterRefs.map(r=>refView(n,r)),review:e.chapterRefs.some(r=>refView(n,r).review)};}
export function storyEvents(n,w,args={}){
 const ranks=chapterRanks(n),items=(args.includeDeleted?Object.values(w.events||{}):active(w.events)).filter(e=>(!args.nodeId||e.memoryRefs.includes(args.nodeId))&&(!args.chapterId||e.chapterRefs.some(r=>r.chapterId===args.chapterId&&!n.chapters[r.chapterId]?.deleted)));
 if(args.view==='narration'){
  const rows=items.flatMap(e=>{const kept=e.chapterRefs.filter(r=>ranks.has(r.chapterId));return kept.length?kept.map(r=>({...eventView(n,e),narratedIn:refView(n,r)})):[{...eventView(n,e),narratedIn:null}];});
  return rows.sort((a,b)=>(ranks.get(a.narratedIn?.chapterId)??Infinity)-(ranks.get(b.narratedIn?.chapterId)??Infinity)||narrationCompare(a,b,a.narratedIn?.chapterId));
 }
 return items.sort(eventOrder).map(e=>eventView(n,e));
}
function checkedChange(n,w,v){
 get(n.edges,v.edgeId,'基础关系');get(w.events,v.eventId,'阶段事件');if(!object(v.value))fail('关系阶段状态无效');
 const value={name:text(v.value.name||'','关系名称'),content:text(v.value.content||'','关系说明'),category:v.value.category||'other',style:v.value.style||'solid',active:v.value.active!==false};
 if(!Object.hasOwn(relationCategories,value.category)||!['solid','dashed','dotted'].includes(value.style))fail('关系类别或线型无效');
 return {edgeId:v.edgeId,eventId:v.eventId,value,deleted:!!v.deleted};
}
export function stageRelations(n,w,args={}){
 const phase=args.phase||'latest';if(!['base','latest','event'].includes(phase))fail('关系阶段无效');
 const events=active(w.events).sort(eventOrder),rank=new Map(events.map((e,i)=>[e.id,i]));
 if(phase==='event'&&!rank.has(args.eventId))fail('请选择一个有效事件阶段');
 const changes=active(w.relationshipChanges).filter(c=>rank.has(c.eventId)&&(w.events[args.eventId]?.planned||!w.events[c.eventId].planned)).sort((a,b)=>rank.get(a.eventId)-rank.get(b.eventId)||a.id.localeCompare(b.id));
 return active(n.edges).filter(e=>!n.nodes[e.from]?.deleted&&!n.nodes[e.to]?.deleted&&(!args.nodeId||[e.from,e.to].includes(args.nodeId))).map(e=>{
  const applied=phase==='base'?[]:changes.filter(c=>c.edgeId===e.id&&(phase==='latest'||rank.get(c.eventId)<=rank.get(args.eventId)));
  const last=applied.at(-1);return {...clone(e),category:e.category||'other',style:e.style||'solid',active:e.baseActive!==false,...last?.value,stageEventId:last?.eventId||null,stageChangeId:last?.id||null,baseRevision:e.revision};
 });
}
export function changeView(n,w,c){const edge=n.edges[c.edgeId],event=w.events?.[c.eventId],{versions,...current}=c;return {...clone(current),eventTitle:event?.title||'缺失事件',storyTime:event?.storyTime||'',order:event?.order,from:edge?.from,to:edge?.to,excluded:!!edge?.deleted||!!event?.deleted||!!n.nodes[edge?.from]?.deleted||!!n.nodes[edge?.to]?.deleted};}
export function readEvolution(n,w,action,a){
 if(action==='writing.event.list')return {value:storyEvents(n,w,a)};
 if(action==='writing.event.get')return {value:eventView(n,get(w.events,a.id,'事件'))};
 if(action==='writing.relationship.list')return {value:stageRelations(n,w,a)};
 if(action==='writing.relationshipChange.list')return {value:(a.includeDeleted?Object.values(w.relationshipChanges||{}):active(w.relationshipChanges)).filter(c=>(!a.edgeId||c.edgeId===a.edgeId)&&(!a.eventId||c.eventId===a.eventId)&&(!a.nodeId||[n.edges[c.edgeId]?.from,n.edges[c.edgeId]?.to].includes(a.nodeId))).map(c=>changeView(n,w,c)).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))};
 return null;
}
export function changeEvolution(n,w,action,a,source,reason,save,cas,uuid){
 const event=action.startsWith('writing.event.'),relationship=action.startsWith('writing.relationshipChange.');
 if(!event&&!relationship)return null;
 const collection=event?'events':'relationshipChanges';w[collection]??={};
 const operation=action.split('.').at(-1);if(!['create','update','delete'].includes(operation))fail('不支持的时间线操作');
 const old=operation==='create'?null:get(w[collection],a.id,event?'事件':'关系变化');cas(old,a.expectedRevision??(operation==='create'?0:undefined));
 if(a.confirmed!==true)fail('事件与关系事实需要作者确认','CONFIRM_REQUIRED');
 const value=operation==='delete'?{...old,deleted:true}:{...old,...a.value};
 if(event&&operation==='update'&&Array.isArray(a.value?.chapterRefs))value.chapterOrders=Object.fromEntries(Object.entries(value.chapterOrders||{}).filter(([id])=>value.chapterRefs.some(r=>r.chapterId===id)));
 if(operation!=='delete'){
  if(event){
   for(const id of [...value.memoryRefs||[],...value.enteringRefs||[]])if(get(n.nodes,id,'资料').deleted&&![...old?.memoryRefs||[],...old?.enteringRefs||[]].includes(id))fail('不能新关联已删除资料');
   for(const id of value.enteringRefs||[])if(active(w.events).some(e=>e.id!==old?.id&&e.enteringRefs?.includes(id)))fail('资料已有进入位置，请先从原事件取消进入关联');
   for(const r of value.chapterRefs||[])if(get(n.chapters,r.chapterId,'章节').deleted&&!old?.chapterRefs.some(previous=>previous.chapterId===r.chapterId&&previous.revision===r.revision&&(previous.evidence||'')===(r.evidence||'')))fail('不能新关联已删除章节');
   for(const id of value.planningRefs||[])if(get(n.planning?.nodes||n.plan?.nodes,id,'规划').deleted&&!old?.planningRefs.includes(id))fail('不能新关联已删除规划');
  }
  else {if(get(w.events,value.eventId,'事件').deleted||get(n.edges,value.edgeId,'基础关系').deleted)fail('不能记录已删除事件或关系的变化');const duplicate=active(w.relationshipChanges).find(c=>c.id!==old?.id&&c.edgeId===value.edgeId&&c.eventId===value.eventId);if(duplicate)fail('此事件已经有这条关系的变化，请修改现有记录');}
 }
 const fields=event?checkedEvent(n,w,value):checkedChange(n,w,value);
 return {value:save(w[collection],old?.id||uuid(),fields,old,source,reason)};
}
export function validateEvolution(n,w){
 for(const key of ['events','relationshipChanges']){
  if(w[key]===undefined)continue;if(!object(w[key]))fail('时间线格式无效','INVALID_BACKUP');
  for(const [id,r]of Object.entries(w[key])){
   if(!id||['__proto__','constructor','prototype'].includes(id)||id.length>=160||!object(r)||r.id!==id||!Number.isSafeInteger(r.revision)||r.revision<1||!Array.isArray(r.versions)||typeof r.deleted!=='boolean')fail('时间线记录与历史无效','INVALID_BACKUP');
   (key==='events'?checkedEvent(n,w,r):checkedChange(n,w,r));
   // Historical references must survive export/copy/restore as well.
   for(const v of r.versions){if(!object(v)||!Number.isSafeInteger(v.revision)||v.revision<1||!object(v.value)||v.value.id!==id)fail('时间线历史无效','INVALID_BACKUP');(key==='events'?checkedEvent(n,w,v.value):checkedChange(n,w,v.value));}
  }
 }
 const seen=new Set();for(const c of active(w.relationshipChanges)){const key=JSON.stringify([c.edgeId,c.eventId]);if(seen.has(key))fail('同一事件的关系变化重复','INVALID_BACKUP');seen.add(key);}
 const entered=new Set();for(const e of active(w.events))for(const id of e.enteringRefs||[]){if(entered.has(id))fail('资料进入位置重复','INVALID_BACKUP');entered.add(id);}
}
export function copyEvolution(w,to,maps,uuid,foreshadowIds){
 const eventIds=new Map(Object.keys(w.events||{}).map(id=>[id,uuid()]));to.events??={};to.relationshipChanges??={};
 const record=(r,convert)=>({...convert(clone(r)),versions:r.versions.map(v=>({...v,value:convert(clone(v.value))}))});
 for(const e of Object.values(w.events||{})){const id=eventIds.get(e.id);to.events[id]=record(e,v=>({...v,id,chapterOrders:Object.fromEntries(Object.entries(v.chapterOrders||{}).map(([id,order])=>[maps.chapters.get(id),order])),enteringRefs:(v.enteringRefs||[]).map(id=>maps.nodes.get(id)),memoryRefs:v.memoryRefs.map(id=>maps.nodes.get(id)),chapterRefs:v.chapterRefs.map(r=>({...r,chapterId:maps.chapters.get(r.chapterId)})),planningRefs:v.planningRefs.map(id=>maps.planning.get(id)),foreshadowRefs:v.foreshadowRefs.map(id=>foreshadowIds.get(id))}));}
 for(const c of Object.values(w.relationshipChanges||{})){const id=uuid();to.relationshipChanges[id]=record(c,v=>({...v,id,eventId:eventIds.get(v.eventId),edgeId:maps.edges.get(v.edgeId)}));}
 return eventIds;
}
export function sliceEvolution(w,target){
 let omitted=0;const complete=e=>[...e.memoryRefs,...e.enteringRefs||[]].every(id=>Object.hasOwn(target.nodes,id))&&e.chapterRefs.every(r=>Object.hasOwn(target.chapters,r.chapterId))&&e.planningRefs.every(id=>Object.hasOwn(target.planning?.nodes||{},id))&&e.foreshadowRefs.every(id=>Object.hasOwn(w.foreshadows,id));
 w.events=Object.fromEntries(Object.entries(w.events||{}).filter(([,e])=>{const keep=complete(e)&&e.versions.every(v=>complete(v.value));if(!keep)omitted++;return keep;}));
 const included=c=>Object.hasOwn(target.edges,c.edgeId)&&Object.hasOwn(w.events,c.eventId);
 w.relationshipChanges=Object.fromEntries(Object.entries(w.relationshipChanges||{}).filter(([,c])=>{const keep=included(c)&&c.versions.every(v=>included(v.value));if(!keep)omitted++;return keep;}));return omitted;
}
