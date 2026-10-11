import React, {useState} from 'react';
import {DetailPage} from './detail-page.tsx';

export function CanvasInspector({children,backLabel,onBack}: {
  children:React.ReactNode;backLabel:string;onBack:()=>void;
}) {
  const [expanded,setExpanded]=useState(false);
  return <aside className={`canvas-inspector ${expanded?'is-expanded':''}`} aria-label="情节详情侧栏">
    <div className="inspector-size"><button type="button" aria-label={expanded?'收起详情':'展开详情'} onClick={()=>setExpanded(v=>!v)}>{expanded?'收起':'展开'}</button></div>
    <DetailPage className="planning-detail" backLabel={backLabel} onBack={onBack}>{children}</DetailPage>
  </aside>;
}
