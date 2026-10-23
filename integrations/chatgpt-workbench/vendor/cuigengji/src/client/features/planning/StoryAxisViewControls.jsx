import React from 'react';
import {Icon} from '../../shared/icons.tsx';

/** View-only controls: callers retain the existing scale and anchor behavior. */
export function StoryAxisViewControls({zoom,preset,levels,onZoom,onAnchor}){
 const choices=[['overview','全景','查看完整时间跨度'],['detail','细看','展开邻近的时间细节'],['daily','逐日','精确查看每一天']];
 return <div className="sa-view-controls" aria-label="故事时间视图"><div className="sa-zoom-control" role="group" aria-label="故事时间缩放">
  <button className="sa-zoom-step" aria-label="缩小故事时间" title="缩小故事时间" disabled={zoom<=-4} onClick={()=>onZoom(Math.max(-4,zoom-1))}>−</button>
  <details className="sa-scale-menu" onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();}}}>
   <summary aria-label="故事轴查看尺度" title="选择查看尺度"><span>{choices.find(c=>c[0]===preset)?.[1]||'全景'}</span><Icon name="chevron"/></summary>
   <div className="sa-scale-options" aria-label="查看尺度选项">{choices.map(([key,label,description])=><button key={key} aria-pressed={preset===key} onClick={e=>{onZoom(levels[key]);const menu=e.currentTarget.closest('details');menu.open=false;menu.querySelector('summary')?.focus();}}><span>{label}<small>{description}</small></span><span aria-hidden="true">{preset===key?'✓':''}</span></button>)}</div>
  </details>
  <button className="sa-zoom-step" aria-label="放大故事时间" title="放大故事时间" disabled={zoom>=levels.daily} onClick={()=>onZoom(Math.min(levels.daily,zoom+1))}>＋</button>
 </div><button className="sa-jump-anchor" onClick={onAnchor} title="定位故事起点" aria-label="回到锚点"><Icon name="locate"/><span>回到锚点</span></button></div>;
}
