import React,{useState} from 'react';

/** One mobile entry; desktop controls remain directly available. */
export function CompactTools({label='工具与筛选',children}:{label?:string;children:React.ReactNode}){
 const [open,setOpen]=useState(false);
 return <div className="compact-tools" data-open={open}>
  <button className="compact-tools-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>{label}<span aria-hidden="true">{open?' −':' ＋'}</span></button>
  <div className="compact-tools-content">{children}</div>
 </div>;
}
