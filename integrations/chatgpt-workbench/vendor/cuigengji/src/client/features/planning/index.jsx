import {displayNumberedTitle} from '../../../domain/title-numbering.js';
import {ShadowEditorLoader} from '../structure/StoryStage.jsx';
import {WorkspaceTools,WorkspaceNavigation} from '../../shared/WorkspaceTools.tsx';
import {ToolSheet,ToolMenu,ToolPanel} from '../../shared/ToolSheet.tsx';
import {TextDiff,DiffDisclosure} from '../../shared/TextDiff.jsx';
import {MarkdownText,MarkdownField} from '../../shared/MarkdownText.jsx';
import {CanvasDraft} from './CanvasDraft.tsx';
import {Modal} from '../../shared/preferences.tsx';
import {CardQuickSettings} from '../../shared/CardQuickSettings.tsx';
import {CardQuickButton,CardLegend} from '../../shared/card-appearance.tsx';
import {ReferenceButton} from '../../shared/collaboration.tsx';
import {OverviewPage,DetailActions,useDetailTrail} from '../../shared/detail-page.tsx';
import {CanvasInspector} from '../../shared/CanvasInspector.tsx';
import {SearchControl} from '../../shared/workspace.tsx';
import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {Groups, GroupSelect, filterGroup} from '../../shared/groups.tsx';
import {BatchManager,BatchList} from '../../shared/batch-management.tsx';
import {useModules,ModulePage} from '../../modules/index.tsx';
import React,{useEffect,useRef,useState} from 'react';
import {useResource,useDraft,usePreference} from '../../shared/state.js';
import {ResourceState,SaveBar,saveShortcut} from '../../shared/ui.jsx';
import {useDialog} from '../../dialog.tsx';
import {ChapterEvidence} from '../../shared/evidence.jsx';
import {PlanningPages} from './Pages.tsx';
import {Outline} from './Outline.tsx';
import {CastPicker} from '../../shared/CastPicker.tsx';
import {Foreshadows} from '../structure/Foreshadows.jsx';
import {newDecoration} from './Decorations.tsx';
import {readPlanningSnapshot,readDecorations} from './data.js';
import {PlanningCanvas} from './Canvas.tsx';
import {PlanningTabs,PlanningTabPanel,PlanningTimeSection,PlanningCastSection,PlanningForeshadowSection,PlanningPlotSection} from './PlanningSections.tsx';
import {Icon} from '../../shared/icons.tsx';
const statusNames={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
const scopeNames={long:'长期',phase:'阶段',near:'近期',unspecified:'未指定'};
const edgeNames={next:'剧情推进',requires:'依赖铺垫',alternative:'备选分支'};
export function Planning({call,novelId,tick,run,busy,onChapter,onMemory,onTransfer,onEvent,onPlanning,onCreateMemory}) {
 const modules=useModules();
 const [trackMode,setTrackMode]=usePreference(`${novelId}:timeline-view`,'narration');
 const [timelineRequest,setTimelineRequest]=useState(null);
 const [trackFilter,setTrackFilter]=usePreference(`${novelId}:timeline-filter`,'all'),[trackZoom,setTrackZoom]=usePreference(`${novelId}:timeline-zoom`,100),[focusShadow,setFocusShadow]=usePreference(`${novelId}:foreshadow-selected`,null);
 const availableKinds=['event','person',...(modules.foreshadow?['foreshadow']:[])],shownKinds=(Array.isArray(trackFilter)?trackFilter:trackFilter==='all'?availableKinds:[trackFilter]).filter(k=>availableKinds.includes(k));
 const {preferences}=useWorkbenchPreferences();
 const [quick,setQuick]=useState(null),[area,setArea]=usePreference(`${novelId}:planning-area`,preferences.planningView==='canvas'?'scenes':'narration');
 const [,setTimelineCreate]=usePreference(`${novelId}:timeline-create`,false),[,setTimelineContext]=usePreference(`${novelId}:timeline-new-context`,null);
 const canvas=useRef(null),batchView=useRef(area);
 const [creating,setCreating]=useState(null),[created,setCreated]=useState(null),[batch,setBatch]=useState(false);
 const [parent,setParent]=usePreference(`${novelId}:planning-parent`,null),[selected,setSelected]=usePreference(`${novelId}:planning-selected`,null),[query,setQuery]=useState(''),[filter,setFilter]=useState(''),[thread,setThread]=useState(''),[group,setGroup]=useState(''),[checked,setChecked]=useState([]),[poll,setPoll]=useState(0),[historyOpen,setHistoryOpen]=useState(false),[changes,setChanges]=useState(null);
 useEffect(()=>{if(!modules.timeline&&area==='narration')setArea('scenes');if(!modules.foreshadow&&area==='foreshadow')setArea('scenes');},[modules.timeline,modules.foreshadow,area]);
 const showCanvas=()=>setArea('scenes');
 const {ask,confirm}=useDialog();
 const [pageId,setPageId]=usePreference(`${novelId}:planning-page`,'');
 const [decoration,setDecoration]=useState(null);
 const resource=useResource(()=>Promise.all([readPlanningSnapshot(call,novelId,modules.pages?{pageId:pageId||null}:{}),call('planning.groups',{novelId}),call('planning.pages',{novelId}),readDecorations(call,novelId,modules.pages?pageId||null:undefined)]).then(values=>[...values,pageId]),[call,novelId,tick,poll,pageId,modules.pages],`${novelId}:planning:${modules.pages?pageId:'all'}`);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},4000);return()=>clearInterval(timer);},[]);
 const pageReady=resource.value?.[4]===pageId;
 const [written,setWritten]=useState(null);
 useEffect(()=>{setWritten(null);if(!modules.pages)setPageId('');},[modules.pages]);
 useEffect(()=>{if(!modules.groups)setGroup('');},[modules.groups]);
 const projection=written?.pageId===pageId&&written.snapshot.sequence>=(pageReady?resource.value?.[0]?.sequence||0:0)?written:null;
 const snapshot=projection?.snapshot||(pageReady&&resource.value?.[0]);
 const nodes=snapshot?.items||[],edges=snapshot?.edges||[];
 useEffect(()=>{if(pageId&&resource.error?.includes('规划页面不存在')){setPageId('');setSelected(null);}},[resource.error,pageId]);
 const groups=resource.value?.[1]||[];
 const pages=resource.value?.[2]||[],decorations=projection?.decorations||(pageReady&&resource.value?.[3])||[];
 // 出场人物头像组与选择器共用的人物卡索引；只取角色卡，避免世界书混进头像。
 const peopleResource=useResource(()=>call('graph.list',{novelId}),[call,novelId,tick],`${novelId}:planning-people`);
 const people=(peopleResource.value||[]).filter(n=>n&&n.type==='character_card').map(n=>({id:n.id,name:n.name,type:n.type,avatarImage:n.avatarImage,summary:n.summary||''}));
 // 大纲视图按需加载章节与卷；摘要编辑需要章节 revision 做版本检查。
 const outlineResource=useResource(()=>area==='outline'?Promise.all([call('chapter.list',{novelId}),call('volume.list',{novelId})]):Promise.resolve(null),[call,novelId,tick,area],`${novelId}:planning-outline`);
 const [outlineChapters=[],outlineVolumes=[]]=outlineResource.value||[];
 const chapterRevisions=Object.fromEntries(outlineChapters.filter(c=>Number.isSafeInteger(c?.revision)).map(c=>[c.id,c.revision]));
 const saveChapterSummary=(chapterId,summary,expectedRevision)=>run(async()=>{await call('chapter.update',{novelId,chapterId,expectedRevision,summary});setPoll(n=>n+1);return true;});
 // 大纲：把剧情卡拖到章节＝写入该卡的章节引用。
 const assignOutlineChapter=(nodeId,chapterId)=>run(async()=>{
  const node=(await call('planning.get',{novelId,nodeId})).node,chapter=outlineChapters.find(c=>c.id===chapterId);
  await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'把剧情卡安排到大纲章节',operations:[{op:'node.update',id:nodeId,expectedRevision:node.revision,value:{chapterRefs:[{chapterId,revision:chapter?.revision||1}]}}]});
  await refreshWritten();setPoll(n=>n+1);return true;
 });
 // 大纲：把若干章节合并成剧情阶段，并把已关联这些章节的剧情卡挂到该阶段下。
 const mergeChaptersIntoPhase=(name,chapterIds)=>run(async()=>{
  const ids=new Set(chapterIds),children=nodes.filter(n=>(n.chapterRefs||[]).some(ref=>ids.has(ref.chapterId)));
  const operations=[{op:'node.create',ref:'phase',value:{title:name,summary:`由 ${chapterIds.length} 章合并出的剧情阶段`,scope:'phase'}},...children.map(n=>({op:'node.update',id:n.id,expectedRevision:n.revision,value:{parentId:'phase'}}))];
  await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:`合并 ${chapterIds.length} 章为篇章`,operations});
  await refreshWritten();setPoll(n=>n+1);return true;
 });
 // 大纲：把选中的剧情卡归入某个剧情阶段。
 const moveCardsToPhase=(nodeIds,phaseId)=>run(async()=>{
  await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'归入剧情阶段',operations:nodeIds.map(id=>({op:'node.update',id,expectedRevision:nodes.find(n=>n.id===id)?.revision,value:{parentId:phaseId}}))});
  await refreshWritten();setPoll(n=>n+1);return true;
 });
 const [castList,setCastList]=useState(null);const [castFilter,setCastFilter]=useState('');
 const [seen,setSeen]=usePreference(`${novelId}:planning-seen`,0);
 const sequence=snapshot?.sequence||0;
 const trail=useDetailTrail(selected);
 const open=id=>{trail.visit(id);setSelected(id);setDecoration(null);};
 const close=()=>{trail.clear();setSelected(null);};
 const back=()=>{if(trail.previous){const id=trail.previous;trail.back(id);setSelected(id);}else close();};
 const refreshWritten=async()=>{const [snapshot,decorations]=await Promise.all([readPlanningSnapshot(call,novelId,modules.pages?{pageId:pageId||null}:{}),readDecorations(call,novelId,modules.pages?pageId||null:undefined)]);setWritten({pageId,snapshot,decorations});};
 const transact=(operations,reason,requestId=crypto.randomUUID())=>run(async()=>{await call('planning.apply',{novelId,requestId,operations,reason,...(operations.some(op=>op.op==='node.delete')?{expectedSequence:sequence}:{})});await refreshWritten();});
 const connect=(from,to)=>transact([{op:'edge.create',value:{from,to,type:'next'}}],'建立连线');
 const beginCreation=(position,source=null,side='out')=>{close();setDecoration(null);showCanvas();setCreating({key:crypto.randomUUID(),kind:'scene',pageId:pageId||null,position:position||{x:(source?.position?.x||0)+300,y:source?.position?.y||0},source,side,groupId:source?.groupId||filterGroup(group)||null});};
 const continueFrom=node=>beginCreation(node.position?{x:node.position.x+300,y:node.position.y}:canvas.current?.(),node);
 const disconnect=items=>transact(items.map(edge=>({op:'edge.delete',id:edge.id,expectedRevision:edge.revision,confirm:true})),'断开连线');
 const add=()=>{if(area==='scenes')beginCreation(canvas.current?.()||{x:40,y:60});else{close();setCreating({key:crypto.randomUUID(),kind:'scene',pageId:pageId||null,position:{x:40,y:60},groupId:filterGroup(group)||null});}};
 const decorate=(kind,position,size)=>{close();setDecoration(null);showCanvas();setCreating({...newDecoration(kind,position,pageId||null),...size,key:crypto.randomUUID()});};
 const switchPage=id=>{setPageId(id);close();setParent(null);setGroup('');setQuery('');setFilter('');setThread('');setChecked([]);setDecoration(null);setCreating(null);};
 const moveToPage=async(checked,movePage)=>{
   if(!checked.length||nodes.filter(n=>checked.includes(n.id)).every(n=>(n.pageId||null)===(movePage||null)))return;
   const ids=new Set(checked),cut=edges.filter(e=>ids.has(e.from)!==ids.has(e.to));
   if(cut.length&&!await confirm(`移到另一页面会断开 ${cut.length} 条跨页连线，所选情节之间的连线保留。继续？`))return;
   const moving=nodes.filter(n=>ids.has(n.id)),detaching=nodes.filter(n=>n.parentId&&ids.has(n.id)!==ids.has(n.parentId));
   const operations=[...cut.map(e=>({op:'edge.delete',id:e.id,expectedRevision:e.revision,confirm:true})),...moving.map(n=>({op:'node.update',id:n.id,expectedRevision:n.revision,value:{pageId:movePage||null,...(n.parentId&&!ids.has(n.parentId)?{parentId:null}:{})}})),...detaching.filter(n=>!ids.has(n.id)).map(n=>({op:'node.update',id:n.id,expectedRevision:n.revision,value:{parentId:null}}))];
   if(await transact(operations,'移动规划页面')){switchPage(movePage);if(batch)endBatch();}
 };
 const saveDecoration=(value,requestId)=>transact([{op:'decoration.update',id:value.id,expectedRevision:value.revision,value}],'保存画布批注',requestId);
 const saveLayout=async(positions,revisions={},requestId)=>{await call('planning.apply',{novelId,requestId,reason:'合并保存画布布局',operations:Object.entries(positions).map(([id,position])=>{const d=decorations.find(d=>d.id===id);return d?{op:'decoration.update',id,expectedRevision:revisions[id]??d.revision,value:{position}}:{op:'node.update',id,expectedRevision:revisions[id]??nodes.find(n=>n.id===id)?.revision,value:{position}};})});await refreshWritten();return true;};
 const removeObjects=async ids=>{
   if(!ids.length||busy||!await confirm(`删除选中的 ${ids.length} 项？讨论框内的卡片会保留，情节可从修改记录恢复。`))return;
   const depth=n=>{let count=0,p=n;const seen=new Set();while(p?.parentId&&!seen.has(p.id)){seen.add(p.id);count++;p=nodes.find(v=>v.id===p.parentId);}return count;};
   const ordered=nodes.filter(n=>ids.includes(n.id)).sort((a,b)=>depth(b)-depth(a));
   const operations=[...ordered.map(n=>({op:'node.delete',id:n.id,expectedRevision:n.revision,confirm:true,childPolicy:'detach'})),...decorations.filter(d=>ids.includes(d.id)).map(d=>({op:'decoration.delete',id:d.id,expectedRevision:d.revision,confirm:true}))];
   if(operations.length)await transact(operations,'删除画布内容');
 };
 const duplicateObjects=(ids,points={})=>run(async()=>{
   const source=await Promise.all(ids.map(nodeId=>call('planning.get',{novelId,nodeId})));
   const mapping=Object.fromEntries(ids.map((id,i)=>[id,`copy-${i}`]));
   const operations=source.map(({node},i)=>({op:'node.create',ref:mapping[node.id],value:{...node,title:node.title+' · 副本',position:{x:(points[node.id]?.x??node.position?.x??80+i*280)+28,y:(points[node.id]?.y??node.position?.y??80)+28}}}));
   operations.push(...edges.filter(e=>ids.includes(e.from)&&ids.includes(e.to)).map(e=>({op:'edge.create',value:{from:mapping[e.from],to:mapping[e.to],type:e.type,label:e.label}})));
   await call('planning.apply',{novelId,requestId:crypto.randomUUID(),operations,reason:'复制情节卡片'});
   await refreshWritten();
 });
 const moveObjects=(ids,groupId)=>transact(ids.map(id=>({op:'node.update',id,expectedRevision:nodes.find(n=>n.id===id)?.revision,value:{groupId}})),'移动规划分组');
 // 按出场人物筛选在所有规划视图统一生效：只认「出场／参与」，仅被提及不算。
 const castScoped=nodes.filter(n=>!castFilter||(n.cast||[]).some(ref=>ref.nodeId===castFilter&&ref.kind==='appearance'));
 const visible=castScoped.filter(n=>(query?`${n.title} ${n.summary} ${n.threads.join(' ')}`.toLowerCase().includes(query.toLowerCase()):true)&&(group?(n.groupId??null)===filterGroup(group):true)&&(!filter||n.status===filter)&&(!thread||n.threads.includes(thread)));
 const batchItems=visible.map(n=>({id:n.id,title:n.title,summary:n.summary,meta:[statusNames[n.status],groups.find(g=>g.id===n.groupId)?.name].filter(Boolean).join(' · ')}));
 const beginBatch=()=>{batchView.current=area;close();setBatch(true);setChecked([]);};
 const endBatch=()=>{setBatch(false);setChecked([]);setArea(batchView.current);};
 const openHistory=()=>run(async()=>{let result=await call('planning.history',{novelId,offset:0,limit:200});setChanges(result);setHistoryOpen(true);});
 const chain=[];let current=nodes.find(n=>n.id===parent);const walked=new Set();while(current&&!walked.has(current.id)){walked.add(current.id);chain.unshift(current);current=nodes.find(n=>n.id===current.parentId);}
 const saveCreation=(value,requestId)=>run(async()=>{
   let result;
   if(creating.kind==='scene'){
     if(creating.source){result=await call('planning.continue',{novelId,nodeId:creating.source.id,expectedRevision:creating.source.revision,requestId,side:creating.side||'out',value:{...value,position:creating.position},reason:`接续 ${creating.source.title}`});setCreated(result.node.id);}
     else{result=await call('planning.apply',{novelId,requestId,reason:'新建规划',operations:[{op:'node.create',ref:'new',value:{...value,pageId:creating.pageId,position:creating.position}}]});if(result.mapping&&result.mapping.new){setCreated(result.mapping.new);open(result.mapping.new);}else{setCreated(null);}}
   }else{
     const {key,...draft}=creating;
     result=await call('planning.apply',{novelId,requestId,reason:'新建画布批注',operations:[{op:'decoration.create',ref:'new',value:{...draft,title:value.title,content:value.content}}]});if(result.mapping&&result.mapping.new){setCreated(result.mapping.new);open(result.mapping.new);}else{setCreated(null);}
   }
   await refreshWritten();setQuery('');setFilter('');setThread('');setPoll(n=>n+1);
 });
 const navigation=<div className="connected-nav"><button className={area==='scenes'?'selected':''} onClick={showCanvas}>画布</button><button className={area==='outline'?'selected':''} onClick={()=>setArea('outline')}>大纲</button>{modules.timeline&&<button className={area==='narration'?'selected':''} onClick={()=>setArea('narration')}>时间线</button>}{modules.foreshadow&&<button className={area==='foreshadow'?'selected':''} onClick={()=>setArea('foreshadow')}>伏笔</button>}</div>;
 // 统一入口：作者只决定「新建一张剧情卡片」，由当前视图决定落到画布剧情卡还是时间线事件。
 const createStoryCard=()=>add();
 // 一颗「新建」按钮：只有一项时直接创建，有多项才下拉。剧情卡片与时间线事件是同一个入口——
 // 在时间线视图里建的就是时间线事件，其余视图建的是剧情卡片，作者不用先判断类型。
 const createItems=[
  {label:'新建剧情卡片',action:createStoryCard,disabled:busy},
  ...(area==='scenes'?[{label:'文字批注',action:()=>decorate('note',canvas.current?.()||{x:40,y:60}),disabled:busy},{label:'讨论框',action:()=>decorate('frame',canvas.current?.()||{x:40,y:60}),disabled:busy}]:[]),
 ];

 return <WorkspaceTools><div className="planning-workspace">
  <header className="module-heading canvas-heading workspace-toolbar">
   <WorkspaceNavigation>{navigation}</WorkspaceNavigation>
   <div className="workspace-actions">
    <ToolMenu label="新建" primary items={createItems}/>
    {(area==='scenes'||area==='narration')&&<ToolPanel label="筛选" icon="filter" wide>
     {area==='scenes'&&<label>搜索规划<input aria-label="搜索规划" placeholder="标题、摘要或故事线" value={query} onChange={e=>setQuery(e.target.value)}/></label>}
     {area==='scenes'&&<fieldset><legend>规划卡片</legend><label>进展<select aria-label="规划状态" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">全部状态</option>{Object.entries(statusNames).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>故事线<select aria-label="故事线" value={thread} onChange={e=>setThread(e.target.value)}><option value="">全部故事线</option>{[...new Set(nodes.flatMap(n=>n.threads))].sort().map(t=><option key={t} value={t}>{t}</option>)}</select></label></fieldset>}
     {area==='narration'&&<fieldset><legend>时间线轨道</legend><div className="sheet-checks">{availableKinds.map(k=><label key={k}><input type="checkbox" aria-label={`显示${{event:'事件',person:'人物',foreshadow:'伏笔'}[k]}轨道`} checked={shownKinds.includes(k)} onChange={e=>setTrackFilter(e.target.checked?[...shownKinds,k]:shownKinds.filter(v=>v!==k))}/>{{event:'事件',person:'人物',foreshadow:'伏笔'}[k]}</label>)}</div><label>轨道缩放<input type="range" aria-label="时间线缩放" min="35" max="160" step="5" value={trackZoom} onChange={e=>setTrackZoom(Number(e.target.value))}/>{trackZoom}%</label></fieldset>}
     {people.length>0&&<fieldset><legend>按出场人物</legend><label>人物<select aria-label="按出场人物筛选" value={castFilter} onChange={e=>setCastFilter(e.target.value)}><option value="">全部人物</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{castFilter&&<p className="muted">只显示与「{people.find(p=>p.id===castFilter)?.name||'该人物'}」相关的剧情；清除后恢复全部。</p>}</fieldset>}
     {area==='scenes'&&modules.groups&&<Groups {...{groups,busy,call,run,novelId}} prefix="planning" value={group} onChange={setGroup}/>}
     <button onClick={()=>{setQuery('');setFilter('');setThread('');setGroup('');setTrackFilter('all');setCastFilter('');}}>清除全部筛选</button>
    </ToolPanel>}
    <ToolPanel label="更多" icon="more">
     {modules.pages&&<PlanningPages pages={pages} value={pageId} busy={busy} change={switchPage} create={(name,summary)=>run(async()=>{const page=await call('planning.page.create',{novelId,name,summary,requestId:crypto.randomUUID()});switchPage(page.id);})} update={(page,name,summary)=>run(()=>call('planning.page.update',{novelId,pageId:page.id,expectedRevision:page.revision,name,summary,requestId:crypto.randomUUID()}))} remove={page=>run(async()=>{await call('planning.page.delete',{novelId,pageId:page.id,expectedRevision:page.revision,confirm:true,requestId:crypto.randomUUID()});switchPage('');})}/>}
     <fieldset><legend>规划文件</legend><button disabled={busy} onClick={()=>onTransfer({mode:'export',selection:{kind:'planning',novelId,...(modules.pages?{pageIds:[pageId||null]}:{})}})}>导出规划</button><button disabled={busy} onClick={()=>onTransfer({mode:'import',selection:{kind:'planning',novelId}})}>导入规划</button><button disabled={busy} onClick={openHistory}>修改记录</button></fieldset>
    </ToolPanel>
   </div>
  </header>
  <div className="planning-stage"><OverviewPage active={true}><ResourceState resource={resource}><div className="planning-columns">
   <div className={`planning-overview ${area==='narration'&&!batch?'is-timeline':''} ${area==='outline'?'is-outline':''} ${area==='foreshadow'?'is-foreshadow':''}`}>{batch&&<BatchManager items={batchItems} selected={checked} change={setChecked} groups={groups} busy={busy||resource.loading} pages={pages} currentPage={pageId} done={endBatch} onPage={moveToPage} onMove={(ids,groupId)=>run(async()=>{await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'移动规划分组',operations:ids.map(id=>({op:'node.update',id,expectedRevision:nodes.find(n=>n.id===id)?.revision,value:{groupId}}))});await refreshWritten();setChecked([]);})}/>} {!batch&&area==='outline'?<Outline chapters={outlineChapters} volumes={outlineVolumes} nodes={castScoped} busy={busy||resource.loading||outlineResource.loading} numbering={preferences.numbering} chapterRevisions={chapterRevisions} selectedId={selected} onChapter={onChapter} onPlanning={open} onSaveSummary={saveChapterSummary} onAssignChapter={assignOutlineChapter} onCreatePhase={mergeChaptersIntoPhase} onMoveToPhase={moveCardsToPhase}/>:!batch&&area==='foreshadow'?<Foreshadows call={call} novelId={novelId} busy={busy} run={run} onChapter={onChapter} onMemory={onMemory} onPlanning={open} focusId={focusShadow==='new'?null:focusShadow} onFocused={()=>setFocusShadow(null)}/>:!batch&&modules.timeline&&area==='narration'?<ModulePage id="timeline" creationRequest={timelineRequest} onCreationConsumed={()=>setTimelineRequest(null)} foreshadowSelection={{value:focusShadow,change:setFocusShadow}} timelineControls={{mode:trackMode,setMode:setTrackMode,filter:trackFilter,setFilter:setTrackFilter,zoom:trackZoom,setZoom:setTrackZoom,castFilter}} integrated {...{call,novelId,tick,run,busy,onChapter,onMemory,onCreateMemory}} planningItems={visible} creationDefaults={{pageId:pageId||null,groupId:filterGroup(group)||null}} onChanged={()=>setPoll(n=>n+1)} onPlanning={open}/>:batch?<BatchList items={batchItems} selected={checked} change={setChecked} busy={busy||resource.loading}/>:<PlanningCanvas key={`${novelId}:${pageId}`} scopeKey={`${novelId}:planning:${pageId||'main'}`} nodes={visible} allNodes={nodes} edges={edges} groups={groups} decorations={decorations} filtered={Boolean(query||filter||thread||group)} busy={busy} seen={seen} people={people} onOpenPerson={id=>onMemory(id)} onExpandCast={node=>setCastList(node)}
     onReady={center=>{canvas.current=center;}} onNew={(position,connection)=>beginCreation(position,connection?nodes.find(n=>n.id===connection.id):null,connection?.side)}
     creation={creating} saveCreation={saveCreation} cancelCreation={()=>setCreating(null)} focusId={created} focused={()=>setCreated(null)} editingDecoration={decoration} saveDecoration={saveDecoration} closeDecoration={()=>setDecoration(null)}
     onDecorate={decorate} onEditDecoration={value=>{close();setCreating(null);setDecoration(value);}}
     onResizeDecoration={(d,size)=>transact([{op:'decoration.update',id:d.id,expectedRevision:d.revision,value:size}],'调整批注大小')}
     onToggleFrame={d=>transact([{op:'decoration.update',id:d.id,expectedRevision:d.revision,value:{moveContents:!d.moveContents}}],'调整讨论框移动方式')}
     onQuick={setQuick} onSelect={open} onLayout={saveLayout} onConnect={connect} onDisconnect={disconnect} onRemove={removeObjects} onDuplicate={duplicateObjects} onMove={moveObjects}
     emptyMessage={query||filter||thread||group?'没有匹配的规划，试试调整筛选。':'右键开始新的情节'}/>}</div>

  </div></ResourceState></OverviewPage>
  {selected&&<CanvasInspector key={selected} backLabel={trail.previous?'‹ 返回上一条':'关闭详情'} onBack={back}><PlanningDetail {...{call,novelId,run,busy,nodes,edges,groups,pages,people,transact,refreshWritten,onChapter,onMemory,continueFrom,close,moveToPage}} onSelect={open} onEnter={()=>{setParent(selected);close();setQuery('');}} id={selected} latest={nodes.find(n=>n.id===selected)}/></CanvasInspector>}
  {castList&&<Modal title={`${castList.title} · 出场人物`} close={()=>setCastList(null)}><div className="cast-list-modal">{(castList.cast||[]).map(ref=>{const person=people.find(p=>p.id===ref.nodeId);if(!person)return null;return <button key={ref.nodeId} type="button" className="cast-list-row" onClick={()=>{setCastList(null);onMemory(person.id);}}><span className="cast-face cast-tone tone-0">{person.avatarImage?<img src={person.avatarImage} alt=""/>:person.name.slice(0,1)}</span><strong>{person.name}</strong><small>{ref.kind==='mention'?'仅被提及':'出场／参与'}</small></button>;})}{(castList.cast||[]).length===0&&<p className="muted">这张剧情卡还没有关联出场人物。</p>}</div></Modal>}
  </div>
  {area!=='scenes'&&creating&&<Modal title="新建剧情卡片" close={()=>setCreating(null)} className="planning-draft-modal"><CanvasDraft key={creating.key} creation={creating} draftKey={`${novelId}:planning:${pageId||'main'}:create:${creating.kind}:${creating.source?.id||'new'}`} busy={busy} save={saveCreation} close={()=>setCreating(null)}/></Modal>}
  {quick&&<CardQuickSettings kind="planning" id={quick} {...{call,novelId,groups,run,busy}} close={()=>setQuick(null)} updated={refreshWritten} openDetail={()=>open(quick)}/>}
  {historyOpen&&<div className="planning-history page"><div className="row"><h2 className="grow">规划修改记录</h2><button onClick={()=>setSeen(changes?.sequence||sequence)}>标为已读</button><button onClick={()=>setHistoryOpen(false)}>关闭记录</button></div>{changes?.items.map(t=><details className="card" key={t.id}><summary>{t.actor.kind==='agent'?'AI':'作者'} · {t.reason} · {new Date(t.updatedAt).toLocaleString()} · {t.changes.length} 项</summary>{t.changes.map(c=><div key={`${c.collection}:${c.id}`}><h3>{c.after.title||c.after.name||edgeNames[c.after.type]||(c.collection==='decorations'?'画布批注':'关系')}</h3><p className="muted">{changeSummary(c)}</p><DiffDisclosure before={describe(c.before,nodes,{groups,pages})} after={describe(c.after,nodes,{groups,pages})}/>{c.collection==='nodes'&&!c.after.deleted&&<button onClick={()=>{setPageId(c.after.pageId||'');setParent(c.after.parentId||null);open(c.id);setHistoryOpen(false);}}>定位节点</button>}</div>)}<button disabled={busy} onClick={async()=>{if(await confirm('撤销这次变更？若相关对象已有后续修改，将拒绝覆盖。'))run(async()=>{await call('planning.revert',{novelId,transactionId:t.id,requestId:crypto.randomUUID()});setHistoryOpen(false);});}}>撤销这次变更</button></details>)}{changes?.nextOffset!==null&&<button disabled={busy} onClick={()=>run(async()=>{const next=await call('planning.history',{novelId,offset:changes.nextOffset,limit:200});setChanges({...next,items:[...changes.items,...next.items]});})}>加载更多记录</button>}</div>}
 {modules.foreshadow&&!modules.timeline&&focusShadow&&<IndependentForeshadow id={focusShadow==='new'?null:focusShadow} {...{call,novelId,run,busy}} close={()=>setFocusShadow(null)} saved={()=>{setFocusShadow(null);setPoll(n=>n+1);}}/>}
 </div></WorkspaceTools>;
}
function IndependentForeshadow({call,novelId,run,busy,id,close,saved}){
 const resource=useResource(()=>Promise.all([call('chapter.list',{novelId}),call('graph.list',{novelId})]),[call,novelId],`${novelId}:new-foreshadow-materials`);
 return <ResourceState resource={resource}>{resource.value&&<ShadowEditorLoader {...{call,novelId,run,busy,id,close,saved}} board={{chapters:resource.value[0],nodes:resource.value[1]}}/>}</ResourceState>;
}

