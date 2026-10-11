import {isReadAction} from '../vendor/cuigengji/src/contracts/actions.js';

const transient=error=>!['FORBIDDEN','UNAUTHORIZED','VERSION_CONFLICT','CONFLICT'].includes(error?.code)
  && /failed to fetch|networkerror|network request failed|fetch failed|http\s+(502|503|504)\b/i.test(error?.message||'');

// Only coalesce pending reads; completed results are never cached as current revisions.
// Writes bypass the retry path because a lost reply does not mean a save failed.
export function createReliableRpc(invoke,{sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  const pending=new Map(),queue=[];let active=0;
  async function acquire(){if(active<2){active++;return;}await new Promise(resolve=>queue.push(resolve));}
  function release(){const next=queue.shift();if(next)next();else active--;}
  async function read(action,args){
    await acquire();
    try{
      for(let attempt=0;;attempt++){
        try{return await invoke(action,args);}catch(error){
          if(!transient(error))throw error;
          if(attempt===2)throw Object.assign(new Error('连接暂时中断，自动重试后仍未恢复。请点重试；已保存资料和当前草稿仍保留。',{cause:error}),{code:'TEMPORARY_CONNECTION'});
          await sleep([400,1200][attempt]);
        }
      }
    }finally{release();}
  }
  return (action,args={})=>{
    if(!isReadAction(action))return invoke(action,args);
    const key=JSON.stringify([action,args]);
    if(pending.has(key))return pending.get(key);
    const request=read(action,args).finally(()=>pending.delete(key));
    pending.set(key,request);return request;
  };
}
