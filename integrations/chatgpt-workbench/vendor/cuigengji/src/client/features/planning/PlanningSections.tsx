import React,{useEffect,useRef,useState} from 'react';
import type {CastPerson} from '../../shared/CastAvatars.tsx';
import type {PlanningEdge,PlanningNode} from '../../../contracts/planning.ts';
import type {GroupItem} from '../../shared/groups.tsx';
import {CastPicker} from '../../shared/CastPicker.tsx';
import {ChapterEvidence} from '../../shared/evidence.jsx';
import {GroupSelect} from '../../shared/groups.tsx';
import {displayNumberedTitle} from '../../../domain/title-numbering.js';

type Numbering='chinese'|'arabic';
type SetValue=(key:string,next:unknown)=>void;
type ChapterItem={id:string;title:string;revision:number};
type MemoryItem={id:string;name:string};
type ForeshadowItem={id:string;title:string;status?:string};
type Call=(action:string,args:Record<string,unknown>)=>Promise<unknown>;
export type PlanningTabItem={id:string;label:string};
interface SectionBase{value:PlanningNode;busy:boolean;editing:boolean;set:SetValue;}

/** 伏笔状态与「伏笔台账」保持同一套文案。 */
export const foreshadowStates:Record<string,string>={planned:'计划',planted:'已埋设',developing:'推进中',recovered:'已回收',abandoned:'已放弃'};
const stateLabel=(status?:string)=>status&&foreshadowStates[status]?foreshadowStates[status]:'未标记';

/** 四个子页面共用一套样式；类名统一前缀 .plan-tab-，全部限定在 .cuigengji 下。 */
export const planningTabStyles=`
.cuigengji .plan-tabs {min-width:0;margin:20px 0 8px;}
.cuigengji .plan-tab-list {display:flex;flex-wrap:nowrap;gap:2px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;margin:0 0 16px;border-bottom:1px solid var(--cg-line);}
.cuigengji .plan-tab-list button {flex:none;white-space:nowrap;margin:0;padding:7px 12px;min-height:36px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent;color:var(--cg-muted);font-size:13px;}
.cuigengji .plan-tab-list button[aria-selected=true] {border-color:transparent;border-bottom-color:var(--cg-accent);background:transparent;color:var(--cg-accent);font-weight:600;}
.cuigengji .plan-tab-list button:focus-visible {outline:2px solid var(--cg-accent);outline-offset:-2px;}
.cuigengji .plan-tab-panel {min-width:0;padding:0 0 10px;}
.cuigengji .plan-tab-panel[hidden] {display:none;}
.cuigengji .plan-tab-body {display:flex;flex-direction:column;gap:18px;min-width:0;}
.cuigengji .plan-tab-fields {min-width:0;margin:0;padding:0;border:0;}
.cuigengji .plan-tab-block {min-width:0;}
.cuigengji .plan-tab-block h3 {margin:0 0 8px;font-size:13px;font-weight:600;color:var(--cg-ink);}
.cuigengji .plan-tab-note {margin:0 0 8px;font-size:12px;line-height:1.7;color:var(--cg-muted);}
.cuigengji .plan-tab-empty {margin:4px 0;font-size:12px;line-height:1.7;color:var(--cg-muted);}
.cuigengji .plan-tab-text {margin:4px 0;font-size:13px;line-height:1.75;color:var(--cg-ink);overflow-wrap:anywhere;}
.cuigengji .plan-tab-meta {margin:0 0 6px;font-size:12px;color:var(--cg-muted);}
.cuigengji .plan-tab-row {display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0;font-size:12px;line-height:1.6;color:var(--cg-ink);}
.cuigengji .plan-tab-row button {margin-left:auto;min-height:28px;padding:3px 8px;font-size:12px;}
.cuigengji .plan-tab-options {display:flex;flex-direction:column;gap:1px;max-height:220px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;margin:6px 0 0;padding:3px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);}
.cuigengji .plan-tab-option {display:flex;align-items:center;gap:8px;min-height:32px;margin:0;padding:3px 7px;border-radius:6px;font-size:12px;}
.cuigengji .plan-tab-option:hover {background:var(--cg-wash);}
.cuigengji .plan-tab-option input {flex:none;margin:0;}
.cuigengji .plan-tab-option-name {flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .plan-tab-option button {flex:none;min-height:26px;padding:2px 7px;font-size:11px;}
.cuigengji .plan-tab-warn {flex:none;font-size:10px;color:var(--cg-orange);}
.cuigengji .plan-tab-search {width:100%;min-height:34px;margin:8px 0 0;padding:6px 10px;font-size:12px;}
.cuigengji .plan-tab-results {display:flex;flex-direction:column;gap:1px;max-height:190px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;margin:6px 0 0;padding:3px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);}
.cuigengji .plan-tab-results button {display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:4px 7px;border:0;border-radius:6px;background:transparent;text-align:left;white-space:normal;}
.cuigengji .plan-tab-results button:hover {background:var(--cg-wash);}
.cuigengji .plan-tab-result-name {flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;}
.cuigengji .plan-tab-pills {display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;}
.cuigengji .plan-tab-pill {display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%;padding:2px 4px 2px 10px;border:1px solid color-mix(in srgb,var(--cg-line) 80%,transparent);border-radius:999px;background:var(--cg-wash);}
.cuigengji .plan-tab-pill-name {min-width:0;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--cg-ink);}
.cuigengji .plan-tab-status {flex:none;font-size:10px;line-height:1.6;padding:0 7px;border:1px solid color-mix(in srgb,var(--cg-line) 70%,transparent);border-radius:999px;background:var(--cg-paper);color:var(--cg-muted);white-space:nowrap;}
.cuigengji .plan-tab-status.state-planted,.cuigengji .plan-tab-status.state-developing {border-color:color-mix(in srgb,var(--cg-accent) 35%,transparent);color:var(--cg-accent);}
.cuigengji .plan-tab-status.state-recovered {border-color:color-mix(in srgb,var(--cg-orange) 35%,transparent);color:var(--cg-orange);}
.cuigengji .plan-tab-status.state-abandoned {opacity:.62;text-decoration:line-through;}
.cuigengji .plan-tab-pill button {flex:none;min-width:22px;min-height:22px;padding:0 6px;border:0;background:transparent;color:var(--cg-muted);font-size:14px;line-height:1;cursor:pointer;}
.cuigengji .plan-tab-pill button:hover {color:var(--cg-orange);}
@container(max-width:480px) {
 .cuigengji .plan-tabs {margin-top:14px;}
 .cuigengji .plan-tab-list {gap:0;}
 .cuigengji .plan-tab-list button {padding:7px 10px;font-size:12px;}
 .cuigengji .plan-tab-pill-name {max-width:110px;}
}
@media(max-width:480px) {
 .cuigengji .plan-tabs {margin-top:14px;}
 .cuigengji .plan-tab-list {gap:0;}
 .cuigengji .plan-tab-list button {padding:7px 10px;font-size:12px;}
 .cuigengji .plan-tab-pill-name {max-width:110px;}
}
`;

