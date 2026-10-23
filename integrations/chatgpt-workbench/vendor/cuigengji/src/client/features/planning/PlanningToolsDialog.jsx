import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {chapterToolsStyle} from '../chapters/chapter-tools-style.mjs';
/** Same grouped-icon language and host-safe sheet as chapter tools, without duplicated actions. */
export function PlanningToolsDialog({page,busy,close,back,children,title:customTitle}){
 const ref=useRef(null),outsidePress=useRef(false),title=customTitle||(page==='create'?'新建与添加':page==='backup'?'规划备份与历史':'规划选项');
 useLayoutEffect(()=>{const previous=document.activeElement,dialog=ref.current;dialog.showModal();return()=>{dialog.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 useEffect(()=>{ref.current.querySelector('.chapter-tool-content').scrollTop=0;ref.current.querySelector(page==='backup'?'.chapter-tool-back':'.chapter-tool-close')?.focus({preventScroll:true});},[page]);
 const outside=e=>{if(e.target!==e.currentTarget)return false;const r=e.currentTarget.getBoundingClientRect();return e.clientX<r.left||e.clientX>=r.right||e.clientY<r.top||e.clientY>=r.bottom;};
 return <><style>{chapterToolsStyle}</style><dialog ref={ref} className="chapter-tool-sheet planning-tool-sheet" aria-label={title} onCancel={e=>{e.preventDefault();if(!busy)close();}} onPointerDown={e=>{outsidePress.current=e.button===0&&outside(e);}} onPointerCancel={()=>{outsidePress.current=false;}} onClick={e=>{const dismiss=outsidePress.current&&outside(e);outsidePress.current=false;if(dismiss&&!busy)close();}}><header className="chapter-tool-head">{page==='backup'&&<button className="chapter-tool-back" aria-label="返回规划选项" disabled={busy} onClick={back}>‹</button>}<h2>{title}</h2><button className="chapter-tool-close" aria-label={`关闭${title}`} disabled={busy} onClick={close}>×</button></header><div className="chapter-tool-content">{children}</div></dialog></>;
}
export function PlanningToolGroup({title,children}){return <section className="chapter-tool-group" aria-label={title}><h3>{title}</h3><div className="chapter-tool-grid">{children}</div></section>;}
