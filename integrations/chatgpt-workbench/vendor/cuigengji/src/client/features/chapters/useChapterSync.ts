import {useContext,useEffect,useMemo,useSyncExternalStore} from 'react';
import {SessionScope} from '../../shared/state.js';
import {draftKey,browserDraftStorage} from '../../shared/drafts.js';
import {ChapterSync,type Chapter} from './sync.ts';

import {chapterSessions as sessions,browserOnline} from './chapterSessions.ts';
/** Also hydrate cached drafts for chapters no longer open in the editor. */
export async function prepareChapterRemoval({scope,novelId,chapterId,read,write,onSaved}: {
  scope:string;novelId:string;chapterId:string;read:()=>Promise<Chapter>;
  write:(value:Chapter,base:Chapter,requestId:string)=>Promise<Partial<Chapter>>;onSaved:()=>void;
}) {
  const key=draftKey(scope,`${novelId}:chapter:${chapterId}`);
  let controller=sessions.get(key);
  if(!controller){controller=new ChapterSync({key,initial:await read(),storage:browserDraftStorage,read,write,onSaved,online:browserOnline});sessions.set(key,controller);}
  controller.options={...controller.options,read,write,onSaved};
  return {chapter:await controller.prepareRemoval(),accept:controller.accept,restoreVersion:controller.restoreVersion};
}
export function useChapterSync({novelId,chapterId,initial,latest,read,write,onSaved}: {
  novelId:string;chapterId:string;initial:Chapter;latest?:{revision:number};
  read:()=>Promise<Chapter>;write:(value:Chapter,base:Chapter,requestId:string)=>Promise<Partial<Chapter>>;onSaved:()=>void;
}){
  const scope=useContext(SessionScope),key=draftKey(scope,`${novelId}:chapter:${chapterId}`);
  const controller=useMemo(()=>{
    let existing=sessions.get(key);
    if(!existing){existing=new ChapterSync({key,initial,storage:browserDraftStorage,read,write,onSaved,online:browserOnline});sessions.set(key,existing);}
    return existing;
  },[key]);
  controller.options={...controller.options,read,write,onSaved};
  const state=useSyncExternalStore(controller.subscribe,controller.snapshot,controller.snapshot);
  useEffect(()=>{void controller.refresh();void controller.flush();return()=>{controller.checkpoint();void controller.flush();};},[controller]);
  useEffect(()=>{if(latest&&latest.revision!==controller.state.base.revision)void controller.refresh();},[controller,latest?.revision,state.base.revision]);
  return {...state,dirty:controller.dirty,change:controller.change,accept:controller.accept,rebase:controller.rebase,save:controller.flush,reloadLatest:controller.reloadLatest,removeRecovery:controller.removeRecovery,prepare:controller.prepareRemoval,restoreVersion:controller.restoreVersion,composition:controller.composition};
}
