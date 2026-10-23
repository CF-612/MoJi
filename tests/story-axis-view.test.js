import test from 'node:test';import assert from 'node:assert/strict';
import {axisViewportOptions,centerStoryLayout,withStoryAnchorTick,axisProjectionOptions,axisTicks,storyLaneLayout,storyDrop,storyDragDrop,storyDisplayCards,storyDefaultCursor,storyGapLabel,storyTickLabel,storyZoomLevels,storyCardRowHeight} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
import {createStoryProjection,dateToCoordinate} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
const calendar={kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor=dateToCoordinate({year:2024,month:1,day:1},calendar),axis={calendar,anchor:{coordinate:anchor},primaryTick:{unit:'year',step:1},tracks:[{id:'a',side:'above'},{id:'b',side:'below'}]};
test('zoom refines day spacing without changing dates or primary scale',()=>{const source=JSON.stringify(axis),a=axisProjectionOptions(axis,0),b=axisProjectionOptions(axis,9);assert.ok(b.pixelsPerDay>a.pixelsPerDay);assert.equal(JSON.stringify(axis),source);const p=createStoryProjection([anchor,anchor+1],b);assert.ok(p.timeToX(anchor+1)-p.timeToX(anchor)>=58);});
test('calendar ticks use actual year boundaries and bounded generation over huge gaps',()=>{const p=createStoryProjection([anchor,-2190000000000],axisProjectionOptions(axis,0));const ticks=axisTicks(axis,p,0);assert.ok(ticks.some(t=>t.coordinate===anchor));assert.ok(ticks.length<300);assert.ok(p.width<10000);});
test('placement handler resolves above and below tracks, cancels outside',()=>{const p=createStoryProjection([anchor]),layout=storyLaneLayout(axis,[]),rect={left:0,right:1000,top:0};for(const l of layout.lanes){const result=storyDrop(p,rect,0,p.timeToX(anchor)+64,l.y+40,layout);assert.equal(result.side,l.side);assert.equal(result.trackId,undefined);assert.equal(result.start,anchor);assert.equal(result.row,0);}assert.equal(storyDrop(p,rect,0,-1,50,layout),null);assert.equal(storyDrop(p,rect,0,30,layout.line,layout),null);});
test('overlapping nearby cards pack separately without mutating shared data',()=>{const cards=[0,1,2].map(i=>({id:String(i),time:{story:{start:anchor+i,trackId:'a',row:0}}})),before=JSON.stringify(cards),p=createStoryProjection(cards.map(c=>c.time.story.start)),display=storyDisplayCards(cards,p);assert.deepEqual(display.map(c=>c.displayRow),[0,1,2]);assert.equal(JSON.stringify(cards),before);const layout=storyLaneLayout(axis,display);assert.ok(layout.lanes.find(l=>l.side==='above').height>=3*storyCardRowHeight);});

test('valid coordinate endpoints never crash visual tick generation',()=>{for(const n of [-1e14,1e14])for(const zoom of [0,4,9])assert.doesNotThrow(()=>axisTicks(axis,createStoryProjection([n]),zoom));});

test('first setup marker defaults to configured anchor, not absolute zero',()=>{assert.equal(storyDefaultCursor(axis,null),anchor);assert.equal(storyDefaultCursor(axis,undefined),anchor);assert.equal(storyDefaultCursor(axis,anchor+1),anchor+1);assert.equal(storyDefaultCursor({...axis,anchor:{coordinate:-999}},null),-999);});

test('huge epochs have compact overview labels and exact fine zoom labels',()=>{const n=dateToCoordinate({year:-5999999999,month:1,day:1},calendar);assert.match(storyTickLabel(axis,n,0),/60亿年/);assert.match(storyTickLabel(axis,n,9),/6000000000/);assert.match(storyGapLabel(axis,n,anchor),/60亿年空白/);});

test('adaptive daily preset resolves adjacent days for 500-year and largest supported ticks',()=>{
 for(const configured of [{...axis,primaryTick:{unit:'year',step:500}},{...axis,primaryTick:{unit:'year',step:1e11}},{...axis,calendar:{kind:'custom',name:'长历',era:'长历',visibility:{year:true,month:true,day:true},monthLengths:Array(100).fill(1e6)},primaryTick:{unit:'year',step:1e11}}]){
  const before=JSON.stringify(configured),levels=storyZoomLevels(configured),options=axisProjectionOptions(configured,levels.daily),coordinates=[anchor,anchor+1],p=createStoryProjection(coordinates,options);
  assert.ok(levels.daily<=64);assert.equal(options.windowDays,1);assert.ok(p.timeToX(anchor+1)-p.timeToX(anchor)>=60);assert.ok(p.width<2000);assert.ok(axisTicks(configured,p,levels.daily).length<=10);assert.deepEqual(coordinates,[anchor,anchor+1]);assert.equal(JSON.stringify(configured),before);
 }
 assert.ok(storyZoomLevels({...axis,primaryTick:{unit:'year',step:500}}).daily>12);
});
test('coarse hundred-year scale does not claim daily granularity from fixed zoom number',()=>{const wide={...axis,primaryTick:{unit:'year',step:500}},p=createStoryProjection([anchor],axisProjectionOptions(wide,8)),ticks=axisTicks(wide,p,8);assert.ok(axisProjectionOptions(wide,8).windowDays>7);assert.ok(ticks.length<50);});

test('empty space selects only geometric side, never changes track membership',()=>{const p=createStoryProjection([anchor]),layout=storyLaneLayout(axis,[]),rect={left:0,right:1000,top:0};assert.equal(storyDrop(p,rect,0,100,layout.height-1,layout).side,'below');assert.equal(storyDrop(p,rect,0,100,0,layout).side,'above');assert.equal(storyDrop(p,rect,0,100,layout.line,layout),null);assert.deepEqual(axis.tracks.map(t=>t.id),['a','b']);});

test('vertical story drag preserves exact date regardless of card grab offset and projection rounding',()=>{for(const zoom of [-4,0,8]){const p=createStoryProjection([anchor,anchor+3],axisProjectionOptions(axis,zoom)),layout=storyLaneLayout(axis,[]),rect={left:20,right:1000,top:30};for(const x of [150,220,370]){const g={x,scroll:17,card:{time:{story:{start:anchor+1,end:anchor+3}}}},result=storyDragDrop(p,rect,17,x,30+layout.line+80,layout,g);assert.equal(result.start,anchor+1);assert.equal(result.side,'below');}}});
test('horizontal story drag applies pointer and scroll delta from original date',()=>{const p=createStoryProjection([anchor],{pixelsPerDay:24,windowDays:30}),layout=storyLaneLayout(axis,[]),g={x:200,scroll:10,card:{time:{story:{start:anchor,end:anchor+2}}}},rect={left:0,right:1000,top:0};assert.equal(storyDragDrop(p,rect,10,224,40,layout,g).start,anchor+1);assert.equal(storyDragDrop(p,rect,34,200,40,layout,g).start,anchor+1);assert.equal(storyDragDrop(p,rect,10,176,40,layout,g).start,anchor-1);assert.equal(storyDragDrop(p,rect,10,-1,40,layout,g),null);});

test('story track order changes real group coordinates on both sides without mutating cards',()=>{const a={...axis,trackOrder:[{trackId:'b'},{trackId:'a'}]},cards=[['a','above'],['b','above'],['a','below'],['b','below']].map(([trackId,side],i)=>({id:String(i),time:{story:{start:anchor+i,end:anchor+i+1,trackId,side,row:0}}})),before=structuredClone(cards),p=createStoryProjection(cards.map(c=>c.time.story.start));const display=storyDisplayCards(cards,p,a),layout=storyLaneLayout(a,display);for(const side of ['above','below']){const groups=layout.lanes.filter(l=>l.side===side);assert.deepEqual(groups.map(l=>l.track.id),['b','a']);assert.ok(groups[0].y<groups[1].y);}assert.deepEqual(cards,before);});
test('story drag derives row from its own group even when pointer crosses another group',()=>{const cards=['a','b'].map((trackId,i)=>({id:trackId,time:{story:{start:anchor+i,end:anchor+i+1,trackId,side:'above',row:0}}})),p=createStoryProjection([anchor]),layout=storyLaneLayout(axis,storyDisplayCards(cards,p,axis)),g={x:250,scroll:0,card:cards[1]},own=layout.lanes.find(l=>l.track?.id==='b');const drop=storyDragDrop(p,{left:0,right:1000,top:0},0,250,own.y+30,layout,g);assert.equal(drop.row,0);assert.equal(drop.start,cards[1].time.story.start);assert.equal(drop.trackId,undefined);assert.equal(g.card.time.story.trackId,'b');});

test('new empty story axis centers origin with usable date ticks on both sides at mobile and desktop widths',()=>{
 const origin=dateToCoordinate({year:1933,month:9,day:5},calendar),a={...axis,anchor:{coordinate:origin},primaryTick:{unit:'year',step:6}};
 for(const width of [390,800])for(const height of [370,640]){
  const p=createStoryProjection([origin],axisViewportOptions(a,0,width)),x=p.timeToX(origin)+64,scroll=Math.max(0,x-width/2),layout=centerStoryLayout(storyLaneLayout(a,[]),height);
  assert.ok(Math.abs(x-scroll-width/2)<1e-8);assert.equal(layout.line,height/2);assert.equal(p.xToTime(scroll+width/2-64),origin);
  const ticks=withStoryAnchorTick(a,p,axisTicks(a,p,0)),screen=t=>t.x+64-scroll;
  assert.ok(ticks.some(t=>t.anchor&&t.coordinate===origin));assert.ok(ticks.some(t=>screen(t)>40&&screen(t)<width/2-80));assert.ok(ticks.some(t=>screen(t)<width-40&&screen(t)>width/2+80));
  const first={id:'first',time:{story:{start:origin,end:origin+1,trackId:'a',side:'above',row:0}}},next=centerStoryLayout(storyLaneLayout(a,[first]),height);assert.equal(next.line,layout.line);
  const result=storyDrop(p,{left:0,right:width,top:0},scroll,width/2,next.lanes[0].y+40,next);assert.equal(result.start,origin);assert.equal(result.side,'above');
 }
});
test('centering does not compress populated lanes or mutate world card placements',()=>{
 const cards=Array.from({length:12},(_,i)=>({id:String(i),displayRow:i,time:{story:{start:anchor,end:anchor+1,trackId:'a',row:i,side:'above'}}})),before=structuredClone(cards),base=storyLaneLayout(axis,cards),layout=centerStoryLayout(base,370);
 assert.equal(layout.line,base.line);assert.deepEqual(cards,before);assert.deepEqual(layout.lanes,base.lanes);
});
