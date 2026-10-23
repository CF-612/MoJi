/** Read-only catalog. Same IDs/names in the two legacy stores never imply identity. */
export function storyTrackKey(time){return `${time?.trackSource==='shared'?'shared':'story'}:${encodeURIComponent(time?.trackId||'')}`;}
export function storyTrackReference(key){const at=key.indexOf(':'),source=key.slice(0,at),id=decodeURIComponent(key.slice(at+1));return {trackId:id,...(source==='shared'?{trackSource:'shared'}:{})};}
function rawStoryTracks(axis,shared=[]){return [...shared.map(t=>({...t,trackSource:'shared',key:storyTrackKey({trackId:t.id,trackSource:'shared'})})),...(axis?.tracks||[]).map(t=>({...t,key:storyTrackKey({trackId:t.id})}))];}
export function resolveStoryTrack(time,axis,shared=[]){return (time?.trackSource==='shared'?shared:axis?.tracks||[]).find(t=>t.id===time?.trackId);}
export function storyTrackSide(time,axis,shared=[]){return axis?.trackSides?.find(t=>storyTrackKey(t)===storyTrackKey(time))?.side||resolveStoryTrack(time,axis,shared)?.side||'above';}
export function storyPlacementSide(time,axis,shared=[]){return time?.side||storyTrackSide(time,axis,shared);}
function ordered(list,order,key){const rank=new Map((order||[]).map((t,i)=>[key(t),i]));return list.slice().sort((a,b)=>(rank.get(key(a))??Infinity)-(rank.get(key(b))??Infinity));}
export function narrationTrackCatalog(state){return ordered(state.tracks,state.narrationTrackOrder,t=>typeof t==='string'?t:t.id);}
export function storyTrackCatalog(axis,shared=[]){return ordered(rawStoryTracks(axis,shared),axis?.trackOrder,t=>t.key||storyTrackKey(t)).map(t=>({...t,side:storyTrackSide({trackId:t.id,trackSource:t.trackSource},axis,shared)}));}
const fail=message=>{throw Object.assign(new Error(message),{code:'STORY_INVALID'});};
const validRef=t=>t&&typeof t.trackId==='string'&&(t.trackSource===undefined||t.trackSource==='shared');
export function validateTrackPreferences(state){
 const axis=state.storyAxis,known=new Set(rawStoryTracks(axis,state.tracks).map(t=>t.key));
 if(state.narrationTrackOrder!==undefined){const order=state.narrationTrackOrder;if(!Array.isArray(order)||new Set(order).size!==order.length||order.some(id=>!state.tracks.some(t=>t.id===id)))fail('叙述轨道顺序无效。');}
 for(const field of ['trackOrder','trackSides'])if(axis?.[field]!==undefined){const list=axis[field];if(!Array.isArray(list)||list.some(t=>!validRef(t)||!known.has(storyTrackKey(t))||(field==='trackSides'&&!['above','below'].includes(t.side)))||new Set(list.map(storyTrackKey)).size!==list.length)fail('故事轨道顺序或上下位置无效。');}
}
export function reorderTracks(state,op){
 if(!['narration','story'].includes(op.mode)||!Array.isArray(op.order))fail('请指定时间视图和完整轨道顺序。');
 if(op.mode==='story'&&!state.storyAxis)fail('请先设置故事时间轴。');
 const list=op.mode==='story'?rawStoryTracks(state.storyAxis,state.tracks):state.tracks.map(t=>({key:storyTrackKey({trackId:t.id})}));
 if(op.order.some(t=>!validRef(t)||(op.mode==='narration'&&t.trackSource!==undefined))||op.order.length!==list.length||new Set(op.order.map(storyTrackKey)).size!==list.length||op.order.some(t=>!list.some(x=>x.key===storyTrackKey(t))))fail('轨道顺序必须完整且不能重复。');
 if(op.mode==='narration')state.narrationTrackOrder=op.order.map(t=>t.trackId);
 else state.storyAxis.trackOrder=op.order.map(t=>({trackId:t.trackId,...(t.trackSource?{trackSource:t.trackSource}:{})}));
}
export function setStoryTrackSide(state,op){
 if(!state.storyAxis||!validRef(op)||!resolveStoryTrack(op,state.storyAxis,state.tracks)||!['above','below'].includes(op.side))fail('故事轨道或上下位置无效。');
 const ref={trackId:op.trackId,...(op.trackSource?{trackSource:op.trackSource}:{}),side:op.side};
 state.storyAxis.trackSides=[...(state.storyAxis.trackSides||[]).filter(t=>storyTrackKey(t)!==storyTrackKey(ref)),ref];
 for(const card of Object.values(state.cards)){const time=card.time?.story;if(time?.axisVersion===1&&storyTrackKey(time)===storyTrackKey(ref)&&time.side!==op.side){time.side=op.side;card.revision++;}}
}
