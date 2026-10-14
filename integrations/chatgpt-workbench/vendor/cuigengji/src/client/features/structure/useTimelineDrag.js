import {useEffect,useRef,useState} from 'react';
import {placementIntent,timelineHit} from '../../../domain/event-placement.js';
import {placementRequest} from '../../../domain/placement-request.js';
export function useTimelineDrag({board,track,mode,scroll,onPlace,busy}){
 const active=useRef(null),ignoreClick=useRef(false),[drag,setDrag]=useState(null);
 const project=record=>{
  const el=scroll.current;if(!el)return;
  const y=record.y-el.getBoundingClientRect().top+el.scrollTop,target=timelineHit(record.track.slots,y);
  let intent,start,end;
  if(record.request.view==='story'){
   const others=record.request.story.filter(e=>e.id!==record.marker.id),beforeEventId=others[Math.min(target,record.request.story.length-1)]?.id||null;
   intent={operation:'move',beforeEventId};start=Math.min(target,record.track.slots.length-1);end=start;
  }else {
   const chapters=record.request.chapters,index=record.operation==='move'?record.marker.start+(target-record.anchor):target;
   intent=placementIntent(chapters,record.request.source,record.operation,index);if(!intent)return;start=chapters.findIndex(c=>c.id===intent.startChapterId);end=chapters.findIndex(c=>c.id===intent.endChapterId);
  }
  record.intent=intent;
  const next={id:record.marker.id,start,end,track:record.track,request:{...record.request,...intent}};
  setDrag(old=>old?.id===next.id&&old.start===start&&old.end===end?old:next);
 };
 const begin=(e,marker,operation)=>{
  if(busy||active.current||e.button!==0||!onPlace)return;
  if(mode==='narration'&&!board.chapters.length)return;
  e.preventDefault();e.stopPropagation();ignoreClick.current=false;
  const el=scroll.current,y=e.clientY-el.getBoundingClientRect().top+el.scrollTop;
  const request=placementRequest(board,marker.id,mode,{operation});
  active.current={pointer:e.pointerId,element:e.currentTarget,marker,operation,request,track,y:e.clientY,initialY:e.clientY,anchor:timelineHit(track.slots,y),moved:false,intent:null};
  e.currentTarget.setPointerCapture(e.pointerId);project(active.current);
 };
 const move=e=>{const r=active.current;if(!r||r.pointer!==e.pointerId)return;e.preventDefault();r.y=e.clientY;r.moved||=Math.abs(r.y-r.initialY)>8;project(r);};
 const cancel=()=>{const r=active.current;active.current=null;if(r?.element.hasPointerCapture(r.pointer))r.element.releasePointerCapture(r.pointer);setDrag(null);};
 const finish=e=>{const r=active.current;if(!r||r.pointer!==e.pointerId)return;const request=r.intent?{...r.request,...r.intent}:null;ignoreClick.current=r.moved;cancel();if(r.moved&&request)onPlace(request);};
 useEffect(()=>{
  if(!drag)return;let frame;
  const tick=()=>{const r=active.current,el=scroll.current;if(!r||!el)return;const box=el.getBoundingClientRect(),upper=box.top+70,lower=box.bottom-36,speed=r.y<upper?-Math.min(16,(upper-r.y)/4):r.y>lower?Math.min(16,(r.y-lower)/4):0;if(r.moved&&speed){el.scrollTop+=speed;project(r);}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
  const key=e=>{if(e.key==='Escape'){e.preventDefault();ignoreClick.current=true;cancel();}};window.addEventListener('keydown',key);window.addEventListener('blur',cancel);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',key);window.removeEventListener('blur',cancel);};
 },[!!drag]);
 useEffect(()=>{if(active.current&&(mode!==active.current.request.view||busy)){ignoreClick.current=true;cancel();}},[mode,busy]);
 useEffect(()=>()=>{active.current=null;},[]);
 return {drag,handlers:(marker,operation)=>({onPointerDown:e=>begin(e,marker,operation),onPointerMove:move,onPointerUp:finish,onPointerCancel:()=>{ignoreClick.current=true;cancel();},onLostPointerCapture:()=>{if(active.current){ignoreClick.current=true;cancel();}}}),consumeClick:()=>{const ignored=ignoreClick.current;ignoreClick.current=false;return ignored;}};
}