function PlanningDetail(props){const resource=useResource(()=>props.call('planning.get',{novelId:props.novelId,nodeId:props.id}),[props.call,props.novelId,props.id],`${props.novelId}:planning-detail:${props.id}`);return <ResourceState resource={resource}>{resource.value&&<PlanningEditor {...props} initial={resource.value.node}/>}</ResourceState>;}
function PlanningEditor({call,novelId,run,busy,id,initial,latest,nodes,edges,groups,pages,people=[],transact,refreshWritten,close,onChapter,onMemory,onEnter,continueFrom,onSelect,moveToPage}){
 const modules=useModules(),{preferences}=useWorkbenchPreferences();
 const {value,base,change,accept,rebase,dirty,cacheError}=useDraft(`${novelId}:planning:${id}`,initial);const {confirm,ask}=useDialog();
 useEffect(()=>{if(!busy&&!dirty&&initial.revision>base.revision)accept(initial);},[initial,busy,dirty,base.revision]);
 const refs=useResource(()=>Promise.all([call('chapter.list',{novelId}),call('graph.list',{novelId})]),[call,novelId]);const [chapters=[],memory=[]]=refs.value||[];
 const [remote,setRemote]=useState(null),[editing,setEditing]=useState(dirty),[tab,setTab]=useState('time');
 const [threadText,setThreadText]=useState(value.threads.join(', '));
 useEffect(()=>setThreadText(value.threads.join(', ')),[base]);
 // 四个子页面共用同一份草稿；伏笔页签只在模块启用时出现，关闭模块后回到时间位置。
 useEffect(()=>{if(!modules.foreshadow&&tab==='foreshadow')setTab('time');},[modules.foreshadow,tab]);
 const sectionTabs=[{id:'time',label:'时间位置'},{id:'cast',label:'人物关联'},...(modules.foreshadow?[{id:'foreshadow',label:'伏笔关联'}]:[]),{id:'plot',label:'剧情关联'}];
 const set=(key,v)=>change(old=>({...old,[key]:v}));
 const reload=()=>run(async()=>accept((await call('planning.get',{novelId,nodeId:id})).node));
 const save=()=>run(async()=>{await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:`修改 ${value.title}`,operations:[{op:'node.update',id,expectedRevision:base.revision,value}]});accept((await call('planning.get',{novelId,nodeId:id})).node);await refreshWritten();});
 const adjacent=direction=>edges.filter(e=>direction==='before'?e.to===id:e.from===id).map(e=>nodes.find(n=>n.id===(direction==='before'?e.from:e.to))).filter(Boolean);
 return <div onKeyDown={e=>saveShortcut(e,()=>{if(dirty&&!busy)save();})}><h2>{value.title}</h2><DetailActions><ReferenceButton reference={{kind:'planning',novelId,id,title:value.title,revision:base.revision,dirty,pageId:value.pageId}}/><button onClick={()=>setEditing(!editing)}>{editing?'阅读预览':'编辑规划'}</button></DetailActions>{modules.pages&&<label>所属页面<select aria-label="规划所属页面" value={base.pageId||''} disabled={busy||dirty} title={dirty?'先保存当前修改再移动页面':undefined} onChange={e=>moveToPage([id],e.target.value||null)}><option value="">主线规划</option>{pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}{latest?.revision!==base.revision&&<p className="notice">远端有更新，草稿仍保留。保存会检查版本。</p>}{value.deleted&&<p className="notice">此规划已删除，可在历史中撤销删除。</p>}
 {editing?<fieldset className="editor-fields document-fields" disabled={busy||value.deleted}><label>标题<input value={value.title} onChange={e=>set('title',e.target.value)}/></label><MarkdownField label="摘要" value={value.summary} onChange={e=>set('summary',e.target.value)}/><MarkdownField label="正文" className="prose" value={value.content} onChange={e=>set('content',e.target.value)}/><label>讨论进展<select value={value.status} onChange={e=>set('status',e.target.value)}>{Object.entries(statusNames).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></fieldset>
  :<section className="planning-reading"><p className="plan-tab-meta"><span className="status-badge">{statusNames[value.status]}</span></p><MarkdownText className="document-summary" text={value.summary}/><article className="document-body"><MarkdownText text={value.content||'尚未填写详细规划'}/></article></section>}
 <PlanningTabs tabs={sectionTabs} active={tab} onChange={setTab}>
  <PlanningTabPanel id="time" active={tab==='time'}><PlanningTimeSection value={value} set={set} busy={busy} editing={editing} id={id} nodes={nodes} chapters={chapters} numbering={preferences.numbering} onChapter={onChapter} call={call} novelId={novelId} scopeNames={scopeNames} threadText={threadText} setThreadText={setThreadText}/></PlanningTabPanel>
  <PlanningTabPanel id="cast" active={tab==='cast'}><PlanningCastSection value={value} set={set} busy={busy} editing={editing} people={people} memory={memory} onMemory={onMemory}/></PlanningTabPanel>
  {modules.foreshadow&&<PlanningTabPanel id="foreshadow" active={tab==='foreshadow'}><PlanningForeshadowSection value={value} set={set} busy={busy} editing={editing} active={tab==='foreshadow'} call={call} novelId={novelId}/></PlanningTabPanel>}
  <PlanningTabPanel id="plot" active={tab==='plot'}><PlanningPlotSection value={value} set={set} busy={busy} editing={editing} groups={groups} edges={edges} nodes={nodes} id={id} adjacent={adjacent} onSelect={onSelect} continueFrom={continueFrom} latest={latest} base={base} dirty={dirty} transact={transact} confirm={confirm} statusNames={statusNames}/></PlanningTabPanel>
 </PlanningTabs>
 {(editing||dirty)&&<SaveBar {...{dirty,busy}} error={cacheError} invalid={!value.title.trim()?'请填写标题':value.deleted?'已删除':null} onSave={save} label="保存规划"/>}

 <details className="section-fold"><summary>版本与引用</summary>
 <div className="row"><button disabled={busy} onClick={async()=>{if(!dirty||await confirm('丢弃本地草稿并读取最新规划？'))reload();}}>读取最新</button></div>
 <button disabled={busy} onClick={()=>run(async()=>setRemote((await call('planning.get',{novelId,nodeId:id})).node))}>比较远端版本</button>
 {remote&&<section className="card"><h3>远端版本 {remote.revision}</h3><TextDiff before={describe(remote,nodes,{groups,pages})} after={describe(value,nodes,{groups,pages})} beforeLabel={`远端版本 ${remote.revision}`} afterLabel={dirty?'本地草稿':'本地内容'}/><p>在上方编辑器合并需要的内容，再更新保存基准。</p><button disabled={busy||remote.deleted} onClick={async()=>{if(await confirm('确认已合并需要的内容？后续保存仍检查版本。')){rebase(remote);setRemote(null);}}}>已合并，更新保存基准</button><button onClick={()=>setRemote(null)}>关闭比较</button></section>}
 </details>
 <details><summary>删除规划</summary><button className="danger" disabled={busy} onClick={async()=>{let childPolicy='detach';if(nodes.some(n=>n.parentId===id)){const choice=await ask('输入“移出”保留子节点，或“子树”删除全部下级','移出');if(!['移出','子树'].includes(choice))return;childPolicy=choice==='子树'?'subtree':'detach';}if(await confirm('删除此规划及相关连线？可在修改记录中撤销。')){const ok=await transact([{op:'node.delete',id,expectedRevision:base.revision,confirm:true,childPolicy}],'删除规划');if(ok){accept(initial);close();}}}}>删除节点</button></details>
 </div>;
}

function Directory({nodes,parentId,selected,choose}) {
 return nodes.filter(n=>n.parentId===parentId).map(n=>nodes.some(c=>c.parentId===n.id)?<details key={n.id} open={undefined}><summary>{n.title}</summary><button aria-current={selected===n.id?'true':undefined} onClick={()=>choose(n)}>查看此规划</button><div className="planning-branch"><Directory {...{nodes,selected,choose}} parentId={n.id}/></div></details>:<button key={n.id} aria-current={selected===n.id?'true':undefined} onClick={()=>choose(n)}>{n.title}</button>);
}
function describe(value,nodes,{groups=[],pages=[]}={}) {
 if(!value)return '不存在（本次新增）';
 const ref=id=>{const n=nodes.find(n=>n.id===id);return n?`${n.title}${nodes.filter(x=>x.title===n.title).length>1?'（'+id.slice(0,8)+'）':''}`:id;};
 const place=[`页面：${pages.find(p=>p.id===value.pageId)?.name||value.pageId||'主线规划'}`,`分组：${groups.find(g=>g.id===value.groupId)?.name||value.groupId||'未分组'}`,value.position?`画布位置：${value.position.x}, ${value.position.y}`:''].filter(Boolean).join('\n');
 if(value.kind==='note'||value.kind==='frame')return `批注：${value.title}\n${value.content}\n${value.width} × ${value.height} · ${value.color} · ${value.fontSize} · ${value.fontFamily||''}\n${place}${value.deleted?'\n已删除':''}`;
 if(value.name!==undefined)return `名称：${value.name}\n${value.summary||''}${value.order!==undefined?'\n排序：'+value.order:''}${value.color?'\n颜色：'+value.color:''}${value.deleted?'\n已删除':''}`;
 if(value.from)return `${ref(value.from)} → ${edgeNames[value.type]} → ${ref(value.to)}\n${value.label||''}${value.deleted?'\n已删除':''}`;
 return [`标题：${value.title}`,`范围：${scopeNames[value.scope]} · 进展：${statusNames[value.status]}`,place,`所属：${ref(value.parentId)||'全书'}`,`故事线：${value.threads.join('、')||'未指定'}`,`概述：${value.summary}`,value.content,`正文引用：${value.chapterRefs.map(r=>`${r.chapterId} · 版本${r.revision}`).join('；')||'无'}`,`设定引用：${value.memoryRefs.join('、')||'无'}`,value.deleted?'已删除':''].filter(Boolean).join('\n');
}

function changeSummary(change) {
 if(!change.before)return '新增';
 const labels={pageId:'所属页面',width:'宽度',height:'高度',fontSize:'字号',fontFamily:'字体',color:'底色',groupId:'所属分组',position:'画布位置',name:'分组名称',title:'标题',summary:'概述',content:'详细内容',scope:'范围',status:'进展',parentId:'所属阶段',threads:'故事线',chapterRefs:'正文引用',memoryRefs:'设定引用',deleted:'删除状态',from:'起点',to:'终点',type:'关系类型',label:'关系说明'};
 return Object.entries(labels).filter(([key])=>JSON.stringify(change.before[key])!==JSON.stringify(change.after[key])).map(([,label])=>label).join('、')||'版本更新';
}
