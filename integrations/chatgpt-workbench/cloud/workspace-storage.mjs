import {createHash} from 'node:crypto';
import {encodeState,decodeState,MAX_RAW_BYTES,MAX_STORED_BYTES} from './state-codec.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=message=>{throw Object.assign(new Error(message),{code:'CAPACITY_LIMIT'});};
const collections=['chapters','nodes','edges'];

// Immutable, owner-scoped fragments make each saved workspace revision cheap:
// unchanged chapters/settings are shared by current data and rollback snapshots.
export function encodeWorkspace(state){
  const rawBytes=Buffer.byteLength(JSON.stringify(state));
  if(rawBytes>MAX_RAW_BYTES)fail('工作库超过 64 MB，请拆分或导出历史；未覆盖保存。');
  if(rawBytes<512_000){const encoded=encodeState(state);return {...encoded,blobs:new Map()};}
  const blobs=new Map(),shape={...state,novels:{},requests:{}};
  const put=value=>{const text=JSON.stringify(value),digest=hash(text);if(!blobs.has(digest))blobs.set(digest,encodeState(value).stored);return digest;};
  shape.requests=Object.fromEntries(Object.entries(state.requests).map(([id,record])=>[id,put(record)]));
  for(const [id,novel]of Object.entries(state.novels)){
    const metadata={...novel},book={metadata:null};
    for(const section of collections){delete metadata[section];book[section]=Object.fromEntries(Object.entries(novel[section]||{}).map(([key,value])=>[key,put(value)]));}
    book.metadata=put(metadata);shape.novels[id]=book;
  }
  const stored=JSON.stringify({format:'cuigengji-workspace-fragments',version:1,shape});
  if(Buffer.byteLength(stored)>MAX_STORED_BYTES)fail('工作库索引超过安全上限，请拆分作品；未覆盖保存。');
  return {stored,rawBytes,storedBytes:Buffer.byteLength(stored)+[...blobs.values()].reduce((n,v)=>n+Buffer.byteLength(v),0),blobs};
}
export function fragmentIds(stored){
  const value=JSON.parse(stored);if(value.format!=='cuigengji-workspace-fragments')return new Set();
  if(value.version!==1||!value.shape?.novels)throw new Error('工作库索引格式无效');
  return new Set([...Object.values(value.shape.requests||{}),...Object.values(value.shape.novels).flatMap(book=>[book.metadata,...collections.flatMap(section=>Object.values(book[section]||{}))])]);
}
export async function decodeWorkspace(stored,database,owner,cache=new Map()){
  const value=JSON.parse(stored);if(value.format!=='cuigengji-workspace-fragments')return decodeState(stored);
  const refs=fragmentIds(stored),missing=[...refs].filter(id=>!cache.has(id));
  for(let offset=0;offset<missing.length;offset+=90){
    const ids=missing.slice(offset,offset+90);if(ids.some(id=>typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id)))throw new Error('工作库片段标识无效');
    const result=await database.prepare(`SELECT digest,state FROM workspace_blobs WHERE owner=? AND digest IN (${ids.map(()=>'?').join(',')})`).bind(owner,...ids).all();
    for(const row of result.results){const data=decodeState(row.state);if(hash(JSON.stringify(data))!==row.digest)throw new Error('工作库片段校验失败，停止写入');cache.set(row.digest,data);}
  }
  const get=id=>{if(!cache.has(id))throw new Error('工作库片段缺失，停止写入');return structuredClone(cache.get(id));};
  const state={...value.shape,novels:{},requests:Object.fromEntries(Object.entries(value.shape.requests||{}).map(([id,ref])=>[id,get(ref)]))};
  for(const [id,book]of Object.entries(value.shape.novels)){
    const novel=get(book.metadata);for(const section of collections)novel[section]=Object.fromEntries(Object.entries(book[section]||{}).map(([key,ref])=>[key,get(ref)]));state.novels[id]=novel;
  }
  return state;
}
