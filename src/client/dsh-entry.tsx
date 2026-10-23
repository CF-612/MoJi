// @ts-nocheck
import React from 'react';
import {LocaleContext,registerLocale,Workbench as SharedWorkbench,CollaborationContext} from '#moji-shared-ui';
import {createReliableRpc} from '../../integrations/chatgpt-workbench/client/reliable-rpc.mjs';
import {Launcher} from './launcher.tsx';
import {NativeConnection} from './native-connection.tsx';
import {referenceMessage,sendNativeReference} from './native-reference.js';

const ID='dsh-moji',RPC_ENDPOINT='cuigengji/dispatch';
export const inject=['connection','slots','sidebarRight','sidebarRightTabs','locale','layout','uiWorkspace','workspaces','sessions','conversation'];
export function apply(ctx){
  const sessions=new Map();
  const rpc=(action,args={},sessionId)=>{
    if(!sessions.has(sessionId))sessions.set(sessionId,createReliableRpc(async(action,args)=>{
      const result=await ctx.connection.rpc.call('/api',RPC_ENDPOINT,{action,args,sessionId});
      if(!result.ok)throw Object.assign(new Error(result.error.message),{code:result.error.code});
      if(['connection.configure','connection.logout'].includes(action))sessions.clear();
      return result.value;
    }));
    return sessions.get(sessionId)(action,args);
  };
  return applyWithRPC(ctx,rpc);
}
export function applyWithRPC(ctx,rpc){
  const t=ctx.locale?registerLocale(ctx):()=> '墨叽';
  ctx.effect(()=>ctx.sidebarRightTabs.register({id:ID,kind:'cuigengji',keepMounted:true,patterns:['dsh-resource://cuigengji/**'],title:()=>t('title')}));
  ctx.slots.inject('sidebar.footer.action',()=>ctx.slots.register({name:'sidebar.footer.action',id:ID,order:40,
    inject:()=>({hooks:{novelSession:ctx.sidebarRight.mounted,novelWorkspaces:ctx.workspaces.list,sessions:ctx.sessions.list},
      openNovel:sessionId=>ctx.sidebarRight.openResource(`dsh-resource://cuigengji/${encodeURIComponent(sessionId)}`),
      revealConversation:()=>ctx.layout.selectPanel(null),openWorkspace:(id,beforeOpen)=>ctx.uiWorkspace.openWorkspace(id,beforeOpen),
    }),
  },Launcher));
  ctx.slots.inject('sidebar.right.pane.tab',()=>ctx.slots.register({name:'sidebar.right.pane.tab',key:ID},props=>{
    const address=props.useTabInfo().tab.navigation.address;
    const sessionId=decodeURIComponent(address.slice(address.lastIndexOf('/')+1));
    const discuss=async(reference,selection)=>{
      await sendNativeReference(ctx,sessionId,referenceMessage(reference,selection));
      return '引用已交给这条对话';
    };
    return <LocaleContext.Provider value={ctx.locale}><CollaborationContext.Provider value={discuss}><NativeConnection key={sessionId} sessionId={sessionId} rpc={rpc} Workbench={SharedWorkbench}/></CollaborationContext.Provider></LocaleContext.Provider>;
  }));
}
