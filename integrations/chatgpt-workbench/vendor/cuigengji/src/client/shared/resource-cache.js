// Session memory only: presentation cache, never a substitute for a server read or CAS.
export function createResourceCache(limit=80){
 const values=new Map();let epoch=0;
 return {
  epoch:()=>epoch,
  get(key){const entry=values.get(key);if(entry){values.delete(key);values.set(key,entry);}return entry;},
  put(key,value,started=epoch){if(!key||started!==epoch||value===null)return false;values.delete(key);values.set(key,{value,updatedAt:Date.now()});while(values.size>limit)values.delete(values.keys().next().value);return true;},
  invalidate(){epoch++;},
  remove(key){values.delete(key);},
 };
}
export const resourceCache=createResourceCache();
export const resourceKey=(scope,key)=>key?JSON.stringify([scope,key]):null;
export async function preloadResource(scope,key,loader){const id=resourceKey(scope,key),epoch=resourceCache.epoch(),value=await loader();resourceCache.put(id,value,epoch);return value;}
