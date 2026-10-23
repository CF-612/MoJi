import test from 'node:test';
import assert from 'node:assert/strict';
import * as runtime from '../src/domain/story-workspace.mjs';
import * as client from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-workspace.mjs';
function fixture(domain,volumes,chapters){
 const sources={volumes:Array.from({length:volumes},(_,i)=>({id:`v${i}`,order:i})),chapters:Array.from({length:chapters},(_,i)=>({id:`c${i}`,order:i,volumeId:volumes?`v${Math.floor(i/(chapters/volumes))}`:null}))};
 const state=domain.emptyWorkspace();domain.reconcile(state,sources);return {state,sources};
}
function verify(domain,state,sources,options={}){
 const before=structuredClone(state),refs=Object.keys(domain.objectIndex(state,sources)),points=domain.compactOutlineLayout(state,sources,refs,options);
 assert.deepEqual(state,before);assert.deepEqual(domain.compactOutlineLayout(state,sources,[...refs].reverse(),options),points);
 assert.equal(Object.keys(points).length,refs.length);
 const rects=refs.map(ref=>({ref,...points[ref],width:options.sizes?.[ref]?.width||248,height:options.sizes?.[ref]?.height||208}));
 for(const a of rects){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));const parent=points[state.placements[a.ref].parent];if(parent)assert.ok(a.y>=parent.y+(options.sizes?.[state.placements[a.ref].parent]?.height||208)+100);}
 for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y,`${a.ref} overlaps ${b.ref}`);}
 const width=Math.max(...rects.map(p=>p.x+p.width))-Math.min(...rects.map(p=>p.x)),height=Math.max(...rects.map(p=>p.y+p.height))-Math.min(...rects.map(p=>p.y));
 return {points,ratio:Math.max(width/height,height/width)};
}
for(const [name,domain] of [['runtime',runtime],['client',client]]){
 for(const [volumes,chapters] of [[1,80],[4,160],[12,240],[0,80]])test(`${name}: compact ${volumes} volumes, ${chapters} chapters`,()=>{
  const {state,sources}=fixture(domain,volumes,chapters),{points,ratio}=verify(domain,state,sources);
  assert.ok(ratio<2.5,`aspect ratio ${ratio}`);
  assert.ok(new Set(sources.chapters.map(c=>points[`chapter:${c.id}`].y)).size>1);
  for(let i=1;i<volumes;i++){
   const previous=`volume:v${i-1}`,current=`volume:v${i}`;
   assert.equal(points[previous].x,points[current].x);
   assert.ok(points[current].y>Math.max(...[previous,...domain.descendants(state,previous)].map(ref=>points[ref].y+208)));
  }
  const generated=domain.generatedOutline(state,sources,state.pages[0]);assert.deepEqual(generated.points,points);
  state.precedence=[{from:'chapter:c0',to:'chapter:c79'},{from:'chapter:c79',to:'chapter:c0'}];assert.deepEqual(domain.compactOutlineLayout(state,sources),points);
 });
 test(`${name}: mixed deep hierarchy and oversized children retain full subtree bounds`,()=>{
  const {state,sources}=fixture(domain,3,60),sizes={};
  for(let i=0;i<18;i++){const ref=`card:p${i}`;state.cards[`p${i}`]={id:`p${i}`,title:'长标题'.repeat(40),purpose:'情节'};state.placements[ref]={parent:i%6?`card:p${i-1}`:`chapter:c${i}`,order:i,manual:true};sizes[ref]={width:i%2?520:800,height:i%3?420:660};}
  const result=verify(domain,state,sources,{sizes});assert.ok(result.ratio<4,`aspect ratio ${result.ratio}`);
 });
 test(`${name}: generation preserves manual positions and source data, never rearranges on ordinary edits`,()=>{
  const {state,sources}=fixture(domain,3,80);state.pages[0].instances['chapter:c0']={x:-700,y:500,revision:7};
  const before=structuredClone(state),next=domain.applyStory(state,sources,{type:'page.generate',pageId:'main'},()=> 'generated');
  assert.deepEqual(next.pages[0].instances['chapter:c0'],before.pages[0].instances['chapter:c0']);
  for(const key of ['cards','placements','precedence'])assert.deepEqual(next[key],before[key]);
  const moved=domain.applyStory(next,sources,{type:'precedence',from:'chapter:c0',to:'chapter:c1'},()=> 'link');assert.deepEqual(moved.pages,next.pages);
 });
 test(`${name}: empty and cyclic outlines are handled explicitly`,()=>{
  const {state,sources}=fixture(domain,0,0);assert.deepEqual(domain.compactOutlineLayout(state,sources),{});
  state.cards.a={id:'a'};state.cards.b={id:'b'};state.placements={'card:a':{parent:'card:b'},'card:b':{parent:'card:a'}};
  assert.throws(()=>domain.compactOutlineLayout(state,sources),/循环/);
 });
}
