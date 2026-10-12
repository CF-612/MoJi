import React from 'react';
import {CardQuickButton} from '../../shared/card-appearance.tsx';
import type {NodeIndex,Point} from '../../../contracts/planning.ts';
const labels={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
export function SceneCard({node,point,selected,dragProps,inPort,outPort,onQuick,busy}: {
  onQuick:()=>void;busy:boolean;node:NodeIndex;point:Point;selected:boolean;dragProps:React.HTMLAttributes<HTMLElement>;
  inPort:React.ButtonHTMLAttributes<HTMLButtonElement>;outPort:React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return <section data-node-id={node.id} aria-label={node.title} {...dragProps} className={`planning-card scene-card state-${node.status} ${selected?'selected':''} ${node.status==='dropped'?'is-dropped':''}`} style={{left:point.x,top:point.y}}>
    <button {...inPort}/><button {...outPort}/><CardQuickButton title={node.title} open={onQuick} disabled={busy}/>
    <button type="button" className="planning-title" title={node.title}>{node.title}</button>
    <p title={node.summary}>{node.summary}</p>
    <footer className="scene-card-footer"><span className={`planning-state state-${node.status}`}><i aria-hidden="true"/>{labels[node.status]}</span>{node.chapterRefs.length>0&&<small>{node.chapterRefs.length} 章引用</small>}</footer>
  </section>;
}
