import test from 'node:test';
import assert from 'node:assert/strict';
import {planningConnection,planningRoute,planningSvg} from '../vendor/cuigengji/src/client/shared/planning-canvas-geometry.mjs';
const node=(id,x,y,width=248,height=208)=>({id,x,y,width,height});
function geometry(cards,type='precedence'){
 const points=Object.fromEntries(cards.map(n=>[n.id,{x:n.x,y:n.y}])),edge={from:'a',to:'b',type};
 return {route:planningConnection(edge,points,cards),points,edge};
}
// Sample actual SVG curves, not only control points, to check bounded geometry.
function samples(path){const tokens=path.match(/[MLQC]|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g),out=[];let p,i=0;while(i<tokens.length){const op=tokens[i++],a={x:+tokens[i++],y:+tokens[i++]};if(op==='M'){p=a;out.push(p);continue;}const b=['Q','C'].includes(op)?{x:+tokens[i++],y:+tokens[i++]}:a,c=op==='C'?{x:+tokens[i++],y:+tokens[i++]}:b;for(let n=1;n<=100;n++){const t=n/100,u=1-t;out.push(op==='C'?{x:u*u*u*p.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*c.x,y:u*u*u*p.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*c.y}:op==='Q'?{x:u*u*p.x+2*u*t*a.x+t*t*b.x,y:u*u*p.y+2*u*t*a.y+t*t*b.y}:{x:p.x+(b.x-p.x)*t,y:p.y+(b.y-p.y)*t});}p=c;}return out;}

function verify(cards,type){const {route,points,edge}=geometry(cards,type);assert.equal(route.obstructed,false);assert.equal(route.kind,'bezier');assert.doesNotMatch(route.path,/[LQ]|NaN|Infinity/);const first=route.waypoints[1],last=route.waypoints.at(-2);if(type==='contains'){assert.ok(first.y>route.from.y);assert.ok(last.y<route.to.y);}else{assert.ok(first.x>route.from.x);assert.ok(last.x<route.to.x);}assert.equal(planningConnection(edge,points,[...cards].reverse()).path,route.path,'node order does not change route');const exported=planningSvg(cards,[edge],points);assert.ok(exported.svg.includes(`d="${route.path}"`));return route;}
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
])test(`natural-first routing: ${name}`,()=>verify(cards,type));
test('overlap is deterministic, finite, curved, and never rewrites card positions',()=>{const cards=[node('a',0,0),node('b',100,0)],before=structuredClone(cards),{route}=geometry(cards);assert.equal(route.obstructed,false);assert.equal(route.path,geometry(cards).route.path);assert.ok(!/NaN|Infinity/.test(route.path));assert.deepEqual(cards,before);});
test('dragging an unrelated obstacle never changes a route',()=>{const cards=[node('a',0,0),node('b',700,0),node('c',350,0)];const before=verify(cards);cards[2].y=400;const after=verify(cards);assert.equal(before.path,after.path);assert.equal(after.kind,'bezier');});
test('seeded mixed layouts keep finite natural curves and unchanged endpoint semantics',()=>{
 let seed=612;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let run=0;run<48;run++){
  const positions=Array.from({length:12},(_,i)=>({x:(i%4)*340+Math.floor(random()*30),y:Math.floor(i/4)*300+Math.floor(random()*30)}));
  const source=Math.floor(random()*12);let target=Math.floor(random()*11);if(target>=source)target++;
  const cards=positions.map((p,i)=>node(i===source?'a':i===target?'b':`n${i}`,p.x,p.y,180+Math.floor(random()*80),160+Math.floor(random()*80)));
  verify(cards,run%2?'contains':'precedence');
 }
});

test('snapped wire preview is identical to committed and exported route',()=>{const cards=[node('a',700,0),node('b',0,300),node('c',350,50)];for(const type of ['precedence','contains']){const {route}=geometry(cards,type);assert.equal(planningRoute(route.from,route.to,cards,type==='contains'?'vertical':'horizontal','a','b').path,route.path);}});

