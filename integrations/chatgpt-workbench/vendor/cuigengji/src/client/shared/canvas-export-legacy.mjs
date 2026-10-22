// Keep the unrelated materials relationship export contract unchanged.
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lines=(value,length=22)=>{const chars=Array.from(String(value||'')),result=[];for(let i=0;i<chars.length;i+=length)result.push(chars.slice(i,i+length).join(''));return result;};
export function legacyCanvasSvg(nodes,edges,points){
 const cards=nodes.filter(n=>points[n.id]),ids=new Set(cards.map(n=>n.id));if(!cards.length)throw new Error('画布没有可导出的内容');
 const x=Math.min(...cards.map(n=>points[n.id].x))-40,y=Math.min(...cards.map(n=>points[n.id].y))-40,w=Math.max(...cards.map(n=>points[n.id].x+280))-x+40,h=Math.max(...cards.map(n=>points[n.id].y+172))-y+40;
 const links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to)).map(e=>{const a=points[e.from],b=points[e.to],sx=a.x+280,sy=a.y+50,tx=b.x,ty=b.y+50;return '<path d="M'+sx+' '+sy+' C'+(sx+80)+' '+sy+','+(tx-80)+' '+ty+','+tx+' '+ty+'" fill="none" stroke="#7898b8" stroke-width="2"/><text x="'+((sx+tx)/2)+'" y="'+((sy+ty)/2-8)+'" text-anchor="middle" font-size="12" fill="#46627e">'+esc(e.name||e.label||'')+'</text>';}).join('');
 const boxes=cards.map(n=>{const at=points[n.id];return '<g transform="translate('+at.x+' '+at.y+')"><rect width="280" height="172" rx="14" fill="#f5f8fd" stroke="#9ab3d4"/><text x="18" y="30" fill="#203d5c" font-size="17" font-weight="600">'+esc(lines(n.title||n.name,15)[0])+'</text>'+lines(n.summary||'',22).slice(0,5).map((l,i)=>'<text x="18" y="'+(56+i*21)+'" font-size="13" fill="#536b84">'+esc(l)+'</text>').join('')+'</g>';}).join('');
 return {w,h,svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="'+x+' '+y+' '+w+' '+h+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#ffffff"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">'+links+boxes+'</g></svg>'};
}
