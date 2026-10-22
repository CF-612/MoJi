import {WorkSearch} from './shared/WorkSearch.jsx';
// The workbench is the typed migration boundary; legacy JSX modules are intentionally
// consumed without declaration generation while they are migrated incrementally.
// @ts-nocheck
import {UpdateNotice} from './shared/UpdateNotice.tsx';
import {isReadAction} from '../contracts/actions.js';
import {boardKey} from './features/structure/useBoard.js';
import {preloadResource,resourceCache} from './shared/resource-cache.js';
import {ModuleContext} from './modules/context.tsx';
import {ModulePage} from './modules/index.tsx';
import {pageAvailable} from './modules/registry.mjs';
import {cardColorVariables} from './shared/card-colors.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {PreferencesProvider, PreferencesDialog, AboutDialog, useWorkbenchPreferences} from './shared/preferences.tsx';
import { styles } from './style.ts';
import { DialogProvider, useDialog } from './dialog.tsx';
import { Memory } from './features/memory/index.jsx';
import { Manage } from './features/manage/index.tsx';
import { TransferPage } from './features/transfer/index.tsx';
import {Welcome} from './features/welcome/index.tsx';
import {WorkDetail} from './features/welcome/WorkDetail.tsx';
import {NovelForm} from './shared/presentation.tsx';
import { Chapters } from './features/chapters/index.jsx';
import { Planning } from './features/planning/index.jsx';
import { Preset } from './features/preset/index.tsx';
import { SessionScope, usePreference, useResource } from './shared/state.js';
import { ResourceState } from './shared/ui.jsx';
import {WorkbenchHeader} from './shared/WorkbenchHeader.tsx';
import {RefreshProvider, useWorkbenchRefresh} from './shared/refresh.tsx';

const message = error => error?.message || String(error);

export function Workbench(props) {
  return <SessionScope.Provider value={props.sessionId}><RefreshProvider><PreferencesProvider><ModuleScope><DialogProvider><WorkbenchContent {...props} /></DialogProvider></ModuleScope></PreferencesProvider></RefreshProvider></SessionScope.Provider>;
}

function ModuleScope({children}) {const {preferences}=useWorkbenchPreferences();return <ModuleContext.Provider value={preferences.modules}>{children}</ModuleContext.Provider>;}

