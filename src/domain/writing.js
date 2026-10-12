import {randomUUID} from 'node:crypto';
import {writingBoard} from './writing-board.js';
import {readEvolution,changeEvolution,validateEvolution,copyEvolution,sliceEvolution,storyEvents,stageRelations} from './story-evolution.js';
const fail=(message,code='INVALID_WRITING')=>{throw Object.assign(new Error(message),{code});};
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const safe=id=>typeof id==='string'&&id.length>0&&id.length<160&&!['__proto__','constructor','prototype'].includes(id);
const text=(value,label,empty=false)=>{if(typeof value!=='string'||value.length>20000||!empty&&!value.trim())fail(`${label}无效`);return value;};
const clone=structuredClone,active=map=>Object.values(map||{}).filter(x=>!x.deleted);
const fresh=()=>({version:1,fields:{},cards:{},links:{},foreshadows:{},goal:null});
const data=n=>n.writing||fresh();
const kind=node=>node.type==='character_card'?'character':'world';
const builtin={character:[['gender','性别说明'],['age','年龄说明'],['birth','出生时间'],['death','死亡时间'],['occupation','身份／职业'],['organization','所属组织'],['appearance','外貌'],['personality','性格'],['motivation','目标／动机'],['ability','能力／限制']],world:[['category','类别'],['region','所属区域／组织'],['period','适用时期'],['rules','规则／限制'],['related','关联资料']]};
export function writingFields(n,type){
 const all=data(n).fields,base=builtin[type].map(([key,label])=>({id:`${type}:${key}`,revision:0,kind:type,label,type:key==='related'?'reference':['appearance','personality','motivation','ability','rules'].includes(key)?'long':'short',archived:false,...all[`${type}:${key}`]}));
 return [...base,...Object.values(all).filter(f=>f.kind===type&&!base.some(b=>b.id===f.id))];
}
const get=(map,id,label)=>safe(id)&&Object.hasOwn(map||{},id)?map[id]:fail(`${label}不存在`,'NOT_FOUND');
const cas=(record,expected)=>{if(!Number.isSafeInteger(expected))fail('请提供读取时的版本号','REVISION_REQUIRED');if((record?.revision||0)!==expected)fail('资料已被另一端修改；未覆盖你的草稿','CONFLICT');};
function save(map,id,fields,previous,actor,reason){
 const time=new Date().toISOString(),history=previous?[...(previous.versions||[]),{revision:previous.revision,value:clone({...previous,versions:undefined}),timestamp:time,actor,reason}]:[];
 const value={...previous,...fields,id,revision:(previous?.revision||0)+1,createdAt:previous?.createdAt||time,updatedAt:time,actor:clone(actor),reason:reason||'',versions:history};
 map[id]=value;return value;
}
const chapters=n=>{const vols=active(n.volumes).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)),rank=id=>id===null||!id?vols.length:vols.findIndex(v=>v.id===id);return active(n.chapters).sort((a,b)=>rank(a.volumeId)-rank(b.volumeId)||a.order-b.order||a.id.localeCompare(b.id));};
function evidence(n,value){
 if(!obj(value))fail('正文依据必须指定章节、版本和原文');
 const ch=get(n.chapters,value.chapterId,'章节'),v=ch.versions.find(v=>v.revision===value.revision);
 const quote=text(value.evidence,'正文依据');if(quote.length>2000||!v||!v.content.includes(quote))fail('依据不在指定的已保存正文版本中');
 return {chapterId:ch.id,revision:v.revision,evidence:quote};
}
const nodeIds=(n,ids=[])=>{if(!Array.isArray(ids)||ids.length>100||new Set(ids).size!==ids.length)fail('关联资料无效');for(const id of ids)get(n.nodes,id,'资料');return ids;};
function checkValues(n,type,values,previous={}){
 if(!obj(values))fail('字段值必须是对象');const fields=writingFields(n,type),result={...previous};
 for(const [id,v]of Object.entries(values)){
  const field=fields.find(f=>f.id===id);if(!field){if(JSON.stringify(v)===JSON.stringify(previous[id]))continue;fail('未知字段，请先建立字段');}
  if(field.archived){if(JSON.stringify(v)===JSON.stringify(previous[id]))continue;fail('字段已归档，请先恢复字段');}
  if(v===null||v===''){delete result[id];continue;}
  if(field.type==='number'){if(typeof v!=='number'||!Number.isFinite(v))fail(`${field.label}需要数字`);}
  else if(['tags','reference'].includes(field.type)){if(!Array.isArray(v)||v.length>100||v.some(x=>typeof x!=='string'||x.length>1000))fail(`${field.label}需要数组`);if(field.type==='reference')nodeIds(n,v);}
  else text(v,field.label,true);
  result[id]=clone(v);
 }
 return result;
}
function linkView(n,link){const ch=n.chapters[link.chapterId],node=n.nodes[link.nodeId],v=ch?.versions.find(v=>v.revision===link.chapterRevision);return {...link,chapterTitle:ch?.title||'缺失章节',nodeName:node?.name||'缺失资料',excluded:!!ch?.deleted||!!node?.deleted,review:!!ch&&!ch.deleted&&ch.contentHash!==v?.contentHash};}
function cardView(n,nodeId){const node=get(n.nodes,nodeId,'资料'),record=data(n).cards[nodeId],links=active(data(n).links).filter(l=>l.nodeId===nodeId).map(l=>linkView(n,l)),order=new Map(chapters(n).map((c,i)=>[c.id,i]));links.sort((a,b)=>(order.get(a.chapterId)??Infinity)-(order.get(b.chapterId)??Infinity)||a.createdAt.localeCompare(b.createdAt));
 return {nodeId,kind:kind(node),nodeRevision:node.revision,revision:record?.revision||0,aliases:node.aliases||[],values:record?.values||{},fields:writingFields(n,kind(node)),links,firstAppearance:links.find(l=>!l.excluded&&l.kind==='appearance')||null,firstMention:links.find(l=>!l.excluded&&l.kind==='mention')||null,foreshadows:active(data(n).foreshadows).filter(f=>f.memoryRefs.includes(nodeId)),events:storyEvents(n,data(n),{nodeId})};}
