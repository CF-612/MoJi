import React,{useEffect,useRef} from 'react';
import {createOutlineGesture,isOutlineActionTarget as actionTarget} from './outline-row-interaction.mjs';
export function OutlineRow({volume,fold,hasChildren,title,onToggle,onEdit,children,...props}) {
 const callbacks=useRef(null);callbacks.current={onToggle,onEdit};
 const gesture=useRef(null);
 if(!gesture.current)gesture.current=createOutlineGesture({toggle:()=>callbacks.current.onToggle(),edit:()=>callbacks.current.onEdit()});
 useEffect(()=>{
  if(!volume)return;
  const cancel=()=>gesture.current.cancel();
  window.addEventListener('scroll',cancel,true);window.addEventListener('blur',cancel);
  return()=>{window.removeEventListener('scroll',cancel,true);window.removeEventListener('blur',cancel);gesture.current.dispose();};
 },[volume]);
 const g=gesture.current;
 return <div {...props} {...(volume?{
  role:'button',tabIndex:0,'aria-expanded':hasChildren?!fold:undefined,'aria-label':`${title}，${fold?'展开':'收起'}；双击编辑`,'aria-keyshortcuts':'Enter Space F2',
  title:'单击展开 / 收起 · 双击或右键编辑 · 手机长按编辑',
  onClick:e=>{if(!actionTarget(e))g.click(e);},onDoubleClick:e=>{if(!actionTarget(e)){e.preventDefault();g.double();}},
  onContextMenu:e=>{if(!actionTarget(e)){e.preventDefault();g.context();}},
  onPointerDown:e=>{if(!actionTarget(e)&&e.button===0)g.down(e);},onPointerMove:e=>g.move(e),onPointerUp:()=>g.up(),onPointerCancel:()=>g.cancel(),
  onDragStart:e=>{g.cancel();props.onDragStart?.(e);},
  onKeyDown:e=>{if(actionTarget(e))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();g.cancel();onToggle();}else if(e.key==='F2'){e.preventDefault();g.cancel();onEdit();}},
 }: {})}>{children}</div>;
}

// Source titles are immutable here; folding and summary editing are distinct targets.
export function OutlineSourceTitle({title,fold,onToggle}){
 return <button type="button" className="u-title u-source-title" aria-expanded={!fold} aria-label={`${title}，${fold?'展开':'收起'}`} onClick={e=>{e.stopPropagation();if(e.detail<=1)onToggle();}} onDoubleClick={e=>{e.preventDefault();e.stopPropagation();}}><span>{title}</span><svg className={fold?'is-folded':'is-expanded'} aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>;
}
export function OutlineSourceSummary({title,summary,onEdit,disabled=false}){
 const latest=useRef(null);latest.current={onEdit,disabled};const gesture=useRef(null);
 if(!gesture.current)gesture.current=createOutlineGesture({toggle:()=>{},edit:()=>{if(!latest.current.disabled)latest.current.onEdit();}});
 useEffect(()=>()=>gesture.current.dispose(),[]);const g=gesture.current;
 return <p className="u-summary u-source-summary" role="button" tabIndex={disabled?-1:0} aria-disabled={disabled} aria-label={`编辑 ${title} 的梗概`} title="双击编辑梗概 · 手机长按编辑" onClick={e=>e.stopPropagation()} onDoubleClick={e=>{e.preventDefault();e.stopPropagation();g.double();}} onPointerDown={e=>{e.stopPropagation();if(!disabled&&e.button===0)g.down(e);}} onPointerMove={e=>g.move(e)} onPointerUp={()=>g.up()} onPointerCancel={()=>g.cancel()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '||e.key==='F2'){e.preventDefault();e.stopPropagation();if(!disabled)onEdit();}}}>{summary}</p>;
}
