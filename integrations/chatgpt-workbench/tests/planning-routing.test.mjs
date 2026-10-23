import test from 'node:test';
import assert from 'node:assert/strict';
import {planningConnection,planningRoute,planningSvg} from '../vendor/cuigengji/src/client/shared/planning-canvas-geometry.mjs';
const node=(id,x,y,width=248,height=208)=>({id,x,y,width,height});
function geometry(cards,type='precedence'){
 const points=Object.fromEntries(cards.map(n=>[n.id,{x:n.x,y:n.y}])),edge={from:'a',to:'b',type};
 return {route:planningConnection(edge,points,cards),points,edge};
}
// Sample every segment and quadratic corner of the actual SVG path, not merely its skeleton.
function samples(path){const tokens=path.match(/[MLQ]|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g),out=[];let p,i=0;while(i<tokens.length){const op=tokens[i++],a={x:+tokens[i++],y:+tokens[i++]};if(op==='M'){p=a;out.push(p);continue;}const b=op==='Q'?{x:+tokens[i++],y:+tokens[i++]}:a;for(let n=1;n<=100;n++){const t=n/100,u=1-t;out.push(op==='Q'?{x:u*u*p.x+2*u*t*a.x+t*t*b.x,y:u*u*p.y+2*u*t*a.y+t*t*b.y}:{x:p.x+(b.x-p.x)*t,y:p.y+(b.y-p.y)*t});}p=b;}return out;}
function verify(cards,type){const {route,points,edge}=geometry(cards,type);assert.equal(route.obstructed,false);for(const p of samples(route.path))for(const r of cards)assert.ok(!(p.x>r.x+.001&&p.x<r.x+r.width-.001&&p.y>r.y+.001&&p.y<r.y+r.height-.001),`path inside ${r.id}: ${JSON.stringify(p)}\n${route.path}`);const first=route.waypoints[1],last=route.waypoints.at(-2);if(type==='contains'){assert.ok(first.y>route.from.y);assert.ok(last.y<route.to.y);}else{assert.ok(first.x>route.from.x);assert.ok(last.x<route.to.x);}assert.equal(planningConnection(edge,points,[...cards].reverse()).path,route.path,'node order does not change route');const exported=planningSvg(cards,[edge],points);assert.ok(exported.svg.includes(`d="${route.path}"`));return route;}
for(const [name,cards,type]of [
 ['forward straight',[node('a',0,0),node('b',360,0)]],
 ['reverse same row',[node('a',500,0),node('b',0,0)]],
 ['sketch reverse next row',[node('a',680,0),node('b',0,240),node('c',0,0),node('d',340,0)]],
 ['intermediate tall card',[node('a',0,120),node('b',800,120),node('c',380,-60,260,520)]],
 ['multiple obstacles',[node('a',0,0),node('b',1000,500),node('c',350,0,250,400),node('d',650,300,250,420)]],
 ['containment across row',[node('a',300,0),node('b',0,400)],'contains'],
 ['reverse containment',[node('a',0,500),node('b',0,0)],'contains'],
 ['variable measured dimensions',[node('a',0,0,300,330),node('b',650,340,220,260),node('c',330,150,270,400)]],
 ['narrow corridor',[node('a',500,0),node('b',0,218),node('c',0,0)]],
])test(`rounded routing: ${name}`,()=>verify(cards,type));
test('overlap is deterministic, finite, flagged, and never rewrites card positions',()=>{const cards=[node('a',0,0),node('b',100,0)],before=structuredClone(cards),{route}=geometry(cards);assert.equal(route.obstructed,true);assert.equal(route.path,geometry(cards).route.path);assert.ok(!/NaN|Infinity/.test(route.path));assert.deepEqual(cards,before);});
test('drag changes route and dimensions without stale geometry',()=>{const cards=[node('a',0,0),node('b',700,0),node('c',350,0)];const before=verify(cards);cards[2].y=400;const after=verify(cards);assert.notEqual(before.path,after.path);assert.equal(after.waypoints.length,2);});
test('seeded mixed layouts keep rounded paths outside every card',()=>{
 let seed=612;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let run=0;run<48;run++){
  const positions=Array.from({length:12},(_,i)=>({x:(i%4)*340+Math.floor(random()*30),y:Math.floor(i/4)*300+Math.floor(random()*30)}));
  const source=Math.floor(random()*12);let target=Math.floor(random()*11);if(target>=source)target++;
  const cards=positions.map((p,i)=>node(i===source?'a':i===target?'b':`n${i}`,p.x,p.y,180+Math.floor(random()*80),160+Math.floor(random()*80)));
  verify(cards,run%2?'contains':'precedence');
 }
});

test('snapped wire preview is identical to committed and exported route',()=>{const cards=[node('a',700,0),node('b',0,300),node('c',350,50)];for(const type of ['precedence','contains']){const {route}=geometry(cards,type);assert.equal(planningRoute(route.from,route.to,cards,type==='contains'?'vertical':'horizontal','a','b').path,route.path);}});
