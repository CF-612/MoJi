// The workbench is the typed migration boundary; legacy JSX modules are intentionally
// consumed without declaration generation while they are migrated incrementally.
// @ts-nocheck
import {UpdateNotice} from './shared/UpdateNotice.tsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {PreferencesProvider, PreferencesDialog, AboutDialog, useWorkbenchPreferences} from './shared/preferences.tsx';
import { styles } from './style.ts';
import { DialogProvider, useDialog } from './dialog.tsx';
import { LocaleContext, registerLocale } from './locale.js';
import { Memory } from './features/memory/index.jsx';
import { Manage } from './features/manage/index.tsx';
import { TransferPage } from './features/transfer/index.tsx';
import {Welcome} from './features/welcome/index.tsx';
import { Chapters } from './features/chapters/index.jsx';
import { Planning } from './features/planning/index.jsx';
import { Preset } from './features/preset/index.tsx';
import { SessionScope, usePreference, useResource } from './shared/state.js';
import { ResourceState } from './shared/ui.jsx';
import { Launcher } from './launcher.tsx';
import {WorkbenchHeader} from './shared/WorkbenchHeader.tsx';
import {RefreshProvider, useWorkbenchRefresh} from './shared/refresh.tsx';

const ID = 'dsh-moji';
const RPC_ENDPOINT = 'cuigengji/dispatch';
const message = error => error?.message || String(error);
export const inject = ['connection', 'slots', 'sidebarRight', 'sidebarRightTabs', 'locale', 'layout', 'uiWorkspace', 'workspaces'];
export function apply(ctx) {
  const rpc = async (action, args, sessionId) => {
    const result = await ctx.connection.rpc.call('/api', RPC_ENDPOINT, { action, args, sessionId });
    if (!result.ok) throw Object.assign(new Error(result.error.message), { code: result.error.code });
    return result.value;
  };
  return applyWithRPC(ctx, rpc);
}

export function applyWithRPC(ctx, rpc) {
  const t = ctx.locale ? registerLocale(ctx) : key => ({ title: '墨叽', open: '打开小说目录、正文和设定' }[key]);
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: ID, kind: 'cuigengji', keepMounted: true,
    patterns: ['dsh-resource://cuigengji/**'], title: () => t('title'),
  }));
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action', id: ID, order: 40,
    inject: () => ({
      hooks: {novelSession:ctx.sidebarRight.mounted,novelWorkspaces:ctx.workspaces.list},
      openNovel: sessionId => ctx.sidebarRight.openResource(`dsh-resource://cuigengji/${encodeURIComponent(sessionId)}`),
      revealConversation: () => ctx.layout.selectPanel(null),
      openWorkspace: (id,beforeOpen) => ctx.uiWorkspace.openWorkspace(id,beforeOpen),
    }),
  }, Launcher));
  ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab', key: ID,
  }, props => {
    const tab = props.useTabInfo();
    const address = tab.tab.navigation.address;
    const sessionId = decodeURIComponent(address.slice(address.lastIndexOf('/') + 1));
    return <LocaleContext.Provider value={ctx.locale}><Workbench key={sessionId} sessionId={sessionId} rpc={rpc} /></LocaleContext.Provider>;
  }));
}

export function Workbench(props) {
  return <SessionScope.Provider value={props.sessionId}><RefreshProvider><PreferencesProvider><DialogProvider><WorkbenchContent {...props} /></DialogProvider></PreferencesProvider></RefreshProvider></SessionScope.Provider>;
}

function WorkbenchContent({ sessionId, rpc }) {
  const {preferences}=useWorkbenchPreferences();
  const {refresh}=useWorkbenchRefresh();
  const [utility,setUtility]=useState(null);
  const [homeOpen,setHomeOpen]=useState(false);
  const [tab, setTab] = usePreference('page', 'chapters');
  const [managementReturn, setManagementReturn] = usePreference('management-return', 'chapters');
  useEffect(()=>{if(tab==='context')setTab('chapters');},[tab]);
  const [returnTarget,setReturnTarget]=useState(null);
  const [transferInitial,setTransferInitial]=useState(null);
  const [transferVisit,setTransferVisit]=useState(0);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [tick, setTick] = useState(0);
  const { ask } = useDialog();
  const call = useCallback((action, args = {}) => rpc(action, args, sessionId), [rpc, sessionId]);
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
  return <section className="cuigengji" data-motion={preferences.motion} style={{'--prose-size':`${preferences.fontSize}px`,'--prose-leading':preferences.leading}} aria-label="墨叽小说工作台">
    <style>{styles}</style><UpdateNotice/>
    <WorkbenchHeader home={showHome} novelTitle={novel?.title} tab={tab} busy={busy} refreshing={resource.loading} onHome={()=>{setHomeOpen(true);setReturnTarget(null);}} onTab={page=>{setReturnTarget(null);setTab(page);}} onRefresh={refresh} onSettings={()=>setUtility('settings')} onAbout={()=>setUtility('about')}/>
    {error && <div className="notice error" role="alert">{error}<button onClick={()=>setError('')}>关闭提示</button></div>}

    <ResourceState resource={resource}>
      {homeOpen?<Welcome {...{books,busy}} onOpen={openNovel} onCreate={create} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>:tab==='data'?<TransferPage key={transferVisit} {...{call,run,busy,novelId}} {...managementBack} initial={transferInitial} onOpen={openNovel}/>:<>
      {!novelId ? (tab==='manage'?<Manage {...{call,run,busy}} {...managementBack} onTransfer={openTransfer}/>:<Welcome {...{books,busy}} onOpen={openNovel} onCreate={create} onImport={()=>openTransfer({mode:'import'})} onManage={()=>openManagement('manage')}/>) : <div className="workbench-body" key={novelId}>{returnTarget&&<div className="return-strip"><button onClick={()=>{setTab(returnTarget);setReturnTarget(null);}}>‹ 返回{({plan:'规划',memory:'设定'})[returnTarget]||'上一页'}</button></div>}
        {tab==='chapters' && <Chapters {...{call,novelId,tick,run,busy}} onTransfer={openTransfer}/>}
        {tab==='memory' && <Memory {...{call,novelId,tick,run,busy}} onTransfer={openTransfer} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='plan' && <Planning {...{call,novelId,tick,run,busy}} onTransfer={openTransfer} onMemory={id=>jump('memory','memory-selected',id)} onChapter={id=>jump('chapters','chapter',id)}/>}
        {tab==='preset' && <Preset {...{call,novelId,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
        {tab==='manage' && <Manage {...{call,novelId,novel,run,busy}} {...managementBack} onTransfer={openTransfer}/>}
      </div>}
      </>}
    </ResourceState>
    {utility==='settings'&&<PreferencesDialog close={()=>setUtility(null)} novelTitle={novel?.title} onPreset={novelId?()=>{setUtility(null);openManagement('preset');}:undefined}/>}
    {utility==='about'&&<AboutDialog close={()=>setUtility(null)}/>}
  </section>;
}
