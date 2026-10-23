import React,{useLayoutEffect,useRef} from 'react';
import {timelineEditorStyle} from './timeline-editor-style.mjs';
/** The existing CardEditor form, hosted in-place rather than a modal overlay. */
export function TimelineCardEditorShell({title,close,children,saving=false,saveDisabled=false}){
 const root=useRef(null);
 useLayoutEffect(()=>{const previous=document.activeElement;root.current?.focus({preventScroll:true});return()=>{if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 const submit=()=>{const form=root.current?.querySelector('form'),button=form?.querySelector('button[type="submit"]');if(form&&!button?.disabled)form.requestSubmit(button||undefined);};
 const heading=title==='编辑剧情卡'?'正在编辑剧情卡':title;
 return <section ref={root} tabIndex={-1} className="u-timeline-editor" aria-label={heading} onKeyDown={e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.stopPropagation();void close();}}}><style>{timelineEditorStyle}</style><header className="u-timeline-editor-heading"><div className="u-timeline-editor-title"><small>剧情卡编辑面板</small><h3>{heading}</h3></div><button type="button" onClick={close} aria-label="返回时间线" title="关闭编辑（未保存时会询问）">关闭 ×</button></header><div className="u-timeline-editor-actions"><button type="button" onClick={close} disabled={saving}>取消编辑</button><button type="button" className="u-primary" onClick={submit} disabled={saveDisabled}>{saving?'保存中…':'保存'}</button></div><p className="u-timeline-editor-lock-note">编辑中暂不能移动卡片，请先保存或取消编辑。</p><div className="u-timeline-editor-content">{children}</div></section>;
}
