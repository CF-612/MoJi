// @ts-nocheck
import React from 'react';
import {DshConnectionContext,DshConnectionCard,CloudDeploymentGuide} from '#moji-shared-ui';
import avatar from './assets/moji.png';

const style=`
.moji-native{--mn-ink:#173453;--mn-muted:#6c7f99;--mn-line:#dce6f3;--mn-panel:#fff;--mn-soft:#f3f7fd;--mn-blue:#2867d9;position:relative;display:flex;flex-direction:column;height:100%;min-height:0;color:var(--mn-ink);font:14px/1.6 system-ui,sans-serif}
.moji-native *{box-sizing:border-box}.moji-native-body{flex:1;min-height:0}.moji-native-body .moji-preferences>.cuigengji{height:100%}
.moji-native .moji-connection-card,.moji-native .cuigengji .sheet-actions>button.moji-connection-card{display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;min-width:0;padding:18px 20px;margin:0 0 10px;border:1px solid var(--mn-blue);border-radius:14px;background:var(--mn-soft);color:var(--mn-ink);text-align:left;cursor:pointer}.moji-connection-card:hover{box-shadow:0 3px 14px #2867d91a}.mn-card-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.mn-card-copy strong{font-size:16px;font-weight:650}.mn-card-status{font-size:13px}.mn-card-copy small{font-size:12px;color:var(--mn-muted)}.mn-card-arrow{font-size:28px;color:var(--mn-blue)}.mn-recovery-navigation{padding:16px 20px;flex:none}.mn-recovery-navigation .moji-connection-card{margin:0}
.moji-native svg{display:block;flex:none}.moji-native button:focus-visible,.moji-native input:focus-visible{outline:3px solid #86b0ff;outline-offset:3px}
.moji-connection-panel{width:min(470px,calc(100vw - 32px));max-height:calc(100dvh - 48px);padding:0;overflow:auto;border:1px solid var(--mn-line);border-radius:20px;background:var(--mn-panel);color:var(--mn-ink);box-shadow:0 24px 100px #15315b30;font:14px/1.6 system-ui,sans-serif}.moji-connection-panel::backdrop{background:#172d4d50;backdrop-filter:blur(4px)}
.mn-panel-head{display:flex;align-items:center;gap:12px;padding:24px 24px 20px}.mn-panel-head img{width:46px;height:46px;object-fit:contain}.mn-panel-head h2{font-size:18px;line-height:1.4;margin:0 0 3px;font-weight:650}.mn-panel-head p{margin:0;color:var(--mn-muted);font-size:12px}.mn-close{align-self:flex-start;margin-left:auto;display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--mn-muted);cursor:pointer}.mn-close:hover{background:var(--mn-soft)}
.mn-panel-content{padding:0 24px 24px}.mn-status{display:flex;align-items:center;gap:7px;margin-bottom:20px;color:var(--mn-muted);font-size:12px}.mn-status-dot{width:6px;height:6px;background:#31a57c;border-radius:50%}.mn-status-dot[data-ready=false]{background:#d39b45}
.mn-locations{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 20px;padding:0;border:0}.mn-location{display:flex;align-items:center;gap:10px;min-height:72px;padding:14px;border:1px solid var(--mn-line);border-radius:12px;background:var(--mn-panel);color:var(--mn-ink);text-align:left;font:inherit;cursor:pointer}.mn-location[aria-checked=true]{border-color:var(--mn-blue);background:var(--mn-soft);box-shadow:inset 0 0 0 1px var(--mn-blue)}.mn-location svg{color:var(--mn-blue)}.mn-location strong{display:block;font-size:13px;font-weight:600}.mn-location small{display:block;color:var(--mn-muted);font-size:11px}
.mn-url-label{display:block;margin:0 0 7px;font-size:12px;font-weight:600}.mn-url{width:100%;min-width:0;height:42px;padding:10px 12px;border:1px solid var(--mn-line);border-radius:9px;background:var(--mn-panel);color:var(--mn-ink);font:13px system-ui}.mn-url::placeholder{color:#95a4b9}.mn-help{margin:9px 0 19px;color:var(--mn-muted);font-size:12px;line-height:1.75}
.mn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:9px 16px;border:1px solid var(--mn-blue);border-radius:9px;background:var(--mn-blue);color:#fff;text-decoration:none;font:600 13px system-ui;cursor:pointer}.mn-apply{width:100%}.moji-connection-panel button:disabled{opacity:.5;cursor:wait}.mn-login{padding:16px;margin-top:18px;border:1px solid var(--mn-line);border-radius:12px;background:var(--mn-soft)}.mn-login p{margin:0 0 12px;color:var(--mn-muted);font-size:12px}.mn-login a{margin-top:10px}.mn-logout{display:block;margin:15px auto 0;padding:4px 8px;border:0;background:none;color:var(--mn-muted);font:12px system-ui;cursor:pointer}.mn-logout:hover{color:#bd4563}.mn-error{padding:10px 12px;border-radius:9px;background:#fff0f2;color:#a73350;font-size:12px;overflow-wrap:anywhere}
.mn-empty{display:flex;height:100%;min-height:240px;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:28px;text-align:center;color:var(--mn-muted)}.mn-empty img{width:72px;height:72px;object-fit:contain}.mn-empty p{max-width:280px;margin:0;font-size:13px}
/* The connection dialog is a sibling of the shared workbench preference scope. */
.moji-native:has(.moji-preferences[data-theme-preference=dark]),html[data-theme=dark] .moji-native:not(:has(.moji-preferences[data-theme-preference=light])){--mn-ink:#dce6f4;--mn-muted:#9aaec8;--mn-line:#34455e;--mn-panel:#19263a;--mn-soft:#22344e;--mn-blue:#6c9fff}
@media(prefers-color-scheme:dark){html:not([data-theme=light]) .moji-native:not(:has(.moji-preferences[data-theme-preference=light])){--mn-ink:#dce6f4;--mn-muted:#9aaec8;--mn-line:#34455e;--mn-panel:#19263a;--mn-soft:#22344e;--mn-blue:#6c9fff}}
.moji-native:not(:has(.moji-preferences[data-backdrop-blur=true]))>.moji-connection-panel::backdrop{backdrop-filter:none;-webkit-backdrop-filter:none}
.moji-native:has(.moji-preferences[data-backdrop-blur=true])>.moji-connection-panel::backdrop{backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
@media(max-width:380px){.mn-panel-head{padding:20px 18px 16px}.mn-panel-content{padding:0 18px 20px}.mn-location{padding:10px;gap:8px}.mn-location small{font-size:10px}}
`;
const Icon=({kind,size=20})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='cloud'?<path d="M7 18a5 5 0 1 1 .8-9.94A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7Z"/>:kind==='local'?<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>:kind==='close'?<path d="m6 6 12 12M6 18 18 6"/>:<><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></>}</svg>;

