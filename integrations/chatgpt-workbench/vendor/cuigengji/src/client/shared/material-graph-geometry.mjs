import {planningRoute} from './planning-canvas-geometry.mjs';
/** Attachment geometry is visual metadata, independent of relationship direction/history. */
export const MATERIAL_WIDTH=248,MATERIAL_HEIGHT=168;
export const characterConnection=(edge,nodes)=>nodes.some(n=>(n.id===edge.from||n.id===edge.to)&&n.type==='character_card');
export function materialEndpoint(point,side){
 const {x,y}=point;
 return side==='top'?{x:x+124,y}:side==='bottom'?{x:x+124,y:y+168}:side==='left'?{x,y:y+84}:side==='right'?{x:x+248,y:y+84}:side==='in'?{x,y:y+36}:{x:x+248,y:y+36};
}
const vector=side=>side==='top'?{x:0,y:-1}:side==='bottom'?{x:0,y:1}:['in','left'].includes(side)?{x:-1,y:0}:{x:1,y:0};
export function materialRoute(start,end,rectangles,sourceId,targetId,fromPort,toPort){
 const source=vector(fromPort),target=vector(toPort);
 return planningRoute(start,end,rectangles,source.y?'vertical':'horizontal',sourceId,targetId,{source,target});
}
/** Unspecified legacy/modal endpoints are auto-facing, never written back to data.
 * Explicit user-selected sides (including legacy in/out) always win. */
export function materialPorts(edge,points){
 const a=points[edge.from],b=points[edge.to],dx=b.x-a.x,dy=b.y-a.y;
 const horizontal=Math.abs(dx)-MATERIAL_WIDTH>=Math.abs(dy)-MATERIAL_HEIGHT;
 const from=horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top'),to=horizontal?(dx>=0?'left':'right'):(dy>=0?'top':'bottom');
 return {fromPort:edge.fromPort||from,toPort:edge.toPort||to};
}
/** Same free-curve planning geometry; only attachment vectors differ. */
export function materialConnection(edge,points,nodes=Object.keys(points).map(id=>({id}))){
 const {fromPort:from,toPort:to}=materialPorts(edge,points),start=materialEndpoint(points[edge.from],from),end=materialEndpoint(points[edge.to],to);
 const rectangles=nodes.filter(n=>points[n.id]).map(n=>({id:n.id,...points[n.id],width:MATERIAL_WIDTH,height:MATERIAL_HEIGHT}));
 const route=materialRoute(start,end,rectangles,edge.from,edge.to,from,to);
 return {...route,start,end,fromPort:from,toPort:to};
}
/** Compact text + edit affordance; a short name must fit the normal 84px card gap. */
export function materialLabelSize(name,content,evolution=false,route){
 let width=(content?144:Math.max(32,Math.min(128,Array.from(name||'').length*12+16)))+(evolution?28:0);
 // Keep long titles attached to the line in an ordinary facing-card gap;
 // the renderer ellipsizes the label while its tooltip/editor retains the full name.
 if(!content&&route?.kind==='bezier'&&Math.abs(route.start.y-route.end.y)<20){const room=Math.abs(route.start.x-route.end.x)-16;if(room>=52)width=Math.min(width,room);}
 return {width,height:content?58:evolution?34:24};
}
/** Labels choose a clear routed segment; they never bend a route into a triangle. */
export function materialLabelPosition(route,width,height,occupied=[]){
 const collides=p=>occupied.some(r=>p.x<r.x+r.width+8&&p.x+width>r.x-8&&p.y<r.y+r.height+8&&p.y+height>r.y-8);
 if(route.kind==='bezier')for(const index of [40,32,48,24,56,16,64]){const center=route.samples[index];for(const offset of [0,-1,1]){const p={x:center.x-width/2,y:center.y-height/2+offset*(height/2+10)};if(!collides(p))return p;}}
 const candidates=[];let total=0;
 for(let i=1;i<route.waypoints.length;i++){const a=route.waypoints[i-1],b=route.waypoints[i],length=Math.hypot(b.x-a.x,b.y-a.y);candidates.push({a,b,length,at:total+length/2});total+=length;}
 candidates.sort((a,b)=>Math.abs(a.at-total/2)-Math.abs(b.at-total/2)||b.length-a.length);
 for(const {a,b,length} of candidates){if(length<Math.min(width,height)+16)continue;const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
  for(const offset of [0,-1,1]){const p={x:cx-width/2+(a.x===b.x?offset*(width/2+10):0),y:cy-height/2+(a.y===b.y?offset*(height/2+10):0)};if(!collides(p))return p;}
 }
 const a=route.waypoints[0],b=route.waypoints.at(-1);let p={x:(a.x+b.x-width)/2,y:Math.min(...route.waypoints.map(p=>p.y))-height-16};
 while(collides(p))p={...p,y:p.y-height-16};return p;
}
