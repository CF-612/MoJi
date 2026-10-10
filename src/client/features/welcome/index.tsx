import React, {useState} from 'react';
import avatar from '../../assets/avatar.png';

interface Book {id: string; title: string; updatedAt?: string}
interface Props {books: Book[]; busy: boolean; onOpen: (id: string) => unknown; onCreate: () => unknown; onImport: () => unknown; onManage: () => unknown}

function updated(value?: string) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? `${date.getMonth() + 1}月${date.getDate()}日更新` : '打开作品';
}

/** A useful landing page: start a story or open an existing one in one click. */
export function Welcome({books, busy, onOpen, onCreate, onImport, onManage}: Props) {
  const [query, setQuery] = useState(''), [expanded, setExpanded] = useState(false);
  const sorted = [...books].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const matching = sorted.filter(book => book.title.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = query || expanded ? matching : matching.slice(0, 6);
  return <div className="welcome-scroll"><div className="welcome-document">
    <section className="welcome-hero" aria-label="欢迎使用催更姬">
      <img className="welcome-avatar" src={avatar} width={180} height={180} alt="催更姬头像，抱着玩偶的紫发少女"/>
      <div className="welcome-intro"><span className="welcome-brand">催更姬 <span>· 你的写作助手</span></span>
        <h1>{books.length ? '故事，等你继续。' : '你的故事，从这里开始。'}</h1>
        <p>写正文，聊情节，整理人物与世界。<br/>和 AI 一起，把脑海里的故事写下来。</p>
        <div className="welcome-actions"><button className="primary" disabled={busy} onClick={onCreate}>＋ 新建作品</button><button disabled={busy} onClick={onImport}>导入 / 导出</button></div>
      </div>
    </section>
    {books.length > 0 ? <section className="welcome-library" aria-label="我的作品">
      <header><h2>我的作品 <span>{books.length}</span></h2><div className="welcome-library-tools">{books.length > 6 && <input type="search" aria-label="查找作品" placeholder="查找作品…" value={query} onChange={event => setQuery(event.target.value)}/>}<button disabled={busy} aria-label="作品管理" onClick={onManage}>作品管理 <span aria-hidden="true">↗</span></button></div></header>
      <div className="welcome-books">{visible.map(book => <button key={book.id} className="welcome-book" disabled={busy} onClick={() => onOpen(book.id)}>
        <span className="welcome-book-mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h13a1 1 0 0 1 1 1v16H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z"/><path d="M3 17a2 2 0 0 1 2-2h14M7 7h7M7 10h5"/></svg></span>
        <span className="welcome-book-copy"><strong>{book.title}</strong><small>{updated(book.updatedAt)}</small></span><span className="welcome-book-arrow" aria-hidden="true">↗</span>
      </button>)}</div>
      {!matching.length && <p className="welcome-no-match">没找到这部作品，试试其他关键词。</p>}
      {!query && !expanded && matching.length > 6 && <button className="welcome-expand" onClick={() => setExpanded(true)}>查看其余 {matching.length - 6} 部作品 ↓</button>}
    </section> : <section className="welcome-start" aria-label="开始写作"><span className="welcome-start-line" aria-hidden="true"/><p>不用准备完所有设定。<br/><strong>先写下第一个念头，故事会慢慢长出来。</strong></p></section>}
    <footer className="welcome-footer">{!books.length?<button className="welcome-expand" onClick={onManage} disabled={busy}>作品管理</button>:<><span>正文</span><i aria-hidden="true"/><span>情节规划</span><i aria-hidden="true"/><span>人物与世界</span></>}<small>你的故事，你做主。</small></footer>
  </div></div>;
}
