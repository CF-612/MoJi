import {createHash} from 'node:crypto';
import {encodeState,decodeState,MAX_RAW_BYTES,MAX_STORED_BYTES} from './state-codec.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=message=>{throw Object.assign(new Error(message),{code:'CAPACITY_LIMIT'});};
const corrupt=message=>{throw Object.assign(new Error(message),{code:'CORRUPT_STORE'});};
const collections=['chapters','nodes','edges'];
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.hasOwn(value,key);
const validRef=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const FORMAT='moji-workspace-fragments';
const LEGACY_FORMAT='cuigengji-workspace-fragments';
const stateRecipe={fields:{cards:{map:null},pages:{array:null}}};
const snapshotRecipe={fields:{state:stateRecipe}};
const storyRecipe={fields:{state:stateRecipe,history:{array:snapshotRecipe},redo:{array:snapshotRecipe}}};
const coarseSnapshotRecipe={fields:{state:null}};
const coarseStoryRecipe={fields:{state:null,history:{array:coarseSnapshotRecipe},redo:{array:coarseSnapshotRecipe}}};
const recordRecipe={fields:{versions:{array:null}}};
const writingRecipe={fields:Object.fromEntries([
  ...['fields','cards','links','foreshadows','events','relationshipChanges','relationshipTypes','reviews'].map(key=>[key,{map:recordRecipe}]),
  ['goal',recordRecipe],
])};

const coarseWritingRecipe={fields:Object.fromEntries(Object.keys(writingRecipe.fields).map(key=>[key,null]))};
// Leave query headroom for the existing adapter (90 refs per read, 30 inserts
// per statement, 50 D1 Free queries per invocation). Large pre-existing normal
// collections keep their existing limits; new story trees must not multiply them.
const GRANULAR_FRAGMENT_BUDGET=900;

// This is a storage-only tree, not a new story schema. Unknown properties stay in
// a verbatim value leaf; arrays preserve order, including empty pages/groups.
// Tree nodes are also blobs, so 30 snapshots share unchanged cards and pages
// without duplicating every reference in the top-level D1 row.
function partition(value,recipe,put){
  if(recipe?.fields&&object(value)){
    const base={...value},fields={};
    for(const [key,child]of Object.entries(recipe.fields))if(own(value,key)){
      delete base[key];fields[key]=partition(value[key],child,put);
    }
    return put({kind:'object',base:put({kind:'value',value:base}),fields});
  }
  if(recipe&&own(recipe,'map')&&object(value))return put({kind:'map',entries:Object.fromEntries(Object.entries(value).map(([key,item])=>[key,partition(item,recipe.map,put)]))});
  if(recipe&&own(recipe,'array')&&Array.isArray(value))return put({kind:'array',items:value.map(item=>partition(item,recipe.array,put))});
  return put({kind:'value',value});
}

