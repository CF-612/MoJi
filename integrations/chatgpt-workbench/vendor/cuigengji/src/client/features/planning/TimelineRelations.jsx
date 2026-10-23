import {relationName} from '../../shared/relation-color.mjs';
import {RelationChangeEditor,changeSource} from './RelationChangeEditor.jsx';
import {timelineRelationsStyle} from './timeline-relations-style.mjs';
import {relationEditStyle} from './relation-edit-style.mjs';
import React,{useState,useRef} from 'react';
import {Modal} from '../../shared/preferences.tsx';
import {formatStoryDate} from '../../../domain/story-axis.mjs';
import {relationOverview,pair} from '../../../domain/story-relations.mjs';
import {RelationNetwork} from './RelationNetwork.jsx';

export function TimelineRelations({call,novelId,onCard,state,sources,people,relations,mode,origin,count,cursor,selected,save,unavailable,onMemory,pointLabel,changeCursor,initialPair=null,projection}){
 const [includePlans,setIncludePlans]=useState(true),[editing,setEditing]=useState(null),[adding,setAdding]=useState(false),[query,setQuery]=useState(''),[showAll,setShowAll]=useState(false),[focusPair,setFocusPair]=useState(initialPair),[expanded,setExpanded]=useState(false);
 const characters=people.filter(p=>p.type==='character_card');
 const overview=relationOverview(state.cards,relations,characters,sources.chapters,mode,cursor+origin,includePlans,showAll,{storyAxis:state.storyAxis,relationshipTypes:sources.relationshipTypes});
 const person=id=>characters.find(p=>p.id===id),searchText=r=>[person(r.from)?.name,person(r.to)?.name,relationName(r)].join(' '),filtered=overview.relations.filter(r=>searchText(r).includes(query));
 const history=[...overview.changes,...overview.undated].filter(c=>!focusPair||pair(c.from,c.to)===focusPair),featured=overview.relations.find(r=>pair(r.from,r.to)===focusPair),endpoints=focusPair?characters.filter(p=>focusPair.split(':').includes(p.id)):[];
 const sourceRelation=focusPair?relations.find(r=>!r.deleted&&pair(r.from,r.to)===focusPair):null;
 const locate=change=>changeCursor(change.position-origin),labelAt=position=>mode==='narration'?(sources.chapters[Math.floor(position)]?.title||'未定位章节'):state.storyAxis?formatStoryDate(position,state.storyAxis.calendar):'故事时间 '+position.toFixed(1);
 const avatar=id=>{const p=person(id);return <button className="u-relation-person" onClick={()=>onMemory?.(id)}><span>{p?.avatarImage?<img src={p.avatarImage} alt=""/>:p?.name.slice(0,1)||'?'}</span><strong>{p?.name||'人物已删除'}</strong></button>;};
 const selectPair=key=>{setFocusPair(key);setExpanded(false);};
 const networkProps={overview,focusPair,onPair:selectPair,onPerson:onMemory,query};
 const visibility=<div className="u-network-visibility"><div><button aria-pressed={!showAll} onClick={()=>setShowAll(false)}>随剧情出现</button><button aria-pressed={showAll} onClick={()=>setShowAll(true)}>全部人物</button></div><small>{overview.pending?overview.pending+' 人待出场／未安排':'人物均已出现'}</small></div>;
 return <aside className="u-timeline-relations" aria-label="跟随时间的人物关系演变">
  <style>{timelineRelationsStyle}{relationEditStyle}</style><header className="u-rel-heading"><div><small>全局关系 · 两人历程</small><h3>人物关系演变</h3></div><span className="u-rel-live"><i/> 同步</span></header>
  <div className="u-rel-current"><span>{mode==='narration'?'叙述顺序':'故事时间'} · 当前查看</span><strong>{pointLabel}</strong></div>
  <RelationTimeBar projection={projection} count={count} cursor={cursor} changes={history} origin={origin} changeCursor={changeCursor} pointLabel={pointLabel}/>
  <div className="re-modes re-plan-toggle" role="group" aria-label="关系历程范围"><button aria-pressed={!includePlans} onClick={()=>setIncludePlans(false)}>已确认变化</button><button aria-pressed={includePlans} onClick={()=>setIncludePlans(true)}>含计划预览</button></div>
  <div className="u-rel-scroll">
   {focusPair?<><button className="u-rel-back" onClick={()=>setFocusPair(null)}>← 返回全局关系图</button><section className={'u-rel-feature '+(featured?.planned?'planned':'')} aria-label="两人关系快照"><div className="u-rel-pair">{avatar(endpoints[0]?.id)}<div className="u-rel-bridge"><span/><strong>{relationName(featured)||'此刻尚无关系'}</strong><small>{featured?.planned?'计划变化':featured?.evidence?'正文已确认':featured?'资料设定':'可查看下方未来变化'}</small></div>{avatar(endpoints[1]?.id)}</div>{!featured&&sourceRelation&&<p>资料设定：{relationName(sourceRelation)||'未命名关系'}。此刻尚未出现，设定保留在完整关系图中。</p>}{featured?.reason&&<p>{featured.reason}</p>}{featured?.planned&&<small>关联剧情：{featured.cardTitle}</small>}</section></>:<>
    <div className="u-network-heading"><h4>关系全景</h4><button onClick={()=>setExpanded(true)}>展开查看 ↗</button></div>{visibility}<RelationNetwork {...networkProps}/>
    <div className="u-rel-list-head"><input aria-label="搜索人物关系" placeholder="搜索人物或关系" value={query} onChange={e=>setQuery(e.target.value)}/><h4>{showAll?'关系概览':'此刻的关系'} <small>{filtered.length} · 点连线或列表查看两人历程</small></h4></div>
    <div className="u-rel-pairs">{filtered.map(r=><button key={pair(r.from,r.to)} onClick={()=>selectPair(pair(r.from,r.to))}><span>{person(r.from)?.name}<small> ↔ </small>{person(r.to)?.name}</span><strong>{relationName(r)}<small>{r.planned?'计划':r.evidence?'已确认':'设定'}</small></strong></button>)}</div>
   </>}
   <section className="u-rel-history"><header><h4>{focusPair?'这两人的变化':'全局关键变化'}</h4><button disabled={unavailable||characters.length<2||!Object.values(state.cards).some(c=>c.status!=='dropped')} onClick={()=>setAdding(true)}>＋ 添加变化</button></header>
    {!history.length&&<p>{includePlans?'尚无关系变化节点，可先添加计划。':'还没有正文确认的变化，可切换到含计划预览。'}</p>}
    {history.map(change=><article key={change.id} className={'re-history-card '+(change.planned?'planned':'confirmed')+(change.review?' review':'')}><header><span>{change.position===null?'此时间轴未定位':labelAt(change.position)}</span><span className={'re-badge '+(change.review?'review':change.planned?'planned':'confirmed')}>{change.review?'依据待复核':change.planned?'计划':'正文已确认'}</span></header><strong>{person(change.from)?.name} ↔ {person(change.to)?.name}</strong><b>{relationName(change)}</b>{change.reason&&<p>{change.reason}</p>}<small>{change.cardTitle}</small>{change.evidence&&<details className="re-history-proof"><summary>正文依据 · {sources.chapters.find(c=>c.id===change.evidence.chapterId)?.title||'章节已移除'} · v{change.evidence.revision}</summary><blockquote>{change.evidence.evidence}</blockquote>{change.review&&<p>正文已变化，此条暂不参与快照；编辑后可重新确认。</p>}</details>}<footer>{change.position!==null&&<button onClick={()=>locate(change)}>定位</button>}<button onClick={()=>onCard?.(state.cards[change.cardId])}>剧情节点</button><button disabled={unavailable} onClick={()=>{const card=state.cards[change.cardId],point=card.points.find(p=>p.id===change.pointId),index=change.changeOrder;setEditing(changeSource(card,point,point.relationships[index],index));}}>编辑变化</button></footer></article>)}

   </section>
  </div>
  <footer className="u-rel-footnote">正文确认保留原文与版本；含计划预览可查看后续构想。资料里的完整关系图保持独立。</footer>
  {expanded&&<Modal className="u-network-modal" title="全局人物关系图" close={()=>setExpanded(false)}><div className="u-form"><strong>{pointLabel}</strong><RelationTimeBar projection={projection} count={count} cursor={cursor} changes={overview.changes} origin={origin} changeCursor={changeCursor} pointLabel={pointLabel}/>{visibility}<RelationNetwork {...networkProps} large/><small>滚轮缩放 · 拖动空白平移 · 加减号缩放 / Home 居中 · 点连线查看两人历程</small></div></Modal>}
  {adding&&<RelationChangeEditor {...{call,novelId,state,sources,characters,relations,selected,mode,origin,cursor,save,unavailable}} initialPair={endpoints} pointLabel={pointLabel} close={()=>setAdding(false)}/>}
  {editing&&<RelationChangeEditor {...{call,novelId,state,sources,characters,relations,save,unavailable}} source={editing} close={()=>setEditing(null)}/>}
 </aside>;
}

