import {storyEvents,changeView} from './story-evolution.js';
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const active=map=>Object.values(map||{}).filter(x=>!x.deleted);
const node=(n,id)=>{const v=typeof id==='string'&&Object.hasOwn(n.nodes,id)&&n.nodes[id];if(!v||v.deleted)fail('NOT_FOUND','资料不存在或已删除');return v;};
const cas=(v,revision)=>{if(!Number.isSafeInteger(revision))fail('REVISION_REQUIRED','请提供读取时的版本号');if(v.revision!==revision)fail('CONFLICT','资料或关系已变化，请重新读取；未覆盖草稿');};
export const isOrganization=(n,id)=>Object.hasOwn(n.nodes,id)&&!n.nodes[id].deleted&&n.nodes[id].type!=='character_card'&&n.writing?.cards[id]?.values['world:category']==='组织';
const affiliations=(n,id)=>active(n.edges).filter(e=>e.from===id&&e.category==='affiliation'&&e.baseActive!==false&&isOrganization(n,e.to));
export const organizations=n=>active(n.nodes).filter(v=>isOrganization(n,v.id)).map(v=>({id:v.id,name:v.name,revision:v.revision}));
export function cardRelations(n,id){
 const current=node(n,id),w=n.writing||{},edges=active(n.edges).filter(e=>[e.from,e.to].includes(id)&&!n.nodes[e.from]?.deleted&&!n.nodes[e.to]?.deleted);
 return {nodeRevision:current.revision,organizations:organizations(n),characters:active(n.nodes).filter(v=>v.type==='character_card'&&v.id!==id).map(v=>({id:v.id,name:v.name,revision:v.revision})),affiliations:affiliations(n,id),edges,changes:active(w.relationshipChanges).filter(c=>edges.some(e=>e.id===c.edgeId)).map(c=>changeView(n,w,c)),events:storyEvents(n,w),nodes:active(n.nodes).map(({id,name,type})=>({id,name,type}))};
}
// The graph edges are the only organization membership records. Card selectors
// read and edit them, rather than maintaining a second, drifting list of IDs.
export function setAffiliations(n,a,execute){
 const current=node(n,a.nodeId);if(current.type!=='character_card')fail('INVALID_INPUT','只有角色卡可以选择所属组织');cas(current,a.expectedNodeRevision);
 if(a.confirmed!==true)fail('CONFIRM_REQUIRED','组织关联需要作者确认');
 const ids=a.organizationIds;if(!Array.isArray(ids)||ids.length>100||new Set(ids).size!==ids.length)fail('INVALID_INPUT','组织选择无效');
 for(const id of ids){if(!isOrganization(n,id))fail('INVALID_INPUT','请选择类别为组织的世界书');cas(node(n,id),a.organizationRevisions?.[id]);}
 const existing=affiliations(n,current.id),revisions=a.edgeRevisions;
 if(!revisions||typeof revisions!=='object'||Array.isArray(revisions)||Object.keys(revisions).length!==existing.length||existing.some(e=>revisions[e.id]!==e.revision))fail('CONFLICT','组织连线已变化，请重新读取后选择');
 const removed=existing.filter(e=>!ids.includes(e.to));
 for(const e of removed)if(active(n.writing?.relationshipChanges).some(c=>c.edgeId===e.id))fail('RELATIONSHIP_HISTORY','该组织关系已有事件变化，请在关系中调整；选择器不会删除变化历史');
 for(const e of removed)execute('edge.delete',{edgeId:e.id,expectedRevision:e.revision,confirm:true});
 for(const id of ids)if(!existing.some(e=>e.to===id))execute('edge.create',{from:current.id,to:id,name:'所属',category:'affiliation',style:'solid',baseActive:true});
 return cardRelations(n,current.id);
}
export function createCardRelationship(n,a,execute){
 if(a.confirmed!==true)fail('CONFIRM_REQUIRED','关系需要作者确认');
 const from=node(n,a.nodeId),to=node(n,a.targetId);if(from.type!=='character_card'||to.type!=='character_card'||from.id===to.id)fail('INVALID_INPUT','请选择两个不同角色');
 cas(from,a.expectedNodeRevision);cas(to,a.expectedTargetRevision);
 if(!['base','event','undated'].includes(a.timing))fail('INVALID_INPUT','请选择基础、具体事件或时间未定');
 if(typeof a.name!=='string'||!a.name.trim()||a.name.length>20000)fail('INVALID_INPUT','请填写关系名称');
 if(a.timing==='event'){const event=n.writing?.events?.[a.eventId];if(!event||event.deleted)fail('NOT_FOUND','请选择有效事件');cas(event,a.expectedEventRevision);}
 const edge=execute('edge.create',{from:from.id,to:to.id,name:a.name,content:a.content||'',category:a.category||'other',style:a.style||'solid',baseActive:a.timing==='base',timing:a.timing});
 const change=a.timing==='event'?execute('writing.relationshipChange.create',{confirmed:true,value:{edgeId:edge.id,eventId:a.eventId,value:{name:edge.name,content:edge.content,category:edge.category,style:edge.style,active:true}},reason:a.reason||'从角色卡记录关系起点'}):null;
 return {edge,change};
}
