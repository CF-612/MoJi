import React,{useEffect,useRef} from 'react';
import {timelineToolbarStyle} from './timeline-toolbar-style.mjs';

export const timelineMenuAvailableHeight=({top,columnBottom,viewportBottom})=>Math.max(0,Math.floor(Math.min(columnBottom,viewportBottom)-top-8));

/** Shared presentation only. Each axis owns its projection, cursor and mutations. */
export function TimelineToolbar({mode,onModeChange,disabled=false,actionsDisabled=false,createActions=[],onLocate,zoomLabel,onZoomOut,onZoomIn,zoomOutDisabled=false,zoomInDisabled=false,moreActions=[],menuContent=null}){
 const root=useRef(null);
 const fitMenu=menu=>{
  const popup=menu.querySelector('.timeline-toolbar-popover');if(!popup)return;
  const column=menu.closest('.timeline-workspace-column'),visual=window.visualViewport;
  const viewportBottom=visual?visual.offsetTop+visual.height:window.innerHeight;
  const height=timelineMenuAvailableHeight({top:popup.getBoundingClientRect().top,columnBottom:column?.getBoundingClientRect().bottom??viewportBottom,viewportBottom});
  popup.style.setProperty('--timeline-menu-height',height+'px');
 };
 const closeMenus=(except=null)=>root.current?.querySelectorAll('details[open]').forEach(menu=>{if(menu!==except)menu.open=false;});
 useEffect(()=>{
  const outside=e=>{if(!root.current?.contains(e.target))closeMenus();};
  document.addEventListener('pointerdown',outside);
  return()=>document.removeEventListener('pointerdown',outside);
 },[]);
 useEffect(()=>{closeMenus();},[mode,disabled]);
 useEffect(()=>{
  const fitOpen=()=>root.current?.querySelectorAll('details[open]').forEach(fitMenu);
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(fitOpen);
  if(root.current)observer?.observe(root.current);
  const column=root.current?.closest('.timeline-workspace-column');if(column)observer?.observe(column);
  window.addEventListener('resize',fitOpen);window.addEventListener('scroll',fitOpen,true);
  window.visualViewport?.addEventListener('resize',fitOpen);window.visualViewport?.addEventListener('scroll',fitOpen);
  return()=>{observer?.disconnect();window.removeEventListener('resize',fitOpen);window.removeEventListener('scroll',fitOpen,true);window.visualViewport?.removeEventListener('resize',fitOpen);window.visualViewport?.removeEventListener('scroll',fitOpen);};
 },[]);
 const escape=e=>{if(e.key==='Escape'){const menu=e.target.closest('details[open]');if(menu){e.preventDefault();menu.open=false;menu.querySelector('summary')?.focus();}}};
 const actionButtons=actions=>actions.map(action=><button type="button" key={action.id} disabled={disabled||actionsDisabled||action.disabled} onClick={()=>{closeMenus();action.onClick?.();}}>{action.label}</button>);
 const menu=(label,actions,content,kind)=><details className={`timeline-toolbar-menu ${kind}`} onToggle={e=>{if(e.currentTarget.open){closeMenus(e.currentTarget);fitMenu(e.currentTarget);}}}><summary aria-label={label} aria-disabled={disabled||undefined} onClick={e=>{if(disabled)e.preventDefault();}}>{kind==='create'?<>＋ 新建 <span aria-hidden="true">⌄</span></>:<span aria-hidden="true">···</span>}</summary><div className="timeline-toolbar-popover" aria-label={label}>{actionButtons(actions)}{content}</div></details>;
 return <header className="timeline-toolbar" ref={root} onKeyDown={escape}><style>{timelineToolbarStyle}</style>
  <div className="timeline-toolbar-modes" role="group" aria-label="时间线坐标">{[['narration','叙述顺序'],['story','故事时间']].map(([id,label])=><button type="button" key={id} aria-pressed={mode===id} disabled={disabled} onClick={()=>{closeMenus();if(mode!==id)onModeChange?.(id);}}>{label}</button>)}</div>
  <div className="timeline-toolbar-actions">
   {createActions.length>0&&menu('新建时间线内容',createActions,null,'create')}
   {onLocate&&<button type="button" aria-label="定位时间指针" disabled={disabled} onClick={onLocate}>定位</button>}
   {(onZoomOut||onZoomIn||zoomLabel!=null)&&<div className="timeline-toolbar-zoom" role="group" aria-label="时间线缩放"><button type="button" aria-label="缩小时间线" disabled={disabled||zoomOutDisabled||!onZoomOut} onClick={onZoomOut}>−</button><span title="滚轮或加减按钮缩放">{zoomLabel}</span><button type="button" aria-label="放大时间线" disabled={disabled||zoomInDisabled||!onZoomIn} onClick={onZoomIn}>＋</button></div>}
   {(moreActions.length>0||menuContent)&&menu('时间线更多操作',moreActions,menuContent,'more')}
  </div>
 </header>;
}
