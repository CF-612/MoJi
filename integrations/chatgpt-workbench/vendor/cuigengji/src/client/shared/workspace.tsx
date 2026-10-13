import React, {useLayoutEffect, useRef, useState} from 'react';
export function DocumentTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [focused,setFocused]=useState(false),[selection,setSelection]=useState(false),[clipboardError,setClipboardError]=useState('');
  const selected=()=>{const el=ref.current;setSelection(!!el&&el.selectionEnd>el.selectionStart);};
  const clipboard=async(mode:'copy'|'cut'|'paste'|'all')=>{
    const el=ref.current;if(!el)return;setClipboardError('');
    if(mode==='all'){el.focus();el.select();selected();return;}
    const before=el.value,start=el.selectionStart,end=el.selectionEnd;
    try{
      let insert='';
      if(mode==='paste')insert=await navigator.clipboard.readText();
      else await navigator.clipboard.writeText(before.slice(start,end));
      if(mode==='copy')return;
      if(el.value!==before||el.selectionStart!==start||el.selectionEnd!==end)throw new Error('选区已变化，请重新选择。');
      const next=before.slice(0,start)+insert+before.slice(end);
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(el,next);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.focus();el.setSelectionRange(start+insert.length,start+insert.length);selected();
    }catch{setClipboardError('宿主未允许剪贴板访问；原文保留。请使用系统菜单或键盘的剪贴板。');}
  };
  const fit = () => {const el=ref.current;if(el){el.style.height='0px';el.style.height=`${el.scrollHeight}px`;}};
  useLayoutEffect(fit,[props.value]);
  useLayoutEffect(()=>{const el=ref.current;if(!el)return;let width=0;const observer=new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(next!==width){width=next;fit();}});observer.observe(el);return()=>observer.disconnect();},[]);
  // 保留手机工具栏的占位，避免失焦时保存按钮在按下与抬起之间移动。
  return <div className="document-text-field" onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false);}}><textarea {...props} ref={ref} style={{...props.style,overflow:'hidden',resize:'none'}} onFocus={e=>{setFocused(true);props.onFocus?.(e);}} onSelect={e=>{selected();props.onSelect?.(e);}} onContextMenu={e=>{e.stopPropagation();props.onContextMenu?.(e);}}/><div className="text-selection-tools" aria-label="文字编辑工具" aria-hidden={!focused} style={{visibility:focused?'visible':'hidden'}}><button type="button" disabled={!selection} onPointerDown={e=>e.preventDefault()} onClick={()=>void clipboard('copy')}>复制</button><button type="button" disabled={!selection||props.disabled||props.readOnly} onPointerDown={e=>e.preventDefault()} onClick={()=>void clipboard('cut')}>剪切</button><button type="button" disabled={props.disabled||props.readOnly} onPointerDown={e=>e.preventDefault()} onClick={()=>void clipboard('paste')}>粘贴</button><button type="button" onPointerDown={e=>e.preventDefault()} onClick={()=>void clipboard('all')}>全选</button></div>{clipboardError&&<small role="status">{clipboardError}</small>}</div>;
}
export function ViewSwitch({value,change,graph}: {value:string;change:(value:string)=>void;graph:string}) {
  return <div className="segmented" aria-label="显示方式"><button aria-pressed={value==='list'} onClick={()=>change('list')}>列表</button><button aria-pressed={value==='canvas'} onClick={()=>change('canvas')}>{graph}</button></div>;
}
export function FilterControl({label,value,change,children}: {label:string;value:string;change:(v:string)=>void;children:React.ReactNode}) {
  return <label className={`filter-control ${value?'is-active':''}`}><span className="filter-prefix">{label}</span><select aria-label={label} value={value} onChange={e=>change(e.target.value)}>{children}</select><span className="filter-chevron" aria-hidden="true"/></label>;
}
export function SearchControl({label,value,change}:{label:string;value:string;change:(value:string)=>void}) {
  const [open,setOpen]=useState(false);
  return <div className="graph-search"><button aria-label={label} aria-expanded={open||Boolean(value)} onClick={()=>{if(open||value){change('');setOpen(false);}else setOpen(true);}}>{open||value?'收起搜索':'搜索'}</button>{(open||value)&&<input autoFocus className="module-search" aria-label={label} placeholder="标题、摘要" value={value} onChange={e=>change(e.target.value)}/>}</div>;
}