function WorkbenchContent({ sessionId, rpc }) {
  const {preferences}=useWorkbenchPreferences();
  const {refresh}=useWorkbenchRefresh();
  const [utility,setUtility]=useState(null);const [searchVisit,setSearchVisit]=useState(0);
  const [homeOpen,setHomeOpen]=useState(false);
  const [relationRequest,setRelationRequest]=useState(null);
  const [cardRequest,setCardRequest]=useState(null),[proseRequest,setProseRequest]=useState(null);
  const [tab, setTab] = usePreference('page', 'detail');
  const [managementReturn, setManagementReturn] = usePreference('management-return', 'chapters');
  useEffect(()=>{if(tab==='context')setTab('chapters');},[tab]);
  const [returnTarget,setReturnTarget]=useState(null);
  const [transferInitial,setTransferInitial]=useState(null);
  const [transferVisit,setTransferVisit]=useState(0);
  useEffect(()=>{if(!pageAvailable(tab,preferences.modules))setTab('chapters');},[tab,preferences.modules]);
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
  useEffect(()=>{if(tab==='timeline'&&novelId){try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-area`,JSON.stringify('narration'));}catch{}setTab('plan');}},[tab,novelId,sessionId]);
  const running = useRef(false);
  const run = async fn => {
    if (running.current) return;
    running.current = true;
    setBusy(true); setError('');
    try { await fn(); setTick(x => x + 1); return true; }
    catch (e) { setError(message(e)); return false; }
    finally { running.current = false; setBusy(false); }
  };
  const create = value=>run(async()=>{const n=await call('novel.create',value);await call('binding.set',{novelId:n.id});setUtility(null);setHomeOpen(false);setTab('detail');});
  const openNovel=id=>run(async()=>{await call('binding.set',{novelId:id});setHomeOpen(false);setTab('detail');setReturnTarget(null);});
  const openManagement=page=>{if(homeOpen||!novelId)setManagementReturn('welcome');else if(['chapters','plan','memory'].includes(tab))setManagementReturn(tab);setHomeOpen(false);setReturnTarget(null);setTab(page);};
  const openTransfer=initial=>{if(homeOpen||!novelId)setManagementReturn('welcome');else if(['chapters','plan','memory','preset','manage'].includes(tab))setManagementReturn(tab);setHomeOpen(false);setTransferInitial(initial);setTransferVisit(value=>value+1);setReturnTarget(null);setTab('data');};
  const returnFromManagement=()=>{setReturnTarget(null);setHomeOpen(managementReturn==='welcome');setTab(['chapters','plan','memory','preset','manage'].includes(managementReturn)?managementReturn:'chapters');};
  const managementBack={onBack:returnFromManagement,backLabel:managementReturn==='welcome'?'返回作品首页':novelId?'返回'+({plan:'规划',memory:'设定',chapters:'正文',preset:'写作预设',manage:'作品与备份'}[managementReturn]||'正文'):'返回作品选择'};
  const jump=(page,key,id)=>{setReturnTarget(tab);try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:${key}`,JSON.stringify(id));}catch{}setTab(page);};
  const onChapter=(id,proof)=>{setProseRequest(proof?{...proof,chapterId:id,token:crypto.randomUUID()}:null);jump('chapters','chapter',id);};
  const onStoryCard=id=>{setCardRequest(id);setReturnTarget(tab);setTab('plan');};
  const onEvent=(id,create)=>{if(!preferences.modules.timeline){setError('时间线已隐藏，可在设置中重新显示。');setUtility('settings');return;}if(create){try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:timeline-create`,JSON.stringify(true));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:timeline-new-context`,JSON.stringify(typeof create==='object'?create:null));}catch{}}try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-area`,JSON.stringify('narration'));}catch{}jump('plan','timeline-event',id);setSearchVisit(n=>n+1);};
  const onPlanning=id=>run(async()=>{const result=await call('planning.get',{novelId,nodeId:id});try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-page`,JSON.stringify(result.node.pageId||''));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:planning-area`,JSON.stringify('scenes'));}catch{}jump('plan','planning-selected',id);});
  useEffect(()=>{const openSearch=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.isComposing&&novelId&&!showHome&&!busy&&!utility){e.preventDefault();setUtility('search');}};document.addEventListener('keydown',openSearch);return()=>document.removeEventListener('keydown',openSearch);},[novelId,showHome,busy,utility]);
  const onCreateMemory=type=>{try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:memory-area`,JSON.stringify('library'));}catch{}jump('memory','memory-create-request',type);};
 const onRelation=(from,to)=>{if(!preferences.modules.timeline||!preferences.modules.evolution){setError('人物关系演变已隐藏，可在设置中重新显示。');setUtility('settings');return;}if((from||to)&&(!from||!to||from===to))return;try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:v31-area`,JSON.stringify('timeline'));}catch{}setRelationRequest({pair:from&&to?[from,to]:null});setReturnTarget(tab);setTab('plan');setSearchVisit(n=>n+1);};
 const onForeshadow=id=>{if(!preferences.modules.foreshadow){setError('伏笔辅助已隐藏，可在设置中重新显示。');setUtility('settings');return;}try{localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:v31-area`,JSON.stringify('foreshadow'));localStorage.setItem(`cuigengji:ui:${sessionId}:${novelId}:foreshadow-filter`,JSON.stringify('all'));}catch{}jump('plan','foreshadow-selected',id||null);setSearchVisit(n=>n+1);};
  return <section className="cuigengji" data-page={showHome?'home':tab} data-motion={preferences.motion} style={{...cardColorVariables(preferences.cardColors),'--prose-size':`${preferences.fontSize}px`,'--prose-leading':preferences.leading}} aria-label="墨叽小说工作台">
    <style>{styles}</style><UpdateNotice/>
    <WorkbenchHeader home={showHome} novelTitle={novel?.title} tab={tab} busy={busy} refreshing={resource.loading} onHome={()=>{setHomeOpen(true);setReturnTarget(null);}} onTab={page=>{if(['manage','preset'].includes(page))openManagement(page);else {setReturnTarget(null);setTab(page);}}} onRefresh={refresh} onSettings={()=>setUtility('settings')} onAbout={()=>setUtility('about')} onSearch={()=>setUtility('search')}/>
    {error && <div className="notice error" role="alert">{error}<button onClick={()=>setError('')}>关闭提示</button></div>}

    <ResourceState resource={resource}>
      {homeOpen?<Welcome {...{books,busy,call,tick}} onOpen={openNovel} onCreate={()=>setUtility('create')} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>:tab==='data'?<TransferPage key={transferVisit} {...{call,run,busy,novelId}} {...managementBack} initial={transferInitial} onOpen={openNovel}/>:<>
      {!novelId ? (tab==='manage'?<Manage {...{call,run,busy}} {...managementBack} onTransfer={openTransfer}/>:<Welcome {...{books,busy,call,tick}} onOpen={openNovel} onCreate={()=>setUtility('create')} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>) : <div className="workbench-body" key={`${novelId}:${searchVisit}`}>{returnTarget&&<div className="return-strip"><button onClick={()=>{setTab(returnTarget);setReturnTarget(null);}}>‹ 返回{({plan:'规划',memory:'资料'})[returnTarget]||'上一页'}</button></div>}
        {tab==='detail'&&<WorkDetail {...{call,novelId,tick,run,busy}} onChapter={id=>{if(id)jump('chapters','chapter',id);else setTab('chapters');}} onPlanning={id=>id?onStoryCard(id):setTab('plan')} onMemory={()=>setTab('memory')} onForeshadow={onForeshadow}/>}

        {tab==='overview'&&<ModulePage id="overview" {...{call,novelId,tick,run,busy,onForeshadow}} onChapter={onChapter}/>}
        {tab==='chapters' && <Chapters {...{call,novelId,tick,run,busy,onEvent,onForeshadow,onStoryCard,proseRequest}} onProseLocated={()=>setProseRequest(null)} onMemory={id=>jump('memory','memory-selected',id)} onTransfer={openTransfer}/>}
        {tab==='memory' && <Memory {...{call,novelId,tick,run,busy,onForeshadow,onPlanning,onRelation}} onEvent={onStoryCard} onTransfer={openTransfer} onChapter={onChapter}/>}
        {tab==='plan' && <Planning {...{call,novelId,tick,run,busy,onEvent,onPlanning,onCreateMemory,relationRequest,cardRequest}} onCardOpened={()=>setCardRequest(null)} onRelationOpened={()=>setRelationRequest(null)} onTransfer={openTransfer} onMemory={id=>jump('memory','memory-selected',id)} onChapter={onChapter}/>}
        {tab==='preset' && <Preset {...{call,novelId,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
        {tab==='manage' && <Manage {...{call,novelId,novel,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
      </div>}
      </>}
    </ResourceState>
    {utility==='search'&&novelId&&<WorkSearch key={novelId} {...{call,novelId,busy}} novelTitle={novel?.title} close={()=>setUtility(null)} onOpen={async hit=>{if(hit.kind==='planning'){if(!await onPlanning(hit.id))return;}else if(hit.kind==='chapter')jump('chapters','chapter',hit.id);else if(['character','world'].includes(hit.kind))jump('memory','memory-selected',hit.id);else if(hit.kind==='event')onStoryCard(hit.id);else if(hit.kind==='foreshadow')onForeshadow(hit.id);else setTab('preset');const destination={chapter:'chapters',character:'memory',world:'memory',planning:'plan',event:'plan',foreshadow:'plan',requirements:'preset'}[hit.kind];if(destination===tab)setReturnTarget(null);setUtility(null);setSearchVisit(n=>n+1);}}/>}
    {utility==='settings'&&<PreferencesDialog close={()=>setUtility(null)} novelTitle={novel?.title} onPreset={novelId?()=>{setUtility(null);openManagement('preset');}:undefined}/>}
    {utility==='about'&&<AboutDialog close={()=>setUtility(null)}/>}
    {utility==='create'&&<NovelForm {...{busy}} close={()=>setUtility(null)} save={create}/>}
  </section>;
}
