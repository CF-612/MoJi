import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtime from '../../../src/domain/story-workspace.mjs';
import * as client from '../vendor/cuigengji/src/domain/story-workspace.mjs';

const WIDTH=248,HEIGHT=208,GAP=64;
function fixture(domain,volumeCount,chapterCount){
 const sources={volumes:Array.from({length:volumeCount},(_,i)=>({id:`v${i}`,title:'很长的卷名'.repeat(30),order:i})),chapters:Array.from({length:chapterCount},(_,i)=>({id:`c${i}`,title:'很长的章节标题'.repeat(30),volumeId:`v${i%volumeCount}`,order:i}))};
 const state=domain.emptyWorkspace();domain.reconcile(state,sources);return {state,sources};
}
function verifyForest(domain,state,sources){
 const before=structuredClone(state),points=domain.treeLayout(state,sources),refs=Object.keys(domain.objectIndex(state,sources));
 assert.equal(Object.keys(points).length,refs.length);assert.deepEqual(state,before);
 assert.deepEqual(domain.treeLayout(state,sources,[...refs].reverse()),points,'layout independent of source enumeration');
 for(const ref of refs){const p=points[ref];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=60&&p.y>=60);assert.ok(p.x+WIDTH<=60+refs.length*(WIDTH+GAP));assert.ok(p.y+HEIGHT<=60+refs.length*308);
  const parent=state.placements[ref].parent;if(points[parent])assert.equal(p.y,points[parent].y+308);
 }
 for(let i=0;i<refs.length;i++)for(let j=i+1;j<refs.length;j++){const a=points[refs[i]],b=points[refs[j]];assert.ok(a.x+WIDTH<=b.x||b.x+WIDTH<=a.x||a.y+HEIGHT<=b.y||b.y+HEIGHT<=a.y,`${refs[i]} overlaps ${refs[j]}`);}
 // Every complete descendant cluster has its own horizontal span; the parent
 // sits at its midpoint, rather than being stacked over the first child.
 const span=ref=>{const children=refs.filter(child=>state.placements[child].parent===ref);if(!children.length)return [points[ref].x,points[ref].x+WIDTH];const spans=children.map(span).sort((a,b)=>a[0]-b[0]);for(let i=1;i<spans.length;i++)assert.ok(spans[i][0]-spans[i-1][1]>=GAP);const bounds=[spans[0][0],spans.at(-1)[1]];assert.equal(points[ref].x+WIDTH/2,(bounds[0]+bounds[1])/2);return bounds;};
 for(const ref of refs.filter(ref=>!points[state.placements[ref].parent]))span(ref);
 return points;
}
for(const [name,domain] of [['runtime',runtime],['client',client]]){
 test(`${name}: one volume and 50 chapters fan out with long titles, no fake levels`,()=>{
  const {state,sources}=fixture(domain,1,50),points=verifyForest(domain,state,sources);
  assert.equal(new Set(sources.chapters.map(c=>points[`chapter:${c.id}`].x)).size,50);
  assert.equal(new Set(sources.chapters.map(c=>points[`chapter:${c.id}`].y)).size,1);
  assert.equal(points['volume:v0'].x,(points['chapter:c0'].x+points['chapter:c49'].x)/2);
 });
 test(`${name}: 200-node four-volume uneven subtrees ignore cross-period plot links`,()=>{
  const {state,sources}=fixture(domain,4,160);
  for(let i=0;i<36;i++){const id=`plot${i}`,ref=`card:${id}`;state.cards[id]={id,title:'跨时期剧情'.repeat(30),purpose:'情节',revision:1,scope:['c0','c159']};state.placements[ref]={parent:i<12?`volume:v${i%4}`:`card:plot${Math.floor((i-12)/2)}`,order:i,manual:true};}
  // Uneven real containment, not artificial volume/chapter fabrication.
  for(let i=0;i<48;i++)state.placements[`chapter:c${i}`]={parent:`card:plot${i%12}`,order:i,manual:true};
  assert.deepEqual(domain.hierarchyIssues(state,sources),[]);
  const points=verifyForest(domain,state,sources);assert.equal(Object.keys(points).length,200);
  state.precedence=[{id:'cross',from:'chapter:c159',to:'card:plot0'},{id:'reverse',from:'card:plot0',to:'chapter:c159'}];assert.deepEqual(domain.treeLayout(state,sources),points);
 });
 test(`${name}: manual drag/link leaves all other page positions unchanged; generation targets one page only`,()=>{
  let {state,sources}=fixture(domain,4,50);let serial=0;const apply=operation=>(state=domain.applyStory(state,sources,operation,()=>`new${++serial}`));
  apply({type:'instance.add',pageId:'main',ref:'chapter:c0',position:{x:-500,y:700}});
  apply({type:'page.create',name:'另一页'});const other=state.pages.at(-1).id;
  apply({type:'page.generate',pageId:other});const before=structuredClone(state.pages);
  apply({type:'instance.layout',pageId:'main',points:{'chapter:c0':{x:-900,y:1200}},revisions:{'chapter:c0':1}});
  assert.deepEqual(state.pages[1],before[1]);
  const dragged=structuredClone(state.pages);apply({type:'precedence',from:'chapter:c0',to:'chapter:c49'});assert.deepEqual(state.pages,dragged);
  apply({type:'page.generate',pageId:other});assert.deepEqual(state.pages[0],dragged[0]);assert.equal(state.pages.length,2);
  assert.deepEqual(state.pages[0].instances['chapter:c0'],{x:-900,y:1200,revision:2});
 });
}
