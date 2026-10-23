// Offsets refer to the textarea's LF-normalized UTF-16 value, never byte offsets.
export const normalizeProse=value=>String(value||'').replace(/\r\n?/g,'\n');
const fail=(message,code='INVALID_SELECTION')=>{throw Object.assign(new Error(message),{code});};
export function selectionProof(chapter,selection,{historical=false}={}){
 if(!chapter||(!historical&&chapter.deleted))fail('依据章节已删除，请返回正文重新选择。');
 if(!selection||chapter.id!==selection.chapterId)fail('选区不属于当前章节。');
 if(!historical&&chapter.revision!==selection.revision)fail('正文已有更新，请返回正文核对并重新选择。','CONFLICT');
 const version=chapter.versions?.find(v=>v.revision===selection.revision)||(chapter.revision===selection.revision?chapter:null);
 if(!version)fail('引用的正文版本不存在。');
 const content=normalizeProse(version.content),{start,end,evidence}=selection;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<=start||end>content.length)fail('正文选区位置无效，请重新选择。');
 if(typeof evidence!=='string'||!evidence.trim()||evidence.length>2000)fail('请选择 1—2000 个字符作为正文依据。');
 if(content.slice(start,end)!==evidence)fail('选中原文与已保存正文不一致，请返回正文重新选择。');
 if(selection.contentHash!==version.contentHash)fail('正文版本内容已变化，请重新选择。','CONFLICT');
 return {chapterId:chapter.id,revision:version.revision,evidence,start,end,coordinate:'lf-utf16',contentHash:version.contentHash};
}

// Invoked inside the Store transaction: creating a material and linking it either
// both persist or neither does. No prose, appearances, or adopted status inferred.
export function applySelection(n,a,actor,execute){
 if(actor.kind!=='human'||a.confirmed!==true)fail('请由作者确认正文关联。','HUMAN_REQUIRED');
 const proof=selectionProof(n.chapters[a.selection?.chapterId],a.selection);
 const target=a.target||{},reason='作者从正文选区创建／关联';
 if(['character','world'].includes(target.kind)){
  let node=target.id?n.nodes[target.id]:null;
  if(target.id&&(!node||node.deleted))fail('目标资料已删除，请重新选择。');
  if(node){
   if(node.revision!==target.expectedRevision)fail('目标资料已有更新，请重新读取后核对。','CONFLICT');
   if((target.kind==='character')!==(node.type==='character_card'))fail('资料类型不匹配。');
  }else{
   node=execute('writing.card.create',{type:target.kind==='character'?'character_card':'world_entry',name:target.title,summary:target.note||'',content:'',values:{},reason});
   node=node.node||node;
  }
  const link=execute('writing.link.create',{nodeId:node.id,chapterId:proof.chapterId,expectedChapterRevision:proof.revision,evidence:proof.evidence,selection:proof,kind:target.linkKind||'reference',confirmed:true,reason});
  return {kind:target.kind,id:node.id,title:node.name,linkId:link.id,proof};
 }
 if(target.kind==='foreshadow'){
  const old=target.id?n.writing?.foreshadows?.[target.id]:null;
  if(target.id&&(!old||old.deleted))fail('伏笔已删除，请重新选择。');
  if(old&&old.revision!==target.expectedRevision)fail('伏笔已有更新，请重新读取后核对。','CONFLICT');
  const nodes=structuredClone(old?.plotNodes||[]),previous=target.nodeId?nodes.find(p=>p.id===target.nodeId):null;
  if(target.nodeId&&!previous)fail('计划节点已不存在，请重新选择。');
  if(previous?.evidence)fail('这个节点已有正文依据；请新增节点，或在伏笔页复核原依据。');
  if(!['plant','progress','recover'].includes(target.stage))fail('请选择埋设、推进或回收。');
  if(previous&&(previous.cardId!==target.cardId||previous.kind!==target.stage))fail('计划节点位置或阶段已有变化，请重新选择。');
  const entry={id:previous?.id||target.newNodeId,cardId:target.cardId,kind:target.stage,note:previous?.note||target.note||'',evidence:proof};
  if(previous)nodes[nodes.indexOf(previous)]=entry;else nodes.push(entry);
  const value={...(old?{}:{title:target.title,content:target.note||'',memoryRefs:[],evidence:[],resolution:'active'}),plotNodes:nodes};
  const f=execute(old?'writing.foreshadow.update':'writing.foreshadow.create',{id:old?.id,expectedRevision:old?.revision||0,value,confirmed:true,reason});
  return {kind:'foreshadow',id:f.id,title:f.title,cardId:target.cardId,nodeId:entry.id,proof};
 }
 fail('不支持的正文关联类型。');
}
