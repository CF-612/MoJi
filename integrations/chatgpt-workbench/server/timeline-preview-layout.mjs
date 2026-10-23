import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {DEFAULT_LAYOUT} from '../vendor/cuigengji/src/domain/card-timeline.mjs';
// Dedicated scratch persistence. Never writes novel facts, references or evidence.
export function createPreviewLayouts(directory){
 const pending=new Map();
 const path=id=>{if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('作品标识无效');return join(directory,`timeline-layout-${id}.json`);};
 const get=async id=>{try{return JSON.parse(await readFile(path(id),'utf8'));}catch(e){if(e.code==='ENOENT')return structuredClone(DEFAULT_LAYOUT);throw e;}};
 const save=(id,args)=>{
  const job=(pending.get(id)||Promise.resolve()).catch(()=>{}).then(async()=>{
   const previous=await get(id);if(previous.revision!==args.expectedRevision)throw Object.assign(new Error('安排已被另一窗口修改，已保留本地草稿。请重新读取后再试。'),{code:'CONFLICT'});
   const {tracks,placements}=args.value||{};
   if(!Array.isArray(tracks)||!tracks.length||tracks.length>100||new Set(tracks.map(t=>t.id)).size!==tracks.length)throw Error('轨道无效');
   if(tracks.some(t=>!/^[-a-zA-Z0-9_]{1,80}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>80||!/^#[a-fA-F0-9]{6}$/.test(t.color)))throw Error('轨道名称或颜色无效');
   if(!placements||Array.isArray(placements)||typeof placements!=='object'||Object.keys(placements).length>10000)throw Error('安排无效');
   for(const [key,p]of Object.entries(placements)){
    if(!/^(planning|event|foreshadow|person):[a-zA-Z0-9:_-]+$/.test(key)||!p||typeof p!=='object'||Object.keys(p).some(k=>!['trackId','color','narration','story'].includes(k)))throw Error('只能保存时间线安排');
    if(p.trackId&&!tracks.some(t=>t.id===p.trackId)||p.color&&!/^#[a-fA-F0-9]{6}$/.test(p.color))throw Error('卡片轨道或颜色无效');
    for(const mode of ['narration','story'])if(p[mode]!=null){for(const point of [p[mode].start,p[mode].end])if(!point||!/^[-a-zA-Z0-9:_]{1,150}$/.test(point.anchorId)||!Number.isFinite(point.offset)||point.offset<0||point.offset>=1)throw Error('时间位置无效');}
   }
   const next={revision:previous.revision+1,tracks:structuredClone(tracks),placements:structuredClone(placements)};
   await mkdir(directory,{recursive:true});const file=path(id),temp=file+'.tmp';await writeFile(temp,JSON.stringify(next,null,2));await rename(temp,file);return next;
  });pending.set(id,job);return job;
 };
 return {get,save};
}
