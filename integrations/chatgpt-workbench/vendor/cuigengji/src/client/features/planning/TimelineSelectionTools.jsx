import React,{useRef,useState} from 'react';
import {isPlanningDeleteKey,planningSelection} from './planning-selection.mjs';

/** Reuse the planning deletion command; timelines never mutate storage themselves. */
export function useTimelineDeletion({state,marquee,onDelete,blocked=false}){
 const lock=useRef(false),[pending,setPending]=useState(false);
 const objects=Object.fromEntries(Object.values(state.cards).map(card=>['card:'+card.id,{...card,kind:'card'}]));
 const selection=planningSelection(objects,marquee.selectedIds.map(id=>'card:'+id));
 const selectedIds=selection.cards.map(ref=>objects[ref].id);
 const remove=async()=>{
  if(blocked||lock.current||!onDelete||!selection.cards.length)return false;
  lock.current=true;setPending(true);
  try{const ok=await onDelete(selection.cards);if(ok)marquee.select(null);return !!ok;}
  finally{lock.current=false;setPending(false);}
 };
 const deleteKey=e=>{if(isPlanningDeleteKey(e,{blocked:blocked||lock.current,selected:selection.cards})){e.preventDefault();e.stopPropagation();void remove();}};
 return {selectedIds,remove,deleteKey,pending,blocked:blocked||!onDelete};
}

/** Always touch-accessible; no hover-only or desktop-only deletion affordance. */
export function TimelineSelectionTools({multi,onMulti,selectedIds,onClear,onDelete,disabled=false,disabledReason}){
 return <div className="u-subbar u-timeline-selection" data-selected={selectedIds.length>0} role="group" aria-label="时间线卡片选择操作">
  <button type="button" aria-pressed={multi} disabled={disabled} onClick={onMulti}>{multi?'退出多选':'多选'}</button>
  {disabledReason&&<small role="status">{disabledReason}</small>}
  {selectedIds.length>0&&<><span>已选 {selectedIds.length} 张</span><button type="button" className="u-danger" disabled={disabled} onClick={onDelete}>删除剧情卡／篇章（{selectedIds.length}）</button><button type="button" disabled={disabled} onClick={onClear}>取消选择</button></>}
 </div>;
}
