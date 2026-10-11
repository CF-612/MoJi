import React,{createContext,useContext,useRef,useState} from 'react';

export type Reference={kind:string;novelId:string;id?:string;title?:string;revision?:number;dirty?:boolean;pageId?:string|null};
export const CollaborationContext=createContext<null|((reference:Reference,selection:string)=>Promise<string>)>(null);
export function ReferenceButton({reference}:{reference:Reference}) {
  const send=useContext(CollaborationContext),selection=useRef('');
  const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  if(!send)return null;
  const capture=()=>{
    const element=document.activeElement;
    selection.current=element instanceof HTMLTextAreaElement||element instanceof HTMLInputElement
      ?element.value.slice(element.selectionStart??0,element.selectionEnd??0):window.getSelection()?.toString()||'';
  };
  return <div className="collaboration-entry"><button type="button" disabled={busy} onPointerDown={capture} onClick={async()=>{
    setBusy(true);setStatus('正在交给当前聊天…');
    try{setStatus(await send(reference,selection.current));}
    catch(error){setStatus(`发送失败：${(error as Error).message}`);}finally{setBusy(false);}
  }}>围绕此内容讨论</button><small role="status">{status}</small></div>;
}
