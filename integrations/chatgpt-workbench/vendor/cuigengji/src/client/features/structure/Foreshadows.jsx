import {MarkdownText,MarkdownField} from '../../shared/MarkdownText.jsx';
import {useWritingRequest} from '../../shared/writing-request.js';
import {WritingHistory} from '../../shared/WritingHistory.jsx';
import {Icon} from '../../shared/icons.tsx';
import React,{useState,useEffect,useMemo} from 'react';
import {useDraft,useResource,usePreference} from '../../shared/state.js';
import {ResourceState,SaveBar} from '../../shared/ui.jsx';
import {Modal} from '../../shared/preferences.tsx';
import {DocumentTextarea} from '../../shared/workspace.tsx';
import {readPlanningSnapshot} from '../planning/data.js';
import {foreshadowLedgerStyles} from './foreshadow-ledger-style.ts';
const states={planned:'计划',planted:'已埋设',developing:'推进中',recovered:'已回收',abandoned:'已放弃'},evidenceKinds={plant:'埋设',progress:'推进',recover:'回收'};
const stageOrder=['plant','progress','recover'],stageNames={plant:'埋设',progress:'推进',recover:'回收'};
const planStates={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
const statusOptions=[['all','全部'],['planned','计划'],['planted','已埋设'],['developing','推进中'],['recovered','已回收'],['abandoned','已放弃']];
/** 当前阶段：已埋设→等推进，推进中→在推进，已回收→落在回收；待定章节的剧情卡挂到这里。 */
const currentStage=f=>f.status==='recovered'?'recover':f.status==='planted'||f.status==='developing'?'progress':'plant';
/** 轨道节点状态：done=实心已完成，current=进行中高亮，next=下一步，todo=未开始虚线。 */
const trackStates={planned:{plant:'next',progress:'todo',recover:'todo'},planted:{plant:'done',progress:'next',recover:'todo'},developing:{plant:'done',progress:'current',recover:'todo'},recovered:{plant:'done',progress:'done',recover:'done'},abandoned:{plant:'todo',progress:'todo',recover:'todo'}};
const trackOf=status=>trackStates[status]||trackStates.planned;
const chapterTitleOf=(chaptersById,chapterId)=>chaptersById.get(chapterId)?.title||'删除章';
const targetTitleOf=(f,chaptersById)=>f.targetTitle||chaptersById.get(f.targetChapterId)?.title||'缺失章节';
/** 剧情卡落在哪些章节：优先第一章，多章只提示总数。 */
function chapterLabelOf(node,chaptersById){
 const titles=(Array.isArray(node.chapterRefs)?node.chapterRefs:[]).map(ref=>chaptersById.get(ref?.chapterId)?.title).filter(Boolean);
 return titles.length>1?`${titles[0]} 等 ${titles.length} 章`:titles[0]||'';
}
/** 阶段锚点：每个阶段最早出现正文依据（回收也认计划回收章）的章节序号。 */
function stageAnchors(f,chapterRank){
 const anchors={};
 for(const item of f.evidence||[]){const rank=chapterRank.get(item?.chapterId);if(rank===undefined)continue;if(anchors[item.kind]===undefined||rank<anchors[item.kind])anchors[item.kind]=rank;}
 const target=f.targetChapterId?chapterRank.get(f.targetChapterId):undefined;
 if(target!==undefined&&(anchors.recover===undefined||target<anchors.recover))anchors.recover=target;
 return anchors;
}
/** 剧情卡落在哪一阶段：取它最早引用的章节，归到该章所在阶段；没有章节归属时挂当前阶段。 */
function cardStage(node,f,anchors,chapterRank){
 const ranks=(Array.isArray(node.chapterRefs)?node.chapterRefs:[]).map(ref=>chapterRank.get(ref?.chapterId)).filter(rank=>rank!==undefined);
 if(!ranks.length)return currentStage(f);
 const first=Math.min(...ranks);
 let stage=null;
 for(const name of stageOrder)if(anchors[name]!==undefined&&first>=anchors[name])stage=name;
 return stage||(stageOrder.some(name=>anchors[name]!==undefined)?'plant':currentStage(f));
}
function readPlanningCards(call,novelId){
 return readPlanningSnapshot(call,novelId).then(snapshot=>({items:Array.isArray(snapshot?.items)?snapshot.items:[],error:''}),()=>call('planning.list',{novelId,offset:0,limit:200}).then(page=>({items:Array.isArray(page?.items)?page.items:[],error:''}),error=>({items:[],error:error?.message||'剧情卡读取失败'})));
}
function PlanCard({node,chapter,onPlanning}){
 const title=typeof node.title==='string'&&node.title.trim()?node.title.trim():'未命名剧情卡',summary=typeof node.summary==='string'?node.summary.trim():'',state=node.status||'';
 return <button type="button" className="cg-fore-plan" disabled={!onPlanning} onClick={()=>onPlanning&&onPlanning(node.id)} title={summary||title} aria-label={onPlanning?`打开剧情卡 ${title}`:`剧情卡 ${title}`}>
  <span className="cg-fore-plan-top"><span className="cg-fore-plan-title">{title}</span>{state?<span className="cg-fore-plan-status" data-state={state}>{planStates[state]||'未设定'}</span>:null}</span>
  <span className="cg-fore-plan-meta">{chapter||'章节待定'}</span>
  {summary?<span className="cg-fore-plan-summary">{summary}</span>:null}
 </button>;
}
function ForeshadowCard({f,chaptersById,chapterRank,planNodes,memoryById,onChapter,onMemory,onPlanning,onEdit,noteOpen,onToggleNote}){
 const rankOf=node=>{const ranks=(Array.isArray(node.chapterRefs)?node.chapterRefs:[]).map(ref=>chapterRank.get(ref?.chapterId)).filter(rank=>rank!==undefined);return ranks.length?Math.min(...ranks):Infinity;};
 const track=trackOf(f.status),evidence=Array.isArray(f.evidence)?f.evidence:[],anchors=stageAnchors(f,chapterRank),buckets={plant:[],progress:[],recover:[]};
 for(const node of planNodes)buckets[cardStage(node,f,anchors,chapterRank)].push(node);
 for(const name of stageOrder)buckets[name].sort((left,right)=>rankOf(left)-rankOf(right)||String(left.title||'').localeCompare(String(right.title||''),'zh-CN'));
 const content=typeof f.content==='string'?f.content.trim():'',needsToggle=content.length>80||content.includes('\n'),open=noteOpen||!needsToggle,total=planNodes.length;
 return <article className="cg-fore-card" data-status={f.status||'planned'} aria-label={`伏笔 ${f.title||'未命名伏笔'}`}>
  <header className="cg-fore-head">
   <span className="cg-fore-sigil" aria-hidden="true"><Icon name="route"/></span>
   <div className="cg-fore-headline">
    <div className="cg-fore-title-row">
     <h3 className="cg-fore-title">{f.title||'未命名伏笔'}</h3>
     <span className="cg-fore-badge"><i aria-hidden="true"/>{states[f.status]||'未标记'}</span>
    </div>
    <div className="cg-fore-meta">
     <span className="cg-fore-count">共 {total} 个节点</span>
     {f.targetChapterId?<span className="cg-fore-meta-item">计划回收：<button type="button" className="cg-fore-link" onClick={()=>onChapter&&onChapter(f.targetChapterId)}>{targetTitleOf(f,chaptersById)}</button></span>:null}
     {(Array.isArray(f.memoryRefs)?f.memoryRefs:[]).map(id=><button type="button" key={id} className="cg-fore-memory" onClick={()=>onMemory&&onMemory(id)} title={memoryById.get(id)?.name||'缺失资料'}>{memoryById.get(id)?.name||'缺失资料'}</button>)}
    </div>
   </div>
   <div className="cg-fore-actions"><button type="button" className="cg-fore-icon-btn" aria-label="编辑伏笔" title="编辑伏笔" onClick={()=>onEdit(f)}><Icon name="edit"/></button></div>
  </header>
  {f.due||f.review||(f.status==='abandoned'&&f.abandonReason)?<div className="cg-fore-alerts">
   {f.due?<p className="cg-fore-alert" data-kind="due">已到计划回收章，尚未回收</p>:null}
   {f.review?<p className="cg-fore-alert" data-kind="review">引用正文已改写，需复核</p>:null}
   {f.status==='abandoned'&&f.abandonReason?<p className="cg-fore-alert" data-kind="abandon">放弃原因：{f.abandonReason}</p>:null}
  </div>:null}
  <div className="cg-fore-track">
   {stageOrder.map((name,index)=>{
    const state=track[name]||'todo',previous=index>0?track[stageOrder[index-1]]||'todo':'';
    const left=index>0&&previous==='done',right=index<stageOrder.length-1&&state==='done';
    const items=buckets[name],evidenceItems=evidence.filter(item=>item?.kind===name),plannedRecover=name==='recover'&&f.targetChapterId&&f.status!=='recovered';
    return <div className="cg-fore-stage" key={name} data-stage={name} data-state={state} data-left={left?'on':'off'} data-right={right?'on':'off'} data-first={index===0} data-last={index===stageOrder.length-1}>
     <div className="cg-fore-rail" aria-hidden="true"><span className="cg-fore-dot">{index+1}</span></div>
     <div className="cg-fore-stage-body">
      <div className="cg-fore-stage-title"><span>{stageNames[name]}</span>{items.length>0?<span className="cg-fore-stage-count">{items.length}</span>:null}</div>
      {evidenceItems.length>0||plannedRecover?<div className="cg-fore-evidence">
       {evidenceItems.map((item,position)=><button type="button" key={position} onClick={()=>onChapter&&onChapter(item.chapterId)} title={`${stageNames[name]}依据 · 版本 ${item.revision}`}>{chapterTitleOf(chaptersById,item.chapterId)}</button>)}
       {plannedRecover?<button type="button" data-kind="target" onClick={()=>onChapter&&onChapter(f.targetChapterId)} title="计划回收章节">计划：{targetTitleOf(f,chaptersById)}</button>:null}
      </div>:null}
      {items.length>0?<div className="cg-fore-plan-list">{items.map(node=><PlanCard key={node.id} node={node} chapter={chapterLabelOf(node,chaptersById)} onPlanning={onPlanning}/>)}</div>:<p className="cg-fore-stage-empty">暂无关联剧情卡</p>}
     </div>
    </div>;
   })}
  </div>
  {content?<div className="cg-fore-note" data-open={open}>
   <div className="cg-fore-note-body"><MarkdownText text={content}/></div>
   {needsToggle?<button type="button" className="cg-fore-note-toggle" aria-expanded={open} aria-label={`${open?'收起':'展开'}说明 ${f.title||''}`} onClick={()=>onToggleNote(f.id)}>{open?'收起说明':'展开说明'}</button>:null}
  </div>:null}
 </article>;
}
export function Foreshadows({call,novelId,busy,run,onChapter,onMemory,onPlanning,focusId,onFocused,planningCards}){
 const [selected,setSelected]=usePreference(`${novelId}:foreshadow-selected`,null);
 const [storedFilter,setStoredFilter]=usePreference(`${novelId}:foreshadow-filter`,'all');
 const [poll,setPoll]=useState(0),[editing,setEditing]=useState(null),[query,setQuery]=useState(''),[opened,setOpened]=useState(()=>new Set());
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},5000);return()=>clearInterval(timer);},[]);
 const suppliedCards=planningCards!==undefined;
 const resource=useResource(()=>Promise.all([call('writing.foreshadow.list',{novelId}),call('chapter.list',{novelId}),call('graph.list',{novelId}),suppliedCards?Promise.resolve(null):readPlanningCards(call,novelId)]),[call,novelId,poll,suppliedCards],`${novelId}:foreshadows${suppliedCards?':v31':''}`);
 useEffect(()=>{if((focusId||selected)&&resource.value){const f=(resource.value[0]||[]).find(f=>f.id===(focusId||selected));if(f)setEditing(f);setSelected(null);onFocused?.();}},[selected,focusId,resource.value]);
 const [foreshadows,chapters,nodes,legacyPlanning]=Array.isArray(resource.value)?resource.value:[[],[],[],{items:[],error:''}];
 const planning=useMemo(()=>suppliedCards?{items:planningCards,error:''}:legacyPlanning,[suppliedCards,planningCards,legacyPlanning]);
 const chapterById=useMemo(()=>new Map((chapters||[]).map(c=>[c.id,c])),[chapters]);
 const chapterRank=useMemo(()=>new Map((chapters||[]).map((c,index)=>[c.id,index])),[chapters]);
 const memoryById=useMemo(()=>new Map((nodes||[]).map(n=>[n.id,n])),[nodes]);
 const planNodesByForeshadow=useMemo(()=>{
  const map=new Map();
  for(const node of planning?.items||[])for(const id of Array.isArray(node?.foreshadowRefs)?node.foreshadowRefs:[])if(typeof id==='string'&&id){const list=map.get(id);if(list)list.push(node);else map.set(id,[node]);}
  return map;
 },[planning]);
 const statusFilter=statusOptions.some(([id])=>id===storedFilter)?storedFilter:'all',keyword=query.trim().toLowerCase();
 const visible=(foreshadows||[]).filter(f=>(statusFilter==='all'||f.status===statusFilter)&&(!keyword||`${f.title||''}\n${f.content||''}`.toLowerCase().includes(keyword)));
 const toggleNote=id=>setOpened(previous=>{const next=new Set(previous);next.has(id)?next.delete(id):next.add(id);return next;});
 const startNew=()=>setEditing({title:'',content:'',status:'planned',memoryRefs:[],evidence:[],targetChapterId:null,abandonReason:'',revision:0});
 return <div className="structure-page cg-fore-ledger">
 <style>{foreshadowLedgerStyles}</style>
 <div className="cg-fore-toolbar"><h2><Icon name="route"/><span>伏笔台账</span></h2><span className="cg-fore-total">{visible.length} 条</span><div className="cg-fore-search"><Icon name="search"/><input aria-label="搜索伏笔" placeholder="搜索伏笔" value={query} onChange={event=>setQuery(event.target.value)}/>{query?<button type="button" className="cg-fore-search-clear" aria-label="清空搜索" title="清空搜索" onClick={()=>setQuery('')}>×</button>:null}</div><button className="primary cg-fore-new" disabled={busy} onClick={startNew}>＋ 伏笔</button></div>
 <div className="cg-fore-filters" role="group" aria-label="状态筛选">{statusOptions.map(([id,label])=><button type="button" key={id} data-status={id} aria-pressed={statusFilter===id} onClick={()=>setStoredFilter(id)}>{label}</button>)}</div>
 {planning?.error?<p className="cg-fore-planning-error">剧情卡关联暂时读取失败：{planning.error}<button type="button" onClick={()=>resource.retry()}>重新读取</button></p>:null}
 <ResourceState resource={resource}>{resource.value&&(visible.length>0?<div className="cg-fore-list">{visible.map(f=><ForeshadowCard key={f.id} f={f} chaptersById={chapterById} chapterRank={chapterRank} planNodes={planNodesByForeshadow.get(f.id)||[]} memoryById={memoryById} onChapter={onChapter} onMemory={onMemory} onPlanning={onPlanning} onEdit={setEditing} noteOpen={opened.has(f.id)} onToggleNote={toggleNote}/>)}</div>:<div className="cg-fore-empty"><Icon name="route"/><strong>{foreshadows.length?'没有匹配的伏笔':'还没有伏笔'}</strong><p>{foreshadows.length?'换个关键词，或把状态筛选切回「全部」。':'新建一条伏笔，用「埋设 → 推进 → 回收」三个阶段把它跟住。'}</p></div>)}</ResourceState>
 {editing&&resource.value?<ForeshadowEditor {...{call,novelId,busy,run}} initial={editing} chapters={resource.value[1]} nodes={resource.value[2]} close={()=>setEditing(null)} saved={()=>{setEditing(null);setPoll(n=>n+1);}}/>:null}
 </div>;
}
export function ForeshadowEditor({call,novelId,busy,run,initial,chapters,nodes,close,saved,event,contextChapterId}){
 const write=useWritingRequest(call);
 const {value:v,base,change,dirty,cacheError,accept}=useDraft(`${novelId}:foreshadow:${initial.id||event?.id||'new'}`,initial),[quote,setQuote]=useState(''),[chapterId,setChapterId]=useState(contextChapterId||''),[evidenceKind,setEvidenceKind]=useState('plant'),[serverError,setServerError]=useState('');
 const set=(key,value)=>change(old=>({...old,[key]:value}));
 const save=()=>run(async()=>{setServerError('');try{const result=await write(initial.id?'writing.foreshadow.update':event?'writing.timelineForeshadow.create':'writing.foreshadow.create',{novelId,id:initial.id,expectedRevision:base.revision,eventId:event?.id,expectedEventRevision:base.contextEventRevision,value:v,confirmed:true,reason:event?'作者从时间节点保存关联伏笔':'作者保存时间线伏笔'});accept(initial.id?result:{...initial});saved();}catch(e){setServerError(e.message);throw e;}});
 return <Modal title={initial.id?"编辑伏笔":"新建伏笔"} close={close} className="chapter-materials-modal"><div className="structure-form"><label>名称<input aria-label="伏笔名称" value={v.title} onChange={e=>set('title',e.target.value)}/></label><MarkdownField label="说明" aria-label="伏笔说明" value={v.content} onChange={e=>set('content',e.target.value)}/><label>状态<select aria-label="伏笔状态" value={v.status} onChange={e=>set('status',e.target.value)}>{Object.entries(states).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>计划回收章节<select aria-label="计划回收章节" value={v.targetChapterId||''} onChange={e=>set('targetChapterId',e.target.value||null)}><option value="">未指定</option>{chapters.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label><details><summary>关联人物与世界（{v.memoryRefs.length}）</summary><div className="structure-checks">{nodes.map(n=><label key={n.id}><input type="checkbox" checked={v.memoryRefs.includes(n.id)} onChange={e=>set('memoryRefs',e.target.checked?[...v.memoryRefs,n.id]:v.memoryRefs.filter(id=>id!==n.id))}/>{n.name}</label>)}</div></details>{v.status==='abandoned'&&<label>放弃原因<DocumentTextarea aria-label="放弃原因" value={v.abandonReason} onChange={e=>set('abandonReason',e.target.value)}/></label>}
 <h3>正文依据</h3>{v.evidence.map((e,i)=><div className="structure-entry" key={i}><p>{evidenceKinds[e.kind]} · {chapters.find(c=>c.id===e.chapterId)?.title||'删除章'} · 版本 {e.revision}</p><blockquote>{e.evidence}</blockquote><button onClick={()=>set('evidence',v.evidence.filter((_,j)=>j!==i))}>移除此依据</button></div>)}<label>依据类型<select value={evidenceKind} onChange={e=>setEvidenceKind(e.target.value)}>{Object.entries(evidenceKinds).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>依据章节<select aria-label="伏笔依据章节" value={chapterId} onChange={e=>setChapterId(e.target.value)}><option value="">选择章节</option>{chapters.map(c=><option value={c.id} key={c.id}>{c.title} · 版本 {c.revision}</option>)}</select></label><label>已保存原文<DocumentTextarea aria-label="伏笔正文依据" value={quote} onChange={e=>setQuote(e.target.value)}/></label><button disabled={!chapterId||!quote.trim()} onClick={()=>{const ch=chapters.find(c=>c.id===chapterId);set('evidence',[...v.evidence,{kind:evidenceKind,chapterId,revision:ch.revision,evidence:quote}]);setQuote('');}}>添加正文依据</button><p className="muted">埋设、推进和回收均引用已保存原文。保存时校验，候选不会自动成为事实。</p></div><SaveBar dirty={dirty||!initial.id} {...{busy}} error={serverError||cacheError} invalid={!v.title.trim()?'请填写名称':null} onSave={save} label="保存伏笔"/>{serverError&&event&&!initial.id&&<button disabled={busy} onClick={()=>run(async()=>{const latest=await call('writing.event.get',{novelId,id:event.id});accept({...v,contextEventRevision:latest.revision});setServerError('');})}>保留填写内容并核对最新事件版本</button>}{initial.id&&<WritingHistory current={v} chapters={chapters} collection="foreshadows" dirty={dirty} {...{call,novelId,busy,run}} id={initial.id} revision={base.revision} restored={saved}/>}</Modal>;
}
