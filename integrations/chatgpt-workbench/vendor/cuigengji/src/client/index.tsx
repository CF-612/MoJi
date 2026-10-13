import {WorkSearch} from './shared/WorkSearch.jsx';
// The workbench is the typed migration boundary; legacy JSX modules are intentionally
// consumed without declaration generation while they are migrated incrementally.
// @ts-nocheck
import {isReadAction} from '../contracts/actions.js';
import {boardKey} from './features/structure/useBoard.js';
import {preloadResource,resourceCache} from './shared/resource-cache.js';
import {Timeline} from './features/structure/Timeline.jsx';
import {WritingOverview} from './features/structure/Overview.jsx';
import {cardColorVariables} from './shared/card-colors.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {PreferencesProvider, PreferencesDialog, AboutDialog, useWorkbenchPreferences} from './shared/preferences.tsx';
import { styles } from './style.ts';
import { DialogProvider, useDialog } from './dialog.tsx';
import { Memory } from './features/memory/index.jsx';
import { Manage } from './features/manage/index.tsx';
import { TransferPage } from './features/transfer/index.tsx';
import {Welcome} from './features/welcome/index.tsx';
import { Chapters } from './features/chapters/index.jsx';
import { Planning } from './features/planning/index.jsx';
import { Preset } from './features/preset/index.tsx';
import { SessionScope, usePreference, useResource } from './shared/state.js';
import { ResourceState } from './shared/ui.jsx';
import {WorkbenchHeader} from './shared/WorkbenchHeader.tsx';
import {RefreshProvider, useWorkbenchRefresh} from './shared/refresh.tsx';

const message = error => error?.message || String(error);

export function Workbench(props) {
  return <SessionScope.Provider value={props.sessionId}><RefreshProvider><PreferencesProvider><DialogProvider><WorkbenchContent {...props} /></DialogProvider></PreferencesProvider></RefreshProvider></SessionScope.Provider>;
}

