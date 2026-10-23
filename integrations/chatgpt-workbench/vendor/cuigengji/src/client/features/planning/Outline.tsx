import React,{useEffect,useMemo,useRef,useState} from 'react';
import {chineseNumber,displayNumberedTitle} from '../../../domain/title-numbering.js';
import {Modal} from '../../shared/preferences.tsx';
export interface OutlineChapter {id:string;title:string;summary:string;volumeId:string|null;order:number}
export interface OutlineVolume {id:string;title:string;order:number}
export interface OutlineNode {
 id:string;revision:number;title:string;summary:string;
 scope:'long'|'phase'|'near'|'unspecified';status:'idea'|'selected'|'written'|'dropped';
 parentId:string|null;threads:string[];chapterRefs:{chapterId:string;revision:number}[];memoryRefs:string[];
}
export interface OutlineProps {
 chapters:OutlineChapter[];volumes:OutlineVolume[];nodes:OutlineNode[];
 busy:boolean;numbering?:string;chapterRevisions?:Record<string,number>;
 onChapter:(chapterId:string)=>void;onPlanning:(nodeId:string)=>void;
 onSaveSummary:(chapterId:string,summary:string,expectedRevision:number)=>Promise<boolean|undefined>;
 /** 当前选中的剧情卡；父组件传入后卡片显示 aria-current 高亮。 */
 selectedId?:string|null;
 /** 把剧情卡拖到章节卡上时调用；不传则拖拽整体禁用。 */
 onAssignChapter?:(nodeId:string,chapterId:string)=>void;
 /** 多选若干章节后「合并为篇章」。 */
 onCreatePhase?:(name:string,chapterIds:string[])=>void;
 /** 把选中的剧情卡归入某个剧情阶段。 */
 onMoveToPhase?:(nodeIds:string[],phaseId:string)=>void;
 /** 双击章节卡或菜单「编辑梗概」时通知父组件。 */
 onEditChapterSummary?:(chapterId:string)=>void;
}
/** 卷 → 剧情阶段 → 章节卡 / 剧情规划卡 三层大纲。阶段自身的章节归属由子孙剧情卡的 chapterRefs 反推。 */
interface PhaseInfo {
 id:string;node:OutlineNode;order:number;depth:number;parentPhaseId:string|null;
 chapters:OutlineChapter[];members:OutlineNode[];pending:OutlineNode[];
 volumeKey:string;range:string;childPhases:PhaseInfo[];
}
interface OutlineGroup {key:string;title:string;chapters:OutlineChapter[];topPhases:PhaseInfo[]}
type MenuKind='chapter'|'card';
type MenuState={kind:MenuKind;id:string;x:number;y:number}|null;
type DialogState={kind:'new-phase'}|{kind:'move-phase';nodeIds:string[]}|null;
type CardRenderer=(node:OutlineNode,pending:boolean)=>React.ReactElement;
const statusNames:Record<OutlineNode['status'],string>={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
const UNGROUPED='__ungrouped__';
const LONG_PRESS_MS=520,LONG_PRESS_SLOP=5;
/** 长按、双击、右键都要避开这些原生交互元素，避免抢走输入与勾选。 */
const PRESS_IGNORE='input,textarea,select,button,a,label,[data-outline-no-press]';
const asText=(value:unknown)=>typeof value==='string'?value:'';
const orderValue=(item:{order?:number})=>Number.isFinite(item.order)?item.order as number:0;
const byOrder=(left:{order?:number;title?:string},right:{order?:number;title?:string})=>orderValue(left)-orderValue(right)||asText(left.title).localeCompare(asText(right.title),'zh-CN');
/** 数据来自持久化快照，字段可能缺失或被旧版本写坏，全部按不安全输入处理。 */
const scopeOf=(node:OutlineNode|undefined|null):OutlineNode['scope']=>node&&(node.scope==='long'||node.scope==='phase'||node.scope==='near')?node.scope:'unspecified';
const statusKeyOf=(node:OutlineNode|undefined|null)=>{
 const raw=node?.status;
 return typeof raw==='string'&&Object.prototype.hasOwnProperty.call(statusNames,raw)?raw:'unspecified';
};
const statusLabelOf=(node:OutlineNode|undefined|null)=>{
 const key=statusKeyOf(node);
 return Object.prototype.hasOwnProperty.call(statusNames,key)?statusNames[key as OutlineNode['status']]:'未设定';
};
const domId=(value:unknown)=>asText(value).replace(/[^a-zA-Z0-9_-]+/g,'_')||'item';
const asElement=(target:EventTarget|null):Element|null=>target instanceof Element?target:null;
function chapterRefsOf(node:OutlineNode){return Array.isArray(node.chapterRefs)?node.chapterRefs.filter(ref=>Boolean(ref)&&typeof ref.chapterId==='string'):[];}
/** 广度优先收集子孙节点；seen 兜住 parentId 成环的脏数据。 */
function descendantsOf(rootId:string,childMap:Map<string,OutlineNode[]>):OutlineNode[]{
 const out:OutlineNode[]=[],seen=new Set<string>([rootId]),queue=(childMap.get(rootId)||[]).slice();
 for(let index=0;index<queue.length;index++){
  const node=queue[index];
  if(!node||seen.has(node.id))continue;
  seen.add(node.id);out.push(node);
  const children=childMap.get(node.id);
  if(children)queue.push(...children);
 }
 return out;
}
/** 由近及远的祖先链；同样用 seen 防环。 */
function ancestorChain(id:string,byId:Map<string,OutlineNode>):OutlineNode[]{
 const chain:OutlineNode[]=[],seen=new Set<string>([id]);
 let current=byId.get(id);
 while(current&&typeof current.parentId==='string'){
  if(seen.has(current.parentId))break;
  const parent=byId.get(current.parentId);
  if(!parent)break;
  seen.add(parent.id);chain.push(parent);current=parent;
 }
 return chain;
}
/** 未安排区只在本区内部形成层级；父卡已安排或缺失时，子卡直接列为顶层。 */
function buildForest(items:OutlineNode[]){
 const byId=new Map(items.map(node=>[node.id,node] as const)),children=new Map<string,OutlineNode[]>(),roots:OutlineNode[]=[];
 for(const node of items){const parentId=node.parentId;if(parentId&&parentId!==node.id&&byId.has(parentId)){const list=children.get(parentId);if(list)list.push(node);else children.set(parentId,[node]);}else roots.push(node);}
 const reached=new Set<string>();
 const walk=(node:OutlineNode)=>{if(reached.has(node.id))return;reached.add(node.id);for(const child of children.get(node.id)||[])walk(child);};
 roots.forEach(walk);
 for(const node of items){if(!reached.has(node.id)){roots.push(node);walk(node);}}
 return {roots,children};
}
/** 剧情规划卡：浅黄底 + 左侧色条，与白底章节卡区分；单击打开右侧详情，右键/长按出菜单，可拖到章节卡。 */
function PlanningCard({node,pending,onPlanning,selected,draggable,picked,pickable,onPick}:{
 node:OutlineNode;pending:boolean;onPlanning:(nodeId:string)=>void;selected:boolean;draggable:boolean;picked:boolean;pickable:boolean;onPick:(nodeId:string,checked:boolean)=>void;
}){
 const title=asText(node.title)||'未命名剧情卡',summary=asText(node.summary)||'还没有摘要';
 return <div className={`outline-card-plan${selected?' is-selected':''}${picked?' is-picked':''}`} role="button" tabIndex={0}
  aria-current={selected?'true':undefined} aria-label={`打开剧情卡 ${title}`} title={`${summary}\n单击打开详情，右键或长按更多操作`}
  data-outline-card="card" data-outline-id={node.id} data-outline-node={node.id} draggable={draggable}
  onClick={()=>onPlanning(node.id)}
  onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onPlanning(node.id);}}}>
  <span className="outline-card-plan-head">
   {pickable&&<label className="outline-pick" title="选择剧情卡" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={picked} aria-label={`选择剧情卡 ${title}`} onChange={event=>onPick(node.id,event.target.checked)}/></label>}
   <span className={`outline-status state-${statusKeyOf(node)}`}><i aria-hidden="true"/>{statusLabelOf(node)}</span>
   <span className="outline-card-plan-title">{title}</span>
   {pending&&<span className="outline-card-plan-pending">章节待定</span>}
  </span>
  <span className="outline-card-plan-summary">{summary}</span>
 </div>;
}
function UnplannedBranch({node,childMap,ancestry,renderCard}:{node:OutlineNode;childMap:Map<string,OutlineNode[]>;ancestry:Set<string>;renderCard:CardRenderer}){
 const branch=(childMap.get(node.id)||[]).filter(child=>!ancestry.has(child.id)),next=new Set(ancestry);next.add(node.id);
 return <li className="outline-unplanned-item">
  {renderCard(node,true)}
  {branch.length>0&&<ul className="outline-unplanned-children">{branch.map(child=><UnplannedBranch key={child.id} node={child} childMap={childMap} ancestry={next} renderCard={renderCard}/>)}</ul>}
 </li>;
}
export function Outline({chapters=[],volumes=[],nodes=[],busy,numbering,chapterRevisions,onChapter,onPlanning,onSaveSummary,selectedId,onAssignChapter,onCreatePhase,onMoveToPhase,onEditChapterSummary}:OutlineProps){
 const [query,setQuery]=useState(''),[collapsed,setCollapsed]=useState<Set<string>>(()=>new Set<string>()),[editing,setEditing]=useState<{id:string;draft:string}|null>(null),[savingId,setSavingId]=useState<string|null>(null),[summaryError,setSummaryError]=useState<{id:string;message:string}|null>(null);
 /** 多选：章节合并为篇章、剧情卡归入篇章；父组件没提供对应 props 时勾选入口整体隐藏。 */
 const [pickedChapters,setPickedChapters]=useState<Set<string>>(()=>new Set<string>()),[pickedNodes,setPickedNodes]=useState<Set<string>>(()=>new Set<string>()),[multi,setMulti]=useState(false);
 const [menu,setMenu]=useState<MenuState>(null),[dialog,setDialog]=useState<DialogState>(null),[phaseName,setPhaseName]=useState(''),[movePhaseId,setMovePhaseId]=useState('');
 const [draggingId,setDraggingId]=useState<string|null>(null),[dropChapterId,setDropChapterId]=useState<string|null>(null);
 const saving=useRef<string|null>(null),dropEnabled=Boolean(onAssignChapter),viewRef=useRef<HTMLElement|null>(null);
 /** 长按计时与抑制点击：长按出菜单后，抬手触发的 click 不应再打开详情。 */
 const pressTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),pressStart=useRef({x:0,y:0}),suppressClick=useRef(false);
 const cancelPress=()=>{if(pressTimer.current){clearTimeout(pressTimer.current);pressTimer.current=undefined;}};
 useEffect(()=>cancelPress,[]);
 /** 菜单：点空白、按 Escape 关闭；菜单内部点击不关闭。 */
 useEffect(()=>{
  if(!menu)return;
  const close=(event:PointerEvent)=>{const target=event.target as Element|null;if(target&&target.closest('.outline-menu'))return;setMenu(null);};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(null);};
  document.addEventListener('pointerdown',close,true);
  document.addEventListener('keydown',key);
  return ()=>{document.removeEventListener('pointerdown',close,true);document.removeEventListener('keydown',key);};
 },[menu]);
 const q=query.trim().toLowerCase();
 /** 所有层级都从这一份派生模型里取，避免渲染时重复遍历。 */
 const model=useMemo(()=>{
  const sortedChapters=chapters.filter(Boolean).slice().sort(byOrder);
  const sortedVolumes=volumes.filter(Boolean).slice().sort(byOrder);
  const liveNodes=nodes.filter(Boolean);
  const volumeIds=new Set(sortedVolumes.map(volume=>volume.id));
  const chapterIds=new Set(sortedChapters.map(chapter=>chapter.id));
  const chapterIndex=new Map(sortedChapters.map((chapter,index)=>[chapter.id,index] as const));
  const nodeById=new Map<string,OutlineNode>();
  for(const node of liveNodes)if(typeof node.id==='string'&&!nodeById.has(node.id))nodeById.set(node.id,node);
  const childMap=new Map<string,OutlineNode[]>();
  for(const node of liveNodes){
   const parentId=node.parentId;
   if(typeof parentId!=='string'||parentId===node.id||!nodeById.has(parentId))continue;
   const list=childMap.get(parentId);
   if(list)list.push(node);else childMap.set(parentId,[node]);
  }
  /** 章节 → 关联剧情卡（同一章节可能有多张，同一张也可能跨章节）。 */
  const linked=new Map<string,OutlineNode[]>();
  for(const node of liveNodes){
   if(scopeOf(node)==='phase')continue;
   const seen=new Set<string>();
   for(const ref of chapterRefsOf(node)){
    if(seen.has(ref.chapterId))continue;
    seen.add(ref.chapterId);
    const list=linked.get(ref.chapterId);
    if(list)list.push(node);else linked.set(ref.chapterId,[node]);
   }
  }
  const titleOf=(chapter:OutlineChapter)=>displayNumberedTitle(asText(chapter.title),numbering)||'未命名章节';
  const hit=(...values:unknown[])=>!q||values.some(value=>asText(value).toLowerCase().includes(q));
  const nodeHit=(node:OutlineNode)=>hit(node.title,node.summary);
  const chapterHit=(chapter:OutlineChapter)=>hit(chapter.title,titleOf(chapter),chapter.summary)||(linked.get(chapter.id)||[]).some(nodeHit);
  const phaseNodes=liveNodes.filter(node=>scopeOf(node)==='phase');
  const phaseIds=new Set(phaseNodes.map(node=>node.id));
  /** 只有完全没有有效章节关联的卡片才算「章节待定」。 */
  const unplanned=liveNodes.filter(node=>scopeOf(node)!=='phase'&&chapterRefsOf(node).every(ref=>!chapterIds.has(ref.chapterId)));
  /** 每张剧情卡最近的「剧情阶段」祖先，用于把待定卡挂到最具体的那一层。 */
  const cardOwner=new Map<string,string|null>();
  for(const node of liveNodes){
   if(phaseIds.has(node.id))continue;
   const owner=ancestorChain(node.id,nodeById).find(item=>phaseIds.has(item.id));
   cardOwner.set(node.id,owner?owner.id:null);
  }
  const numeralOf=(chapter:OutlineChapter)=>{
   const match=/第\s*([\d零〇一二两三四五六七八九十百千]+)\s*章/.exec(asText(chapter.title));
   const value=match?match[1]:'';
   if(!value)return chineseNumber((chapterIndex.get(chapter.id)??0)+1);
   return /^\d+$/.test(value)?chineseNumber(Number(value)):value;
  };
  const rangeOf=(list:OutlineChapter[])=>{
   if(!list.length)return '章节待定';
   const first=numeralOf(list[0]),last=numeralOf(list[list.length-1]);
   return first===last?`第${first}章`:`第${first}至第${last}章`;
  };
  const phaseInfos:PhaseInfo[]=phaseNodes.map((node,order)=>{
   const chain=ancestorChain(node.id,nodeById);
   const parentPhaseId=chain.find(item=>phaseIds.has(item.id))?.id??null;
   const depth=chain.filter(item=>phaseIds.has(item.id)).length;
   const descendants=descendantsOf(node.id,childMap);
   const refIds=new Set<string>();
   for(const item of [node,...descendants])for(const ref of chapterRefsOf(item))if(chapterIds.has(ref.chapterId))refIds.add(ref.chapterId);
   const phaseChapters=sortedChapters.filter(chapter=>refIds.has(chapter.id));
   const members=descendants.filter(item=>scopeOf(item)!=='phase');
   const pending=members.filter(item=>chapterRefsOf(item).every(ref=>!chapterIds.has(ref.chapterId)));
   const firstChapter=phaseChapters[0];
   const volumeKey=firstChapter&&typeof firstChapter.volumeId==='string'&&volumeIds.has(firstChapter.volumeId)?firstChapter.volumeId:UNGROUPED;
   return {id:node.id,node,order,depth,parentPhaseId,chapters:phaseChapters,members,pending,volumeKey,range:rangeOf(phaseChapters),childPhases:[] as PhaseInfo[]};
  });
  const phaseInfoById=new Map(phaseInfos.map(info=>[info.id,info] as const));
  for(const info of phaseInfos)info.childPhases=phaseInfos.filter(other=>other.parentPhaseId===info.id&&other.volumeKey===info.volumeKey);
  /** 深层阶段优先认领章节，避免同一章节卡在父子阶段里重复出现。 */
  const chapterPhase=new Map<string,string>();
  for(const info of phaseInfos.slice().sort((left,right)=>right.depth-left.depth||left.order-right.order))for(const chapter of info.chapters)if(!chapterPhase.has(chapter.id))chapterPhase.set(chapter.id,info.id);
  const phaseGroups=new Map<string,PhaseInfo[]>();
  for(const info of phaseInfos){
   const parent=info.parentPhaseId?phaseInfoById.get(info.parentPhaseId):undefined;
   if(parent&&parent.volumeKey===info.volumeKey)continue;
   const list=phaseGroups.get(info.volumeKey);
   if(list)list.push(info);else phaseGroups.set(info.volumeKey,[info]);
  }
  const groups:OutlineGroup[]=sortedVolumes.map(volume=>({key:volume.id,title:displayNumberedTitle(asText(volume.title),numbering)||'未命名卷',chapters:sortedChapters.filter(chapter=>chapter.volumeId===volume.id),topPhases:phaseGroups.get(volume.id)||[]}));
  const ungroupedChapters=sortedChapters.filter(chapter=>!chapter.volumeId||!volumeIds.has(chapter.volumeId));
  const ungroupedPhases=phaseGroups.get(UNGROUPED)||[];
  if(ungroupedChapters.length||ungroupedPhases.length)groups.push({key:UNGROUPED,title:'未分卷',chapters:ungroupedChapters,topPhases:ungroupedPhases});
  /** 兜底：parentId 成环时所有阶段都成不了顶层，把不可达的阶段补回它所属的卷，避免整块消失。 */
  const reachable=new Set<string>();
  const markReachable=(list:PhaseInfo[])=>{for(const info of list){if(reachable.has(info.id))continue;reachable.add(info.id);markReachable(info.childPhases);}};
  for(const group of groups)markReachable(group.topPhases);
  for(const info of phaseInfos){
   if(reachable.has(info.id))continue;
   const group=groups.find(item=>item.key===info.volumeKey);
   if(!group)continue;
   group.topPhases.push(info);markReachable([info]);
  }
  const groupTitleMap=new Map(groups.map(group=>[group.key,group.title] as const));
  const groupHit=(key:string)=>hit(groupTitleMap.get(key)??'');
  /** 搜索时卷/阶段/章节/剧情卡逐层透传命中：卷名命中即整卷全显。 */
  const visibleCache=new Map<string,boolean>(),visiting=new Set<string>();
  const phaseVisible=(info:PhaseInfo):boolean=>{
   const cached=visibleCache.get(info.id);
   if(cached!==undefined)return cached;
   if(visiting.has(info.id))return false;
   visiting.add(info.id);
   const value=groupHit(info.volumeKey)||nodeHit(info.node)||info.chapters.some(chapterHit)||info.pending.some(card=>nodeHit(card))||info.childPhases.some(phaseVisible);
   visiting.delete(info.id);
   visibleCache.set(info.id,value);
   return value;
  };
  const visiblePhaseIds=new Set<string>();
  for(const info of phaseInfos)if(phaseVisible(info))visiblePhaseIds.add(info.id);
  const visibleGroupKeys=new Set<string>();
  for(const group of groups)if(groupHit(group.key)||group.topPhases.some(phaseVisible)||group.chapters.some(chapterHit))visibleGroupKeys.add(group.key);
  /** 章节卡最终落在哪个可见阶段上：所属阶段被搜索过滤时，上提到最近可见的阶段；都没有就退回卷内散落。 */
  const chapterById=new Map(sortedChapters.map(chapter=>[chapter.id,chapter] as const));
  const targetPhaseOfChapter=new Map<string,string>();
  for(const [chapterId,ownerId] of chapterPhase){
   if(!chapterById.has(chapterId))continue;
   let target=visiblePhaseIds.has(ownerId)?ownerId:null;
   if(!target)for(const ancestor of ancestorChain(ownerId,nodeById))if(phaseIds.has(ancestor.id)&&visiblePhaseIds.has(ancestor.id)){target=ancestor.id;break;}
   if(target)targetPhaseOfChapter.set(chapterId,target);
  }
  const chaptersByPhase=new Map<string,OutlineChapter[]>();
  for(const chapter of sortedChapters){
   const target=targetPhaseOfChapter.get(chapter.id);
   if(!target)continue;
   const list=chaptersByPhase.get(target);
   if(list)list.push(chapter);else chaptersByPhase.set(target,[chapter]);
  }
  const absorbedChapterIds=new Set(targetPhaseOfChapter.keys());
  /** 待定剧情卡同理：所属阶段不可见时上提到最近可见阶段，提不上去就落回「未安排」区。 */
  const unplannedIds=new Set(unplanned.map(node=>node.id));
  const targetPhaseOfCard=new Map<string,string>();
  for(const [cardId,ownerId] of cardOwner){
   if(!ownerId||!unplannedIds.has(cardId))continue;
   let target=visiblePhaseIds.has(ownerId)?ownerId:null;
   if(!target)for(const ancestor of ancestorChain(ownerId,nodeById))if(phaseIds.has(ancestor.id)&&visiblePhaseIds.has(ancestor.id)){target=ancestor.id;break;}
   if(target)targetPhaseOfCard.set(cardId,target);
  }
  const pendingByPhase=new Map<string,OutlineNode[]>();
  for(const node of liveNodes){
   const target=targetPhaseOfCard.get(node.id);
   if(!target)continue;
   const list=pendingByPhase.get(target);
   if(list)list.push(node);else pendingByPhase.set(target,[node]);
  }
  const renderedPendingIds=new Set(targetPhaseOfCard.keys());
  return {sortedChapters,liveNodes,phaseNodes,phaseInfos,groups,cardOwner,linked,unplanned,groupHit,nodeHit,chapterHit,visiblePhaseIds,visibleGroupKeys,titleOf,chaptersByPhase,absorbedChapterIds,pendingByPhase,renderedPendingIds};
 },[chapters,volumes,nodes,query,numbering]);
 const {sortedChapters,liveNodes,phaseNodes,phaseInfos,groups,linked,unplanned,groupHit,nodeHit,chapterHit,visiblePhaseIds,visibleGroupKeys,titleOf,chaptersByPhase,absorbedChapterIds,pendingByPhase,renderedPendingIds}=model;
 const chapterTitle=(chapter:OutlineChapter)=>titleOf(chapter);
 const editableOf=(chapter:OutlineChapter)=>typeof chapterRevisions?.[chapter.id]==='number'&&Boolean(chapterRevisions);
 /** 多选只在父组件提供了合并/归入能力时出现，不传 props 时界面保持原样。 */
 const pickEnabled=Boolean(onCreatePhase||onMoveToPhase);
 const cardCount=liveNodes.filter(node=>scopeOf(node)!=='phase').length;
 const isExpanded=(key:string)=>Boolean(q)||!collapsed.has(key);
 const toggleKey=(key:string)=>setCollapsed(old=>{const next=new Set(old);if(next.has(key))next.delete(key);else next.add(key);return next;});
 const allKeys=[...groups.map(group=>`volume:${group.key}`),...phaseInfos.map(info=>`phase:${info.id}`)];
 const anyCollapsed=allKeys.some(key=>collapsed.has(key));
 const toggleAll=()=>setCollapsed(anyCollapsed?new Set<string>():new Set(allKeys));
 const cancelEdit=()=>{setEditing(null);setSummaryError(null);};
 const saveSummary=async(chapter:OutlineChapter)=>{
  const revision=chapterRevisions?.[chapter.id];
  if(typeof revision!=='number'||saving.current||busy)return;
  const next=asText(editing?.draft).trim();
  if(next===asText(chapter.summary).trim()){setEditing(current=>current?.id===chapter.id?null:current);return;}
  saving.current=chapter.id;setSavingId(chapter.id);setSummaryError(null);
  try{
   const saved=await onSaveSummary(chapter.id,next,revision);
   if(saved===true)setEditing(current=>current?.id===chapter.id?null:current);
   else setSummaryError({id:chapter.id,message:'未保存，请重试。'});
  }catch(error){setSummaryError({id:chapter.id,message:error instanceof Error&&error.message?error.message:'未保存，请重试。'});}
  finally{saving.current=null;setSavingId(null);}
 };
 /** 双击章节卡或菜单「编辑梗概」进入内联编辑；父组件传 onEditChapterSummary 时同时通知它。 */
 const beginEdit=(chapter:OutlineChapter)=>{
  if(editing?.id===chapter.id)return;
  onEditChapterSummary?.(chapter.id);
  if(!editableOf(chapter))return;
  setSummaryError(null);setEditing({id:chapter.id,draft:asText(chapter.summary)});
 };
 const pickChapter=(id:string,on:boolean)=>setPickedChapters(old=>{const next=new Set(old);if(on)next.add(id);else next.delete(id);return next;});
 const pickNode=(id:string,on:boolean)=>setPickedNodes(old=>{const next=new Set(old);if(on)next.add(id);else next.delete(id);return next;});
 const pickVolume=(group:OutlineGroup,on:boolean)=>setPickedChapters(old=>{const next=new Set(old);for(const chapter of group.chapters){if(on)next.add(chapter.id);else next.delete(chapter.id);}return next;});
 const clearPicks=()=>{setPickedChapters(new Set<string>());setPickedNodes(new Set<string>());};
 const phaseOptions=phaseNodes.slice().sort(byOrder).map(node=>({id:node.id,title:displayNumberedTitle(asText(node.title),numbering)||'未命名剧情阶段'}));
 /** 右键与长按共用同一个菜单；坐标换算到 .outline-view 内部并夹取，避免被容器裁掉或错位。 */
 const openMenu=(card:Element,x:number,y:number)=>{
  const kind:MenuKind=card.getAttribute('data-outline-card')==='chapter'?'chapter':'card';
  const id=card.getAttribute('data-outline-id')||'';
  if(!id)return;
  const rect=viewRef.current?.getBoundingClientRect();
  const localX=rect?x-rect.left:x,localY=rect?y-rect.top:y;
  const maxX=rect?Math.max(8,rect.width-224):window.innerWidth-224;
  const maxY=rect?Math.max(8,rect.height-244):window.innerHeight-244;
  setMenu({kind,id,x:Math.max(8,Math.min(localX,maxX)),y:Math.max(8,Math.min(localY,maxY))});
 };
 const cardOf=(target:EventTarget|null)=>{
  const element=asElement(target);
  const card=element?.closest('[data-outline-card]');
  return card instanceof Element?card:null;
 };
 const bodyPointerDown=(event:React.PointerEvent)=>{
  /** 每次按下先清掉上次长按留下的抑制标记，避免后续正常点击被吃掉。 */
  suppressClick.current=false;
  const target=asElement(event.target);
  if(!target||target.closest(PRESS_IGNORE))return;
  const card=cardOf(event.target);
  if(!card)return;
  cancelPress();
  pressStart.current={x:event.clientX,y:event.clientY};
  if(event.pointerType==='mouse')return;
  const captured=card;
  pressTimer.current=setTimeout(()=>{pressTimer.current=undefined;suppressClick.current=true;openMenu(captured,pressStart.current.x,pressStart.current.y);},LONG_PRESS_MS);
 };
 const bodyPointerMove=(event:React.PointerEvent)=>{
  if(!pressTimer.current)return;
  if(Math.hypot(event.clientX-pressStart.current.x,event.clientY-pressStart.current.y)>LONG_PRESS_SLOP)cancelPress();
 };
 const bodyContextMenu=(event:React.MouseEvent)=>{
  const target=asElement(event.target);
  /** 输入控件里保留浏览器原生右键菜单，方便复制粘贴。 */
  if(target&&target.closest('input,textarea,select'))return;
  const card=cardOf(event.target);
  cancelPress();
  if(!card)return;
  event.preventDefault();
  openMenu(card,event.clientX,event.clientY);
 };
 /** 长按弹菜单后抬手会补一个 click，这里吃掉它，避免同时打开详情或进入编辑。 */
 const bodyClickCapture=(event:React.MouseEvent)=>{
  if(!suppressClick.current)return;
  suppressClick.current=false;
  event.preventDefault();
  event.stopPropagation();
 };
 const bodyDoubleClick=(event:React.MouseEvent)=>{
  const target=asElement(event.target);
  if(!target||target.closest(PRESS_IGNORE))return;
  const card=cardOf(event.target);
  if(!card||card.getAttribute('data-outline-card')!=='chapter')return;
  const chapter=sortedChapters.find(item=>item.id===card.getAttribute('data-outline-id'));
  if(chapter)beginEdit(chapter);
 };
 const bodyKeyDown=(event:React.KeyboardEvent)=>{
  if(!(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')))return;
  const target=asElement(event.target);
  if(target&&target.closest('input,textarea,select'))return;
  const card=cardOf(event.target);
  if(!card)return;
  event.preventDefault();
  const rect=card.getBoundingClientRect();
  openMenu(card,rect.left+16,rect.top+16);
 };
 /** 拖拽：只认 SVG 指针手势之外的 HTML5 拖放；数据以 state 为准，dataTransfer 兜底。 */
 const bodyDragStart=(event:React.DragEvent)=>{
  if(!dropEnabled)return;
  const card=cardOf(event.target);
  if(!card||!card.getAttribute('data-outline-node'))return;
  const nodeId=card.getAttribute('data-outline-node')||'';
  cancelPress();
  setDraggingId(nodeId);
  if(event.dataTransfer){event.dataTransfer.effectAllowed='move';try{event.dataTransfer.setData('text/plain',nodeId);event.dataTransfer.setData('application/x-outline-node',nodeId);}catch{}}
 };
 const bodyDragOver=(event:React.DragEvent)=>{
  if(!dropEnabled)return;
  /** 只接管大纲自己的卡片拖拽；外部拖进来的文件或文字不触发章节高亮。 */
  const types=event.dataTransfer?Array.from(event.dataTransfer.types):[];
  if(!draggingId&&!types.includes('application/x-outline-node'))return;
  const target=asElement(event.target);
  const chapter=target?.closest('[data-outline-chapter]');
  if(!chapter)return;
  event.preventDefault();
  if(event.dataTransfer)event.dataTransfer.dropEffect='move';
  const chapterId=chapter.getAttribute('data-outline-chapter');
  setDropChapterId(current=>current===chapterId?current:chapterId);
 };
 const bodyDragLeave=(event:React.DragEvent)=>{
  const target=asElement(event.target);
  const chapter=target?.closest('[data-outline-chapter]');
  if(!chapter)return;
  if(chapter.contains(event.relatedTarget as Node|null))return;
  const chapterId=chapter.getAttribute('data-outline-chapter');
  setDropChapterId(current=>current===chapterId?null:current);
 };
 const bodyDrop=(event:React.DragEvent)=>{
  if(!dropEnabled)return;
  const target=asElement(event.target);
  const chapter=target?.closest('[data-outline-chapter]');
  if(!chapter)return;
  event.preventDefault();
  const chapterId=chapter.getAttribute('data-outline-chapter')||'';
  const raw=draggingId||event.dataTransfer?.getData('application/x-outline-node')||'';
  /** 只有确实存在的剧情卡才下落，避免外部拖入的文本误改章节归属。 */
  const nodeId=liveNodes.some(node=>node.id===raw)?raw:'';
  setDropChapterId(null);setDraggingId(null);
  if(nodeId&&chapterId)onAssignChapter?.(nodeId,chapterId);
 };
 const bodyDragEnd=()=>{setDraggingId(null);setDropChapterId(null);};
 const renderCard:CardRenderer=(node,pending)=><PlanningCard key={node.id} node={node} pending={pending} onPlanning={onPlanning} selected={Boolean(selectedId)&&selectedId===node.id} draggable={dropEnabled} picked={pickedNodes.has(node.id)} pickable={multi&&pickEnabled} onPick={pickNode}/>;
 const renderChapter=(chapter:OutlineChapter)=>{
  const chapterNodes=linked.get(chapter.id)||[],shownNodes=chapterNodes.filter(nodeHit),summary=asText(chapter.summary);
  const editable=editableOf(chapter),isEditing=editing?.id===chapter.id,savingThis=savingId===chapter.id,picked=pickedChapters.has(chapter.id);
  return <li className={`outline-chapter${isEditing?' is-editing':''}${picked?' is-picked':''}${dropChapterId===chapter.id?' is-drop-target':''}`} key={chapter.id}
   data-outline-card="chapter" data-outline-id={chapter.id} data-outline-chapter={chapter.id} tabIndex={0} title="双击编辑梗概，右键或长按更多操作"
   onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();beginEdit(chapter);}}}>
   <div className="outline-card-head">
    {multi&&pickEnabled&&<label className="outline-pick" title="选择章节" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={picked} aria-label={`选择章节 ${chapterTitle(chapter)}`} onChange={event=>pickChapter(chapter.id,event.target.checked)}/></label>}
    <span className="outline-card-title">{chapterTitle(chapter)}</span>
    <small className="outline-card-badge" title={`${chapterNodes.length} 张剧情卡关联到本章`}>{chapterNodes.length} 张剧情卡</small>
   </div>
   <div className="outline-summary">
    {isEditing?<div className="outline-summary-edit">
     <textarea autoFocus aria-label={`编辑 ${chapterTitle(chapter)} 的梗概`} value={editing?.draft??''} disabled={savingThis}
      onChange={event=>setEditing(current=>current&&current.id===chapter.id?{...current,draft:event.target.value}:current)}
      onBlur={event=>{const next=event.relatedTarget as Node|null;if(next&&event.currentTarget.parentElement?.contains(next))return;void saveSummary(chapter);}}
      onKeyDown={event=>{if(event.nativeEvent.isComposing)return;if(event.key==='Escape'){event.preventDefault();cancelEdit();return;}if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();void saveSummary(chapter);}}}/>
     <div className="outline-summary-actions"><button type="button" className="primary" disabled={busy||savingThis} onClick={()=>void saveSummary(chapter)}>{savingThis?'保存中…':'保存'}</button><button type="button" disabled={savingThis} onClick={cancelEdit}>取消</button>{summaryError?.id===chapter.id&&<small role="alert" className="outline-summary-error">{summaryError.message}</small>}</div>
    </div>:<>
     <p className={`outline-summary-text${summary?'':' is-empty'}`}>{summary||'还没有梗概'}</p>
     {editable&&<small className="outline-summary-hint">双击可编辑梗概</small>}
    </>}
   </div>
   {shownNodes.length>0&&<ul className="outline-plan-list">{shownNodes.map(node=><li className="outline-plan-item" key={node.id}>{renderCard(node,false)}</li>)}</ul>}
  </li>;
 };
 const renderPhase=(info:PhaseInfo,ancestry:Set<string>=new Set<string>())=>{
  if(ancestry.has(info.id))return null;
  const next=new Set(ancestry);next.add(info.id);
  const panelId=`outline-phase-panel-${domId(info.id)}`,toggleId=`phase:${info.id}`,expanded=isExpanded(toggleId),showAll=groupHit(info.volumeKey);
  const ownChapters=chaptersByPhase.get(info.id)||[];
  const shownChapters=ownChapters.filter(chapter=>showAll||nodeHit(info.node)||chapterHit(chapter));
  const shownCards=(pendingByPhase.get(info.id)||[]).filter(card=>showAll||nodeHit(info.node)||nodeHit(card));
  const shownChildren=info.childPhases.filter(child=>visiblePhaseIds.has(child.id));
  const phaseTitle=displayNumberedTitle(asText(info.node.title),numbering)||'未命名剧情阶段';
  return <section className="outline-phase" key={info.id}>
   <h4 className="outline-phase-head">
    <button type="button" className="outline-phase-toggle" aria-expanded={expanded} aria-controls={expanded?panelId:undefined} onClick={()=>toggleKey(toggleId)}>
     <span className="outline-chevron" aria-hidden="true">›</span>
     <span className="outline-phase-label">剧情阶段</span>
     <span className="outline-phase-title">{phaseTitle}</span>
     <small className={`outline-phase-range${info.chapters.length?'':' is-pending'}`}>{info.range}</small>
     <small className="outline-phase-count">{info.members.length} 张剧情卡</small>
    </button>
   </h4>
   {expanded&&<div className="outline-phase-body" id={panelId}>
    {shownChapters.length>0&&<ul className="outline-chapters">{shownChapters.map(renderChapter)}</ul>}
    {shownCards.length>0&&<ul className="outline-plan-list">{shownCards.map(card=><li className="outline-plan-item" key={card.id}>{renderCard(card,true)}</li>)}</ul>}
    {shownChildren.map(child=>renderPhase(child,next))}
    {shownChapters.length===0&&shownCards.length===0&&shownChildren.length===0&&<p className="outline-phase-empty">{q?'没有匹配的章节或剧情卡':'这一阶段还没有安排章节或剧情卡'}</p>}
   </div>}
  </section>;
 };
 const renderVolume=(group:OutlineGroup)=>{
  const panelId=`outline-volume-panel-${domId(group.key)}`,toggleId=`volume:${group.key}`,expanded=isExpanded(toggleId),showAll=groupHit(group.key);
  const looseChapters=group.chapters.filter(chapter=>!absorbedChapterIds.has(chapter.id));
  const shownLoose=looseChapters.filter(chapter=>showAll||chapterHit(chapter));
  const shownPhases=group.topPhases.filter(info=>visiblePhaseIds.has(info.id));
  const emptyBody=shownPhases.length===0&&shownLoose.length===0;
  const selectedCount=group.chapters.filter(chapter=>pickedChapters.has(chapter.id)).length;
  return <section className="outline-volume" key={group.key}>
   <h3 className="outline-volume-heading">
    {multi&&pickEnabled&&<label className="outline-pick outline-pick-volume" title={`选择${group.title}里的全部章节`} onClick={event=>event.stopPropagation()}><input type="checkbox" aria-label={`选择${group.title}里的全部章节`} disabled={group.chapters.length===0} checked={group.chapters.length>0&&selectedCount===group.chapters.length} ref={element=>{if(element)element.indeterminate=selectedCount>0&&selectedCount<group.chapters.length;}} onChange={event=>pickVolume(group,event.target.checked)}/></label>}
    <button type="button" className="outline-volume-toggle" aria-expanded={expanded} aria-controls={expanded?panelId:undefined} onClick={()=>toggleKey(toggleId)}>
     <span className="outline-chevron" aria-hidden="true">›</span>
     <span className="outline-volume-mark" aria-hidden="true">▤</span>
     <span className="outline-volume-title">{group.title}</span>
     <small className="outline-volume-count">{group.chapters.length} 章</small>
    </button>
   </h3>
   {expanded&&<div className="outline-volume-body" id={panelId}>
    {shownPhases.map(info=>renderPhase(info))}
    {shownLoose.length>0&&<ul className="outline-chapters">{shownLoose.map(renderChapter)}</ul>}
    {emptyBody&&<p className="outline-volume-empty">{q?'没有匹配的章节或剧情卡':'这一卷还没有章节'}</p>}
   </div>}
  </section>;
 };
 const freeUnplanned=unplanned.filter(node=>!renderedPendingIds.has(node.id));
 const freeUnplannedVisible=freeUnplanned.filter(nodeHit);
 const freeUnplannedForest=buildForest(freeUnplannedVisible);
 const visibleGroups=groups.filter(group=>visibleGroupKeys.has(group.key));
 const empty=sortedChapters.length===0&&liveNodes.length===0;
 const noResults=Boolean(q)&&visibleGroups.length===0&&freeUnplanned.length===0;
 const menuChapter=menu&&menu.kind==='chapter'?sortedChapters.find(chapter=>chapter.id===menu.id):undefined;
 const menuNode=menu&&menu.kind==='card'?liveNodes.find(node=>node.id===menu.id):undefined;
 const confirmCreatePhase=()=>{
  const name=phaseName.trim();
  if(!name||!onCreatePhase)return;
  const ids=[...pickedChapters].filter(id=>sortedChapters.some(chapter=>chapter.id===id));
  if(!ids.length)return;
  onCreatePhase(name,ids);
  setDialog(null);setPhaseName('');setPickedChapters(new Set<string>());
 };
 const openMovePhase=(nodeIds:string[])=>{
  if(!onMoveToPhase||phaseOptions.length===0)return;
  setMovePhaseId(phaseOptions[0].id);setDialog({kind:'move-phase',nodeIds});
 };
 const confirmMovePhase=(nodeIds:string[])=>{
  if(!onMoveToPhase||!movePhaseId)return;
  onMoveToPhase(nodeIds,movePhaseId);
  setDialog(null);setPickedNodes(new Set<string>());
 };
 if(empty)return <section className="outline-view" aria-label="大纲" ref={viewRef}><p className="empty">从新建章节或剧情卡开始，这里会自动按卷、剧情阶段、章节排布</p></section>;
 return <section ref={viewRef} className={`outline-view${multi&&pickEnabled?' pick-on':''}${draggingId?' is-dragging':''}`} aria-label="大纲">
  <div className="outline-toolbar">
   <input type="search" className="outline-search" aria-label="搜索大纲" placeholder="搜索章节标题、梗概或剧情卡" value={query} onChange={event=>setQuery(event.target.value)}/>
   <button type="button" className="outline-toggle-all" disabled={allKeys.length===0} onClick={toggleAll}>{anyCollapsed?'全部展开':'全部折叠'}</button>
   {pickEnabled&&<button type="button" className="outline-multi-toggle" aria-pressed={multi} onClick={()=>{setMulti(value=>!value);setPickedChapters(new Set());setPickedNodes(new Set());}}>多选</button>}
   <small className="outline-stats">{sortedChapters.length} 章 · {cardCount} 张剧情卡 · {phaseNodes.length} 个剧情阶段 · {unplanned.length} 张章节待定</small>
  </div>
  {pickEnabled&&(pickedChapters.size>0||pickedNodes.size>0)&&<div className="outline-selection-bar" role="region" aria-label="多选操作">
   <small className="outline-selection-count">已选 {pickedChapters.size} 个章节 · {pickedNodes.size} 张剧情卡</small>
   <div className="outline-selection-actions">
    {pickedChapters.size>0&&onCreatePhase&&<button type="button" className="primary" onClick={()=>{setPhaseName('');setDialog({kind:'new-phase'});}}>合并为篇章</button>}
    {pickedNodes.size>0&&onMoveToPhase&&<button type="button" disabled={phaseOptions.length===0} title={phaseOptions.length===0?'还没有剧情阶段可以归入':undefined} onClick={()=>openMovePhase([...pickedNodes])}>归入篇章</button>}
    <button type="button" onClick={clearPicks}>清除选择</button>
   </div>
  </div>}
  <div className="outline-body" onPointerDown={bodyPointerDown} onPointerMove={bodyPointerMove} onPointerUp={cancelPress} onPointerCancel={cancelPress}
   onContextMenu={bodyContextMenu} onClickCapture={bodyClickCapture} onDoubleClick={bodyDoubleClick} onKeyDown={bodyKeyDown}
   onDragStart={bodyDragStart} onDragOver={bodyDragOver} onDragLeave={bodyDragLeave} onDrop={bodyDrop} onDragEnd={bodyDragEnd}>
   {visibleGroups.map(renderVolume)}
   {freeUnplanned.length>0&&<section className="outline-unplanned" aria-label="未安排的剧情卡">
    <header className="outline-unplanned-head"><h3>未安排</h3><p>这些剧情卡还没有安排到具体章节，也不属于任何剧情阶段{dropEnabled?'；拖到上方章节卡即可安排':''}</p></header>
    {freeUnplannedVisible.length>0?<ul className="outline-unplanned-list">{freeUnplannedForest.roots.map(node=><UnplannedBranch key={node.id} node={node} childMap={freeUnplannedForest.children} ancestry={new Set<string>()} renderCard={renderCard}/>)}</ul>:<p className="empty">没有匹配的剧情卡</p>}
   </section>}
   {noResults&&<p className="empty">没有匹配的大纲内容，试试调整搜索词。</p>}
  </div>
  {menu&&<div className="outline-menu" role="menu" aria-label="大纲操作" style={{left:menu.x,top:menu.y}}>
   <p className="outline-menu-title">{menu.kind==='chapter'?(menuChapter?chapterTitle(menuChapter):'章节'):(asText(menuNode?.title)||'剧情卡')}</p>
   {menu.kind==='chapter'&&menuChapter?<>
    <button type="button" role="menuitem" disabled={!editableOf(menuChapter)&&!onEditChapterSummary} onClick={()=>{beginEdit(menuChapter);setMenu(null);}}>编辑梗概</button>
    <button type="button" role="menuitem" onClick={()=>{setMenu(null);onChapter(menuChapter.id);}}>打开正文</button>
    {pickEnabled&&<><hr/><button type="button" role="menuitem" onClick={()=>{pickChapter(menuChapter.id,!pickedChapters.has(menuChapter.id));setMenu(null);}}>{pickedChapters.has(menuChapter.id)?'取消选中章节':'选中此章节'}</button></>}
   </>:menuNode?<>
    <button type="button" role="menuitem" onClick={()=>{setMenu(null);onPlanning(menuNode.id);}}>编辑剧情卡</button>
    {onMoveToPhase&&<button type="button" role="menuitem" disabled={phaseOptions.length===0} onClick={()=>{setMenu(null);openMovePhase([menuNode.id]);}}>归入篇章…</button>}
    {pickEnabled&&<><hr/><button type="button" role="menuitem" onClick={()=>{pickNode(menuNode.id,!pickedNodes.has(menuNode.id));setMenu(null);}}>{pickedNodes.has(menuNode.id)?'取消选中剧情卡':'选中此剧情卡'}</button></>}
   </>:<p className="outline-menu-title">这张卡已经更新，请重新操作</p>}
  </div>}
  {dialog?.kind==='new-phase'&&<Modal title="合并为篇章" close={()=>setDialog(null)}>
   <div className="outline-dialog">
    <p className="outline-dialog-note">把选中的 {pickedChapters.size} 个章节合并为一个篇章。正文、章节顺序和大纲层级都不变，只在大纲里归组。</p>
    <label>篇章名称<input autoFocus value={phaseName} placeholder="例如：第一篇章 · 觉醒" onChange={event=>setPhaseName(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();confirmCreatePhase();}}}/></label>
    <div className="outline-dialog-actions"><button type="button" className="primary" disabled={!phaseName.trim()||pickedChapters.size===0} onClick={confirmCreatePhase}>确认合并</button><button type="button" onClick={()=>setDialog(null)}>取消</button></div>
   </div>
  </Modal>}
  {dialog?.kind==='move-phase'&&<Modal title="归入篇章" close={()=>setDialog(null)}>
   <div className="outline-dialog">
    <p className="outline-dialog-note">把选中的 {dialog.nodeIds.length} 张剧情卡归入下面的剧情阶段；章节关联与正文不受影响。</p>
    <label>目标篇章<select value={movePhaseId} onChange={event=>setMovePhaseId(event.target.value)}>{phaseOptions.map(option=><option key={option.id} value={option.id}>{option.title}</option>)}</select></label>
    <div className="outline-dialog-actions"><button type="button" className="primary" disabled={!movePhaseId} onClick={()=>confirmMovePhase(dialog.nodeIds)}>确认归入</button><button type="button" onClick={()=>setDialog(null)}>取消</button></div>
   </div>
  </Modal>}
 </section>;
}
