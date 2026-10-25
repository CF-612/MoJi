import React,{useEffect,useState,useContext,useRef} from 'react';
import manifest from '../../../package.json' with {type:'json'};
import {brand} from '../../domain/brand.js';
import {compareVersions,validateRelease} from '../../domain/release.js';
import {DeploymentAgentContext} from '#moji-shared-ui';
import {updateAgentPrompt} from '../../domain/update-agent.js';
const feed=manifest.moji?.updateManifestUrl as string|null;
const key='moji:release-check:v1',dismissed='moji:dismissed-release:v1';
function cached(){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
function useRelease(automatic=false){
 const [release,setRelease]=useState<any>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const check=async()=>{
  if(!feed){setMessage('公开安装包尚未发布，发布后将提供更新检查。');return;}
  setBusy(true);setMessage('');
  try{const url=new URL(feed);if(url.protocol!=='https:')throw new Error('更新源尚未配置');
   const response=await fetch(url.href,{credentials:'omit',signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('暂时无法检查更新，请稍后重试。');
   const next=validateRelease(await response.json());try{localStorage.setItem(key,JSON.stringify({at:Date.now(),feed,release:next}));}catch{}setRelease(next);
   setMessage(compareVersions(next.version,brand.version)>0?'':'当前已是最新版本。');
  }catch(e){setRelease(null);setMessage('暂时无法检查更新（RELEASE_CHECK_FAILED），请稍后重试或交给 Agent 排查。');}finally{setBusy(false);}
 };
 useEffect(()=>{if(!feed)return;const old=cached();if(old?.feed===feed&&old.release){try{setRelease(validateRelease({...old.release,product:'moji'}));}catch{}}
  if(automatic&&(!old||old.feed!==feed||Date.now()-old.at>86400000))void check();
 },[]);
 return {release:release&&compareVersions(release.version,brand.version)>0?release:null,message,busy,check};
}
export function UpdateNotice(){
 const {release}=useRelease(true),[hidden,setHidden]=useState(()=>{try{return localStorage.getItem(dismissed)||'';}catch{return '';}});
 if(!release||hidden===release.version)return null;
 return <aside className="moji-update-notice" role="status"><span>墨叽有新版本 v{release.version}</span><UpdateActions release={release}/><button type="button" onClick={()=>{setHidden(release.version);try{localStorage.setItem(dismissed,release.version);}catch{}}}>稍后提醒</button></aside>;
}
export function UpdatePanel(){
 const {release,message,busy,check}=useRelease();
 return <section className="moji-update-panel" aria-label="版本更新"><div className="row"><strong className="grow">当前版本 v{brand.version}</strong><button type="button" disabled={busy} onClick={check}>{busy?'检查中…':'检查更新'}</button></div>{message&&<p role="status">{message}</p>}{release&&<><p>新版本 v{release.version}</p><p style={{whiteSpace:'pre-wrap'}}>{release.notes}</p><a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">查看版本并下载</a></>}<UpdateActions release={release} checkFailed={message.includes('RELEASE_CHECK_FAILED')}/><small>本地更新不会部署个人云端；手机连接原云端时，仍需更新该实例。</small></section>;
}

function UpdateActions({release,checkFailed=false}:{release:any;checkFailed?:boolean}){
 const agent=useContext(DeploymentAgentContext),running=useRef(false);
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[prompt,setPrompt]=useState('');
 const prepare=(cloud:boolean,packageUpdate=false)=>updateAgentPrompt({currentVersion:brand.version,targetVersion:release?.version,host:agent?.host,cloud,checkFailed,packageUpdate});
 const handoff=async(cloud:boolean,packageUpdate=false)=>{
  if(running.current)return;
  const text=prepare(cloud,packageUpdate);setPrompt(text);
  if(!agent?.send){setStatus('当前入口没有直接发送通道；请复制下方更新请求给 Agent。尚未执行更新。');return;}
  running.current=true;setBusy(true);setStatus('正在发送更新请求…');
  try{await agent.send(text);setStatus('更新请求已交给当前 Agent；尚未确认更新完成。');}
  catch{setStatus('未能确认发送（AGENT_HANDOFF_UNCONFIRMED）。请先查看当前聊天，避免重复发送；可手动复制下方请求。');}
  finally{running.current=false;setBusy(false);}
 };
 return <div className="moji-update-actions" style={{fontSize:12,display:'grid',gap:8}}>
  <span>后台自动安装不可用。可让当前 Agent 执行 GitHub 更新工具，或实际生成原插件更新压缩包。</span>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" disabled={busy} onClick={()=>void handoff(false)}>{busy?'发送中…':agent?.send?(agent.host==='mcp'?'压缩包更新（Agent 执行）':agent.host==='dsh'?'GitHub 更新（Agent 执行）':'交给 Agent 更新'):'准备更新请求'}</button>{agent?.host!=='mcp'&&<button type="button" disabled={busy} onClick={()=>void handoff(false,true)}>压缩包更新</button>}<button type="button" disabled={busy} onClick={()=>void handoff(true)}>更新已有个人云端</button></div>
  {status&&<p role="status">{status}</p>}
  {prompt&&<><textarea aria-label="墨叽更新请求" readOnly value={prompt} style={{width:'100%',minHeight:160,boxSizing:'border-box'}}/><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setStatus('更新请求已复制，请粘贴给 Agent；尚未执行更新。');}catch{setStatus('剪贴板不可用，请手动复制上方请求。');}}}>复制更新请求</button><button type="button" disabled={busy} onClick={()=>{setPrompt('');setStatus('');}}>收起</button></>}
 </div>;
}
