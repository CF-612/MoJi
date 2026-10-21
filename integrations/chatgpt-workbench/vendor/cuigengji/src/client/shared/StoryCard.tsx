import React from 'react';
import {CastAvatars} from './CastAvatars.tsx';
import type {CastPerson,CastRef} from './CastAvatars.tsx';
const statusNames={idea:'讨论中',selected:'准备采用',written:'已写入正文',dropped:'暂不采用'};
export interface StoryCardNode {
  id:string;title:string;summary:string;status:'idea'|'selected'|'written'|'dropped';
  chapterRefs?:{chapterId:string}[];cast?:CastRef[];foreshadowRefs?:string[];
}
/** 画布／大纲／时间线共用同一张剧情卡：标题、出场人物头像、摘要、状态与引用计数。 */
export function StoryCardFace({node,people=[],variant='canvas',onOpen,onOpenPerson,onExpandCast}: {
  node:StoryCardNode;people?:CastPerson[];variant?:'canvas'|'timeline'|'outline';
  onOpen?:()=>void;onOpenPerson?:(nodeId:string)=>void;onExpandCast?:(node:StoryCardNode)=>void;
}) {
  const chapters=node.chapterRefs?.length||0,shadows=node.foreshadowRefs?.length||0;
  return <div className={`story-card-face variant-${variant}`}>
    <div className="story-card-head">
      {onOpen
        ? <button type="button" className="story-card-title" title={node.title} onClick={event=>{event.stopPropagation();onOpen();}}>{node.title}</button>
        : <span className="story-card-title" title={node.title}>{node.title}</span>}
      <CastAvatars cast={node.cast||[]} people={people} size="sm" onOpen={onOpenPerson} onExpand={()=>onExpandCast?.(node)}/>
    </div>
    {node.summary&&<p className="story-card-summary" title={node.summary}>{node.summary}</p>}
    <footer className="story-card-foot">
      <span className={`story-card-status state-${node.status}`}><i aria-hidden="true"/>{statusNames[node.status]||'讨论中'}</span>
      {chapters>0&&<small>{chapters} 章</small>}
      {shadows>0&&<small>{shadows} 伏笔</small>}
    </footer>
  </div>;
}
