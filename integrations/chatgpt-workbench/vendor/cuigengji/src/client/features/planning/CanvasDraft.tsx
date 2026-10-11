import React, {useRef, useState} from 'react';
import {useDraft} from '../../shared/state.js';
import type {Point} from '../../../contracts/planning.ts';

export interface CanvasCreation {
  key:string;kind:'scene'|'note'|'frame';position:Point;pageId:string|null;
  title?:string;summary?:string;content?:string;width?:number;height?:number;
  source?:{id:string;revision:number;title:string;groupId:string|null};side?:'in'|'out';groupId?:string|null;
}
export interface CanvasDraftValue {title:string;summary:string;content:string;groupId:string|null}
export function CanvasDraft({creation,draftKey,busy,save,close}: {
  creation:CanvasCreation;draftKey:string;busy:boolean;
  save:(value:CanvasDraftValue,requestId:string)=>Promise<boolean|undefined>;close:()=>void;
}) {
  const initial={title:creation.title||'',summary:creation.summary||'',content:creation.content||'',groupId:creation.groupId||creation.source?.groupId||null};
  const {value,change,accept,cacheError}=useDraft(draftKey,initial);
  const [error,setError]=useState(''),[submitted,setSubmitted]=useState(false);
  const request=useRef({id:crypto.randomUUID(),value:null as CanvasDraftValue|null});
  const scene=creation.kind==='scene';
  const cancel=()=>{if(busy)return;accept(initial);close();};
  const submit=async()=>{
    if(busy)return;
    if(scene&&!value.title.trim()){setError('请填写情节标题');return;}
    if(!scene&&!value.title.trim()&&!value.content.trim()){cancel();return;}
    const submittedValue:CanvasDraftValue=request.current.value||{...value,title:value.title.trim()};
    request.current.value=submittedValue;setSubmitted(true);setError('');
    if(await save(submittedValue,request.current.id)){accept(initial);close();}
    else setError('保存未完成，内容已保留。请重试。');
  };
  const field=(key:string,text:string)=>change((old:CanvasDraftValue)=>({...old,[key]:text}));
  return <section className={`canvas-draft draft-${creation.kind}`} data-graph-editor="true" aria-label={scene?'新建情节卡片':creation.kind==='frame'?'新建讨论框':'新建便签'} style={{left:creation.position.x,top:creation.position.y}}
    onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} onContextMenu={e=>{e.preventDefault();e.stopPropagation();}}
    onKeyDown={e=>{
      if(e.nativeEvent.isComposing)return;
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cancel();}
      if(e.key==='Enter'&&(e.ctrlKey||e.metaKey||(e.target as HTMLElement).tagName==='INPUT')){e.preventDefault();e.stopPropagation();void submit();}
    }}>
    {creation.source&&<small className="draft-origin">{creation.side==='in'?'补充前置':'接着推进'} · {creation.source.title}</small>}
    <input autoFocus aria-label={scene?'情节标题':creation.kind==='frame'?'讨论框标题':'便签标题'} placeholder={scene?'这个情节叫什么？':creation.kind==='frame'?'讨论区域':'便签标题（可选）'} value={value.title} disabled={busy||submitted} onChange={e=>field('title',e.target.value)}/>
    <textarea aria-label={scene?'情节摘要':'批注内容'} rows={scene?2:3} placeholder={scene?'一句话记录这件事（可选）':'记下想法、疑问或台词…'} value={scene?value.summary:value.content} disabled={busy||submitted} onChange={e=>field(scene?'summary':'content',e.target.value)}/>
    <footer><button type="button" disabled={busy} onClick={cancel}>取消</button><button type="button" className="primary" disabled={busy||(scene&&!value.title.trim())} onClick={()=>void submit()}>{submitted?'重试保存':'创建'}</button></footer>
    {(error||cacheError)&&<p className="draft-error" role="alert">{error||cacheError}</p>}
  </section>;
}
