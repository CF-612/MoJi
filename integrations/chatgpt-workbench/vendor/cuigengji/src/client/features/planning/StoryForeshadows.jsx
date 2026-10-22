import React,{useState,useEffect,useRef} from 'react';
import {useResource,usePreference,useDraft} from '../../shared/state.js';
import {useWritingRequest} from '../../shared/writing-request.js';
import {Modal} from '../../shared/preferences.tsx';
import {useDialog} from '../../dialog.tsx';
import {WritingHistory} from '../../shared/WritingHistory.jsx';
import {foreshadowStyle} from './story-foreshadow-style.mjs';

const kinds={plant:'埋设',progress:'推进',recover:'回收'};
const compactStates={planned:'计划中',planted:'已埋设',developing:'推进中',partial:'部分回收',recovered:'已回收',open:'开放结局',abandoned:'已放弃'};
function summaryStatus(f){
 const plans=[...new Set((f.plotNodes||[]).filter(n=>!n.evidence).map(n=>n.kind))];
 return f.status==='planned'&&plans.length===1&&kinds[plans[0]]?'计划'+kinds[plans[0]]:compactStates[f.status]||'计划中';
}
const filters=[['all','全部'],['planned','未开始'],['active','进行中'],['partial','部分回收'],['recovered','已完成'],['open','开放结局']];
const blank=()=>({title:'',content:'',revision:0,plotNodes:[],resolution:'active'});
const cleanNodes=nodes=>(nodes||[]).map(({review,...node})=>node);
const placement=(card,chapters)=>{const ids=card?.chapterRefs?.map(c=>c.chapterId)||[],names=ids.map(id=>chapters.find(c=>c.id===id)?.title).filter(Boolean);return names.length?names[0]+(names.length>1?` 等 ${names.length} 章`:''):'时间待安排';};

