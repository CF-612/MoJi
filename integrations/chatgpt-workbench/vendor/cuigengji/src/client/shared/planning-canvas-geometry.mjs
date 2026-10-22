// Shared by live planning canvas and export: layout units are world pixels, not zoomed pixels.
export const PLANNING_CARD_WIDTH=248;
export const PLANNING_CARD_HEIGHT=208;
export const PLANNING_PORT_Y=PLANNING_CARD_HEIGHT/2;
export const planningPalette={light:{background:'#ffffff',card:'#ffffff',volume:'#edf3fc',ink:'#213b56',muted:'#52677d',border:'#aabbd0',precedence:'#356dc4',contains:'#b3651d'},dark:{background:'#192b3e',card:'#24384f',volume:'#2b4b69',ink:'#e3ebf5',muted:'#b2c1d3',border:'#59718c',precedence:'#8bb7ff',contains:'#efae68'}};
export function planningConnection(edge,points,nodes=[]){
 const a=points[edge.from],b=points[edge.to];if(!a||!b)return null;
 const source=nodes.find(n=>n.id===edge.from),target=nodes.find(n=>n.id===edge.to),sw=source?.width||PLANNING_CARD_WIDTH,sh=source?.height||PLANNING_CARD_HEIGHT,tw=target?.width||PLANNING_CARD_WIDTH,th=target?.height||PLANNING_CARD_HEIGHT;
 const vertical=edge.type==='contains',from=vertical?{x:a.x+sw/2,y:a.y+sh}:{x:a.x+sw,y:a.y+sh/2},to=vertical?{x:b.x+tw/2,y:b.y}:{x:b.x,y:b.y+th/2};
 const reach=vertical?70:Math.max(50,Math.abs(to.x-from.x)*.42),c1=vertical?{x:from.x,y:from.y+reach}:{x:from.x+reach,y:from.y},c2=vertical?{x:to.x,y:to.y-reach}:{x:to.x-reach,y:to.y};
 return {from,to,c1,c2,path:`M${from.x} ${from.y} C${c1.x} ${c1.y},${c2.x} ${c2.y},${to.x} ${to.y}`};
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lines=(value,length=18)=>String(value||'').split('\n').flatMap(line=>{const chars=Array.from(line),result=[];for(let i=0;i<chars.length;i+=length)result.push(chars.slice(i,i+length).join(''));return result.length?result:[''];});
export function planningSvg(nodes,edges,points,theme='light'){
 const palette=typeof theme==='object'?{...planningPalette.light,...theme}:planningPalette[theme]||planningPalette.light;
 const cards=nodes.filter(n=>points[n.id]),ids=new Set(cards.map(n=>n.id));if(!cards.length)throw new Error('画布没有可导出的内容');
 const links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>({...e,geometry:planningConnection(e,points,cards)}));
 const bounds=cards.flatMap(n=>[points[n.id],{x:points[n.id].x+(n.width||PLANNING_CARD_WIDTH),y:points[n.id].y+(n.height||PLANNING_CARD_HEIGHT)}]).concat(links.flatMap(e=>[e.geometry.from,e.geometry.to,e.geometry.c1,e.geometry.c2]));
 const x=Math.min(...bounds.map(p=>p.x))-40,y=Math.min(...bounds.map(p=>p.y))-40,w=Math.max(...bounds.map(p=>p.x))-x+40,h=Math.max(...bounds.map(p=>p.y))-y+40;
 const paths=links.map(e=>`<path data-relation="${e.type==='contains'?'contains':'precedence'}" d="${e.geometry.path}" fill="none" stroke="${esc(e.type==='contains'?palette.contains:palette.precedence)}" stroke-width="2" ${e.type==='contains'?'stroke-dasharray="7 5"':'marker-end="url(#planning-precedence-arrow)"'}/>`).join('');
 const boxes=cards.map(n=>{const p=points[n.id],width=n.width||PLANNING_CARD_WIDTH,height=n.height||PLANNING_CARD_HEIGHT;return `<g data-node-id="${esc(n.id)}" transform="translate(${p.x} ${p.y})"><rect width="${width}" height="${height}" rx="12" fill="${esc(n.kind==='volume'?palette.volume:palette.card)}" stroke="${esc(palette.border)}"/><text x="14" y="25" fill="${esc(palette.muted)}" font-size="10">${esc(n.purpose||({volume:'正文卷',chapter:'正文章节'})[n.kind]||'剧情卡')}</text>${lines(n.title||n.name,14).slice(0,2).map((line,i)=>`<text x="14" y="${51+i*23}" fill="${esc(palette.ink)}" font-size="15" font-weight="600">${esc(line)}</text>`).join('')}${lines(n.summary||'尚未填写摘要',18).slice(0,3).map((line,i)=>`<text x="14" y="${101+i*21}" font-size="12" fill="${esc(palette.muted)}">${esc(line)}</text>`).join('')}</g>`;}).join('');
 return {w,h,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><defs><marker id="planning-precedence-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${esc(palette.precedence)}"/></marker></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${esc(palette.background)}"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">${paths}${boxes}</g></svg>`};
}