function stats(n){const rows=chapters(n).map(c=>({id:c.id,title:c.title,volumeId:c.volumeId,words:Array.from(c.content.replace(/\s/gu,'')).length})),volumes=[...active(n.volumes).sort((a,b)=>a.order-b.order).map(v=>({id:v.id,title:v.title})),{id:null,title:'未分卷'}].map(v=>({...v,chapters:rows.filter(c=>(c.volumeId||null)===v.id).length,words:rows.filter(c=>(c.volumeId||null)===v.id).reduce((s,c)=>s+c.words,0)}));return {chapters:rows.length,words:rows.reduce((s,c)=>s+c.words,0),rows,volumes,goal:data(n).goal||{revision:0,target:null}};}
function foreshadowView(n,f,chapterId){const rank=new Map(chapters(n).map((c,i)=>[c.id,i])),at=chapterId?rank.get(chapterId):Math.max(-1,...chapters(n).filter(c=>c.content.trim()).map(c=>rank.get(c.id)));return {...f,targetTitle:n.chapters[f.targetChapterId]?.title||null,due:!['recovered','abandoned'].includes(f.status)&&rank.has(f.targetChapterId)&&at>=rank.get(f.targetChapterId),review:f.evidence.some(e=>linkView(n,{...e,chapterRevision:e.revision}).review)};}
function checkedForeshadow(n,v){
 const title=text(v.title,'伏笔名称'),status=v.status||'planned';if(!['planned','planted','developing','recovered','abandoned'].includes(status))fail('伏笔状态无效');
 if(!Array.isArray(v.evidence)||v.evidence.length>200)fail('伏笔依据无效');
 const refs=v.evidence.map(e=>{if(!['plant','progress','recover'].includes(e.kind))fail('伏笔依据类型无效');return {...evidence(n,e),kind:e.kind};});
 if(['planted','developing','recovered'].includes(status)&&!refs.some(e=>e.kind==='plant'))fail('请添加埋设的正文依据');
 if(status==='recovered'&&!refs.some(e=>e.kind==='recover'))fail('回收需要实际正文依据');
 if(status==='abandoned'&&!v.abandonReason?.trim())fail('放弃伏笔需要保留原因');
 if(v.targetChapterId)get(n.chapters,v.targetChapterId,'计划回收章');
 return {title,status,content:text(v.content||'','说明',true),memoryRefs:nodeIds(n,v.memoryRefs),targetChapterId:v.targetChapterId||null,evidence:refs,abandonReason:text(v.abandonReason||'','放弃原因',true)};
}
export function writingAction(n,action,a,actor){
 if(n.writing&&n.writing.version!==1)fail('此作品结构版本较新，请更新工作台后再操作','WRITING_VERSION');
 const w=data(n);
 if(action==='writing.board.get')return writingBoard(n,w,stats(n),active(w.foreshadows).map(f=>foreshadowView(n,f,a.chapterId)),a);
 const evolution=readEvolution(n,w,action,a);if(evolution)return evolution.value;
 if(action==='writing.fields.list')return {character:writingFields(n,'character'),world:writingFields(n,'world')};
 if(action==='writing.card.get')return cardView(n,a.nodeId);
 if(action==='writing.link.list')return active(w.links).filter(l=>(!a.nodeId||l.nodeId===a.nodeId)&&(!a.chapterId||l.chapterId===a.chapterId)).map(l=>linkView(n,l));
 if(action==='writing.link.candidates'){
  const ch=get(n.chapters,a.chapterId,'章节');if(ch.deleted)fail('章节已删除');const hits=[];
  for(const node of active(n.nodes)){const names=[node.name,...node.aliases||[]].filter(Boolean),name=names.find(name=>ch.content.includes(name));if(!name)continue;const at=ch.content.indexOf(name);hits.push({nodeId:node.id,name:node.name,type:node.type,matched:name,chapterRevision:ch.revision,evidence:ch.content.slice(Math.max(0,at-20),at+name.length+40)});if(hits.length===100)break;}
  return {chapterId:ch.id,chapterRevision:ch.revision,items:hits,candidateOnly:true};
 }
 if(action==='writing.stats.get')return stats(n);
 if(action==='writing.foreshadow.list')return active(w.foreshadows).map(f=>foreshadowView(n,f,a.chapterId));
 if(action==='writing.history'){
  if(!['cards','fields','links','foreshadows','events','relationshipChanges'].includes(a.collection))fail('历史类型无效');const record=get(w[a.collection],a.id,'记录');return {revision:record.revision,versions:record.versions||[]};
 }
 if(action==='writing_context.get'){
  const event=a.eventId?get(w.events,a.eventId,'事件'):null;if(event?.deleted)fail('事件已删除');if(a.chapterId)get(n.chapters,a.chapterId,'章节');
  const linked=active(w.links).filter(l=>l.chapterId===a.chapterId&&!linkView(n,l).excluded),ids=[...new Set([...nodeIds(n,a.nodeIds),...linked.map(l=>l.nodeId),...event?.memoryRefs||[]])].slice(0,20);
  const result={chapterId:a.chapterId||null,cards:ids.map(id=>{const node=n.nodes[id],profile=cardView(n,id);return {id,name:node.name,type:node.type,aliases:node.aliases,summary:node.summary,content:node.content.slice(0,1200),values:profile.values,firstAppearance:profile.firstAppearance,firstMention:profile.firstMention};}),foreshadows:active(w.foreshadows).filter(f=>event?.foreshadowRefs.includes(f.id)||f.targetChapterId===a.chapterId||f.evidence.some(e=>e.chapterId===a.chapterId)||f.memoryRefs.some(id=>ids.includes(id))).slice(0,20).map(f=>foreshadowView(n,f,a.chapterId)),candidatePolicy:'姓名匹配、字段提取和疑似回收仅是候选；作者确认后才能记录',truncated:false};
  result.events=storyEvents(n,w,{chapterId:a.chapterId}).filter(e=>event?e.id===event.id:!!a.chapterId).slice(0,20).map(e=>({id:e.id,title:e.title,storyTime:e.storyTime,order:e.order,narrativeKind:e.narrativeKind,content:e.content.slice(0,800),memoryRefs:e.memoryRefs,planningRefs:e.planningRefs,foreshadowRefs:e.foreshadowRefs}));
  result.relationships=stageRelations(n,w,event?{phase:'event',eventId:event.id}:{phase:'latest'}).filter(e=>ids.includes(e.from)||ids.includes(e.to)).slice(0,30).map(e=>({id:e.id,from:e.from,to:e.to,name:e.name,content:e.content.slice(0,800),active:e.active,category:e.category,stageEventId:e.stageEventId}));
  result.relationshipPhase=event?{kind:'event',eventId:event.id}:{kind:'latest'};
  result.candidatePolicy+='；事件关联角色不证明其实际出场';
  const limit=Math.min(24000,Math.max(2000,Number.isSafeInteger(a.maxChars)?a.maxChars:12000));while(JSON.stringify(result).length>limit&&(result.cards.length||result.foreshadows.length||result.events.length||result.relationships.length)){result.truncated=true;if(result.relationships.length)result.relationships.pop();else if(result.events.length)result.events.pop();else if(result.foreshadows.length)result.foreshadows.pop();else result.cards.pop();}return result;
 }
 // Mutations initialize the optional extension only after all input validation succeeds.
 const draft=clone(w),reason=text(a.reason||'结构资料修改','修改理由',true),source={kind:actor.kind==='human'?'human':'agent',sessionId:actor.sessionId||null};let result;
 const changed=changeEvolution(n,draft,action,a,source,reason,save,cas,randomUUID);
 if(changed){result=changed.value;
 }else if(action==='writing.field.create'||action==='writing.field.update'){
  const old=action.endsWith('update')?draft.fields[a.id]:null,id=old?.id||a.id||randomUUID(),type=a.kind||old?.kind;
  if(!safe(id)||!['character','world'].includes(type))fail('字段标识或类型无效');const built=writingFields(n,type).find(f=>f.id===id);cas(old||built, a.expectedRevision??(action.endsWith('create')?0:undefined));
  if(action.endsWith('create')&&built)fail('字段已存在');const fieldType=a.type||old?.type||built?.type;
  if(!['short','long','number','tags','reference'].includes(fieldType)||built&&fieldType!==built.type||old&&fieldType!==old.type)fail('字段类型无效或不可改变');
  if(old&&old.kind!==type)fail('不能改变字段所属类型');
  result=save(draft.fields,id,{kind:type,type:fieldType,label:text(a.label||old?.label||built?.label,'字段名称'),archived:a.archived??old?.archived??false},old,source,reason);
 }else if(action==='writing.card.update'){
  const node=get(n.nodes,a.nodeId,'资料');if(node.deleted)fail('资料已删除');const old=draft.cards[node.id];cas(old,a.expectedRevision);const values=checkValues(n,kind(node),a.values,old?.values||{});
  if(a.aliases!==undefined){cas(node,a.expectedNodeRevision);if(!Array.isArray(a.aliases)||a.aliases.some(s=>typeof s!=='string'||s.length>1000))fail('别名需要文本数组');}
  result=save(draft.cards,node.id,{values,aliases:clone(a.aliases??node.aliases??[])},old,source,reason);
 }else if(action==='writing.link.create'){
  if(a.confirmed!==true)fail('出场、提及与资料关联需要作者确认','CONFIRM_REQUIRED');const node=get(n.nodes,a.nodeId,'资料'),ch=get(n.chapters,a.chapterId,'章节');if(node.deleted||ch.deleted)fail('不能关联已删除资料或章节');cas(ch,a.expectedChapterRevision);
  const ref=evidence(n,{chapterId:a.chapterId,revision:a.expectedChapterRevision,evidence:a.evidence}),linkKind=a.kind||'reference';if(!['appearance','mention','reference'].includes(linkKind))fail('关联类型无效');
  if(node.type!=='character_card'&&linkKind!=='reference')fail('只有角色可记录出场或提及');
  const repeated=active(draft.links).find(l=>l.nodeId===node.id&&l.chapterId===ch.id&&l.chapterRevision===ch.revision&&l.kind===linkKind&&l.evidence===ref.evidence);if(repeated)return linkView(n,repeated);
  result=save(draft.links,randomUUID(),{nodeId:node.id,chapterId:ch.id,chapterRevision:ch.revision,kind:linkKind,evidence:ref.evidence,deleted:false},null,source,reason);
 }else if(action==='writing.link.delete'){
  const old=get(draft.links,a.id,'关联');cas(old,a.expectedRevision);result=save(draft.links,old.id,{deleted:true},old,source,reason);
 }else if(action==='writing.foreshadow.create'||action==='writing.foreshadow.update'){
  if(a.confirmed!==true)fail('伏笔事实需作者确认','CONFIRM_REQUIRED');const old=action.endsWith('update')?get(draft.foreshadows,a.id,'伏笔'):null;cas(old,a.expectedRevision??(old?undefined:0));
  result=save(draft.foreshadows,old?.id||randomUUID(),checkedForeshadow(n,{...old,...a.value}),old,source,reason);
 }else if(action==='writing.goal.set'){
  cas(draft.goal,a.expectedRevision);if(a.target!==null&&(!Number.isSafeInteger(a.target)||a.target<1))fail('目标需要正整数或空值');result=save({goal:null},'goal',{target:a.target},draft.goal,source,reason);draft.goal=result;
 }else if(action==='writing.restore'){
  if(!['cards','fields','links','foreshadows','events','relationshipChanges'].includes(a.collection))fail('恢复类型无效');const old=get(draft[a.collection],a.id,'记录');cas(old,a.expectedRevision);if(a.collection==='cards')cas(get(n.nodes,a.id,'资料'),a.expectedNodeRevision);const version=old.versions?.find(v=>v.revision===a.targetRevision);if(!version)fail('历史版本不存在');result=save(draft[a.collection],old.id,version.value,old,source,reason);
 }else fail('不支持的结构操作','NOT_ALLOWED');
 const checked={...n,writing:draft};validateWriting(checked);
 n.writing=draft;if(action==='writing.card.update'&&a.aliases!==undefined||action==='writing.restore'&&a.collection==='cards'){const node=n.nodes[a.nodeId||a.id],aliases=action==='writing.restore'?result.aliases||[]:a.aliases;if(JSON.stringify(node.aliases||[])!==JSON.stringify(aliases)){node.aliases=clone(aliases);node.revision++;node.updatedAt=new Date().toISOString();}}
 n.revision++;n.updatedAt=new Date().toISOString();return clone(result);
}
export function validateWriting(n){
 if(!n.writing)return;const w=n.writing;if(!obj(w)||w.version!==1||!['fields','cards','links','foreshadows'].every(k=>obj(w[k])))fail('结构资料格式无效','INVALID_BACKUP');
 for(const key of ['fields','cards','links','foreshadows'])for(const [id,r]of Object.entries(w[key]))if(!safe(id)||!obj(r)||r.id!==id||!Number.isSafeInteger(r.revision)||r.revision<1||!Array.isArray(r.versions))fail('结构记录 ID、版本或历史无效','INVALID_BACKUP');
 for(const f of Object.values(w.fields))if(!['character','world'].includes(f.kind)||!['short','long','number','tags','reference'].includes(f.type)||typeof f.archived!=='boolean'||!f.label?.trim())fail('字段定义无效','INVALID_BACKUP');
 const fields=[...writingFields(n,'character'),...writingFields(n,'world')];
 for(const [id,r]of Object.entries(w.cards)){get(n.nodes,id,'字段所属资料');if(!obj(r.values))fail('字段值无效','INVALID_BACKUP');for(const [key,v]of Object.entries(r.values)){const f=fields.find(f=>f.id===key);if(!f)fail('未知字段值','INVALID_BACKUP');if(v===null||v==='')continue;if(f.type==='number'){if(typeof v!=='number'||!Number.isFinite(v))fail('数字字段无效','INVALID_BACKUP');}else if(['tags','reference'].includes(f.type)){if(!Array.isArray(v)||v.length>100||v.some(s=>typeof s!=='string'||s.length>1000))fail('标签或引用字段无效','INVALID_BACKUP');if(f.type==='reference')nodeIds(n,v);}else text(v,f.label,true);}}
 for(const l of Object.values(w.links)){get(n.nodes,l.nodeId,'关联资料');evidence(n,{chapterId:l.chapterId,revision:l.chapterRevision,evidence:l.evidence});if(!['appearance','mention','reference'].includes(l.kind)||typeof l.deleted!=='boolean')fail('章节关联无效','INVALID_BACKUP');}
 for(const f of Object.values(w.foreshadows))checkedForeshadow(n,f);
 validateEvolution(n,w);
 if(w.goal&&(!Number.isSafeInteger(w.goal.revision)||w.goal.target!==null&&(!Number.isSafeInteger(w.goal.target)||w.goal.target<1)))fail('写作目标无效','INVALID_BACKUP');
}

