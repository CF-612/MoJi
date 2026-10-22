import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Modal} from '../../shared/preferences.tsx';
import {proseMatches,replaceMatch} from './editor-text.mjs';
const errorText=e=>e?.message||String(e);
/** Search the visible draft without a save/network round trip. Only bulk confirmation is modal. */
export function ProseFind({call,novelId,chapterId,content,prepare,applied,replaceCurrent,onMatches,onLocate,close,onBusyChange,disabled=false}){
 const [query,setQuery]=useState(''),[replacement,setReplacement]=useState(''),[expanded,setExpanded]=useState(false),[current,setCurrent]=useState(0),[preview,setPreview]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[receipt,setReceipt]=useState(null),[result,setResult]=useState(null);
 const queryRef=useRef(null),callbacks=useRef({onMatches,onLocate});callbacks.current={onMatches,onLocate};
 const matches=useMemo(()=>proseMatches(content,query),[content,query]),index=matches.length?Math.min(current,matches.length-1):0;
 useEffect(()=>{queryRef.current?.focus({preventScroll:true});return()=>callbacks.current.onMatches?.(null);},[]);
 useEffect(()=>{callbacks.current.onMatches?.({query,matches,current:index});},[query,matches,index]);
 useEffect(()=>{onBusyChange?.(busy);return()=>onBusyChange?.(false);},[busy,onBusyChange]);
 useEffect(()=>{if(query&&matches.length)callbacks.current.onLocate?.(matches[0],0);},[query]);
 const navigate=step=>{const next=(index+step+matches.length)%matches.length;setCurrent(next);callbacks.current.onLocate?.(matches[next],next);};
 const inspect=async scope=>{setBusy(true);setError('');setResult(null);try{const barrier=await prepare(scope),found=await call('writing.prose.search',{novelId,query,replacement,...(scope==='chapter'?{chapterIds:[chapterId]}:{})});barrier.assertClean();setPreview({...found,scope,barrier});}catch(e){setError(errorText(e));}finally{setBusy(false);}};
 const apply=async()=>{setBusy(true);setError('');const request=receipt||{novelId,query,replacement,...(preview.scope==='chapter'?{chapterIds:[chapterId]}:{}),fingerprint:preview.fingerprint,confirmed:true,requestId:crypto.randomUUID()};let attempted=!!receipt;
  try{preview.barrier.assertClean();setReceipt(request);attempted=true;const done=await call('writing.prose.replace',request);await applied(preview.barrier);setResult({count:done.count,chapters:preview.chapters});setReceipt(null);setPreview(null);}
  catch(e){setError(errorText(e));if(!attempted||['CONFLICT','INVALID_INPUT','HUMAN_REQUIRED'].includes(e?.code)){setReceipt(null);setPreview(null);}}finally{setBusy(false);}};
 return <section className="prose-find" aria-label="正文查找与替换" onKeyDown={e=>{if(e.key==='Escape'&&!busy&&!receipt){e.preventDefault();close();}if(e.key==='Enter'&&!e.nativeEvent.isComposing&&e.target===queryRef.current&&matches.length){e.preventDefault();navigate(e.shiftKey?-1:1);}}}>
  <div className="prose-find-row"><label className="prose-find-input"><span className="sr-only">查找原文</span><input ref={queryRef} aria-label="查找原文" placeholder="查找本章原文" maxLength={1000} value={query} disabled={busy||!!receipt} onChange={e=>{setQuery(e.target.value);setCurrent(0);setError('');setResult(null);}}/><output aria-live="polite">{matches.length?index+1:0}/{matches.length}</output></label><button aria-label="展开或收起替换" aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>⇄</button><button aria-label="上一处匹配" disabled={!matches.length} onClick={()=>navigate(-1)}>↑</button><button aria-label="下一处匹配" disabled={!matches.length} onClick={()=>navigate(1)}>↓</button><button aria-label="关闭查找" disabled={busy||!!receipt} onClick={close}>×</button></div>
  {expanded&&<div className="prose-find-row replace"><input aria-label="替换为" placeholder="替换为（留空即删除）" maxLength={10000} value={replacement} disabled={busy||!!receipt} onChange={e=>setReplacement(e.target.value)}/><button disabled={disabled||busy||!matches.length||!!receipt} onClick={()=>{try{replaceCurrent(replaceMatch(content,matches[index],query,replacement),matches[index].start+replacement.length);setResult(null);}catch(e){setError(errorText(e));}}}>当前</button><button disabled={disabled||busy||!query||!!receipt} onClick={()=>inspect('chapter')}>本章</button><button disabled={disabled||busy||!query||!!receipt} onClick={()=>inspect('book')}>全书</button></div>}
  {error&&<p className="prose-find-message" role="alert">{error}</p>}
  {busy&&!preview&&<p className="prose-find-message" role="status">正在保护草稿并准备预览…</p>}
  {result&&<details className="prose-find-message"><summary>已替换 {result.count} 处 · {result.chapters.length} 章（恢复说明）</summary><p>各章保留替换前历史。到该章“版本历史”比较并恢复；恢复前会保护当前稿。没有一键整批撤销，不会自动覆盖后续写作。</p>{result.chapters.map(c=><p key={c.chapterId}>{c.title} · 替换前版本 {c.revision}</p>)}</details>}
  {preview&&<Modal title={receipt?'核对同一次替换':'确认批量替换'} close={()=>{if(!busy&&!receipt)setPreview(null);}} className="prose-replace-confirm"><p><strong>{preview.scope==='book'?'全书':'本章'}：{preview.count} 处 · {preview.chapters.length} 章</strong></p><p className="muted">先保存了此设备的待同步草稿。版本发生变化会中止；每章保留历史，可逐章恢复，不提供一键整批撤销。</p><div className="prose-replace-preview">{preview.chapters.map(c=><details key={c.chapterId}><summary>{c.title} · {c.count} 处 · 替换前 v{c.revision}</summary>{c.snippets.map(s=><blockquote key={s.start}>{s.before}<mark>{s.match}</mark>{s.after}<br/>→ {replacement||'（删除）'}</blockquote>)}{c.count>c.snippets.length&&<small>只预览前 {c.snippets.length} 处；将替换全部 {c.count} 处。</small>}</details>)}</div>{error&&<p role="alert">{error}</p>}{receipt&&<p role="status">结果尚未确认。请重试同一次请求核对，不会重复创建替换；暂时保留此面板。</p>}<div className="row"><button disabled={busy||!!receipt} onClick={()=>setPreview(null)}>取消</button><button className="primary" disabled={busy||!preview.count} onClick={apply}>{busy?'处理中…':receipt?'重试同一次替换':'确认替换'}</button></div></Modal>}
 </section>;
}
export function ProseMatchLayer({content,state,appearance}){
 const parts=[];let end=0;
 for(const [i,match] of (state?.matches||[]).entries()){parts.push(content.slice(end,match.start));parts.push(<mark key={match.start} data-prose-match={i} data-current={i===state.current}>{content.slice(match.start,match.end)}</mark>);end=match.end;}
 parts.push(content.slice(end));
 return <div className="prose-match-layer manuscript" aria-hidden="true" style={appearance}>{parts}{'\n'}</div>;
}
