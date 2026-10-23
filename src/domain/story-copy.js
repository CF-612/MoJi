import {narrationTrackCatalog,storyTrackCatalog} from './story-tracks.mjs';
import {randomUUID} from 'node:crypto';import {emptyWorkspace,reconcile,clone} from './story-workspace.mjs';import {storySources} from './story-v31.js';
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export function storyAxisCompatible(a,b){
 if(!a||!b)return true;
 const domain=axis=>[axis.schemaVersion,axis.calendar?.kind,axis.calendar?.kind==='custom'?axis.calendar.monthLengths:null,axis.coordinateUnit,axis.anchor?.coordinate];
 return JSON.stringify(canonical(domain(a)))===JSON.stringify(canonical(domain(b)));
}
export function copyStory(source,target,maps){if(!source.story)return;
 const s=source.story.state;
 if(!storyAxisCompatible(s.storyAxis,target.story?.state?.storyAxis))throw Object.assign(new Error('两部作品的故事时间坐标系不同；请分别导入，或先由作者明确统一历法与锚点。'),{code:'STORY_AXIS_INCOMPATIBLE'});
 const data=target.story??={state:emptyWorkspace(),history:[],redo:[]},before=clone(data.state),out=data.state,ids=maps.story;
 const ref=value=>{if(value==='root')return value;const [kind,id]=value.split(':');return kind+':'+({card:ids,volume:maps.volumes,chapter:maps.chapters}[kind]?.get(id)||id);};
 const oldNarration=narrationTrackCatalog(out).map(t=>t.id),oldStory=storyTrackCatalog(out.storyAxis,out.tracks).map(t=>({trackId:t.id,...(t.trackSource?{trackSource:t.trackSource}:{})}));
 const tracks=new Map(s.tracks.map(t=>[t.id,randomUUID()])),evidence=e=>e?{...e,chapterId:maps.chapters.get(e.chapterId)}:null;
 for(const t of s.tracks)out.tracks.push({...clone(t),id:tracks.get(t.id)});
 const storyTracks=new Map((s.storyAxis?.tracks||[]).map(t=>[t.id,randomUUID()]));
 if(s.narrationTrackOrder||out.narrationTrackOrder)out.narrationTrackOrder=[...oldNarration,...narrationTrackCatalog(s).map(t=>tracks.get(t.id))];
 const mappedRef=t=>({...clone(t),trackId:(t.trackSource==='shared'?tracks:storyTracks).get(t.trackId)});
 if(s.storyAxis){
  const axis=clone(s.storyAxis);
  if(axis.trackOrder)axis.trackOrder=axis.trackOrder.map(mappedRef);
  if(axis.trackSides)axis.trackSides=axis.trackSides.map(mappedRef);
  const combinedOrder=(out.storyAxis?.trackOrder||s.storyAxis.trackOrder)?[...oldStory,...storyTrackCatalog(s.storyAxis,s.tracks).map(t=>mappedRef({trackId:t.id,...(t.trackSource?{trackSource:t.trackSource}:{})}))]:undefined;
  axis.tracks=(axis.tracks||[]).map(t=>({...t,id:storyTracks.get(t.id)}));
  axis.markers=(axis.markers||[]).map(m=>({...m,id:randomUUID()}));
  if(axis.anchor?.chapterId){if(maps.chapters.has(axis.anchor.chapterId))axis.anchor.chapterId=maps.chapters.get(axis.anchor.chapterId);else delete axis.anchor.chapterId;}
  if(!out.storyAxis)out.storyAxis=axis;
  else {out.storyAxis.tracks.push(...axis.tracks);out.storyAxis.markers.push(...axis.markers);if(axis.trackSides)out.storyAxis.trackSides=[...(out.storyAxis.trackSides||[]),...axis.trackSides];}
  if(combinedOrder)out.storyAxis.trackOrder=combinedOrder;
 }
 for(const c of Object.values(s.cards)){const id=ids.get(c.id),value=clone(c);value.id=id;value.cast=value.cast.map(p=>({...p,nodeId:maps.nodes.get(p.nodeId)})).filter(p=>p.nodeId);value.scope=value.scope.map(id=>maps.chapters.get(id)).filter(Boolean);value.evidence=value.evidence.map(evidence);value.foreshadowRefs=value.foreshadowRefs.map(id=>maps.foreshadows?.get(id)).filter(Boolean);for(const mode of ['narration','story'])if(value.time[mode]){value.time[mode].trackId=(mode==='story'&&value.time[mode].axisVersion===1&&value.time[mode].trackSource!=='shared'?storyTracks:tracks).get(value.time[mode].trackId)||value.time[mode].trackId;if(mode==='narration')for(const key of ['startChapterId','endChapterId'])value.time[mode][key]=maps.chapters.get(value.time[mode][key]);}value.points=value.points.map(p=>({...p,id:randomUUID(),location:{...p.location,...(p.location?.narration?{narration:{...p.location.narration,chapterId:maps.chapters.get(p.location.narration.chapterId)}}:{})},relationships:(p.relationships||[]).map(r=>({...r,id:randomUUID(),from:maps.nodes.get(r.from),to:maps.nodes.get(r.to),evidence:evidence(r.evidence)}))}));out.cards[id]=value;}
 for(const [key,p]of Object.entries(s.placements))out.placements[ref(key)]={...clone(p),parent:ref(p.parent),...(p.attachment?{attachment:{...p.attachment,ref:ref(p.attachment.ref)}}:{})};
 for(const page of s.pages)out.pages.push({...clone(page),id:randomUUID(),name:source.title+' · '+page.name,generated:false,...(page.outline?{outline:{...clone(page.outline),refs:page.outline.refs.map(ref)}}:{}),instances:Object.fromEntries(Object.entries(page.instances).map(([id,p])=>[ref(id),clone(p)]))});
 out.precedence.push(...s.precedence.map(e=>({...e,id:randomUUID(),from:ref(e.from),to:ref(e.to)})));reconcile(out,storySources(target));out.revision++;data.history.push({state:before,at:new Date().toISOString(),reason:'导入统一剧情卡'});data.history=data.history.slice(-30);data.redo=[];
}
export function copyAppearance(node,maps){const remap=p=>p?{...p,chapterId:maps.chapters.get(p.chapterId)||null}:p;node.appearancePlan=remap(node.appearancePlan);node.versions=(node.versions||[]).map(v=>({...v,value:{...v.value,appearancePlan:remap(v.value.appearancePlan),sources:(v.value.sources||[]).map(e=>({...e,chapterId:maps.chapters.get(e.chapterId)})).filter(e=>e.chapterId)}}));}
