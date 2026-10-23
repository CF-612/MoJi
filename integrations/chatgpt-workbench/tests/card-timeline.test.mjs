import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_LAYOUT,timelineItems,timelineSlots,itemBounds,anchorAt,packTimeline,visibleTimelineItems} from '../vendor/cuigengji/src/domain/card-timeline.mjs';
function board(){return {nodes:[{id:'p1',name:'甲',type:'character_card',avatarImage:'avatar'},{id:'p2',name:'乙',type:'character_card'}],stats:{volumes:[]},chapters:[{id:'c1',title:'第一章',references:[]},{id:'c2',title:'第二章',references:[]},{id:'c3',title:'第三章',references:[]}],events:[{id:'e1',title:'事件',order:1,content:'完整事件说明',chapterRefs:[{chapterId:'c1',revision:2,evidence:'原文甲'},{chapterId:'c3',revision:3,evidence:'原文乙'}],memoryRefs:['p1'],planningRefs:['p1'],foreshadowRefs:['f']}],planning:[{id:'p1',title:'跨章卡',summary:'重要摘要',status:'selected',chapterRefs:[{chapterId:'c1'},{chapterId:'c3'}],cast:[{nodeId:'p1',kind:'appearance'},{nodeId:'p2',kind:'mention'}],foreshadowRefs:['f']},{id:'p2',title:'待安排卡',summary:'也要保留',status:'idea',chapterRefs:[],cast:[]}],foreshadows:[{id:'f',title:'线索',content:'说明',targetChapterId:'c2',status:'planned',evidence:[],memoryRefs:[]}]};}
test('已安排和待安排共同覆盖全部卡片，保留摘要、人物语义和伏笔',()=>{
 const b=board(),items=timelineItems(b),slots=timelineSlots(b,'narration'),packed=packTimeline(items,b,'narration',DEFAULT_LAYOUT,slots,260);
 assert.equal(packed.waiting.find(i=>i.id==='p2').summary,'也要保留');
 const plan=packed.lanes.flatMap(l=>l.items).find(i=>i.kind==='planning');assert.equal(plan.summary,'重要摘要');assert.deepEqual(plan.related,['p1']);assert.deepEqual(plan.cast,b.planning[0].cast);assert.deepEqual(plan.foreshadows,['f']);
 assert.equal(new Set([...packed.waiting,...packed.lanes.flatMap(l=>l.items)].map(i=>i.key)).size,items.length);
});
test('同轨八张同时发生的卡按阅读宽度错开，轨道自动增高且结果稳定',()=>{
 const b=board();b.planning=Array.from({length:8},(_,i)=>({...b.planning[0],id:'p'+i,chapterRefs:[{chapterId:'c1'}]}));b.events=[];b.foreshadows=[];
 const items=timelineItems(b),slots=timelineSlots(b,'narration'),normal=packTimeline(items,b,'narration',DEFAULT_LAYOUT,slots,260);
 assert.equal(new Set(normal.lanes[0].items.map(i=>i.row)).size,8);assert.ok(normal.lanes[0].height>1100);
 assert.deepEqual(normal,packTimeline(items,b,'narration',DEFAULT_LAYOUT,slots,260));
});
test('安排跨度和跨轨只读投影，不添加中间章节或清空原文依据',()=>{
 const b=board(),before=JSON.stringify(b),items=timelineItems(b),slots=timelineSlots(b,'narration');
 const state={...structuredClone(DEFAULT_LAYOUT),tracks:[...DEFAULT_LAYOUT.tracks,{id:'side',name:'支线',color:'#718d6a'}],placements:{'event:e1':{trackId:'side',color:'#b17f59',narration:{start:anchorAt(.5,slots),end:anchorAt(2.8,slots)}}}};
 const packed=packTimeline(items,b,'narration',state,slots,260);assert.equal(packed.lanes[1].items[0].id,'e1');assert.equal(JSON.stringify(b),before);assert.equal(b.events[0].chapterRefs.length,2);assert.equal(b.events[0].chapterRefs[0].evidence,'原文甲');
});
test('两套时间位置独立，稳定章节锚点在章节重排后仍能找到',()=>{
 const b=board(),item=timelineItems(b)[0],slots=timelineSlots(b,'narration');
 const state={...DEFAULT_LAYOUT,placements:{[item.key]:{narration:{start:anchorAt(1.2,slots),end:anchorAt(1.2,slots)}}}};
 assert.equal(itemBounds(item,b,'narration',state,slots).start,1.2);
 assert.equal(itemBounds(item,b,'story',state,timelineSlots(b,'story')).start,.12);
 const reordered=[slots[1],slots[0],...slots.slice(2)];assert.ok(Math.abs(itemBounds(item,b,'narration',state,reordered).start-.2)<1e-8);
});
test('跨三十章只增长横向跨度，不增长卡片高度',()=>{
 const b=board();b.chapters=Array.from({length:30},(_,i)=>({id:'c'+i,title:'章'+i,references:[]}));b.events=[];b.foreshadows=[];b.planning=[{...b.planning[0],chapterRefs:[{chapterId:'c0'},{chapterId:'c29'}]}];
 const packed=packTimeline(timelineItems(b),b,'narration',DEFAULT_LAYOUT,timelineSlots(b,'narration'),260);
 assert.ok(packed.lanes[0].items[0].width>7500);assert.equal(packed.cardHeight,140);assert.equal(packed.lanes[0].height,192);
});
test('人物过滤同时覆盖事件和规划，提及不计作出场',()=>{
 const items=timelineItems(board());assert.deepEqual(visibleTimelineItems(items,{person:'p2'}),[]);assert.equal(visibleTimelineItems(items,{person:'p1'}).length,2);
 assert.ok(visibleTimelineItems(items,{kinds:['event']}).every(i=>['event','planning'].includes(i.kind)));
});
