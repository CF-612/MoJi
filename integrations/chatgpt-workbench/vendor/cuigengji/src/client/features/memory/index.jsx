import {CanvasExport} from '../../shared/CanvasExport.jsx';
import {PlanningToolsDialog,PlanningToolGroup} from '../planning/PlanningToolsDialog.jsx';
import {MaterialTabs,MaterialPanel} from '../../shared/MaterialSections.jsx';
import {profileHistoryStyles} from '../../shared/profile-history-style.ts';
import {relationOverview,appearanceLabel} from '../../../domain/story-relations.mjs';
import {materialViewStyle} from './material-view-style.mjs';
import {ToolSheet} from '../../shared/ToolSheet.tsx';
import {Icon} from '../../shared/icons.tsx';
import {MarkdownText,MarkdownField} from '../../shared/MarkdownText.jsx';
import {ImageUpload} from '../../shared/presentation.tsx';
import {EdgeEditor} from './EdgeEditor.jsx';
import {Timeline} from '../structure/Timeline.jsx';
import {MemoryCreationFields} from '../../shared/MemoryCreationFields.jsx';
import {resourceCache,resourceKey} from '../../shared/resource-cache.js';
import {StructuredCard} from '../../shared/StructuredCard.jsx';
import {CardQuickSettings} from '../../shared/CardQuickSettings.tsx';
import {CardQuickButton,CardLegend} from '../../shared/card-appearance.tsx';
import {ReferenceButton} from '../../shared/collaboration.tsx';
import {OverviewPage,DetailPage,DetailActions,useDetailTrail} from '../../shared/detail-page.tsx';
import {CreateDocument} from '../../shared/creation.tsx';
import {RelationCanvas} from './RelationCanvas.tsx';
import {Modal,useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {ViewSwitch,FilterControl,SearchControl} from '../../shared/workspace.tsx';
import {Groups, GroupSelect, filterGroup} from '../../shared/groups.tsx';
import {BatchManager,BatchList} from '../../shared/batch-management.tsx';
import {useModules,ModulePage} from '../../modules/index.tsx';
import React,{useEffect,useRef,useState,useContext} from 'react';
import {useDialog} from '../../dialog.tsx';
import {useDraft,useResource,usePreference,SessionScope} from '../../shared/state.js';
import {ResourceState,SaveBar,saveShortcut} from '../../shared/ui.jsx';

const kind=n=>n.type==='character_card'?'角色卡':'世界书';
export function Memory({call,novelId,tick,run,busy,onTransfer,onChapter,onEvent,onForeshadow,onPlanning,onRelation}) {
 const {preferences}=useWorkbenchPreferences();const modules=useModules();
 const scope=useContext(SessionScope),[area,setArea]=usePreference(`${novelId}:memory-area`,'library');
 useEffect(()=>{if(area!=='library')setArea('library');},[modules.timeline,area]);
 useEffect(()=>{if(!modules.groups)setGroup('');},[modules.groups]);
 const [quick,setQuick]=useState(null),[createRequested,setCreateRequested]=usePreference(`${novelId}:memory-create-request`,null);
 useEffect(()=>{if(['character_card','world_entry'].includes(createRequested)){setArea('library');setNode(null);setSelected(null);setCreating({type:createRequested});setCreateRequested(null);}},[createRequested]);
 const {confirm}=useDialog();
 const [view,setView]=usePreference(`${novelId}:memory-view`,preferences.memoryView),[batch,setBatch]=useState(false),[creating,setCreating]=useState(null);
 const [selected,setSelected]=usePreference(`${novelId}:memory-selected`,null);
 const [node,setNode]=useState(()=>resourceCache.get(resourceKey(scope,`${novelId}:memory-detail:${selected}`))?.value||null),[edge,setEdge]=useState(null),[query,setQuery]=useState(''),[filter,setFilter]=useState(''),[group,setGroup]=useState(''),[checked,setChecked]=useState([]),[error,setError]=useState(''),[poll,setPoll]=useState(0);
 const request=useRef(0),canvas=useRef(null),batchView=useRef(view),exportRef=useRef(null);
 const [toolsOpen,setToolsOpen]=useState(false);
 const trail=useDetailTrail(node?.id||null);
 const resource=useResource(()=>area==='library'?Promise.all([call('graph.list',{novelId,...(query?{query}:{}),...(group?{groupId:filterGroup(group)}:{})}),call('edge.list',{novelId}),call('graph.groups',{novelId}),call('writing.relationshipType.list',{novelId})]):Promise.resolve([[],[],[]]),[call,novelId,tick,poll,query,group,area],`${novelId}:memory:${query}:${group}:${area}`);
 const [nodes=[],edges=[],groups=[],relationshipTypes=[]]=resource.value||[];
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(v=>v+1);},5000);return()=>{clearInterval(timer);request.current++;};},[]);
 const open=async (id,back=false)=>{const seq=++request.current;setArea('library');setError('');const key=resourceKey(scope,`${novelId}:memory-detail:${id}`),cached=resourceCache.get(key);if(cached){setNode(cached.value);setSelected(id);}const epoch=resourceCache.epoch();try{const data=await call('graph.get',{novelId,nodeId:id});resourceCache.put(key,data,epoch);if(seq===request.current){if(back)trail.back(id);else trail.visit(id);setNode(data);setSelected(id);setEdge(null);}}catch(e){if(seq===request.current)setError(e.message);}};
 useEffect(()=>{if(selected)open(selected);},[]);
 const create=(type,position,connection)=>setCreating({type,position:position||canvas.current?.(),connection:connection?{...connection,expectedRevision:allNodes.find(n=>n.id===connection.id)?.revision}:undefined});
 const saved=n=>{if(n)trail.visit(n.id);else trail.clear();setNode(n);setSelected(n?.id||null);};
 const all=useResource(()=>area==='library'?call('graph.list',{novelId}):Promise.resolve([]),[call,novelId,tick,poll,area],`${novelId}:memory-all:${area}`);
 const merged=new Map();for(const n of [...(all.value||[]),...nodes])if(!merged.has(n.id)||merged.get(n.id).revision<=n.revision)merged.set(n.id,n);
 const allNodes=[...merged.values()];
 const storyResource=useResource(()=>modules.evolution?call('story.get',{novelId}):Promise.resolve(null),[call,novelId,tick,poll,modules.evolution],novelId+':memory-story');
 const materialOverview=storyResource.value?relationOverview(storyResource.value.state.cards,edges,allNodes,storyResource.value.sources.chapters,'narration',0,true,true):null;
 const storyAppearances=storyResource.value?relationOverview(storyResource.value.state.cards,edges,allNodes,storyResource.value.sources.chapters,'story',0,true,true).allNodes:[];
 const appearances=new Map((materialOverview?.allNodes||[]).map(n=>[n.id,n.firstAt!==undefined?appearanceLabel(n,storyResource.value.sources.chapters,'narration'):appearanceLabel(storyAppearances.find(p=>p.id===n.id),storyResource.value.sources.chapters,'story')]));
 const authorNodes=nodes.map(n=>({...n,appearanceLabel:appearances.get(n.id)}));

 const related=edges.filter(e=>e.from===node?.id||e.to===node?.id);
 const visible=authorNodes.filter(n=>!filter||n.type===filter);
 const batchItems=visible.map(n=>({id:n.id,title:n.name,summary:n.summary,meta:[kind(n),groups.find(g=>g.id===n.groupId)?.name].filter(Boolean).join(' · ')}));
 const beginBatch=()=>{batchView.current=view;setBatch(true);setChecked([]);setView('list');};
 const endBatch=()=>{setBatch(false);setChecked([]);setView(batchView.current);};
 const clear=()=>{setQuery('');setFilter('');setGroup('');};
 const close=()=>{if(trail.previous){void open(trail.previous,true);return;}request.current++;trail.clear();setNode(null);setEdge(null);setSelected(null);};
 const connect=(from,to)=>setEdge({from,to,name:'',content:''});
 const connectDirect=(from,to,axis,ports)=>run(()=>call('edge.create',{novelId,from,to,...ports,name:'',content:'',requestId:crypto.randomUUID()}));
 const saveLayout=async(points,revisions={},requestId=crypto.randomUUID())=>{await call('graph.layout',{novelId,requestId,positions:Object.entries(points).map(([nodeId,position])=>({nodeId,position,expectedRevision:revisions[nodeId]??allNodes.find(n=>n.id===nodeId)?.revision}))});setPoll(n=>n+1);return true;};
 const disconnect=items=>run(()=>call('edge.disconnect',{novelId,requestId:crypto.randomUUID(),confirm:true,edges:items.map(e=>({id:e.id,expectedRevision:e.revision}))}));
 const removeNodes=async ids=>{if(ids.length&&!busy&&await confirm(`删除选中的 ${ids.length} 张设定卡片及其关系？`))await run(()=>call('graph.remove',{novelId,requestId:crypto.randomUUID(),confirm:true,members:ids.map(id=>({id,expectedRevision:allNodes.find(n=>n.id===id)?.revision}))}));};
 const duplicateNodes=(ids,points={})=>run(()=>call('graph.duplicate',{novelId,requestId:crypto.randomUUID(),members:ids.map(id=>({id,expectedRevision:allNodes.find(n=>n.id===id)?.revision,...(points[id]?{position:points[id]}:{})}))}));
 const moveNodes=(ids,groupId)=>run(()=>call('graph.move',{novelId,requestId:crypto.randomUUID(),groupId,members:ids.map(id=>({id,expectedRevision:allNodes.find(n=>n.id===id)?.revision}))}));
 if(creating)return <CreateDocument draftKey={`${novelId}:memory-create:${creating.type}:${creating.connection?.id||'new'}`} nameLabel={creating.type==='character_card'?'姓名':'名称'} extraFields={(draft,change)=><MemoryCreationFields kind={creating.type} {...{draft,change,call,novelId,run,busy}}/>} label={creating.type==='character_card'?'新建角色卡':'新建世界书'} context={creating.connection?'创建后自动连接到原设定':undefined} initial={{title:'',summary:'',content:'',values:{},aliasesText:'',groupId:filterGroup(group)||allNodes.find(n=>n.id===creating.connection?.id)?.groupId||null}} {...{groups,busy}} close={()=>setCreating(null)} createGroup={async name=>{let result;await run(async()=>{result=await call('graph.group.create',{novelId,name});});return result;}} save={(value,requestId)=>run(async()=>{const fields={type:creating.type,name:value.title,summary:value.summary,content:value.content,groupId:value.groupId,organizationIds:value.organizationIds||[],organizationRevisions:value.organizationRevisions||{},values:Object.fromEntries(Object.entries(value.values||{}).filter(([,v])=>v!=='')),aliases:(value.aliasesText||'').split(/[,，\n]/).map(s=>s.trim()).filter(Boolean),...(creating.position?{position:creating.position}:{})};const result=await call('writing.card.create',{novelId,requestId,...fields,connection:creating.connection});saved(result.node||result);})}/>;
 return <div className="responsive-workspace memory-tools-layout"><div className="memory-workspace"><style>{materialViewStyle}{profileHistoryStyles}</style><OverviewPage active={!node}><header className="material-library-toolbar" aria-label="资料工具栏">
  <div className="material-library-views" role="group" aria-label="资料视图"><button aria-label="列表" aria-pressed={view==='list'} onClick={()=>setView('list')}><Icon name="list"/><span>列表</span></button><button aria-label="画布" aria-pressed={view==='canvas'} onClick={()=>setView('canvas')}><Icon name="canvas"/><span>画布</span></button></div>
  <div className="material-library-query"><label className="material-library-search"><Icon name="search"/><input aria-label="搜索设定" placeholder="搜索人物、地点与设定…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除资料搜索" onClick={()=>setQuery('')}>×</button>}</label><select aria-label="资料类型" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">全部资料</option><option value="character_card">人物</option><option value="world_entry">世界书</option></select></div>
  <div className="material-library-actions">
   <ToolSheet label="新建资料" title="新建资料" icon="plus" text="新建" primary dismissOnAction><button disabled={busy} onClick={()=>create('character_card')}><Icon name="person"/>角色卡</button><button disabled={busy} onClick={()=>create('world_entry')}><Icon name="world"/>世界书</button></ToolSheet>
   <button type="button" className="tool-trigger" aria-label="资料更多操作" aria-expanded={toolsOpen} onClick={()=>setToolsOpen(true)}><Icon name="more-horizontal"/><span>更多</span></button>
   {toolsOpen&&<PlanningToolsDialog page="materials" title="资料工具" busy={busy} close={()=>setToolsOpen(false)}>
    <PlanningToolGroup title="导入与导出"><button disabled={busy} onClick={()=>{setToolsOpen(false);onTransfer({mode:'import',selection:{kind:'memory',novelId}});}}><Icon name="folder"/><span>导入设定</span></button><button disabled={busy} onClick={()=>{setToolsOpen(false);onTransfer({mode:'export',selection:{kind:'memory',novelId,nodeIds:visible.map(n=>n.id)}});}}><Icon name="book"/><span>导出当前范围</span></button></PlanningToolGroup>
    {view==='canvas'&&!batch&&<section className="chapter-tool-group" aria-label="导出当前画布"><h3>导出当前画布</h3><CanvasExport {...exportRef.current} grouped/><p className="chapter-tool-note">按当前可见资料、位置与关系连线导出，不重排画布。</p></section>}
    <PlanningToolGroup title="整理资料"><button disabled={busy||!visible.length} onClick={()=>{setToolsOpen(false);beginBatch();}}><Icon name="list"/><span>批量管理资料</span></button><button disabled={!query&&!filter&&!group} onClick={()=>{clear();setToolsOpen(false);}}><Icon name="refresh"/><span>清除筛选</span></button></PlanningToolGroup>
    {modules.groups&&<details className="material-tools-legend"><summary>分组管理与筛选</summary><Groups {...{groups,busy,call,run,novelId}} prefix="graph" value={group} onChange={value=>{setGroup(value);setChecked([]);}}/></details>}
    <details className="material-tools-legend"><summary>颜色说明</summary><CardLegend/><div className="relation-legend">{relationshipTypes.map(t=><span key={t.id} style={{color:t.color}}>━ {t.name}</span>)}{!relationshipTypes.length&&<small>还没有自定义关系字段，可在编辑关系时新建。</small>}</div></details>
   </PlanningToolsDialog>}

  </div>
 </header>{view==='canvas'&&<div className="material-map-caption"><div><strong>完整关系图</strong><p>{modules.evolution&&modules.timeline?'全部设定始终可见 · 点人物连线查看两人演变':'全部设定始终可见 · 拖动整理，连线记录联系'}</p></div>{modules.evolution&&modules.timeline&&onRelation&&<button onClick={()=>onRelation()}><Icon name="route"/>查看全局演变</button>}</div>}

 <div className="memory-layout"><div className="memory-overview">{batch&&<BatchManager items={batchItems} selected={checked} change={setChecked} groups={groups} busy={busy||resource.loading} done={endBatch} onMove={(ids,groupId)=>run(async()=>{await call('graph.move',{novelId,groupId,members:ids.map(id=>({id,expectedRevision:allNodes.find(n=>n.id===id)?.revision}))});setChecked([]);})}/>}<ResourceState resource={resource}>
 {batch?<BatchList items={batchItems} selected={checked} change={setChecked} busy={busy||resource.loading}/>:view==='canvas'?<RelationCanvas key={novelId} scopeKey={`${novelId}:settings`} nodes={visible} allNodes={allNodes} edges={edges.filter(e=>!e.deleted)} groups={groups} busy={busy} onReady={center=>{canvas.current=center;}} onExportReady={value=>{exportRef.current=value;}} onNew={(position,connection,type)=>create(type||allNodes.find(n=>n.id===connection?.id)?.type||'character_card',position,connection)} onQuick={setQuick} onSelect={open} onConnect={connectDirect} onLayout={saveLayout} onRelation={modules.evolution&&modules.timeline?onRelation:undefined} onEdit={e=>setEdge(edges.find(b=>b.id===e.id))} onDelete={disconnect} onRemove={removeNodes} onDuplicate={duplicateNodes} onMove={moveNodes}/>:!visible.length?<div className="empty">{query||filter||group?'没有匹配的设定，试试调整筛选。':'添加第一张角色卡或世界书。'}</div>:<div className="library-list">{visible.map(n=><div className="selectable-entry" key={n.id}><CardQuickButton title={n.name} open={()=>setQuick(n.id)} disabled={busy}/><button className={`library-entry kind-${n.type==='character_card'?'character':'world'} ${trail.lastOpened===n.id?'selected':''}`} aria-current={trail.lastOpened===n.id?'true':undefined} onClick={()=>open(n.id)}><span className="memory-portrait"><span className="memory-card-avatar">{n.avatarImage?<img src={n.avatarImage} alt=""/>:n.name.slice(0,1)}</span></span><span className="entry-heading"><strong>{n.name}</strong><small>{kind(n)}</small>{n.appearanceLabel&&<small className="material-appearance">{n.appearanceLabel}</small>}</span>{n.cardTags?.length>0&&<span className="card-tags">{n.cardTags.map(tag=><small key={tag}>{tag}</small>)}</span>}{n.summary&&<p>{n.summary}</p>}{n.groupId&&<small>{groups.find(g=>g.id===n.groupId)?.name}</small>}</button></div>)}</div>}</ResourceState></div></div></OverviewPage>
 {quick&&<CardQuickSettings kind="memory" id={quick} {...{call,novelId,groups,run,busy}} close={()=>setQuick(null)} updated={()=>{setPoll(n=>n+1);}} openDetail={()=>open(quick)}/>}
 {error&&<p className="notice error" role="alert">{error}</p>}
 {node&&<DetailPage key={node.id} className="memory-detail" backLabel={trail.previous?'‹ 返回上一条':'‹ 返回设定'} onBack={close}><NodeEditor appearance={appearances.get(node.id)} key={node.id||node.type} {...{call,novelId,tick,run,busy,saved,groups,onTransfer,onChapter,onEvent,onRelation}} initial={node} latest={allNodes.find(n=>n.id===node.id)} onMemory={open} relatedContent={<section className="profile-related"><div className="profile-block-heading"><h3 >关联资料</h3><button disabled={busy||allNodes.length<2} onClick={()=>connect(node.id,allNodes.find(n=>n.id!==node.id)?.id)}>连接资料</button></div>{related.filter(e=>node.type!=='character_card'||allNodes.find(n=>n.id===(e.from===node.id?e.to:e.from))?.type!=='character_card').map(e=><div key={e.id} className="related-entry"><button onClick={()=>open(e.from===node.id?e.to:e.from)}>{allNodes.find(n=>n.id===(e.from===node.id?e.to:e.from))?.name||'设定'}</button>{e.name&&<small>{e.name}</small>}{e.content&&<MarkdownText text={e.content}/>}<button aria-label={`修改关系 ${e.name||'连线'}`} onClick={()=>setEdge(e)}>···</button></div>)}</section>}/>
</DetailPage>}{edge&&<Modal title={edge.id?'编辑关系':'添加关系'} close={()=>setEdge(null)}><EdgeEditor key={edge.id||`new:${edge.from}:${edge.to}`} {...{call,novelId,run,busy}} nodes={allNodes} initial={edge} saved={()=>setEdge(null)}/></Modal>}</div></div>;
}