export function RelationTimeBar({count,cursor,changes,origin,changeCursor,pointLabel,projection}){
 const bar=useRef(null),held=useRef(null);
 const minimum=projection?projection.segments[0].start:0,maximum=projection?projection.segments.at(-1).end:count-.001;
 const percent=n=>projection?projection.timeToX(n)/projection.width*100:n/count*100;
 const point=x=>{const r=bar.current.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(x-r.left)/r.width));changeCursor(projection?projection.xToTime(ratio*projection.width):Math.max(0,Math.min(count-.001,ratio*count)));};
 return <div className="u-rel-time-navigation"><div className="u-rel-time-caption"><span>查看时间</span><small>{projection?'空白年代已折叠 · 方向键逐日查看':'拖动指针 · 圆点为关键变化'}</small></div><div ref={bar} className="u-rel-time-bar" role="slider" tabIndex={0} aria-label="关系快照查看时间" aria-valuemin={minimum} aria-valuemax={maximum} aria-valuenow={cursor} aria-valuetext={pointLabel} onPointerDown={e=>{if(e.button!==0)return;e.stopPropagation();e.preventDefault();held.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);point(e.clientX);}} onPointerMove={e=>{if(held.current===e.pointerId)point(e.clientX);}} onPointerUp={e=>{if(held.current===e.pointerId){point(e.clientX);held.current=null;}}} onPointerCancel={()=>{held.current=null;}} onLostPointerCapture={()=>{held.current=null;}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();changeCursor(Math.max(minimum,Math.min(maximum,e.key==='Home'?minimum:e.key==='End'?maximum:cursor+(e.key==='ArrowLeft'?-1:1)*(projection?1:.1))));}}}><span className="u-rel-time-progress" style={{width:`${percent(cursor)}%`}}/>{changes.filter(change=>Number.isFinite(change.position)).map(change=><i key={change.id} title={change.cardTitle} style={{left:`${Math.max(0,Math.min(100,percent(change.position-origin)))}%`}}/>)}<b style={{left:`${percent(cursor)}%`}}/></div></div>;
}
