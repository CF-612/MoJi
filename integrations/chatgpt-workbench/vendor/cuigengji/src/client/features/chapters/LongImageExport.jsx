import React,{useEffect,useRef,useState} from 'react';
import {wrapShareText,paginateShareLines,paintSharePage,shareFilename} from './long-image.mjs';
import {efficiencyStyle} from './efficiency-style.mjs';
const fonts={serif:'"Noto Serif CJK SC","Songti SC",SimSun,serif',sans:'"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif'};
const toBlob=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('图片生成失败；请减小字号后重试。')),'image/png'));
export function LongImageExport({title='',content='',selectionText=''}){
 const [range,setRange]=useState(selectionText?'selection':'chapter'),[includeTitle,setIncludeTitle]=useState(true),[fontSize,setFontSize]=useState(40),[font,setFont]=useState('serif'),[result,setResult]=useState(null),[page,setPage]=useState(0),[image,setImage]=useState(null),[working,setWorking]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{
  if(!result)return;let disposed=false,url=null;setImage(null);setWorking(true);setError('');
  const canvas=document.createElement('canvas');
  Promise.resolve().then(()=>paintSharePage(canvas,result.pages[page],page,result.pages.length,{fontFamily:fonts[result.font]})).then(toBlob).then(blob=>{if(disposed)return;url=URL.createObjectURL(blob);setImage({url,blob,name:shareFilename(result.title,page,result.pages.length)});},error=>{if(!disposed)setError(error?.message||String(error));}).finally(()=>{canvas.width=0;canvas.height=0;if(!disposed)setWorking(false);});
  return()=>{disposed=true;if(url)URL.revokeObjectURL(url);};
 },[result,page]);
 const generate=()=>{
  setError('');setNotice('');const text=range==='selection'?selectionText:content;
  if(!text.trim()){setError(range==='selection'?'请先在正文中选择要分享的文字。':'本章还没有正文。');return;}
  if(text.length>300000){setError('正文过长，请选择较短选区分次生成（每次最多 30 万字符）。');return;}
  try{const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)throw new Error('当前宿主不支持图片绘制。');context.font=`${fontSize}px ${fonts[font]}`;const lines=wrapShareText(text,920,value=>context.measureText(value).width);context.font=`600 ${Math.ceil(fontSize*1.3)}px ${fonts[font]}`;const titleLines=includeTitle&&title?wrapShareText(title,920,value=>context.measureText(value).width):[];const pages=paginateShareLines(lines,{fontSize,titleLines});if(pages.length>300)throw new Error('正文过长，请选择较短的选区分次导出。');setPage(0);setResult({pages,title,font,range});}catch(error){setError(error?.message||String(error));}
 };
 const canShare=!!image&&typeof File==='function'&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[new File([image.blob],image.name,{type:'image/png'})]});
 const share=async()=>{if(!image)return;setError('');try{await navigator.share({files:[new File([image.blob],image.name,{type:'image/png'})],title:result.title||'正文分享'});if(alive.current)setNotice('已交给系统分享面板。');}catch(error){if(alive.current&&error?.name!=='AbortError')setError('当前宿主未完成分享，请使用图片下载链接或长按图片保存。');}};
 return <><style>{efficiencyStyle}</style><div className="long-image-settings">
  <p className="efficiency-note">使用当前编辑稿生成静态图片，不修改正文，也不要求覆盖云端版本。图片分页生成，避免超长画布失败。</p>
  <label className="efficiency-setting-row"><span>分享范围</span><select aria-label="长图分享范围" value={range} onChange={e=>setRange(e.target.value)}><option value="chapter">整章正文</option><option value="selection" disabled={!selectionText}>当前选区{selectionText?'':'（先在正文选字）'}</option></select></label>
  <label className="efficiency-setting-row"><span>包含章节标题</span><input type="checkbox" checked={includeTitle} onChange={e=>setIncludeTitle(e.target.checked)}/></label>
  <label className="efficiency-setting-row"><span>图片字体</span><select aria-label="长图字体" value={font} onChange={e=>setFont(e.target.value)}><option value="serif">衬线 / 宋体</option><option value="sans">无衬线 / 黑体</option></select></label>
  <label className="efficiency-setting-row"><span>图片字号</span><select aria-label="长图字号" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}><option value={32}>小 · 32</option><option value={40}>标准 · 40</option><option value={48}>大 · 48</option></select></label>
  <div className="efficiency-actions"><button type="button" onClick={generate} disabled={working}>生成预览</button></div>
  {working&&<p className="efficiency-note" role="status">正在生成第 {page+1} 张图片…</p>}{error&&<p className="efficiency-error" role="alert">{error}</p>}
  {result&&<><p className="efficiency-note">共 {result.pages.length} 张 · 每张宽 1080px，高不超过 3600px。预览为生成时的{result.range==='selection'?'选区':'编辑稿'}快照；设置调整后请重新生成。</p><div className="efficiency-actions"><button type="button" disabled={working||page===0} onClick={()=>setPage(n=>n-1)}>上一张</button><span style={{alignSelf:'center',fontSize:12}}>{page+1} / {result.pages.length}</span><button type="button" disabled={working||page===result.pages.length-1} onClick={()=>setPage(n=>n+1)}>下一张</button></div></>}
  {image&&<div className="long-image-preview"><figure><img src={image.url} alt={`正文分享图片，第 ${page+1} 张，共 ${result.pages.length} 张`}/><figcaption><a href={image.url} download={image.name}>下载第 {page+1} 张</a>{canShare&&<button type="button" onClick={share}>系统分享</button>}</figcaption></figure><p className="efficiency-note">若宿主阻止下载，可长按预览图片保存；是否支持保存 / 系统分享由宿主决定。</p></div>}
  {notice&&<p className="efficiency-note" role="status">{notice}</p>}
 </div></>;
}
