import React,{useRef,useState} from 'react';
import coverA from '../assets/cover-a.jpg';
import coverB from '../assets/cover-b.jpg';
import coverC from '../assets/cover-c.jpg';
import {Icon} from './icons.tsx';
import {Modal} from './preferences.tsx';

const covers=[coverA,coverB,coverC];
function coverIndex(id=''){let value=0;for(const c of id)value=(value*31+c.charCodeAt(0))>>>0;return value%covers.length;}
export function BookCover({book,onClick,disabled=false}:{book:any;onClick?:()=>void;disabled?:boolean}){
 const image=<img src={book.coverImage||covers[coverIndex(book.id)]} alt={`${book.title||'新作品'}封面`} className={book.coverMode==='pixel'?'pixel-cover':''}/>;
 return onClick?<button className="book-cover" aria-label={`替换 ${book.title||'新作品'} 的封面`} onClick={onClick} disabled={disabled}>{image}</button>:<span className="book-cover">{image}</span>;
}
export async function readImage(file:File){
 if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>1024*1024)throw new Error('请选择不超过 1 MB 的 PNG、JPEG、WebP 或 GIF。原图直接保存，不缩小或压缩。');
 return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('图片读取失败'));reader.readAsDataURL(file);});
}
export function ImageUpload({value,onChange,label,disabled=false,children}:{value?:string|null;onChange:(value:string)=>void|Promise<void>;label:string;disabled?:boolean;children?:React.ReactNode}){
 const input=useRef<HTMLInputElement>(null),[error,setError]=useState(''),[reading,setReading]=useState(false);
 return <div className="image-upload"><button type="button" className="image-upload-trigger" aria-label={label} disabled={disabled||reading} onClick={()=>input.current?.click()}>{children||<><Icon name="plus"/>{label}</>}</button><input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={async e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(!file)return;setError('');setReading(true);try{await onChange(await readImage(file));}catch(err){setError((err as Error).message);}finally{setReading(false);}}}/>{error&&<p className="notice error" role="alert">{error}</p>}</div>;
}
export function NovelForm({initial={},busy,close,save}:{initial?:any;busy:boolean;close:()=>void;save:(value:any)=>Promise<unknown>}){
 const [value,setValue]=useState({title:initial.title||'',description:initial.description||'',genre:initial.genre||'',workStatus:initial.workStatus||'创作中',coverImage:initial.coverImage||null,coverMode:initial.coverMode||'auto'});
 const [choosingCover,setChoosingCover]=useState(false);
 const [error,setError]=useState('');const set=(key:string,v:any)=>setValue(old=>({...old,[key]:v}));
 return <Modal title={initial.id?'作品详情':'新建作品'} close={close} className="novel-form-modal"><form className="novel-form" onSubmit={async e=>{e.preventDefault();setError('');try{const result=await save(value);if(result===false)throw new Error('保存未完成，请检查连接或版本冲突后重试。输入内容仍保留。');}catch(err){setError((err as Error).message);}}}>
  <div className="novel-form-cover"><div className="novel-cover-choice"><button type="button" className="cover-choice-trigger" aria-label="选择作品封面" aria-expanded={choosingCover} disabled={busy} onClick={()=>setChoosingCover(v=>!v)}><BookCover book={{...initial,...value}}/><small>点击选择封面</small></button></div><div><label>书名<input required value={value.title} onChange={e=>set('title',e.target.value)}/></label><label>类型<input maxLength={80} value={value.genre} placeholder="长篇小说、奇幻……" onChange={e=>set('genre',e.target.value)}/></label></div></div>
  {choosingCover&&<section className="cover-picker" aria-label="封面选择"><div className="row"><strong className="grow">选择封面</strong><ImageUpload label="上传自己的封面" disabled={busy} onChange={image=>{set('coverImage',image);setChoosingCover(false);}}/></div><div className="cover-picker-options">{covers.map((image,i)=><button type="button" key={i} aria-label={`使用内置封面 ${i+1}`} aria-pressed={value.coverImage===image||!value.coverImage&&i===coverIndex(initial.id)} disabled={busy} onClick={()=>{set('coverImage',image);setChoosingCover(false);}}><img src={image} alt={`内置封面 ${i+1}`}/></button>)}</div></section>}
  <label>简介<textarea value={value.description} onChange={e=>set('description',e.target.value)}/></label><label>创作状态<input maxLength={80} value={value.workStatus} onChange={e=>set('workStatus',e.target.value)}/></label>
  <label className="inline-check"><input type="checkbox" checked={value.coverMode==='pixel'} onChange={e=>set('coverMode',e.target.checked?'pixel':'auto')}/>像素图封面（保留清晰像素边缘）</label>
  {error&&<p className="notice error" role="alert">{error}</p>}<div className="row"><button className="primary" disabled={busy||!value.title.trim()} type="submit">{initial.id?'保存详情':'创建作品'}</button><button type="button" onClick={close}>取消</button></div>
 </form></Modal>;
}
