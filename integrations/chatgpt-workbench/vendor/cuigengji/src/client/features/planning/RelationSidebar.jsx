import React,{useState,useRef,useEffect,useLayoutEffect} from 'react';
import {relationSidebarWidth,relationSidebarKey} from './relation-viewport.mjs';
const read=key=>{try{const v=JSON.parse(localStorage.getItem(key));return {collapsed:v?.collapsed===true,ratio:Number.isFinite(v?.ratio)?Math.max(.2,Math.min(.6,v.ratio)):1/3};}catch{return {collapsed:false,ratio:1/3};}};
export function useRelationSidebar(novelId,mode,reveal){
 const key=relationSidebarKey(novelId,mode),[record,setRecord]=useState(()=>({key,...read(key)})),[width,setWidth]=useState(0),ref=useRef(null),drag=useRef(null);
 const value=record.key===key?record:{key,...read(key)};
 const update=patch=>setRecord(old=>{const next={...(old.key===key?old:{key,...read(key)}),...patch};try{localStorage.setItem(key,JSON.stringify(next));}catch{}return next;});
 useEffect(()=>{if(reveal)update({collapsed:false});},[reveal,key]);
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const measure=()=>setWidth(el.clientWidth);measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();});
 const size=relationSidebarWidth(width,value.ratio),resize=x=>{const box=ref.current?.getBoundingClientRect();if(box?.width)update({ratio:relationSidebarWidth(box.width,(box.right-x)/box.width)/box.width});};
 return {ref,collapsed:value.collapsed,style:{'--relation-sidebar-width':`${size}px`},toggle:()=>update({collapsed:!value.collapsed}),separator:{role:'separator',tabIndex:0,'aria-label':'调整人物关系侧栏宽度','aria-orientation':'vertical','aria-valuemin':280,'aria-valuemax':Math.max(280,width-440),'aria-valuenow':Math.round(size),onPointerDown:e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();drag.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);},onPointerMove:e=>{if(drag.current===e.pointerId){e.preventDefault();e.stopPropagation();resize(e.clientX);}},onPointerUp:e=>{if(drag.current===e.pointerId){drag.current=null;e.stopPropagation();}},onPointerCancel:()=>{drag.current=null;},onLostPointerCapture:()=>{drag.current=null;},onKeyDown:e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();update({ratio:e.key==='Home'?1/3:relationSidebarWidth(width,(size+(e.key==='ArrowLeft'?24:-24))/width)/width});}}}};
}
export function RelationSidebarToggle({sidebar}){return <button className="relation-sidebar-toggle" aria-expanded={!sidebar.collapsed} onClick={sidebar.toggle}>{sidebar.collapsed?'展开人物关系':'收起人物关系'} <span aria-hidden="true">{sidebar.collapsed?'‹':'›'}</span></button>;}
export function RelationSidebarDivider({sidebar}){return <div className="relation-sidebar-divider" {...sidebar.separator} title="拖动调整侧栏宽度；方向键微调，Home 恢复三分之一"/>;}