/** 页签条：语义化 tablist，左右方向键与 Home/End 切换，焦点跟随。 */
export function PlanningTabs({tabs,active,onChange,children}:{tabs:PlanningTabItem[];active:string;onChange:(id:string)=>void;children:React.ReactNode}){
 const refs=useRef<(HTMLButtonElement|null)[]>([]);
 const move=(index:number)=>{
  const next=(index+tabs.length)%tabs.length;
  onChange(tabs[next].id);
  refs.current[next]?.focus();
 };
 const keyDown=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{
  if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();move(index+1);}
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();move(index-1);}
  else if(event.key==='Home'){event.preventDefault();move(0);}
  else if(event.key==='End'){event.preventDefault();move(tabs.length-1);}
 };
 return <div className="plan-tabs">
  <style>{planningTabStyles}</style>
  <div className="plan-tab-list" role="tablist" aria-label="剧情卡详情分区">
   {tabs.map((tab,index)=><button key={tab.id} type="button" role="tab" id={`plan-tab-${tab.id}`} aria-selected={active===tab.id} aria-controls={`plan-tabpanel-${tab.id}`} tabIndex={active===tab.id?0:-1} ref={element=>{refs.current[index]=element;}} onClick={()=>onChange(tab.id)} onKeyDown={event=>keyDown(event,index)}>{tab.label}</button>)}
  </div>
  {children}
 </div>;
}

/** 只显示当前页签的面板；隐藏时保留填写状态，切回来草稿还在。 */
export function PlanningTabPanel({id,active,children}:{id:string;active:boolean;children:React.ReactNode}){
 return <section className="plan-tab-panel" id={`plan-tabpanel-${id}`} role="tabpanel" aria-labelledby={`plan-tab-${id}`} hidden={!active} tabIndex={0}>{children}</section>;
}

