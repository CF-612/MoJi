import {browserDraftStorage,changed,draftKey} from '../../shared/drafts.js';
import {ChapterSync,chapterChanges,type Chapter} from './sync.ts';

export const chapterSessions=new Map<string,ChapterSync>();
export async function readFullChapter(call:any,novelId:string,chapterId:string):Promise<Chapter>{
  const first=await call('chapter.get',{novelId,chapterId,maxChars:200000});
  let content=first.content,next=first.nextStart;
  while(next!==null&&next!==undefined){
    const page=await call('chapter.get',{novelId,chapterId,start:next,maxChars:200000});
    if(page.id!==first.id||page.revision!==first.revision||page.contentHash!==first.contentHash)throw new Error('读取期间正文发生变化，请重试。');
    content+=page.content;next=page.nextStart;
  }
  if(first.id!==chapterId)throw new Error('读取到的章节身份不匹配。');
  return {...first,content};
}
export const browserOnline=()=>typeof navigator==='undefined'||navigator.onLine!==false;
export function chapterSessionOptions(call:any,novelId:string,chapterId:string,onSaved=()=>{}){
  return {read:()=>readFullChapter(call,novelId,chapterId),write:(value:Chapter,base:Chapter,requestId:string)=>call('chapter.update',{novelId,chapterId,requestId,...chapterChanges(value,base),expectedRevision:base.revision,expectedHash:base.contentHash,reason:'作者自动保存'}),onSaved,online:browserOnline};
}
/** A backup uses confirmed server content, not just the currently mounted editor. */
export async function prepareTransferDrafts({scope,novelIds,call,storage=browserDraftStorage,sessions=chapterSessions}:{
  scope:string;novelIds:string[];call:any;storage?:typeof browserDraftStorage;sessions?:Map<string,ChapterSync>;
}){
  const prefix=draftKey(scope,''),keys=new Set<string>();
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix))keys.add(key);}
  for(const key of sessions.keys())if(key.startsWith(prefix))keys.add(key);
  const prepared:{key:string;controller:ChapterSync}[]=[];
  for(const key of keys){
    const entity=key.slice(prefix.length),novelId=novelIds.find(id=>entity.startsWith(id+':'));
    if(!novelId)continue;
    const suffix=entity.slice(novelId.length+1),raw=storage.getItem(key);
    let cached:any=null;
    if(raw){try{cached=JSON.parse(raw);}catch{throw new Error('本地存在无法读取的草稿，操作已中止；请先备份并核对本地草稿。');}}
    if(!suffix.startsWith('chapter:')){
      if(cached&&changed(cached))throw new Error('所选作品还有未保存的资料或规划草稿，请返回对应页面保存后再导出或恢复。');
      continue;
    }
    // Process canonical drafts first; saving them retires identical safety copies.
    if(suffix.includes(':recovery:'))continue;
    const chapterId=suffix.slice('chapter:'.length);
    if(cached&&(!cached.base||!cached.value||cached.base.id!==chapterId||cached.value.id!==chapterId||typeof cached.value.content!=='string'||typeof cached.value.title!=='string'))throw new Error('本地章节草稿身份或格式异常，操作已中止；请先备份并核对草稿。');
    const options=chapterSessionOptions(call,novelId,chapterId);
    let controller=sessions.get(key);
    if(!controller){controller=new ChapterSync({key,initial:await options.read(),storage,...options});sessions.set(key,controller);}
    controller.options={...controller.options,...options};
    // Another tab may have written this key after this session last published. Do
    // not replace that tab's draft with this tab's clean in-memory snapshot.
    if(cached&&changed(cached)&&JSON.stringify(cached.value)!==JSON.stringify(controller.state.value))throw new Error('另一窗口有未同步的正文草稿，请在该窗口保存或合并后重试。');
    await controller.prepareRemoval();prepared.push({key,controller});
  }
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix)&&key.includes(':recovery:')&&novelIds.some(id=>key.slice(prefix.length).startsWith(id+':')))throw new Error('所选作品还有本机草稿副本待核对，请到正文章节比较、保存或移除已确认的副本后重试。');}
  return {
    assertClean(){
      const affected=(key:string)=>key.startsWith(prefix)&&novelIds.some(id=>key.slice(prefix.length).startsWith(id+':'));
      for(const [key,controller] of sessions)if(affected(key)&&(controller.dirty||controller.blocked||controller.state.remote))throw new Error('草稿在准备期间发生变化，请保存后重试。');
      // Re-enumerate: a second tab can create a new draft after preparation began.
      for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&affected(key)&&storage.getItem(key))throw new Error('本地草稿在准备期间发生变化，请保存后重试。');}
    },
    async refresh(){for(const {controller} of prepared)await controller.refresh();},
  };
}

/** Keep background chapter sessions protected even after the editor route unmounts. */
export function bindChapterLifecycle(windowTarget:Pick<Window,'addEventListener'|'removeEventListener'>,documentTarget:Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'>,sessions=chapterSessions){
  const connectivity=()=>{for(const controller of sessions.values())controller.connectivity();};
  const checkpoint=()=>{for(const controller of sessions.values()){controller.checkpoint();void controller.flush();}};
  const visibility=()=>{if(documentTarget.visibilityState==='hidden')checkpoint();else connectivity();};
  const storage=(event:StorageEvent)=>{for(const controller of sessions.values())if(!event.key||event.key===controller.options.key||event.key.startsWith(controller.options.key+':recovery:'))controller.inspectLocalCopies();};
  const leave=(event:BeforeUnloadEvent)=>{
    let unsaved=false;
    for(const controller of sessions.values()){controller.checkpoint();unsaved ||= controller.dirty||controller.blocked;}
    if(unsaved){event.preventDefault();event.returnValue='';}
  };
  windowTarget.addEventListener('online',connectivity);windowTarget.addEventListener('offline',connectivity);windowTarget.addEventListener('pagehide',checkpoint);windowTarget.addEventListener('beforeunload',leave);windowTarget.addEventListener('storage',storage);
  documentTarget.addEventListener('visibilitychange',visibility);
  return ()=>{windowTarget.removeEventListener('online',connectivity);windowTarget.removeEventListener('offline',connectivity);windowTarget.removeEventListener('pagehide',checkpoint);windowTarget.removeEventListener('beforeunload',leave);windowTarget.removeEventListener('storage',storage);documentTarget.removeEventListener('visibilitychange',visibility);};
}
if(typeof window!=='undefined'&&typeof document!=='undefined')bindChapterLifecycle(window,document);
