import {useModules} from '../modules/context.tsx';
import React from 'react';
import {useBoard} from '../features/structure/useBoard.js';
import {Icon} from './icons.tsx';
const names={plant:'埋设',progress:'推进',recover:'回收',target:'计划回收'};
export function ChapterRibbon({call,novelId,tick,chapterId,onMemory,onEvent,onForeshadow}){
 const modules=useModules(),resource=useBoard(call,novelId,tick),board=resource.value,ch=board?.chapters.find(c=>c.id===chapterId);
 if(!ch)return null;
 const people=[...new Set((ch.characters||[]).map(p=>p.id))].filter(id=>board.chapters.find(c=>(c.characters||[]).some(p=>p.id===id))?.id===chapterId),events=modules.timeline?ch.events:[],shadows=modules.foreshadow?ch.foreshadows:[];
 if(!people.length&&!events.length&&!shadows.length)return resource.error?<p className="notice">联动资料未更新，正文草稿仍保留。</p>:null;
 return <aside className="chapter-ribbon" aria-label="本章故事联动">{people.length>0&&<section><h3>首次出场人物</h3><div className="chapter-reference-cards">{people.map(id=>{const node=board.nodes.find(n=>n.id===id);return <button className="chapter-reference" key={id} onClick={()=>onMemory(id)}><span className="reference-avatar">{node?.avatarImage?<img src={node.avatarImage} alt=""/>:node?.name.slice(0,1)||'人'}</span><span><strong>{node?.name}</strong><small>首次出场</small></span><Icon name="arrow"/></button>;})}</div></section>}{events.length>0&&<section><h3>本章事件</h3><div className="chapter-reference-cards">{events.map(id=><button className="chapter-reference" key={id} onClick={()=>onEvent(id)}><Icon name="route"/><span><strong>{board.events.find(e=>e.id===id)?.title}</strong><small>关联事件</small></span><Icon name="arrow"/></button>)}</div></section>}{shadows.length>0&&<section><h3>伏笔</h3><div className="chapter-reference-cards">{shadows.map((r,i)=><button className="chapter-reference" key={i} onClick={()=>onForeshadow(r.id)}><Icon name="bookmark"/><span><strong>{board.foreshadows.find(f=>f.id===r.id)?.title}</strong><small>{names[r.kind]}</small></span><Icon name="arrow"/></button>)}</div></section>}</aside>;
}
