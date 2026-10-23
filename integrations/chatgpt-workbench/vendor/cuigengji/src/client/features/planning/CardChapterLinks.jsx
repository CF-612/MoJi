import React from 'react';
import {narrationChapters} from '../../../domain/story-timeline.mjs';
export function CardChapterLinks({card,chapters}){
 const linked=narrationChapters(card,chapters),label=linked.length>1?linked[0].title+' — '+linked.at(-1).title:linked[0]?.title;
 return <small className="u-chapter-links" title={linked.length?'随叙述时间位置自动更新：'+linked.map(c=>c.title).join(' · '):'拖入叙述时间线后自动关联章节'}>叙述关联：{label||'待安排'}{linked.length>2?'（'+linked.length+'章）':''}</small>;
}
