import {relationColor,relationName} from './relation-color.mjs';
import {materialConnection,materialLabelSize,materialLabelPosition,characterConnection} from './material-graph-geometry.mjs';
import {defaultCardColors} from './card-colors.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lines=(value,length=22)=>{const chars=Array.from(String(value||'')),result=[];for(let i=0;i<chars.length;i+=length)result.push(chars.slice(i,i+length).join(''));return result;};
export function legacyCanvasSvg(nodes,edges,points){
 if(nodes.some(n=>n.type==='character_card'||n.type==='world_entry'))return materialCanvasSvg(nodes,edges,points);
 const cards=nodes.filter(n=>points[n.id]),ids=new Set(cards.map(n=>n.id));if(!cards.length)throw new Error('画布没有可导出的内容');
 const x=Math.min(...cards.map(n=>points[n.id].x))-40,y=Math.min(...cards.map(n=>points[n.id].y))-40,w=Math.max(...cards.map(n=>points[n.id].x+280))-x+40,h=Math.max(...cards.map(n=>points[n.id].y+172))-y+40;
 const links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>{const a=points[e.from],b=points[e.to],sx=a.x+280,sy=a.y+50,tx=b.x,ty=b.y+50;return '<path d="M'+sx+' '+sy+' C'+(sx+80)+' '+sy+','+(tx-80)+' '+ty+','+tx+' '+ty+'" fill="none" stroke="#7898b8" stroke-width="2"/><text x="'+((sx+tx)/2)+'" y="'+((sy+ty)/2-8)+'" text-anchor="middle" font-size="12" fill="#46627e">'+esc(e.name||e.label||'')+'</text>';}).join('');
 const boxes=cards.map(n=>{const at=points[n.id];return '<g transform="translate('+at.x+' '+at.y+')"><rect width="280" height="172" rx="14" fill="#f5f8fd" stroke="#9ab3d4"/><text x="18" y="30" fill="#203d5c" font-size="17" font-weight="600">'+esc(lines(n.title||n.name,15)[0])+'</text>'+lines(n.summary||'',22).slice(0,5).map((l,i)=>'<text x="18" y="'+(56+i*21)+'" font-size="13" fill="#536b84">'+esc(l)+'</text>').join('')+'</g>';}).join('');
 return {w,h,svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="'+x+' '+y+' '+w+' '+h+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#ffffff"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">'+links+boxes+'</g></svg>'};
}

