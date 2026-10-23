import test from 'node:test';
import assert from 'node:assert/strict';
import * as legacy from '../src/client/shared/graph-geometry.ts';
import * as live from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph-geometry.ts';
import {emptyWorkspace,reconcile,treeLayout} from '../src/domain/story-workspace.mjs';
const sources={volumes:[{id:'volume',title:'合成卷',order:0}],chapters:Array.from({length:200},(_,i)=>({id:`chapter-${i}`,volumeId:'volume',title:`合成章节 ${i}`,order:i}))};
const state=emptyWorkspace();reconcile(state,sources);
const rects=Object.values(treeLayout(state,sources)).map(p=>({...p,width:248,height:208}));
for(const [name,g] of [['live',live],['legacy',legacy]]){
 test(`${name}: 200-chapter generated outline fits desktop and mobile, not clipped at 35% or 10%`,()=>{
  for(const [width,height] of [[1400,900],[390,600],[320,420]]){
   const fitted=g.fitCamera(rects,width,height);assert.ok(fitted.zoom<.1&&fitted.zoom>=g.MIN_ZOOM);
   for(const r of rects){const a=g.toScreen(r,fitted),b=g.toScreen({x:r.x+r.width,y:r.y+r.height},fitted);assert.ok(a.x>=0&&a.y>=0&&b.x<=width+1e-8&&b.y<=height+1e-8);}
   assert.equal(g.minimumZoom(rects,width,height),fitted.zoom);
   assert.ok(g.validCamera(JSON.parse(JSON.stringify(fitted))));assert.ok(g.zoomLabel(fitted.zoom)>0);
  }
 });
 test(`${name}: manual buttons, wheel and pinch retain anchors through low zoom and limits`,()=>{
  const floor=g.minimumZoom(rects,390,600),anchor={x:183,y:260};let camera={x:75,y:-90,zoom:1};
  const world=g.toWorld(anchor,camera);
  for(const requested of [.2,.1,.02,floor,0,1,Infinity]){
   camera=g.zoomAt(camera,requested,anchor,floor);
   const screen=g.toScreen(world,camera);assert.ok(Math.abs(screen.x-anchor.x)<1e-7&&Math.abs(screen.y-anchor.y)<1e-7);
   const inverse=g.toWorld(screen,camera);assert.ok(Math.abs(inverse.x-world.x)<1e-7&&Math.abs(inverse.y-world.y)<1e-7);
   assert.ok(camera.zoom>=floor&&camera.zoom<=g.MAX_ZOOM);
  }
  assert.equal(g.clampZoom(0),.1);assert.equal(g.clampZoom(.2),.2);
  assert.ok(Number.isFinite(g.clampZoom(NaN)));
 });
 test(`${name}: saved low zoom is accepted but corrupt cameras rejected`,()=>{
  for(const zoom of [.35,.1,.01,g.MIN_ZOOM,1,1.8])assert.ok(g.validCamera({x:-400,y:123,zoom}));
  for(const value of [null,{}, {x:NaN,y:0,zoom:1},...[0,-1,NaN,Infinity,1e-99,2].map(zoom=>({x:0,y:0,zoom}))])assert.equal(g.validCamera(value),false);
  assert.equal(g.fitCamera([],500,500),null);assert.equal(g.fitCamera(rects,0,500),null);
 });
}