export function copyWriting(source,target,maps){
 if(!source.writing)return;const w=clone(source.writing);validateWriting(source);target.writing??=fresh();const to=target.writing,fieldIds=new Map(Object.keys(w.fields).map(id=>[id,randomUUID()]));
 const remapValues=values=>Object.fromEntries(Object.entries(values).map(([id,value])=>{const field=[...writingFields(source,'character'),...writingFields(source,'world')].find(f=>f.id===id);return [fieldIds.get(id)||id,field?.type==='reference'?value.map(id=>maps.nodes.get(id)):value];}));
 const mapRecord=(record,convert)=>{const current=convert(clone(record));current.versions=(record.versions||[]).map(v=>({...v,value:convert(clone(v.value))}));return current;};
 const foreshadowIds=new Map(Object.keys(w.foreshadows).map(id=>[id,randomUUID()]));
 for(const f of Object.values(w.fields)){const id=fieldIds.get(f.id);to.fields[id]=mapRecord(f,v=>({...v,id}));}
 for(const r of Object.values(w.cards)){const id=maps.nodes.get(r.id);to.cards[id]=mapRecord(r,v=>({...v,id,values:remapValues(v.values)}));}
 for(const l of Object.values(w.links)){const id=randomUUID();to.links[id]=mapRecord(l,v=>({...v,id,nodeId:maps.nodes.get(v.nodeId),chapterId:maps.chapters.get(v.chapterId)}));}
 for(const f of Object.values(w.foreshadows)){const id=foreshadowIds.get(f.id);to.foreshadows[id]=mapRecord(f,v=>({...v,id,memoryRefs:v.memoryRefs.map(id=>maps.nodes.get(id)),targetChapterId:v.targetChapterId?maps.chapters.get(v.targetChapterId):null,evidence:v.evidence.map(e=>({...e,chapterId:maps.chapters.get(e.chapterId)}))}));}
 copyEvolution(w,to,maps,randomUUID,foreshadowIds);
 if(!to.goal)to.goal=clone(w.goal);validateWriting(target);
}

