import React,{useEffect,useRef,useState} from 'react';
import {dragExceeded,marqueeRect,intersectingIds,appendSelection,isAdditiveSelection} from '../../shared/canvas-gestures.ts';

/** Selection is viewport-local state. Measuring rendered cards keeps both timeline
 * axes correct under camera zoom, nested scrolling, and variable card heights. */
export function useTimelineMarquee({viewport,cardSelector,idAttribute,editing=false,onBlocked,onSelection,onBlankContextMenu}){
  const [selectedIds,setSelectedIds]=useState([]),selection=useRef([]),[rect,setRect]=useState(null);
  const gesture=useRef(null),suppressContext=useRef(false),options=useRef(null);
  options.current={viewport,cardSelector,idAttribute,editing,onBlocked,onSelection,onBlankContextMenu};
  const element=()=>options.current.viewport.current;
  const setSelection=ids=>{selection.current=ids;setSelectedIds(ids);options.current.onSelection?.(ids[0]??null);};
  const select=(id,additive=false)=>{
    if(options.current.editing){options.current.onBlocked?.();return false;}
    setSelection(id==null?[]:additive?(selection.current.includes(id)?selection.current.filter(value=>value!==id):[...selection.current,id]):[id]);return true;
  };
  const release=g=>{const el=element();if(g&&el?.hasPointerCapture(g.pointer))el.releasePointerCapture(g.pointer);};
  const cancel=()=>{const g=gesture.current;if(!g)return false;gesture.current=null;release(g);setRect(null);if(g.moved){suppressContext.current=true;setSelection(g.before);}return true;};
  useEffect(()=>{const blur=()=>cancel(),key=e=>{if(e.key==='Escape'&&gesture.current){e.preventDefault();cancel();}};window.addEventListener('blur',blur);window.addEventListener('keydown',key);return()=>{window.removeEventListener('blur',blur);window.removeEventListener('keydown',key);release(gesture.current);};},[]);
  const onPointerDown=e=>{
    if(gesture.current)return false;suppressContext.current=false;
    if(e.pointerType==='touch'||e.button!==2)return false;
    const target=e.target instanceof Element?e.target:null;
    if(target?.closest(`${options.current.cardSelector},button,input,textarea,select,[contenteditable=true],[role=menu],[data-canvas-actions],[data-track-control]`))return false;
    if(options.current.editing){options.current.onBlocked?.(e);return false;}
    const el=element();if(!el)return false;
    gesture.current={pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},before:[...selection.current],append:isAdditiveSelection(e)?[...selection.current]:[],moved:false};
    el.setPointerCapture(e.pointerId);e.preventDefault();return true;
  };
  const onPointerMove=e=>{
    const g=gesture.current,el=element();if(!g||g.pointer!==e.pointerId||!el)return false;
    if(options.current.editing){cancel();options.current.onBlocked?.(e);return true;}
    const end={x:e.clientX,y:e.clientY};if(!g.moved&&!dragExceeded(g.start,end))return true;
    g.moved=true;const box=marqueeRect(g.start,end),bounds=el.getBoundingClientRect();
    setRect({x:box.x-bounds.left+el.scrollLeft,y:box.y-bounds.top+el.scrollTop,width:box.width,height:box.height});
    const items=[...el.querySelectorAll(options.current.cardSelector)].map(card=>{const r=card.getBoundingClientRect();return{id:card.getAttribute(options.current.idAttribute),bounds:{x:r.left,y:r.top,width:r.width,height:r.height}};}).filter(item=>item.id&&item.bounds.width>0&&item.bounds.height>0);
    setSelection(appendSelection(intersectingIds(box,items),g.append));e.preventDefault();return true;
  };
  const onPointerUp=e=>{const g=gesture.current;if(!g||g.pointer!==e.pointerId)return false;gesture.current=null;release(g);setRect(null);suppressContext.current=g.moved;if(!g.moved&&g.contextEvent)options.current.onBlankContextMenu?.(g.contextEvent);return g.moved;};
  const onPointerCancel=e=>{if(e&&gesture.current?.pointer!==e.pointerId)return false;return cancel();};
  const onContextMenu=e=>{const g=gesture.current;if(g){g.contextEvent=e;e.preventDefault();e.stopPropagation();return true;}if(!suppressContext.current)return false;e.preventDefault();e.stopPropagation();return true;};
  return {onPointerDown,onPointerMove,onPointerUp,onPointerCancel,onLostPointerCapture:onPointerCancel,onContextMenu,selectedIds,select,overlay:rect?<div className="timeline-marquee" aria-hidden="true" style={{position:'absolute',pointerEvents:'none',zIndex:30,left:rect.x,top:rect.y,width:rect.width,height:rect.height,border:'1px solid var(--cg-accent)',background:'color-mix(in srgb,var(--cg-accent) 12%,transparent)'}}/>:null};
}
