import React,{useState} from 'react';
import {TextDiff} from '../../shared/TextDiff.jsx';
/** Read-only arbitrary revision comparison, independent of restore/dirty-draft workflow. */
export function HistoryPair({versions}){
 const rows=versions.filter(v=>typeof v.content==='string'),[a,setA]=useState(''),[b,setB]=useState(''),[open,setOpen]=useState(false);
 if(rows.length<2)return null;
 const before=rows.find(v=>String(v.revision)===a)||rows[rows.length-1],after=rows.find(v=>String(v.revision)===b)||rows[0];
 return <details className="history-pair" onToggle={e=>setOpen(e.currentTarget.open)}><summary>比较任意两个历史版本</summary><div className="history-pair-controls"><label>原版本<select aria-label="历史对比原版本" value={before.revision} onChange={e=>setA(e.target.value)}>{rows.map(v=><option key={v.revision} value={v.revision}>版本 {v.revision}</option>)}</select></label><span>→</span><label>对照版本<select aria-label="历史对比对照版本" value={after.revision} onChange={e=>setB(e.target.value)}>{rows.map(v=><option key={v.revision} value={v.revision}>版本 {v.revision}</option>)}</select></label></div>{open&&<><TextDiff before={before.content} after={after.content} beforeLabel={`版本 ${before.revision}`} afterLabel={`版本 ${after.revision}`}/>{(before.summary||'')!==(after.summary||'')&&<TextDiff before={before.summary||''} after={after.summary||''} beforeLabel={`v${before.revision} 梗概`} afterLabel={`v${after.revision} 梗概`}/>}</>}</details>;
}
