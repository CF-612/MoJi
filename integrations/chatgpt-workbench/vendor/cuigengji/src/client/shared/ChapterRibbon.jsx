import {useModules} from '../modules/context.tsx';
import React from 'react';
import {useStoryLinks,chapterShadows} from './useStoryLinks.js';
import {Icon} from './icons.tsx';
export function ChapterRibbon({call,novelId,tick,chapterId,onMemory,onStoryCard,onForeshadow}){
 const modules=useModules(),resource=useStoryLinks(call,novelId,tick),data=resource.value;
 if(!data)return resource.error?<p className="notice">联动资料读取失败，正文草稿仍保留。</p>:null;
 const people=data.nodes.filter(n=>data.links.some(l=>l.nodeId===n.id&&l.chapterId===chapterId&&l.kind==='appearance'&&!l.excluded&&!l.review));
 const cards=data.cards.filter(c=>c.chapterIds.includes(chapterId)),shadows=modules.foreshadow?chapterShadows(data,chapterId):[];
 if(!people.length&&!cards.length&&!shadows.length)return null;
 return <aside className="chapter-ribbon" aria-label="本章故事联动">{people.length>0&&<section><h3>正文确认出场</h3><div className="chapter-reference-cards">{people.map(n=><button className="chapter-reference" key={n.id} onClick={()=>onMemory(n.id)}><span className="reference-avatar">{n.avatarImage?<img src={n.avatarImage} alt=""/>:n.name.slice(0,1)}</span><strong>{n.name}</strong></button>)}</div></section>}{cards.length>0&&<section><h3>本章剧情卡</h3><div className="chapter-reference-cards">{cards.map(c=><button className="chapter-reference" key={c.id} onClick={()=>onStoryCard?.(c.id)}><Icon name="route"/><span><strong>{c.title}</strong><small>{c.storyDateText||'剧情安排'} · {(c.evidence||[]).some(e=>e.chapterId===chapterId)?'有正文依据':'计划'}</small></span></button>)}</div></section>}{shadows.length>0&&<section><h3>本章伏笔</h3><div className="chapter-reference-cards">{shadows.map(f=><button className="chapter-reference" key={f.id} onClick={()=>onForeshadow(f.id)}><Icon name="bookmark"/><span><strong>{f.title}</strong><small>{f.review?'依据待复核':{planned:'计划',planted:'埋设',developing:'推进',partial:'部分回收',recovered:'已回收',abandoned:'已放弃'}[f.status]}</small></span></button>)}</div></section>}</aside>;
}
