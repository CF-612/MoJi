// Shared by live planning canvas and export: layout units are world pixels, not zoomed pixels.
export const PLANNING_CARD_WIDTH=248;
export const PLANNING_CARD_HEIGHT=208;
export const PLANNING_PORT_Y=PLANNING_CARD_HEIGHT/2;
export const planningPalette={light:{background:'#ffffff',card:'#ffffff',volume:'#edf3fc',ink:'#213b56',muted:'#52677d',border:'#aabbd0',precedence:'#356dc4',contains:'#b3651d'},dark:{background:'#192b3e',card:'#24384f',volume:'#2b4b69',ink:'#e3ebf5',muted:'#b2c1d3',border:'#59718c',precedence:'#8bb7ff',contains:'#efae68'}};
// A small rectilinear visibility-grid router. All dimensions are unscaled world pixels.
// Clearance is also the rounding budget: quadratic corners cannot cut into a card.
const inside=(p,r)=>p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;
const blocked=(a,b,rects)=>rects.some(r=>a.x===b.x?a.x>r.left&&a.x<r.right&&Math.max(a.y,b.y)>r.top&&Math.min(a.y,b.y)<r.bottom:a.y>r.top&&a.y<r.bottom&&Math.max(a.x,b.x)>r.left&&Math.min(a.x,b.x)<r.right);
const simplify=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).reduce((out,p)=>{while(out.length>1){const a=out.at(-2),b=out.at(-1);if((a.x===b.x&&b.x===p.x&&(b.y-a.y)*(p.y-b.y)>=0)||(a.y===b.y&&b.y===p.y&&(b.x-a.x)*(p.x-b.x)>=0))out.pop();else break;}out.push(p);return out;},[]);
function roundedPath(points,radius){
 let path=`M${points[0].x} ${points[0].y}`;
 for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(radius,ab/2,bc/2);const start={x:b.x+(a.x-b.x)*r/ab,y:b.y+(a.y-b.y)*r/ab},end={x:b.x+(c.x-b.x)*r/bc,y:b.y+(c.y-b.y)*r/bc};path+=` L${start.x} ${start.y} Q${b.x} ${b.y} ${end.x} ${end.y}`;}
 const end=points.at(-1);return path+` L${end.x} ${end.y}`;
}
// Binary heap keeps drag-time searches bounded without adding a routing dependency.
class RouteHeap{
 items=[];
 push(item){const a=this.items;a.push(item);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].cost<=item.cost)break;a[i]=a[p];i=p;}a[i]=item;}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].cost<a[c].cost)c++;if(a[c].cost>=last.cost)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
}
function findRoute(start,end,rects,axis){
 const xs=[...new Set([start.x,end.x,...rects.flatMap(r=>[r.left,r.right])])].sort((a,b)=>a-b),ys=[...new Set([start.y,end.y,...rects.flatMap(r=>[r.top,r.bottom])])].sort((a,b)=>a-b),nx=xs.length;
 const index=p=>ys.indexOf(p.y)*nx+xs.indexOf(p.x),point=i=>({x:xs[i%nx],y:ys[Math.floor(i/nx)]}),begin=index(start),finish=index(end),initial=axis==='vertical'?1:0;
 if(rects.some(r=>inside(start,r)||inside(end,r)))return null;
 const heap=new RouteHeap(),dist=new Map(),previous=new Map(),valid=new Map(),clear=new Map(),key=begin*2+initial;
 dist.set(key,0);heap.push({key,cost:0,g:0});let goal;
 while(heap.items.length){const current=heap.pop();if(current.g!==dist.get(current.key))continue;const i=Math.floor(current.key/2),direction=current.key%2,a=point(i);if(i===finish){goal=current.key;break;}
  const x=i%nx,y=Math.floor(i/nx);
  for(const [j,nextDirection]of [[x>0?i-1:-1,0],[x+1<nx?i+1:-1,0],[y>0?i-nx:-1,1],[y+1<ys.length?i+nx:-1,1]]){
   if(j<0)continue;const b=point(j);if(!valid.has(j))valid.set(j,!rects.some(r=>inside(b,r)));if(!valid.get(j))continue;
   // Never reverse into the source or arrive at the target from its card side.
   if(i===begin&&((axis==='vertical'&&b.y<a.y)||(axis!=='vertical'&&b.x<a.x)))continue;
   if(j===finish&&((axis==='vertical'&&b.y<a.y)||(axis!=='vertical'&&b.x<a.x)))continue;
   const segment=`${Math.min(i,j)}:${Math.max(i,j)}`;if(!clear.has(segment))clear.set(segment,!blocked(a,b,rects));if(!clear.get(segment))continue;
   const nextKey=j*2+nextDirection,g=current.g+Math.abs(b.x-a.x)+Math.abs(b.y-a.y)+(direction===nextDirection?0:28)+(j===finish&&nextDirection!==initial?28:0);
   if(g>=(dist.get(nextKey)??Infinity))continue;dist.set(nextKey,g);previous.set(nextKey,current.key);heap.push({key:nextKey,g,cost:g+Math.abs(b.x-end.x)+Math.abs(b.y-end.y)});
  }
 }
 if(goal===undefined)return null;const route=[];for(let k=goal;k!==undefined;k=previous.get(k))route.push(point(Math.floor(k/2)));return route.reverse();
}
export function planningRoute(from,to,rectangles,axis='horizontal',sourceId,targetId){
 for(const clearance of [20,8,2]){
  const rects=rectangles.map(r=>({id:r.id,left:r.x-clearance,right:r.x+r.width+clearance,top:r.y-clearance,bottom:r.y+r.height+clearance}));
  const start=axis==='vertical'?{x:from.x,y:from.y+clearance}:{x:from.x+clearance,y:from.y},end=axis==='vertical'?{x:to.x,y:to.y-clearance}:{x:to.x-clearance,y:to.y};
  // Only the attachment's own rectangle may be crossed by its short outward stub.
  if(blocked(from,start,rects.filter(r=>r.id!==sourceId))||blocked(end,to,rects.filter(r=>r.id!==targetId)))continue;
  const middle=findRoute(start,end,rects,axis);if(!middle)continue;
  const waypoints=simplify([from,...middle,to]),radius=Math.min(14,clearance*.7);
  return {from,to,waypoints,radius,obstructed:false,path:roundedPath(waypoints,radius)};
 }
 // Overlapping cards/ports can make a non-intersecting path mathematically impossible.
 // Keep deterministic orthogonal geometry and the semantic port directions; do not move cards.
 const gap=24,right=Math.max(from.x,to.x,...rectangles.map(r=>r.x+r.width))+gap,left=Math.min(from.x,to.x,...rectangles.map(r=>r.x))-gap,top=Math.min(from.y,to.y,...rectangles.map(r=>r.y))-gap,bottom=Math.max(from.y,to.y,...rectangles.map(r=>r.y+r.height))+gap;
 const waypoints=simplify(axis==='vertical'?[from,{x:from.x,y:bottom},{x:right,y:bottom},{x:right,y:top},{x:to.x,y:top},to]:[from,{x:right,y:from.y},{x:right,y:bottom},{x:left,y:bottom},{x:left,y:to.y},to]);
 return {from,to,waypoints,radius:10,obstructed:true,path:roundedPath(waypoints,10)};
}
export function planningConnection(edge,points,nodes=[]){
 const a=points[edge.from],b=points[edge.to];if(!a||!b)return null;
 const source=nodes.find(n=>n.id===edge.from),target=nodes.find(n=>n.id===edge.to),sw=source?.width||PLANNING_CARD_WIDTH,sh=source?.height||PLANNING_CARD_HEIGHT,tw=target?.width||PLANNING_CARD_WIDTH,th=target?.height||PLANNING_CARD_HEIGHT;
 const vertical=edge.type==='contains',from=vertical?{x:a.x+sw/2,y:a.y+sh}:{x:a.x+sw,y:a.y+sh/2},to=vertical?{x:b.x+tw/2,y:b.y}:{x:b.x,y:b.y+th/2};
 const rectangles=nodes.filter(n=>points[n.id]).map(n=>({id:n.id,...points[n.id],width:n.width||PLANNING_CARD_WIDTH,height:n.height||PLANNING_CARD_HEIGHT}));
 return planningRoute(from,to,rectangles,vertical?'vertical':'horizontal',edge.from,edge.to);
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lines=(value,length=18)=>String(value||'').split('\n').flatMap(line=>{const chars=Array.from(line),result=[];for(let i=0;i<chars.length;i+=length)result.push(chars.slice(i,i+length).join(''));return result.length?result:[''];});
export function planningSvg(nodes,edges,points,theme='light'){
 const palette=typeof theme==='object'?{...planningPalette.light,...theme}:planningPalette[theme]||planningPalette.light;
 const cards=nodes.filter(n=>points[n.id]),ids=new Set(cards.map(n=>n.id));if(!cards.length)throw new Error('画布没有可导出的内容');
 const links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>({...e,geometry:planningConnection(e,points,cards)}));
 const bounds=cards.flatMap(n=>[points[n.id],{x:points[n.id].x+(n.width||PLANNING_CARD_WIDTH),y:points[n.id].y+(n.height||PLANNING_CARD_HEIGHT)}]).concat(links.flatMap(e=>e.geometry.waypoints));
 const x=Math.min(...bounds.map(p=>p.x))-40,y=Math.min(...bounds.map(p=>p.y))-40,w=Math.max(...bounds.map(p=>p.x))-x+40,h=Math.max(...bounds.map(p=>p.y))-y+40;
 const paths=links.map(e=>`<path data-relation="${e.type==='contains'?'contains':'precedence'}" d="${e.geometry.path}" fill="none" stroke="${esc(e.type==='contains'?palette.contains:palette.precedence)}" stroke-width="2" ${e.type==='contains'?'stroke-dasharray="7 5"':'marker-end="url(#planning-precedence-arrow)"'}/>`).join('');
 const boxes=cards.map(n=>{const p=points[n.id],width=n.width||PLANNING_CARD_WIDTH,height=n.height||PLANNING_CARD_HEIGHT,appearance=n.presentation||{};return `<g data-node-id="${esc(n.id)}" transform="translate(${p.x} ${p.y})"><rect width="${width}" height="${height}" rx="12" fill="${esc(appearance.fill||(n.kind==='volume'?palette.volume:palette.card))}" stroke="${esc(appearance.border||palette.border)}" ${appearance.dashed?'stroke-dasharray="5 4"':''}/>${appearance.tone?`<path d="M2 12 V${height-12}" stroke="${esc(appearance.tone)}" stroke-width="4"/>`:""}${appearance.linked?`<path d="M${width-3} 12 V${height-12} M${width-6} 12 V${height-12}" stroke="${esc(appearance.linkedTone)}" stroke-width="1.2"/>`:""}<title>${esc(appearance.label||n.title)}</title><text x="14" y="25" fill="${esc(palette.muted)}" font-size="10">${esc(n.purpose||({volume:'正文卷',chapter:'正文章节'})[n.kind]||'剧情卡')}</text>${lines(n.title||n.name,14).slice(0,2).map((line,i)=>`<text x="14" y="${51+i*23}" fill="${esc(palette.ink)}" font-size="15" font-weight="600">${esc(line)}</text>`).join('')}${lines(n.summary||'尚未填写摘要',18).slice(0,3).map((line,i)=>`<text x="14" y="${101+i*21}" font-size="12" fill="${esc(palette.muted)}">${esc(line)}</text>`).join('')}</g>`;}).join('');
 return {w,h,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><defs><marker id="planning-precedence-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${esc(palette.precedence)}"/></marker></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${esc(palette.background)}"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">${paths}${boxes}</g></svg>`};
}
