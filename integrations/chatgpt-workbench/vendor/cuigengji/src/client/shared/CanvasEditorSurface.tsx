import React,{useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

/** Narrow panels edit outside the transformed, touch-capturing canvas. */
export function CanvasEditorSurface({children}:{children:React.ReactNode}){
  const marker=useRef<HTMLSpanElement>(null),[host,setHost]=useState<Element|null>(null);
  useLayoutEffect(()=>{const stage=marker.current?.closest('.planning-stage');if(!stage)return;const update=()=>setHost(stage.clientWidth<600?stage:null);update();const observer=new ResizeObserver(update);observer.observe(stage);return()=>observer.disconnect();},[]);
  return <><span ref={marker} hidden/>{host?createPortal(<div className="mobile-canvas-editor" role="region" aria-label="画布内容编辑">{children}</div>,host):children}</>;
}
