import React,{useLayoutEffect,useRef} from 'react';
import {timelineEditorStyle} from './timeline-editor-style.mjs';
/** The existing CardEditor form, hosted in-place rather than a modal overlay. */
export function TimelineCardEditorShell({title,close,children}){
 const root=useRef(null);
 useLayoutEffect(()=>{const previous=document.activeElement;root.current?.focus({preventScroll:true});return()=>{if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 return <section ref={root} tabIndex={-1} className="u-timeline-editor" aria-label={title} onKeyDown={e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.stopPropagation();void close();}}}><style>{timelineEditorStyle}</style><header className="u-timeline-editor-heading"><button type="button" onClick={close} aria-label="返回时间线">← 返回</button><h3>{title}</h3></header><div className="u-timeline-editor-content">{children}</div></section>;
}
