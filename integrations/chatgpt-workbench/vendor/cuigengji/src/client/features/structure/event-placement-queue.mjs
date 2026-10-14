import {chapterPlacement} from '../../../domain/event-placement.js';
import {placementArguments} from '../../../domain/placement-request.js';
import {timelineOrderScope} from '../../../domain/story-workspace.js';

// Preview only; server records and their CAS revisions remain authoritative.
export function previewPlacement(board,request){
 const events=board.events.map(e=>structuredClone(e)),next={...board,events},event=events.find(e=>e.id===request.id&&!e.deleted);
 if(!event)return next;
 if(request.view==='narration'){
  event.chapterRefs=chapterPlacement(board.chapters,event,request).chapterRefs;
 }else{
  const scope=timelineOrderScope(next,'story'),remaining=scope.filter(e=>e.id!==event.id);
  if(request.beforeEventId===event.id)return next;
  const target=request.beforeEventId===null?remaining.length:remaining.findIndex(e=>e.id===request.beforeEventId);
  if(target<0)return next;
  remaining.splice(target,0,event);
  if(remaining.every((e,i)=>e.id===scope[i].id))return next;
  // Freeze the same narration fallbacks as the server before changing story order.
  for(const chapter of board.chapters)timelineOrderScope(next,'narration',chapter.id).forEach((e,i)=>{e.chapterOrders={...e.chapterOrders,[chapter.id]:(i+1)*10};});
  timelineOrderScope(next,'narration').forEach((e,i)=>{e.narrationOrder=(i+1)*10;});
  remaining.forEach((e,i)=>{e.order=(i+1)*10;});
 }
 return next;
}
export function createPlacementQueue({send,read=()=>null,write=()=>{},saved=()=>{}}){
 const restored=read();let jobs=Array.isArray(restored?.jobs)?restored.jobs:[],known=restored?.known||{},ack={},running=null,error=jobs.length?'有上次未确认的位置调整，请重试保存。':'',listeners=new Set();
 const snapshot=()=>({jobs:structuredClone(jobs),saving:!!running,error});
 const emit=()=>{try{write({jobs,known});}catch{error='本机位置草稿保存失败，请保持页面打开。';}for(const fn of listeners)fn(snapshot());};
 const revision=(id,rev)=>{const seen=new Set();while(known[id]?.[rev]&&!seen.has(rev)){seen.add(rev);rev=known[id][rev];}return rev;};
 async function flush(retry=false){
  if(running)return running;if(error&&!retry)return false;if(!jobs.length)return true;
  error='';
  const perform=async()=>{
   while(jobs.length){const job=jobs[0];
    if(!job.args){const args=placementArguments(job.request);job.args={...args,expectedRevision:revision(args.id,args.expectedRevision),expectedOrder:args.expectedOrder.map(e=>({...e,revision:revision(e.id,e.revision)})),requestId:job.requestId,confirmed:true,reason:'作者直接拖动时间线事件位置'};emit();}
    try{
     const result=await send(job.args);
     for(const e of result.events||[]){const before=e.id===job.args.id?job.args.expectedRevision:job.args.expectedOrder.find(x=>x.id===e.id)?.revision;if(before!==undefined){known[e.id]||={};known[e.id][before]=e.revision;}ack[e.id]=e;}
     jobs.shift();emit();saved();
    }catch(e){error=e.message||'事件位置尚未保存，请重试。';return false;}
   }return true;
  };
  running=Promise.resolve().then(perform);emit();const ok=await running;running=null;emit();return ok;
 }
 return {snapshot,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);},
  enqueue(request){jobs.push({request:structuredClone(request),requestId:crypto.randomUUID(),args:null});emit();void flush();},
  retry:()=>flush(true),flush,
  project(board){if(!board)return board;let next={...board,events:board.events.map(e=>ack[e.id]?.revision>e.revision?ack[e.id]:e)};for(const job of jobs){try{next=previewPlacement(next,job.request);}catch{}}return next;},
  discard(){if(running)return false;jobs=[];known={};ack={};error='';emit();return true;},
  setSend(fn){send=fn;},setSaved(fn){saved=fn;}
 };
}
const queues=new Map();
export function sharedPlacementQueue(key,options){if(!queues.has(key))queues.set(key,createPlacementQueue(options));const queue=queues.get(key);queue.setSend(options.send);queue.setSaved(options.saved);return queue;}
