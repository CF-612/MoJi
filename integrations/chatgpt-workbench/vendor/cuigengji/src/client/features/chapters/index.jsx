import {chapterDisplayTitle,chapterOrdinalInVolume} from './chapter-display-title.mjs';
import {ChapterFooter} from './ChapterFooter.jsx';
import {QuickInputBar,QuickInputSettings,useQuickPhrases} from './QuickInput.jsx';
import {WritingSpeed,WritingSessionSettings,useWritingSession} from './WritingSession.jsx';
import {LongImageExport} from './LongImageExport.jsx';
import {ProseFind,ProseMatchLayer} from './ProseFind.jsx';
import {prepareTransferDrafts} from './chapterSessions.ts';
import {formatManuscript,manuscriptCount,canUndoTransform} from './editor-text.mjs';
import {proseAppearance} from '../../shared/editor-preferences.mjs';
import {mapSelection} from './selection.ts';
import {HistoryPair} from './HistoryPair.jsx';
import {ChapterTools} from './ChapterTools.jsx';
import {ChapterToolIcon} from './ChapterToolIcon.jsx';
import {ProseSelection,captureProseSelection,normalizeSelectionText} from './ProseSelection.jsx';
import {selectionStyle} from './prose-selection-style.mjs';
import {ChapterOperations} from './ChapterOperations.jsx';
import {Modal} from '../../shared/preferences.tsx';
import {useModules} from '../../modules/context.tsx';
import {ChapterCreateExtras} from './ChapterCreateExtras.tsx';
import {TextDiff} from '../../shared/TextDiff.jsx';
import {ChapterRibbon} from '../../shared/ChapterRibbon.jsx';
import {ReviewDialog} from '../../shared/ReviewInbox.jsx';
import {ChapterMaterials} from '../../shared/ChapterMaterials.jsx';
import {nextNumberedTitle,nextChapterTitle,displayNumberedTitle} from '../../../domain/title-numbering.js';
import {CreateDocument} from '../../shared/creation.tsx';
import {useWorkbenchPreferences} from '../../shared/preferences.tsx';
import React, { useEffect, useState, useRef, useLayoutEffect, useContext } from 'react';
import { useDialog } from '../../dialog.tsx';
import { SessionScope, usePreference, useResource, useScrollPosition } from '../../shared/state.js';
import { InlineTitle } from '../../shared/InlineTitle.tsx';
import { DirectoryRow } from './DirectoryRow.tsx';
import { ResourceState, saveShortcut } from '../../shared/ui.jsx';
import { useChapterSync, prepareChapterRemoval } from './useChapterSync.ts';
import { useManuscriptTextarea } from './useManuscriptTextarea.ts';
import { ManuscriptHistory } from './ManuscriptHistory.jsx';
import { useChapterReorder } from './useChapterReorder.ts';
import { chapterChanges } from './sync.ts';
import { groupHistory } from './history.ts';
import { copyManuscriptSelection } from './clipboard.ts';
import {Icon} from '../../shared/icons.tsx';

