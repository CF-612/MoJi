import test from 'node:test';
import assert from 'node:assert/strict';
import {materialConnection,materialRoute,materialLabelSize,materialLabelPosition} from '../vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
import {planningRoute} from '../vendor/cuigengji/src/client/shared/planning-canvas-geometry.mjs';
import {materialCanvasSvg} from '../vendor/cuigengji/src/client/shared/canvas-export-legacy.mjs';
const dirs={top:{x:0,y:-1},bottom:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const boxes=points=>Object.entries(points).map(([id,p])=>({id,...p,width:248,height:168}));
function assertSafe(route,points){assert.equal(route.obstructed,false);assert(!/NaN|Infinity/.test(route.path));if(route.kind==='bezier'){for(const p of route.samples)for(const r of boxes(points))assert(!(p.x>r.x+.001&&p.x<r.x+r.width-.001&&p.y>r.y+.001&&p.y<r.y+r.height-.001));return;}for(let i=1;i<route.waypoints.length;i++){const a=route.waypoints[i-1],b=route.waypoints[i];assert(a.x===b.x||a.y===b.y);for(const r of boxes(points)){const intersects=a.x===b.x?a.x>r.x&&a.x<r.x+r.width&&Math.max(a.y,b.y)>r.y&&Math.min(a.y,b.y)<r.y+r.height:a.y>r.y&&a.y<r.y+r.height&&Math.max(a.x,b.x)>r.x&&Math.min(a.x,b.x)<r.x+r.width;assert(!intersects,JSON.stringify({a,b,r,route}));}if(i>1){const p=route.waypoints[i-2];assert((a.x-p.x)*(b.x-a.x)+(a.y-p.y)*(b.y-a.y)>=0,'no 180 degree reversals');}}}
test('all 16 material port pairs reuse natural planning curves and obstacle routing with outward endpoint tangents',()=>{
 for(const points of [{a:{x:0,y:0},b:{x:332,y:0}},{a:{x:0,y:0},b:{x:1100,y:600},obstacle:{x:500,y:220}},{a:{x:600,y:400},b:{x:0,y:0},obstacle:{x:300,y:200}}])for(const fromPort of Object.keys(dirs))for(const toPort of Object.keys(dirs)){
 const edge={from:'a',to:'b',fromPort,toPort},route=materialConnection(edge,points);assertSafe(route,points);const first=route.waypoints[1],last=route.waypoints.at(-2),s=dirs[fromPort],t=dirs[toPort];assert((first.x-route.start.x)*s.x+(first.y-route.start.y)*s.y>0);assert((last.x-route.end.x)*t.x+(last.y-route.end.y)*t.y>0);assert.equal(route.path,planningRoute(route.start,route.end,boxes(points),s.y?'vertical':'horizontal','a','b',{source:s,target:t}).path);if(route.kind==='detour'&&route.waypoints.length>2)assert.match(route.path,/Q/);else assert.match(route.path,/ C/);
 }
});
test('legacy relation label detours cannot create triangular paths or overlap cards; export uses identical router',()=>{
 const points={a:{x:332,y:0},b:{x:664,y:0},world:{x:0,y:0}},edge={id:'friend',from:'a',to:'b',name:'挚友',relationColor:'#e59828'},route=materialConnection(edge,points);assertSafe(route,points);const p=materialLabelPosition(route,88,24,boxes(points));for(const r of boxes(points))assert(!(p.x<r.x+r.width&&p.x+88>r.x&&p.y<r.y+r.height&&p.y+24>r.y));assert.equal(route.kind,'bezier');assert(!route.path.includes(' Q'));const nodes=Object.keys(points).map(id=>({id,type:id==='world'?'world_entry':'character_card',name:id})),svg=materialCanvasSvg(nodes,[edge],points).svg;assert(svg.includes(`d="${route.path}"`));assert(!svg.match(/data-edge-id="friend"[^]*?marker-end=/));
});

test('material snapped preview and committed geometry share the same natural-first route',()=>{const points={a:{x:0,y:0},b:{x:420,y:300},c:{x:250,y:0}},edge={from:'a',to:'b',fromPort:'bottom',toPort:'right'},route=materialConnection(edge,points);assert.equal(materialRoute(route.start,route.end,boxes(points),'a','b','bottom','right').path,route.path);});

test('legacy/modal links without port metadata auto-face in every position without rewriting the relation',()=>{
 for(const b of [{x:400,y:0},{x:-400,y:0},{x:0,y:400},{x:0,y:-400}]){const edge={id:'legacy',from:'a',to:'b',name:'旧文字'},before=structuredClone(edge),points={a:{x:0,y:0},b},route=materialConnection(edge,points);assert.equal(route.kind,'bezier');assert.deepEqual(edge,before);assertSafe(route,points);const nodes=[{id:'a',type:'character_card'},{id:'b',type:'character_card'}];assert(materialCanvasSvg(nodes,[edge],points).svg.includes(`d="${route.path}"`));}
});
test('explicit outward ports are honored even when automatic facing would be shorter',()=>{
 const points={a:{x:400,y:0},b:{x:0,y:0}},auto=materialConnection({from:'a',to:'b'},points),chosen=materialConnection({from:'a',to:'b',fromPort:'out',toPort:'in'},points);assert.equal(auto.kind,'bezier');assert.equal(chosen.fromPort,'out');assert.equal(chosen.toPort,'in');assert.equal(chosen.kind,'detour');assert.deepEqual(chosen.start,{x:648,y:36});assert.deepEqual(chosen.end,{x:0,y:36});
});

test('short custom relationship label stays centered on the direct line in the normal 84px gap',()=>{const points={a:{x:332,y:0},b:{x:0,y:0}},edge={from:'a',to:'b',name:'挚友'},route=materialConnection(edge,points),size=materialLabelSize(edge.name,'',true),label=materialLabelPosition(route,size.width,size.height,boxes(points));assert.equal(size.width,68);assert.equal(label.x+size.width/2,290);assert.equal(label.y+size.height/2,84);for(const r of boxes(points))assert(!(label.x<r.x+r.width&&label.x+size.width>r.x&&label.y<r.y+r.height&&label.y+size.height>r.y));});

test('80-character relationship name remains near line with bounded label and full source name intact',()=>{const name='长'.repeat(80),edge={from:'a',to:'b',name},points={a:{x:332,y:0},b:{x:0,y:0}},route=materialConnection(edge,points),size=materialLabelSize(name,'',true,route),label=materialLabelPosition(route,size.width,size.height,boxes(points));assert.equal(size.width,68);assert.equal(label.y+size.height/2,84);assert.equal(label.x+size.width/2,290);assert.equal(edge.name,name);assert.equal(route.path,materialConnection(edge,points).path);});
