import {Foreshadows} from '../structure/Foreshadows.jsx';
import {CardQuickSettings} from '../../shared/CardQuickSettings.tsx';
import {CardQuickButton,CardLegend} from '../../shared/card-appearance.tsx';
import {ReferenceButton} from '../../shared/collaboration.tsx';
import {OverviewPage,DetailActions,useDetailTrail} from '../../shared/detail-page.tsx';
import {DocumentTextarea} from '../../shared/workspace.tsx';
import {CanvasInspector} from '../../shared/CanvasInspector.tsx';
import {ViewSwitch,SearchControl} from '../../shared/workspace.tsx';
import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {Groups, GroupSelect, filterGroup} from '../../shared/groups.tsx';
import {BatchManager,BatchList} from '../../shared/batch-management.tsx';
import React,{useEffect,useRef,useState} from 'react';
import {useResource,useDraft,usePreference} from '../../shared/state.js';
import {ResourceState,SaveBar,saveShortcut} from '../../shared/ui.jsx';
import {useDialog} from '../../dialog.tsx';
import {ChapterEvidence} from '../../shared/evidence.jsx';
import {PlanningPages} from './Pages.tsx';
import {newDecoration} from './Decorations.tsx';
import {readPlanningSnapshot,readDecorations} from './data.js';
import {PlanningCanvas} from './Canvas.tsx';
import {Icon} from '../../shared/icons.tsx';
const statusNames={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
const scopeNames={long:'长期',phase:'阶段',near:'近期',unspecified:'未指定'};
const edgeNames={next:'剧情推进',requires:'依赖铺垫',alternative:'备选分支'};
export function Planning({call,novelId,tick,run,busy,onChapter,onMemory,onTransfer}) {
 const {preferences}=useWorkbenchPreferences();
 const [quick,setQuick]=useState(null),[area,setArea]=usePreference(`${novelId}:planning-area`,'scenes');
 const canvas=useRef(null),batchView=useRef(preferences.planningView);
 const [creating,setCreating]=useState(null),[created,setCreated]=useState(null),[batch,setBatch]=useState(false);
 const [parent,setParent]=usePreference(`${novelId}:planning-parent`,null),[selected,setSelected]=usePreference(`${novelId}:planning-selected`,null),[viewChoice,setView]=useState(preferences.planningView),[query,setQuery]=useState(''),[filter,setFilter]=useState(''),[thread,setThread]=useState(''),[group,setGroup]=useState(''),[checked,setChecked]=useState([]),[poll,setPoll]=useState(0),[historyOpen,setHistoryOpen]=useState(false),[changes,setChanges]=useState(null);
 const view=viewChoice==='auto'?'canvas':viewChoice;
 const {ask,confirm}=useDialog();
 const [pageId,setPageId]=usePreference(`${novelId}:planning-page`,'');
 const [decoration,setDecoration]=useState(null);
 const resource=useResource(()=>Promise.all([readPlanningSnapshot(call,novelId,{pageId:pageId||null}),call('planning.groups',{novelId}),call('planning.pages',{novelId}),readDecorations(call,novelId,pageId||null)]).then(values=>[...values,pageId]),[call,novelId,tick,poll,pageId]);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},4000);return()=>clearInterval(timer);},[]);
 const pageReady=resource.value?.[4]===pageId;
 const [written,setWritten]=useState(null);
 const projection=written?.pageId===pageId&&written.snapshot.sequence>=(pageReady?resource.value?.[0]?.sequence||0:0)?written:null;
 const snapshot=projection?.snapshot||(pageReady&&resource.value?.[0]);
 const nodes=snapshot?.items||[],edges=snapshot?.edges||[];
 useEffect(()=>{if(pageId&&resource.error?.includes('规划页面不存在')){setPageId('');setSelected(null);}},[resource.error,pageId]);
 const groups=resource.value?.[1]||[];
 const pages=resource.value?.[2]||[],decorations=projection?.decorations||(pageReady&&resource.value?.[3])||[];
 const [seen,setSeen]=usePreference(`${novelId}:planning-seen`,0);
 const sequence=snapshot?.sequence||0;
 const trail=useDetailTrail(selected);
 const open=id=>{trail.visit(id);setSelected(id);setDecoration(null);};
 const close=()=>{trail.clear();setSelected(null);};
 const back=()=>{if(trail.previous){const id=trail.previous;trail.back(id);setSelected(id);}else close();};
 const refreshWritten=async()=>{const [snapshot,decorations]=await Promise.all([readPlanningSnapshot(call,novelId,{pageId:pageId||null}),readDecorations(call,novelId,pageId||null)]);setWritten({pageId,snapshot,decorations});};
 const transact=(operations,reason,requestId=crypto.randomUUID())=>run(async()=>{await call('planning.apply',{novelId,requestId,operations,reason,...(operations.some(op=>op.op==='node.delete')?{expectedSequence:sequence}:{})});await refreshWritten();});
 const connect=(from,to)=>transact([{op:'edge.create',value:{from,to,type:'next'}}],'建立连线');
 const beginCreation=(position,source=null,side='out')=>{close();setDecoration(null);setView('canvas');setCreating({key:crypto.randomUUID(),kind:'scene',pageId:pageId||null,position:position||{x:(source?.position?.x||0)+300,y:source?.position?.y||0},source,side,groupId:source?.groupId||filterGroup(group)||null});};
 const continueFrom=node=>beginCreation(node.position?{x:node.position.x+300,y:node.position.y}:canvas.current?.(),node);
 const disconnect=items=>transact(items.map(edge=>({op:'edge.delete',id:edge.id,expectedRevision:edge.revision,confirm:true})),'断开连线');
 const add=()=>beginCreation(canvas.current?.()||{x:40,y:60});
 const decorate=(kind,position,size)=>{close();setDecoration(null);setView('canvas');setCreating({...newDecoration(kind,position,pageId||null),...size,key:crypto.randomUUID()});};
 const switchPage=id=>{setPageId(id);close();setParent(null);setGroup('');setQuery('');setFilter('');setThread('');setChecked([]);setDecoration(null);setCreating(null);};
 const moveToPage=async(checked,movePage)=>{
   const ids=new Set(checked),cut=edges.filter(e=>ids.has(e.from)!==ids.has(e.to));
   if(cut.length&&!await confirm(`移到另一页面会断开 ${cut.length} 条跨页连线，所选情节之间的连线保留。继续？`))return;
   const moving=nodes.filter(n=>ids.has(n.id)),detaching=nodes.filter(n=>n.parentId&&ids.has(n.id)!==ids.has(n.parentId));
   const operations=[...cut.map(e=>({op:'edge.delete',id:e.id,expectedRevision:e.revision,confirm:true})),...moving.map(n=>({op:'node.update',id:n.id,expectedRevision:n.revision,value:{pageId:movePage||null,...(n.parentId&&!ids.has(n.parentId)?{parentId:null}:{})}})),...detaching.filter(n=>!ids.has(n.id)).map(n=>({op:'node.update',id:n.id,expectedRevision:n.revision,value:{parentId:null}}))];
   if(await transact(operations,'移动规划页面')){switchPage(movePage);endBatch();}
 };
 const saveDecoration=(value,requestId)=>transact([{op:'decoration.update',id:value.id,expectedRevision:value.revision,value}],'保存画布批注',requestId);
 const saveLayout=(positions,revisions={},requestId)=>transact(Object.entries(positions).map(([id,position])=>{const d=decorations.find(d=>d.id===id);return d?{op:'decoration.update',id,expectedRevision:revisions[id]??d.revision,value:{position}}:{op:'node.update',id,expectedRevision:revisions[id]??nodes.find(n=>n.id===id)?.revision,value:{position}};}),'调整画布布局',requestId);
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
 const visible=nodes.filter(n=>(query?`${n.title} ${n.summary} ${n.threads.join(' ')}`.toLowerCase().includes(query.toLowerCase()):true)&&(group?(n.groupId??null)===filterGroup(group):true)&&(!filter||n.status===filter)&&(!thread||n.threads.includes(thread)));
 const batchItems=visible.map(n=>({id:n.id,title:n.title,summary:n.summary,meta:[statusNames[n.status],groups.find(g=>g.id===n.groupId)?.name].filter(Boolean).join(' · ')}));
 const beginBatch=()=>{batchView.current=view;close();setBatch(true);setChecked([]);setView('list');};
 const endBatch=()=>{setBatch(false);setChecked([]);setView(batchView.current);};
 const openHistory=()=>run(async()=>{let result=await call('planning.history',{novelId,offset:0,limit:200});setChanges(result);setHistoryOpen(true);});
 const chain=[];let current=nodes.find(n=>n.id===parent);const walked=new Set();while(current&&!walked.has(current.id)){walked.add(current.id);chain.unshift(current);current=nodes.find(n=>n.id===current.parentId);}
 const saveCreation=(value,requestId)=>run(async()=>{
   let result;
   if(creating.kind==='scene'){
     if(creating.source){result=await call('planning.continue',{novelId,nodeId:creating.source.id,expectedRevision:creating.source.revision,requestId,side:creating.side||'out',value:{...value,position:creating.position},reason:`接续 ${creating.source.title}`});setCreated(result.node.id);}
     else{result=await call('planning.apply',{novelId,requestId,reason:'新建规划',operations:[{op:'node.create',ref:'new',value:{...value,pageId:creating.pageId,position:creating.position}}]});setCreated(result.mapping.new);}
   }else{
     const {key,...draft}=creating;
     result=await call('planning.apply',{novelId,requestId,reason:'新建画布批注',operations:[{op:'decoration.create',ref:'new',value:{...draft,title:value.title,content:value.content}}]});setCreated(result.mapping.new);
   }
   await refreshWritten();setQuery('');setFilter('');setThread('');setPoll(n=>n+1);
 });
 if(area==='foreshadows')return <div className="planning-workspace"><button className="quiet-button" onClick={()=>setArea('scenes')}>‹ 返回情节规划</button><Foreshadows {...{call,novelId,busy,run,onChapter,onMemory}}/></div>;
 return <div className="planning-workspace">
  <header className="module-heading canvas-heading"><div className="module-toolbar">
   <button onClick={()=>setArea('foreshadows')}>伏笔台账</button><PlanningPages pages={pages} value={pageId} busy={busy} change={switchPage} create={(name,summary)=>run(async()=>{const page=await call('planning.page.create',{novelId,name,summary,requestId:crypto.randomUUID()});switchPage(page.id);})} update={(page,name,summary)=>run(()=>call('planning.page.update',{novelId,pageId:page.id,expectedRevision:page.revision,name,summary,requestId:crypto.randomUUID()}))} remove={page=>run(async()=>{await call('planning.page.delete',{novelId,pageId:page.id,expectedRevision:page.revision,confirm:true,requestId:crypto.randomUUID()});switchPage('');})}/>
   <Groups {...{groups,busy,call,run,novelId}} prefix="planning" value={group} onChange={value=>{setGroup(value);setChecked([]);}}/>
   <span className="toolbar-spacer"/><SearchControl label="搜索规划" value={query} change={setQuery}/>
   <details className={`menu filter-menu ${filter||thread?'is-active':''}`}><summary aria-label="筛选规划"><Icon name="filter"/>筛选{(filter||thread)&&<small>{Number(Boolean(filter))+Number(Boolean(thread))}</small>}</summary><div className="menu-panel"><label>进展<select aria-label="规划状态" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">全部状态</option>{Object.entries(statusNames).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>故事线<select aria-label="故事线" value={thread} onChange={e=>setThread(e.target.value)}><option value="">全部故事线</option>{[...new Set(nodes.flatMap(n=>n.threads))].sort().map(t=><option key={t} value={t}>{t}</option>)}</select></label><button disabled={!filter&&!thread} onClick={()=>{setFilter('');setThread('');}}>清除筛选</button></div></details>
   {!batch&&<><ViewSwitch value={view} change={setView} graph="画布"/><button className="module-select" aria-label="多选" disabled={busy} onClick={beginBatch}>多选</button><div className="module-add"><button className="primary" disabled={busy} onClick={add}>＋ 情节</button><details className="menu"><summary className="primary" aria-label="添加画布内容" title="添加便签、讨论框">⌄</summary><div className="menu-panel"><button disabled={busy} onClick={()=>decorate('note',canvas.current?.()||{x:40,y:60})}>文字批注</button><button disabled={busy} onClick={()=>decorate('frame',canvas.current?.()||{x:40,y:60})}>讨论框</button></div></details></div>
   <details className="menu"><summary aria-label="规划更多操作">···</summary><div className="menu-panel"><button disabled={busy} onClick={()=>onTransfer({mode:'export',selection:{kind:'planning',novelId,pageIds:[pageId||null]}})}>导出当前画布</button><button disabled={busy} onClick={()=>onTransfer({mode:'import',selection:{kind:'planning',novelId}})}>导入规划</button><button disabled={busy} onClick={openHistory}>{sequence>seen?'有新变化 · ':''}修改记录</button></div></details></>}
  </div><CardLegend planning/>{(filter||thread)&&<div className="active-filters" aria-label="当前规划筛选">{filter&&<button aria-label="移除进展筛选" onClick={()=>setFilter('')}>{statusNames[filter]}<span aria-hidden="true">×</span></button>}{thread&&<button aria-label="移除故事线筛选" onClick={()=>setThread('')}>{thread}<span aria-hidden="true">×</span></button>}</div>}</header>
  <div className="planning-stage"><OverviewPage active={true}><ResourceState resource={resource}><div className="planning-columns">
   <div className="planning-overview">{batch&&<BatchManager items={batchItems} selected={checked} change={setChecked} groups={groups} busy={busy||resource.loading} pages={pages} currentPage={pageId} done={endBatch} onPage={moveToPage} onMove={(ids,groupId)=>run(async()=>{await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'移动规划分组',operations:ids.map(id=>({op:'node.update',id,expectedRevision:nodes.find(n=>n.id===id)?.revision,value:{groupId}}))});await refreshWritten();setChecked([]);})}/>} {batch?<BatchList items={batchItems} selected={checked} change={setChecked} busy={busy||resource.loading}/>:!visible.length&&view!=='canvas'?<div className="empty">{query||filter||thread||group?'没有匹配的规划，试试调整筛选。':'从一个情节开始。'}</div>:view==='canvas'?<PlanningCanvas key={`${novelId}:${pageId}`} scopeKey={`${novelId}:planning:${pageId||'main'}`} nodes={visible} allNodes={nodes} edges={edges} groups={groups} decorations={decorations} filtered={Boolean(query||filter||thread||group)} busy={busy} seen={seen}
     onReady={center=>{canvas.current=center;}} onNew={(position,connection)=>beginCreation(position,connection?nodes.find(n=>n.id===connection.id):null,connection?.side)}
     creation={creating} saveCreation={saveCreation} cancelCreation={()=>setCreating(null)} focusId={created} focused={()=>setCreated(null)} editingDecoration={decoration} saveDecoration={saveDecoration} closeDecoration={()=>setDecoration(null)}
     onDecorate={decorate} onEditDecoration={value=>{close();setCreating(null);setDecoration(value);}}
     onResizeDecoration={(d,size)=>transact([{op:'decoration.update',id:d.id,expectedRevision:d.revision,value:size}],'调整批注大小')}
     onToggleFrame={d=>transact([{op:'decoration.update',id:d.id,expectedRevision:d.revision,value:{moveContents:!d.moveContents}}],'调整讨论框移动方式')}
     onQuick={setQuick} onSelect={open} onLayout={saveLayout} onConnect={connect} onDisconnect={disconnect} onRemove={removeObjects} onDuplicate={duplicateObjects} onMove={moveObjects}
     emptyMessage={query||filter||thread||group?'没有匹配的规划，试试调整筛选。':'右键开始新的情节'}/>:<div className="planning-list">{visible.map(n=><div className={`card state-${n.status} ${trail.lastOpened===n.id?'selected':''}`} key={n.id}><CardQuickButton title={n.title} open={()=>setQuick(n.id)} disabled={busy}/><button className="planning-title" aria-current={trail.lastOpened===n.id?'true':undefined} onClick={()=>open(n.id)}>{n.title}</button><span className="status-badge">{statusNames[n.status]}</span><p>{n.summary}</p>{nodes.some(c=>c.parentId===n.id)&&<button onClick={()=>{setParent(n.id);close();setQuery('');}}>子规划 · {nodes.filter(c=>c.parentId===n.id).length}</button>}</div>)}</div>}</div>

  </div></ResourceState></OverviewPage>
  {selected&&<CanvasInspector key={selected} backLabel={trail.previous?'‹ 返回上一条':'关闭详情'} onBack={back}><PlanningDetail {...{call,novelId,run,busy,nodes,edges,groups,transact,refreshWritten,onChapter,onMemory,continueFrom,close}} onSelect={open} onEnter={()=>{setParent(selected);close();setQuery('');}} id={selected} latest={nodes.find(n=>n.id===selected)}/></CanvasInspector>}
  </div>
  {quick&&<CardQuickSettings kind="planning" id={quick} {...{call,novelId,groups,run,busy}} close={()=>setQuick(null)} updated={refreshWritten} openDetail={()=>open(quick)}/>}
  {historyOpen&&<div className="planning-history page"><div className="row"><h2 className="grow">规划修改记录</h2><button onClick={()=>setSeen(changes?.sequence||sequence)}>标为已读</button><button onClick={()=>setHistoryOpen(false)}>关闭记录</button></div>{changes?.items.map(t=><details className="card" key={t.id}><summary>{t.actor.kind==='agent'?'AI':'作者'} · {t.reason} · {new Date(t.updatedAt).toLocaleString()} · {t.changes.length} 项</summary>{t.changes.map(c=><div key={`${c.collection}:${c.id}`}><h3>{c.after.title||c.after.name||edgeNames[c.after.type]||(c.collection==='decorations'?'画布批注':'关系')}</h3><p className="muted">{changeSummary(c)}</p><details><summary>比较前后版本</summary><div className="split"><div><h4>修改前</h4><pre>{describe(c.before,nodes)}</pre></div><div><h4>修改后</h4><pre>{describe(c.after,nodes)}</pre></div></div></details>{c.collection==='nodes'&&!c.after.deleted&&<button onClick={()=>{setPageId(c.after.pageId||'');setParent(c.after.parentId||null);open(c.id);setHistoryOpen(false);}}>定位节点</button>}</div>)}<button disabled={busy} onClick={async()=>{if(await confirm('撤销这次变更？若相关对象已有后续修改，将拒绝覆盖。'))run(async()=>{await call('planning.revert',{novelId,transactionId:t.id,requestId:crypto.randomUUID()});setHistoryOpen(false);});}}>撤销这次变更</button></details>)}{changes?.nextOffset!==null&&<button disabled={busy} onClick={()=>run(async()=>{const next=await call('planning.history',{novelId,offset:changes.nextOffset,limit:200});setChanges({...next,items:[...changes.items,...next.items]});})}>加载更多记录</button>}</div>}
 </div>;
}
function PlanningDetail(props){const resource=useResource(()=>props.call('planning.get',{novelId:props.novelId,nodeId:props.id}),[props.call,props.novelId,props.id]);return <ResourceState resource={resource}>{resource.value&&<PlanningEditor {...props} initial={resource.value.node}/>}</ResourceState>;}
function PlanningEditor({call,novelId,run,busy,id,initial,latest,nodes,edges,groups,transact,refreshWritten,close,onChapter,onMemory,onEnter,continueFrom,onSelect}){
 const {value,base,change,accept,rebase,dirty,cacheError}=useDraft(`${novelId}:planning:${id}`,initial);const {confirm,ask}=useDialog();
 useEffect(()=>{if(!busy&&!dirty&&initial.revision>base.revision)accept(initial);},[initial,busy,dirty,base.revision]);
 const refs=useResource(()=>Promise.all([call('chapter.list',{novelId}),call('graph.list',{novelId})]),[call,novelId]);const [chapters=[],memory=[]]=refs.value||[];
 const [target,setTarget]=useState(''),[referenceQuery,setReferenceQuery]=useState(''),[remote,setRemote]=useState(null),[editing,setEditing]=useState(dirty);
 const [threadText,setThreadText]=useState(value.threads.join(', '));
 useEffect(()=>setThreadText(value.threads.join(', ')),[base]);
 const set=(key,v)=>change(old=>({...old,[key]:v}));
 const reload=()=>run(async()=>accept((await call('planning.get',{novelId,nodeId:id})).node));
 const save=()=>run(async()=>{await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:`修改 ${value.title}`,operations:[{op:'node.update',id,expectedRevision:base.revision,value}]});accept((await call('planning.get',{novelId,nodeId:id})).node);await refreshWritten();});
 const adjacent=direction=>edges.filter(e=>direction==='before'?e.to===id:e.from===id).map(e=>nodes.find(n=>n.id===(direction==='before'?e.from:e.to))).filter(Boolean);
 return <div onKeyDown={e=>saveShortcut(e,()=>{if(dirty&&!busy)save();})}><h2>{value.title}</h2><DetailActions><ReferenceButton reference={{kind:'planning',novelId,id,title:value.title,revision:base.revision,dirty,pageId:value.pageId}}/><button onClick={()=>setEditing(!editing)}>{editing?'阅读预览':'编辑规划'}</button></DetailActions>{latest?.revision!==base.revision&&<p className="notice">远端有更新，草稿仍保留。保存会检查版本。</p>}{value.deleted&&<p className="notice">此规划已删除，可在历史中撤销删除。</p>}
 {editing?<fieldset className="editor-fields document-fields" disabled={busy||value.deleted}><label>标题<input value={value.title} onChange={e=>set('title',e.target.value)}/></label><label>摘要<DocumentTextarea aria-label="摘要" value={value.summary} onChange={e=>set('summary',e.target.value)}/></label><label>正文<DocumentTextarea aria-label="正文" className="prose" value={value.content} onChange={e=>set('content',e.target.value)}/></label><GroupSelect groups={groups} value={value.groupId} onChange={id=>set('groupId',id)}/><label>讨论进展<select value={value.status} onChange={e=>set('status',e.target.value)}>{Object.entries(statusNames).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><details><summary>更多属性与旧版层级</summary><div className="split"><label>范围<select value={value.scope} onChange={e=>set('scope',e.target.value)}>{Object.entries(scopeNames).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div><label>所属阶段<select value={value.parentId||''} onChange={e=>set('parentId',e.target.value||null)}><option value="">全书</option>{nodes.filter(n=>n.id!==id).map(n=><option key={n.id} value={n.id}>{n.title}</option>)}</select></label><label>故事线（逗号分隔）<input value={threadText} onChange={e=>{setThreadText(e.target.value);set('threads',[...new Set(e.target.value.split(/[,，]/).map(s=>s.trim()).filter(Boolean))]);}}/></label>
 </details><details><summary>关联正文与人物设定</summary>{value.chapterRefs.map(r=><p key={r.chapterId}>{chapters.find(c=>c.id===r.chapterId)?.title||'已删除或缺失章节'} · 版本{r.revision}<button onClick={()=>set('chapterRefs',value.chapterRefs.filter(x=>x.chapterId!==r.chapterId))}>移除</button></p>)}{value.memoryRefs.map(id=><p key={id}>{memory.find(n=>n.id===id)?.name||'已删除或缺失设定'}<button onClick={()=>set('memoryRefs',value.memoryRefs.filter(x=>x!==id))}>移除</button></p>)}<input aria-label="筛选关联资料" placeholder="搜索章节或设定" value={referenceQuery} onChange={e=>setReferenceQuery(e.target.value)}/>{chapters.filter(c=>c.title.includes(referenceQuery)).map(c=><label className="row" key={c.id}><input type="checkbox" checked={value.chapterRefs.some(r=>r.chapterId===c.id)} onChange={e=>set('chapterRefs',e.target.checked?[...value.chapterRefs,{chapterId:c.id,revision:c.revision}]:value.chapterRefs.filter(r=>r.chapterId!==c.id))}/>{c.title}<button type="button" onClick={()=>onChapter(c.id)}>打开</button>{value.chapterRefs.some(r=>r.chapterId===c.id&&r.revision!==c.revision)&&<span>正文版本已变化</span>}</label>)}{memory.filter(n=>n.name.includes(referenceQuery)).map(n=><label className="row" key={n.id}><input type="checkbox" checked={value.memoryRefs.includes(n.id)} onChange={e=>set('memoryRefs',e.target.checked?[...value.memoryRefs,n.id]:value.memoryRefs.filter(v=>v!==n.id))}/>{n.name}</label>)}</details>
 </fieldset>:<section className="planning-reading"><p className="document-summary">{value.summary}</p><article className="document-body">{value.content||'尚未填写详细规划'}</article><details className="section-fold"><summary>属性</summary><p className="muted">{scopeNames[value.scope]} · {statusNames[value.status]} · {value.threads.join(' / ')||'未指定故事线'}</p></details>{value.chapterRefs.map(r=><ChapterEvidence key={r.chapterId} {...{call,novelId,onChapter}} source={r} title={chapters.find(c=>c.id===r.chapterId)?.title}/>)}{value.memoryRefs.map(ref=><p key={ref}><button onClick={()=>onMemory(ref)}>{memory.find(n=>n.id===ref)?.name||'已删除或缺失设定'}</button></p>)}</section>}{(editing||dirty)&&<SaveBar {...{dirty,busy}} error={cacheError} invalid={!value.title.trim()?'请填写标题':value.deleted?'已删除':null} onSave={save} label="保存规划"/>}
 <section className="flow-context" aria-label="情节前后关系"><div><small>从哪里来</small>{adjacent('before').length?adjacent('before').map(n=><button key={n.id} onClick={()=>onSelect(n.id)}>{n.title}</button>):<p>这条路线的起点</p>}</div><span aria-hidden="true">→</span><div><small>当前情节</small><strong>{value.title}</strong><span className="status-badge">{statusNames[value.status]}</span></div><span aria-hidden="true">→</span><div><small>接下来</small>{adjacent('after').length?adjacent('after').map(n=><button key={n.id} onClick={()=>onSelect(n.id)}>{n.title}</button>):<p>等待讨论下一步</p>}<button disabled={busy||dirty||value.deleted} title={dirty?'先保存当前节点，再继续推进':undefined} onClick={()=>continueFrom(latest||base)}>＋ 接着推进</button></div></section>

 <details className="section-fold"><summary>版本与引用</summary>
 <div className="row"><button disabled={busy} onClick={async()=>{if(!dirty||await confirm('丢弃本地草稿并读取最新规划？'))reload();}}>读取最新</button></div>
 <button disabled={busy} onClick={()=>run(async()=>setRemote((await call('planning.get',{novelId,nodeId:id})).node))}>比较远端版本</button>
 {remote&&<section className="card"><h3>远端版本 {remote.revision}</h3><div className="split"><div><h3>本地</h3><pre>{describe(value,nodes)}</pre></div><div><h3>远端</h3><pre>{describe(remote,nodes)}</pre></div></div><p>在上方编辑器合并需要的内容，再更新保存基准。</p><button disabled={busy||remote.deleted} onClick={async()=>{if(await confirm('确认已合并需要的内容？后续保存仍检查版本。')){rebase(remote);setRemote(null);}}}>已合并，更新保存基准</button><button onClick={()=>setRemote(null)}>关闭比较</button></section>}
 </details>
 <details className="section-fold"><summary>管理连线</summary>{edges.filter(e=>e.from===id||e.to===id).map(e=><div key={e.id} className="source-row">{nodes.find(n=>n.id===e.from)?.title} → {nodes.find(n=>n.id===e.to)?.title}<button disabled={busy} onClick={async()=>{if(await confirm('删除这条规划关系？'))transact([{op:'edge.delete',id:e.id,expectedRevision:e.revision,confirm:true}],'删除规划关系');}}>移除</button></div>)}
 <div className="row"><select aria-label="目标规划" value={target} onChange={e=>setTarget(e.target.value)}><option value="">选择目标</option>{nodes.filter(n=>n.id!==id).map(n=><option key={n.id} value={n.id}>{n.title}</option>)}</select><button disabled={busy||!target} onClick={()=>transact([{op:'edge.create',value:{from:id,to:target,type:'next'}}],'建立剧情关系')}>连接</button></div>
 </details><details><summary>删除规划</summary><button className="danger" disabled={busy} onClick={async()=>{let childPolicy='detach';if(nodes.some(n=>n.parentId===id)){const choice=await ask('输入“移出”保留子节点，或“子树”删除全部下级','移出');if(!['移出','子树'].includes(choice))return;childPolicy=choice==='子树'?'subtree':'detach';}if(await confirm('删除此规划及相关连线？可在修改记录中撤销。')){const ok=await transact([{op:'node.delete',id,expectedRevision:base.revision,confirm:true,childPolicy}],'删除规划');if(ok){accept(initial);close();}}}}>删除节点</button></details>
 </div>;
}

function Directory({nodes,parentId,selected,choose}) {
 return nodes.filter(n=>n.parentId===parentId).map(n=>nodes.some(c=>c.parentId===n.id)?<details key={n.id} open={undefined}><summary>{n.title}</summary><button aria-current={selected===n.id?'true':undefined} onClick={()=>choose(n)}>查看此规划</button><div className="planning-branch"><Directory {...{nodes,selected,choose}} parentId={n.id}/></div></details>:<button key={n.id} aria-current={selected===n.id?'true':undefined} onClick={()=>choose(n)}>{n.title}</button>);
}
function describe(value,nodes) {
 if(value?.kind==='note'||value?.kind==='frame')return `批注：${value.title}\n${value.content}\n${value.width} × ${value.height} · ${value.color} · ${value.fontSize}`;
 if(value?.name!==undefined)return `名称：${value.name}\n${value.summary||''}${value.deleted?'\n已删除':''}`;
 if(!value)return '不存在（本次新增）';
 if(value.from)return `${nodes.find(n=>n.id===value.from)?.title||value.from} → ${edgeNames[value.type]} → ${nodes.find(n=>n.id===value.to)?.title||value.to}\n${value.label||''}${value.deleted?'\n已删除':''}`;
 return [`标题：${value.title}`,`范围：${scopeNames[value.scope]} · 进展：${statusNames[value.status]}`,`所属：${nodes.find(n=>n.id===value.parentId)?.title||value.parentId||'全书'}`,`故事线：${value.threads.join('、')||'未指定'}`,`概述：${value.summary}`,value.content,`正文引用：${value.chapterRefs.map(r=>`${r.chapterId} · 版本${r.revision}`).join('；')||'无'}`,`设定引用：${value.memoryRefs.join('、')||'无'}`,value.deleted?'已删除':''].filter(Boolean).join('\n');
}

function changeSummary(change) {
 if(!change.before)return '新增';
 const labels={pageId:'所属页面',width:'宽度',height:'高度',fontSize:'字号',fontFamily:'字体',color:'底色',groupId:'所属分组',position:'画布位置',name:'分组名称',title:'标题',summary:'概述',content:'详细内容',scope:'范围',status:'进展',parentId:'所属阶段',threads:'故事线',chapterRefs:'正文引用',memoryRefs:'设定引用',deleted:'删除状态',from:'起点',to:'终点',type:'关系类型',label:'关系说明'};
 return Object.entries(labels).filter(([key])=>JSON.stringify(change.before[key])!==JSON.stringify(change.after[key])).map(([,label])=>label).join('、')||'版本更新';
}
