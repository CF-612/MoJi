import React,{useState} from 'react';
import {Icon} from './icons.tsx';
import {planningSvg,planningPalette} from './planning-canvas-geometry.mjs';
import {legacyCanvasSvg} from './canvas-export-legacy.mjs';
import {resourceError} from './resource-error.mjs';
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function currentPalette(element){
 const dark=element&&getComputedStyle(element).colorScheme==='dark',palette={...planningPalette[dark?'dark':'light']};if(!element)return palette;
 const read=(selector,property,fallback)=>{const target=element.querySelector(selector);return target?getComputedStyle(target)[property]:fallback;};
 return {...palette,background:getComputedStyle(element).backgroundColor,card:read('.u-canvas-card:not(.kind-volume)','backgroundColor',palette.card),volume:read('.kind-volume','backgroundColor',palette.volume),ink:read('h3','color',palette.ink),muted:read('.u-canvas-card p','color',palette.muted),border:read('.u-canvas-card','borderTopColor',palette.border),precedence:read('.u-link-sequence>path','stroke',palette.precedence),contains:read('.u-link-contain>path','stroke',palette.contains)};
}
// Read every card: the palette must not flatten different statuses to the first card's color.
function currentCardPresentation(nodes,element){
 if(!element)return nodes;
 const rendered=new Map([...element.querySelectorAll('.u-canvas-card[data-node-id]')].map(el=>[el.dataset.nodeId,el]));
 return nodes.map(node=>{const el=rendered.get(node.id);if(!el)return node;const css=getComputedStyle(el);return {...node,presentation:{fill:css.backgroundColor,border:css.borderTopColor,tone:el.dataset.cardState?css.borderLeftColor:null,linked:el.dataset.foreshadowLinked==='true',linkedTone:css.borderRightColor,dashed:css.borderTopStyle==='dashed',label:el.title}};});
}
// Material colors are independent of plot progress, and may be customized per type.
function currentMaterialPresentation(nodes,element){
 if(!element)return nodes;
 const rendered=new Map([...element.querySelectorAll('.setting-card[data-node-id]')].map(el=>[el.dataset.nodeId,el]));
 return nodes.map(node=>{const el=rendered.get(node.id);if(!el)return node;const css=getComputedStyle(el),title=el.querySelector('.planning-title'),summary=el.querySelector('p');return {...node,presentation:{fill:css.backgroundColor,border:css.borderTopColor,tone:css.getPropertyValue('--graph-card-tone').trim(),ink:title?getComputedStyle(title).color:css.color,muted:summary?getComputedStyle(summary).color:css.color,background:getComputedStyle(element).backgroundColor}};});
}
function currentMaterialEdges(edges,element){
 if(!element)return edges;
 const paths=new Map([...element.querySelectorAll('.edge-hit[data-edge-id]')].map(el=>[el.dataset.edgeId,el]));
 const labels=new Map([...element.querySelectorAll('.relation-label[data-edge-id]')].map(el=>[el.dataset.edgeId,el]));
 return edges.map(edge=>{const path=paths.get(edge.id),label=labels.get(edge.id),css=label&&getComputedStyle(label);return path?{...edge,presentation:{path:path.getAttribute('d'),...(css?{labelX:parseFloat(css.left)+parseFloat(css.width)/2,labelY:parseFloat(css.top)+14}:{} )}}:edge;});
}
export function CanvasExport({nodes=[],edges=[],points={},name='画布',element,grouped=false,planning=false}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const save=async format=>{setBusy(true);setError('');try{const {svg,w,h}=planning?planningSvg(currentCardPresentation(nodes,element),edges,points,currentPalette(element)):legacyCanvasSvg(currentMaterialPresentation(nodes,element),currentMaterialEdges(edges,element),points),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),filename=String(name).replace(/[\\/:*?"<>|]/g,'_');if(format==='svg'){download(blob,filename+'.svg');return;}const url=URL.createObjectURL(blob);try{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('图片导出失败，请使用 SVG'));image.src=url;});const scale=Math.min(2,8192/w,8192/h,Math.sqrt(24000000/(w*h))),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(w*scale));canvas.height=Math.max(1,Math.ceil(h*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('无法创建图片画布');ctx.drawImage(image,0,0,canvas.width,canvas.height);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('图片过大，请使用 SVG');download(png,filename+'.png');}finally{URL.revokeObjectURL(url);}}catch(e){setError(resourceError(e));}finally{setBusy(false);}};
 return <>{!grouped&&<style>{'.cuigengji .canvas-export{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:auto}.cuigengji .canvas-export button{display:flex;align-items:center;gap:5px;padding:5px 9px;font-size:12px}'}</style>}<div className={grouped?'chapter-tool-grid':'canvas-export'}>{[['png','导出 PNG'],['svg','导出 SVG']].map(([format,label])=><button type="button" key={format} disabled={busy||!nodes.length} onClick={()=>save(format)}><Icon name="download"/><span>{busy?'正在导出…':label}</span></button>)}</div>{error&&<p role="alert">{error}</p>}</>;
}