export function Foreshadows({call,novelId,busy,run,onChapter,onPlanning,planningCards=[],storyRevision,focusId,onFocused,initialCardId,onClearCard}){
 const [selected,setSelected]=usePreference(`${novelId}:foreshadow-selected`,null),[storedFilter,setFilter]=usePreference(`${novelId}:foreshadow-filter`,'all');
 const [expandedIds,setExpandedIds]=usePreference(`${novelId}:v31-foreshadow-expanded`,[]);
 const expanded=new Set(Array.isArray(expandedIds)?expandedIds:[]);
 const toggle=id=>setExpandedIds(ids=>{const current=Array.isArray(ids)?ids:[];return current.includes(id)?current.filter(value=>value!==id):[...current,id];});
 const filter=filters.some(([id])=>id===storedFilter)?storedFilter:'all';
 const [poll,setPoll]=useState(0),[editing,setEditing]=useState(null),[query,setQuery]=useState(''),[focus,setFocus]=useState(null);
 const resource=useResource(()=>Promise.all([call('writing.foreshadow.list',{novelId}),call('chapter.list',{novelId})]),[call,novelId,poll],`${novelId}:v31-foreshadow-nodes`);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},5000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{if(focusId||selected){const id=focusId||selected;setFocus(id);setExpandedIds(ids=>[...new Set([...(Array.isArray(ids)?ids:[]),id])]);setFilter('all');setQuery('');setSelected(null);onFocused?.();}},[focusId,selected]);
 const container=useRef(null);useEffect(()=>{if(focus&&container.current)container.current.scrollTop=0;},[focus]);
 useEffect(()=>{if(initialCardId){setFilter('all');setQuery('');if(container.current)container.current.scrollTop=0;}},[initialCardId]);
 const [rows,chapters]=resource.value||[[],[]],cards=new Map(planningCards.map(c=>[c.id,c]));
 const visible=rows.filter(f=>(filter==='all'||filter==='active'?filter==='all'||['planted','developing'].includes(f.status):f.status===filter)&&(!query||`${f.title}\n${f.content}`.includes(query)));
 const sorted=[...visible].sort((a,b)=>Number(b.id===focus)-Number(a.id===focus)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const editNode=(f,node)=>setEditing({f,mode:'node',node:node||{id:crypto.randomUUID(),kind:'plant',cardId:initialCardId||'',note:'',evidence:null},fresh:!node});
 return <section ref={container} className="sf-page" aria-label="伏笔台账"><style>{foreshadowStyle}</style>
  <header className="sf-toolbar"><div><small>让线索慢慢生长</small><h2>伏笔</h2></div><span className="sf-total">{rows.length} 条线索</span><button className="sf-primary" disabled={busy} onClick={()=>setEditing({f:blank(),mode:'body'})}>＋ 新建伏笔</button></header>
  <div className="sf-controls"><input aria-label="搜索伏笔" placeholder="搜索名称或说明" value={query} onChange={e=>setQuery(e.target.value)}/><div className="sf-filters" aria-label="伏笔进度筛选">{filters.map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div></div>
  {initialCardId&&<div className="sf-context">为「{cards.get(initialCardId)?.title||'剧情卡'}」安排伏笔：选择一条线索，添加节点。<button onClick={onClearCard}>结束选择</button></div>}
  {resource.error&&<p role="alert">{resource.error}<button onClick={resource.retry}>重试</button></p>}
  {resource.loading&&!resource.value&&<p role="status">正在读取伏笔…</p>}
  <div className="sf-list">{sorted.map(f=><article key={f.id} className="sf-card" data-focused={focus===f.id} data-state={f.status} data-expanded={expanded.has(f.id)} aria-label={`伏笔 ${f.title}`}>
   <header><span className="sf-mark" aria-hidden="true">✧</span><div className="sf-title"><h3>{f.title}</h3>{expanded.has(f.id)&&<p>{f.content||'还没有说明，先留住这个想法。'}</p>}<div className="sf-summary"><span className="sf-status" data-state={f.status}>{summaryStatus(f)}</span><small>{(f.plotNodes||[]).length} 个节点</small>{f.review&&<span className="sf-review-badge">依据待复核</span>}</div></div><button type="button" className="sf-toggle" aria-expanded={expanded.has(f.id)} aria-controls={`sf-details-${f.id}`} aria-label={`${expanded.has(f.id)?'收起':'展开'}伏笔 ${f.title}`} onClick={()=>toggle(f.id)}>{expanded.has(f.id)?'收起':'展开'}<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></header>
   <div className="sf-details" id={`sf-details-${f.id}`} hidden={!expanded.has(f.id)}>
   {f.review&&<p className="sf-review">正文已改写或移除，请复核标记的依据。</p>}
   <div className="sf-stages">{Object.entries(kinds).map(([kind,label],i)=>{const nodes=(f.plotNodes||[]).filter(n=>n.kind===kind);return <section className="sf-stage" data-kind={kind} key={kind}><h4><span>{String(i+1).padStart(2,'0')}</span>{label}<small>{nodes.length}</small></h4><div className="sf-stage-nodes">{nodes.length?nodes.map(node=><div className="sf-node" key={node.id} data-fact={!!node.evidence}>
    <div className="sf-node-meta"><span>{node.review?'依据待复核':node.evidence?'正文已确认':'计划'}</span><button aria-label={`编辑${label}节点 ${cards.get(node.cardId)?.title||'剧情卡缺失'}`} onClick={()=>editNode(f,node)}>编辑</button></div>
    <button className="sf-plot-link" disabled={!cards.has(node.cardId)} onClick={()=>onPlanning(node.cardId)}>{cards.get(node.cardId)?.title||'剧情卡已移除 · 请重新挂载'}</button><small>计划位置：{placement(cards.get(node.cardId),chapters)}</small>{node.note&&<p>{node.note}</p>}
    {node.evidence&&<button className="sf-evidence-link" onClick={()=>onChapter(node.evidence.chapterId,node.evidence)}>依据：{chapters.find(c=>c.id===node.evidence.chapterId)?.title||'章节已移除'} · v{node.evidence.revision}</button>}
   </div>):<p className="sf-empty-stage">还没安排{label}</p>}</div></section>;})}</div>
   {!!f.evidence?.length&&<details className="sf-earlier"><summary>已有正文依据 · {f.evidence.length} 处</summary>{f.evidence.map((e,i)=><p key={i}>{kinds[e.kind]} · <button onClick={()=>onChapter(e.chapterId,e)}>{chapters.find(c=>c.id===e.chapterId)?.title||'章节已移除'}</button><q>{e.evidence}</q></p>)}</details>}
   <footer><button className="sf-add" disabled={busy} onClick={()=>editNode(f)}>＋ 添加节点</button><span>{(f.plotNodes||[]).filter(n=>n.evidence).length} 个正文确认节点</span><div><button disabled={busy} onClick={()=>setEditing({f,mode:'body'})}>编辑说明</button><button disabled={busy} onClick={()=>setEditing({f,mode:'resolution'})}>管理进度</button></div></footer>
   </div>
  </article>)}</div>
  {!sorted.length&&!resource.loading&&<div className="sf-empty"><span>✧</span><h3>{rows.length?'没有匹配的线索':'先留下一条线索'}</h3><p>{rows.length?'试试其他关键词或进度。':'只需名称和说明，埋设与回收可以以后再安排。'}</p></div>}
  {editing&&<ShadowEditor key={`${editing.f.id||'new'}:${editing.mode}:${editing.node?.id||''}`} {...{call,novelId,busy,run,storyRevision,chapters,cards}} {...editing} close={()=>setEditing(null)} saved={()=>{setEditing(null);setPoll(p=>p+1);}}/>}
 </section>;
}

function ShadowEditor({call,novelId,busy,run,storyRevision,chapters,cards,f,mode,node,fresh,close,saved}){
 const {confirm}=useDialog(),write=useWritingRequest(call);
 const initial={...f,plotNodes:cleanNodes(f.plotNodes),draftNode:node?{...node,review:undefined}:null};
 const {value,base,change,accept,dirty,cacheError}=useDraft(`${novelId}:v31-shadow:${f.id||'new'}:${mode}:${fresh?'new':node?.id||''}`,initial);
 const [error,setError]=useState(''),[saving,setSaving]=useState(false),[fact,setFact]=useState(!!value.draftNode?.evidence),[chapterId,setChapterId]=useState(value.draftNode?.evidence?.chapterId||''),[quote,setQuote]=useState(value.draftNode?.evidence?.evidence||'');
 const chapter=useResource(()=>chapterId?call('chapter.get',{novelId,chapterId,maxChars:200000}):Promise.resolve(null),[call,novelId,chapterId],chapterId?`${novelId}:shadow-evidence:${chapterId}`:null);
 const set=(key,next)=>change(v=>({...v,[key]:next})),setNode=(key,next)=>change(v=>({...v,draftNode:{...v.draftNode,[key]:next}}));
 const discard=async()=>{if(saving)return;if(!dirty||await confirm('放弃这次未保存的伏笔修改？')){accept(initial);close();}};
 const submit=async(remove=false)=>{
  let patch;
  if(mode==='body')patch={title:value.title,content:value.content,...(!f.id?{plotNodes:[],resolution:'active',evidence:[],memoryRefs:[]}: {})};
  else if(mode==='resolution')patch={plotNodes:cleanNodes(value.plotNodes),resolution:value.resolution||'active'};
  else{
   const previous=value.draftNode?.evidence;
   const evidence=fact?(previous?.coordinate==='lf-utf16'&&previous.chapterId===chapterId&&previous.revision===chapter.value?.revision&&previous.evidence===quote?previous:{chapterId,revision:chapter.value?.revision,evidence:quote}):null;
   const next={...value.draftNode,evidence};
   patch={plotNodes:remove?cleanNodes(value.plotNodes).filter(n=>n.id!==node.id):fresh?[...cleanNodes(value.plotNodes),next]:cleanNodes(value.plotNodes).map(n=>n.id===node.id?next:n),resolution:value.resolution||'active'};
  }
  setSaving(true);setError('');try{await write('story.foreshadow.save',{novelId,id:f.id,expectedRevision:storyRevision,expectedForeshadowRevision:base.revision,value:patch});accept(initial);saved();}catch(e){setError(e.message);}finally{setSaving(false);}
 };
 const current=chapter.value?.id===chapterId||chapter.value?.chapterId===chapterId?chapter.value:null;
 const validQuote=!!current&&!chapter.loading&&!chapter.error&&quote.trim()&&current.content?.includes(quote);
 const invalid=mode==='body'?!value.title.trim():mode==='node'?(!cards.has(value.draftNode.cardId)||(fact&&!validQuote)):false;
 const title=mode==='body'?(f.id?'编辑伏笔':'新建伏笔'):mode==='node'?(fresh?'添加伏笔节点':'编辑伏笔节点'):'管理伏笔进度';
 return <Modal title={title} close={discard} className="sf-dialog"><style>{foreshadowStyle}</style><form className="sf-form" onSubmit={e=>{e.preventDefault();void submit();}}>
  {mode==='body'?<><p className="sf-form-intro">先把想法记下来，剧情与正文依据以后再补。</p><label>名称<input aria-label="伏笔名称" autoFocus value={value.title} onChange={e=>set('title',e.target.value)} required/></label><label>说明<textarea aria-label="伏笔说明" placeholder="这条线索想留下什么悬念？" value={value.content} onChange={e=>set('content',e.target.value)}/></label></>:mode==='node'?<>
   <p className="sf-form-intro">{f.title}</p><div className="sf-form-grid"><label>节点类型<select aria-label="节点类型" value={value.draftNode.kind} onChange={e=>setNode('kind',e.target.value)}>{Object.entries(kinds).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>关联剧情卡<select aria-label="关联剧情卡" value={value.draftNode.cardId} onChange={e=>setNode('cardId',e.target.value)}><option value="">选择剧情卡</option>{[...cards.values()].map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
   <label>节点说明<textarea aria-label="节点说明" value={value.draftNode.note} onChange={e=>setNode('note',e.target.value)} placeholder="这一处埋下、推进或解答什么？"/></label>
   <div className="sf-mode" role="group" aria-label="节点性质"><button type="button" aria-pressed={!fact} onClick={()=>{setFact(false);setNode('evidence',null);}}>先做计划</button><button type="button" aria-pressed={fact} onClick={()=>{setFact(true);setNode('evidence',value.draftNode.evidence||{});}}>确认正文</button></div>
   {fact?<div className="sf-proof"><p>从已保存的正文中引用原文，保存即确认这一处事实。</p><label>依据章节<select aria-label="依据章节" value={chapterId} onChange={e=>{setChapterId(e.target.value);setQuote('');setNode('evidence',{chapterId:e.target.value});}}><option value="">选择已保存章节</option>{chapters.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>{chapter.error&&<p role="alert">{chapter.error}<button type="button" onClick={chapter.retry}>重试</button></p>}{current&&<details open><summary>已保存正文 · 版本 {current.revision}</summary><pre>{current.content}</pre></details>}<label>引用原文<textarea aria-label="引用原文" value={quote} onChange={e=>{setQuote(e.target.value);setNode('evidence',{chapterId,revision:current?.revision,evidence:e.target.value});}}/></label>{quote&&!validQuote&&<small>引用需要完整匹配当前已保存正文。</small>}</div>:<p className="sf-help">时间位置跟随剧情卡。移动或采用剧情卡，都不会自动变成正文事实。</p>}
  </>:<><h3>{f.title}</h3><p className="sf-form-intro">一个回收节点只代表部分回收。由你决定何时结束这条线索。</p>{[['active','继续发展','根据已确认节点显示未开始、进行中或部分回收。'],['complete','确认完成','需要埋设与回收的正文依据；完成由你亲自决定。'],['open','保留开放结局','明确留下悬念，停止催促回收。']].map(([id,label,note])=><label className="sf-resolution" key={id}><input type="radio" name="resolution" value={id} checked={(value.resolution||'active')===id} onChange={()=>set('resolution',id)}/><span><strong>{label}</strong><small>{note}</small></span></label>)}</>}
  {(error||cacheError)&&<p className="sf-review" role="alert">{error||cacheError}</p>}
  {error&&f.id&&<button type="button" onClick={async()=>{const latest=await call('writing.foreshadow.get',{novelId,id:f.id});if(await confirm(`服务器现为版本 ${latest.revision}。重新读取会替换这份表单，确认后可重新编辑。`)){accept({...latest,plotNodes:cleanNodes(latest.plotNodes),draftNode:mode==='node'?(latest.plotNodes?.find(n=>n.id===node.id)||node):null});setError('');close();}}}>核对最新版本</button>}
  <footer className="sf-form-actions">{mode==='node'&&!fresh&&<button type="button" className="sf-danger" disabled={saving||busy} onClick={async()=>{if(await confirm('移除这个伏笔节点及它的依据？伏笔本体与剧情卡会保留。'))void submit(true);}}>移除节点</button>}<button type="button" onClick={discard}>取消</button><button type="submit" className="sf-primary" disabled={saving||busy||invalid}>{saving?'保存中…':mode==='node'&&fact?'确认正文并保存':'保存'}</button></footer>
 </form>{f.id&&mode==='body'&&<WritingHistory current={value} chapters={chapters} collection="foreshadows" dirty={dirty} {...{call,novelId,busy,run}} id={f.id} revision={base.revision} restored={saved}/>}</Modal>;
}

export function PlotForeshadows({call,novelId,cardId,onOpen,onAdd}){
 const resource=useResource(()=>call('writing.foreshadow.list',{novelId}),[call,novelId,cardId],`${novelId}:plot-shadows:${cardId}`);
 const rows=(resource.value||[]).filter(f=>f.plotNodes?.some(n=>n.cardId===cardId));
 return <section className="sf-plot-section"><h3>伏笔节点</h3>{resource.error&&<p role="alert">{resource.error}</p>}{rows.map(f=><button type="button" key={f.id} onClick={()=>onOpen(f.id)}><span>{f.title}</span><small>{f.plotNodes.filter(n=>n.cardId===cardId).map(n=>kinds[n.kind]).join(' · ')} →</small></button>)}{!rows.length&&<p className="muted">这张剧情卡还没有伏笔节点。</p>}<button type="button" onClick={onAdd}>＋ 为此剧情卡添加伏笔节点</button></section>;
}
