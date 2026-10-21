import {createPortal} from 'react-dom';
import React,{createContext,useContext,useEffect,useRef,useState} from 'react';

export const DesktopToolsContext=createContext<{wide:boolean;mount:HTMLElement|null}>({wide:false,mount:null});
/** Size follows the workbench, so a narrow desktop sidebar stays compact. */
export function WorkspaceTools({children}:{children:React.ReactNode}){
 const ref=useRef<HTMLDivElement>(null),[wide,setWide]=useState(false),[mount,setMount]=useState<HTMLElement|null>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setWide(entry.contentRect.width>=1000));observer.observe(el);return()=>observer.disconnect();},[]);
 return <DesktopToolsContext.Provider value={{wide,mount}}><div ref={ref} className="responsive-workspace" data-wide={wide}>{children}<div ref={setMount} className="desktop-tools-strip" role="region" aria-label="工作台工具" hidden={!wide}/></div></DesktopToolsContext.Provider>;
}

export function WorkspaceNavigation({children}:{children:React.ReactNode}){
 const desktop=useContext(DesktopToolsContext);
 return desktop.wide&&desktop.mount?createPortal(<div className="desktop-workspace-navigation">{children}</div>,desktop.mount):<>{children}</>;
}
