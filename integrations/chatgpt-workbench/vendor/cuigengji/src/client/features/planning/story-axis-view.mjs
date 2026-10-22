import {coordinateToDate,dateToCoordinate,formatStoryDate} from '../../../domain/story-axis.mjs';
function primaryDays(axis){const months=axis.calendar.kind==='custom'?axis.calendar.monthLengths:[31,28,31,30,31,30,31,31,30,31,30,31],year=months.reduce((a,b)=>a+b,0),days={day:1,month:year/months.length,year}[axis.primaryTick.unit]*axis.primaryTick.step;return days;}
export function storyZoomLevels(axis){const daily=Math.max(1,Math.min(64,Math.ceil(Math.log2(primaryDays(axis)*1.5))));return {overview:0,detail:Math.max(0,daily-5),daily};}
export function axisProjectionOptions(axis,zoom=0){const days=primaryDays(axis);const windowDays=Math.max(1,Math.min(1000000,Math.ceil(days*1.5/2**zoom)));return {windowDays,pixelsPerDay:Math.min(240,180/windowDays),gapWidth:140};}
export function axisTicks(axis,projection,zoom){
 const {windowDays}=axisProjectionOptions(axis,zoom),unit=windowDays<=7?'day':windowDays<=366&&axis.primaryTick.unit==='year'?'month':axis.primaryTick.unit,step=zoom>0?1:axis.primaryTick.step,out=[];
 const coordinate=date=>{try{return dateToCoordinate(date,axis.calendar);}catch{return null;}};
 for(const s of projection.segments){
  if(s.folded)continue;
  let d=coordinateToDate(s.start,axis.calendar);
  if(unit==='year')d={year:Math.ceil(d.year/step)*step,month:1,day:1};else if(unit==='month')d={...d,day:1};
  let n=coordinate(d);if(n===null){out.push({coordinate:s.start,x:projection.timeToX(s.start)});continue;}
  let count=0;
  while(n!==null&&n<=s.end&&count++<150){
   const spacing=Math.max(70,Math.min(240,formatStoryDate(n,axis.calendar).length*7+14));
   if(n>=s.start&&(!out.length||projection.timeToX(n)-out.at(-1).x>=spacing))out.push({coordinate:n,x:projection.timeToX(n)});
   if(unit==='day'){n+=step;if(n>1e14)break;}
   else{d=coordinateToDate(n,axis.calendar);if(unit==='year')d={year:d.year+step,month:1,day:1};else{const months=axis.calendar.kind==='custom'?axis.calendar.monthLengths.length:12,m=d.month-1+step;d={year:d.year+Math.floor(m/months),month:m%months+1,day:1};}n=coordinate(d);}
  }
 }
 return out;
}
export function storyLaneLayout(axis,cards){const rows=track=>Math.max(1,...cards.filter(c=>c.time.story.trackId===track.id).map(c=>(c.displayRow??Math.min(30,c.time.story.row||0))+1));const above=axis.tracks.filter(t=>t.side==='above'),below=axis.tracks.filter(t=>t.side==='below');const top=above.reduce((n,t)=>n+rows(t)*148+26,0)+30,lanes=[];let y=top-34;for(const t of [...above].reverse()){const h=rows(t)*148+26;y-=h;lanes.push({...t,y,height:h});}y=top+70;for(const t of below){const h=rows(t)*148+26;lanes.push({...t,y,height:h});y+=h;}return {line:top,height:Math.max(420,y+34),lanes};}
export function storyDrop(projection,rect,scrollLeft,x,y,layout){const lane=layout.lanes.find(l=>y-rect.top>=l.y&&y-rect.top<l.y+l.height);if(!lane||x<rect.left||x>rect.right)return null;return {start:projection.xToTime(x-rect.left+scrollLeft-64),trackId:lane.id,row:Math.max(0,Math.floor((y-rect.top-lane.y-26)/148))};}
// Presentation-only collision packing: no stored row/date is rewritten by zoom.
export function storyDisplayCards(cards,projection){const occupied=new Map();return [...cards].sort((a,b)=>a.time.story.start-b.time.story.start||a.id.localeCompare(b.id)).map(card=>{const t=card.time.story,x=projection.timeToX(t.start),rows=occupied.get(t.trackId)||[];let row=Math.min(30,t.row||0);while(rows[row]!==undefined&&rows[row]>x-230)row++;rows[row]=x;occupied.set(t.trackId,rows);return {...card,displayRow:row};});}
export function storyDefaultCursor(axis,cursor){return Number.isSafeInteger(cursor)?cursor:axis?.anchor.coordinate??0;}
const compactCount=n=>{const unit=n>=1e8?1e8:n>=1e4?1e4:1,suffix=unit===1e8?'亿':unit===1e4?'万':'';return Number((n/unit).toFixed(n/unit<10?1:0))+suffix;};
export function storyGapLabel(axis,start,end){const year=axis.calendar.kind==='custom'?axis.calendar.monthLengths.reduce((a,b)=>a+b,0):365.2425,months=axis.calendar.kind==='custom'?axis.calendar.monthLengths.length:12,days=end-start;let unit=axis.primaryTick.unit;if(unit==='year'&&days<year)unit=days>=year/months?'month':'day';if(unit==='month'&&days<year/months)unit='day';const n=unit==='year'?days/year:unit==='month'?days/year*months:days;return `约${compactCount(n)}${unit==='year'?'年':unit==='month'?'个月':'天'}空白`;}
export function storyTickLabel(axis,coordinate,zoom){const d=coordinateToDate(coordinate,axis.calendar);if(axisProjectionOptions(axis,zoom).windowDays<=366||Math.abs(d.year)<1e6||!axis.calendar.visibility.year)return formatStoryDate(coordinate,axis.calendar);const gregorian=axis.calendar.kind==='gregorian',year=gregorian&&d.year<=0?1-d.year:Math.abs(d.year),era=gregorian&&d.year<=0?'公元前':axis.calendar.era||'';return `${era}${!gregorian&&d.year<0?'−':''}${compactCount(year)}年`;}
