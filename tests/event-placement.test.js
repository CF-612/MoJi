import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterPlacement,placementIntent,timelineHit} from '../src/domain/event-placement.js';
const chapters=Array.from({length:7},(_,i)=>({id:'c'+i,revision:i+1}));
const event={chapterRefs:[{chapterId:'c1',revision:2,evidence:'第一处'},{chapterId:'c3',revision:4,evidence:'第二处'},{chapterId:'deleted',revision:1,evidence:'旧记录'}]};
test('整体移动保留稀疏跨度，新位置不搬运原章证据，已删除章引用保持原样',()=>{
 const before=structuredClone(event),intent=placementIntent(chapters,event,'move',2),plan=chapterPlacement(chapters,event,intent);assert.deepEqual(plan.added,['c2','c4']);assert.deepEqual(plan.removed,['c1','c3']);assert.deepEqual(plan.chapterRefs.filter(r=>r.chapterId!=='deleted').map(r=>[r.chapterId,r.evidence]),[['c2',''],['c4','']]);assert.deepEqual(plan.chapterRefs.at(-1),event.chapterRefs.at(-1));assert.deepEqual(event,before);assert.equal(plan.chapterRefs.some(r=>r.chapterId==='c3'),false);
});
test('移动重叠原范围时，证据按章节 ID 保留，不按数组位置搬运',()=>{
 const e={chapterRefs:[{chapterId:'c1',revision:1,evidence:'一'},{chapterId:'c2',revision:2,evidence:'二'}]},p=chapterPlacement(chapters,e,{operation:'move',startChapterId:'c2',endChapterId:'c3'});assert.deepEqual(p.chapterRefs,[{chapterId:'c2',revision:2,evidence:'二'},{chapterId:'c3',revision:4,evidence:''}]);
});
test('调整一端只扩展新增范围，保留原间隔；缩短与明确连续范围语义不同',()=>{
 const start=chapterPlacement(chapters,event,{operation:'resize-start',startChapterId:'c0',endChapterId:'c3'});assert.deepEqual(start.added,['c0']);assert.equal(start.chapterRefs.some(r=>r.chapterId==='c2'),false);
 const end=chapterPlacement(chapters,event,{operation:'resize-end',startChapterId:'c1',endChapterId:'c5'});assert.deepEqual(end.added,['c4','c5']);assert.equal(end.chapterRefs.some(r=>r.chapterId==='c2'),false);
 const trim=chapterPlacement(chapters,event,{operation:'resize-start',startChapterId:'c2',endChapterId:'c3'});assert.deepEqual(trim.removed,['c1']);assert.equal(trim.chapterRefs.find(r=>r.chapterId==='c3').evidence,'第二处');assert.equal(trim.chapterRefs.find(r=>r.chapterId==='c2')?.evidence,'');
 const shorter=chapterPlacement(chapters,event,{operation:'resize-end',startChapterId:'c1',endChapterId:'c2'});assert.equal(shorter.chapterRefs.find(r=>r.chapterId==='c2')?.evidence,'');
 const range=chapterPlacement(chapters,event,{operation:'range',startChapterId:'c1',endChapterId:'c3'});assert.deepEqual(range.added,['c2']);
});
test('边界吸附、无位置事件安排、取消不变更；反向、错端与超容量拒绝',()=>{
 assert.deepEqual(placementIntent(chapters,event,'move',100),{operation:'move',startChapterId:'c4',endChapterId:'c6'});assert.equal(placementIntent([],event,'move',0),null);assert.equal(chapterPlacement(chapters,{chapterRefs:[]},{operation:'move',startChapterId:'c4',endChapterId:'c4'}).chapterRefs[0].evidence,'');assert.equal(chapterPlacement(chapters,event,{operation:'move',startChapterId:'c1',endChapterId:'c3'}).changed,false);
 for(const i of [{operation:'move',startChapterId:'c1',endChapterId:'c4'},{operation:'resize-start',startChapterId:'c1',endChapterId:'c4'},{operation:'range',startChapterId:'c3',endChapterId:'c1'}])assert.throws(()=>chapterPlacement(chapters,event,i),{code:'INVALID_WRITING'});
 const many=Array.from({length:201},(_,i)=>({id:String(i),revision:1}));assert.throws(()=>chapterPlacement(many,{chapterRefs:[]},{operation:'range',startChapterId:'0',endChapterId:'200'}),{code:'INVALID_WRITING'});
 const slots=[{top:44,height:100},{top:144,height:300},{top:444,height:100}];assert.equal(timelineHit(slots,170),1);assert.equal(timelineHit(slots,520),2);assert.equal(timelineHit(slots,-10),0);
});
