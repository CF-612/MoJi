import React,{useEffect,useRef} from 'react';
interface Item {id:string;title:string;deleted?:boolean;textCount?:number}
export function DirectoryRow({chapter,ordinal,selected,dragging,before,disabled,dragProps,open,menu}: {
 chapter:Item;ordinal?:number;selected:boolean;dragging?:boolean;before?:boolean;disabled:boolean;
 dragProps?:React.HTMLAttributes<HTMLElement>;open:()=>void;menu:()=>void;
}){
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),held=useRef(false),start=useRef({x:0,y:0});
 const cancel=()=>{clearTimeout(timer.current);timer.current=undefined;};useEffect(()=>cancel,[]);
 const show=()=>{cancel();if(!disabled)menu();};
 return <div {...dragProps} data-chapter-id={chapter.id} className={`chapter-item ${selected?'selected':''} ${chapter.deleted?'is-deleted':''} ${dragging?'is-dragging':''} ${before?'chapter-drop-before':''}`}
  onPointerDown={e=>{held.current=false;start.current={x:e.clientX,y:e.clientY};if(e.pointerType==='touch'&&!disabled){cancel();timer.current=setTimeout(()=>{held.current=true;show();},550);}else dragProps?.onPointerDown?.(e);}}
  onPointerMove={e=>{if(Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>8)cancel();dragProps?.onPointerMove?.(e);}}
  onPointerUp={e=>{cancel();dragProps?.onPointerUp?.(e);}} onPointerCancel={e=>{cancel();dragProps?.onPointerCancel?.(e);}}
  onContextMenu={e=>{e.preventDefault();if(!held.current)show();}}
  onKeyDown={e=>{if(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10'){e.preventDefault();show();}else dragProps?.onKeyDown?.(e);}}
  onClick={()=>{if(held.current){held.current=false;return;}if(!disabled)open();}}>
  {selected&&<span className="chapter-current-triangle" aria-hidden="true">{ordinal??'▶'}</span>}
  <button type="button" className="chapter-open" aria-disabled={disabled} aria-pressed={selected} aria-description="手机长按、电脑右键打开章节操作；Shift+F10 也可打开">
   <span>{chapter.title}</span><small title="含标点、不计空白">{Number.isFinite(chapter.textCount)?chapter.textCount!.toLocaleString('zh-CN'):'—'} 字</small>
  </button>
 </div>;
}
