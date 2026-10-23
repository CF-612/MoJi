// Per-work relationship vocabulary. Existing names/categories remain untouched.
const fail=(message,code='INVALID_WRITING')=>{throw Object.assign(new Error(message),{code});};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const safe=id=>typeof id==='string'&&id.length>0&&id.length<160&&!['__proto__','prototype','constructor'].includes(id);
const neutralRelationColor='#8a94a6';
export const relationshipTypes=n=>Object.values(n.writing?.relationshipTypes||{}).filter(t=>!t.deleted);
export function checkedTypeId(n,id){if(id==null||id==='')return null;if(!safe(id)||!Object.hasOwn(n.writing?.relationshipTypes||{},id)||n.writing.relationshipTypes[id].deleted)fail('请选择本作品已有的关系类型');return id;}
export function relationView(n,edge){const type=edge.typeId&&n.writing?.relationshipTypes?.[edge.typeId];return {...edge,typeName:type?.name||null,relationColor:type?.color||neutralRelationColor};}
function fields(value){if(typeof value.name!=='string'||!value.name.trim()||value.name.trim().length>80)fail('关系类型名称需为 1–80 个字符');if(typeof value.color!=='string'||!/^#[0-9a-f]{6}$/i.test(value.color))fail('关系颜色需为六位十六进制颜色');return {name:value.name.trim(),color:value.color.toLowerCase(),deleted:!!value.deleted};}
export function changeRelationshipType(n,draft,action,a,source,reason,save,cas,uuid){
 if(!action.startsWith('writing.relationshipType.'))return null;
 const op=action.split('.').at(-1);if(!['create','update','delete'].includes(op))fail('不支持的关系类型操作');
 draft.relationshipTypes??={};const map=draft.relationshipTypes,old=op==='create'?null:safe(a.id)&&Object.hasOwn(map,a.id)?map[a.id]:fail('关系类型不存在','NOT_FOUND');
 cas(old,a.expectedRevision??(op==='create'?0:undefined));if(old?.deleted)fail('关系类型已删除');
 const value=fields({...old,...a,deleted:op==='delete'});
 if(op==='delete'){
  if(a.confirmed!==true)fail('删除关系类型需要确认','CONFIRM_REQUIRED');
  const used=Object.values(n.edges).some(e=>e.typeId===old.id)||Object.values(draft.relationshipChanges||{}).some(c=>c.value.typeId===old.id||c.versions.some(v=>v.value.value.typeId===old.id));
  const storyUsed=[n.story?.state,...(n.story?.history||[]).map(h=>h.state),...(n.story?.redo||[]).map(h=>h.state)].filter(Boolean).some(s=>Object.values(s.cards||{}).some(c=>(c.points||[]).some(p=>(p.relationships||[]).some(r=>r.typeId===old.id))));
  if(used||storyUsed)fail('此类型仍被关系或历史使用，不能删除；可修改名称和颜色','RELATIONSHIP_TYPE_IN_USE');
 }else if(Object.values(map).some(t=>!t.deleted&&t.id!==old?.id&&t.name===value.name))fail('同名关系类型已存在');
 return {value:save(map,old?.id||uuid(),value,old,source,reason)};
}
export function validateRelationshipTypes(n){
 const map=n.writing?.relationshipTypes;if(map===undefined)return;if(!object(map))fail('关系类型目录无效','INVALID_BACKUP');
 for(const [id,type]of Object.entries(map)){
  if(!safe(id)||!object(type)||type.id!==id||!Number.isSafeInteger(type.revision)||type.revision<1||typeof type.deleted!=='boolean'||!Array.isArray(type.versions))fail('关系类型记录无效','INVALID_BACKUP');fields(type);
  for(const v of type.versions){if(!object(v)||!Number.isSafeInteger(v.revision)||v.revision<1||!object(v.value)||v.value.id!==id)fail('关系类型历史无效','INVALID_BACKUP');fields(v.value);}
 }
 const names=new Set();for(const t of Object.values(map).filter(t=>!t.deleted)){if(names.has(t.name))fail('关系类型名称重复','INVALID_BACKUP');names.add(t.name);}
}
