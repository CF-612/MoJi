import React from 'react';
import {useWorkbenchPreferences} from './preferences.tsx';
import {cardLabels,defaultCardColors} from './card-colors.js';
export function CardColorFields({keys=Object.keys(cardLabels)}:{keys?:string[]}) {
  const {preferences,update}=useWorkbenchPreferences();
  return <div className="card-color-fields">{keys.map(key=><label key={key}>{cardLabels[key]}<input type="color" aria-label={`${cardLabels[key]}颜色`} value={preferences.cardColors[key]} onInput={e=>update({cardColors:{...preferences.cardColors,[key]:e.currentTarget.value}})} onChange={e=>update({cardColors:{...preferences.cardColors,[key]:e.target.value}})}/><button type="button" aria-label={`恢复${cardLabels[key]}颜色`} onClick={()=>update({cardColors:{...preferences.cardColors,[key]:defaultCardColors[key]}})}>重置</button></label>)}<small>颜色按设备保存，适用于本机同类卡片。类型文字、图标与进展标记始终保留。</small></div>;
}
export function CardLegend({planning=false}:{planning?:boolean}) {
  const {preferences}=useWorkbenchPreferences();
  const keys=planning?['idea','selected','written','dropped']:['character','world'];
  return <div className="card-color-legend" aria-label={planning?'规划进展图例':'设定类型图例'}>{keys.map(key=><span key={key}><i style={{background:preferences.cardColors[key]}} aria-hidden="true"/>{cardLabels[key]}</span>)}</div>;
}
export function CardQuickButton({title,open,disabled=false}:{title:string;open:()=>void;disabled?:boolean}) {
  return <button type="button" data-graph-editor className="card-quick-settings" aria-label={`快捷设置 ${title}`} title="快捷设置" disabled={disabled} onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();open();}}>⚙</button>;
}
