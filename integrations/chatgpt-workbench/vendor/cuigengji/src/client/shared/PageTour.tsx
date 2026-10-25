import React,{useEffect,useId,useRef} from 'react';
import {pageTourStyles} from './page-tour-style.ts';
interface Step {id:string;page:string;title:string;body:string}
interface Props {index:number;steps:Step[];onNext:()=>void;onBack:()=>void;onSkip:()=>void}
/** A quiet, non-modal guide. The real page stays visible and usable beneath it. */
export function PageTour({index,steps,onNext,onBack,onSkip}:Props){
 const id=useId(),title=useRef<HTMLHeadingElement>(null),offer=index<0,step=steps[index];
 const target=step?.id==='settings-entry'?'[aria-label="工作台更多功能"]':step?.id==='settings-menu'?'.tool-sheet [aria-label="设置"]':null;
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const focus=(target?title.current?.closest('.cuigengji')?.querySelector(target):title.current) as HTMLElement|null;focus?.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);},[index,target]);
 return <aside className="page-tour" aria-labelledby={id} data-tour-step={offer?'offer':step.id}>
  <style>{pageTourStyles}</style>
  <div className="page-tour-copy"><div className="page-tour-heading"><span className="page-tour-progress">{offer?'初次见面':`${index+1} / ${steps.length}`}</span><h2 id={id} ref={title} tabIndex={-1}>{offer?'花一点时间，认识这张书桌？':step.title}</h2></div>
   {(offer||step.body)&&<p>{offer?'只逛几个页面，不用写正文或建卡片。随时可以跳过。':step.body}</p>}
   {step?.id==='settings'&&<small>更多 → 设置 → 功能模块 · 开关不会替你更改<br/>有想法？<a href="https://github.com/CF-612/MoJi/issues" target="_blank" rel="noopener noreferrer">先提 Issue</a>，也欢迎自己或和 AI 一起开发，<a href="https://github.com/CF-612/MoJi/pulls" target="_blank" rel="noopener noreferrer">提交 PR</a>。</small>}
  </div>
  <div className="page-tour-actions">{index!==steps.length-1&&<button type="button" className="page-tour-skip" onClick={onSkip}>{offer?'暂时跳过':'跳过导览'}</button>}{index>=0&&<button type="button" onClick={onBack} disabled={index===0}>上一步</button>}{!target&&<button type="button" className="primary" onClick={onNext}>{offer?'看看各个页面':index===steps.length-1?'完成导览':'下一步'}</button>}</div>
 </aside>;
}
