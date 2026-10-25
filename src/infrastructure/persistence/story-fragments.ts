import {createHash} from 'node:crypto';

// Physical MoJi-only codec. The portable/domain object stays unchanged. Current
// entities and history share immutable blobs, so moving one card does not rewrite
// every historic snapshot. Unknown fields remain in their owning metadata blob.
type Row = Record<string, any>;
type Reader = (hash: string) => Promise<unknown>;
export type DeferredSnapshots = WeakMap<object, {descriptor: Row; text: string}>;
const object = (value: any): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const omit = (value: Row, keys: string[]) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
export const fragmentDigest = (value: string) => createHash('sha256').update(value).digest('hex');
const corrupt = (): never => {throw Object.assign(new Error('墨叽剧情／结构资料片段校验失败，未覆盖原数据'), {code:'CORRUPT_STORE'});};
export const validFragmentId = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safeKey = (value: unknown): value is string => typeof value === 'string' && !['__proto__','constructor','prototype'].includes(value);

export function checkFragment(text: string, hash: string): any {
  if (!validFragmentId(hash) || fragmentDigest(text) !== hash) corrupt();
  try {return JSON.parse(text);} catch {return corrupt();}
}
function envelope(kind: string, payload: any) {
  return {format:`moji-${kind}-fragments`, version:1, sha256:fragmentDigest(JSON.stringify(payload)), payload};
}
export function fragmentPayload(index: any, kind: string): any {
  if (!object(index) || index.format !== `moji-${kind}-fragments` || index.version !== 1 || !own(index,'payload') || fragmentDigest(JSON.stringify(index.payload)) !== index.sha256) corrupt();
  return index.payload;
}
const writingCollections = ['fields','cards','links','foreshadows','events','relationshipChanges','relationshipTypes','reviews'];

export function encodeExtension(kind: 'story' | 'writing', value: any, deferred: DeferredSnapshots = new WeakMap()) {
  const blobs = new Map<string,string>();
  const put = (value: unknown) => {const text=JSON.stringify(value), hash=fragmentDigest(text);blobs.set(hash,text);return hash;};
  const entries = (value: Row, encode: (value: any) => any) => Object.entries(value).map(([id,value]) => [id,encode(value)]);
  const state = (value: Row) => ({metadata:put(omit(value,['cards','pages'])), cards:entries(value.cards,put), pages:value.pages.map(put)});
  const snapshot = (value: Row) => {
    const existing=deferred.get(value);
    if (existing) {
      // Partial snapshots are opaque: never persist their content-free preview.
      if (existing.text !== JSON.stringify(value)) corrupt();
      return existing.descriptor;
    }
    return {metadata:omit(value,['state']), revision:value.state.revision, state:state(value.state)};
  };
  let payload:any = value;
  if (value !== null) {
    if (!object(value)) corrupt();
    if (kind === 'story') payload={metadata:put(omit(value,['state','history','redo'])), state:state(value.state), history:value.history.map(snapshot), ...(own(value,'redo')?{redo:value.redo.map(snapshot)}:{})};
    else {
      const collections=writingCollections.filter(key=>own(value,key)&&object(value[key]));
      const record=(row:Row)=>own(row,'versions')?{current:put(omit(row,['versions'])),versions:put(row.versions)}:{current:put(row)};
      payload={metadata:put(omit(value,collections)), collections:Object.fromEntries(collections.map(key=>[key,entries(value[key],record)]))};
    }
  }
  return {index:envelope(kind,payload),blobs};
}

