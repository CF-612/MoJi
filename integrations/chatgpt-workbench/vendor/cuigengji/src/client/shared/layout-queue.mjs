// 连续布局操作合并保存；每次请求固定参数和 ID，失败重试不覆盖新草稿。
export function createLayoutQueue({persist,read=()=>null,write=()=>{},delay=1200,schedule=setTimeout,cancel=clearTimeout,onSaved=()=>{}}){
 const restored=read(),valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const clean=rows=>Object.fromEntries(Object.entries(rows||{}).filter(([id,v])=>id&&!['__proto__','constructor','prototype'].includes(id)&&valid(v.point)&&Number.isSafeInteger(v.revision)&&v.revision>0));
 let pending=clean(restored?.pending),flight=restored?.flight&&typeof restored.flight.requestId==='string'?{...restored.flight,rows:clean(restored.flight.rows)}:null;
 if(flight&&!Object.keys(flight.rows).length)flight=null;
 let timer=null,running=null,error=flight?'上次布局保存尚未确认，请重试核对。':'',errorCode=restored?.errorCode||'',known={},ack={},listeners=new Set();
 const snapshot=()=>({pending:structuredClone(pending),flight:flight&&structuredClone(flight),saving:!!running,error,errorCode,ack:structuredClone(ack),dirty:!!flight||!!Object.keys(pending).length});
 const emit=()=>{try{write({pending,flight,errorCode});}catch{error='无法保存本机布局草稿，请保持页面打开。';}for(const fn of listeners)fn(snapshot());};
 const arm=()=>{if(timer)cancel(timer);timer=schedule(()=>{timer=null;void flush();},delay);};
 const enqueue=(points,revisions)=>{
  for(const [id,point]of Object.entries(points)){
   if(!valid(point))throw new Error('布局坐标无效');
   const existing=pending[id],sent=flight?.rows[id];
   const revision=existing?.revision??(sent?sent.revision+1:known[id]??revisions[id]);
   if(!Number.isSafeInteger(revision)||revision<1)throw new Error('布局版本无效');
   pending[id]={point:{...point},revision};
  }
  emit();if(!error)arm();
 };
 async function flush(retry=false){
  if(timer){cancel(timer);timer=null;}
  if(running){await running;return error?false:flush(retry);}
  if(error&&!retry)return false;
  if(!flight){
   const entries=Object.entries(pending).slice(0,200);if(!entries.length)return true;
   flight={requestId:crypto.randomUUID(),rows:Object.fromEntries(entries)};
   for(const [id]of entries)delete pending[id];
  }
  const batch=flight;error='';errorCode='';
  const perform=async()=>{
   try{
    const points=Object.fromEntries(Object.entries(batch.rows).map(([id,v])=>[id,v.point]));
    const revisions=Object.fromEntries(Object.entries(batch.rows).map(([id,v])=>[id,v.revision]));
    const result=await persist(points,revisions,batch.requestId);
    if(result!==true)throw new Error('布局未保存，请重试。');
    for(const [id,v]of Object.entries(batch.rows)){
     known[id]=v.revision+1;ack[id]={point:v.point,revision:known[id]};
     if(pending[id])pending[id].revision=known[id];
    }
    flight=null;onSaved();return true;
   }catch(e){error=e.message||'布局未保存，请重试。';errorCode=e.code||'';return false;}
  };
  // 先建立运行状态，再通知订阅者，防止同步刷新触发第二次请求。
  running=Promise.resolve().then(perform);emit();
  const ok=await running;running=null;emit();
  if(ok&&Object.keys(pending).length)arm();
  return ok;
 }
 return {snapshot,enqueue,flush,retry:()=>flush(true),
  subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);},
  sync(nodes){for(const n of nodes){if(!pending[n.id]&&!flight?.rows[n.id])known[n.id]=Math.max(known[n.id]||0,n.revision);if(ack[n.id]&&n.revision>=ack[n.id].revision)delete ack[n.id];}},
  points(){return {...Object.fromEntries(Object.entries(ack).map(([id,v])=>[id,v.point])),...Object.fromEntries(Object.entries(flight?.rows||{}).map(([id,v])=>[id,v.point])),...Object.fromEntries(Object.entries(pending).map(([id,v])=>[id,v.point]))};},
  discard(){if(running)return false;if(timer)cancel(timer);timer=null;pending={};flight=null;error='';ack={};emit();return true;},
  rebase(nodes){
   if(running||errorCode!=='CONFLICT')return false;
   const targets={...flight?.rows,...pending},latest=new Map(nodes.map(n=>[n.id,n]));
   if(Object.keys(targets).some(id=>!latest.has(id)||latest.get(id).deleted))return false;
   pending=Object.fromEntries(Object.entries(targets).map(([id,v])=>[id,{point:v.point,revision:latest.get(id).revision}]));
   flight=null;error='';errorCode='';known={};emit();return true;
  },
  setPersist(fn){persist=fn;},setOnSaved(fn){onSaved=fn;},
 };
}

// 同一画布重开复用队列，避免离开页签后的请求与新队列重复保存。
const queues=new Map();
export function sharedLayoutQueue(key,options){
 if(!queues.has(key))queues.set(key,createLayoutQueue(options));
 const queue=queues.get(key);queue.setPersist(options.persist);queue.setOnSaved(options.onSaved||(()=>{}));return queue;
}
