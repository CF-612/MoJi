import React,{useContext,useEffect,useRef,useState} from 'react';
import {SessionScope} from '../../shared/state.js';
import {QUICK_PUNCTUATION,quickInsertion,normalizeQuickPhrases,moveQuickPhrase,quickPhrasesKey} from './quick-input.mjs';
import {efficiencyStyle} from './efficiency-style.mjs';
function readPhrases(key){try{return {phrases:normalizeQuickPhrases(JSON.parse(localStorage.getItem(key)||'[]')),error:''};}catch{return {phrases:[],error:'无法读取本机快捷短语。请检查浏览器存储权限。'};}}
export function useQuickPhrases(novelId){
 const scope=useContext(SessionScope),key=quickPhrasesKey(scope,novelId),[state,setState]=useState(()=>({key,...readPhrases(key)}));
 const current=state.key===key?state:{key,...readPhrases(key)},latest=useRef(current);latest.current=current;
 useEffect(()=>{if(state.key!==key)setState({key,...readPhrases(key)});},[key]);
 const update=next=>{const phrases=normalizeQuickPhrases(typeof next==='function'?next(latest.current.phrases):next);let error='';try{localStorage.setItem(key,JSON.stringify(phrases));}catch{error='快捷短语仅暂存在本次页面，浏览器存储失败；刷新后可能丢失。';}const value={key,phrases,error};latest.current=value;setState(value);};
 return {phrases:current.phrases,error:current.error,update};
}
export function QuickInputBar({textareaRef,onInsert,phrases=[],paired=true,hidden=false,disabled=false,onManage}){
 const bar=useRef(null),[active,setActive]=useState(false);
 useEffect(()=>{const focus=()=>setActive(document.activeElement===textareaRef.current||!!bar.current?.contains(document.activeElement));focus();document.addEventListener('focusin',focus);return()=>document.removeEventListener('focusin',focus);},[textareaRef]);
 if(hidden||!active)return null;
 const insert=item=>{
  const element=textareaRef.current;if(!element||element.disabled||element.readOnly||disabled)return;
  const before=element.value,result=quickInsertion(before,element.selectionStart,element.selectionEnd,item.text,paired?item.close||'':'');
  element.focus({preventScroll:true});const top=element.scrollTop;
  // insertText participates in the native textarea undo stack where supported.
  let native=false;try{native=typeof document.execCommand==='function'&&document.execCommand('insertText',false,result.insert);}catch{}
  if(!native)element.setRangeText(result.insert,element.selectionStart,element.selectionEnd,'end');
  element.setSelectionRange(result.start,result.end);element.scrollTop=top;
  onInsert?.(element.value,{before,inputType:'insertText',selection:{start:result.start,end:result.end},nativeUndo:native});
 };
 return <><style>{efficiencyStyle}</style><div ref={bar} className="quick-input-bar" aria-label="正文快捷输入"><div className="quick-input-scroll">{QUICK_PUNCTUATION.map(item=><button key={item.text} type="button" disabled={disabled} onPointerDown={e=>e.preventDefault()} onClick={()=>insert(item)} aria-label={`插入${item.text}${paired?item.close||'':''}`}>{item.text}{paired?item.close||'':''}</button>)}{phrases.map(item=><button className="quick-phrase" key={item.id} type="button" disabled={disabled} title={item.text} onPointerDown={e=>e.preventDefault()} onClick={()=>insert(item)}>{item.text}</button>)}</div>{onManage&&<button type="button" className="quick-manage" onClick={onManage}>短语</button>}</div></>;
}
export function QuickInputSettings({phrases=[],update,error='',enabled=false,onEnabledChange,paired=true,onPairedChange}){
 const [editing,setEditing]=useState(null),[text,setText]=useState(''),[dragTarget,setDragTarget]=useState(null),drag=useRef(null),list=useRef(null);
 const move=(from,to)=>update(moveQuickPhrase(phrases,from,to));
 const finishDrag=()=>{if(drag.current!==null&&dragTarget!==null)move(drag.current,dragTarget);drag.current=null;setDragTarget(null);};
 return <><style>{efficiencyStyle}</style><div className="efficiency-settings">
  <label className="efficiency-setting-row"><span>显示快捷输入栏</span><input type="checkbox" checked={enabled} onChange={e=>onEnabledChange?.(e.target.checked)}/></label>
  <label className="efficiency-setting-row"><span>成对标点</span><input type="checkbox" checked={paired} onChange={e=>onPairedChange?.(e.target.checked)}/></label>
  <p className="efficiency-note">仅在正文可编辑时显示；查找或输入法组词时暂时收起。自定义短语按作品保存在此浏览器，不随作品同步。</p>
  <h3 style={{fontSize:14,margin:0}}>本作品快捷短语</h3>
  <ul ref={list} className="quick-phrase-list">{phrases.map((item,index)=><li key={item.id} data-phrase-index={index} data-drag-target={dragTarget===index} onDragOver={e=>{e.preventDefault();setDragTarget(index);}} onDrop={e=>{e.preventDefault();if(drag.current!==null)move(drag.current,index);drag.current=null;setDragTarget(null);}}>
   <span className="quick-phrase-handle" draggable aria-hidden="true" onDragStart={e=>{drag.current=index;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',item.id);}} onDragEnd={()=>{drag.current=null;setDragTarget(null);}} onPointerDown={e=>{if(e.pointerType==='mouse')return;drag.current=index;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current===null||e.pointerType==='mouse')return;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-phrase-index]');if(hit&&list.current?.contains(hit))setDragTarget(Number(hit.dataset.phraseIndex));}} onPointerUp={finishDrag} onPointerCancel={()=>{drag.current=null;setDragTarget(null);}}>⠿</span>
   <button type="button" className="phrase-label" aria-label={`编辑短语：${item.text}`} onClick={()=>{setEditing(item.id);setText(item.text);}}>{item.text}</button>
   <button type="button" aria-label={`上移短语 ${index+1}`} disabled={index===0} onClick={()=>move(index,index-1)}>↑</button><button type="button" aria-label={`下移短语 ${index+1}`} disabled={index===phrases.length-1} onClick={()=>move(index,index+1)}>↓</button>
   <button type="button" aria-label={`删除短语 ${index+1}`} onClick={()=>{update(phrases.filter(phrase=>phrase.id!==item.id));if(editing===item.id){setEditing(null);setText('');}}}>×</button>
  </li>)}</ul>
  {!phrases.length&&<p className="efficiency-note">还没有短语。添加人名、口头禅或常用表达。</p>}
  <form className="quick-phrase-form" onSubmit={e=>{e.preventDefault();if(!text.trim())return;if(editing)update(phrases.map(item=>item.id===editing?{...item,text}:item));else update([...phrases,{id:crypto.randomUUID(),text}]);setText('');setEditing(null);}}>
   <label htmlFor="quick-phrase-text">{editing?'修改短语':'添加短语'}</label><textarea id="quick-phrase-text" aria-label="快捷短语内容" maxLength={500} value={text} onChange={e=>setText(e.target.value)} placeholder="最多 500 字符"/>
   <div className="efficiency-actions">{editing&&<button type="button" onClick={()=>{setEditing(null);setText('');}}>取消修改</button>}<button type="submit" disabled={!text.trim()||(!editing&&phrases.length>=80)}>{editing?'保存修改':'添加短语'}</button></div>
  </form><p className="efficiency-note">拖动左侧手柄排序，也可使用上移 / 下移按钮。最多 80 条。</p>{error&&<p role="alert" className="efficiency-error">{error}</p>}
 </div></>;
}
