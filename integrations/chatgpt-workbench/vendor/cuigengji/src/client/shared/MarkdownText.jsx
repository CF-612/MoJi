import React,{memo,useId,useState} from 'react';
import Markdown,{defaultUrlTransform} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {DocumentTextarea} from './workspace.tsx';
const plugins=[remarkGfm];
export function markdownUrl(value){
 const url=defaultUrlTransform(value).trim();
 if(url.startsWith('#'))return url;
 try{return ['http:','https:','mailto:'].includes(new URL(url).protocol)?url:'';}catch{return '';}
}
function Link({href,children}){return href?<a href={href} target={href.startsWith('#')?undefined:'_blank'} rel={href.startsWith('#')?undefined:'noopener noreferrer'}>{children}</a>:<span>{children}</span>;}
const components={
 a:Link,
 // Images remain explicit links; reading a card does not load external assets.
 img:({src,alt})=><span className="markdown-image">图片：<Link href={src}>{alt||'打开图片'}</Link></span>,
 table:({node,children,...props})=><div className="markdown-table-scroll" role="region" aria-label="Markdown 表格" tabIndex={0}><table {...props}>{children}</table></div>,
};
export const MarkdownText=memo(function MarkdownText({text='',className='',label}){
 return <div className={`markdown-reading ${className}`} aria-label={label}><Markdown remarkPlugins={plugins} urlTransform={markdownUrl} components={components}>{text}</Markdown></div>;
});
// Switching views never changes or normalizes the caller's original text.
export function MarkdownField({label,hint,value='',onChange,disabled,readOnly,className='',fieldClassName='',...props}){
 const id=useId(),[preview,setPreview]=useState(false);
 return <div className={`markdown-field ${fieldClassName}`}><div className="markdown-field-head"><label htmlFor={id}>{label}{hint&&<small>{hint}</small>}</label><div role="group" aria-label={`${label}显示方式`}><button type="button" aria-pressed={!preview} onClick={()=>setPreview(false)}>源码</button><button type="button" aria-pressed={preview} onClick={()=>setPreview(true)}>预览</button></div></div>{preview?<div className="markdown-field-preview" role="region" aria-label={`${label} Markdown 预览`}>{value?<MarkdownText text={value}/>:<p className="muted">尚未填写内容</p>}</div>:<DocumentTextarea {...props} id={id} aria-label={props['aria-label']||label} className={className} value={value} onChange={onChange} disabled={disabled} readOnly={readOnly}/>}</div>;
}
