import React,{useEffect,useState} from 'react';
import manifest from '../../../package.json' with {type:'json'};
import {brand} from '../../domain/brand.js';
import {compareVersions,validateRelease} from '../../domain/release.js';
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
   const next=validateRelease(await response.json());localStorage.setItem(key,JSON.stringify({at:Date.now(),feed,release:next}));setRelease(next);
   setMessage(compareVersions(next.version,brand.version)>0?'':'当前已是最新版本。');
  }catch(e){setMessage((e as Error).message||'暂时无法检查更新，请稍后重试。');}finally{setBusy(false);}
 };
 useEffect(()=>{if(!feed)return;const old=cached();if(old?.feed===feed&&old.release){try{setRelease(validateRelease({...old.release,product:'moji'}));}catch{}}
  if(automatic&&(!old||old.feed!==feed||Date.now()-old.at>86400000))void check();
 },[]);
 return {release:release&&compareVersions(release.version,brand.version)>0?release:null,message,busy,check};
}
export function UpdateNotice(){
 const {release}=useRelease(true),[hidden,setHidden]=useState(()=>{try{return localStorage.getItem(dismissed)||'';}catch{return '';}});
 if(!release||hidden===release.version)return null;
 return <aside className="moji-update-notice" role="status"><span>墨叽有新版本 v{release.version}</span><a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">查看更新</a><button type="button" onClick={()=>{setHidden(release.version);try{localStorage.setItem(dismissed,release.version);}catch{}}}>稍后提醒</button></aside>;
}
export function UpdatePanel(){
 const {release,message,busy,check}=useRelease();
 return <section className="moji-update-panel" aria-label="版本更新"><div className="row"><strong className="grow">当前版本 v{brand.version}</strong><button type="button" disabled={busy} onClick={check}>{busy?'检查中…':'检查更新'}</button></div>{message&&<p role="status">{message}</p>}{release&&<><p>新版本 v{release.version}</p><p style={{whiteSpace:'pre-wrap'}}>{release.notes}</p><a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">查看版本并下载</a></>}<small>更新提醒不会自动下载、安装或改动作品。</small></section>;
}
