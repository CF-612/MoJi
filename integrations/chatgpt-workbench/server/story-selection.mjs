import {randomUUID,createHash} from 'node:crypto';
import {selectionProof} from '../../../src/domain/selection-proof.js';
import {applyStory,clone} from '../vendor/cuigengji/src/domain/story-workspace.mjs';
const fail=(message,code='INVALID_SELECTION')=>{throw Object.assign(new Error(message),{code});};
export const selectionSignature=args=>createHash('sha256').update(JSON.stringify(args)).digest('hex');
async function proofFromRpc(selection,sources,rpc,historical=false){
 const chapter=sources.chapters.find(c=>c.id===selection?.chapterId)||(historical?await rpc('chapter.get',{chapterId:selection?.chapterId,maxChars:1}):null);
 if(!chapter)fail('依据章节已删除，请重新选择。');
 const versions=await rpc('chapter.history',{chapterId:chapter.id,includeContent:true});
 return selectionProof({...chapter,versions},selection,{historical});
}
export async function prepareSelection(args,data,sources,rpc){
 if(typeof args.requestId!=='string'||!args.requestId||args.requestId.length>160)fail('缺少选区操作标识，请重新打开。');
 if(args.confirmed!==true)fail('请确认创建或关联。');
 if(args.expectedRevision!==data.state.revision)fail('规划已有更新，请重新读取候选并核对。','CONFLICT');
 const proof=await proofFromRpc(args.selection,sources,rpc),target={...args.target};
 if(!['character','world','card','foreshadow'].includes(target.kind))fail('请选择关联类型。');
 if(!target.id&&(!String(target.title||'').trim()||target.title.length>200))fail('请填写 1—200 字的名称。');
 let next=clone(data.state),result=null;
 if(target.kind==='card'){
  const card=target.id?next.cards[target.id]:null;
  if(target.id&&!card)fail('剧情卡已删除，请重新选择。');
  if(card&&card.revision!==target.expectedRevision)fail('剧情卡已有更新，请重新读取后核对。','CONFLICT');
  const repeated=card?.evidence?.some(e=>e.chapterId===proof.chapterId&&e.revision===proof.revision&&e.start===proof.start&&e.end===proof.end&&e.evidence===proof.evidence);
  const id=card?.id||randomUUID();
  if(!repeated)next=applyStory(next,sources,card?{type:'card.update',id,expectedRevision:card.revision,value:{evidence:[...(card.evidence||[]),proof]}}:{type:'card.create',value:{title:target.title,summary:target.note||'',scope:[proof.chapterId],evidence:[proof]}},()=>id);
  result={kind:'card',id,title:next.cards[id].title,proof};
 }else if(target.kind==='foreshadow'){
  target.newNodeId=randomUUID();
  if(target.cardId){if(!next.cards[target.cardId])fail('关联剧情卡已删除，请重新选择。');}
  else{
   if(target.nodeId)fail('请重新选择计划节点。');
   const id=randomUUID();target.cardId=id;
   next=applyStory(next,sources,{type:'card.create',value:{title:target.cardTitle||target.title||'正文中的伏笔节点',summary:target.note||'',scope:[proof.chapterId],evidence:[proof]}},()=>id);
  }
 }
 return {requestId:args.requestId,signature:selectionSignature(args),next,result,
  rpcArgs:result?null:{novelId:args.novelId,requestId:`selection:${args.requestId}`,confirmed:true,selection:proof,target}};
}

// A recoverable local preview journal bridges the separate planning JSON and
// Store. A lost response/restart replays the same idempotent Store request before
// any further planning operation; it never creates a second card or material.
export async function finishSelection(data,rpc,persist){
 const pending=data.pendingSelection;
 if(!pending)return null;
 let result;
 try{result=pending.result||await rpc('writing.selection.apply',pending.rpcArgs);}
 catch(error){
  if(['INVALID_SELECTION','INVALID_WRITING','INVALID_INPUT','NOT_FOUND','CONFLICT','REVISION_REQUIRED','HUMAN_REQUIRED','CONFIRM_REQUIRED'].includes(error.code)){
   delete data.pendingSelection;await persist(data);
  }
  throw error;
 }
 const completed=clone(data);
 if(JSON.stringify(completed.state)!==JSON.stringify(pending.next)){
  completed.history.push({at:new Date().toISOString(),reason:'正文选区创建／关联',state:clone(completed.state)});
  completed.history=completed.history.slice(-30);completed.state=pending.next;
 }
 completed.selectionReceipts=[...(completed.selectionReceipts||[]),{requestId:pending.requestId,signature:pending.signature,result}].slice(-200);
 delete completed.pendingSelection;
 await persist(completed);Object.assign(data,completed);delete data.pendingSelection;
 return result;
}

export async function validateCardSelectionProofs(before,next,sources,rpc,{restore=false}={}){
 for(const card of Object.values(next.cards)){
  if(!Array.isArray(card.evidence))fail('剧情卡正文依据必须是列表。');
  for(const proof of card.evidence){
   if(proof.coordinate!=='lf-utf16')continue; // Older unrelated evidence remains intact.
   if(!restore&&before.cards[card.id]?.evidence?.some(p=>JSON.stringify(p)===JSON.stringify(proof)))continue;
   await proofFromRpc(proof,sources,rpc,restore);
  }
 }
}