function WorkbenchContent({ sessionId, rpc }) {
  const {preferences}=useWorkbenchPreferences();
  const {refresh}=useWorkbenchRefresh();
  const [utility,setUtility]=useState(null);const [searchVisit,setSearchVisit]=useState(0);
  const [homeOpen,setHomeOpen]=useState(false);
  const [tab, setTab] = usePreference('page', 'chapters');
  const [managementReturn, setManagementReturn] = usePreference('management-return', 'chapters');
  useEffect(()=>{if(tab==='context')setTab('chapters');},[tab]);
  const [returnTarget,setReturnTarget]=useState(null);
  const [transferInitial,setTransferInitial]=useState(null);
  const [transferVisit,setTransferVisit]=useState(0);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [tick, setTick] = useState(0);
  const { ask } = useDialog();
  const call = useCallback(async(action,args={})=>{const result=await rpc(action,args,sessionId);if(!isReadAction(action)&&!['transfer.catalog','transfer.inspect','transfer.preview','transfer.exportPreview','transfer.export','transfer.snapshots','workspace.export'].includes(action)&&!action.endsWith('.preview'))resourceCache.invalidate();return result;},[rpc,sessionId]);
  const resource = useResource(() => Promise.all([call('novel.list'), call('binding.get')]), [call, tick]);
  const [books = [], binding = null] = resource.value || [];
  const novelId = binding?.novelId, novel = books.find(n => n.id === novelId);
  const showHome=homeOpen||(!novelId&&!['data','manage'].includes(tab));
  useEffect(()=>{
    const outside=event=>{document.querySelectorAll('.cuigengji details.menu[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});};
    const escape=event=>{if(event.key==='Escape'){document.querySelectorAll('.cuigengji details.menu[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary')?.focus();});}};
    const activate=event=>{const menu=event.target.closest?.('details.menu');if(menu&&event.target.closest('button'))menu.open=false;};
    document.addEventListener('click',activate);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('click',activate);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[]);
  useEffect(()=>{if(!novelId)return;const timer=setTimeout(()=>{preloadResource(sessionId,boardKey(novelId),()=>call('writing.board.get',{novelId})).catch(()=>{});},1500);return()=>clearTimeout(timer);},[novelId,call,sessionId]);
  const running = useRef(false);
  const run = async fn => {
    if (running.current) return;
    running.current = true;
    setBusy(true); setError('');
    try { await fn(); setTick(x => x + 1); return true; }
    catch (e) { setError(message(e)); return false; }
    finally { running.current = false; setBusy(false); }
  };
  const create = async () => { const title = await ask('作品名称'); if (title?.trim()) run(async () => { const n = await call('novel.create', { title }); await call('binding.set', { novelId: n.id }); setHomeOpen(false);setTab('chapters'); }); };
  const openNovel=id=>run(async()=>{await call('binding.set',{novelId:id});setHomeOpen(false);setTab('chapters');setReturnTarget(null);});
  const openManagement=page=>{if(homeOpen||!novelId)setManagementReturn('welcome');else if(['chapters','plan','memory'].includes(tab))setManagementReturn(tab);setHomeOpen(false);setReturnTarget(null);setTab(page);};
  const openTransfer=initial=>{if(homeOpen||!novelId)setManagementReturn('welcome');else if(['chapters','plan','memory','preset','manage'].includes(tab))setManagementReturn(tab);setHomeOpen(false);setTransferInitial(initial);setTransferVisit(value=>value+1);setReturnTarget(null);setTab('data');};
  const returnFromManagement=()=>{setReturnTarget(null);setHomeOpen(managementReturn==='welcome');setTab(['chapters','plan','memory','preset','manage'].includes(managementReturn)?managementReturn:'chapters');};
  const managementBack={onBack:returnFromManagement,backLabel:managementReturn==='welcome'?'返回作品首页':novelId?'返回'+({plan:'规划',memory:'设定',chapters:'正文',preset:'写作预设',manage:'作品与备份'}[managementReturn]||'正文'):'返回作品选择'};
  const jump=(page,key,id)=>{setReturnTarget(tab);try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:${key}`,JSON.stringify(id));}catch{}setTab(page);};
  const onEvent=(id,create)=>{if(create){try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:timeline-create`,JSON.stringify(true));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:timeline-new-context`,JSON.stringify(typeof create==='object'?create:null));}catch{}}jump('timeline','timeline-event',id);};
  const onPlanning=id=>run(async()=>{const result=await call('planning.get',{novelId,nodeId:id});try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-page`,JSON.stringify(result.node.pageId||''));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-area`,JSON.stringify('scenes'));}catch{}jump('plan','planning-selected',id);});
  useEffect(()=>{const openSearch=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.isComposing&&novelId&&!showHome&&!busy&&!utility){e.preventDefault();setUtility('search');}};document.addEventListener('keydown',openSearch);return()=>document.removeEventListener('keydown',openSearch);},[novelId,showHome,busy,utility]);
  const onCreateMemory=type=>{try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:memory-area`,JSON.stringify('library'));}catch{}jump('memory','memory-create-request',type);};
 const onForeshadow=id=>{try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-area`,JSON.stringify('narration'));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:timeline-filter`,JSON.stringify('foreshadow'));}catch{}jump('plan','foreshadow-selected',id);};
  return <section className="cuigengji" data-motion={preferences.motion} style={{...cardColorVariables(preferences.cardColors),'--prose-size':`${preferences.fontSize}px`,'--prose-leading':preferences.leading}} aria-label="催更姬小说工作台">
    <style>{styles}</style>
    <WorkbenchHeader home={showHome} novelTitle={novel?.title} tab={tab} busy={busy} refreshing={resource.loading} onHome={()=>{setHomeOpen(true);setReturnTarget(null);}} onTab={page=>{setReturnTarget(null);setTab(page);}} onRefresh={refresh} onSettings={()=>setUtility('settings')} onAbout={()=>setUtility('about')} onSearch={()=>setUtility('search')}/>
    {error && <div className="notice error" role="alert">{error}<button onClick={()=>setError('')}>关闭提示</button></div>}

    <ResourceState resource={resource}>
      {homeOpen?<Welcome {...{books,busy}} onOpen={openNovel} onCreate={create} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>:tab==='data'?<TransferPage key={transferVisit} {...{call,run,busy,novelId}} {...managementBack} initial={transferInitial} onOpen={openNovel}/>:<>
      {!novelId ? (tab==='manage'?<Manage {...{call,run,busy}} {...managementBack} onTransfer={openTransfer}/>:<Welcome {...{books,busy}} onOpen={openNovel} onCreate={create} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>) : <div className="workbench-body" key={`${novelId}:${searchVisit}`}>{returnTarget&&<div className="return-strip"><button onClick={()=>{setTab(returnTarget);setReturnTarget(null);}}>‹ 返回{({plan:'规划',memory:'设定'})[returnTarget]||'上一页'}</button></div>}
        {tab==='timeline'&&<Timeline {...{call,novelId,tick,run,busy,onPlanning,onForeshadow,onCreateMemory}} onMemory={id=>jump('memory','memory-selected',id)} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='overview'&&<WritingOverview {...{call,novelId,tick,run,busy,onForeshadow}} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='chapters' && <Chapters {...{call,novelId,tick,run,busy,onEvent,onForeshadow}} onMemory={id=>jump('memory','memory-selected',id)} onTransfer={openTransfer}/>}
        {tab==='memory' && <Memory {...{call,novelId,tick,run,busy,onEvent,onForeshadow,onPlanning}} onTransfer={openTransfer} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='plan' && <Planning {...{call,novelId,tick,run,busy,onEvent,onPlanning,onCreateMemory}} onTransfer={openTransfer} onMemory={id=>jump('memory','memory-selected',id)} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='preset' && <Preset {...{call,novelId,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
        {tab==='manage' && <Manage {...{call,novelId,novel,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
      </div>}
      </>}
    </ResourceState>
    {utility==='search'&&novelId&&<WorkSearch key={novelId} {...{call,novelId,busy}} novelTitle={novel?.title} close={()=>setUtility(null)} onOpen={async hit=>{if(hit.kind==='planning'){if(!await onPlanning(hit.id))return;}else if(hit.kind==='chapter')jump('chapters','chapter',hit.id);else if(['character','world'].includes(hit.kind))jump('memory','memory-selected',hit.id);else if(hit.kind==='event')onEvent(hit.id);else if(hit.kind==='foreshadow')onForeshadow(hit.id);else setTab('preset');const destination={chapter:'chapters',character:'memory',world:'memory',planning:'plan',event:'timeline',foreshadow:'plan',requirements:'preset'}[hit.kind];if(destination===tab)setReturnTarget(null);setUtility(null);setSearchVisit(n=>n+1);}}/>}
    {utility==='settings'&&<PreferencesDialog close={()=>setUtility(null)} novelTitle={novel?.title} onPreset={novelId?()=>{setUtility(null);openManagement('preset');}:undefined}/>}
    {utility==='about'&&<AboutDialog close={()=>setUtility(null)}/>}
  </section>;
}
