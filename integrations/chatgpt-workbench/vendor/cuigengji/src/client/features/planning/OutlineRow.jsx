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