function NodeEditor({onMemory,relatedContent,appearance,call,novelId,tick,run,busy,initial,latest,saved,groups,onTransfer,onChapter,onEvent,onForeshadow,onPlanning,onRelation}) {
 const modules=useModules();
 const {value,base,change,accept,dirty,cacheError}=useDraft(`${novelId}:node:${initial.id||initial.type+':new'}`,initial);
  const fresh=useResource(()=>initial.id?call('graph.get',{novelId,nodeId:initial.id}):Promise.resolve(null),[call,novelId,initial.id,latest?.revision],`${novelId}:memory-detail:${initial.id}`);
  useEffect(()=>{if(!busy&&!dirty&&fresh.value?.revision>base.revision){accept(fresh.value);saved(fresh.value);}},[fresh.value,busy,dirty,base.revision]);
 const [editing,setEditing]=useState(!initial.id||dirty),[section,setSection]=usePreference(`${novelId}:memory-section:${initial.id}`,'content'),[fieldsDirty,setFieldsDirty]=useState(false),[relationsDirty,setRelationsDirty]=useState(false);
 const prefix='material-'+(initial.id||initial.type);const {confirm,ask}=useDialog();
 const set=(key,v)=>change(old=>({...old,[key]:v}));
 const save=()=>{if(!value.name.trim()||busy)return;run(async()=>{const result=await call(value.id?'graph.update':'graph.create',{novelId,nodeId:value.id,expectedRevision:base.revision,type:value.type==='character_card'?'character_card':'world_entry',groupId:value.groupId||null,name:value.name,summary:value.summary||'',content:value.content||''});accept(result);saved(result);setEditing(false);});};
 return <div className="material-detail" onKeyDown={e=>{saveShortcut(e,()=>{if(section==='content'&&editing&&dirty)save();});}}><style>{profileHistoryStyles}</style><header className="material-identity">{value.type==='character_card'&&<ImageUpload label="选择或替换人物头像" disabled={busy||dirty} onChange={avatarImage=>run(async()=>{const result=await call('graph.update',{novelId,nodeId:value.id,expectedRevision:base.revision,avatarImage});accept(result);saved(result);})}><span className="profile-avatar">{value.avatarImage?<img src={value.avatarImage} alt={value.name}/>:value.name.slice(0,1)}</span></ImageUpload>}<div><small>{kind(value)} · 完整设定</small><h2>{value.name||`新${kind(value)}`}</h2>{appearance&&<span className="material-identity-meta">{appearance}</span>}</div></header><DetailActions><ReferenceButton reference={{kind:'memory',novelId,id:value.id,title:value.name,revision:base.revision,dirty}}/>{section==='content'&&<button onClick={()=>setEditing(!editing)}>{editing?'阅读':'编辑内容'}</button>}</DetailActions>{fresh.error&&<p className="notice error" role="alert">{fresh.error}</p>}{latest&&latest.revision!==base.revision&&<p className="notice">设定已有新版本，本地草稿仍保留。保存会检查冲突。</p>}
 <MaterialTabs prefix={prefix} label="资料详情分区" active={section} onChange={setSection} tabs={[{id:'content',label:'内容',icon:'book',dirty},{id:'fields',label:'设定字段',icon:'list',dirty:fieldsDirty},{id:'relations',label:'关系',icon:'person',dirty:relationsDirty},{id:'history',label:'故事历程',icon:'route'},{id:'manage',label:'管理',icon:'settings'}]}/>
 <MaterialPanel id="content" active={section} prefix={prefix}>
 {modules.evolution&&<details className="material-detail-note"><summary>完整设定与故事出场</summary><p><strong>{appearance||'正在读取出场安排…'}</strong><br/>这里始终保存作者的完整设定，提前编辑不会让资料提前出场。请在剧情卡中选择“出场／展示”并安排时间；“提及”不算出场。正文中的秘密、身份等信息何时揭示，仍由对应剧情决定。</p></details>}{editing?<fieldset disabled={busy} className="editor-fields document-fields"><label>类型<select value={value.type==='character_card'?'character_card':'world_entry'} onChange={e=>set('type',e.target.value)}><option value="character_card">角色卡</option><option value="world_entry">世界书</option></select></label>{modules.groups&&<div className="creation-settings"><GroupSelect groups={groups} value={value.groupId} onChange={id=>set('groupId',id)}/><button type="button" disabled={busy} onClick={async()=>{const name=await ask('新建分组名称');if(name?.trim())run(async()=>{const g=await call('graph.group.create',{novelId,name});set('groupId',g.id);});}}>＋ 新建分组</button></div>}<label>名称<input value={value.name} onChange={e=>set('name',e.target.value)}/></label><MarkdownField label="摘要" value={value.summary||''} onChange={e=>set('summary',e.target.value)}/><MarkdownField label="全文" className="prose" value={value.content||''} onChange={e=>set('content',e.target.value)}/></fieldset>:<><MarkdownText className="document-summary" text={value.summary||'暂无摘要'}/><article className="document-body"><MarkdownText text={value.content||'暂无内容'}/></article></>}
 {(editing||dirty)&&<SaveBar dirty={dirty||!value.id} {...{busy}} error={cacheError} invalid={!value.name.trim()?'请填写名称':null} onSave={save} label="保存设定"/>}
 </MaterialPanel>
 {value.id&&<StructuredCard {...{call,novelId,tick,busy,run,onChapter,onEvent,section,prefix,relatedContent,onMemory,onRelation}} onDirty={setFieldsDirty} onRelationsDirty={setRelationsDirty} nodeId={value.id}/>}
 {value.id&&<MaterialPanel id="manage" active={section} prefix={prefix}><div className="material-management"><header className="profile-block-heading"><h3>资料管理</h3></header><p className="profile-caption">导出、读取最新版本，或移除这条设定。</p><div className="material-management-actions"><button disabled={busy||dirty} title={dirty?'先保存设定后导出':undefined} onClick={()=>onTransfer({mode:'export',selection:{kind:'memory',novelId,nodeIds:[value.id]}})}>导出这条设定</button><button disabled={busy} onClick={async()=>{if(!dirty||await confirm('放弃本地草稿并读取最新设定？'))run(async()=>{const n=await call('graph.get',{novelId,nodeId:value.id});accept(n);saved(n);});}}>读取最新</button><button className="danger" disabled={busy} onClick={async()=>{if(await confirm(`删除“${value.name}”及其关系？`))run(async()=>{await call('graph.delete',{novelId,nodeId:value.id,expectedRevision:base.revision,confirm:true});accept(initial);saved(null);});}}>删除设定</button></div></div></MaterialPanel>}
 </div>;
}
