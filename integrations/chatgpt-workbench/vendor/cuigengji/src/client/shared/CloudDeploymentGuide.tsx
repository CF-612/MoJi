import React,{createContext,useContext,useState,useRef} from 'react';
import {cloudDeploymentPrompt} from './cloud-deployment-prompt.mjs';
export const DeploymentAgentContext=createContext<null|{host:'dsh'|'mcp';send:null|((text:string)=>Promise<string>)}>(null);
export function CloudDeploymentGuide(){
 const send=useContext(DeploymentAgentContext)?.send,running=useRef(false);
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[showPrompt,setShowPrompt]=useState(false);
 return <section className="cloud-deployment-guide" onClick={event=>event.stopPropagation()} style={{padding:'16px',marginTop:12,border:'1px solid #b9cce6',borderRadius:12,background:'var(--mn-soft,var(--cg-paper))',color:'inherit'}} aria-label="个人云端部署引导">
  <style>{`.cloud-deployment-guide button{min-height:36px;padding:8px 11px;border:1px solid #b9cce6;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer}.cloud-deployment-guide button.cloud-deployment-send{background:#2867d9;border-color:#2867d9;color:#fff}.cloud-deployment-guide button:disabled{opacity:.6;cursor:wait}.cloud-deployment-guide textarea{padding:10px;border:1px solid #b9cce6;border-radius:8px;color:inherit;background:transparent;font:12px/1.7 system-ui}.cloud-deployment-guide [role=status]{font-size:12px;line-height:1.7;overflow-wrap:anywhere}`}</style>
  <strong>还没有云端？让 AI 帮我部署</strong><p style={{fontSize:12,lineHeight:1.7}}>在你自己的 Cloudflare 账号创建个人实例。AI 会先确认账号、资源与费用；本机作品不会自动上传。</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{send&&<button className="cloud-deployment-send" type="button" disabled={busy} onClick={async()=>{if(running.current)return;running.current=true;setBusy(true);setStatus('正在交给当前 Agent…');try{setStatus(await send(cloudDeploymentPrompt));}catch(error){setStatus(`未能发送：${(error as Error).message}。可复制下方提示词到当前聊天。`);setShowPrompt(true);}finally{running.current=false;setBusy(false);}}}>{busy?'发送中…':'发送部署提示词给当前 Agent'}</button>}<button type="button" onClick={async()=>{setShowPrompt(true);try{await navigator.clipboard.writeText(cloudDeploymentPrompt);setStatus('部署提示词已复制，请粘贴到当前 Agent。');}catch{setStatus('无法访问剪贴板，请手动复制下方提示词。');}}}>复制部署提示词</button><button type="button" onClick={()=>setShowPrompt(value=>!value)}>{showPrompt?'收起提示词':'查看提示词'}</button></div>
  {!send&&<p style={{fontSize:12}}>当前入口未提供直接发送通道，请复制到对应 Agent。</p>}{status&&<p role="status">{status}</p>}{showPrompt&&<textarea aria-label="云端部署提示词" readOnly value={cloudDeploymentPrompt} style={{width:'100%',minHeight:180,boxSizing:'border-box',marginTop:10}}/>}
 </section>;
}
