// Match the host's durable-record seam, including its two legal record kinds.
export function testCredentials(){
  const records=new Map();
  return {readRecord:async key=>structuredClone(records.get(key)),
    modifyRecord:async(key,mutate)=>{const next=await mutate(structuredClone(records.get(key)));if(next&&!['grant','api-key'].includes(next.kind))throw new Error('Invalid credential record');if(next)records.set(key,structuredClone(next));else records.delete(key);return next;},
    deleteRecord:async key=>{records.delete(key);}};
}