test('ordinary diagonal and obstructed connections stay single natural cubics',()=>{for(const cards of [[node('a',0,0),node('b',650,300)],[node('a',0,0),node('b',800,0),node('c',350,-100,250,400)]]){const route=verify(cards);assert.equal(route.corrected,false);assert.equal(route.path.match(/ C/g).length,1);assert.equal(route.path,geometry(cards.slice(0,2)).route.path);}});
test('extreme reverse row and column use bounded smooth cubics, not perimeter detours',()=>{for(const type of ['precedence','contains']){const cards=type==='contains'?[node('a',0,600),node('b',0,0)]:[node('a',600,0),node('b',0,0)];const route=verify(cards,type);assert.equal(route.corrected,true);assert.equal(route.path.match(/ C/g).length,2);const p=route.waypoints,m=p[3];assert.deepEqual({x:m.x-p[2].x,y:m.y-p[2].y},{x:p[4].x-m.x,y:p[4].y-m.y},'C1 smooth join');for(const point of samples(route.path)){assert(point.x>=Math.min(route.from.x,route.to.x)-121&&point.x<=Math.max(route.from.x,route.to.x)+121);assert(point.y>=Math.min(route.from.y,route.to.y)-121&&point.y<=Math.max(route.from.y,route.to.y)+121);}}});
test('near-coincident and acute reverse endpoints remain finite and bounded',()=>{for(const to of [{x:0,y:0},{x:.1,y:.01},{x:-500,y:.01},{x:-10,y:1}]){const route=planningRoute({x:0,y:0},to,[]);assert.doesNotMatch(route.path,/[LQ]|NaN|Infinity/);assert.equal(route.samples.length,81);for(const p of route.samples)assert(Math.hypot(p.x,p.y)<Math.hypot(to.x,to.y)+150);}});

test('one parent fans into distinct natural curves, not one shared trunk and flat bus',()=>{const cards=[node('parent',500,-600),...Array.from({length:9},(_,i)=>node('child'+i,i*300-700,0))],points=Object.fromEntries(cards.map(n=>[n.id,{x:n.x,y:n.y}])),routes=cards.slice(1).map(n=>planningConnection({from:'parent',to:n.id,type:'contains'},points,cards));assert(routes.every(r=>r.kind==='bezier'));assert.equal(new Set(routes.map(r=>r.path)).size,9);assert.equal(new Set(routes.map(r=>r.samples[40].x)).size,9);for(const r of routes)assert.doesNotMatch(r.path,/[LQ]/);});

test('export preserves blue solid sequence arrows and orange dashed containment with identical curves',()=>{const cards=[node('a',600,0),node('b',0,0)],{points}=geometry(cards),edges=[{from:'a',to:'b',type:'precedence'},{from:'a',to:'b',type:'contains'}],{svg}=planningSvg(cards,edges,points);for(const edge of edges)assert(svg.includes(`d="${planningConnection(edge,points,cards).path}"`));assert.match(svg,/<path data-relation="precedence"[^>]*stroke="#356dc4"[^>]*marker-end="url\(#planning-precedence-arrow\)"/);assert.match(svg,/<path data-relation="contains"[^>]*stroke="#b3651d"[^>]*stroke-dasharray="7 5"/);assert.doesNotMatch(svg,/<path data-relation="contains"[^>]*marker-end/);});

test('reverse and acute geometry sweeps contain no sampled self-intersection loops',()=>{const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),intersects=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;for(const x of [-1000,-100,-10,0,10,100,1000])for(const y of [-100,-1,0,1,100]){if(x===0&&y===0)continue;const {samples}=planningRoute({x:0,y:0},{x,y},[]);for(let i=1;i<samples.length;i++)for(let j=i+2;j<samples.length;j++)assert(!intersects(samples[i-1],samples[i],samples[j-1],samples[j]),`loop at ${x},${y}`);}});
