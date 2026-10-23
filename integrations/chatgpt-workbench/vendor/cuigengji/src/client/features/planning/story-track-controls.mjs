import {storyTrackReference} from '../../../domain/story-tracks.mjs';
// Reorder by source-aware keys; cancel/unknown/no-op drops emit no mutation.
export function storyTrackDropOrder(catalog,dragKey,targetKey,after=false){
 const keys=catalog.map(t=>t.key);
 if(!keys.includes(dragKey)||!keys.includes(targetKey)||dragKey===targetKey)return null;
 const next=keys.filter(k=>k!==dragKey),at=next.indexOf(targetKey)+(after?1:0);next.splice(at,0,dragKey);
 return next.every((k,i)=>k===keys[i])?null:next.map(storyTrackReference);
}
export function storyTrackRenameOperation(track,name){
 name=name.trim();if(!name||name===track.name)return null;
 return {type:track.trackSource==='shared'?'track.update':'storyAxis.track.update',id:track.id,name,color:track.color,...(track.trackSource==='shared'?{}:{side:track.side})};
}

// Use live DOM rectangles, not the painted topmost element: sticky headers,
// connector overlays and host layers must not swallow a valid lane drop.
export function storyTrackPointerTarget(controls,viewport,catalog,gesture,x,y){
 const none={target:null,side:null,after:false},inside=r=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
 for(const zone of controls?.querySelectorAll('[data-track-side-drop]')||[])if(inside(zone.getBoundingClientRect()))return {...none,side:zone.dataset.trackSideDrop};
 for(const row of controls?.querySelectorAll('[data-track-row]')||[]){const r=row.getBoundingClientRect();if(r.width&&r.height&&inside(r))return {...none,target:row.dataset.trackRow,after:x>r.left+r.width/2};}
 if(!viewport||!inside(viewport.getBoundingClientRect()))return none;
 const originSide=gesture.originSide||catalog.find(t=>t.key===gesture.key)?.side;
 for(const lane of viewport.querySelectorAll('[data-story-space]')){const r=lane.getBoundingClientRect();if(!inside(r))continue;if(originSide!==lane.dataset.storySpace)return {...none,side:lane.dataset.storySpace};return {...none,target:lane.dataset.storyTrack||null,after:y>r.top+r.height/2};}
 return none;
}
