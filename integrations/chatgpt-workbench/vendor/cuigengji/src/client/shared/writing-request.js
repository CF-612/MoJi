import {useRef} from 'react';
// Keep one identity for a retry of the same intent, including after a lost reply.
export function useWritingRequest(call){const pending=useRef(null);return(action,args)=>{const signature=JSON.stringify({action,args});if(pending.current?.signature!==signature)pending.current={signature,id:crypto.randomUUID()};return call(action,{...args,requestId:pending.current.id});};}
