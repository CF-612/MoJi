import { persistDraft, probeDraftStorage } from '../../shared/drafts.js';

export interface Chapter {
  id: string; revision: number; contentHash: string; deleted: boolean;
  title: string; content: string; volumeId: string | null; order: number;
  [key: string]: any;
}
const fields = ['content','summary','title','volumeId','order'] as const;
const fieldValue=(value:Chapter,key:typeof fields[number])=>key==='summary'?(value[key]||''):value[key];
const same = (a: Chapter, b: Chapter) => fields.every(key => fieldValue(a,key) === fieldValue(b,key));
/** Autosave never re-sends untouched placement fields from an older draft. */
export function chapterChanges(value: Chapter, base: Chapter): Partial<Chapter> {
  return Object.fromEntries(fields.filter(key => fieldValue(value,key) !== fieldValue(base,key)).map(key => [key, value[key]]));
}
function edit(base: string, text: string) {
  let start=0,end=base.length,tail=text.length;
  while(start<end&&start<tail&&base[start]===text[start]) start++;
  while(end>start&&tail>start&&base[end-1]===text[tail-1]) {end--;tail--;}
  return {start,end,text:text.slice(start,tail)};
}
/** Conservative three-way merge: overlapping edits always remain for human review. */
export function mergeText(base: string, local: string, remote: string): string | null {
  if(local===remote||remote===base)return local;
  if(local===base)return remote;
  const a=edit(base,local),b=edit(base,remote);
  if(!(a.end<b.start||b.end<a.start))return null;
  let result=base;
  for(const patch of [a,b].sort((x,y)=>y.start-x.start))result=result.slice(0,patch.start)+patch.text+result.slice(patch.end);
  return result;
}
export function mergeChapter(base: Chapter, local: Chapter, remote: Chapter): Chapter | null {
  if(remote.deleted&&!same(base,local))return null;
  const value={...remote};
  for(const key of fields){
    if(key==='content'||key==='summary'){
      const merged=mergeText(base[key]||'',local[key]||'',remote[key]||'');
      if(merged===null)return null;value[key]=merged;
    }else if(local[key]===base[key])value[key]=remote[key] as never;
    else if(remote[key]===base[key]||remote[key]===local[key])value[key]=local[key] as never;
    else return null;
  }
  return value;
}
type Phase='saved'|'waiting'|'saving'|'offline'|'error'|'conflict';
type RecoveryDraft={key:string;chapter:Chapter;baseRevision:number;savedAt:string;raw:string};
type State={base:Chapter;value:Chapter;phase:Phase;error:string;cacheError:string;notice:string;remote:Chapter|null;recoveryDrafts:RecoveryDraft[]};
const validDraft=(draft:any,id:string)=>[draft?.base,draft?.value].every(value=>value&&value.id===id&&Number.isSafeInteger(value.revision)&&value.revision>=0&&typeof value.title==='string'&&typeof value.content==='string');
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'|'removeItem'>&Partial<Pick<globalThis.Storage,'key'|'length'>>;
type Options={key:string;initial:Chapter;storage:Storage;read:()=>Promise<Chapter>;write:(value:Chapter,base:Chapter,requestId:string)=>Promise<Partial<Chapter>>;onSaved:()=>void;delay?:number;online?:()=>boolean};

