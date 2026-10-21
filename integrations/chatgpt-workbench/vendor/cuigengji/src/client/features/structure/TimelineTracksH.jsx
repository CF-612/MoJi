import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import {displayNumberedTitle} from '../../../domain/title-numbering.js';
import {useModules} from '../../modules/context.tsx';
import React,{useEffect,useRef,useState} from 'react';
import {Icon} from '../../shared/icons.tsx';
import {timelineTracks,trackSelections} from '../../../domain/timeline-tracks.js';
import {usePreference} from '../../shared/state.js';
const kinds={all:'全部',event:'事件',person:'人物',foreshadow:'伏笔'};
const shadows={planned:'计划',planted:'已埋设',developing:'推进中',recovered:'已回收',abandoned:'已放弃'};
const refs={appearance:'实际出场',mention:'仅被提及',entering:'进入故事',participating:'参与事件'};
const LANE_HEIGHT=46,LABEL_WIDTH=168;
/** 横向时间线：章节是横轴刻度，轨道是纵向行，跨章事件是一条横贯刻度的长条。 */
export function TimelineTracksH({board,novelId,mode,current,choose,onPlan,onEvent,onMemory,onShadow,busy,setMode,controls,extraTools}){
 const modules=useModules(),{preferences}=useWorkbenchPreferences();
 const [localFilter,setLocalFilter]=usePreference(`${novelId}:timeline-filter`,'all'),filter=controls?.filter??localFilter,setFilter=controls?.setFilter??setLocalFilter;
 const available=['event','person',...(modules.foreshadow?['foreshadow']:[])],safeFilter=(Array.isArray(filter)?filter:filter==='all'?available:[filter]).filter(id=>available.includes(id)),shownBoard=modules.foreshadow?board:{...board,foreshadows:[]};
 const [localZoom,setLocalZoom]=usePreference(`${novelId}:timeline-zoom`,100),zoom=controls?.zoom??localZoom,setZoom=controls?.setZoom??setLocalZoom;
 const [localMode,setLocalMode]=usePreference(`${novelId}:timeline-view`,'narration'),activeMode=controls?.mode??mode??localMode,setActiveMode=controls?.setMode??setMode??setLocalMode;
 const scroll=useRef(null);
 const track=timelineTracks(shownBoard,activeMode,safeFilter,zoom/100),selections=trackSelections(board,activeMode);
 const unit=Math.max(84,Math.round(112*zoom/100)),width=Math.max(1,track.slots.length)*unit,totalHeight=Math.max(1,track.lanes)*LANE_HEIGHT;
 const laneOf=i=>{const own=track.markers.filter(m=>m.lane===i);if(!own.length)return{kind:'event',label:'轨道',name:'待安排'};const first=own[0];return{kind:first.kind,label:first.kind==='person'?'人物':first.kind==='foreshadow'?'伏笔':'事件',name:own.length>1?`${first.title} 等 ${own.length} 条`:first.title};};
 const currentIndex=track.slots.findIndex(s=>s.chapterId&&s.chapterId===current?.chapterId||s.eventId&&s.eventId===current?.eventId);
 useEffect(()=>{const el=scroll.current;if(!el||currentIndex<0)return;const left=currentIndex*unit;if(left<el.scrollLeft+LABEL_WIDTH||left+unit>el.scrollLeft+el.clientWidth)el.scrollTo({left:Math.max(0,left-unit),behavior:'smooth'});},[currentIndex,unit]);
 const selectSlot=idx=>{const slot=track.slots[idx];if(!slot)return;const hit=selections.find(r=>r.key===slot.key||(slot.chapterId&&r.chapterId===slot.chapterId)||(slot.eventId&&r.eventId===slot.eventId));choose(hit||slot);};
 const activate=marker=>{
  if(marker.kind==='event'){onEvent(marker.id);return;}
  const slot=track.slots[marker.start];
  if(slot)selectSlot(marker.start);
  if(marker.kind==='person')onMemory(marker.id);else if(marker.kind==='foreshadow')onShadow(marker.id);
 };
 const jump=()=>{if(currentIndex<0)return;scroll.current?.scrollTo({left:Math.max(0,currentIndex*unit-unit),behavior:'smooth'});};
 return <section className="timeline-h" aria-label="横向时间线">
  <div className="timeline-h-tools">
   <div className="narrative-switch" role="group" aria-label="时间线顺序"><button aria-pressed={activeMode==='narration'} onClick={()=>setActiveMode?.('narration')}>故事叙述</button><button aria-pressed={activeMode==='story'} onClick={()=>setActiveMode?.('story')}>时间叙述</button></div>
   <button className="track-locate" aria-label="定位当前" title="定位当前" onClick={jump}><Icon name="locate"/></button>
   {extraTools}
   <label className="timeline-zoom">缩放<input type="range" min="35" max="160" step="5" aria-label="时间线缩放" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><span>{zoom}%</span></label>
   <small className="timeline-h-count">{track.slots.length} 个刻度 · {track.lanes} 条轨道 · {track.markers.length} 个条目</small>
  </div>
  <div className="timeline-h-frame">
   <div className="timeline-h-labels" style={{'--lane-height':`${LANE_HEIGHT}px`}}>
    <div className="timeline-h-corner"><Icon name="route"/><span>{activeMode==='story'?'故事时间':'卷章刻度'}</span></div>
    {Array.from({length:Math.max(1,track.lanes)},(_,i)=>{const lane=laneOf(i);return <div className={`timeline-h-label kind-${lane.kind}`} key={i} title={lane.name}><small>{lane.label}</small><span>{lane.name}</span></div>;})}
   </div>
   <div className="timeline-h-scroll" ref={scroll} tabIndex={0} aria-label="横向时间线，可左右滚动与缩放">
    <div className="timeline-h-canvas" style={{width}}>
     <div className="timeline-h-ruler" style={{'--slot-width':`${unit}px`}}>
      {track.slots.map((slot,i)=><button type="button" key={slot.key} className={`timeline-h-tick ${currentIndex===i?'is-current':''}`} style={{left:i*unit,width:unit}} onClick={()=>selectSlot(i)} title={displayNumberedTitle(slot.title,preferences.numbering)}><small>{displayNumberedTitle(slot.subtitle,preferences.numbering)}</small><strong>{displayNumberedTitle(slot.title,preferences.numbering)}</strong></button>)}
      {!track.slots.length&&<p className="timeline-h-empty">添加章节或事件后，这里会按刻度排开。</p>}
     </div>
     <div className="timeline-h-body" style={{height:totalHeight}}>
      {Array.from({length:track.slots.length},(_,i)=><div key={i} className="timeline-h-grid" style={{left:i*unit,width:unit}}/>)}
      {Array.from({length:Math.max(1,track.lanes)},(_,i)=><div key={i} className="timeline-h-rowline" style={{top:i*LANE_HEIGHT,height:LANE_HEIGHT}}/>)}
      {track.markers.map(marker=><button type="button" key={marker.key} className={`timeline-h-bar kind-${marker.kind} ${marker.planned?'is-planned':''} ${marker.review?'is-review':''} ${marker.end>marker.start?'is-span':''}`}
        style={{left:marker.start*unit+2,top:marker.lane*LANE_HEIGHT+8,width:Math.max(unit-6,(marker.end-marker.start+1)*unit-6)}}
        aria-label={`${kinds[marker.kind]} ${marker.title}${marker.end>marker.start?`，跨 ${marker.end-marker.start+1} 个刻度`:''}`}
        onClick={()=>activate(marker)}>
        <span className="timeline-h-bar-title">{marker.title}</span>
        <small>{marker.kind==='event'?(marker.event?.storyTime||marker.event?.storyDate||(marker.planned?'计划情境':'')):marker.kind==='person'?refs[marker.referenceKind]:marker.linkedOnly?'事件关联':shadows[marker.status]}</small>
      </button>)}
     </div>
    </div>
   </div>
  </div>
  <p className="timeline-h-help">{activeMode==='narration'?'横向是章节刻度；跨章事件显示为横贯刻度的长条，中间未引用的章节不会被自动算作剧情发生地。':'横向是故事时间顺序；同一刻度的多个事件上下排列。'} 点击刻度切换节点，点击事件条编辑；轨道名固定在最左侧。</p>
  {track.waiting.length>0&&<details className="story-waiting"><summary>待安排伏笔 · {track.waiting.length}</summary>{track.waiting.map(f=><button key={f.id} className="story-foreshadow" onClick={()=>onShadow(f.id)}><strong>{f.title}</strong><small>{shadows[f.status]} · 未指定时间位置</small></button>)}</details>}
 </section>;
}
