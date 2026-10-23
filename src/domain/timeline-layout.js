// Presentation metadata; never modify prose, references or evidence.
export const defaultTimelineLayout=()=>({revision:0,tracks:[{id:'main',name:'主线',color:'#67889b'}],placements:{}});
export function validateTimelineLayout(value){
   const {tracks,placements}=value||{};
   if(!Array.isArray(tracks)||!tracks.length||tracks.length>100||new Set(tracks.map(t=>t.id)).size!==tracks.length)throw Error('轨道无效');
   if(tracks.some(t=>!/^[-a-zA-Z0-9_]{1,80}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>80||!/^#[a-fA-F0-9]{6}$/.test(t.color)))throw Error('轨道名称或颜色无效');
   if(!placements||Array.isArray(placements)||typeof placements!=='object'||Object.keys(placements).length>10000)throw Error('安排无效');
   for(const [key,p]of Object.entries(placements)){
    if(!/^(planning|event|foreshadow|person):[a-zA-Z0-9:_-]+$/.test(key)||!p||typeof p!=='object'||Object.keys(p).some(k=>!['trackId','color','narration','story'].includes(k)))throw Error('只能保存时间线安排');
    if(p.trackId&&!tracks.some(t=>t.id===p.trackId)||p.color&&!/^#[a-fA-F0-9]{6}$/.test(p.color))throw Error('卡片轨道或颜色无效');
    for(const mode of ['narration','story'])if(p[mode]!=null){for(const point of [p[mode].start,p[mode].end])if(!point||!/^[-a-zA-Z0-9:_]{1,150}$/.test(point.anchorId)||!Number.isFinite(point.offset)||point.offset<0||point.offset>=1)throw Error('时间位置无效');}
   }
 return {tracks:structuredClone(tracks),placements:structuredClone(placements)};
}
export function timelineLayoutAction(novel,action,args,actor){
 const previous=novel.timelineLayout||defaultTimelineLayout();
 if(action==='timeline.layout.get')return structuredClone(previous);
 if(actor.kind!=='human')throw Object.assign(new Error('时间线安排由作者修改'),{code:'FORBIDDEN'});
 if(!Number.isSafeInteger(args.expectedRevision)||previous.revision!==args.expectedRevision)throw Object.assign(new Error('安排已被另一端修改，请重新读取；本地草稿保留。'),{code:'CONFLICT'});
 const next={...validateTimelineLayout(args.value),revision:previous.revision+1};novel.timelineLayout=next;return structuredClone(next);
}
