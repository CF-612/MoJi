import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Icon} from '../../shared/icons.tsx';
import {ReferenceButton} from '../../shared/collaboration.tsx';
import {defaults,useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {ProseFind} from './ProseFind.jsx';
import {chapterToolsStyle} from './chapter-tools-style.mjs';

/** One native dialog, with a compact action grid and secondary pages. */
export function ChapterTools({busy,deleted,onUndoFormat,onMaterials,onReview,reference,find,children}){
 const [page,setPage]=useState(null),[working,setWorking]=useState(false),returnTo=useRef(null);
 const open=next=>{returnTo.current=next;setPage(next);};
 const close=()=>setPage(null);
 const action=fn=>()=>{close();fn();};
 return <><style>{chapterToolsStyle}</style><button type="button" className="tool-trigger" aria-label="正文其他操作" aria-expanded={page!==null} aria-haspopup="dialog" title="正文其他操作" onClick={()=>{document.querySelectorAll('details.menu[open]').forEach(el=>el.removeAttribute('open'));returnTo.current=null;setPage('menu');}}><Icon name="more"/></button>
 {page&&<ChapterToolDialog page={page} returnTo={returnTo.current} working={working} close={close} back={()=>setPage('menu')}>
  {page==='menu'&&<>
   <section className="chapter-tool-group" aria-label="常用"><h3>常用</h3><div className="chapter-tool-grid">
    <button data-tool="find" data-tone="purple" disabled={busy||deleted} onClick={()=>open('find')}><Icon name="search"/><span>查找与替换</span></button>
    <button data-tone="blue" disabled={busy||deleted} onClick={action(onMaterials)}><Icon name="book"/><span>本章资料</span></button>
    <button data-tone="green" disabled={busy||deleted} onClick={action(onReview)}><Icon name="list"/><span>整理建议</span></button>
    <ReferenceButton reference={reference}><Icon name="message"/><span>围绕此内容讨论</span></ReferenceButton>
    {onUndoFormat&&<button disabled={busy||deleted} onClick={action(onUndoFormat)}><Icon name="undo"/><span>撤销快速排版</span></button>}
   </div></section>
   <section className="chapter-tool-group" aria-label="外观"><h3>外观</h3><div className="chapter-tool-grid"><button data-tool="display" data-tone="red" onClick={()=>open('display')}><Icon name="type"/><span>字体字号</span></button></div></section>
   <section className="chapter-tool-group" aria-label="章节"><h3>章节</h3><div className="chapter-tool-grid" onClick={e=>{if(e.target.closest('button:not(:disabled)'))close();}}>{children}</div></section>
  </>}
  {page==='display'&&<ChapterTypography/>}
  {page==='find'&&<ProseFind {...find} embedded onBusyChange={setWorking} close={close}/>}
 </ChapterToolDialog>}</>;
}

function ChapterToolDialog({page,returnTo,working,close,back,children}){
 const ref=useRef(null),outsidePress=useRef(false);
 const title=page==='display'?'字体设置':page==='find'?'查找与替换':'正文选项';
 useLayoutEffect(()=>{const previous=document.activeElement,dialog=ref.current;dialog.showModal();return()=>{dialog.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 useEffect(()=>{const dialog=ref.current;dialog.querySelector('.chapter-tool-content').scrollTop=0;const focus=page==='menu'&&returnTo?dialog.querySelector(`[data-tool="${returnTo}"]`):dialog.querySelector(page==='menu'?'.chapter-tool-close':'.chapter-tool-back');focus?.focus({preventScroll:true});},[page,returnTo]);
 const outside=e=>{if(e.target!==e.currentTarget)return false;const r=e.currentTarget.getBoundingClientRect();return e.clientX<r.left||e.clientX>=r.right||e.clientY<r.top||e.clientY>=r.bottom;};
 return <dialog ref={ref} className="chapter-tool-sheet" data-page={page} aria-label={title} onCancel={e=>{e.preventDefault();if(!working)close();}} onPointerDown={e=>{outsidePress.current=e.button===0&&outside(e);}} onPointerCancel={()=>{outsidePress.current=false;}} onClick={e=>{const dismiss=outsidePress.current&&outside(e);outsidePress.current=false;if(dismiss&&!working)close();}}>
  <header className="chapter-tool-head">{page!=='menu'&&<button type="button" className="chapter-tool-back" aria-label="返回正文选项" disabled={working} onClick={back}>‹</button>}<h2>{title}</h2><button type="button" className="chapter-tool-close" aria-label={`关闭${title}`} disabled={working} onClick={close}>×</button></header>
  <div className="chapter-tool-content">{children}</div>
 </dialog>;
}

function ChapterTypography(){
 const {preferences:p,update,error}=useWorkbenchPreferences();
 return <div className="chapter-typography">
  <p className="chapter-tool-note">调整正文的字号与行距，立即生效。</p>
  <div className="chapter-font-row"><label htmlFor="chapter-font-size">大小</label><input id="chapter-font-size" aria-label="正文字号" type="range" min="16" max="22" step="2" value={p.fontSize} onChange={e=>update({fontSize:Number(e.target.value)})}/><output htmlFor="chapter-font-size">{p.fontSize}</output><button type="button" className="chapter-font-reset" aria-label="恢复默认字号与行距" title="恢复默认字号与行距" onClick={()=>update({fontSize:defaults.fontSize,leading:defaults.leading})}><Icon name="refresh"/></button></div>
  <div className="chapter-leading"><span id="chapter-leading-label">行距</span><div role="group" aria-labelledby="chapter-leading-label">{[[1.7,'紧凑'],[1.95,'适中'],[2.2,'宽松']].map(([value,label])=><button type="button" key={value} aria-pressed={p.leading===value} onClick={()=>update({leading:value})}>{label}</button>)}</div></div>
  <div className="chapter-font-preview"><small>正文预览</small><p style={{fontSize:p.fontSize,lineHeight:p.leading}}>雨停以后，街道重新安静下来。窗边的灯仍亮着，故事还在继续。</p></div>
  <p className="chapter-tool-note" role="status">{error||'偏好自动保存在此浏览器'}</p>
 </div>;
}
