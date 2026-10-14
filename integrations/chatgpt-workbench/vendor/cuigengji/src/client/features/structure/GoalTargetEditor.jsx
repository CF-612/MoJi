import React,{useState} from 'react';
import {goalUnits,goalWords,goalAmount,goalDisplay} from './goal-units.mjs';
export function GoalTargetEditor({goal,call,novelId,run,busy}){
 const [draft,setDraft]=useState(null),shown=draft||{...goalDisplay(goal.target),revision:goal.revision},words=goalWords(shown.amount,shown.unit),invalid=words===undefined;
 const change=value=>setDraft({...shown,...value});
 const save=target=>run(async()=>{await call('writing.goal.set',{novelId,expectedRevision:shown.revision,target,reason:'作者设置字数目标'});setDraft(null);});
 return <div className="structure-form"><label>目标字数<div className="row" style={{flexWrap:"nowrap"}}><input aria-label="目标字数" className="grow" style={{minWidth:0,width:0}} type="text" inputMode="decimal" placeholder="可不填" value={shown.amount} onChange={e=>change({amount:e.target.value})}/><select style={{width:110,flexShrink:0}} aria-label="目标字数单位" value={shown.unit} onChange={e=>{const unit=e.target.value;change({unit,amount:words===undefined?shown.amount:goalAmount(words,unit)});}}>{Object.entries(goalUnits).map(([id,u])=><option key={id} value={id}>{u.label}</option>)}</select></div></label>{invalid?<small role="alert">请输入有效字数，换算后须为正整数字。</small>:words!==null&&<small className="muted">共 {words.toLocaleString('zh-CN')} 字</small>}<div className="row"><button className="grow" disabled={busy||invalid} onClick={()=>save(words)}>{shown.amount?'保存目标':'清除目标'}</button>{goal.target&&shown.amount&&<button disabled={busy} onClick={()=>save(null)}>清除目标</button>}</div></div>;
}
