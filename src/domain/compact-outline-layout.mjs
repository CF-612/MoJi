// Generated presentation only: pack complete containment subtrees, never infer
// new parents from rows or use precedence links to arrange the outline.
export function packOutline(objects,placements,refs,{origin={x:60,y:60},width=248,height=208,gapX=64,gapY=100,sizes={}}={}){
 const included=new Set(refs.filter(ref=>objects[ref]));
 const ordered=[...included].sort((a,b)=>(placements[a]?.order??0)-(placements[b]?.order??0)||a.localeCompare(b));
 const children=new Map(),roots=[];
 for(const ref of ordered){const parent=placements[ref]?.parent;if(included.has(parent)){if(!children.has(parent))children.set(parent,[]);children.get(parent).push(ref);}else roots.push(ref);}
 const dimension=(ref,key,fallback)=>Number.isFinite(sizes[ref]?.[key])&&sizes[ref][key]>0?sizes[ref][key]:fallback;
 const dimensions=new Map(ordered.map(ref=>[ref,{width:dimension(ref,'width',width),height:dimension(ref,'height',height)}]));
 const visiting=new Set(),visited=new Set();
 const check=ref=>{if(visiting.has(ref))throw Object.assign(new Error('不能为循环包含关系生成大纲，请先修复层级。'),{code:'STORY_INVALID'});if(visited.has(ref))return;visiting.add(ref);for(const child of children.get(ref)||[])check(child);visiting.delete(ref);visited.add(ref);};
 for(const ref of ordered)check(ref);
 if(!ordered.length)return {};
 // Try a small deterministic set of widths; aspect ratio is a preference, not
 // permission to shrink cards, overlap branches, or break a volume into roots.
 const area=ordered.reduce((sum,ref)=>{const d=dimensions.get(ref);return sum+(d.width+gapX)*(d.height+gapY);},0);
 const minimum=Math.max(...[...dimensions.values()].map(d=>d.width));
 const shelf=(blocks,target)=>{
  let x=0,y=0,rowHeight=0,w=0;const items=[];
  for(const block of blocks){if(x&&x+block.width>target){y+=rowHeight+gapY;x=0;rowHeight=0;}items.push({block,x,y});w=Math.max(w,x+block.width);x+=block.width+gapX;rowHeight=Math.max(rowHeight,block.height);}
  return {items,width:w,height:blocks.length?y+rowHeight:0};
 };
 let best;
 for(const factor of [0.5,0.75,1,1.5,2,3,4,6,8]){
  const target=Math.max(minimum,Math.sqrt(area)*factor);
  const measure=ref=>{
   const d=dimensions.get(ref),descendants=(children.get(ref)||[]).map(measure),packed=shelf(descendants,target);
   const w=Math.max(d.width,packed.width),items=packed.items.map(item=>({...item,x:item.x+(w-packed.width)/2,y:item.y+d.height+gapY}));
   return {ref,width:w,height:d.height+(items.length?gapY+packed.height:0),items,volume:objects[ref].kind==='volume'||descendants.some(child=>child.volume)};
  };
  const blocks=roots.map(measure),rows=[];let loose=[];
  const flush=()=>{if(loose.length){rows.push(shelf(loose,target));loose=[];}};
  // Volume forests are separate vertical bands in stable outline order. Loose
  // chapters/cards share compact rows rather than becoming another long strip.
  for(const block of blocks){if(block.volume){flush();rows.push({width:block.width,height:block.height,items:[{block,x:0,y:0}]});}else loose.push(block);}flush();
  const w=Math.max(...rows.map(row=>row.width)),h=rows.reduce((n,row)=>n+row.height,0)+Math.max(0,rows.length-1)*gapY;
  const score=Math.abs(Math.log(w/h))+0.08*Math.log(w*h/area);
  if(!best||score<best.score){const points={};
   const place=(block,x,y)=>{const d=dimensions.get(block.ref);points[block.ref]={x:x+(block.width-d.width)/2,y};for(const item of block.items)place(item.block,x+item.x,y+item.y);};
   let y=origin.y;for(const row of rows){for(const item of row.items)place(item.block,origin.x+(w-row.width)/2+item.x,y+item.y);y+=row.height+gapY;}
   best={points,score};
  }
 }
 return best.points;
}
