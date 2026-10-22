import React,{useEffect,useRef,useState} from 'react';
import {Modal} from '../../shared/preferences.tsx';
import {useModules} from '../../modules/context.tsx';
import {useDialog} from '../../dialog.tsx';
import {useAutosizeTextarea} from '../../shared/useAutosizeTextarea.ts';
import {selectionStyle} from './prose-selection-style.mjs';
export const normalizeSelectionText=value=>String(value||'').replace(/\r\n?/g,'\n');
export function captureProseSelection(element,chapterId){
 if(!element||element.selectionEnd<=element.selectionStart)return null;
 return {chapterId,content:element.value,start:element.selectionStart,end:element.selectionEnd,evidence:element.value.slice(element.selectionStart,element.selectionEnd)};
}
const kinds=[['character','角色','人'],['world','世界书','世'],['card','剧情卡','卡'],['foreshadow','伏笔','伏']];
const stages={plant:'埋设',progress:'推进',recover:'回收'};
function Note({value,onChange}){const ref=useRef(null);useAutosizeTextarea(ref,value);return <textarea ref={ref} aria-label="补充说明" rows={2} placeholder="可留空，稍后在卡片里完善" value={value} onChange={onChange}/>;}
export function ProseSelection({call,novelId,selection,chapterTitle,dirty,stale,prepare,close,onSaved,onOpen,onLocate}){
 const modules=useModules(),{confirm}=useDialog();
 const [kind,setKind]=useState('character'),[mode,setMode]=useState('new'),[title,setTitle]=useState(''),[note,setNote]=useState(''),[query,setQuery]=useState(''),[id,setId]=useState(''),[linkKind,setLinkKind]=useState('reference');
 const [stage,setStage]=useState(''),[cardId,setCardId]=useState(''),[nodeId,setNodeId]=useState(''),[data,setData]=useState(null),[error,setError]=useState(''),[working,setWorking]=useState(false),[result,setResult]=useState(null);
 const request=useRef(null),alive=useRef(true),lock=useRef(false);
 const load=async()=>{try{const [story,nodes,shadows]=await Promise.all([call('story.get',{novelId}),call('graph.list',{novelId}),modules.foreshadow?call('writing.foreshadow.list',{novelId}):[]]);if(alive.current)setData({story,nodes,shadows});}catch(e){if(alive.current)setError(e.message);}};
 useEffect(()=>{alive.current=true;void load();return()=>{alive.current=false;};},[]);
 const pickKind=value=>{setKind(value);setId('');setNodeId('');setQuery('');setStage('');setCardId('');};
 const discard=async()=>{if(lock.current)return;if(result||(!title&&!note&&!id)||await confirm('放弃这次尚未保存的关联填写？选中的正文不会修改。'))close();};
 const items=kind==='card'?Object.values(data?.story.state.cards||{}):kind==='foreshadow'?data?.shadows||[]:(data?.nodes||[]).filter(n=>kind==='character'?n.type==='character_card':n.type!=='character_card');
 const selected=items.find(item=>item.id===id),plans=(selected?.plotNodes||[]).filter(p=>!p.evidence),plan=plans.find(p=>p.id===nodeId),cards=Object.values(data?.story.state.cards||{});
 const visible=items.filter(item=>[item.name,item.title,...item.aliases||[]].some(s=>s?.toLowerCase().includes(query.toLowerCase())));
 const uncertain=!!error&&request.current?.uncertain;
 const invalid=stale?'正文已变化，请返回重新选择。':!selection.evidence.trim()?'请选择包含文字的正文。':selection.evidence.length>2000?'选区超过 2000 个字符，请缩小范围。':mode==='new'&&!title.trim()?'请填写名称':mode==='existing'&&!selected?'请选择已有对象':kind==='foreshadow'&&!plan&&!stage?'请选择节点阶段':'';
 const submit=async e=>{
  e.preventDefault();if(lock.current||invalid&&!uncertain||!data)return;lock.current=true;setWorking(true);setError('');
  try{
   // Exact same request survives a lost response. Never mint another object on retry.
   const target={kind,...(mode==='existing'?{id,expectedRevision:selected.revision}:{title:title.trim()}),note,...(kind==='character'?{linkKind}:{}),...(kind==='foreshadow'?{stage:plan?.kind||stage,cardId:plan?.cardId||cardId,nodeId:plan?.id,cardTitle:mode==='new'?title.trim():selected.title}:{})};
   const intent=JSON.stringify(target);let args;
   if(request.current?.intent===intent&&request.current?.uncertain)args=request.current.args;
   else{
    const proof=await prepare(selection);
    args={novelId,requestId:crypto.randomUUID(),confirmed:true,expectedRevision:data.story.state.revision,selection:proof,target};
    request.current={intent,args,uncertain:true};
   }
   const saved=await call('story.selection.apply',args);request.current.uncertain=false;
   if(alive.current){setResult(saved);onSaved?.();}
  }catch(e){
   if(request.current&&(/已有更新|重新选择|无效|不存在|请选择|请填写|已删除|已有正文依据|请由作者|不支持/.test(e.message)||['CONFLICT','INVALID_SELECTION','INVALID_WRITING'].includes(e.code)))request.current.uncertain=false;
   if(alive.current)setError(e.message);
  }finally{lock.current=false;if(alive.current)setWorking(false);}
 };
 return <Modal title="从正文创建与关联" className="prose-selection-modal" close={discard}><style>{selectionStyle}</style>
  <div className="ps-source"><div><span className="ps-eyebrow">正文选区</span><span>{selection.evidence.length} 字符</span></div><blockquote>{selection.evidence}</blockquote><footer>{chapterTitle}<span>{result?`已保存版本 ${result.proof.revision}`:dirty?'含未保存修改，确认时先保存正文':'确认时核对已保存版本'}</span></footer></div>
  {result?<section className="ps-success" role="status"><span className="ps-success-mark">✓</span><h3>已关联「{result.title}」</h3><p>原文和章节版本已一同保留。</p><div className="ps-actions"><button onClick={()=>{close();onLocate(selection);}}>返回选中原文</button><button className="primary" onClick={()=>{close();onOpen(result);}}>查看{kinds.find(k=>k[0]===result.kind)?.[1]}</button></div></section>:<form className="ps-form" onSubmit={submit}>
   <fieldset disabled={working||uncertain}>
    <div className="ps-kinds" role="group" aria-label="选择对象类型">{kinds.filter(([k])=>k!=='foreshadow'||modules.foreshadow).map(([key,label,glyph])=><button key={key} type="button" aria-pressed={key===kind} onClick={()=>pickKind(key)}><span aria-hidden="true">{glyph}</span>{label}</button>)}</div>
    <div className="ps-mode" role="group" aria-label="创建或关联">{[['new','新建'],['existing','关联已有']].map(([key,label])=><button key={key} type="button" aria-pressed={mode===key} onClick={()=>{setMode(key);setId('');setNodeId('');}}>{label}</button>)}</div>
    {mode==='new'?<label className="ps-field">{kind==='character'?'角色姓名':'名称'}<input aria-label="新建对象名称" maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} placeholder={kind==='foreshadow'?'给这条伏笔起个名字':'输入名称'}/></label>:<div className="ps-existing"><input type="search" aria-label="搜索已有对象" placeholder={`搜索已有${kinds.find(k=>k[0]===kind)?.[1]}`} value={query} onChange={e=>setQuery(e.target.value)}/><div className="ps-results" role="group" aria-label="已有对象">{visible.map(item=><button key={item.id} type="button" aria-pressed={id===item.id} onClick={()=>{setId(item.id);setNodeId('');}}><span><strong>{item.name||item.title}</strong>{item.summary&&<small>{item.summary}</small>}</span><span aria-hidden="true">{id===item.id?'✓':'○'}</span></button>)}{data&&!visible.length&&<p>没有匹配的对象，可以切换到新建。</p>}{!data&&<p>读取候选…</p>}</div></div>}
    {kind==='character'&&<label className="ps-field">与这段正文的关系<select aria-label="人物关联方式" value={linkKind} onChange={e=>setLinkKind(e.target.value)}><option value="reference">仅关联资料</option><option value="appearance">确认为正式出场</option><option value="mention">确认为仅被提及</option></select></label>}
    {kind==='foreshadow'&&<section className="ps-node"><div className="ps-section-title">伏笔节点<small>这段原文将作为节点依据</small></div>{mode==='existing'&&selected&&<label className="ps-field">加入位置<select aria-label="伏笔加入位置" value={nodeId} onChange={e=>setNodeId(e.target.value)}><option value="">添加一个节点</option>{plans.map(p=><option key={p.id} value={p.id}>补充计划依据 · {stages[p.kind]} · {cards.find(c=>c.id===p.cardId)?.title||'原卡已删除'}</option>)}</select></label>}{plan?<p className="ps-plan-summary">{stages[plan.kind]} · {cards.find(c=>c.id===plan.cardId)?.title||'原卡已删除'}</p>:<><label className="ps-field">节点阶段<select aria-label="伏笔节点阶段" value={stage} onChange={e=>setStage(e.target.value)}><option value="">选择埋设、推进或回收</option>{Object.entries(stages).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label><label className="ps-field">关联剧情卡<select aria-label="节点关联剧情卡" value={cardId} onChange={e=>setCardId(e.target.value)}><option value="">同时新建一张同名剧情卡</option>{cards.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></>}</section>}
    {mode==='new'&&<label className="ps-field">补充说明 <small>选填</small><Note value={note} onChange={e=>setNote(e.target.value)}/></label>}
   </fieldset>
   {(error||stale||selection.evidence.length>2000)&&<div className="ps-error" role="alert">{error||invalid}{error&&!stale&&!uncertain&&<button type="button" onClick={async()=>{await load();request.current=null;setError('候选已更新，请核对选择后再次确认。');}}>重新读取候选</button>}</div>}
   <div className="ps-actions"><button type="button" disabled={working} onClick={discard}>返回</button><button className="primary" disabled={working||!!invalid&&!uncertain||!data} type="submit">{working?'正在记录…':uncertain?'重试这次操作':dirty?'保存正文并确认':mode==='new'?'创建并关联':'确认关联'}</button></div>
  </form>}
 </Modal>;
}
