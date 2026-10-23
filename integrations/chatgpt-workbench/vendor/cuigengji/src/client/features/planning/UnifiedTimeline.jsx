import {useTimelineMarquee} from './useTimelineMarquee.jsx';
import {timelineVerticalScale,timelineVerticalMetrics} from './timeline-zoom.mjs';
import {useEditingDragGuard} from './useEditingDragGuard.jsx';
import {TimelinePlayhead} from './TimelinePlayhead.jsx';
import {TimelineTrackEditor} from './TimelineTrackEditor.jsx';
import {TimelineWorkspace} from './TimelineWorkspace.jsx';
import {TimelineTray} from './TimelineTray.jsx';
import {TimelineTrackHeader} from './TimelineTrackHeader.jsx';
import {TimelineToolbar} from './TimelineToolbar.jsx';
import {timelineWheelIntent} from './timeline-wheel.mjs';
import {useRelationSidebar,RelationSidebarDivider} from './RelationSidebar.jsx';
import {narrationTrackCatalog} from '../../../domain/story-tracks.mjs';
import {planningCardPresentation} from '../../shared/planning-card-presentation.mjs';
import React,{useState,useRef,useEffect} from 'react';
import {createPortal} from 'react-dom';
import {CastAvatars} from '../../shared/CastAvatars.tsx';
import {relationRange,relationTimeLabel,relationPoint,pair} from '../../../domain/story-relations.mjs';
import {TimelineRelations} from './TimelineRelations.jsx';
import {Modal} from '../../shared/preferences.tsx';
import {timelineBounds,timelineItems,projectTimeline} from '../../../domain/story-timeline.mjs';
import {trackColor,trackPalette,cardStates} from '../../../domain/story-presentation.mjs';
import {timelineInteractionStyle} from './timeline-interaction-style.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function UnifiedTimeline({foreshadowIds=new Set(),editor=null,call,novelId,state,sources,people,relations=[],evolution=true,save,unavailable,open,onMemory,relationClock,relationTarget,onRelationReady,onCreate,onMore}){
 const relationSidebar=useRelationSidebar(novelId,'narration',relationTarget);
 const [localMode,setLocalMode]=useState('narration'),[zoom,setZoom]=useState(1),[localCursor,setLocalCursor]=useState(0),[selected,setSelected]=useState(null),[drag,setDrag]=useState(null),[tray,setTray]=useState(false),[feedback,setFeedback]=useState(''),[trackEditing,setTrackEditing]=useState(null);
 const [initialPair]=useState(()=>relationTarget?.pair?pair(...relationTarget.pair):null);
 useEffect(()=>{if(relationTarget)onRelationReady?.();},[]);
 const {mode,setMode,cursor:storedCursor,setCursor}=relationClock||{mode:localMode,setMode:setLocalMode,cursor:localCursor,setCursor:setLocalCursor};
 const viewport=useRef(null),root=useRef(null),trayTarget=useRef(null),gesture=useRef(null),touches=useRef(new Map()),pinch=useRef(null),latest=useRef(null),pointerDragged=useRef(false),dragLock=useRef(false);
 const editGuard=useEditingDragGuard({editing:!!editor,draggedRef:pointerDragged,notify:setFeedback});
 const marquee=useTimelineMarquee({viewport,cardSelector:'[data-time-item]',idAttribute:'data-time-item',editing:!!editor,onSelection:setSelected,onBlocked:e=>{if(e)editGuard.begin(e);else setFeedback('请先保存或取消编辑，再选择卡片');}});
 const chapters=sources.chapters,unit=320*zoom,all=Object.values(state.cards),{origin,count}=relationRange(state.cards,chapters,mode),width=count*unit,tickStep=Math.max(1,Math.ceil(count/500),Math.ceil(72/unit)),cursor=clamp(storedCursor,0,count-.001);
 const bounds=card=>timelineBounds(card,chapters,mode,origin);
 const items=timelineItems(state.cards,chapters,mode,origin),unplaced=all.filter(card=>!bounds(card));
 const lifted=drag&&['move','place'].includes(drag.kind),pending=drag?.candidate;
 const returning=drag?.valid&&drag.target==='tray';
 const projected=returning?items.filter(item=>item.id!==drag.card.id):drag?.valid?projectTimeline(items,{id:drag.card.id,card:drag.card,...pending},pending.row):items;
 const orderedTracks=narrationTrackCatalog(state);
 const verticalScale=timelineVerticalScale(zoom),geometry=timelineVerticalMetrics(verticalScale),rowGap=geometry.rowHeight,arrange=orderedTracks.map((original,index)=>{const track={...original,color:trackColor(original,index)},cards=projected.filter(item=>item.trackId===track.id);
  const rowCount=Math.max(1,track.rowCounts?.[mode]||0,...cards.map(c=>c.row+1),...(drag?items.filter(i=>i.trackId===track.id).map(i=>i.row+1):[]));
  return {track,cards,height:Math.max(geometry.minHeight,rowCount*rowGap+geometry.cardHeight)};
 });
 latest.current={zoom,unit,width,count,mode,cursor,origin};
 const capture=e=>(root.current||viewport.current)?.setPointerCapture(e.pointerId);
 const timeAt=x=>{const el=viewport.current,r=el.getBoundingClientRect();return clamp((x-r.left+el.scrollLeft)/latest.current.unit,0,latest.current.count-.001);};
 const zoomAt=(next,clientX)=>{const el=viewport.current;if(!el)return;const r=el.getBoundingClientRect(),x=clientX===undefined?el.clientWidth/2:clientX-r.left,at=(el.scrollLeft+x)/latest.current.unit,z=clamp(next,.15,2);latest.current.zoom=z;latest.current.unit=320*z;setZoom(z);requestAnimationFrame(()=>{el.scrollLeft=Math.max(0,at*320*z-x);});};
 useEffect(()=>{const el=viewport.current;const wheel=e=>{if(e.target.closest('input,select,textarea,[contenteditable=true]'))return;const intent=timelineWheelIntent(e,el);if(!intent.delta)return;e.preventDefault();if(gesture.current||pinch.current||dragLock.current)return;if(intent.kind==='pan'){el.scrollLeft+=intent.delta;return;}zoomAt(latest.current.zoom*Math.exp(-intent.delta*.002),e.clientX);};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
 const schedule=(card,start,end,trackId,row)=>{
  const convert=(point,isEnd)=>{const index=clamp(isEnd?Math.ceil(point)-1:Math.floor(point),0,chapters.length-1);return {id:chapters[index]?.id,offset:point-index};};
  const a=convert(start,false),b=convert(end,true),time=mode==='narration'?{...card.time?.narration,startChapterId:a.id,startOffset:a.offset,endChapterId:b.id,endOffset:b.offset,trackId}:{...card.time?.story,start:start+origin,end:end+origin,trackId};
  const hasPoints=card.points?.some(p=>p.location?.[mode]!==undefined);
  return save({type:'card.update',id:card.id,expectedRevision:card.revision,value:{time:{...card.time,[mode]:time}},...(Number.isInteger(row)?{placement:{mode,row}}:{})},hasPoints?'已保存时间安排；卡内关系变化点仍固定在原章节／故事位置。':'已保存时间安排');
 };
 const unschedule=card=>save({type:'card.update',id:card.id,expectedRevision:card.revision,value:{time:{...card.time,[mode]:null}}},`已移回待安排；仅清除${mode==='narration'?'叙述位置':'故事时间'}，其他关联保持不变。`);
 const cancel=()=>{gesture.current=null;pinch.current=null;touches.current.clear();if(!dragLock.current)setDrag(null);};
 useEffect(()=>{const blur=()=>cancel(),key=e=>{if(e.key==='Escape'&&gesture.current){cancel();setFeedback('已取消拖动，原安排未变。');}};window.addEventListener('blur',blur);window.addEventListener('keydown',key);return()=>{window.removeEventListener('blur',blur);window.removeEventListener('keydown',key);};},[]);
 const startGesture=(e,kind,item)=>{if(item&&editGuard.begin(e))return;if(editor&&kind!=='pointer')return;
  if(unavailable||dragLock.current||e.button!==0||pinch.current||item&&mode==='narration'&&!chapters.length)return;
  e.stopPropagation();pointerDragged.current=false;setFeedback('');
  // Preserve native click / double-click until the drag threshold is crossed.
  const clickable=item&&['move','place'].includes(kind);if(!clickable){e.preventDefault();capture(e);}
  const box=e.currentTarget?.getBoundingClientRect?.()||{left:e.clientX-30,top:e.clientY-18,width:240};
  const colorScheme=typeof getComputedStyle==='function'?getComputedStyle(root.current||viewport.current).colorScheme:undefined;const ghostWidth=clamp(box.width||240,180,300),grabX=clamp(e.clientX-box.left,18,ghostWidth-18),grabY=clamp(e.clientY-box.top,10,55);
  gesture.current={pointerId:e.pointerId,kind,item,before:item?{start:item.start,end:item.end,trackId:item.trackId,row:item.row??0}:null,x:e.clientX,y:e.clientY,scroll:viewport.current.scrollLeft,scrollY:viewport.current.scrollTop,moved:false,grabX,grabY,ghostWidth,colorScheme};
  if(item){setSelected(item.card.id);if(kind!=='place')setCursor(item.start);}
 };
 const captureTouch=e=>{
  if(editor||e.pointerType!=='touch'||dragLock.current)return;
  const inArea=e.target.closest?.('.u-time-viewport,.u-tray-card');if(!inArea&&!gesture.current)return;
  if(e.target.closest?.('button')&&!e.target.closest?.('.u-span-handle,.timeline-playhead-handle'))return;
  touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.current.size<2)return;
  capture(e);const [a,b]=[...touches.current.values()],center=(a.x+b.x)/2;
  pinch.current={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:latest.current.zoom,point:timeAt(center)};
  gesture.current=null;setDrag(null);pointerDragged.current=true;e.stopPropagation();e.preventDefault();
 };
 const down=e=>{if(marquee.onPointerDown(e))return;if(e.target.closest?.('[data-time-item],.timeline-playhead-handle,button,input,textarea,select,[contenteditable=true],[data-track-control]'))return;const ruler=e.target.closest?.('.u-time-ruler');startGesture(e,ruler?'pointer':'pan');};
 const targetTrack=(x,y)=>{const r=viewport.current.getBoundingClientRect();if(x<r.left||x>=r.right||y<r.top||y>=r.bottom)return null;const id=document.elementFromPoint(x,y)?.closest('[data-track]')?.dataset.track;return state.tracks.some(t=>t.id===id)?id:null;};
 const placementAt=(g,x,y)=>{
  const trayBox=trayTarget.current?.getBoundingClientRect();
  if(g.kind==='move'&&trayBox&&x>=trayBox.left&&x<trayBox.right&&y>=trayBox.top&&y<trayBox.bottom)return {candidate:null,valid:true,target:'tray'};
  let start=g.before.start,end=g.before.end;const delta=(x-g.x+viewport.current.scrollLeft-g.scroll)/latest.current.unit,min=.08;
  if(g.kind==='place'){start=clamp(timeAt(x)-.1,0,count-min);end=Math.min(count,start+.75);}
  else if(g.kind==='move'){const length=end-start;start=clamp(start+delta,0,count-length);end=start+length;}
  else if(g.kind==='start')start=clamp(start+delta,0,end-min);else end=clamp(end+delta,start+min,count);
  const hit=targetTrack(x,y),trackId=['start','end'].includes(g.kind)?g.before.trackId:hit||g.before.trackId,lane=hit?document.elementFromPoint(x,y)?.closest('[data-track]'):null;
  const rect=lane?.getBoundingClientRect?.(),row=['start','end'].includes(g.kind)?g.before.row:rect?Math.max(0,Math.round((y-g.grabY-rect.top-geometry.cardInset)/rowGap)):g.before.row;
  return {candidate:{start,end,trackId,row},valid:!!hit,target:'track'};
 };
 const move=e=>{
  if(touches.current.has(e.pointerId))touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch.current&&touches.current.size>=2){const [a,b]=[...touches.current.values()],p=pinch.current,z=clamp(p.zoom*Math.hypot(a.x-b.x,a.y-b.y)/p.distance,.15,2),r=viewport.current.getBoundingClientRect();setZoom(z);latest.current.zoom=z;latest.current.unit=320*z;viewport.current.scrollLeft=Math.max(0,p.point*320*z-((a.x+b.x)/2-r.left));return;}
  const g=gesture.current;if(!g||g.pointerId!==e.pointerId||dragLock.current)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.moved&&Math.hypot(dx,dy)<5)return;if(!g.moved)capture(e);e.preventDefault();g.moved=true;pointerDragged.current=true;
  if(g.kind==='pan'){viewport.current.scrollLeft=g.scroll-dx;viewport.current.scrollTop=g.scrollY-dy;return;}
  if(g.kind==='pointer'){setCursor(timeAt(e.clientX));return;}
  const el=viewport.current,r=el.getBoundingClientRect();
  if(e.clientY>=r.top&&e.clientY<=r.bottom){if(e.clientX>r.right-28)el.scrollLeft+=12;else if(e.clientX<r.left+28)el.scrollLeft=Math.max(0,el.scrollLeft-12);}
  const {candidate,valid,target}=placementAt(g,e.clientX,e.clientY);
  setDrag({kind:g.kind,card:g.item.card,source:g.before,clientX:e.clientX,clientY:e.clientY,grabX:g.grabX,grabY:g.grabY,ghostWidth:g.ghostWidth,colorScheme:g.colorScheme,candidate,valid,target});if(valid&&candidate)setCursor(candidate.start);
 };
 const up=async e=>{
  touches.current.delete(e.pointerId);if(pinch.current){if(touches.current.size<2)pinch.current=null;gesture.current=null;return;}
  const g=gesture.current;if(!g||g.pointerId!==e.pointerId)return;gesture.current=null;
  if(g.kind==='pointer')setCursor(timeAt(e.clientX));
  if(g.item&&g.moved){
   // Pointer-up may arrive without a final move. Always hit-test the actual release.
   const {candidate,valid,target}=placementAt(g,e.clientX,e.clientY);
   if(!valid){setDrag(null);setFeedback('已取消拖动，原安排未变。');return;}
   dragLock.current=true;if(candidate)setCursor(candidate.start);setDrag(v=>v&&({...v,clientX:e.clientX,clientY:e.clientY,candidate,valid,target,saving:true}));
   try{const saved=await (target==='tray'?unschedule(g.item.card):schedule(g.item.card,candidate.start,candidate.end,candidate.trackId,candidate.row));if(!saved)setFeedback('未保存，卡片仍在原位置。请核对错误后重试。');else if(target==='tray')setTray(true);}
   catch{setFeedback('未保存，卡片仍在原位置。请重试。');}
   finally{dragLock.current=false;setDrag(null);}
  }
  else setDrag(null);
 };
 const pointLabel=relationTimeLabel(chapters,mode,origin+cursor);
 const ghost=lifted?<div className={`cuigengji u-drag-ghost ${drag.valid?'valid':'outside'}`} aria-label={`正在拖动 ${drag.card.title}`} style={{position:'fixed',left:drag.clientX-drag.grabX,top:drag.clientY-drag.grabY,width:drag.ghostWidth,colorScheme:drag.colorScheme}}><small>{drag.card.purpose||'剧情卡'} <span>{drag.saving?'正在保存':returning?'移回待安排':drag.valid?`放入 ${state.tracks.find(t=>t.id===pending.trackId)?.name||'轨道'}`:'移到轨道或待安排区'}</span></small><strong>{drag.card.title}</strong><CastAvatars cast={drag.card.cast||[]} people={people}/></div>:null;
 const toolbar=<TimelineToolbar mode={mode} onModeChange={id=>{cancel();setMode(id);setCursor(0);viewport.current.scrollLeft=0;}} disabled={!!editor} actionsDisabled={unavailable}
 createActions={[{id:'card',label:'新建剧情卡',onClick:()=>onCreate?.()},{id:'track',label:'新建轨道',onClick:()=>setTrackEditing({isNew:true})}]}
 onLocate={()=>viewport.current.scrollTo({left:Math.max(0,cursor*unit-viewport.current.clientWidth/2),behavior:'smooth'})} zoomLabel={Math.round(zoom*100)+'%'} onZoomOut={()=>zoomAt(zoom/1.2)} onZoomIn={()=>zoomAt(zoom*1.2)} zoomOutDisabled={zoom<=.15} zoomInDisabled={zoom>=2}
 moreActions={[...orderedTracks.map(track=>({id:track.id,label:'设置轨道：'+track.name,onClick:()=>setTrackEditing(track)})),{id:'history',label:'备份、历史与恢复',onClick:()=>onMore?.()}]}/>;
 return <div style={relationSidebar.style} className={`u-timeline ${relationSidebar.collapsed?'relations-collapsed':''} ${drag?'is-interacting':''} ${editor?'is-editing-view':''}`} ref={root} onPointerDownCapture={captureTouch} onPointerMove={e=>{if(!marquee.onPointerMove(e))move(e);}} onPointerUp={e=>{if(!marquee.onPointerUp(e))void up(e);}} onPointerCancel={e=>{marquee.onPointerCancel(e);cancel();}} onLostPointerCapture={e=>{marquee.onLostPointerCapture(e);if(gesture.current?.pointerId===e.pointerId)cancel();}} onDragStart={e=>e.preventDefault()}><style>{timelineInteractionStyle}</style>

  {feedback&&<p className="u-timeline-feedback" role="status">{feedback}</p>}
  <TimelineWorkspace layout={relationSidebar.layout} toolbar={toolbar} workspaceRef={relationSidebar.ref} className={`u-timeline-grid ${evolution?'has-relations':''} ${editor?'is-editing':''}`} columnClassName="u-timeline-column" positionLabel={pointLabel} positionHint="左拖空白平移 · 右拖框选 · 双击／右键编辑" editor={editor}
 divider={evolution&&!editor&&<RelationSidebarDivider sidebar={relationSidebar}/>}
 relations={evolution&&<TimelineRelations sidebar={relationSidebar} onCard={open} {...{call,novelId,state,sources,people,relations,mode,origin,count,cursor,selected,save,unavailable,onMemory,initialPair}} pointLabel={pointLabel} changeCursor={next=>setCursor(clamp(next,0,count-.001))}/>}
 tray={<TimelineTray trayRef={trayTarget} open={tray} onToggle={()=>setTray(!tray)} count={unplaced.length} canReceive={drag?.kind==='move'} returning={returning} saving={drag?.saving}>{unplaced.map(card=><div {...planningCardPresentation(card,foreshadowIds)} className={`u-tray-card state-${card.status} ${marquee.selectedIds.includes(card.id)?'selected':''} ${drag?.card.id===card.id?'drag-origin':''}`} key={card.id} role="button" tabIndex={0} onClick={e=>{if(!pointerDragged.current&&!e.target.closest('button'))marquee.select(card.id,e.shiftKey||e.ctrlKey||e.metaKey);}} onDoubleClick={()=>{if(!pointerDragged.current&&!editor)open(card);}} onContextMenu={e=>{e.preventDefault();if(!editor)open(card);}} onKeyDown={e=>{if(e.key==='Enter'&&e.target===e.currentTarget)open(card);}} onPointerDown={e=>{if(!e.target.closest('button'))startGesture(e,'place',{card,start:cursor,end:Math.min(count,cursor+.75),trackId:state.tracks[0].id});}}><strong>{card.title}</strong><div><button disabled={unavailable||mode==='narration'&&!chapters.length} onClick={()=>schedule(card,cursor,Math.min(count,cursor+.75),state.tracks[0].id)}>放在当前点</button></div></div>)}</TimelineTray>}>
   <div className="u-time-viewport" ref={viewport} onPointerDown={down} onContextMenu={marquee.onContextMenu}><div className="u-time-world" style={{width,minWidth:'100%'}}>
    <div className="u-time-ruler" aria-label="时间刻度">{Array.from({length:Math.ceil(count/tickStep)},(_,i)=>{const at=i*tickStep;return <span key={at} style={{left:at*unit,width:unit*tickStep}}><small>{mode==='narration'?(zoom<.5?`${at+1}`:chapters[at]?.title):at+origin}</small></span>;})}</div>
    {arrange.map(({track,cards,height})=>{const destination=drag?.valid&&pending?.trackId===track.id,previewRow=cards.find(item=>item.id===drag?.card.id)?.row??0;return <div key={track.id} className={`u-time-lane ${destination?'drop-target':''}`} data-track={track.id} style={{height,'--track-color':track.color,backgroundSize:`${unit}px 100%`}}>
     <TimelineTrackHeader scale={verticalScale} track={track} count={cards.length} busy={unavailable||!!editor} onRename={name=>save({type:'track.update',id:track.id,name,color:track.color},'已更新轨道名称')} onSettings={()=>setTrackEditing(track)}/>

     {cards.filter(item=>!lifted||!drag.valid||item.id!==drag.card.id).map(item=>{const active=item;return <div {...planningCardPresentation(item.card,foreshadowIds)} key={item.card.id} data-time-item={item.card.id} role="button" tabIndex={0} aria-label={`${planningCardPresentation(item.card,foreshadowIds).title}，${active.start.toFixed(1)} 至 ${active.end.toFixed(1)}`} className={`u-time-strip state-${item.card.status} ${zoom<.5?'compact':''} ${marquee.selectedIds.includes(item.card.id)?'selected':''} ${lifted&&drag.card.id===item.card.id?'drag-origin':''}`} style={{left:active.start*unit,width:Math.max(12,(active.end-active.start)*unit),top:geometry.cardInset+item.row*rowGap,height:geometry.cardHeight,minHeight:geometry.cardHeight,padding:`${6*verticalScale}px ${10*verticalScale}px`,borderRadius:9*verticalScale}} onPointerDown={e=>startGesture(e,'move',item)} onClick={e=>{if(!pointerDragged.current&&marquee.select(item.card.id,e.shiftKey||e.ctrlKey||e.metaKey))setCursor(item.start);}} onDoubleClick={e=>{if(!pointerDragged.current&&!e.target.closest('button'))open(item.card);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();cancel();setSelected(item.card.id);setCursor(item.start);open(item.card);}} onKeyDown={e=>{if(e.key==='Enter'){setSelected(item.card.id);setCursor(item.start);open(item.card);}}}>
      <button className="u-span-handle start" aria-label={`调整${item.card.title}起点`} onPointerDown={e=>startGesture(e,'start',item)}/><div className="u-strip-title"><strong style={{fontSize:12*verticalScale,lineHeight:1.4}} title={[item.card.title,item.card.storyDateText].filter(Boolean).join(' · ')}>{item.card.title}</strong></div>{zoom>=.5&&(item.card.points||[]).map(point=>{const absolute=relationPoint(point,mode,chapters,item.card),position=absolute===null?null:absolute-origin;if(position===null||position<item.start||position>item.end)return null;return <button key={point.id} className="u-point-marker" title={point.title||'内部关键点'} aria-label={'定位关键点 '+(point.title||'关系变化')} style={{left:((position-item.start)/(item.end-item.start)*100)+'%'}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setCursor(position);setSelected(item.card.id);}}>◆</button>;})}<button className="u-span-handle end" aria-label={`调整${item.card.title}终点`} onPointerDown={e=>startGesture(e,'end',item)}/>
     </div>;})}
     {lifted&&destination&&<div className="u-drop-preview" aria-hidden="true" style={{left:pending.start*unit,width:Math.max(12,(pending.end-pending.start)*unit),top:geometry.cardInset+previewRow*rowGap,height:geometry.cardHeight}}><span>第 {previewRow+1} 行 · 松手放入 {track.name}</span></div>}
    </div>;})}
    <TimelinePlayhead left={cursor*unit} label="拖动查看叙述时间；方向键微调，Home 回到开头" ariaLabel="当前叙述时间" min={0} max={count-.001} value={cursor} valueText={pointLabel} onPointerDown={e=>startGesture(e,'pointer')} onKeyDown={e=>{let next;if(e.key==='Home')next=0;else if(['ArrowLeft','ArrowDown','-'].includes(e.key))next=cursor-(e.shiftKey?.1:.01);else if(['ArrowRight','ArrowUp','+','='].includes(e.key))next=cursor+(e.shiftKey?.1:.01);else return;e.preventDefault();e.stopPropagation();setCursor(clamp(next,0,count-.001));}}/>

   </div>{marquee.overlay}</div>

  </TimelineWorkspace>
  {trackEditing&&<TimelineTrackEditor key={trackEditing.id||'new'} track={trackEditing.isNew?null:trackEditing} mode="narration" busy={unavailable} close={()=>setTrackEditing(null)} index={orderedTracks.findIndex(t=>t.id===trackEditing.id)} total={orderedTracks.length}
 onSave={value=>save({type:trackEditing.isNew?'track.create':'track.update',...(trackEditing.isNew?{}:{id:trackEditing.id}),...value},'已保存轨道')}
 onReorder={trackEditing.isNew?undefined:delta=>{const order=orderedTracks.map(t=>({trackId:t.id})),i=orderedTracks.findIndex(t=>t.id===trackEditing.id);[order[i],order[i+delta]]=[order[i+delta],order[i]];return save({type:'track.reorder',mode:'narration',order},'已调整叙述轨道顺序，事件时间不变');}}
 onCompact={trackEditing.isNew?undefined:()=>save({type:'track.compact',id:trackEditing.id,mode},'已收起空行，时间与跨度未变')}/>}

  {ghost&&createPortal(ghost,document.body)}
 </div>;
}