export function sliceWriting(source,target){
 if(!source.writing)return {omitted:0};const w=clone(source.writing),kinds=new Set(Object.values(target.nodes).map(kind)),fields=[...writingFields(source,'character'),...writingFields(source,'world')];let omitted=0;
 const values=input=>Object.fromEntries(Object.entries(input).map(([id,v])=>{const f=fields.find(f=>f.id===id);if(f?.type==='reference'){const kept=v.filter(id=>Object.hasOwn(target.nodes,id));omitted+=v.length-kept.length;return [id,kept];}return [id,v];}));
 const usedFields=new Set(Object.values(w.cards).filter(r=>Object.hasOwn(target.nodes,r.id)).flatMap(r=>[...Object.keys(r.values),...r.versions.flatMap(v=>Object.keys(v.value.values))]));
 w.fields=Object.fromEntries(Object.entries(w.fields).filter(([id,f])=>kinds.has(f.kind)||usedFields.has(id)));
 w.cards=Object.fromEntries(Object.entries(w.cards).filter(([id])=>Object.hasOwn(target.nodes,id)).map(([id,r])=>[id,{...r,values:values(r.values),versions:r.versions.map(v=>({...v,value:{...v.value,values:values(v.value.values)}}))}]));
 const inScope=l=>Object.hasOwn(target.nodes,l.nodeId)&&Object.hasOwn(target.chapters,l.chapterId);
 w.links=Object.fromEntries(Object.entries(w.links).filter(([,r])=>{const keep=inScope(r)&&r.versions.every(v=>inScope(v.value));if(!keep)omitted++;return keep;}));
 const complete=f=>f.memoryRefs.every(id=>Object.hasOwn(target.nodes,id))&&(!f.targetChapterId||Object.hasOwn(target.chapters,f.targetChapterId))&&f.evidence.every(e=>Object.hasOwn(target.chapters,e.chapterId));
 w.foreshadows=Object.fromEntries(Object.entries(w.foreshadows).filter(([,r])=>{const keep=complete(r)&&r.versions.every(v=>complete(v.value));if(!keep)omitted++;return keep;}));
 omitted+=sliceEvolution(w,target);w.goal=null;target.writing=w;validateWriting(target);return {omitted};
}
