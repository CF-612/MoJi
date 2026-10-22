// Preview: one foreshadow body owns its nodes; cardId links to the unified plot.
// Planned placement never supplies prose evidence, even on a written plot card.
export function checkForeshadowNodes(value,checkEvidence,fail){
 if(!Array.isArray(value)||value.length>200)fail('伏笔节点需要列表，最多 200 项');
 const ids=new Set();
 return value.map(node=>{
  if(!node||typeof node.id!=='string'||!node.id||node.id.length>160||ids.has(node.id))fail('伏笔节点 ID 无效或重复');
  ids.add(node.id);
  if(typeof node.cardId!=='string'||!node.cardId||node.cardId.length>160)fail('请选择关联剧情卡');
  if(!['plant','progress','recover'].includes(node.kind))fail('伏笔节点类型无效');
  if(typeof node.note!=='string'||node.note.length>20000)fail('节点说明无效');
  return {id:node.id,cardId:node.cardId,kind:node.kind,note:node.note,evidence:node.evidence?checkEvidence(node.evidence):null};
 });
}
export function nodeProgress(nodes,evidence,resolution,fail){
 if(!['active','complete','open'].includes(resolution))fail('伏笔结局无效');
 const kinds=new Set([...evidence.map(e=>e.kind),...nodes.filter(n=>n.evidence).map(n=>n.kind)]);
 if(resolution==='complete'){
  if(!kinds.has('plant')||!kinds.has('recover'))fail('完成伏笔前，需要已确认的埋设与回收正文依据');
  return 'recovered';
 }
 if(resolution==='open')return 'open';
 return kinds.has('recover')?'partial':kinds.has('progress')?'developing':kinds.has('plant')?'planted':'planned';
}
