import React,{useEffect,useRef,useState} from 'react';
import {createWritingSession,reconcileWritingDocument,advanceWritingSession,suspendWritingSession,recordWritingEdit,writingMetrics,writingDuration} from './writing-session.mjs';
import {writingSpeedBounds,moveWritingSpeed} from './writing-speed-position.mjs';
import {efficiencyStyle} from './efficiency-style.mjs';
// In-memory only: a work's session survives chapter navigation, not a reload.
const sessions=new Map();
export function useWritingSession({scopeKey='local',documentKey,content='',enabled=false}){
 const sessionKey=String(scopeKey),[state,setState]=useState(()=>reconcileWritingDocument(sessions.get(sessionKey)||createWritingSession(),documentKey,content)),current=useRef(state),composing=useRef(false),options=useRef({sessionKey,documentKey,content,enabled});
 options.current={sessionKey,documentKey,content,enabled};
 const commit=value=>{current.current=value;sessions.set(options.current.sessionKey,value);if(sessions.size>12)sessions.delete(sessions.keys().next().value);setState(value);};
 useEffect(()=>{if(composing.current)return;const value=reconcileWritingDocument(sessions.get(sessionKey)||createWritingSession(),documentKey,content);commit(enabled?value:suspendWritingSession(value,Date.now()));},[sessionKey,documentKey,content,enabled]);
 useEffect(()=>{
  if(!enabled)return;
  const timer=setInterval(()=>commit(advanceWritingSession(current.current,Date.now())),1000);
  const visibility=()=>{if(document.hidden)commit(suspendWritingSession(current.current,Date.now()));};
  document.addEventListener('visibilitychange',visibility);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);const value=suspendWritingSession(current.current,Date.now());current.current=value;sessions.set(sessionKey,value);};
 },[sessionKey,documentKey,enabled]);
 const record=(next,{inputType='insertText'}={})=>{const {documentKey,content,enabled}=options.current;if(!enabled||composing.current)return;const before=current.current.documents[documentKey]?.content??content;commit(recordWritingEdit(current.current,{key:documentKey,before,after:next,inputType,now:Date.now()}));};
 const reset=()=>commit(reconcileWritingDocument(createWritingSession(),options.current.documentKey,options.current.content));
 return {metrics:writingMetrics(state,Date.now()),record,reset,pause:()=>commit(suspendWritingSession(current.current,Date.now())),compositionStart:()=>{composing.current=true;},compositionEnd:next=>{composing.current=false;record(next,{inputType:'insertCompositionText'});}};
}
export function WritingSpeed({controller,compact=true,onCompactChange,display='banner',viewportRef,onHide}){
 const {metrics:m}=controller,panel=useRef(null),position=useRef({x:1,y:1}),drag=useRef(null),bounds=useRef(null),[placement,setPlacement]=useState(null);
 const floating=display==='floating';
 const measure=()=>{
  const el=panel.current,editor=viewportRef?.current;if(!floating||!el||!editor)return;
  const vv=window.visualViewport,view={left:vv?.offsetLeft||0,top:vv?.offsetTop||0,right:(vv?.offsetLeft||0)+(vv?.width||window.innerWidth),bottom:(vv?.offsetTop||0)+(vv?.height||window.innerHeight)};
  const next=writingSpeedBounds(editor.getBoundingClientRect(),view,el.getBoundingClientRect(),position.current);bounds.current=next;setPlacement(next);
 };
 useEffect(()=>{
  if(!floating)return;measure();const observer=new ResizeObserver(measure);if(viewportRef?.current)observer.observe(viewportRef.current);if(panel.current)observer.observe(panel.current);
  window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);window.visualViewport?.addEventListener('resize',measure);window.visualViewport?.addEventListener('scroll',measure);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);window.visualViewport?.removeEventListener('resize',measure);window.visualViewport?.removeEventListener('scroll',measure);drag.current=null;};
 },[floating,viewportRef]);
 const start=e=>{if(e.button!==0||!bounds.current)return;e.preventDefault();e.stopPropagation();drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,position:{...position.current},bounds:bounds.current};e.currentTarget.setPointerCapture(e.pointerId);};
 const move=e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;e.preventDefault();position.current=moveWritingSpeed(d.position,{x:e.clientX-d.x,y:e.clientY-d.y},d.bounds);measure();};
 const end=e=>{if(drag.current?.id!==e.pointerId)return;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
 const keyboard=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)||!bounds.current)return;e.preventDefault();e.stopPropagation();position.current=e.key==='Home'?{x:1,y:1}:moveWritingSpeed(position.current,{x:e.key==='ArrowLeft'?-16:e.key==='ArrowRight'?16:0,y:e.key==='ArrowUp'?-16:e.key==='ArrowDown'?16:0},bounds.current);measure();};
 return <><style>{efficiencyStyle}</style><div ref={panel} className={'writing-speed'+(floating?' writing-speed-floating':'')} data-compact={compact} aria-label="本次码字时速" style={floating?{left:placement?.left??0,top:placement?.top??0,maxWidth:placement?.width??216,maxHeight:placement?.height??160,visibility:placement?.visible?'visible':'hidden'}:undefined}>
 {floating&&<div className="writing-speed-float-head"><button type="button" className="writing-speed-drag" aria-label="移动码字时速小块" title="拖动移动；方向键微调，Home复位" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={keyboard}>⠿ <span>码字时速</span></button>{onHide&&<button type="button" className="writing-speed-hide" aria-label="隐藏码字时速" title="可在码字时速设置中重新显示" onPointerDown={e=>e.preventDefault()} onClick={onHide}>×</button>}</div>}
 <button type="button" className="writing-speed-values" title="切换精简显示" aria-expanded={!compact} onPointerDown={e=>e.preventDefault()} onClick={()=>onCompactChange?.(!compact)}><strong>净增 {m.net}</strong> 字 · {m.perMinute} 字/分</button><span className="writing-speed-status">{m.status}</span><span className="writing-speed-detail">有效 {writingDuration(m.activeMs)} · 空闲 {writingDuration(m.idleMs)} · 其中粘贴 {m.pasted} 字（不计速度）</span></div></>;
}
export function WritingSessionSettings({controller,enabled=false,onEnabledChange,compact=true,onCompactChange,display='banner',onDisplayChange}){
 const m=controller.metrics;
 return <><style>{efficiencyStyle}</style><div className="efficiency-settings">
  <label className="efficiency-setting-row"><span>显示码字时速</span><input type="checkbox" checked={enabled} onChange={e=>onEnabledChange?.(e.target.checked)}/></label><label className="efficiency-setting-row"><span>精简显示</span><input type="checkbox" checked={compact} onChange={e=>onCompactChange?.(e.target.checked)}/></label>
  <label className="efficiency-setting-row"><span>显示方式</span><select aria-label="码字时速显示方式" value={display} onChange={e=>onDisplayChange?.(e.target.value)}><option value="banner">横幅</option><option value="floating">悬浮小块</option></select></label>
  <div className="writing-speed-summary"><div>本次净新增<strong>{m.net} 字</strong></div><div>手写净增速度<strong>{m.perMinute} 字/分</strong></div><div>有效写作<strong>{writingDuration(m.activeMs)}</strong></div><div>空闲时长<strong>{writingDuration(m.idleMs)}</strong></div></div>
  <p className="efficiency-note">{m.status} · 手写净增 {m.typed} 字 · 仍保留的粘贴 {m.pasted} 字。</p>
  <details><summary>计数规则</summary><p className="efficiency-note">仅正文输入启动计时。30 秒未输入记为空闲，20 分钟后暂停；切后台或离开正文即暂停，下一次输入继续。字数不含空白、含标点。净新增按本次输入前后的差值，删除会扣减，同长度改写不会刷高速度。粘贴计入净新增但不计手写速度；已知撤销 / 重做恢复原计数归属。前一分钟按一分钟计算速度，避免刚开始时数值突跳。</p><p className="efficiency-note">排版、替换、恢复版本与远端更新不计输入，重新建立当前章的统计基线。本次会话按作品计算，刷新页面重置；不进入作品统计。</p></details>
  <div className="efficiency-actions"><button type="button" onClick={controller.reset}>重置本次计速</button></div>
 </div></>;
}