/** SVG is also the PNG rasterization source: neither export invents plot arrows or colors. */
export function materialCanvasSvg(nodes,edges,points){
 const width=248,height=168,cards=nodes.filter(n=>points[n.id]),ids=new Set(cards.map(n=>n.id));
 if(!cards.length)throw new Error('画布没有可导出的内容');
 const routed=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(edge=>({edge,route:materialConnection(edge,points,cards)})),occupied=cards.map(n=>({...points[n.id],width,height}));
 const bounds=occupied.flatMap(r=>[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y+r.height}]).concat(routed.flatMap(({route})=>route.waypoints));
 const links=routed.map(({edge:e,route})=>{
  const {width:labelWidth,height:labelHeight}=materialLabelSize(relationName(e),e.content,[e.from,e.to].every(id=>cards.find(n=>n.id===id)?.type==='character_card'),route),labelPosition=materialLabelPosition(route,labelWidth,labelHeight,occupied);if(relationName(e)||e.content)occupied.push({...labelPosition,width:labelWidth,height:labelHeight});
  const {path:defaultPath}=route,path=e.presentation?.path||defaultPath,color=relationColor(e),dash=e.style==='dashed'?'8 5':e.style==='dotted'?'2 5':null,label=relationName(e)||e.label||'',content=lines(e.content,20).slice(0,2),labelCapacity=Math.max(2,Math.floor((labelWidth-16)/12)),displayLabel=Array.from(label).length>labelCapacity?Array.from(label).slice(0,labelCapacity-1).join('')+'…':label,cx=e.presentation?.labelX??labelPosition.x+labelWidth/2,cy=e.presentation?.labelY!==undefined?e.presentation.labelY+8:labelPosition.y+labelHeight/2;
  return `<g data-edge-id="${esc(e.id)}"><title>${esc(label)}</title><path d="${esc(path)}" fill="none" stroke="${color}" stroke-width="1.5"${dash?` stroke-dasharray="${dash}"`:''}${characterConnection(e,nodes)?'':` marker-end="url(#material-arrow-${esc(e.id)})"`}/>${label?`<text x="${cx}" y="${cy-8}" text-anchor="middle" font-size="12" fill="${color}">${esc(displayLabel)}</text>`:''}${content.map((line,i)=>`<text x="${cx}" y="${cy+10+i*17}" text-anchor="middle" font-size="12" fill="${color}">${esc(line)}</text>`).join('')}</g>`;
 }).join('');
 const boxes=cards.map(n=>{
  const at=points[n.id],p=n.presentation||{},tone=p.tone||defaultCardColors[n.type==='character_card'?'character':'world'],ink=p.ink||'#203d5c',muted=p.muted||'#536b84',kind=n.type==='character_card'?'角色':'世界',isCharacter=n.type==='character_card',titleX=isCharacter?80:14,clipId='avatar-'+esc(n.id);
  const avatar=isCharacter?`<defs><clipPath id="${clipId}"><circle cx="42" cy="47" r="28"/></clipPath></defs><circle cx="42" cy="47" r="28" fill="#fff" stroke="#8492a6"/>${n.avatarImage?`<image href="${esc(n.avatarImage)}" x="14" y="19" width="56" height="56" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`:`<text x="42" y="56" text-anchor="middle" font-size="26" fill="#263445">${esc(Array.from(n.name||'人')[0])}</text>`}`:'';
  return `<g data-node-id="${esc(n.id)}" transform="translate(${at.x} ${at.y})"><title>${esc(n.name||n.title)}</title><rect width="${width}" height="${height}" rx="12" fill="${esc(p.fill||'#f5f8fd')}" stroke="${esc(p.border||tone)}"/><path d="M2 12 V156" stroke="${esc(tone)}" stroke-width="4" stroke-linecap="round"/>${avatar}<text x="${titleX}" y="28" fill="${esc(muted)}" font-size="11">${esc(kind+(n.cardTags?.length?' · '+n.cardTags.join(' / '):''))}</text>${lines(n.name||n.title,isCharacter?9:15).slice(0,2).map((line,i)=>`<text x="${titleX}" y="${53+i*22}" fill="${esc(ink)}" font-size="15" font-weight="600">${esc(line)}</text>`).join('')}${lines(n.summary||'双击查看设定',20).slice(0,2).map((line,i)=>`<text x="14" y="${99+i*20}" fill="${esc(muted)}" font-size="12">${esc(line)}</text>`).join('')}${n.appearanceLabel?`<text x="14" y="151" fill="${esc(muted)}" font-size="10">${esc(lines(n.appearanceLabel,25)[0])}</text>`:''}</g>`;
 }).join('');
 bounds.push(...occupied.flatMap(r=>[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y+r.height}]));
 const x=Math.min(...bounds.map(p=>p.x))-80,y=Math.min(...bounds.map(p=>p.y))-80,w=Math.max(...bounds.map(p=>p.x))-x+80,h=Math.max(...bounds.map(p=>p.y))-y+80;
 const markers=edges.map(edge=>{const key=esc(edge.id),color=relationColor(edge);return `<marker id="material-arrow-${key}" viewBox="0 0 8 8" markerWidth="6" markerHeight="6" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="${color}"/></marker>`;}).join('');
 return {w,h,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><defs>${markers}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${esc(cards[0].presentation?.background||'#ffffff')}"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">${links}${boxes}</g></svg>`};
}