export async function decodeExtension(kind: 'story' | 'writing', index: any, read: Reader, options: {history?:boolean; deferred?:DeferredSnapshots} = {}) {
  const payload=fragmentPayload(index,kind); if(payload===null)return null;
  if(!object(payload))corrupt();
  const get=async(hash:unknown)=>{if(!validFragmentId(hash))corrupt();return read(hash as string);};
  const metadata=async(hash:unknown)=>{const value=await get(hash);if(!object(value))corrupt();return value as Row;};
  const entries=async(rows:any,decode:(value:any)=>Promise<any>)=>{
    if(!Array.isArray(rows))corrupt();const result:Row={};
    for(const row of rows){if(!Array.isArray(row)||row.length!==2||!safeKey(row[0])||own(result,row[0]))corrupt();result[row[0]]=await decode(row[1]);}
    return result;
  };
  const state=async(descriptor:any)=>{
    if(!object(descriptor)||!Array.isArray(descriptor.pages))corrupt();
    const result=await metadata(descriptor.metadata);
    result.cards=await entries(descriptor.cards,get);result.pages=await Promise.all(descriptor.pages.map(get));return result;
  };
  const snapshot=async(descriptor:any)=>{
    if(!object(descriptor)||!object(descriptor.metadata)||!Number.isSafeInteger(descriptor.revision)||!object(descriptor.state))corrupt();
    const value={...structuredClone(descriptor.metadata),state:options.history===false?{revision:descriptor.revision}:await state(descriptor.state)};
    if(value.state.revision!==descriptor.revision)corrupt();
    if(options.history===false)options.deferred?.set(value,{descriptor:structuredClone(descriptor),text:JSON.stringify(value)});
    return value;
  };
  const result=await metadata(payload.metadata);
  if(kind==='story'){
    if(!Array.isArray(payload.history)||(own(payload,'redo')&&!Array.isArray(payload.redo)))corrupt();
    result.state=await state(payload.state);result.history=await Promise.all(payload.history.map(snapshot));
    if(own(payload,'redo'))result.redo=await Promise.all(payload.redo.map(snapshot));
  }else{
    if(!object(payload.collections)||Object.keys(payload.collections).some(key=>!writingCollections.includes(key)))corrupt();
    for(const [key,rows] of Object.entries(payload.collections))result[key]=await entries(rows,async descriptor=>{
      if(!object(descriptor))corrupt();const record=await metadata(descriptor.current);
      if(own(descriptor,'versions')){record.versions=await get(descriptor.versions);if(!Array.isArray(record.versions))corrupt();}return record;
    });
  }
  return result;
}

/** Only codec-owned references are candidates for deletion; unrelated files are
 * never enumerated or removed. This also validates deferred historic manifests. */
export function extensionFragmentIds(kind: 'story'|'writing', index:any): Set<string> {
  const payload=fragmentPayload(index,kind),ids=new Set<string>();if(payload===null)return ids;
  const add=(id:any)=>{if(!validFragmentId(id))corrupt();ids.add(id);};
  const entries=(rows:any,visit:(value:any)=>void)=>{if(!Array.isArray(rows))corrupt();const keys=new Set();for(const row of rows){if(!Array.isArray(row)||row.length!==2||!safeKey(row[0])||keys.has(row[0]))corrupt();keys.add(row[0]);visit(row[1]);}};
  const state=(value:any)=>{if(!object(value)||!Array.isArray(value.pages))corrupt();add(value.metadata);entries(value.cards,add);value.pages.forEach(add);};
  if(!object(payload))corrupt();add(payload.metadata);
  if(kind==='story'){
    state(payload.state);if(!Array.isArray(payload.history)||(own(payload,'redo')&&!Array.isArray(payload.redo)))corrupt();
    for(const row of [...payload.history,...payload.redo||[]]){if(!object(row)||!object(row.metadata)||!Number.isSafeInteger(row.revision))corrupt();state(row.state);}
  }else{
    if(!object(payload.collections)||Object.keys(payload.collections).some(key=>!writingCollections.includes(key)))corrupt();
    for(const rows of Object.values(payload.collections))entries(rows,row=>{if(!object(row))corrupt();add(row.current);if(own(row,'versions'))add(row.versions);});
  }
  return ids;
}
