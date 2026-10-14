import {useModules} from '../modules/context.tsx';
import React from 'react';
import {useBoard} from '../features/structure/useBoard.js';
const names={plant:'埋设',progress:'推进',recover:'回收',target:'计划回收'};
export function ChapterRibbon({call,novelId,tick,chapterId,onMemory,onEvent,onForeshadow}){
 const modules=useModules();
 const resource=useBoard(call,novelId,tick),board=resource.value,ch=board?.chapters.find(c=>c.id===chapterId);
 if(!ch)return null;
 return <aside className="chapter-ribbon" aria-label="本章故事联动">{modules.timeline&&<div className="ribbon-track"><small>事件</small>{ch.events.length?ch.events.map(id=><button key={id} onClick={()=>onEvent(id)}>{board.events.find(e=>e.id===id)?.title}</button>):<span>尚未关联</span>}</div>}<div className="ribbon-track"><small>人物出场</small>{[...new Set(ch.characters.map(p=>p.id))].map(id=><button key={id} onClick={()=>onMemory(id)}>{board.nodes.find(n=>n.id===id)?.name}</button>)}{!ch.characters.length&&<span>在本章资料中确认</span>}</div>{modules.foreshadow&&<div className="ribbon-track"><small>伏笔</small>{ch.foreshadows.length?ch.foreshadows.map((r,i)=><button key={i} data-kind={r.kind} onClick={()=>onForeshadow(r.id)}>{names[r.kind]} · {board.foreshadows.find(f=>f.id===r.id)?.title}</button>):<span>尚无记录</span>}</div>}{resource.error&&<small className="notice">联动资料未更新，正文草稿仍保留。</small>}</aside>;
}