// Immutable, owner-scoped fragments are shared by current data and rollback
// snapshots. D1 still hydrates the complete workspace before engine.execute;
// this reduces write amplification, not the number of records read per RPC.
export function encodeWorkspace(state){
  const rawBytes=Buffer.byteLength(JSON.stringify(state));
  if(rawBytes>MAX_RAW_BYTES)fail('工作库超过 64 MB，请拆分或导出历史；未覆盖保存。');
  if(rawBytes<512_000){const encoded=encodeState(state);return {...encoded,blobs:new Map()};}
  const split=(story,writing)=>{
    const blobs=new Map(),treeIds=new Set(),shape={...state,novels:{},requests:{}};
    const put=value=>{const text=JSON.stringify(value),digest=hash(text);if(!blobs.has(digest))blobs.set(digest,encodeState(value).stored);return digest;};
    const putTree=value=>{const id=put(value);treeIds.add(id);return id;};
    shape.requests=Object.fromEntries(Object.entries(state.requests).map(([id,record])=>[id,put(record)]));
    for(const [id,novel]of Object.entries(state.novels)){
      const metadata={...novel},book={metadata:null};
      for(const section of collections)if(object(novel[section])){
        delete metadata[section];book[section]=Object.fromEntries(Object.entries(novel[section]).map(([key,value])=>[key,put(value)]));
      }
      for(const [section,recipe]of [['story',story],['writing',writing]])if(own(novel,section)){
        delete metadata[section];book[section]=partition(novel[section],recipe,putTree);
      }
      book.metadata=put(metadata);shape.novels[id]=book;
    }
    return {blobs,treeIds,shape};
  };
  let result=split(storyRecipe,writingRecipe);
  // Avoid turning a previously writable workspace into hundreds of D1 writes
  // merely to upgrade its layout. Broader trees retain separate current/history
  // snapshots; the final fallback is an opaque, lossless section value.
  if(result.treeIds.size&&result.blobs.size>GRANULAR_FRAGMENT_BUDGET)result=split(coarseStoryRecipe,coarseWritingRecipe);
  if(result.treeIds.size&&result.blobs.size>GRANULAR_FRAGMENT_BUDGET)result=split(null,null);
  const {blobs,treeIds,shape}=result;
  const stored=JSON.stringify({format:FORMAT,version:1,shape,trees:[...treeIds]});
  if(Buffer.byteLength(stored)>MAX_STORED_BYTES)fail('工作库索引超过安全上限，请拆分作品；未覆盖保存。');
  return {stored,rawBytes,storedBytes:Buffer.byteLength(stored)+[...blobs.values()].reduce((n,v)=>n+Buffer.byteLength(v),0),blobs};
}
function manifestIds(value){
  if(![FORMAT,LEGACY_FORMAT].includes(value.format))return new Set();
  if(value.version!==1||!object(value.shape)||!object(value.shape.novels)||(value.shape.requests!==undefined&&!object(value.shape.requests)))corrupt('工作库索引格式无效');
  const refs=new Set(Object.values(value.shape.requests||{}));
  for(const book of Object.values(value.shape.novels)){
    if(!object(book))corrupt('作品片段索引格式无效');
    refs.add(book.metadata);
    for(const section of collections)if(own(book,section)){
      if(!object(book[section]))corrupt('作品片段集合格式无效');
      for(const id of Object.values(book[section]))refs.add(id);
    }
  }
  if(value.format===FORMAT){
    if(!Array.isArray(value.trees)||new Set(value.trees).size!==value.trees.length)corrupt('工作库分层索引格式无效');
    const trees=new Set(value.trees);
    for(const book of Object.values(value.shape.novels))for(const section of ['story','writing'])if(own(book,section)&&!trees.has(book[section]))corrupt('工作库分层根索引缺失');
    for(const id of trees)refs.add(id);
  }
  if([...refs].some(id=>!validRef(id)))corrupt('工作库片段标识无效');
  return refs;
}
export function fragmentIds(stored){return manifestIds(JSON.parse(stored));}
export async function decodeWorkspace(stored,database,owner,cache=new Map()){
  const value=JSON.parse(stored);if(![FORMAT,LEGACY_FORMAT].includes(value.format))return decodeState(stored);
  const refs=manifestIds(value),missing=[...refs].filter(id=>!cache.has(id));
  // A caller may reuse a cache across rollback revisions, but cached bytes must
  // meet the same hash check as database bytes before they can be trusted.
  for(const id of refs)if(cache.has(id)&&hash(JSON.stringify(cache.get(id)))!==id)corrupt('工作库片段缓存校验失败，停止写入');
  for(let offset=0;offset<missing.length;offset+=90){
    const ids=missing.slice(offset,offset+90);
    const result=await database.prepare(`SELECT digest,state FROM workspace_blobs WHERE owner=? AND digest IN (${ids.map(()=>'?').join(',')})`).bind(owner,...ids).all();
    for(const row of result.results){
      const data=decodeState(row.state);
      if(!ids.includes(row.digest)||hash(JSON.stringify(data))!==row.digest)corrupt('工作库片段校验失败，停止写入');
      cache.set(row.digest,data);
    }
  }
  const get=id=>{if(!refs.has(id)||!cache.has(id))corrupt('工作库片段缺失，停止写入');return structuredClone(cache.get(id));};
  const trees=new Set(value.trees||[]),usedTrees=new Set(),active=new Set();
  const restore=(id,depth=0)=>{
    if(depth>32||!trees.has(id)||active.has(id))corrupt('工作库分层引用无效');
    active.add(id);usedTrees.add(id);const node=get(id);let result;
    if(!object(node))corrupt('工作库分层片段无效');
    if(node.kind==='value'&&own(node,'value')&&Object.keys(node).length===2)result=node.value;
    else if(node.kind==='map'&&object(node.entries)&&Object.keys(node).length===2)result=Object.fromEntries(Object.entries(node.entries).map(([key,ref])=>[key,restore(ref,depth+1)]));
    else if(node.kind==='array'&&Array.isArray(node.items)&&Object.keys(node).length===2)result=node.items.map(ref=>restore(ref,depth+1));
    else if(node.kind==='object'&&object(node.fields)&&Object.keys(node).length===3){
      const base=restore(node.base,depth+1);
      if(!object(base)||Object.keys(node.fields).some(key=>own(base,key)))corrupt('工作库分层字段重复或无效');
      result={...base,...Object.fromEntries(Object.entries(node.fields).map(([key,ref])=>[key,restore(ref,depth+1)]))};
    }else corrupt('工作库分层片段格式无效');
    active.delete(id);return result;
  };
  const state={...value.shape,novels:{},requests:Object.fromEntries(Object.entries(value.shape.requests||{}).map(([id,ref])=>[id,get(ref)]))};
  for(const [id,book]of Object.entries(value.shape.novels)){
    const novel=get(book.metadata);if(!object(novel))corrupt('作品元数据片段无效');
    for(const section of collections)if(value.format===LEGACY_FORMAT||own(book,section))novel[section]=Object.fromEntries(Object.entries(book[section]||{}).map(([key,ref])=>[key,get(ref)]));
    if(value.format===FORMAT)for(const section of ['story','writing'])if(own(book,section)){
      if(own(novel,section))corrupt('作品分层字段重复');
      novel[section]=restore(book[section]);
    }
    state.novels[id]=novel;
  }
  if(usedTrees.size!==trees.size)corrupt('工作库分层索引存在未引用片段');
  return state;
}
