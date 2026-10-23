import React from 'react';
import {timelinePlayheadStyle} from './timeline-playhead-style.mjs';

/** Shared screen-pixel geometry; each axis owns projection and gestures. */
export function TimelinePlayhead({left,top=0,height,handleOffset=0,dragging=false,disabled=false,label='时间指针',ariaLabel=label,min,max,value,valueText,onPointerDown,onKeyDown,onClick,style}){
 const atStart=typeof left==='number'&&left>=0&&left<22;
 const handleStyle={top:handleOffset,...(atStart?{left:-left,'--playhead-thumb-inset':Math.max(2,left-6)+'px','--playhead-line-x':left+'px','--playhead-link-width':Math.max(0,8-left)+'px'}:{})};
 return <><style>{timelinePlayheadStyle}</style><div className={`timeline-playhead${dragging?' dragging':''}`} style={{left,top,...(height===undefined?{bottom:0}:{height}),...style}}>
  <button type="button" className={`timeline-playhead-handle${atStart?' at-start':''}`} style={handleStyle} role="slider" aria-label={ariaLabel} aria-description={label!==ariaLabel?label:undefined} aria-orientation="horizontal" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText} disabled={disabled} title={valueText?`${label} · ${valueText}`:label} onPointerDown={onPointerDown} onKeyDown={onKeyDown} onClick={event=>{event.stopPropagation();onClick?.(event);}}><span className="timeline-playhead-thumb" aria-hidden="true"/></button>
 </div></>;
}
