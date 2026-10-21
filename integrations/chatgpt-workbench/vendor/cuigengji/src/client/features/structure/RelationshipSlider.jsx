import React from 'react';
export function RelationshipSlider({phases,value,change}){
 const index=Math.max(0,phases.findIndex(p=>p.id===value)),phase=phases[index];
 return <section className="relationship-slider" aria-label="关系演变">
  <div className="relationship-slider-caption"><strong>{phase?.title||'基础关系'}</strong><small>{index===0?'初始状态':`${index} / ${phases.length-1} · ${phase.changeCount} 处变化`}{phase?.planned?' · 计划':''}</small></div>
  <div className="relationship-slider-track"><input type="range" aria-label="关系演变进度" aria-valuetext={phase?.title} min="0" max={Math.max(0,phases.length-1)} value={index} disabled={phases.length<2} onChange={e=>change(phases[Number(e.target.value)].id)}/><div className="relationship-slider-ticks" aria-hidden="true">{phases.filter((p,i)=>i===0||i===phases.length-1||i%Math.max(1,Math.ceil(phases.length/20))===0).map(p=><i key={p.id} style={{left:`${phases.length<2?0:phases.indexOf(p)/(phases.length-1)*100}%`}}/>)}</div></div>
  <div className="relationship-slider-ends"><button type="button" disabled={!index} onClick={()=>change(phases[index-1].id)} aria-label="上一个关系阶段">‹</button><span>基础关系</span><small>{phases.length>1?'仅关键变化事件形成刻度':'尚无关系变化，普通事件不会新增阶段'}</small><span>最新</span><button type="button" disabled={index===phases.length-1} onClick={()=>change(phases[index+1].id)} aria-label="下一个关系阶段">›</button></div>
 </section>;
}