export function NativeConnection({rpc,sessionId,Workbench}){
  const [connection,setConnection]=React.useState(null),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false),[open,setOpen]=React.useState(false);
  const [mode,setMode]=React.useState('local'),[url,setUrl]=React.useState(''),[loginUrl,setLoginUrl]=React.useState('');
  const dialog=React.useRef(null),trigger=React.useRef(null),running=React.useRef(false),lastReadyView=React.useRef('');
  const call=React.useCallback(async(action,args={})=>{
    try{return await rpc(action,args,sessionId);}
    catch(error){if(action!=='connection.status'&&['NOT_AUTHENTICATED','UNAUTHORIZED','UNAUTHENTICATED'].includes(error.code))void rpc('connection.status',{},sessionId).then(setConnection).catch(()=>{});throw error;}
  },[rpc,sessionId]);
  const load=React.useCallback(async()=>{const next=await call('connection.status');setConnection(next);return next;},[call]);
  React.useEffect(()=>{let live=true;call('connection.status').then(next=>{if(live){setConnection(next);setMode(next.mode);setUrl(next.instanceUrl||'');}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[call]);
  React.useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();else if(!open&&dialog.current?.open)dialog.current.close();},[open]);
  React.useEffect(()=>{if(!connection?.pending)return;let live=true;const timer=setInterval(()=>{call('connection.status').then(next=>{if(live){setConnection(next);if(next.authenticated)setLoginUrl('');}}).catch(e=>{if(live)setError(e.message);});},2000);return()=>{live=false;clearInterval(timer);};},[call,connection?.pending]);
  const run=async operation=>{if(running.current)return;running.current=true;setBusy(true);setError('');try{await operation();}catch(e){setError(e.message);}finally{running.current=false;setBusy(false);}};
  const ready=connection&&(connection.mode==='local'||connection.authenticated);
  const key=connection?`${connection.mode}:${connection.instanceUrl}:${sessionId}`:sessionId;
  if(ready)lastReadyView.current=key;
  const showWorkbench=ready||lastReadyView.current===key;
  const location=connection?.mode==='cloud'?'个人云端':'本地保存';
  const status=!connection?(error?'连接状态读取失败':'正在读取连接…'):`当前：${location}${connection.mode==='cloud'?(connection.authenticated?' · 已连接':connection.pending?' · 等待授权':' · 尚未登录'):''}`;
  // ToolSheet dismisses before opening this dialog, so focus returns to its stable trigger.
  const openConnection=()=>{setTimeout(()=>{trigger.current=document.activeElement;setOpen(true);},0);};
  return <DshConnectionContext.Provider value={{status,open:openConnection}}><div className="moji-native"><style>{style}</style>
    {!showWorkbench&&<nav className="mn-recovery-navigation" aria-label="工作台连接"><DshConnectionCard/></nav>}
    <dialog ref={dialog} className="moji-connection-panel" aria-labelledby="mn-connection-title" onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}>
      <header className="mn-panel-head"><img src={avatar} alt="烟灰蛸"/><div><h2 id="mn-connection-title">本地 / 云端</h2><p>让故事在熟悉的地方继续</p></div><button type="button" className="mn-close" aria-label="关闭本地与云端设置" onClick={()=>setOpen(false)}><Icon kind="close" size={17}/></button></header>
      <div className="mn-panel-content"><div className="mn-status"><span className="mn-status-dot" data-ready={Boolean(ready)}/>{status}</div>
      <form onSubmit={e=>{e.preventDefault();void run(async()=>{await call('connection.configure',{mode,instanceUrl:url});setLoginUrl('');const next=await load();if(next.mode==='local'||next.authenticated)setOpen(false);});}}>
        <div className="mn-locations" role="radiogroup" aria-label="作品位置">{[['local','本地','保存在这台电脑'],['cloud','个人云端','与其他客户端共用作品']].map(([value,label,hint])=><button key={value} className="mn-location" type="button" role="radio" aria-checked={mode===value} disabled={busy} onClick={()=>setMode(value)}><Icon kind={value}/><span><strong>{label}</strong><small>{hint}</small></span></button>)}</div>
        {mode==='cloud'&&<><label className="mn-url-label" htmlFor="mn-cloud-url">云端地址</label><input id="mn-cloud-url" className="mn-url" aria-label="个人云端地址" type="url" placeholder="https://你的实例.workers.dev" value={url} disabled={busy} onChange={e=>setUrl(e.target.value)} required/></>}
        <p className="mn-help">切换前请保存当前草稿。已有作品会留在原处，不会自动迁移。</p>{mode==='cloud'&&<p className="mn-help">连接已有的个人云端实例；这里不会新建或部署云服务。填写 HTTPS 根地址，不要加 /mcp。</p>}
        <button className="mn-primary mn-apply" disabled={busy}>{busy?'正在连接…':'保存并切换'}</button>
      </form>
      {mode==='cloud'&&<CloudDeploymentGuide/>}
      {connection?.mode==='cloud'&&!connection.authenticated&&<div className="mn-login"><p>{connection.pending?'请在浏览器中完成授权，登录后会自动连接。':'登录后，即可使用与 GPT/Codex 相同的云端作品。'}</p><button className="mn-primary" disabled={busy||connection.pending} onClick={()=>void run(async()=>{const result=await call('connection.login');setLoginUrl(result.authorizationUrl);await load();})}>{connection.pending?'等待授权…':'登录个人云端'}</button>{loginUrl&&<a className="mn-primary" href={loginUrl} target="_blank" rel="noreferrer">打开授权页 ↗</a>}{connection.error&&<p role="status">{connection.error}</p>}</div>}
      {connection?.mode==='cloud'&&connection.authenticated&&<button type="button" className="mn-logout" disabled={busy} onClick={()=>void run(async()=>{await call('connection.logout');lastReadyView.current='';await load();})}>退出此云端连接</button>}
      {error&&<p className="mn-error" role="alert">{error}</p>}</div>
    </dialog>
    <div className="moji-native-body">{showWorkbench?<Workbench key={key} sessionId={key} rpc={(action,args)=>call(action,args)}/>:<div className="mn-empty"><img src={avatar} alt=""/><p role="status">{error||(!connection?'正在读取连接…':'连接你的个人云端，继续同一个故事。')}</p>{error&&<button className="mn-primary" disabled={busy} onClick={()=>void run(async()=>{const next=await load();setMode(next.mode);setUrl(next.instanceUrl||'');})}>重试读取连接</button>}</div>}</div>
  </div></DshConnectionContext.Provider>;
}