async function readChapter(call, novelId, chapterId) {
  const first = await call('chapter.get', { novelId, chapterId, maxChars: 200000 });
  let content = first.content, next = first.nextStart;
  while (next !== null) {
    const page = await call('chapter.get', { novelId, chapterId, start: next, maxChars: 200000 });
    if (page.revision !== first.revision) throw new Error('读取期间正文发生变化，请重试。');
    content += page.content; next = page.nextStart;
  }
  return { ...first, content };
}
const chaptersVolume=(chapters,id)=>chapters.find(c=>c.id===id)?.volumeId||null;
export function Chapters({ call, novelId, novelTitle, tick, run, busy, onTransfer, onMemory, onEvent, onForeshadow, onStoryCard, proseRequest, onProseLocated }) {
  const scope=useContext(SessionScope);
  const [contextId,setContextId]=useState(null),[historyRequest,setHistoryRequest]=useState(null);
  const [undo,setUndo]=useState(null),[volumeSummary,setVolumeSummary]=useState(null);
  const {preferences}=useWorkbenchPreferences();
  const [creating,setCreating]=useState(false);
  const workspace=useRef(null),[narrow,setNarrow]=useState(false);
  useEffect(()=>{const el=workspace.current;if(!el)return;const resize=new ResizeObserver(([entry])=>setNarrow(entry.contentRect.width<760));resize.observe(el);return()=>resize.disconnect();},[creating]);
  const [id,setId] = usePreference(`${novelId}:chapter`, '');
  const [directory,setDirectory] = useState(!id), [query,setQuery] = useState(''), [deleted,setDeleted] = useState(false);
  const [directoryCollapsed,setDirectoryCollapsed] = useState(!preferences.directory);
  const [collapsed,setCollapsed]=usePreference(`${novelId}:collapsed-volumes`,{});
  const [poll,setPoll] = useState(0);
  const { ask,confirm } = useDialog();
  const resource = useResource(() => Promise.all([call('chapter.list',{novelId,includeDeleted:true}),call('volume.list',{novelId,includeDeleted:true})]),[call,novelId,tick,poll],`${novelId}:chapter-directory`);
  useEffect(()=>{const timer=setInterval(()=>setPoll(n=>n+1),5000);return ()=>clearInterval(timer);},[]);
  const [savedChapters=[],savedVolumes=[]] = resource.value || [];
  const volumes=savedVolumes.filter(v=>!v.deleted),creationVolume=chaptersVolume(savedChapters,id),defaultChapter=displayNumberedTitle(nextChapterTitle(savedChapters,creationVolume),preferences.numbering);
  const reorder=useChapterReorder({chapters:savedChapters,volumes,call,novelId,busy,onMoved:volumeId=>{setPoll(n=>n+1);setCollapsed(old=>({...old,[volumeId||'none']:false}));}});
  const chapters=reorder.chapters;
  const live=chapters.filter(c=>!c.deleted),trash=chapters.filter(c=>c.deleted);
  const refresh=()=>setPoll(n=>n+1);
  const remove=c=>run(async()=>{
    if(!c?.id)throw new Error('目录尚未读取完成，请稍后重试。');
    const prepared=await prepareChapterRemoval({scope,novelId,chapterId:c.id,read:()=>readChapter(call,novelId,c.id),
      write:(value,base,requestId)=>call('chapter.update',{novelId,chapterId:c.id,requestId,...chapterChanges(value,base),expectedRevision:base.revision,expectedHash:base.contentHash,reason:'作者自动保存'}),onSaved:refresh});
    const before=prepared.chapter;
    if(before.deleted)throw new Error('章节已在回收站，请刷新目录。');
    const removed=await call('chapter.delete',{novelId,chapterId:c.id,expectedRevision:before.revision,requestId:crypto.randomUUID(),confirm:true});
    prepared.accept({...before,...removed});
    setUndo({id:c.id,title:before.title,revision:removed.revision,targetRevision:removed.revision,wasCurrent:id===c.id});
    if(id===c.id){const at=live.findIndex(ch=>ch.id===c.id);setId((live[at+1]||live[at-1])?.id||'');}
    refresh();
  });
  const restore=(c,returnToChapter=false)=>run(async()=>{
    const prepared=await prepare(c);
    await prepared.restoreVersion(c.targetRevision||c.revision,(before,requestId)=>call('chapter.restore',{novelId,chapterId:c.id,expectedRevision:before.revision,expectedHash:before.contentHash,targetRevision:c.targetRevision||c.revision,requestId}));
    if(returnToChapter)setId(c.id);
    setUndo(null);refresh();
  });
  const select = chapter => { setId(chapter.id); setDirectory(false); };
  const create = () => {if(resource.value&&!busy)setCreating(true);};
  const prepare=c=>prepareChapterRemoval({scope,novelId,chapterId:c.id,read:()=>readChapter(call,novelId,c.id),write:(value,base,requestId)=>call('chapter.update',{novelId,chapterId:c.id,requestId,...chapterChanges(value,base),expectedRevision:base.revision,expectedHash:base.contentHash,reason:'作者自动保存'}),onSaved:refresh});
  const updateMetadata=(c,value)=>run(async()=>{const prepared=await prepare(c),result=await call('chapter.update',{novelId,chapterId:c.id,...value,expectedRevision:prepared.chapter.revision,requestId:crypto.randomUUID()});prepared.accept({...prepared.chapter,...result});refresh();});
  const contextChapter=chapters.find(c=>c.id===contextId),peers=contextChapter?live.filter(c=>(c.volumeId||null)===(contextChapter.volumeId||null)):[],contextIndex=peers.findIndex(c=>c.id===contextId);
  const showHistory=c=>{select(c);setHistoryRequest({id:c.id,token:crypto.randomUUID()});setContextId(null);};
  if(creating)return <CreateDocument chapter draftKey={`${novelId}:chapter-create-title:v2`} label="新建章节" newGroupTitle={displayNumberedTitle(nextNumberedTitle(savedVolumes,'卷'),preferences.numbering)} chapterTitle={volumeId=>nextChapterTitle(chapters,volumeId)} extraFields={(value,change)=><ChapterCreateExtras {...{call,novelId,value,change}}/>} initial={{title:defaultChapter,generatedTitle:defaultChapter,characters:[],events:[],summary:'',content:'',groupId:creationVolume}} groups={volumes.map(v=>({...v,name:v.title}))} busy={busy} close={()=>setCreating(false)} createGroup={async title=>{let result;await run(async()=>{const v=await call('volume.create',{novelId,title});result={...v,name:v.title};});return result;}} save={(value,requestId)=>run(async()=>{const c=await call('chapter.create',{novelId,requestId,title:value.title,summary:value.summary||'',characters:value.characters||[],events:value.events||[],content:value.content,volumeId:value.groupId});select(c);})}/>;
  const groups = [...volumes, {id:null,title:'未分卷'}];
  const directoryContent=<aside ref={reorder.directoryRef} className="chapter-directory" aria-label="章节目录" data-reordering={reorder.saving||!!reorder.drag} onClickCapture={reorder.onClickCapture} onPointerDownCapture={reorder.onPointerDownCapture}>
      <div className="row directory-heading">{deleted&&<button className="icon-button" aria-label="返回章节目录" onClick={()=>setDeleted(false)}>‹</button>}<h2 className="grow">{deleted?'回收站':'章节目录'}</h2><button className="icon-button" aria-label={directoryCollapsed?'展开章节目录':'收起章节目录'} title={directoryCollapsed?'展开章节目录':'收起章节目录'} onClick={()=>setDirectoryCollapsed(v=>!v)}>{directoryCollapsed?'›':'‹'}</button></div>
      {!deleted&&<div className="directory-create-actions"><button className="primary" onClick={create} disabled={busy||!resource.value}><Icon name="plus"/>新建章节</button><button className="directory-new-volume" disabled={busy||!resource.value} aria-label="新建卷" onClick={async()=>{const title=await ask('新卷名称',displayNumberedTitle(nextNumberedTitle(savedVolumes,'卷'),preferences.numbering));if(title)run(()=>call('volume.create',{novelId,title}));}}><Icon name="folder"/>新增卷</button></div>}
      <div className="directory-search"><input className="search" aria-label="搜索章节" placeholder="搜索章节名称" value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <ResourceState resource={resource}>
        {!(deleted?trash:live).length && <p className="empty">{deleted?'回收站是空的':'还没有章节。新建一章，开始你的故事。'}</p>}
        {query && !(deleted?trash:live).some(c=>(c.title.includes(query)||displayNumberedTitle(c.title,preferences.numbering).includes(query))) && <p className="empty">没有匹配的章节</p>}
        {deleted?trash.filter(c=>(c.title.includes(query)||displayNumberedTitle(c.title,preferences.numbering).includes(query))).map(c=><DirectoryRow key={c.id} chapter={{...c,title:displayNumberedTitle(c.title,preferences.numbering)}} selected={c.id===id} disabled={busy} open={()=>select(c)} menu={()=>setContextId(c.id)}/>):groups.map(v=>{const items=live.filter(c=>(c.volumeId||null)===v.id && (c.title.includes(query)||displayNumberedTitle(c.title,preferences.numbering).includes(query))),folded=collapsed[v.id||'none']&&!query,endDrop=reorder.drag?.target?.volumeId===v.id&&reorder.drag.target.beforeChapterId===null;if(!items.length&&!v.id&&!reorder.drag)return null;return <section className={`volume-group ${endDrop&&folded?'chapter-drop-group':''}`} data-chapter-volume={v.id||''} key={v.id||'none'}>
          <div className="row compact"><button className="volume-toggle grow" aria-expanded={!collapsed[v.id||'none']||!!query} onClick={()=>setCollapsed(old=>({...old,[v.id||'none']:!old[v.id||'none']}))}><span className="volume-chevron"><Icon name="chevron"/></span>{displayNumberedTitle(v.title,preferences.numbering)} <small>{items.length}</small></button>{v.id&&<details className="menu"><summary aria-label={`${v.title}设置`}>···</summary><div className="menu-panel">
            <button disabled={busy} onClick={async()=>{const title=await ask('卷名称',v.title);if(title)run(()=>call('volume.update',{novelId,volumeId:v.id,title,expectedRevision:v.revision}));}}>改名</button>
            <button disabled={busy} onClick={()=>setVolumeSummary({...v,summary:v.summary||''})}>卷描述 / Summary</button>
            <button disabled={busy} onClick={()=>onTransfer({mode:'export',selection:{kind:'chapters',novelId,volumeIds:[v.id]}})}>导出这卷</button><button disabled={busy} onClick={async()=>{const value=await ask('卷排序（数字越小越靠前）',String(v.order));if(value!==null)run(()=>call('volume.update',{novelId,volumeId:v.id,order:Number(value),expectedRevision:v.revision}));}}>调整顺序</button>
            <button className="danger" disabled={busy} onClick={async()=>{if(await confirm(`删除卷“${v.title}”？章节将保留在未分卷。`))run(()=>call('volume.delete',{novelId,volumeId:v.id,expectedRevision:v.revision,confirm:true,chapterPolicy:'detach'}));}}>删除卷</button>
          </div></details>}</div>
          {!folded&&items.map((c,index)=><DirectoryRow key={c.id} chapter={{...c,title:displayNumberedTitle(c.title,preferences.numbering)}} ordinal={live.filter(item=>(item.volumeId||null)===v.id).findIndex(item=>item.id===c.id)+1} selected={c.id===id} dragging={reorder.drag?.source.id===c.id} before={reorder.drag?.target?.beforeChapterId===c.id} disabled={busy||reorder.saving||!!reorder.drag} dragProps={reorder.rowProps(c)} open={()=>select(c)} menu={()=>setContextId(c.id)}/>)}
          {endDrop&&!folded&&<div className="chapter-drop-end" aria-hidden="true"/>}
        </section>;})}
      </ResourceState><div className="directory-foot"><span>{live.length} 章 · {live.reduce((sum,c)=>sum+(c.textCount||0),0).toLocaleString('zh-CN')} 字{reorder.saving&&<span className="directory-sort-note">保存顺序…</span>}</span><button className="recycle-entry" aria-pressed={deleted} onClick={()=>setDeleted(v=>!v)}>回收站 <small>{trash.length}</small></button></div>
      {undo&&<div className="directory-undo" role="status"><span>已移入回收站 · {undo.title}</span><button disabled={busy} onClick={()=>restore(undo,undo.wasCurrent)}>撤销</button></div>}
      {reorder.error&&<p role="alert" className="directory-sort-error">{reorder.error}</p>}
      {reorder.drag&&<div className="chapter-drag-preview" aria-hidden="true" style={{left:Math.max(8,Math.min(reorder.drag.x+14,window.innerWidth-220)),top:Math.min(reorder.drag.y+14,window.innerHeight-60)}}><span>⠿</span>{reorder.drag.source.title}</div>}
      <span className="chapter-sort-live" role="status">{reorder.saving?'正在保存章节顺序':reorder.drag?.target?'松开以放到此位置':''}</span>
    </aside>;
  return <div ref={workspace} className={`chapter-workspace ${directory?'show-directory':'show-editor'} ${directoryCollapsed?'directory-collapsed':''}`}>
    {volumeSummary&&<Modal title="卷描述 / Summary" close={()=>setVolumeSummary(null)}><form className="u-form" onSubmit={e=>{e.preventDefault();run(async()=>{await call('volume.update',{novelId,volumeId:volumeSummary.id,expectedRevision:volumeSummary.revision,summary:volumeSummary.summary});setVolumeSummary(null);refresh();});}}><h3>{volumeSummary.title}</h3><p>描述整卷内容，与卷纲用途剧情卡独立，不自动复制。</p><textarea aria-label="卷描述" style={{width:'100%',minHeight:150}} value={volumeSummary.summary} onChange={e=>setVolumeSummary(v=>({...v,summary:e.target.value}))}/><div className="row"><button type="button" onClick={()=>setVolumeSummary(null)}>取消</button><button type="submit" disabled={busy}>保存卷描述</button></div></form></Modal>}
    {narrow ? directory&&<DirectoryDrawer close={()=>setDirectory(false)}>{directoryContent}</DirectoryDrawer> : directoryContent}
    {contextChapter&&<Modal title="章节操作" className="tool-sheet chapter-actions-menu" close={()=>setContextId(null)}><div className="sheet-actions"><p className="chapter-menu-title">{displayNumberedTitle(contextChapter.title,preferences.numbering)}</p><ChapterOperations chapter={contextChapter} busy={busy||reorder.saving} volumes={volumes.map(v=>({...v,title:displayNumberedTitle(v.title,preferences.numbering)}))} onRename={title=>{setContextId(null);updateMetadata(contextChapter,{title});}} onVolume={volumeId=>{setContextId(null);updateMetadata(contextChapter,{volumeId});}} onMove={{up:contextIndex>0?()=>{setContextId(null);reorder.nudge(contextChapter,'up');}:null,down:contextIndex<peers.length-1?()=>{setContextId(null);reorder.nudge(contextChapter,'down');}:null}} onExport={()=>{setContextId(null);run(async()=>{await prepare(contextChapter);onTransfer({mode:'export',selection:{kind:'chapters',novelId,chapterIds:[contextChapter.id]}});});}} onHistory={()=>showHistory(contextChapter)} onRemove={()=>{setContextId(null);remove(contextChapter);}} onRestore={()=>{setContextId(null);restore(contextChapter);}}/></div></Modal>}
    <main className="chapter-main">
      {id ? <ChapterLoader key={id} novelTitle={novelTitle} chapterOrdinal={chapterOrdinalInVolume(live,id)} {...{call,novelId,tick,run,busy,volumes,onTransfer,onMemory,onEvent,onForeshadow,onStoryCard,proseRequest,onProseLocated}} historyRequest={historyRequest} onHistoryConsumed={()=>setHistoryRequest(null)} onRemove={remove} onSaved={()=>setPoll(n=>n+1)} chapterId={id} latest={chapters.find(c=>c.id===id)} back={()=>{setDirectory(true);setDirectoryCollapsed(false);}}/> : <div className="empty"><h2>选择一章，继续写作</h2><p>从目录打开章节，或新建一章。</p><button onClick={()=>setDirectory(true)}>打开目录</button></div>}
    </main>
  </div>;
}
function DirectoryDrawer({children,close}) {
 const ref=useRef(null),backdropPress=useRef(false);
 useEffect(()=>{const previous=document.activeElement,dialog=ref.current;dialog?.showModal();return()=>{dialog?.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 const outside=e=>{if(e.target!==e.currentTarget)return false;const box=e.currentTarget.getBoundingClientRect();return e.clientX<box.left||e.clientX>=box.right||e.clientY<box.top||e.clientY>=box.bottom;};
 return <dialog ref={ref} className="directory-drawer" aria-label="章节目录抽屉"
   onCancel={e=>{e.preventDefault();close();}}
   onPointerDown={e=>{backdropPress.current=e.button===0&&outside(e);}}
   onPointerCancel={()=>{backdropPress.current=false;}}
   onClick={e=>{const dismiss=backdropPress.current&&outside(e);backdropPress.current=false;if(dismiss){e.stopPropagation();close();}}}>
   <header className="drawer-header"><button type="button" className="drawer-close" aria-label="关闭章节目录" title="关闭目录" onClick={close}><span aria-hidden="true">×</span></button></header>{children}
 </dialog>;
}
function ChapterLoader(props) {
  const resource=useResource(()=>readChapter(props.call,props.novelId,props.chapterId),[props.call,props.novelId,props.chapterId],`${props.novelId}:chapter:${props.chapterId}`);
  return <>{!resource.value&&props.back&&<button className="directory-back" onClick={props.back}>‹ 返回目录</button>}<ResourceState resource={resource}>{resource.value&&<ChapterEditor {...props} initial={resource.value}/>}</ResourceState></>;
}
function ChapterEditor({call,novelId,novelTitle,chapterOrdinal,chapterId,latest,tick,run,busy,volumes,back,initial,onSaved,onTransfer,onMemory,onEvent,onForeshadow,onStoryCard,proseRequest,onProseLocated,historyRequest,onHistoryConsumed,onRemove}) {
  const {value:draft,base,change,accept,rebase,dirty,cacheError,phase,error:saveError,remote,notice:syncNotice,save,prepare,restoreVersion,reloadLatest,recoveryDrafts=[],removeRecovery,composition}=useChapterSync({novelId,chapterId,initial,latest,onSaved,read:()=>readChapter(call,novelId,chapterId),write:(value,base,requestId)=>call('chapter.update',{novelId,chapterId,requestId,...chapterChanges(value,base),expectedRevision:base.revision,expectedHash:base.contentHash,reason:'作者自动保存'})});
  const manuscript=useManuscriptTextarea(draft.content),textareaRef=manuscript.ref;
  const [selectedProse,setSelectedProse]=useState(null),[selectionDraft,setSelectionDraft]=useState(null),[selectionNotice,setSelectionNotice]=useState('');
  const selectionOpening=useRef(false),selectionRef=useRef(null),selectionAlive=useRef(true),selectionCurrent=useRef(null);
  selectionCurrent.current={draft,phase,chapterId};
  useEffect(()=>{selectionAlive.current=true;return()=>{selectionAlive.current=false;};},[]);
  const capture=(clear=false)=>{if(selectionOpening.current||document.activeElement!==textareaRef.current)return;const next=captureProseSelection(textareaRef.current,chapterId);if(!next&&!clear)return;selectionRef.current=next;setSelectedProse(next);};
  useEffect(()=>{const changed=()=>capture();document.addEventListener('selectionchange',changed);return()=>document.removeEventListener('selectionchange',changed);},[chapterId]);
  useEffect(()=>{if(selectionRef.current&&selectionRef.current.content!==normalizeSelectionText(draft.content)){selectionRef.current=null;setSelectedProse(null);}},[draft.content]);
  const locate=proof=>{const el=textareaRef.current;if(!el)return;const text=el.value,quote=proof.evidence;let start=proof.start,end=proof.end;
   if(!quote||text.slice(start,end)!==quote){start=quote?text.indexOf(quote):-1;end=start+(quote?.length||0);if(start>=0&&text.indexOf(quote,start+1)>=0){setSelectionNotice('正文存在多处相同原文，请核对位置后重新选择。');return;}}
   if(start<0){setSelectionNotice('当前正文中已找不到这段引用，请查看原引用版本后复核。');return;}
   el.focus({preventScroll:true});el.setSelectionRange(start,end);capture();
   const viewport=el.closest('.editor-scroll'),lineHeight=parseFloat(getComputedStyle(el).lineHeight)||32,lines=text.slice(0,start).split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/Math.max(1,el.clientWidth/(font*.65)))),0);
   if(viewport)viewport.scrollTop=Math.max(0,el.offsetTop+(lines-1)*lineHeight-viewport.clientHeight/3);
   if(proof.revision&&proof.revision!==base.revision)setSelectionNotice('已定位当前正文中的同段文字；原引用版本 '+proof.revision+'，请核对。');
  };
  useEffect(()=>{if(proseRequest?.chapterId===chapterId){locate(proseRequest);onProseLocated?.();}},[proseRequest?.token]);
  const prepareSelection=async captured=>{if(selectionCurrent.current.phase==='conflict')throw new Error('正文存在保存冲突，请先返回正文合并，再重新选择。');await save();const saved=await readChapter(call,novelId,chapterId);
   if(!selectionAlive.current||selectionCurrent.current.chapterId!==captured.chapterId)throw new Error('章节已切换，请在当前章节重新选择。');
   if(selectionCurrent.current.phase==='conflict')throw new Error('正文存在保存冲突，请先合并后重新选择。');
   if(normalizeSelectionText(saved.content)!==captured.content||normalizeSelectionText(selectionCurrent.current.draft.content)!==captured.content)throw new Error('正文尚未保存完成或已变化，请返回核对后重新选择。');
   return {chapterId,revision:saved.revision,contentHash:saved.contentHash,start:captured.start,end:captured.end,evidence:captured.evidence};
  };
  const [review,setReview]=useState(false);const [materials,setMaterials]=useState(null);
  const [comparison,setComparison]=useState(null),[historyOpen,setHistoryOpen]=useState(false);
  useEffect(()=>{if(historyRequest?.id===chapterId){setHistoryOpen(true);onHistoryConsumed?.();}},[historyRequest?.token]);
  const {preferences,update:updatePreferences}=useWorkbenchPreferences();
  const scope=useContext(SessionScope);
  const phrases=useQuickPhrases(novelId),speed=useWritingSession({scopeKey:`${scope}:${novelId}`,documentKey:chapterId,content:draft.content,enabled:preferences.writingSpeed});
  const [imeComposing,setImeComposing]=useState(false);
  const modules=useModules();
  const font=preferences.fontSize,appearance=proseAppearance(preferences);
  const scrollRef=useScrollPosition(`${novelId}:${chapterId}`);
  // Let the document own scrolling; the textarea must not become a nested viewport.
  const fitManuscript=()=>{const el=textareaRef.current;if(!el)return;const top=scrollRef.current?.scrollTop||0;el.style.height='0px';el.style.height=`${Math.max(240,el.scrollHeight)}px`;if(scrollRef.current)scrollRef.current.scrollTop=top;};
  useLayoutEffect(fitManuscript,[draft.content,font,preferences.leading,preferences.fontFamily,preferences.fontWeight,preferences.fontItalic,preferences.letterSpacing,preferences.pageMargin,preferences.mobilePageMargin]);
  useEffect(()=>{if(preferences.openAtEnd){const frame=requestAnimationFrame(()=>{const el=textareaRef.current;if(el){el.setSelectionRange(el.value.length,el.value.length);if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;}});return()=>cancelAnimationFrame(frame);}},[]);
  useEffect(()=>{const viewport=scrollRef.current;if(!viewport)return;let width=-1;const observer=new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(next!==width){width=next;fitManuscript();}});observer.observe(viewport);return()=>observer.disconnect();},[]);
  const {confirm}=useDialog();
  const [formatUndo,setFormatUndo]=useState(null);
  const applyText=(content)=>{if(content!==draft.content){setFormatUndo({before:draft.content,after:content});change(d=>({...d,content}));}};
  const format=(options)=>applyText(formatManuscript(draft.content,options?.nativeEvent?undefined:options));
  const undoText=canUndoTransform(formatUndo,draft.content)?()=>{set('content',formatUndo.before);setFormatUndo(null);}:null;
  const history=useResource(()=>historyOpen?call('chapter.history',{novelId,chapterId,includeContent:true}):Promise.resolve([]),[call,novelId,chapterId,tick,base.revision,historyOpen]);
  const conflict=phase==='conflict';
  const reload=async()=>{if(!dirty||await confirm('丢弃本地草稿，读取最新正文？'))run(async()=>{await reloadLatest();setComparison(null);});};
  const restoreHistory=targetRevision=>run(async()=>{await restoreVersion(targetRevision,(before,requestId)=>call('chapter.restore',{novelId,chapterId,targetRevision,expectedRevision:before.revision,expectedHash:before.contentHash,requestId}));setComparison(null);});
  const set=(key,value)=>change(d=>({...d,[key]:value}));
  const [findOpen,setFindOpen]=useState(false),[findState,setFindState]=useState(null),[findBusy,setFindBusy]=useState(false),findSnapshot=useRef(null);
  const openFind=()=>{const el=textareaRef.current;findSnapshot.current=el?{content:el.value,start:el.selectionStart,end:el.selectionEnd,direction:el.selectionDirection,top:scrollRef.current?.scrollTop||0}:null;setFindOpen(true);};
  const closeFind=()=>{setFindOpen(false);setFindState(null);requestAnimationFrame(()=>{const el=textareaRef.current,saved=findSnapshot.current;if(el&&saved){const next=mapSelection(saved.content,el.value,saved);el.focus({preventScroll:true});el.setSelectionRange(next.start,next.end,next.direction);if(scrollRef.current)scrollRef.current.scrollTop=saved.top;}});};
  const locateMatch=(match,index)=>{const el=textareaRef.current;if(!match||!el)return;el.setSelectionRange(match.start,match.end);requestAnimationFrame(()=>{const mark=scrollRef.current?.querySelector(`[data-prose-match="${index}"]`);if(mark&&scrollRef.current){const box=mark.getBoundingClientRect(),view=scrollRef.current.getBoundingClientRect();scrollRef.current.scrollTop+=box.top-view.top-scrollRef.current.clientHeight/3;}});};
  const wordCount=<span title={preferences.countPunctuation?'含标点、不计空白':'不含标点、符号与空白'}><button className="wordcount-toggle" onClick={()=>updatePreferences({countPunctuation:!preferences.countPunctuation})}>{manuscriptCount(draft.content,preferences.countPunctuation).toLocaleString('zh-CN')} 字<span className="wordcount-mode"> · {preferences.countPunctuation?'含标点':'不含标点'}</span></button></span>;
  return <div className="editor-shell" data-transparent-title={preferences.transparentTitle} data-hide-info={!preferences.showInfoBar} style={{'--editor-margin':preferences.pageMargin+'px','--editor-mobile-margin':preferences.mobilePageMargin+'px','--editor-bottom':preferences.bottomSpace+'px'}} onCompositionStart={()=>composition(true)} onCompositionEnd={()=>composition(false)} onKeyDown={e=>saveShortcut(e,save)}>
    <style>{selectionStyle}</style>
    <header className="editor-heading writing-toolbar">
      <button className="directory-back icon-button" aria-label="目录" title="目录" onClick={back}><Icon name="book"/></button>
      <button type="button" className="icon-button format-button" aria-label="快速排版" title="快速排版" disabled={busy||base.deleted||!draft.content.trim()} onClick={format}><ChapterToolIcon name="format"/></button>
      <ManuscriptHistory target={textareaRef} content={draft.content} disabled={busy||base.deleted}/>
      <button type="button" className={'selection-entry'+(selectedProse?' has-selection':'')} aria-label="从选中正文创建或关联" title={selectedProse?'创建或关联角色、世界书、剧情卡与伏笔':'先选中一段正文'} disabled={busy||base.deleted||!selectedProse} onPointerDown={()=>{if(document.activeElement===textareaRef.current)capture();selectionOpening.current=true;}} onPointerCancel={()=>{selectionOpening.current=false;}} onClick={()=>{if(selectionRef.current)setSelectionDraft({...selectionRef.current});selectionOpening.current=false;}}>选区{selectedProse?' ＋':''}</button>
      <ChapterTools busy={busy||findBusy} deleted={base.deleted} title={draft.title} content={draft.content} target={textareaRef} scrollTarget={scrollRef} onFind={openFind} onFormat={format} onHistory={()=>setHistoryOpen(true)} onBackup={()=>run(async()=>{await prepare();onTransfer({mode:'export',selection:{kind:'works',novelIds:[novelId]}});})}
        quickSettings={<QuickInputSettings {...phrases} enabled={preferences.quickInput} onEnabledChange={quickInput=>updatePreferences({quickInput})} paired={preferences.pairedPunctuation} onPairedChange={pairedPunctuation=>updatePreferences({pairedPunctuation})}/>}
        speedSettings={<WritingSessionSettings controller={speed} enabled={preferences.writingSpeed} onEnabledChange={writingSpeed=>updatePreferences({writingSpeed})} compact={preferences.writingSpeedCompact} onCompactChange={writingSpeedCompact=>updatePreferences({writingSpeedCompact})}/>}
        share={<LongImageExport title={draft.title} content={draft.content} selectionText={selectedProse?.evidence||''}/>}
        onUndoFormat={undoText}
        onMaterials={()=>{const el=textareaRef.current;setMaterials(el?el.value.slice(el.selectionStart,el.selectionEnd).slice(0,2000):'');}}
        onReview={()=>setReview(true)} reference={{kind:'chapter',novelId,id:chapterId,title:draft.title,revision:base.revision,dirty}}
