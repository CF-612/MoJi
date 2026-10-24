import {avatarSource} from './avatar-presets.js';
import {linkedTypeLabels} from '../features/chapters/linked-prose-highlights.mjs';
import {storyTimeLabel} from './story-time-label.mjs';
import {useModules} from '../modules/context.tsx';
import React from 'react';
import {chapterShadows} from './useStoryLinks.js';
import {Icon} from './icons.tsx';
const uniqueObjects=items=>[...new Map(items.map(item=>[item.id,item])).values()];
export function ChapterRibbon({call,novelId,tick,chapterId,onMemory,onStoryCard,onForeshadow,resource,highlightControl}){
 const modules=useModules(),data=resource?.value;
 if(!data)return resource.error?<p className="notice">联动资料读取失败，正文草稿仍保留。</p>:null;
 const people=uniqueObjects(data.nodes.filter(n=>!n.deleted&&data.links.some(l=>l.nodeId===n.id&&l.chapterId===chapterId&&!l.deleted&&!l.excluded)));
 const cards=uniqueObjects(data.cards.filter(c=>!c.deleted&&c.chapterIds.includes(chapterId))),shadows=modules.foreshadow?uniqueObjects(chapterShadows(data,chapterId).filter(f=>!f.deleted)):[];
 if(!people.length&&!cards.length&&!shadows.length&&!highlightControl?.total)return null;
 const status=f=>f.review?'依据待复核':{planned:'计划',planted:'埋设',developing:'推进',partial:'部分回收',recovered:'已回收',abandoned:'已放弃'}[f.status];
 return <aside className="chapter-ribbon linked-compact" aria-label="本章故事联动"><header className="chapter-ribbon-heading"><h3>本章关联卡片 <small>{people.length+cards.length+shadows.length}</small></h3>{highlightControl&&<button type="button" className="linked-visibility" aria-label={highlightControl.enabled?'隐藏关联高亮':'显示关联高亮'} aria-pressed={highlightControl.enabled} onPointerDown={highlightControl.onPointerDown} onClick={highlightControl.onToggle}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>{highlightControl.enabled?'高亮已开':'显示高亮'}</button>}</header>{highlightControl?.enabled&&<div className="chapter-highlight-status" role="status"><span className="chapter-highlight-key" aria-label="关联类型颜色；重叠处用多条色线表示">{Object.entries(linkedTypeLabels).map(([type,label])=><span key={type} style={{'--linked-tone':`var(--linked-${type})`}}>{label}</span>)}</span>{highlightControl.skipped>0&&<small>部分依据已变化，未高亮</small>}</div>}
 <div className="linked-groups">{people.length>0&&<section className="linked-group" aria-label="关联人物与世界书"><h4>资料</h4><div className="chapter-reference-cards">{people.map(n=><button className="chapter-reference" key={n.id} title={n.name} style={{'--linked-tone':`var(--linked-${n.type==='character_card'?'character':'world'})`}} onClick={()=>onMemory(n.id)}><span className="reference-avatar">{avatarSource(n.avatarImage)?<img src={avatarSource(n.avatarImage)} alt=""/>:Array.from(n.name)[0]}</span><strong>{n.name}</strong></button>)}</div></section>}
 {cards.length>0&&<section className="linked-group" aria-label="本章剧情卡"><h4>剧情</h4><div className="chapter-reference-cards">{cards.map(c=>{const detail=storyTimeLabel(c,data.state.storyAxis)+' · '+((c.evidence||[]).some(e=>e.chapterId===chapterId)?'有正文依据':'计划');return <button className="chapter-reference" key={c.id} title={c.title+' · '+detail} style={{'--linked-tone':'var(--linked-card)'}} onClick={()=>onStoryCard?.(c.id)}><Icon name="route"/><strong>{c.title}</strong><span className="sr-only">{detail}</span></button>;})}</div></section>}
 {shadows.length>0&&<section className="linked-group" aria-label="本章伏笔"><h4>伏笔</h4><div className="chapter-reference-cards">{shadows.map(f=><button className="chapter-reference" key={f.id} title={f.title+' · '+status(f)} style={{'--linked-tone':'var(--linked-foreshadow)'}} onClick={()=>onForeshadow(f.id)}><Icon name="bookmark"/><strong>{f.title}</strong><small className="linked-stage">{status(f)}</small></button>)}</div></section>}</div></aside>;
}
