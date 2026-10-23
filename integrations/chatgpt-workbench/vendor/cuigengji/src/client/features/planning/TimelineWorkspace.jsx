import React from 'react';
import {timelineWorkspaceStyle} from './timeline-workspace-style.mjs';

/** Shared workspace chrome; callers provide only the axis body and its behavior. */
export function TimelineWorkspace({workspaceRef,layout='pages',className='',columnClassName='',positionLabel,positionHint,toolbar,children,tray,divider,relations,editor}){
 return <div ref={workspaceRef} data-relation-layout={layout} className={`timeline-workspace ${className}`}><style>{timelineWorkspaceStyle}</style>
  <section className={`timeline-workspace-column ${columnClassName}`} aria-label="情节与待安排">
   {toolbar}
   <div className="u-time-position timeline-workspace-position"><span className="u-pointer-key"/><span className="timeline-workspace-position-label">{positionLabel}</span>{positionHint&&<small>{positionHint}</small>}</div>
   {children}
   {tray}
  </section>
  {divider}
  {relations}
  {editor&&<div className="u-timeline-editor-region">{editor}</div>}
 </div>;
}
