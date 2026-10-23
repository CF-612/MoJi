import {mapSelection} from './selection.ts';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Icon} from '../../shared/icons.tsx';
import {ChapterToolIcon} from './ChapterToolIcon.jsx';
import {ReferenceButton} from '../../shared/collaboration.tsx';
import {ChapterTypography,ChapterLayout,ChapterFormat,ChapterEditingPreferences} from './ChapterAppearance.jsx';
import {chapterCopy} from './editor-text.mjs';
import {chapterToolsStyle} from './chapter-tools-style.mjs';

/** One action grid, small focused secondary pages. Find lives in the editor, not this modal. */
export function ChapterTools({busy,deleted,onUndoFormat,onFormat,onMaterials,onReview,onFind,onHistory,onBackup,reference,title,content,quickSettings,speedSettings,share,children,target,scrollTarget}){
 const [page,setPage]=useState(null),returnTo=useRef(null),snapshot=useRef(null);
 const open=next=>{returnTo.current=next;setPage(next);};
 const close=()=>{setPage(null);requestAnimationFrame(()=>{const el=target?.current,saved=snapshot.current;if(el&&saved){el.focus({preventScroll:true});const mapped=mapSelection(saved.content,el.value,saved);el.setSelectionRange(mapped.start,mapped.end,mapped.direction);if(scrollTarget?.current)scrollTarget.current.scrollTop=saved.top;}});};
 const action=fn=>()=>{close();fn?.();};
 const button=(id,label,icon,tone)=> <button data-tool={id} data-tone={tone} disabled={busy||deleted} onClick={()=>open(id)}><ChapterToolIcon name={icon}/><span>{label}</span></button>;
 return <><style>{chapterToolsStyle}</style><button type="button" className="tool-trigger" aria-label="正文其他操作" aria-expanded={page!==null} aria-haspopup="dialog" title="正文其他操作" onClick={()=>{const el=target?.current;snapshot.current=el?{content:el.value,start:el.selectionStart,end:el.selectionEnd,direction:el.selectionDirection,top:scrollTarget?.current?.scrollTop||0}:null;document.querySelectorAll('details.menu[open]').forEach(el=>el.removeAttribute('open'));returnTo.current=null;setPage('menu');}}><Icon name="more"/></button>
 {page&&<ChapterToolDialog page={page} returnTo={returnTo.current} working={false} close={close} back={()=>setPage('menu')}>
  {page==='menu'&&<>
   <section className="chapter-tool-group" aria-label="常用"><h3>常用</h3><div className="chapter-tool-grid">
    {button('copy','快捷复制','copy','green')}
    <button data-tool="find" data-tone="purple" disabled={busy||deleted} onClick={action(()=>requestAnimationFrame(onFind))}><ChapterToolIcon name="search"/><span>查找与替换</span></button>
    <ReferenceButton reference={reference}><ChapterToolIcon name="discussion"/><span>围绕此内容讨论</span></ReferenceButton>
    <button data-tone="green" disabled={busy||deleted} onClick={action(onReview)}><ChapterToolIcon name="review"/><span>整理建议</span></button>
    {onUndoFormat&&<button onClick={action(onUndoFormat)}><ChapterToolIcon name="undo"/><span>撤销文本操作</span></button>}
   </div></section>
   <section className="chapter-tool-group" aria-label="写作工具"><h3>写作工具</h3><div className="chapter-tool-grid">
    {button('speed','码字时速','speed','purple')}{button('quick','快捷输入','quick','red')}{button('share','长图分享','share','green')}
    <button data-tone="orange" disabled={busy} onClick={action(onHistory)}><ChapterToolIcon name="history"/><span>版本历史</span></button>
   </div></section>
   <section className="chapter-tool-group" aria-label="外观"><h3>外观与排版</h3><div className="chapter-tool-grid">{button('display','字体字号','type','red')}{button('layout','页面布局','layout','blue')}{button('format','正文排版','format','green')}{button('editing','编辑偏好','settings','purple')}</div></section>
   <section className="chapter-tool-group" aria-label="章节"><h3>章节与数据</h3><div className="chapter-tool-grid" onClick={e=>{if(e.target.closest('button:not(:disabled)'))close();}}><button data-tone="blue" disabled={busy||deleted} onClick={onMaterials}><ChapterToolIcon name="materials"/><span>本章资料</span></button>{children}{onBackup&&<button data-tone="purple" onClick={onBackup}><ChapterToolIcon name="backup"/><span>整本备份</span></button>}</div></section>
  </>}
  {page==='display'&&<ChapterTypography/>}{page==='layout'&&<ChapterLayout/>}{page==='format'&&<ChapterFormat apply={onFormat} undo={onUndoFormat} disabled={busy||deleted}/>}{page==='editing'&&<ChapterEditingPreferences/>}
  {page==='copy'&&<ChapterCopy title={title} content={content}/>}{page==='quick'&&quickSettings}{page==='speed'&&speedSettings}{page==='share'&&share}
 </ChapterToolDialog>}</>;
}
const titles={display:'字体设置',layout:'页面布局',format:'正文排版',editing:'编辑偏好',copy:'快捷复制',quick:'快捷输入',speed:'码字时速',share:'长图分享'};
function ChapterToolDialog({page,returnTo,working,close,back,children}){
 const ref=useRef(null),outsidePress=useRef(false),title=titles[page]||'正文选项';
 useLayoutEffect(()=>{const previous=document.activeElement,dialog=ref.current;dialog.showModal();return()=>{dialog.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 useEffect(()=>{const dialog=ref.current;dialog.querySelector('.chapter-tool-content').scrollTop=0;const focus=page==='menu'&&returnTo?dialog.querySelector(`[data-tool="${returnTo}"]`):dialog.querySelector(page==='menu'?'.chapter-tool-close':'.chapter-tool-back');focus?.focus({preventScroll:true});},[page,returnTo]);
 const outside=e=>{if(e.target!==e.currentTarget)return false;const r=e.currentTarget.getBoundingClientRect();return e.clientX<r.left||e.clientX>=r.right||e.clientY<r.top||e.clientY>=r.bottom;};
 return <dialog ref={ref} className="chapter-tool-sheet" data-page={page} aria-label={title} onCancel={e=>{e.preventDefault();if(!working)close();}} onPointerDown={e=>{outsidePress.current=e.button===0&&outside(e);}} onPointerCancel={()=>{outsidePress.current=false;}} onClick={e=>{const dismiss=outsidePress.current&&outside(e);outsidePress.current=false;if(dismiss&&!working)close();}}>
  <header className="chapter-tool-head">{page!=='menu'&&<button type="button" className="chapter-tool-back" aria-label="返回正文选项" disabled={working} onClick={back}>‹</button>}<h2>{title}</h2><button type="button" className="chapter-tool-close" aria-label={`关闭${title}`} disabled={working} onClick={close}>×</button></header>
  <div className="chapter-tool-content">{children}</div>
 </dialog>;
}
function ChapterCopy({title='',content=''}){const [message,setMessage]=useState(''),[manual,setManual]=useState(null);const copy=async mode=>{const text=chapterCopy(title,content,mode);try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(text);setManual(null);setMessage('已复制，不修改原文。');}catch{setManual(text);setMessage('宿主未允许自动复制，请选择下方文本复制。');}};return <div className="chapter-settings"><p className="chapter-tool-note">复制眼前的草稿；无空行正文会保留非空行缩进、标点和段落换行。</p>{[['all','标题 + 正文'],['title','仅标题'],['body','仅正文'],['compact','无空行正文']].map(([id,label])=><button key={id} onClick={()=>copy(id)}>{label}</button>)}<p role="status">{message}</p>{manual!==null&&<textarea aria-label="待复制文本" readOnly value={manual} onFocus={e=>e.target.select()}/>}</div>;}
