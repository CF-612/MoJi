import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {displayNumberedTitle} from '../../../domain/title-numbering.js';
import {useModules} from '../../modules/context.tsx';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Icon} from '../../shared/icons.tsx';
import {CastAvatars} from '../../shared/CastAvatars.tsx';
import {timelineTracks,trackSelections} from '../../../domain/timeline-tracks.js';
import {usePreference,useResource} from '../../shared/state.js';

const DEFAULT_TRACK={id:'main',name:'主线',color:'#3b6ff5'};
const PALETTE=['#3b6ff5','#7b6bd6','#c9772f','#2f8f6b','#b8497a','#5b7a99','#8a6d3b'];
const LANE_MIN=62,CARD_HEIGHT=32,CARD_GAP=6;
const labelFor=kind=>kind==='person'?'人物':kind==='foreshadow'?'伏笔':'事件';

/** 读取／保存本作品的轨道与归属（先本地持久化，后续再迁到作品数据）。 */
function useBoardTracks(novelId){
 const key=`cuigengji:timeline:tracks:${novelId}`,assignKey=`cuigengji:timeline:track-of:${novelId}`;
 const read=(k,fallback)=>{try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):fallback;}catch{return fallback;}};
 const [tracks,setTracks]=useState(()=>read(key,[DEFAULT_TRACK]));
 const [assign,setAssign]=useState(()=>read(assignKey,{}));
 const persistTracks=next=>{setTracks(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{}};
 const persistAssign=next=>{setAssign(next);try{localStorage.setItem(assignKey,JSON.stringify(next));}catch{}};
 return {tracks,assign,persistTracks,persistAssign};
}

