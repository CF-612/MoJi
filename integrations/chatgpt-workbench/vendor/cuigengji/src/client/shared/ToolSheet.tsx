import {createPortal} from 'react-dom';
import {DesktopToolsContext} from './WorkspaceTools.tsx';
import React,{useState,useContext,useEffect} from 'react';
import {Modal} from './preferences.tsx';
import {Icon,type IconName} from './icons.tsx';

/** 复杂工具（筛选表单、更多操作）收进一颗按钮的下拉面板，避免整排控件摊在顶部。 */
export function ToolPanel({label,title=label,icon='more',wide=false,children}:{label:string;title?:string;icon?:IconName;wide?:boolean;children:React.ReactNode}){
 const desktop=useContext(DesktopToolsContext);
 const body=<details className="menu tool-panel"><summary className="tool-trigger" aria-label={label} title={title}><Icon name={icon}/><span>{label}</span></summary><div className={`menu-panel${wide?' is-wide':''}`}>{children}</div></details>;
 return desktop.wide&&desktop.mount?createPortal(body,desktop.mount):body;
}

/** Tools use the dialog top layer: never stack floating menus over each other. */
export function ToolMenu({label,icon='plus',primary=false,items}:{label:string;icon?:IconName;primary?:boolean;items:{label:string;action:()=>void;disabled?:boolean}[]}){
 // 只有一种可创建内容时直接执行，不再让作者多点一层；宽屏时随工具条挂到顶部。
 const desktop=useContext(DesktopToolsContext);
 const triggerClass=`tool-trigger ${primary?'primary':''}`;
 const body=items.length===1
  ? <button type="button" className={triggerClass} aria-label={label} title={items[0].label} disabled={items[0].disabled} onClick={()=>items[0].action()}><Icon name={icon}/><span>{label}</span></button>
  : <details className="menu tool-menu"><summary className={triggerClass} aria-label={label} title={label}><Icon name={icon}/><span>{label}</span></summary><div className="menu-panel">{items.map(item=><button key={item.label} type="button" disabled={item.disabled} onClick={()=>item.action()}>{item.label}</button>)}</div></details>;
 return desktop.wide&&desktop.mount?createPortal(body,desktop.mount):body;
}

export function ToolSheet({label,title=label,icon='more',primary=false,text=false,dismissOnAction=false,desktopInline=false,controlledOpen,onOpenChange,guide,children}:{label:string;title?:string;icon?:IconName;primary?:boolean;text?:boolean|string;dismissOnAction?:boolean;desktopInline?:boolean;controlledOpen?:boolean;onOpenChange?:(open:boolean)=>void;guide?:React.ReactNode;children:React.ReactNode}){
 const [localOpen,setLocalOpen]=useState(false),desktop=useContext(DesktopToolsContext);
 const open=controlledOpen??localOpen,setOpen=(value:boolean)=>{if(controlledOpen===undefined)setLocalOpen(value);onOpenChange?.(value);};
 const expanded=desktopInline&&desktop.wide&&!!desktop.mount;
 useEffect(()=>{if(expanded)setOpen(false);},[expanded]);
 if(expanded)return createPortal(<section className="desktop-tool-section"><h3>{title}</h3><div className="sheet-actions">{children}</div></section>,desktop.mount!);
 return <><button type="button" className={`tool-trigger ${primary?'primary':''}`} aria-label={label} aria-expanded={open} title={label} onClick={()=>{document.querySelectorAll('details.menu[open]').forEach(el=>el.removeAttribute('open'));setOpen(true);}}><Icon name={icon}/>{text&&<span>{typeof text==='string'?text:label}</span>}</button>
 {open&&<Modal title={title} close={()=>setOpen(false)} className="tool-sheet">{guide}<div className="sheet-actions" onClick={e=>{if(dismissOnAction&&(e.target as Element).closest('button')){setLocalOpen(false);if(controlledOpen===undefined)onOpenChange?.(false);}}}>{children}</div></Modal>}</>;
}