/** 时间位置：绑定章节、跨度与范围、所属阶段、故事线。 */
export function PlanningTimeSection({value,set,busy,editing,id,nodes,chapters,numbering,onChapter,call,novelId,scopeNames,threadText,setThreadText}:SectionBase&{
 id:string;nodes:PlanningNode[];chapters:ChapterItem[];numbering:Numbering;onChapter:(chapterId:string)=>void;call:Call;novelId:string;
 scopeNames:Record<string,string>;threadText:string;setThreadText:(text:string)=>void;
}){
 const refs=value.chapterRefs||[];
 const [query,setQuery]=useState('');
 const parent=nodes.find(node=>node.id===value.parentId);
 const titleOf=(chapterId:string)=>displayNumberedTitle(chapters.find(chapter=>chapter.id===chapterId)?.title,numbering)||'已删除或缺失章节';
 if(!editing) return <div className="plan-tab-body">
  <section className="plan-tab-block"><h3>章节关联</h3>{refs.length?refs.map(ref=><ChapterEvidence key={ref.chapterId} source={ref} title={chapters.find(chapter=>chapter.id===ref.chapterId)?.title} {...{call,novelId,onChapter}}/>):<p className="plan-tab-empty">尚未关联正文章节。</p>}</section>
  <section className="plan-tab-block"><h3>范围与阶段</h3><p className="plan-tab-text">范围：{scopeNames[value.scope]||value.scope}</p><p className="plan-tab-text">所属阶段：{parent?parent.title:'全书'}</p><p className="plan-tab-text">故事线：{value.threads.join('、')||'未指定'}</p></section>
 </div>;
 const term=query.trim();
 const matched=chapters.filter(chapter=>!term||String(chapter.title||'').includes(term)||String(displayNumberedTitle(chapter.title,numbering)||'').includes(term));
 const toggle=(chapter:ChapterItem,checked:boolean)=>{
  const rest=refs.filter(ref=>ref.chapterId!==chapter.id);
  set('chapterRefs',checked?[...rest,{chapterId:chapter.id,revision:chapter.revision}]:rest);
 };
 return <fieldset className="editor-fields plan-tab-fields" disabled={busy||value.deleted}>
  <section className="plan-tab-block"><h3>章节关联</h3><p className="plan-tab-note">关联正文后，章节与剧情卡可以互相跳转；正文改写导致版本变化时会在这里提示。</p>
   {refs.map(ref=><p className="plan-tab-row" key={ref.chapterId}>{titleOf(ref.chapterId)} · 版本{ref.revision}<button type="button" onClick={()=>set('chapterRefs',refs.filter(item=>item.chapterId!==ref.chapterId))}>移除</button></p>)}
   <input className="plan-tab-search" aria-label="筛选关联章节" placeholder="搜索章节名称" value={query} onChange={event=>setQuery(event.target.value)}/>
   {matched.length?<div className="plan-tab-options">{matched.map(chapter=><label className="plan-tab-option" key={chapter.id}><input type="checkbox" checked={refs.some(ref=>ref.chapterId===chapter.id)} onChange={event=>toggle(chapter,event.target.checked)}/><span className="plan-tab-option-name">{displayNumberedTitle(chapter.title,numbering)}</span>{refs.some(ref=>ref.chapterId===chapter.id&&ref.revision!==chapter.revision)&&<span className="plan-tab-warn">正文版本已变化</span>}<button type="button" onClick={()=>onChapter(chapter.id)}>打开</button></label>)}</div>:<p className="plan-tab-empty">没有匹配章节</p>}
  </section>
  <label>范围<select value={value.scope} onChange={event=>set('scope',event.target.value)}>{Object.entries(scopeNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
  <label>所属阶段<select value={value.parentId||''} onChange={event=>set('parentId',event.target.value||null)}><option value="">全书</option>{nodes.filter(node=>node.id!==id).map(node=><option key={node.id} value={node.id}>{node.title}</option>)}</select></label>
  <label>故事线（逗号分隔）<input value={threadText} onChange={event=>{setThreadText(event.target.value);set('threads',[...new Set(event.target.value.split(/[,，]/).map(text=>text.trim()).filter(Boolean))]);}}/></label>
 </fieldset>;
}

/** 人物关联：出场人物与关联资料。 */
export function PlanningCastSection({value,set,busy,editing,people,memory,onMemory}:SectionBase&{
 people:CastPerson[];memory:MemoryItem[];onMemory:(nodeId:string)=>void;
}){
 const cast=value.cast||[],refs=value.memoryRefs||[];
 const [query,setQuery]=useState('');
 if(!editing) return <div className="plan-tab-body">
  <section className="plan-tab-block"><h3>出场人物</h3>{cast.length?<p className="plan-tab-text">{cast.map(ref=>`${people.find(person=>person.id===ref.nodeId)?.name||'已删除人物'}${ref.kind==='mention'?'（仅提及）':''}`).join('、')}</p>:<p className="plan-tab-empty">还没有关联出场人物。</p>}</section>
  <section className="plan-tab-block"><h3>关联资料</h3>{refs.length?refs.map(ref=><p className="plan-tab-text" key={ref}><button type="button" onClick={()=>onMemory(ref)}>{memory.find(item=>item.id===ref)?.name||'已删除或缺失设定'}</button></p>):<p className="plan-tab-empty">还没有关联人物设定或世界资料。</p>}</section>
 </div>;
 const term=query.trim();
 const memories=memory.filter(item=>!term||String(item.name||'').includes(term));
 return <fieldset className="editor-fields plan-tab-fields" disabled={busy||value.deleted}>
  <p className="plan-tab-note">标记为「出场」的人物会出现在卡片右上角；标记为「仅提及」的人物只记录在详情里，不进头像组。</p>
  <CastPicker cast={cast} people={people} busy={busy} onChange={next=>set('cast',next)} onOpenPerson={onMemory}/>
  <section className="plan-tab-block"><h3>关联资料</h3>
   {refs.map(ref=><p className="plan-tab-row" key={ref}>{memory.find(item=>item.id===ref)?.name||'已删除或缺失设定'}<button type="button" onClick={()=>set('memoryRefs',refs.filter(id=>id!==ref))}>移除</button></p>)}
   <input className="plan-tab-search" aria-label="筛选关联资料" placeholder="搜索人物设定或世界资料" value={query} onChange={event=>setQuery(event.target.value)}/>
   {memories.length?<div className="plan-tab-options">{memories.map(item=><label className="plan-tab-option" key={item.id}><input type="checkbox" checked={refs.includes(item.id)} onChange={event=>set('memoryRefs',event.target.checked?[...refs,item.id]:refs.filter(id=>id!==item.id))}/><span className="plan-tab-option-name">{item.name}</span></label>)}</div>:<p className="plan-tab-empty">没有匹配资料</p>}
  </section>
 </fieldset>;
}

/** 伏笔关联：胶囊 + 状态徽章，输入即搜、点结果加入；列表首次切到本页签才加载。 */
export function PlanningForeshadowSection({value,set,busy,editing,active,call,novelId}:SectionBase&{active:boolean;call:Call;novelId:string}){
 const refs=Array.isArray(value.foreshadowRefs)?value.foreshadowRefs:[];
 const [items,setItems]=useState<ForeshadowItem[]|null>(null);
 const [error,setError]=useState('');
 const [attempt,setAttempt]=useState(0);
 const [query,setQuery]=useState('');
 const started=useRef(false);
 useEffect(()=>{
  if(!active||started.current)return;
  started.current=true;
  setError('');
  Promise.resolve(call('writing.foreshadow.list',{novelId})).then(result=>{
   const list=Array.isArray(result)?result.filter(item=>item&&typeof item.id==='string'):[];
   setItems(list.map(item=>({id:item.id,title:typeof item.title==='string'&&item.title.trim()?item.title:'未命名伏笔',status:typeof item.status==='string'?item.status:''})));
  },failure=>{started.current=false;setError(failure?.message||String(failure));});
 },[active,call,novelId,attempt]);
 const retry=()=>{started.current=false;setAttempt(count=>count+1);};
 const byId=new Map((items||[]).map(item=>[item.id,item]));
 const pills=refs.length?<div className="plan-tab-pills">{refs.map(ref=>{const item=byId.get(ref);return <span className="plan-tab-pill" key={ref}>
  <span className="plan-tab-pill-name" title={item?item.title:ref}>{item?item.title:'已删除或缺失伏笔'}</span>
  {item&&<span className={`plan-tab-status${item.status?' state-'+item.status:''}`}>{stateLabel(item.status)}</span>}
  {editing&&<button type="button" disabled={busy} aria-label={`移除 ${item?item.title:'伏笔'}`} onClick={()=>set('foreshadowRefs',refs.filter(id=>id!==ref))}>×</button>}
 </span>;})}</div>:<p className="plan-tab-empty">还没有关联伏笔。</p>;
 const state=!items?<p className="plan-tab-empty" role="status">{error?`伏笔列表读取失败：${error}`:'正在读取伏笔…'}{error&&<button type="button" onClick={retry}>重试</button>}</p>:null;
 if(!editing) return <div className="plan-tab-body">
  <section className="plan-tab-block"><h3>关联伏笔</h3>{pills}{state}</section>
  <p className="plan-tab-note">埋设、推进与回收的正文依据仍记录在「伏笔台账」；这里只把剧情卡与伏笔串起来。</p>
 </div>;
 const term=query.trim().toLowerCase();
 const available=(items||[]).filter(item=>!refs.includes(item.id)&&(!term||item.title.toLowerCase().includes(term))).slice(0,12);
 return <fieldset className="editor-fields plan-tab-fields" disabled={busy||value.deleted}>
  <p className="plan-tab-note">输入伏笔名称即可搜索并加入；已选伏笔显示名称与当前状态。伏笔被删除后旧剧情卡仍保留引用，可手动移除。</p>
  {pills}{state}
  <input className="plan-tab-search" aria-label="搜索伏笔" placeholder="搜索伏笔名称并添加…" value={query} onChange={event=>setQuery(event.target.value)}/>
  {term&&<div className="plan-tab-results">{available.map(item=><button type="button" key={item.id} onClick={()=>{set('foreshadowRefs',[...refs,item.id]);setQuery('');}}><span className="plan-tab-result-name">{item.title}</span><span className={`plan-tab-status${item.status?' state-'+item.status:''}`}>{stateLabel(item.status)}</span></button>)}{!available.length&&<p className="plan-tab-empty">没有匹配伏笔</p>}</div>}
 </fieldset>;
}

/** 剧情关联：前因后果、连线管理与所属分组。 */
export function PlanningPlotSection({value,set,busy,editing,groups,edges,nodes,id,adjacent,onSelect,continueFrom,latest,base,dirty,transact,confirm,statusNames}:SectionBase&{
 groups:GroupItem[];edges:PlanningEdge[];nodes:PlanningNode[];id:string;
 adjacent:(direction:'before'|'after')=>PlanningNode[];
 onSelect:(nodeId:string)=>void;continueFrom:(node:PlanningNode)=>void;
 latest?:PlanningNode;base:PlanningNode;dirty:boolean;
 transact:(operations:unknown[],reason:string)=>unknown;confirm:(message:string)=>Promise<boolean>;
 statusNames:Record<string,string>;
}){
 const [target,setTarget]=useState('');
 const before=adjacent('before'),after=adjacent('after');
 const related=edges.filter(edge=>edge.from===id||edge.to===id);
 const titleOf=(nodeId:string)=>nodes.find(node=>node.id===nodeId)?.title||'已删除规划';
 return <div className="plan-tab-body">
  <section className="flow-context" aria-label="情节前后关系"><div><small>从哪里来</small>{before.length?before.map(node=><button key={node.id} onClick={()=>onSelect(node.id)}>{node.title}</button>):<p>这条路线的起点</p>}</div><span aria-hidden="true">→</span><div><small>当前情节</small><strong>{value.title}</strong><span className="status-badge">{statusNames[value.status]}</span></div><span aria-hidden="true">→</span><div><small>接下来</small>{after.length?after.map(node=><button key={node.id} onClick={()=>onSelect(node.id)}>{node.title}</button>):<p>等待讨论下一步</p>}<button disabled={busy||dirty||value.deleted} title={dirty?'先保存当前节点，再继续推进':undefined} onClick={()=>continueFrom(latest||base)}>＋ 接着推进</button></div></section>
  <section className="plan-tab-block"><h3>所属分组</h3>{editing?<GroupSelect groups={groups} value={value.groupId} onChange={groupId=>set('groupId',groupId)}/>:<p className="plan-tab-text">{groups.find(group=>group.id===value.groupId)?.name||'未分组'}</p>}</section>
  <section className="plan-tab-block"><h3>连线管理</h3><p className="plan-tab-note">连线表示剧情推进、依赖铺垫或备选分支；不同页面的规划不能直接连线。</p>
   {related.length?related.map(edge=><div key={edge.id} className="source-row">{titleOf(edge.from)} → {titleOf(edge.to)}<button disabled={busy} onClick={async()=>{if(await confirm('删除这条规划关系？'))transact([{op:'edge.delete',id:edge.id,expectedRevision:edge.revision,confirm:true}],'删除规划关系');}}>移除</button></div>):<p className="plan-tab-empty">还没有连线。</p>}
   <div className="row"><select aria-label="目标规划" value={target} onChange={event=>setTarget(event.target.value)}><option value="">选择目标</option>{nodes.filter(node=>node.id!==id).map(node=><option key={node.id} value={node.id}>{node.title}</option>)}</select><button disabled={busy||!target} onClick={()=>transact([{op:'edge.create',value:{from:id,to:target,type:'next'}}],'建立剧情关系')}>连接</button></div>
  </section>
 </div>;
}
