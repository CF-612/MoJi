import {resolveStoryTrack} from './story-tracks.mjs';
// Exact day coordinates, independent of narrative order and display tick density.
export const STORY_DAY_LIMIT=100000000000000;
const fail=message=>{throw Object.assign(new Error(message),{code:'STORY_INVALID'});};
export const isStoryCoordinate=n=>Number.isSafeInteger(n)&&Math.abs(n)<=STORY_DAY_LIMIT;
const safeId=id=>typeof id==='string'&&id.length>0&&id.length<=200&&!['__proto__','constructor','prototype'].includes(id);
const leap=y=>y%4===0&&(y%100!==0||y%400===0);
function months(calendar,year){return calendar.kind==='gregorian'?[31,leap(year)?29:28,31,30,31,30,31,31,30,31,30,31]:calendar.monthLengths;}
export function validateStoryCalendar(c){
 if(!c||!['gregorian','custom'].includes(c.kind)||typeof c.name!=='string'||!c.name.trim()||typeof c.era!=='string')fail('请设置历法名称与纪年词。');
 if(!c.visibility||!['year','month','day'].every(k=>typeof c.visibility[k]==='boolean')||!Object.values(c.visibility).some(Boolean))fail('请选择日期显示单位。');
 if(c.kind==='custom'&&(!Array.isArray(c.monthLengths)||!c.monthLengths.length||c.monthLengths.length>100||c.monthLengths.some(n=>!Number.isSafeInteger(n)||n<1||n>1000000)))fail('自定义历法需要明确的固定月份天数。');
 return c;
}
function yearStart(y,c){return c.kind==='gregorian'?365*y+Math.floor((y+3)/4)-Math.floor((y+99)/100)+Math.floor((y+399)/400):y*c.monthLengths.reduce((a,b)=>a+b,0);}
export function dateToCoordinate(date,calendar){
 validateStoryCalendar(calendar);const {year,month,day}=date||{};
 if(!Number.isSafeInteger(year)||Math.abs(year)>STORY_DAY_LIMIT||!Number.isInteger(month)||!Number.isInteger(day))fail('请输入完整的整数年、月、日。');
 const lengths=months(calendar,year);if(month<1||month>lengths.length||day<1||day>lengths[month-1])fail('日期不符合所选历法。');
 const n=yearStart(year,calendar)+lengths.slice(0,month-1).reduce((a,b)=>a+b,0)+day-1;if(!isStoryCoordinate(n))fail('日期超过安全坐标范围。');return n;
}
export function coordinateToDate(n,calendar){
 validateStoryCalendar(calendar);if(!isStoryCoordinate(n))fail('故事时间需要安全范围内的整数天。');
 // Binary search avoids Date/millisecond overflow, including negative eras.
 let lo=-STORY_DAY_LIMIT,hi=STORY_DAY_LIMIT;
 while(lo<hi){const mid=lo+Math.ceil((hi-lo)/2);if(yearStart(mid,calendar)<=n)lo=mid;else hi=mid-1;}
 let rest=n-yearStart(lo,calendar),month=1;const lengths=months(calendar,lo);while(rest>=lengths[month-1])rest-=lengths[month++-1];return {year:lo,month,day:rest+1};
}
export function formatStoryDate(n,calendar){const d=coordinateToDate(n,calendar),v=calendar.visibility;return `${calendar.kind==='gregorian'?(d.year<=0?'公元前':'公元'):(calendar.era||'')}${v.year?(calendar.kind==='gregorian'&&d.year<=0?1-d.year:d.year)+'年':''}${v.month?d.month+'月':''}${v.day?d.day+'日':''}`;}
function validateTrack(t){if(!safeId(t?.id)||!String(t.name||'').trim()||!/^#[0-9a-f]{6}$/i.test(t.color)||!['above','below'].includes(t.side))fail('故事轨道名称、颜色或上下位置无效。');}
function validateMarker(m){if(!safeId(m?.id)||!String(m.label||'').trim()||!isStoryCoordinate(m.coordinate))fail('标记需要名称与明确日期坐标。');}
export function validateStoryAxis(a){
 if(!a||a.schemaVersion!==1||a.coordinateUnit!=='day'||a.legacyMode!=='unmapped')fail('请先设置独立故事时间坐标系。');
 validateStoryCalendar(a.calendar);
 if(!a.anchor||!String(a.anchor.label||'').trim()||dateToCoordinate(a.anchor.date,a.calendar)!==a.anchor.coordinate)fail('请明确第一章读者所在的日期锚点。');
 if(a.anchor.cardId!==undefined&&!safeId(a.anchor.cardId))fail('故事起点关联的剧情卡标识无效。');
 if(!['year','month','day'].includes(a.primaryTick?.unit)||!Number.isSafeInteger(a.primaryTick.step)||a.primaryTick.step<1||a.primaryTick.step>100000000000)fail('请设置有效的主刻度单位与尺度。');
 if(!Array.isArray(a.tracks)||!a.tracks.length||!Array.isArray(a.markers))fail('故事轨道与标记列表无效。');
 a.tracks.forEach(validateTrack);a.markers.forEach(validateMarker);
 for(const list of [a.tracks,a.markers])if(new Set(list.map(x=>x.id)).size!==list.length)fail('故事轨道或标记标识重复。');return a;
}
export function validateStoryPlacement(t,axis,sharedTracks=[]){
 validateStoryAxis(axis);if(t.axisVersion!==1||!isStoryCoordinate(t.start)||!isStoryCoordinate(t.end)||t.end<=t.start||!resolveStoryTrack(t,axis,sharedTracks)||(t.trackSource!==undefined&&t.trackSource!=='shared')||(t.side!==undefined&&!['above','below'].includes(t.side))||!Number.isInteger(t.row??0)||(t.row??0)<0||(t.row??0)>10000)fail('故事时间位置、跨度或独立轨道无效。');
}
export function editStoryAxis(state,op,newId){
 if(op.type==='storyAxis.configure'){
  const next=structuredClone(op.value);validateStoryAxis(next);
  if(next.anchor.cardId&&!state.cards[next.anchor.cardId])fail('起点剧情卡已不存在，请重新选择或改为自定义起点。');
  if(state.storyAxis){const signature=a=>JSON.stringify([a.schemaVersion,a.calendar.kind,a.calendar.kind==='custom'?a.calendar.monthLengths:null,a.coordinateUnit,a.anchor.coordinate]);if(signature(next)!==signature(state.storyAxis)&&(state.storyAxis.markers.length>0||Object.values(state.cards).some(c=>c.time?.story?.axisVersion===1)))fail('已有故事日期，不能直接更换时间域；请先明确迁移日期。');}
  for(const c of Object.values(state.cards))if(c.time?.story?.axisVersion===1)validateStoryPlacement(c.time.story,next,state.tracks);
  state.storyAxis=next;return;
 }
 validateStoryAxis(state.storyAxis);const axis=state.storyAxis;
 if(op.type==='storyAxis.place'||op.type==='storyAxis.unplace'){
  const card=state.cards[op.id];if(!card)fail('剧情卡已不存在。');if(op.expectedRevision!==undefined&&card.revision!==op.expectedRevision)throw Object.assign(new Error('剧情卡已变化，请刷新后重试。'),{code:'CONFLICT'});
  if(op.type==='storyAxis.unplace'){card.time={...card.time,story:null};card.revision++;return;}
  const time={axisVersion:1,start:op.start,end:op.end,trackId:op.trackId,row:op.row??0,...(op.trackSource!==undefined?{trackSource:op.trackSource}:{}),...(op.side!==undefined?{side:op.side}:{})};validateStoryPlacement(time,axis,state.tracks);
  // Preserve legacy coordinates as explicit provenance, never reinterpret them.
  if(card.time?.story&&card.time.story.axisVersion!==1&&!card.legacyStoryTime)card.legacyStoryTime=structuredClone(card.time.story);
  card.time={...card.time,story:time};card.revision++;return;
 }
 const [,kind,action]=op.type.split('.');if(!['marker','track'].includes(kind)||!['create','update','delete'].includes(action))fail('不支持的故事时间操作。');
 const list=kind==='marker'?axis.markers:axis.tracks,index=list.findIndex(x=>x.id===op.id);
 if(action!=='create'&&index<0)fail('故事时间对象已不存在。');
 if(action==='delete'){
  if(kind==='track'&&(list.length===1||Object.values(state.cards).some(c=>c.time?.story?.axisVersion===1&&c.time.story.trackSource!=='shared'&&c.time.story.trackId===op.id)))fail('请先移走轨道上的卡片，并保留至少一条故事轨道。');list.splice(index,1);if(kind==='track')for(const field of ['trackOrder','trackSides'])if(axis[field])axis[field]=axis[field].filter(t=>t.trackSource==='shared'||t.trackId!==op.id);return;
 }
 const value=kind==='marker'?{id:action==='create'?newId():op.id,label:op.label,coordinate:op.coordinate}:{id:action==='create'?newId():op.id,name:op.name,color:op.color,side:op.side};
 (kind==='marker'?validateMarker:validateTrack)(value);if(action==='create')list.push(value);else list[index]={...list[index],...value};
}
// A finite number of occupied windows, not one element per elapsed year.
export function createStoryProjection(coordinates,{pixelsPerDay=24,windowDays=3,gapWidth=56}={}){
 if(!Number.isFinite(pixelsPerDay)||pixelsPerDay<=0||pixelsPerDay>10000||!Number.isSafeInteger(windowDays)||windowDays<1||windowDays>1000000||!Number.isFinite(gapWidth)||gapWidth<1||gapWidth>10000)fail('故事轴缩放参数无效。');
 const values=[...new Set(coordinates.filter(isStoryCoordinate))].sort((a,b)=>a-b);if(!values.length)values.push(0);
 const windows=[];for(const n of values){const start=Math.max(-STORY_DAY_LIMIT,n-windowDays),end=Math.min(STORY_DAY_LIMIT,n+windowDays),last=windows.at(-1);if(last&&start<=last.end)last.end=Math.max(last.end,end);else windows.push({start,end});}
 const segments=[];let x=0;const add=(start,end,folded)=>{const width=folded?gapWidth:Math.min(2400,(end-start)*pixelsPerDay);segments.push({start,end,x,width,folded});x+=width;};
 for(const w of windows){const last=segments.at(-1);if(last&&last.end<w.start)add(last.end,w.start,true);add(w.start,w.end,false);}
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const timeToX=n=>{const s=segments.find(s=>n>=s.start&&n<=s.end)||(n<segments[0].start?segments[0]:segments.at(-1));if(s.folded)return s.x+(n-s.start<=s.end-n?0:s.width);return s.x+clamp(n-s.start,0,s.end-s.start)*s.width/(s.end-s.start);};
 const xToTime=px=>{const s=segments.find(s=>px>=s.x&&px<=s.x+s.width)||(px<0?segments[0]:segments.at(-1));if(s.folded)return px-s.x<=s.width/2?s.start:s.end;return clamp(s.start+Math.round((px-s.x)*(s.end-s.start)/s.width),s.start,s.end);};
 return {segments,width:x,timeToX,xToTime};
}
