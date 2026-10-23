import React from 'react';
import {timelineTrayStyle} from './timeline-tray-style.mjs';

/** Shared pending area. Axis-specific card gestures and placement remain with the caller. */
export function TimelineTray({trayRef,open,onToggle,count,canReceive=false,returning=false,saving=false,children,emptyText='都已安排妥当 · 可将轨道上的卡片拖回这里'}){
 const hint=returning?(saving?'正在移回…':'松手移回待安排'):canReceive?'拖到这里移回待安排':open?'收起 ⌃':'展开 ⌄';
 return <section ref={trayRef} className={`timeline-tray u-time-tray ${canReceive?'can-receive':''} ${returning?'drop-target':''}`}><style>{timelineTrayStyle}</style>
  <button type="button" className="u-tray-toggle" aria-expanded={open} onClick={onToggle}>待安排 <strong>{count}</strong><span>{hint}</span></button>
  {open&&<div className="u-tray-cards">{count===0?<p className="u-tray-empty">{emptyText}</p>:children}</div>}
 </section>;
}