export function TimelineBoard({board,novelId,mode,current,choose,onPlan,onEvent,onMemory,onShadow,busy,setMode,controls,extraTools,onMoveEvent}){
 const modules=useModules(),{preferences}=useWorkbenchPreferences();
 const [localMode,setLocalMode]=usePreference(`${novelId}:timeline-view`,'narration'),activeMode=controls?.mode??mode??localMode,setActiveMode=controls?.setMode??setMode??setLocalMode;
 const [zoom,setZoom]=usePreference(`${novelId}:timeline-board-zoom`,100);
 const [localFilter,setLocalFilter]=usePreference(`${novelId}:timeline-filter`,'all'),filter=controls?.filter??localFilter,setFilter=controls?.setFilter??setLocalFilter; const {tracks,assign,persistTracks,persistAssign}=useBoardTracks(novelId);
 const [renaming,setRenaming]=useState(null),[menu,setMenu]=useState(null),[drag,setDrag]=useState(null);
 const scroll=useRef(null),surface=useRef(null),[scrollLeft,setScrollLeft]=useState(0),[viewportWidth,setViewportWidth]=useState(800);
 const available=['event','person',...(modules.foreshadow?['foreshadow']:[])],safeFilter=(Array.isArray(filter)?filter:filter==='all'?available:[filter]).filter(id=>available.includes(id)),shownBoard=modules.foreshadow?board:{...board,foreshadows:[]};
 const track=useMemo(()=>timelineTracks(shownBoard,activeMode,safeFilter,1),[board,activeMode,filter,modules.foreshadow]);
 const selections=useMemo(()=>trackSelections(board,activeMode),[board,activeMode]);
 const unit=Math.max(92,Math.round(150*zoom/100)),totalWidth=Math.max(1,track.slots.length)*unit;
 const currentIndex=track.slots.findIndex(s=>s.chapterId&&s.chapterId===current?.chapterId||s.eventId&&s.eventId===current?.eventId);
 const currentKey=current?.key||(current?.eventId?`event:${current.eventId}`:current?.chapterId?`chapter:${current.chapterId}`:null);

 useEffect(()=>{const el=scroll.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setViewportWidth(entry.contentRect.width));observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{const el=scroll.current;if(!el||currentIndex<0)return;const left=currentIndex*unit;if(left<el.scrollLeft+40||left+unit>el.scrollLeft+el.clientWidth)el.scrollTo({left:Math.max(0,left-unit),behavior:'smooth'});},[currentIndex,unit]);

 const trackOf=marker=>assign[marker.key]||tracks[0]?.id||'main';
 const tracksById=Object.fromEntries(tracks.map(t=>[t.id,t]));
 // 同一轨道内按起点排序，重叠时向下错位；轨道高度随错位层数增长。
 const layout=useMemo(()=>{
  const byTrack=Object.fromEntries(tracks.map(t=>[t.id,[]]));
  for(const marker of track.markers){
   const id=tracksById[trackOf(marker)]?trackOf(marker):tracks[0]?.id||'main';
   if(!byTrack[id])byTrack[id]=[];
   byTrack[id].push(marker);
  }
  const result=[];
  for(const trackId of Object.keys(byTrack)){
   const rows=[];const placed=[];
   for(const marker of byTrack[trackId].sort((a,b)=>a.start-b.start||a.end-b.end)){
    let row=rows.findIndex(end=>end<marker.start);
    if(row<0){row=rows.length;rows.push(marker.end);}else rows[row]=marker.end;
    placed.push({marker,row});
   }
   const laneHeight=Math.max(LANE_MIN,placed.length?placed.reduce((max,p)=>Math.max(max,p.row+1),0)*(CARD_HEIGHT+CARD_GAP)+CARD_GAP*2:LANE_MIN);
   result.push({id:trackId,track:tracksById[trackId]||DEFAULT_TRACK,placed,laneHeight});
  }
  return result;
 },[tracks,track,assign]);
 const totalHeight=layout.reduce((sum,l)=>sum+l.laneHeight,0);

 const wheelRef=useRef(null);
 useEffect(()=>{
  const el=scroll.current;if(!el)return;
  const wheel=event=>{
   if(event.ctrlKey||!event.shiftKey){
    event.preventDefault();
    const next=Math.max(35,Math.min(220,zoom*(event.deltaY<0?1.08:1/1.08)));
    setZoom(Math.round(next));
   }
  };
  wheelRef.current=wheel;el.addEventListener('wheel',wheel,{passive:false});
  return()=>el.removeEventListener('wheel',wheel);
 },[zoom,setZoom]);
 useEffect(()=>{ // 手机双指缩放
  const el=scroll.current;if(!el)return;let pinch=null;
  const start=event=>{if(event.touches.length===2)pinch={distance:Math.hypot(event.touches[0].clientX-event.touches[1].clientX,event.touches[0].clientY-event.touches[1].clientY),zoom};};
  const move=event=>{if(!pinch||event.touches.length!==2)return;event.preventDefault();const distance=Math.hypot(event.touches[0].clientX-event.touches[1].clientX,event.touches[0].clientY-event.touches[1].clientY);setZoom(Math.round(Math.max(35,Math.min(220,pinch.zoom*distance/pinch.distance))));};
  const end=()=>{pinch=null;};
  el.addEventListener('touchstart',start,{passive:true});el.addEventListener('touchmove',move,{passive:false});el.addEventListener('touchend',end);
  return()=>{el.removeEventListener('touchstart',start);el.removeEventListener('touchmove',move);el.removeEventListener('touchend',end);};
 },[zoom,setZoom]);

 const createTrack=()=>{const id=`track-${Date.now().toString(36)}`;const color=PALETTE[tracks.length%PALETTE.length];persistTracks([...tracks,{id,name:`轨道 ${tracks.length+1}`,color}]);setRenaming(id);};
 const renameTrack=(id,name)=>{persistTracks(tracks.map(t=>t.id===id?{...t,name:name.trim()||t.name}:t));setRenaming(null);};
 const colorTrack=(id,color)=>persistTracks(tracks.map(t=>t.id===id?{...t,color}:t));
 const removeTrack=id=>{if(tracks.length<=1)return;const next=tracks.filter(t=>t.id!==id);const nextAssign=Object.fromEntries(Object.entries(assign).filter(([,v])=>v!==id));persistTracks(next);persistAssign(nextAssign);setMenu(null);};
 const moveMarker=(marker,trackId)=>{persistAssign({...assign,[marker.key]:trackId});setMenu(null);};

 const pointerLeft=currentIndex>=0?currentIndex*unit+unit/2:null;
 const slotAt=clientX=>{const el=surface.current;if(!el)return null;const rect=el.getBoundingClientRect();return Math.round((clientX-rect.left)/unit);};
 const beginDrag=(event,marker,edge)=>{
  if(!onMoveEvent||busy)return;
  event.stopPropagation();event.preventDefault();
  const startX=event.clientX,fromStart=marker.start,fromEnd=marker.end;
  setDrag({key:marker.key,edge,startX,fromStart,fromEnd,start:fromStart,end:fromEnd});
  const move=moveEvent=>{
   const delta=Math.round((moveEvent.clientX-startX)/unit);
   let start=fromStart,end=fromEnd;
   if(edge==='start')start=Math.max(0,Math.min(fromEnd,fromStart+delta));
   else if(edge==='end')end=Math.min(track.slots.length-1,Math.max(fromStart,fromEnd+delta));
   else {const width=fromEnd-fromStart;start=Math.max(0,Math.min(track.slots.length-1-width,fromStart+delta));end=start+width;}
   setDrag({key:marker.key,edge,startX,fromStart,fromEnd,start,end});
  };
  const up=upEvent=>{
   window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);
   const delta=Math.round((upEvent.clientX-startX)/unit);
   let start=fromStart,end=fromEnd;
   if(edge==='start')start=Math.max(0,Math.min(fromEnd,fromStart+delta));
   else if(edge==='end')end=Math.min(track.slots.length-1,Math.max(fromStart,fromEnd+delta));
   else {const width=fromEnd-fromStart;start=Math.max(0,Math.min(track.slots.length-1-width,fromStart+delta));end=start+width;}
   setDrag(null);
   if(start!==fromStart||end!==fromEnd){
    const chapterIds=track.slots.slice(start,end+1).map(s=>s.chapterId).filter(Boolean);
    if(chapterIds.length)onMoveEvent(marker,{start,end,chapterIds});
   }
  };
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
 };

 const activate=marker=>{
  if(marker.kind==='event'){choose({key:marker.key,eventId:marker.eventId,event:marker.event,chapterId:track.slots[marker.start]?.chapterId});onEvent?.(marker.eventId);return;}
  const slot=track.slots[marker.start];
  if(slot)choose(selections.find(r=>r.key===slot.key)||slot);
  if(marker.kind==='person')onMemory?.(marker.id);else onShadow?.(marker.id);
 };

 return <section className="tl-board" aria-label="时间线">
  <div className="tl-board-bar">
   <div className="narrative-switch" role="group" aria-label="时间线顺序"><button aria-pressed={activeMode==='narration'} onClick={()=>setActiveMode?.('narration')}>故事叙述</button><button aria-pressed={activeMode==='story'} onClick={()=>setActiveMode?.('story')}>时间叙述</button></div>
   <button className="tl-bar-button" aria-label="定位当前" title="定位当前" onClick={()=>{const el=scroll.current;if(el&&currentIndex>=0)el.scrollTo({left:Math.max(0,currentIndex*unit-unit),behavior:'smooth'});}}><Icon name="locate"/></button>
   {extraTools}
   <button className="tl-bar-button" aria-label="新增轨道" title="新增轨道" onClick={createTrack}>＋ 轨道</button>
   <span className="tl-hint">滚轮缩放 · 横向拖动卡片可移动位置 · 两侧拖动可改变跨度</span>
   <small className="tl-count">{track.slots.length} 个刻度 · {track.markers.length} 个条目</small>
  </div>
  <div className="tl-board-body">
   <div className="tl-labels">
    <div className="tl-corner"><Icon name="route"/><span>{activeMode==='story'?'故事时间':'卷章'}</span></div>
    {layout.map(lane=><div className="tl-track-label" key={lane.id} style={{'--track-color':lane.track.color}}>
     <span className="tl-track-dot" onClick={()=>setMenu({trackId:lane.id})} role="button" tabIndex={0} aria-label={`${lane.track.name} 颜色与操作`} />
     {renaming===lane.id
      ?<input autoFocus defaultValue={lane.track.name} aria-label="轨道名称" onBlur={e=>renameTrack(lane.id,e.target.value)} onKeyDown={e=>{if(e.key==='Enter')renameTrack(lane.id,e.currentTarget.value);if(e.key==='Escape')setRenaming(null);}}/>
      :<button className="tl-track-name" onClick={()=>setRenaming(lane.id)} title="点击重命名">{lane.track.name}</button>}
     <small>{lane.placed.length}</small>
     {menu?.trackId===lane.id&&<div className="tl-track-menu" role="menu">
      <div className="tl-swatches">{PALETTE.map(color=><button key={color} type="button" aria-label={`设为 ${color}`} style={{background:color}} className={lane.track.color===color?'is-active':''} onClick={()=>{colorTrack(lane.id,color);setMenu(null);}}/>)}</div>
      <button type="button" onClick={()=>{setRenaming(lane.id);setMenu(null);}}>重命名</button>
      <button type="button" disabled={tracks.length<=1} onClick={()=>removeTrack(lane.id)}>删除轨道</button>
     </div>}
    </div>)}
   </div>
   <div className="tl-scroll" ref={scroll} onScroll={e=>setScrollLeft(e.currentTarget.scrollLeft)} tabIndex={0} aria-label="时间线，可左右滚动，滚轮缩放">
    <div className="tl-canvas" ref={surface} style={{width:totalWidth}}>
     <div className="tl-ruler">
      {track.slots.map((slot,i)=><button type="button" key={slot.key} className={`tl-tick ${currentIndex===i?'is-current':''}`} style={{left:i*unit,width:unit}} onClick={()=>{const hit=selections.find(r=>r.key===slot.key||(slot.chapterId&&r.chapterId===slot.chapterId)||(slot.eventId&&r.eventId===slot.eventId));choose(hit||slot);}} onDragOver={e=>{if(slot.chapterId&&onDropPlan){e.preventDefault();e.dataTransfer.dropEffect='move';}}} onDrop={e=>{e.preventDefault();const nodeId=e.dataTransfer.getData('text/plain');if(nodeId&&slot.chapterId)onDropPlan(nodeId,slot.chapterId);}}>
       <small>{displayNumberedTitle(slot.subtitle,preferences.numbering)}</small>
       <strong>{displayNumberedTitle(slot.title,preferences.numbering)}</strong>
      </button>)}
      {pointerLeft!==null&&<div className="tl-pointer" style={{left:pointerLeft}} aria-hidden="true"><span/></div>}
     </div>
     {layout.map(lane=><div className="tl-lane" key={lane.id} style={{height:lane.laneHeight,'--track-color':lane.track.color}}>
      {track.slots.map((slot,i)=><div key={slot.key} className="tl-cell" style={{left:i*unit,width:unit}}/>)}
      {lane.placed.map(({marker,row})=>{
       const moving=drag?.key===marker.key,start=moving?drag.start:marker.start,end=moving?drag.end:marker.end;
       const width=Math.max(unit-8,(end-start+1)*unit-8);
       const cast=(board.planning||[]).find(p=>(marker.kind==='event'&&p.foreshadowRefs)||false);
       return <div key={marker.key} className={`tl-card kind-${marker.kind} ${moving?'is-dragging':''} ${marker.planned?'is-planned':''}`}
        style={{left:start*unit+4,top:CARD_GAP+row*(CARD_HEIGHT+CARD_GAP),width,'--track-color':lane.track.color}}
        onPointerDown={e=>{if(e.target.closest('.tl-card-handle'))return;beginDrag(e,marker,'move');}}>
        <button type="button" className="tl-card-handle start" aria-label={`调整 ${marker.title} 起点`} onPointerDown={e=>beginDrag(e,marker,'start')}/>
        <button type="button" className="tl-card-main" onClick={()=>activate(marker)} title={marker.title}>
         <strong>{marker.title}</strong>
         <small>{marker.kind==='event'?(marker.event?.storyTime||marker.event?.storyDate||(marker.planned?'计划情境':'事件')):marker.kind==='person'?'人物':marker.linkedOnly?'关联':'伏笔'}</small>
        </button>
        <button type="button" className="tl-card-handle end" aria-label={`调整 ${marker.title} 终点`} onPointerDown={e=>beginDrag(e,marker,'end')}/>
       </div>;
      })}
     </div>)}
     {!track.slots.length&&<p className="tl-empty">先添加章节，这里就会出现时间刻度。</p>}
    </div>
   </div>
  </div>
  {track.waiting.length>0&&<div className="tl-waiting" aria-label="待安排剧情">
   <strong>待安排</strong>
   {track.waiting.map(f=><button type="button" key={f.id} className="tl-waiting-card" onClick={()=>onShadow?.(f.id)}><span>{f.title}</span><small>未指定时间位置</small></button>)}
  </div>}
 </section>;
}
