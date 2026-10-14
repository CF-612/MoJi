import React,{Suspense,lazy} from 'react';
import {useWorkbenchPreferences} from '../shared/preferences.tsx';
import {modules,profiles,toggleModule,profileModules} from './registry.mjs';
import {useModules} from './context.tsx';
export {useModules} from './context.tsx';
const renderers={
 timeline:lazy(()=>import('../features/structure/Timeline.jsx').then(m=>({default:m.Timeline}))),
 overview:lazy(()=>import('../features/structure/Overview.jsx').then(m=>({default:m.WritingOverview}))),
};
export function ModulePage({id,...props}){const enabled=useModules(),Renderer=renderers[id];if(!enabled[id]||!Renderer)return null;return <Suspense fallback={<p className="muted">正在打开模块…</p>}><Renderer {...props}/></Suspense>;}
export function ModuleSettings(){const {preferences,update}=useWorkbenchPreferences();return <section className="preference-section"><h3>工作台模块</h3><p className="muted">按设备保存显示偏好。隐藏不删除资料，AI 工具仍可读写已有数据。</p><div className="row" role="group" aria-label="模块预设">{Object.entries(profiles).map(([id,p])=><button key={id} onClick={()=>update({modules:profileModules(id)})}>{p.name}</button>)}</div>{modules.map(m=><label className="preference-row module-preference" key={m.id}><span><strong>{m.name}</strong><small>{m.description}{m.dependencies.length?' · 需要时间线':''}</small></span><input type="checkbox" aria-label={`显示${m.name}`} checked={preferences.modules[m.id]} onChange={e=>update({modules:toggleModule(preferences.modules,m.id,e.target.checked)})}/></label>)}</section>;}