>
        <ChapterOperations icons chapter={{...base,...draft}} busy={busy||phase==='saving'} dirty={dirty} onExport={()=>run(async()=>{await prepare();onTransfer({mode:'export',selection:{kind:'chapters',novelId,chapterIds:[chapterId]}});})} onRemove={()=>onRemove(base)} onRestore={()=>restoreHistory(base.revision)}/>
      </ChapterTools>
      {review&&<ReviewDialog {...{call,novelId,busy,run,dirty}} chapter={{...base,id:chapterId}} close={()=>setReview(false)}/>}{materials!==null&&<ChapterMaterials {...{call,novelId,busy,run,dirty,onMemory,onEvent,onStoryCard,onForeshadow}} chapter={{...base,id:chapterId}} selection={materials} close={()=>setMaterials(null)}/>}
    </header>
    {preferences.wordCountPosition==='top'&&<div className="editor-top-wordcount">{wordCount}</div>}
    {findOpen&&<ProseFind {...{call,novelId,chapterId}} content={draft.content.replace(/\r\n?/g,'\n')} disabled={busy||base.deleted||conflict} onBusyChange={setFindBusy} onMatches={setFindState} onLocate={locateMatch} close={closeFind} replaceCurrent={(content,caret)=>{applyText(content);requestAnimationFrame(()=>textareaRef.current?.setSelectionRange(caret,caret));}} prepare={async()=>{if(conflict)throw new Error('请先合并正文冲突');await prepare();return prepareTransferDrafts({scope,novelIds:[novelId],call});}} applied={async barrier=>{await barrier.refresh();onSaved();}}/>}
    {preferences.writingSpeed&&!findOpen&&<WritingSpeed controller={speed} compact={preferences.writingSpeedCompact} onCompactChange={writingSpeedCompact=>updatePreferences({writingSpeedCompact})}/>}
    <div className="editor-scroll is-editing" ref={scrollRef}>
      {conflict&&<div className="notice">你与 AI 或其他窗口修改了同一处，双方内容均已保留。<button disabled={busy} onClick={()=>setComparison(remote)}>比较最新正文</button><button disabled={busy||phase==='saving'} onClick={reload}>放弃草稿并读取最新</button></div>}
      {recoveryDrafts.length>0&&<details className="notice local-draft-recovery"><summary>本机草稿副本 · {recoveryDrafts.length} 份待核对</summary><p>其他窗口或中断时的内容已单独保留。比较并合并需要的文字后，再删除副本；未处理副本时整本替换和备份会暂停。</p>{recoveryDrafts.map(item=><div className="row" key={item.key}><span className="grow">{item.chapter.title||'本章'} · 基准版本 {item.baseRevision}{item.savedAt?` · ${new Date(item.savedAt).toLocaleString()}`:''}</span><button onClick={()=>setComparison({...item.chapter,revision:item.baseRevision,localRecovery:true})}>比较副本</button><button onClick={async()=>{if(await confirm('删除这份本机草稿副本？请先确认需要的内容已合并或另行复制；此操作不修改当前正文。'))run(async()=>removeRecovery(item.key));}}>删除副本</button></div>)}</details>}
      {base.deleted&&<div className="notice">本章已移入回收站。可从目录的回收站恢复。</div>}
      <div className="manuscript-title" data-align={preferences.titleAlign}><InlineTitle value={draft.title} displayValue={chapterDisplayTitle(draft.title,chapterOrdinal,preferences.numbering)} label="修改章节标题" disabled={busy||base.deleted} commit={title=>set('title',title)}/></div>
      {modules.summary&&<section className="chapter-summary"><label htmlFor="chapter-summary"><strong>Summary:</strong></label><hr/><textarea id="chapter-summary" aria-label="本章梗概" placeholder="写下本章梗概，也可以让 AI 通过工作台填写。" value={draft.summary||''} disabled={busy||base.deleted} onChange={e=>set('summary',e.target.value)}/><hr/></section>}
      {selectionNotice&&<p className="notice" role="status">{selectionNotice}<button onClick={()=>setSelectionNotice('')}>关闭提示</button></p>}
      <div className="manuscript-surface">{findOpen&&<ProseMatchLayer content={draft.content.replace(/\r\n?/g,'\n')} state={findState} appearance={appearance}/>}<textarea {...manuscript} onBlur={()=>speed.pause()} onCompositionStart={()=>{manuscript.onCompositionStart();setImeComposing(true);speed.compositionStart?.();}} onCompositionEnd={e=>{manuscript.onCompositionEnd();setImeComposing(false);speed.compositionEnd?.(e.currentTarget.value);}} onPointerDown={()=>{selectionOpening.current=false;}} onSelect={()=>capture()} onKeyUp={()=>capture(true)} onPointerUp={e=>capture(e.button===0)} className="prose manuscript" aria-label="正文" style={appearance} disabled={busy||base.deleted||findBusy} onCopy={copyManuscriptSelection} onChange={e=>{if(!e.nativeEvent.isComposing)speed.record(e.target.value,{inputType:e.nativeEvent.inputType||'insertText'});set('content',e.target.value);}}/></div>
      <ChapterRibbon {...{call,novelId,tick,chapterId,onMemory,onEvent,onForeshadow,onStoryCard}}/>
      {historyOpen&&<section className="history-panel"><div className="row"><h3 className="grow">历史版本</h3><button onClick={()=>setHistoryOpen(false)}>关闭历史</button></div><ResourceState resource={history}><HistoryPair versions={history.value||[]}/>{groupHistory(history.value||[]).map(group=><details className="history-session" key={group[0].revision}><summary>{group.length>1?`作者编辑 · ${group.length} 次自动保存`:`版本 ${group[0].revision}`} · {group[0].timestamp?new Date(group[0].timestamp).toLocaleString():''}</summary>{group.map(h=><div className="history-item" key={h.revision}><div><strong>版本 {h.revision}</strong><p className="muted">{h.actor?.kind==='agent'?'Agent':'作者'} · {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}<br/>{h.reason||'正文修改'}</p></div><div className="row"><button onClick={()=>{setComparison(h);setHistoryOpen(false);}}>比较</button><button disabled={busy||phase==='saving'} onClick={async()=>{if(await confirm(`恢复版本 ${h.revision}？会先保存当前草稿到历史；保存失败、离线或存在冲突时中止恢复。`))restoreHistory(h.revision);}}>恢复</button></div></div>)}</details>)}</ResourceState></section>}
      {comparison&&(comparison.summary||'')!==(draft.summary||'')&&<section className="history-panel"><h3>梗概对比</h3><TextDiff before={comparison.summary||''} after={draft.summary||''} beforeLabel={comparison.localRecovery?'本机副本梗概':`版本 ${comparison.revision} 梗概`} afterLabel="本地梗概"/><label>合并梗概<textarea aria-label="合并梗概" value={draft.summary||''} onChange={e=>set('summary',e.target.value)}/></label></section>}
      {comparison&&<section className="history-panel comparison"><div className="row"><h3 className="grow">版本比较</h3><button onClick={()=>setComparison(null)}>关闭比较</button></div><TextDiff before={comparison.content} after={draft.content} beforeLabel={comparison.localRecovery?`本机副本 · 基准 v${comparison.revision}`:`版本 ${comparison.revision}`} afterLabel={dirty?'本地草稿':`当前版本 ${base.revision}`}/><details className="history-merge-edit" open={conflict?true:undefined}><summary>编辑本地合并内容</summary><textarea className="prose" aria-label="合并正文" disabled={busy||base.deleted} value={draft.content} onChange={e=>set('content',e.target.value)}/></details><p className="muted">可在这里合并需要的正文，再更新保存基准；合并后自动保存。后续写入仍检查版本。</p>{!comparison.localRecovery&&comparison.revision===latest?.revision&&!comparison.deleted&&<button onClick={async()=>{if(await confirm('确认已将需要的内容合并到本地正文？将以这版作为保存基准，后续更新仍会检查冲突。')){rebase(comparison);setComparison(null);}}}>已合并，更新保存基准</button>}<button disabled={busy||phase==='saving'} onClick={reload}>放弃草稿并读取最新</button></section>}
    </div>
    <QuickInputBar textareaRef={textareaRef} phrases={phrases.phrases} paired={preferences.pairedPunctuation} hidden={!preferences.quickInput||findOpen||imeComposing} disabled={busy||base.deleted||conflict} onInsert={(next,meta)=>{speed.record(next,{inputType:meta.inputType});set('content',next);}}/>
    {selectionDraft&&<ProseSelection {...{call,novelId,dirty}} chapterTitle={draft.title} selection={selectionDraft} stale={normalizeSelectionText(draft.content)!==selectionDraft.content} prepare={prepareSelection} close={()=>setSelectionDraft(null)} onSaved={onSaved} onLocate={proof=>requestAnimationFrame(()=>locate(proof))} onOpen={result=>result.kind==='card'?onStoryCard(result.id):result.kind==='foreshadow'?onForeshadow(result.id):onMemory(result.id)}/>}
    <ChapterFooter novelTitle={novelTitle} chapterTitle={draft.title} ordinal={chapterOrdinal} numbering={preferences.numbering} showInfo={preferences.showInfoBar} wordCount={preferences.wordCountPosition!=='top'&&wordCount}
      status={cacheError||saveError||(base.deleted?'已删除章节':!draft.title.trim()?'请填写章节名称':conflict?'待合并 · 双方内容已保留':phase==='offline'?'离线草稿 · 仅保存在此设备，联网后同步':phase==='saving'?'保存中…':dirty?'等待自动保存…':syncNotice||'已保存')}
      problem={!!(cacheError||saveError||conflict||phase==='offline'||base.deleted||!draft.title.trim()||syncNotice)} error={!!(cacheError||saveError||conflict)} retry={(phase==='error'||phase==='offline')?save:null}/>
  </div>;
}
