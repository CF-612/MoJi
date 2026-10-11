import React from 'react';

interface Item {id:string;title:string;deleted?:boolean;textCount?:number}
export function DirectoryRow({chapter,selected,dragging,before,disabled,dragProps,open,remove,restore}: {
  chapter:Item;selected:boolean;dragging?:boolean;before?:boolean;disabled:boolean;
  dragProps?:React.HTMLAttributes<HTMLElement>;open:()=>void;remove:()=>void;restore:()=>void;
}) {
  return <div {...dragProps} data-chapter-id={chapter.id} onClick={()=>{if(!disabled)open();}} className={`chapter-item ${selected?'selected':''} ${chapter.deleted?'is-deleted':''} ${dragging?'is-dragging':''} ${before?'chapter-drop-before':''}`}>
    {!chapter.deleted&&<span className="chapter-grip" aria-hidden="true" title="拖动调整顺序">⠿</span>}
    <button type="button" className="chapter-open" aria-disabled={disabled} aria-pressed={selected} aria-description={chapter.deleted?undefined:'可拖动调整顺序，也可按 Alt 加上下方向键'}>
      <span>{chapter.title}</span><small title="已保存正文的字数，含标点、不计空白">{Number.isFinite(chapter.textCount)?chapter.textCount!.toLocaleString('zh-CN'):'—'} 字</small>
    </button>
    <button type="button" className="chapter-row-action" disabled={disabled} aria-label={`${chapter.deleted?'恢复':'移入回收站'} ${chapter.title}`} title={chapter.deleted?'恢复章节':'移入回收站'}
      onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(chapter.deleted)restore();else remove();}}>
      {chapter.deleted?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h10a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5"/></svg>:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 10v7M14 10v7"/></svg>}
    </button>
  </div>;
}
