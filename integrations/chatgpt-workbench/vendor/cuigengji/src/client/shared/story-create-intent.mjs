/** Keep the complete original RPC payload, not just its UUID: receipt fingerprints include revision and position. */
export function storyCreateIntent(novelId,state,operation,requestId=crypto.randomUUID()){
 return {novelId,requestId,expectedRevision:state.revision,operation:structuredClone(operation)};
}
export function persistStoryCreateIntent(storage,key,intent){
 if(intent)storage.setItem(key,JSON.stringify(intent));else storage.removeItem(key);
}
export function readStoryCreateIntent(storage,key,novelId){
 try{const value=JSON.parse(storage.getItem(key));return value?.novelId===novelId&&typeof value.requestId==='string'&&value.requestId.length>0&&Number.isSafeInteger(value.expectedRevision)&&value.expectedRevision>=0&&value.operation?.type==='card.create'&&typeof value.operation.value?.title==='string'?value:null;}catch{return null;}
}
