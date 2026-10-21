import React,{useState} from 'react';
import {BookCover} from '../../shared/presentation.tsx';
import {Icon} from '../../shared/icons.tsx';
import {useResource} from '../../shared/state.js';
export function Welcome({books,busy,onOpen,onCreate,onImport,onManage,call,tick}:any){
 const [query,setQuery]=useState(''),[expanded,setExpanded]=useState(false);
 const matching=[...books].sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).filter(b=>b.title.toLowerCase().includes(query.toLowerCase().trim()));
 const visible=query||expanded?matching:matching.slice(0,6);
 const stats=useResource(()=>Promise.all(visible.map(async b=>{try{return [b.id,await call('writing.stats.get',{novelId:b.id})];}catch{return [b.id,null];}})).then(Object.fromEntries),[call,tick,visible.map(b=>b.id).join(',')]);
 return <div className="welcome-scroll"><div className="welcome-document shelf-document"><header className="shelf-heading"><span className="shelf-ghost" aria-hidden="true">STORIES</span><h1>我的作品</h1><button className="primary" disabled={busy} onClick={onCreate}><Icon name="plus"/>新建</button></header>
  <div className="shelf-tools">{books.length>6&&<input type="search" aria-label="查找作品" placeholder="查找作品" value={query} onChange={e=>setQuery(e.target.value)}/>}<button disabled={busy} onClick={onImport}>导入 / 导出</button><button disabled={busy} onClick={onManage}>作品与备份 <Icon name="arrow"/></button></div>
  <section className="cover-shelf" aria-label="我的作品">{visible.map(book=><button key={book.id} className="shelf-book" disabled={busy} onClick={()=>onOpen(book.id)}><BookCover book={book}/><strong>{book.title}</strong><span>{[book.genre,book.workStatus||'创作中'].filter(Boolean).join(' · ')}</span><small>{stats.value?.[book.id]?`${stats.value[book.id].words.toLocaleString('zh-CN')} 字 · ${stats.value[book.id].chapters} 章`:book.updatedAt?new Date(book.updatedAt).toLocaleDateString('zh-CN')+' 更新':'打开作品'}</small></button>)}<button className="shelf-book shelf-new" disabled={busy} onClick={onCreate}><span className="book-cover"><Icon name="plus"/></span><strong>新建作品</strong></button></section>
  {query&&!matching.length&&<p className="empty">没有找到这部作品，试试其他关键词。</p>}{!query&&!expanded&&matching.length>6&&<button className="welcome-expand" onClick={()=>setExpanded(true)}>查看其余 {matching.length-6} 部作品</button>}
  <div className="shelf-triangles" aria-hidden="true"><i/><i/><i/></div></div></div>;
}
