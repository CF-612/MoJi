import React from 'react';
import {chapterDisplayTitle} from './chapter-display-title.mjs';

// Display only: numbering and book brackets never change the saved manuscript.
export function ChapterFooter({novelTitle,chapterTitle,ordinal,numbering,showInfo,wordCount,status,problem,error,retry}) {
 const title=chapterDisplayTitle(chapterTitle,ordinal,numbering);
 const book=novelTitle?`《${novelTitle}》`:'未命名作品';
 const saved=status==='已保存';
 return <footer className="savebar auto-savebar chapter-footer" data-problem={problem}>
   {showInfo&&<div className="chapter-bookinfo" aria-label="当前作品与章节">
     <span className="chapter-bookinfo-book" title={book}>{book}</span>
     <span className="chapter-bookinfo-chapter" title={title}>{title}</span>
     {wordCount&&<span className="chapter-bookinfo-count">{wordCount}</span>}
   </div>}
   <div role="status" className={`chapter-save-status ${error?'error-text':'muted'}`} data-expanded={problem} title={status}>
     {saved?<><span aria-hidden="true" className="chapter-saved-mark">✓</span><span className="sr-only">已保存</span></>:status}
   </div>
   {retry&&<button className="chapter-save-retry" onClick={retry}>重试保存</button>}
 </footer>;
}
