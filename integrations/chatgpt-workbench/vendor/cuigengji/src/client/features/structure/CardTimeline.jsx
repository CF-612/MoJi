import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Modal} from '../../shared/preferences.tsx';
import {useModules} from '../../modules/context.tsx';
import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {displayNumberedTitle} from '../../../domain/title-numbering.js';
import {DEFAULT_LAYOUT,timelineItems,timelineSlots,itemBounds,anchorAt,visibleTimelineItems,packTimeline} from '../../../domain/card-timeline.mjs';
import {cardTimelineStyles} from './card-timeline-style.mjs';

const palette=['#67889b','#b17f59','#937ca8','#718d6a','#b27882','#788dba'];
const kindLabel={planning:'剧情卡',event:'事件',foreshadow:'伏笔',person:'人物出场'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function CardTimeline({board,novelId,call,mode,current,choose,onPlan,onEvent,onMemory,onShadow,busy,setMode,controls,extraTools}){
 const modules=useModules(),{preferences}=useWorkbenchPreferences();
 const activeMode=controls?.mode||mode||'narration',setActiveMode=controls?.setMode||setMode;
 const zoom=controls?.zoom??100,setZoom=controls?.setZoom||(()=>{});
 const [layout,setLayout]=useState(structuredClone(DEFAULT_LAYOUT)),[loaded,setLoaded]=useState(false),[saving,setSaving]=useState(0),[error,setError]=useState('');
 const [selected,setSelected]=useState(null),[menu,setMenu]=useState(null),[manage,setManage]=useState(false),[castList,setCastList]=useState(null),[trayOpen,setTrayOpen]=useState(()=>window.innerHeight>=560),[gesture,setGesture]=useState(null),[historyTick,setHistoryTick]=useState(0),[showHelp,setShowHelp]=useState(false);
 const [focused,setFocused]=useState(()=>window.innerHeight<560);
 const scroll=useRef(null),canvas=useRef(null),layoutRef=useRef(layout),serverRef=useRef(layout),queue=useRef(Promise.resolve()),generation=useRef(0),errorRef=useRef(false),undo=useRef([]),redo=useRef([]),suppressClick=useRef(0),cleanup=useRef(()=>{}),zoomRef=useRef(zoom),setZoomRef=useRef(setZoom);
 zoomRef.current=zoom;setZoomRef.current=setZoom;
 const load=async()=>{const at=++generation.current;setLoaded(false);setError('');errorRef.current=false;try{const data=await call('timeline.layout.get',{novelId});if(at!==generation.current)return;setLayout(data);layoutRef.current=data;serverRef.current=data;undo.current=[];redo.current=[];setLoaded(true);}catch(e){setError(e.message);}};
 useEffect(()=>{load();setSelected(null);return()=>{generation.current++;cleanup.current();};},[novelId,call]);
 useEffect(()=>{const root=document.querySelector('.cuigengji');root?.classList.toggle('v23-focus',focused);return()=>root?.classList.remove('v23-focus');},[focused]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape'){setMenu(null);cleanup.current();setGesture(null);}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
 const commit=(transform,record=true)=>{
  if(!loaded||errorRef.current)return;
  const before=layoutRef.current,next=transform(structuredClone(before));
  if(record){undo.current.push(structuredClone(before));redo.current=[];setHistoryTick(n=>n+1);}
  layoutRef.current=next;setLayout(next);setSaving(n=>n+1);const at=generation.current;
  queue.current=queue.current.then(async()=>{
   if(at!==generation.current||errorRef.current)return;
   const value=transform(structuredClone(serverRef.current));
   const saved=await call('timeline.layout.save',{novelId,expectedRevision:serverRef.current.revision,value:{tracks:value.tracks,placements:value.placements}});
   if(at!==generation.current)return;
   serverRef.current=saved;layoutRef.current={...layoutRef.current,revision:saved.revision};setLayout({...layoutRef.current});
  }).catch(e=>{if(at===generation.current){errorRef.current=true;setError(e.message);}}).finally(()=>{if(at===generation.current)setSaving(n=>Math.max(0,n-1));});
 };
 const patchItem=(item,patch)=>commit(old=>({...old,placements:{...old.placements,[item.key]:{...old.placements[item.key],...patch}}}));
 const changeHistory=back=>{const from=back?undo.current:redo.current,to=back?redo.current:undo.current;if(!from.length||saving)return;to.push(structuredClone(layoutRef.current));const previous=from.pop();commit(old=>({...old,tracks:previous.tracks,placements:previous.placements}),false);setHistoryTick(n=>n+1);};
 const all=useMemo(()=>timelineItems(board),[board]);
 const available=['event','person',...(modules.foreshadow?['foreshadow']:[])],filter=controls?.filter??'all',kinds=(Array.isArray(filter)?filter:filter==='all'?available:[filter]);
 const shown=useMemo(()=>visibleTimelineItems(all,{kinds,person:controls?.castFilter||''}),[all,filter,controls?.castFilter,modules.foreshadow]);
 const slots=useMemo(()=>timelineSlots(board,activeMode),[board,activeMode]);
 const unit=260*zoom/100,cardWidth=zoom<65?210:250,cardHeight=140;
 const packed=useMemo(()=>packTimeline(shown,board,activeMode,layout,slots,unit,cardWidth,cardHeight),[shown,board,activeMode,layout,slots,unit,cardWidth]);
 const selectedItem=all.find(i=>i.key===selected),selectedBounds=selectedItem?itemBounds(selectedItem,board,activeMode,layout,slots):null;
 const pointer=selectedBounds?.start??Math.max(0,slots.findIndex(s=>s.chapterId===current?.chapterId||s.eventId&&s.eventId===current?.eventId))+.12;
 const people=board.nodes||[];
 const select=item=>{if(Date.now()<suppressClick.current)return;setSelected(item.key);const bounds=itemBounds(item,board,activeMode,layout,slots),slot=bounds?slots[Math.floor(bounds.start)]:null;if(item.kind==='event')choose?.({key:item.id,eventId:item.id,event:item.source,chapterId:item.chapterIds[0]||null});else if(slot)choose?.({...slot,key:slot.eventId||`chapter:${slot.chapterId}`});};
 const edit=item=>{setMenu(null);if(item.kind==='planning')onPlan?.(null,item.id);else if(item.kind==='event')onEvent?.(item.id);else if(item.kind==='foreshadow')onShadow?.(item.id);else onMemory?.(item.id);};
 const context=(e,item)=>{e.preventDefault();setSelected(item.key);const safeBottom=Math.min(window.innerHeight,document.querySelector('.cuigengji')?.getBoundingClientRect().bottom||window.innerHeight);setMenu({item,x:clamp(e.clientX,8,window.innerWidth-244),y:clamp(e.clientY,8,Math.max(8,safeBottom-350))});};
 const setPosition=(item,start,end,trackId)=>{const position={start:anchorAt(start,slots),end:anchorAt(end,slots)};patchItem(item,{trackId,[activeMode]:position});setSelected(item.key);};
 const hit=(x,y)=>{const lane=document.elementFromPoint(x,y)?.closest('[data-v23-lane]');if(!lane)return null;const body=lane.querySelector('.v23-lane-body');if(!body)return null;return {trackId:lane.dataset.v23Lane,value:clamp((x-body.getBoundingClientRect().left)/unit,0,slots.length-.001)};};
 const pointerStart=(e,item,edge='move',force=false)=>{
  if(!loaded||busy||errorRef.current||e.button!==0)return;
  if(!force&&e.target.closest('button,input,select,a'))return;
  cleanup.current();
  const initial={x:e.clientX,y:e.clientY,at:Date.now()},bounds=itemBounds(item,board,activeMode,layout,slots),placement=layoutRef.current.placements[item.key]||{},trackId=placement.trackId||layout.tracks[0].id;
  let moving=false,proposed=null,timer;
  const originalUserSelect=document.body.style.userSelect;
  if(e.pointerType==='touch'&&!force)timer=setTimeout(()=>{if(!moving){context(e,item);stop();}},520);
  const stop=()=>{clearTimeout(timer);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);document.body.style.userSelect=originalUserSelect;cleanup.current=()=>{};};
  const cancel=()=>{stop();setGesture(null);};
  const move=ev=>{
   const distance=Math.hypot(ev.clientX-initial.x,ev.clientY-initial.y);if(!moving&&distance<6)return;
   clearTimeout(timer);
   if(e.pointerType==='touch'&&!force&&Date.now()-initial.at<200){stop();return;}
   moving=true;ev.preventDefault();document.body.style.userSelect='none';
   const target=hit(ev.clientX,ev.clientY);
   if(target){let start,end;
    if(edge==='start'){end=bounds?.end??target.value;start=Math.min(end,target.value);}
    else if(edge==='end'){start=bounds?.start??target.value;end=Math.max(start,target.value);}
    else {const span=bounds?bounds.end-bounds.start:0,offset=bounds?(initial.x-(document.querySelector(`[data-v23-lane="${trackId}"] .v23-lane-body`)?.getBoundingClientRect().left||0))/unit-bounds.start:.1;start=clamp(target.value-offset,0,slots.length-.001-span);end=start+span;}
    proposed={start,end,trackId:edge==='move'?target.trackId:trackId};
   }else proposed=null;
   setGesture({item,x:ev.clientX,y:ev.clientY,proposed});
   const rect=scroll.current?.getBoundingClientRect();if(rect){if(ev.clientX>rect.right-36)scroll.current.scrollLeft+=18;else if(ev.clientX<rect.left+90)scroll.current.scrollLeft-=18;if(ev.clientY>rect.bottom-24)scroll.current.scrollTop+=12;else if(ev.clientY<rect.top+65)scroll.current.scrollTop-=12;}
  };
  const up=ev=>{stop();setGesture(null);if(!moving)return;suppressClick.current=Date.now()+350;if(proposed)setPosition(item,proposed.start,proposed.end,proposed.trackId);else if(bounds&&document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.v23-tray'))patchItem(item,{[activeMode]:null});};
  window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);cleanup.current=cancel;
  if(force){e.preventDefault();e.stopPropagation();}
 };
 const zoomAt=(next,clientX)=>{const el=scroll.current;if(!el)return;const rect=el.getBoundingClientRect(),gutter=el.querySelector('.v23-ruler-corner')?.getBoundingClientRect().width||84,pivot=clamp(clientX-rect.left-gutter,0,el.clientWidth),before=zoomRef.current;next=clamp(Math.round(next),35,160);zoomRef.current=next;setZoomRef.current(next);requestAnimationFrame(()=>{el.scrollLeft=(el.scrollLeft+pivot)*next/before-pivot;});};
 useEffect(()=>{
  const el=scroll.current;if(!el)return;
  let pinch=null;
  const wheel=e=>{if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){return;}e.preventDefault();zoomAt(zoomRef.current*(e.deltaY<0?1.1:1/1.1),e.clientX);};
  const start=e=>{if(e.touches.length===2){cleanup.current();pinch={distance:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),zoom:zoomRef.current};}};
  const move=e=>{if(!pinch||e.touches.length!==2)return;e.preventDefault();zoomAt(pinch.zoom*Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)/pinch.distance,(e.touches[0].clientX+e.touches[1].clientX)/2);};
  const end=()=>{pinch=null;};
  el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('touchstart',start,{passive:true});el.addEventListener('touchmove',move,{passive:false});el.addEventListener('touchend',end);el.addEventListener('touchcancel',end);
  return()=>{el.removeEventListener('wheel',wheel);el.removeEventListener('touchstart',start);el.removeEventListener('touchmove',move);el.removeEventListener('touchend',end);el.removeEventListener('touchcancel',end);};
 },[novelId,loaded]);
 const pan=e=>{if(e.button!==0||e.target.closest('.v23-item,button,input,select'))return;const el=scroll.current,at={x:e.clientX,y:e.clientY,left:el.scrollLeft,top:el.scrollTop};const move=ev=>{el.scrollLeft=at.left-(ev.clientX-at.x);el.scrollTop=at.top-(ev.clientY-at.y);};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};if(e.pointerType==='mouse'){window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});}};
 const drop=(e,trackId)=>{e.preventDefault();const key=e.dataTransfer.getData('application/x-moji-timeline'),item=all.find(i=>i.key===key);if(!item)return;const rect=e.currentTarget.querySelector('.v23-lane-body').getBoundingClientRect(),start=clamp((e.clientX-rect.left)/unit,0,slots.length-.001);setPosition(item,start,start,trackId);};
 const currentTitle=selectedItem?.title||'选择卡片，沿时间查看故事';
 const avatars=item=>{
  const ids=item.kind==='planning'?item.cast.filter(r=>r.kind==='appearance').map(r=>r.nodeId):item.related;
  const persons=ids.map(id=>people.find(p=>p.id===id)).filter(Boolean);if(!persons.length)return null;
  const description=item.kind==='planning'?'出场人物':'关联人物（不代表正文出场）';
  return <div className="v23-avatars" role="group" aria-label={`${description}：${persons.map(p=>p.name).join('、')}`} title={description}>{persons.slice(0,3).map(p=><button key={p.id} type="button" aria-label={`查看人物 ${p.name}`} title={p.name} onClick={e=>{e.stopPropagation();onMemory?.(p.id);}}>{p.avatarImage?<img src={p.avatarImage} alt=""/>:<span>{p.name.slice(0,1)}</span>}</button>)}{persons.length>3&&<button aria-label={`展开全部 ${persons.length} 位人物`} onClick={e=>{e.stopPropagation();setCastList(persons);}}>+{persons.length-3}</button>}</div>;
 };
 const cardFace=(item,waiting=false)=><>
  <header><span className={`v23-kind kind-${item.kind}`}>{kindLabel[item.kind]}</span>{avatars(item)}</header>
  <strong className="v23-card-title" title={item.title}>{item.title}</strong>
  <p className="v23-card-summary" title={item.summary}>{item.summary||'尚未填写摘要，可双击补充。'}</p>
  <footer><span className="v23-card-status">{item.status}{item.source.review?' · 待复核':''}</span><span>{item.foreshadows.length?`${item.foreshadows.length} 伏笔`:item.chapterIds.length?`${item.chapterIds.length} 章`:waiting?'待安排':item.source.storyTime||''}</span></footer>
  <button className="v23-grip" aria-label={`拖动 ${item.title}`} title="拖动到时间线安排位置" onPointerDown={e=>pointerStart(e,item,'move',true)}>⠿</button>
 </>;
 const addTrack=()=>{const id=`track-${crypto.randomUUID().slice(0,8)}`;commit(old=>({...old,tracks:[...old.tracks,{id,name:`支线 ${old.tracks.length}`,color:palette[old.tracks.length%palette.length]}]}));setManage(true);};
 const downloadDraft=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(layoutRef.current,null,2)],{type:'application/json'}));a.href=url;a.download='墨叽-时间线安排草稿.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="tl-board timeline-v23" aria-label="剧情卡时间线"><style>{cardTimelineStyles}</style>
  <div className="v23-toolbar"><div className="v23-mode"><button aria-label={focused?'展开工作台导航':'专注时间线'} title={focused?'展开工作台导航':'收起导航，留出时间线空间'} onClick={()=>setFocused(!focused)}>{focused?'‹ 导航':'⛶'}</button><button aria-pressed={activeMode==='narration'} onClick={()=>setActiveMode?.('narration')}>叙述顺序</button><button aria-pressed={activeMode==='story'} onClick={()=>setActiveMode?.('story')}>故事顺序</button></div><div className="v23-toolbar-right"><button aria-label="定位当前剧情" title="定位当前剧情" onClick={()=>scroll.current?.scrollTo({left:Math.max(0,pointer*unit-100),behavior:'smooth'})}>⌖</button>{extraTools}<button onClick={addTrack} disabled={!loaded}>＋ 轨道</button><button aria-label="时间线操作说明" onClick={()=>setShowHelp(true)}>?</button></div></div>
  {error&&<div className="v23-error" role="alert">{error}<button onClick={downloadDraft}>导出安排草稿</button><button onClick={load}>重新读取</button></div>}
  <div className="v23-scroll" ref={scroll} aria-label="可平移缩放的剧情时间线" tabIndex={0} onPointerDown={pan}>
   <div ref={canvas} className="v23-canvas" style={{width:`calc(${packed.width}px + var(--v23-gutter))`}}>
    <div className="v23-ruler"><div className="v23-ruler-corner">{activeMode==='story'?'故事顺序':'卷 · 章'}</div><div className="v23-ruler-body" style={{width:packed.width}}>{slots.map((slot,i)=><button key={slot.id} className="v23-tick" style={{left:i*unit,width:Math.max(82,unit-12)}} onClick={()=>{if(slot.chapterId)choose?.({...slot,key:`chapter:${slot.chapterId}`});}}><small>{displayNumberedTitle(slot.subtitle,preferences.numbering)}</small><span>{displayNumberedTitle(slot.title,preferences.numbering)}</span></button>)}<span className="v23-ruler-pointer" style={{left:pointer*unit}} aria-label="当前剧情指针">▼</span></div></div>
    {packed.lanes.map(lane=><div className="v23-lane" data-v23-lane={lane.track.id} key={lane.track.id} style={{height:lane.height,'--lane-color':lane.track.color}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}} onDrop={e=>drop(e,lane.track.id)}>
     <div className="v23-lane-label"><button title="管理轨道" onClick={()=>setManage(true)}><i style={{background:lane.track.color}}/>{lane.track.name}</button></div>
     <div className="v23-lane-body" style={{width:packed.width}}><span className="v23-lane-rail"/><span className="v23-position-line" style={{left:pointer*unit}}/>
      {lane.items.map(item=><article key={item.key} data-timeline-key={item.key} aria-label={`${kindLabel[item.kind]}：${item.title}`} tabIndex={0} className={`v23-item ${selected===item.key?'is-selected':''} kind-${item.kind}`} style={{left:item.start*unit,top:item.top,width:item.width,'--card-color':item.color}} onPointerDown={e=>pointerStart(e,item)} onClick={()=>select(item)} onDoubleClick={()=>edit(item)} onContextMenu={e=>context(e,item)} onKeyDown={e=>{if(e.key==='Enter'){select(item);setMenu({item,x:100,y:150});}}}>
       <div className="v23-card-face" style={{width:item.cardWidth}}>{cardFace(item)}</div>
       <span className={`v23-duration ${item.end>item.start?'has-span':''}`} style={{width:Math.max(12,(item.end-item.start)*unit)}}><i/><span>{item.end>item.start?`${slots[Math.floor(item.start)]?.title} → ${slots[Math.floor(item.end)]?.title}`:''}</span></span>
       {selected===item.key&&item.kind!=='person'&&<><button className="v23-endpoint start" aria-label={`调整 ${item.title} 起点`} onPointerDown={e=>pointerStart(e,item,'start',true)}/><button className="v23-endpoint end" aria-label={`调整 ${item.title} 终点`} style={{left:Math.max(12,(item.end-item.start)*unit)-6}} onPointerDown={e=>pointerStart(e,item,'end',true)}/></>}
      </article>)}
      {gesture?.proposed?.trackId===lane.track.id&&<div className="v23-drop-indicator" style={{left:gesture.proposed.start*unit}}><span>放在这里 · {slots[Math.floor(gesture.proposed.start)]?.title}</span></div>}
      {!lane.items.length&&<div className="v23-lane-empty">把下方卡片拖到这里，或右键卡片选择“安排到当前”。</div>}
     </div>
    </div>)}
   </div>
  </div>
  <div className={`v23-tray ${trayOpen?'is-open':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const item=all.find(i=>i.key===e.dataTransfer.getData('application/x-moji-timeline'));if(item)patchItem(item,{[activeMode]:null});}}><header><button className="v23-tray-toggle" aria-expanded={trayOpen} onClick={()=>setTrayOpen(!trayOpen)}>待安排 <strong>{packed.waiting.length}</strong><span>{trayOpen?'⌄':'⌃'}</span></button><small>同一张卡，拖入时间线即可安排</small></header>{trayOpen&&<div className="v23-tray-cards">{packed.waiting.map(item=><article key={item.key} data-waiting-key={item.key} className={`v23-tray-card kind-${item.kind} ${selected===item.key?'is-selected':''}`} tabIndex={0} aria-label={`待安排${kindLabel[item.kind]}：${item.title}`} draggable onDragStart={e=>{e.dataTransfer.setData('application/x-moji-timeline',item.key);e.dataTransfer.effectAllowed='move';}} onClick={()=>select(item)} onDoubleClick={()=>edit(item)} onContextMenu={e=>context(e,item)} onPointerDown={e=>pointerStart(e,item)} style={{'--card-color':layout.placements[item.key]?.color||'#8b8e86'}}>{cardFace(item,true)}</article>)}{!packed.waiting.length&&<p className="v23-all-placed">当前筛选下的卡片均已安排。移出时间线后仍会保留在这里。</p>}</div>}</div>
  <div className="v23-status"><span>{saving?'正在保存安排…':error?'安排草稿未保存':loaded?'安排已保存':'正在读取…'}</span><span className="v23-current-caption">{currentTitle}</span><button disabled={!undo.current.length||!!saving} aria-label="撤销时间线安排" onClick={()=>changeHistory(true)}>↶</button><button disabled={!redo.current.length||!!saving} aria-label="重做时间线安排" onClick={()=>changeHistory(false)}>↷</button><span aria-label="当前时间线缩放">{zoom}%</span></div>
  {gesture&&createPortal(<div className="v23-drag-ghost" style={{left:gesture.x+14,top:gesture.y+14}}>{gesture.item.title}<small>{gesture.proposed?'松手放置':'移到轨道上安排'}</small></div>,document.body)}
  {menu&&createPortal(<><div className="v23-menu-backdrop" onPointerDown={()=>setMenu(null)}/><div className="v23-menu" role="menu" style={{left:menu.x,top:menu.y}}><strong>{menu.item.title}</strong><button role="menuitem" onClick={()=>edit(menu.item)}>编辑完整卡片</button><button role="menuitem" onClick={()=>{setPosition(menu.item,pointer,pointer,layout.tracks[0].id);setMenu(null);}}>安排到当前指针</button><label>所在轨道<select aria-label="卡片所在轨道" value={layout.placements[menu.item.key]?.trackId||layout.tracks[0].id} onChange={e=>patchItem(menu.item,{trackId:e.target.value})}>{layout.tracks.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><div className="v23-colors" aria-label="卡片颜色">{palette.map(color=><button key={color} aria-label={`卡片颜色 ${color}`} style={{background:color}} onClick={()=>patchItem(menu.item,{color})}/>)}</div><button role="menuitem" onClick={()=>{patchItem(menu.item,{[activeMode]:null});setMenu(null);}}>移回待安排（保留卡片）</button><small>安排与配色不会改变正文依据。</small></div></>,document.body)}
  {manage&&<Modal title="时间线轨道" close={()=>setManage(false)}><div className="v23-track-settings">{layout.tracks.map(track=><div key={track.id}><label>轨道名称<input aria-label={`轨道名称 ${track.id}`} value={track.name} onChange={e=>{const name=e.target.value||'未命名';commit(old=>({...old,tracks:old.tracks.map(t=>t.id===track.id?{...t,name}:t)}));}}/></label><div className="v23-colors">{palette.map(color=><button key={color} aria-label={`轨道 ${track.name} 颜色 ${color}`} style={{background:color}} onClick={()=>commit(old=>({...old,tracks:old.tracks.map(t=>t.id===track.id?{...t,color}:t)}))}/>)}</div><button disabled={layout.tracks.length===1} onClick={()=>commit(old=>({...old,tracks:old.tracks.filter(t=>t.id!==track.id),placements:Object.fromEntries(Object.entries(old.placements).map(([key,p])=>[key,p.trackId===track.id?{...p,trackId:old.tracks.find(t=>t.id!==track.id).id}:p]))}))}>移除轨道，卡片转入其他轨道</button></div>)}<button onClick={addTrack}>＋ 新建轨道</button></div></Modal>}
  {castList&&<Modal title="关联人物" close={()=>setCastList(null)}>{castList.map(p=><button key={p.id} onClick={()=>{setCastList(null);onMemory?.(p.id);}}>{p.name}</button>)}</Modal>}
  {showHelp&&<Modal title="使用剧情时间线" close={()=>setShowHelp(false)}><div className="v23-help"><p>单击选择，双击编辑；右键或手机长按打开更多。</p><p>拖动卡片改变位置、跨轨移动；选中后拖动两端调整跨度。手机可以从卡片右下角的 ⠿ 开始拖动。</p><p>滚轮缩放，Shift＋滚轮横向浏览；空白处拖动平移，手机双指缩放。多行内容可使用右侧滚动条查看。</p><p>下方待安排区保存尚未放入当前时间顺序的卡片。拖回这里只取消安排，不删除原卡。</p><p>叙述顺序和故事顺序分别安排。这里的拖动、跨度和配色不改变正文依据，不会自动确认人物出场或关系变化。</p></div></Modal>}
 </section>;
}
