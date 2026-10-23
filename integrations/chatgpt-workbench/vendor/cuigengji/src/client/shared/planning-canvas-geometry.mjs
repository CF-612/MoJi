// Shared by live planning canvas and export: layout units are world pixels, not zoomed pixels.
export const PLANNING_CARD_WIDTH=248;
export const PLANNING_CARD_HEIGHT=208;
export const PLANNING_PORT_Y=PLANNING_CARD_HEIGHT/2;
export const planningPalette={light:{background:'#ffffff',card:'#ffffff',volume:'#edf3fc',ink:'#213b56',muted:'#52677d',border:'#aabbd0',precedence:'#356dc4',contains:'#b3651d'},dark:{background:'#192b3e',card:'#24384f',volume:'#2b4b69',ink:'#e3ebf5',muted:'#b2c1d3',border:'#59718c',precedence:'#8bb7ff',contains:'#efae68'}};
// Connections are free curves, not obstacle-avoiding wires. Other cards must not
// change a route (or turn a fan into a shared rectangular bus).
const cubicAt=(a,b,c,d,t)=>{const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};};
function curveResult(segments,corrected=false){
 const from=segments[0][0],to=segments.at(-1)[3];
 const samples=Array.from({length:81},(_,i)=>{const t=i/80*segments.length,index=Math.min(segments.length-1,Math.floor(t));return cubicAt(...segments[index],t-index);});
 return {from,to,waypoints:[from,...segments.flatMap(s=>s.slice(1))],samples,kind:'bezier',corrected,radius:0,obstructed:false,path:`M${from.x} ${from.y}`+segments.map(s=>` C${s[1].x} ${s[1].y} ${s[2].x} ${s[2].y} ${s[3].x} ${s[3].y}`).join('')};
}
function foldedCurve([from,a,b,to],distance){
 let last;
 for(let i=0;i<=80;i++){const t=i/80,u=1-t,dx=3*u*u*(a.x-from.x)+6*u*t*(b.x-a.x)+3*t*t*(to.x-b.x),dy=3*u*u*(a.y-from.y)+6*u*t*(b.y-a.y)+3*t*t*(to.y-b.y),speed=Math.hypot(dx,dy);
  if(speed<Math.max(.01,distance*.008))return true;
  const direction={x:dx/speed,y:dy/speed};if(last&&last.x*direction.x+last.y*direction.y<.5)return true;last=direction;
 }
 return false;
}
export function planningRoute(from,to,rectangles,axis='horizontal',sourceId,targetId,ports){
 const source=ports?.source||(axis==='vertical'?{x:0,y:1}:{x:1,y:0}),target=ports?.target||(axis==='vertical'?{x:0,y:-1}:{x:-1,y:0});
 const dx=to.x-from.x,dy=to.y-from.y,distance=Math.hypot(dx,dy);
 const sourceGap=dx*source.x+dy*source.y,targetGap=-dx*target.x-dy*target.y;
 // Keep the established ordinary curve; shorten only backward-facing handles.
 const handle=gap=>gap<0?Math.min(72,distance*.16):Math.min(240,distance*.42,Math.max(Math.min(28,distance*.28),gap*.5||distance*.28));
 const a={x:from.x+source.x*handle(sourceGap),y:from.y+source.y*handle(sourceGap)},b={x:to.x+target.x*handle(targetGap),y:to.y+target.y*handle(targetGap)};
 const segment=[from,a,b,to];
 if(distance>=1&&!foldedCurve(segment,distance))return curveResult([segment]);
 // A nearly collinear reverse connection cannot keep outward tangents in one
 // cubic without folding back on itself. Use two C1-continuous, bounded cubics,
 // never a grid detour around the cards. The chosen attachment points stay put.
 const direction=distance>=1?{x:dx/distance,y:dy/distance}:{x:-source.x,y:-source.y};
 const normal={x:-direction.y,y:direction.x},bend=Math.min(120,Math.max(18,distance*.22));
 const middle={x:(from.x+to.x)/2+normal.x*bend,y:(from.y+to.y)/2+normal.y*bend};
 const endHandle=Math.min(72,Math.max(8,distance*.16)),midHandle=Math.min(160,Math.max(8,distance*.25));
 return curveResult([[from,{x:from.x+source.x*endHandle,y:from.y+source.y*endHandle},{x:middle.x-direction.x*midHandle,y:middle.y-direction.y*midHandle},middle],[middle,{x:middle.x+direction.x*midHandle,y:middle.y+direction.y*midHandle},{x:to.x+target.x*endHandle,y:to.y+target.y*endHandle},to]],true);
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
