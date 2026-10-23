import React from 'react';
import {useDialog} from '../../dialog.tsx';
import {ChapterToolIcon} from './ChapterToolIcon.jsx';
/** Shared chapter actions for the directory and manuscript. */
export function ChapterOperations({chapter,busy,dirty=false,onRename,onExport,onHistory,onRemove,onRestore,volumes,onVolume,onMove,icons=false}){
 const {ask}=useDialog();
 if(chapter.deleted)return <button disabled={busy} onClick={onRestore}>{icons&&<ChapterToolIcon name="restore"/>}恢复章节</button>;
 return <>
  {onRename&&<button disabled={busy} onClick={async()=>{const title=await ask('章节标题',chapter.title);if(title?.trim()&&title.trim()!==chapter.title)onRename(title.trim());}}>{icons&&<ChapterToolIcon name="rename"/>}重命名</button>}
  {onVolume&&<label>移至分卷<select aria-label="章节所属卷" disabled={busy} value={chapter.volumeId||''} onChange={e=>onVolume(e.target.value||null)}><option value="">未分卷</option>{volumes.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></label>}
  {onMove&&<div className="chapter-sort-actions"><span>排序</span><button disabled={busy||!onMove.up} onClick={onMove.up}>上移</button><button disabled={busy||!onMove.down} onClick={onMove.down}>下移</button></div>}
  <button disabled={busy||dirty} title={dirty?'等待自动保存后导出':undefined} onClick={onExport}>{icons&&<ChapterToolIcon name="export"/>}导出本章</button>
  {onHistory&&<button onClick={onHistory}>{icons&&<ChapterToolIcon name="history"/>}版本历史</button>}
  <button className="danger" disabled={busy} onClick={onRemove}>{icons&&<ChapterToolIcon name="trash"/>}移入回收站</button>
 </>;
}