/** One serialized save queue per chapter. It survives tab switches and keeps drafts durable. */
export class ChapterSync {
  state: State;
  private listeners=new Set<()=>void>();
  private timer:ReturnType<typeof setTimeout>|undefined;
  private saving=false;
  private reading=false;
  private composing=false;
  private touched=0;
  private pendingRemote:Chapter|null=null;
  private pending:{value:Chapter;base:Chapter;requestId:string}|null=null;
  private retries=0;
  private cacheRaw:string|null=null;
  private cacheInvalid=false;
  private cacheCopyKey:string;
  private cacheCopyRaw:string|null=null;
  private replacing=false;
  private replacement:{targetRevision:number;base:Chapter;requestId:string}|null=null;
  options:Options;
  constructor(options:Options){
    this.options=options;
    this.cacheCopyKey=options.key+':recovery:'+crypto.randomUUID();
    let restored:any=null,cacheMessage='';
    try{this.cacheRaw=options.storage.getItem(options.key);if(this.cacheRaw)restored=JSON.parse(this.cacheRaw);}
    catch{cacheMessage='本地草稿读取失败，原缓存未删除；请保持页面打开并核对。';}
    this.cacheInvalid=!!this.cacheRaw&&!validDraft(restored,options.initial.id);
    if(this.cacheInvalid)cacheMessage='本地草稿格式或章节身份异常，原缓存未删除；当前显示服务器正文，请保持页面打开以便核对。';
    if(!validDraft(restored,options.initial.id))restored={base:options.initial,value:options.initial};
    const review=!!restored.recovery&&!same(restored.base,restored.value);
    this.state={base:restored.base,value:restored.value,phase:review?'conflict':same(restored.base,restored.value)?'saved':'waiting',error:'',cacheError:cacheMessage||(probeDraftStorage(options.storage)?'':'本地草稿缓存不可用，请保持此页面打开并保存；关闭或重载可能丢失未同步内容。'),notice:review?'已找回待核对的草稿，请比较后合并；不会自动覆盖正文。':'',remote:review?options.initial:null,recoveryDrafts:[]};
    this.state.recoveryDrafts=this.readRecoveryDrafts();
  }
  get dirty(){return !same(this.state.base,this.state.value);}
  get blocked(){return this.replacing||!!this.replacement;}
  private get online(){return this.options.online?.()!==false;}
  /** Synchronous durability first; pagehide does not guarantee a network request finishes. */
  checkpoint=()=>{this.publish({});return !this.state.cacheError;};
  connectivity=()=>{
    if(!this.online&&this.dirty&&!this.state.remote&&!this.saving)this.publish({phase:'offline',error:''});
    if(this.online){void this.flush();void this.refresh();}
  };
  snapshot=()=>this.state;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private publish(patch:Partial<State>){
    this.state={...this.state,...patch};
    try{this.persistOwnedDraft();this.state.cacheError='';}
    catch(error:any){this.state.cacheError=error?.message||'本地草稿缓存失败，请保持此页面打开并重试保存。';}
    this.state.recoveryDrafts=this.readRecoveryDrafts();
    this.listeners.forEach(fn=>fn());
  }
  private readRecoveryDrafts():RecoveryDraft[]{
    const storage=this.options.storage,keys=new Set<string>(),items:RecoveryDraft[]=[];
    try{
      for(let i=0;i<(storage.length||0);i++){const key=storage.key?.(i);if(key?.startsWith(this.options.key+':recovery:'))keys.add(key);}
      // A primary draft written by another window is also reviewable, not erased.
      const primary=storage.getItem(this.options.key);if(primary&&primary!==this.cacheRaw)keys.add(this.options.key);
      for(const key of keys){const raw=storage.getItem(key);if(!raw)continue;let draft:any;try{draft=JSON.parse(raw);}catch{continue;}
        if(validDraft(draft,this.state.base.id)&&!same(draft.value,this.state.value))items.push({key,chapter:draft.value,baseRevision:draft.base.revision,savedAt:draft.savedAt||'',raw});
      }
      return items;
    }catch{return this.state?.recoveryDrafts||[];}
  }
  /** Storage events only inspect; writing here would cause cross-tab event loops. */
  inspectLocalCopies=()=>{
    this.state={...this.state,recoveryDrafts:this.readRecoveryDrafts()};
    this.listeners.forEach(fn=>fn());
  };
  /** Only remove the exact copy the user reviewed; another tab may have updated it. */
  removeRecovery=(key:string)=>{
    const copy=this.state.recoveryDrafts.find(item=>item.key===key);
    if(!copy||this.options.storage.getItem(key)!==copy.raw)throw new Error('草稿副本已变化，请重新比较后再处理。');
    this.options.storage.removeItem(key);
    if(key===this.cacheCopyKey)this.cacheCopyRaw=null;
    this.publish({});
  };
  private persistOwnedDraft(){
    const storage=this.options.storage;
    const data={base:this.state.base,value:this.state.value,...(this.replacement||this.state.remote?{recovery:{kind:this.replacement?'history-restore':'conflict'}}:{})};
    let current:string|null;
    try{current=storage.getItem(this.options.key);}catch{throw new Error('本地草稿缓存失败，请保持此页面打开并重试保存。');}
    if(this.cacheInvalid&&current===null){this.cacheInvalid=false;this.cacheRaw=null;}
    const foreign=current!==null&&current!==this.cacheRaw;
    // Each live writer keeps its own durable copy before touching the shared key.
    // Two tabs can interleave getItem/setItem; compare-before-write alone is not CAS.
    if(this.dirty){
        const copy=JSON.stringify({...data,savedAt:new Date().toISOString()});
        try{storage.setItem(this.cacheCopyKey,copy);this.cacheCopyRaw=copy;}
        catch{throw new Error('本地草稿缓存失败，未覆盖另一份草稿；请保持此页面打开并重试保存。');}
    }else{
      // Once confirmed by the server, identical safety copies are redundant. Never
      // remove a different tab's differing contents, and compare raw bytes again.
      for(let i=(storage.length||0)-1;i>=0;i--){const key=storage.key?.(i);if(!key?.startsWith(this.options.key+':recovery:'))continue;
        const raw=storage.getItem(key);let draft:any;try{draft=JSON.parse(raw||'null');}catch{continue;}
        if(validDraft(draft,this.state.base.id)&&same(draft.value,this.state.base)&&storage.getItem(key)===raw)storage.removeItem(key);
      }
      if(this.cacheCopyRaw&&storage.getItem(this.cacheCopyKey)===this.cacheCopyRaw){storage.removeItem(this.cacheCopyKey);this.cacheCopyRaw=null;}
    }
    if(this.cacheInvalid||foreign){
      throw new Error(this.cacheInvalid?'本地草稿格式或章节身份异常，原缓存已保留；当前修改另存本机副本，请核对。':'另一窗口的草稿未被覆盖。未同步修改已另存本机副本，请先比较、保存或合并。');
    }
    try{
      // Chapter equality normalizes optional summary; clean receipts must not leave
      // an incidental undefined/empty-string draft behind.
      if(this.dirty){persistDraft(storage,this.options.key,data);this.cacheRaw=JSON.stringify(data);}
      else{storage.removeItem(this.options.key);this.cacheRaw=null;}
    }catch{throw new Error('本地草稿缓存失败，请保持此页面打开并重试保存。');}
  }
  private schedule(delay=this.options.delay??1500){
    clearTimeout(this.timer);
    if(!this.composing&&!this.blocked&&this.state.phase!=='conflict')this.timer=setTimeout(()=>void this.flush(),delay);
  }
  change=(next:Chapter|((old:Chapter)=>Chapter))=>{
    this.touched=Date.now();this.retries=0;
    this.publish({value:typeof next==='function'?next(this.state.value):next,notice:'',phase:this.state.remote?'conflict':this.saving||this.replacing?'saving':!this.online?'offline':'waiting'});
    this.schedule();
  };
  composition=(active:boolean)=>{this.composing=active;if(active)clearTimeout(this.timer);else this.schedule();};
  accept=(value:Chapter)=>{
    if(this.saving||this.replacing)return;
    if(value.id!==this.state.base.id)throw new Error('章节身份不匹配，当前草稿未替换。');
    this.pending=null;this.pendingRemote=null;this.replacement=null;this.retries=0;
    this.publish({base:value,value,remote:null,phase:'saved',error:'',notice:''});
  };
  rebase=(remote:Chapter)=>{
    if(this.saving||this.replacing||remote.deleted)return;
    if(remote.id!==this.state.base.id)throw new Error('章节身份不匹配，当前草稿未变基。');
    this.pending=null;this.pendingRemote=null;this.replacement=null;
    const value={...remote,...Object.fromEntries(['content','summary','title'].map(key=>[key,this.state.value[key]]))};
    this.publish({base:remote,value,remote:null,phase:'waiting',error:'',notice:''});this.schedule();
  };
  /** Explicit discard still must not erase keystrokes entered after its confirmation. */
  reloadLatest=async()=>{
    if(this.saving||this.replacing)throw new Error('正在保存或恢复，请稍后读取。');
    const before=this.state.value,baseAtStart=this.state.base,remote=await this.options.read();
    if(remote.id!==before.id)throw new Error('读取到的章节身份不匹配。');
    if(this.saving||this.replacing||this.state.base!==baseAtStart)throw new Error('读取期间正文已保存或变更，请重新核对最新正文。');
    this.pending=null;this.pendingRemote=null;this.replacement=null;
    if(!same(before,this.state.value))this.publish({remote,phase:'conflict',error:'',notice:'读取期间的新输入已保留，请核对双方内容。'});
    else this.accept(remote);
  };
  private reconcile(remote:Chapter){
    if(remote.id!==this.state.base.id)throw new Error('读取到的章节身份不匹配，已保留当前草稿。');
    // Once a conflict is shown, only an explicit merge/discard may change its base.
    if(this.state.remote){this.publish({remote,phase:'conflict',error:''});return;}
    // Backup restore may rewind revisions. Equal revision with a new hash is not a no-op.
    if(remote.revision===this.state.base.revision&&remote.contentHash===this.state.base.contentHash&&same(remote,this.state.base)&&remote.deleted===this.state.base.deleted)return;
    // A write may fail after the next IME composition has already started.
    // Keep that remote version pending until the final composed input is present.
    if(this.composing){this.pendingRemote=remote;this.publish({phase:'waiting',error:''});return;}
    const value=mergeChapter(this.state.base,this.state.value,remote);
    if(!value){this.publish({remote,phase:'conflict',error:'',notice:''});return;}
    const dirty=!same(value,remote);
    this.publish({base:remote,value,remote:null,phase:dirty?'waiting':'saved',error:'',notice:dirty?'已合并双方不同位置的修改':'已同步最新正文'});
    if(dirty)this.schedule();
  }
  refresh=async()=>{
    if(this.reading||this.saving||this.pending||this.blocked)return;
    this.reading=true;
    const baseAtStart=this.state.base;
    try{
      const remote=await this.options.read();
      if(this.saving||this.pending||this.blocked||this.state.base!==baseAtStart)return;
      if(this.composing||Date.now()-this.touched<(this.options.delay??1500)){this.pendingRemote=remote;this.schedule();}
      else this.reconcile(remote);
    }catch{/* The directory reports read failures; retain the complete local draft. */}
    finally{this.reading=false;}
  };
  private flight:Promise<void>|null=null;
  flush=():Promise<void>=>{
    if(this.flight)return this.flight;
    this.flight=this.performFlush().finally(()=>{this.flight=null;});
    return this.flight;
  };
  /** A destructive UI action must wait for the submitted snapshot and later typing. */
  prepareRemoval=async()=>{
    for(let attempt=0;attempt<4;attempt++){
      if(this.blocked)throw new Error('历史恢复结果尚未确认，请重试同一历史版本或读取最新正文核对。');
      if(this.composing)throw new Error('请先完成正在输入的文字。');
      await this.flush();
      if(this.state.remote)throw new Error('正文存在未解决的版本冲突，草稿已保留。请先合并。');
      if(this.state.phase==='offline')throw new Error('当前离线，无法先保存正文；恢复已中止，请联网后重试。');
      if(this.state.phase==='error')throw new Error(this.state.error||'正文尚未保存，草稿已保留。');
      if(!this.dirty&&!this.pending){
        if(!this.checkpoint())throw new Error('本地草稿缓存无法清理，恢复可能重新载入旧草稿；操作已中止，请重试。');
        return this.state.base;
      }
    }
    throw new Error('正文尚未保存完成，请稍后重试。');
  };
  private restoreFlight:Promise<Chapter>|null=null;
  private restoreTarget:number|null=null;
  restoreVersion=(targetRevision:number,restore:(base:Chapter,requestId:string)=>Promise<unknown>):Promise<Chapter>=>{
    if(this.restoreFlight)return this.restoreTarget===targetRevision?this.restoreFlight:Promise.reject(new Error('正在恢复其他版本，请稍候。'));
    this.restoreTarget=targetRevision;
    this.restoreFlight=this.performRestore(targetRevision,restore).finally(()=>{this.restoreFlight=null;this.restoreTarget=null;});
    return this.restoreFlight;
  };
  /** Save the current draft into history before replacing it. Never accept over later typing. */
  private performRestore=async(targetRevision:number,restore:(base:Chapter,requestId:string)=>Promise<unknown>)=>{
    if(this.replacing)throw new Error('正在恢复历史版本，请稍候。');
    if(this.replacement&&this.replacement.targetRevision!==targetRevision)throw new Error('上次恢复结果尚未确认，请先重试同一历史版本或读取最新正文核对。');
    const before=this.replacement?.base??await this.prepareRemoval();
    const request=this.replacement??{targetRevision,base:before,requestId:crypto.randomUUID()};
    this.replacement=request;this.replacing=true;clearTimeout(this.timer);
    this.publish({phase:'saving',error:''});
    try{
      const receipt=await restore(request.base,request.requestId) as Partial<Chapter>|undefined;
      const remote=await this.options.read();
      if(remote.id!==before.id||receipt?.id&&receipt.id!==before.id)throw new Error('恢复后的章节身份不匹配。');
      if(receipt?.revision&&remote.revision<receipt.revision)throw new Error('恢复后的正文读取版本过旧，请重新核对。');
      this.replacement=null;this.pending=null;this.pendingRemote=null;
      if(!same(this.state.value,before)){
        this.publish({remote,phase:'conflict',error:'',notice:'恢复期间的新输入与恢复版本均已保留，请比较后合并。'});
      }else this.publish({base:remote,value:remote,remote:null,phase:'saved',error:'',notice:'已恢复历史版本；恢复前正文保留在历史中'});
      this.options.onSaved();
      return remote;
    }catch(error:any){
      // Keep the same request identity on retry after a lost response. No autosave may
      // silently merge into an unconfirmed historical replacement.
      if(error?.code==='CONFLICT')this.replacement=null;
      this.publish({phase:'error',error:'历史恢复未确认，当前内容仍保留。请重试同一历史版本，或读取最新正文核对。'});
      throw error;
    }finally{this.replacing=false;}
  };
  private performFlush=async()=>{
    clearTimeout(this.timer);
    if(this.saving||this.composing||this.state.remote||this.blocked)return;
    if(this.pendingRemote){const remote=this.pendingRemote;this.pendingRemote=null;this.reconcile(remote);if(this.state.remote)return;}
    if(!this.dirty&&!this.pending){this.publish({phase:'saved'});return;}
    if(this.state.base.deleted||!this.state.value.title.trim())return;
    if(!this.online){this.publish({phase:'offline',error:''});return;}
    this.saving=true;
    const request=this.pending??{value:{...this.state.value},base:this.state.base,requestId:crypto.randomUUID()};
    this.pending=request;this.publish({phase:'saving',error:''});
    try{
      const result=await this.options.write(request.value,request.base,request.requestId);
      const base={...request.value,...result} as Chapter;
      if(base.id!==request.base.id||!Number.isSafeInteger(base.revision)||base.revision<request.base.revision)throw new Error('保存回执不匹配');
      // Preserve keystrokes entered while the submitted snapshot was in flight.
      const value={...base,...Object.fromEntries(fields.map(key=>[key,this.state.value[key]]))};
      this.pending=null;this.retries=0;
      this.publish({base,value,phase:same(base,value)?'saved':'waiting',error:'',notice:''});
      this.options.onSaved();
    }catch(error:any){
      if(error?.code==='CONFLICT'||/版本已变化/.test(error?.message||'')){
        this.pending=null;
        try{this.reconcile(await this.options.read());}
        catch{this.publish({phase:'error',error:'无法读取最新正文，草稿已保留。请重试。'});}
      }else{this.publish({phase:this.online?'error':'offline',error:this.online?'自动保存失败，草稿仍在当前页面。请重试。':''});this.retries++;}
    }finally{
      this.saving=false;
      if(this.state.phase==='waiting')this.schedule();
      else if(this.state.phase==='error'&&this.retries>0&&this.retries<=2)this.schedule(2000*this.retries);
    }
  };
  dispose(){clearTimeout(this.timer);this.listeners.clear();}
}
