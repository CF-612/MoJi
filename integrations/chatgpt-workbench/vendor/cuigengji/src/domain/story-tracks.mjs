/** Read-only catalog. Same IDs/names in the two legacy stores never imply identity. */
export function storyTrackKey(time){return `${time?.trackSource==='shared'?'shared':'story'}:${encodeURIComponent(time?.trackId||'')}`;}
export function storyTrackReference(key){const at=key.indexOf(':'),source=key.slice(0,at),id=decodeURIComponent(key.slice(at+1));return {trackId:id,...(source==='shared'?{trackSource:'shared'}:{})};}
export function storyTrackCatalog(axis,shared=[]){return [...shared.map(t=>({...t,trackSource:'shared',key:storyTrackKey({trackId:t.id,trackSource:'shared'})})),...(axis?.tracks||[]).map(t=>({...t,key:storyTrackKey({trackId:t.id})}))];}
export function resolveStoryTrack(time,axis,shared=[]){return (time?.trackSource==='shared'?shared:axis?.tracks||[]).find(t=>t.id===time?.trackId);}
export function storyPlacementSide(time,axis,shared=[]){return time?.side||resolveStoryTrack(time,axis,shared)?.side||'above';}
