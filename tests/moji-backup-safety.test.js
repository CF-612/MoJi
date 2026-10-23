import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../src/application/store.js';
import {createTransfer} from '../integrations/chatgpt-workbench/server/transfer-service.mjs';
import {prepareTransferDrafts,readFullChapter} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/chapterSessions.ts';
import {draftKey,persistDraft} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/drafts.js';
const cache=()=>{const map=new Map();return{get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const actor={kind:'human',sessionId:'p0-safety'};
async function setup(t){
 const root=await mkdtemp(join(tmpdir(),'moji-p0-backup-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const store=new Store(root),transfer=createTransfer(store),n=await store.dispatch('novel.create',{title:'临时安全测试作品'},actor);
 const call=(action,args={})=>store.dispatch(action,args,actor),chapter=await call('chapter.create',{novelId:n.id,title:'第一章',content:'导出前正文',summary:'导出前梗概'}),storage=cache(),sessions=new Map();
 t.after(()=>{for(const sync of sessions.values())sync.dispose();});
 const prepare=()=>prepareTransferDrafts({scope:'test',novelIds:[n.id],call,storage,sessions});
 const key=id=>draftKey('test',`${n.id}:chapter:${id}`),get=id=>readFullChapter(call,n.id,id);
 return{root,store,transfer,n,call,chapter,storage,sessions,prepare,key,get};
}
test('backup barrier hydrates unopened chapter drafts and exported whole work contains confirmed prose and linked data',async t=>{
 const s=await setup(t),chapter2=await s.call('chapter.create',{novelId:s.n.id,title:'第二章',content:'第二章原文'}),base=await s.get(chapter2.id);
 persistDraft(s.storage,s.key(chapter2.id),{base,value:{...base,content:'第二章离线未保存草稿'}});
 const person=await s.call('graph.create',{novelId:s.n.id,type:'character_card',name:'角色甲',content:'人物内容',sources:[{chapterId:s.chapter.id,revision:1}]});
 const protection=await s.prepare();protection.assertClean();
 const exported=await s.transfer.export({selection:{kind:'works',novelIds:[s.n.id]}}),file={name:exported.filename,text:exported.content};
 const packet=JSON.parse(exported.content).payload.projects[0];assert.equal(packet.chapters[chapter2.id].content,'第二章离线未保存草稿');assert.equal(packet.nodes[person.id].sources[0].chapterId,s.chapter.id);assert.equal(s.storage.getItem(s.key(chapter2.id)),null);
 const targetRoot=await mkdtemp(join(tmpdir(),'moji-p0-target-'));t.after(()=>rm(targetRoot,{recursive:true,force:true}));const target=new Store(targetRoot),to=createTransfer(target),options={mode:'restore'};
 const preview=await to.preview({file,options});assert.equal(preview.valid,true);const result=await to.import({file,options,proof:preview.proof,requestId:crypto.randomUUID()},actor);
 assert.equal(result.novelIds[0],s.n.id);assert.deepEqual((await target.load()).novels[s.n.id],(await s.store.load()).novels[s.n.id]);
});
test('replace-restore snapshots newly saved draft, refreshes clean sessions and preserves summary in restore history',async t=>{
 const s=await setup(t),exported=await s.transfer.export({selection:{kind:'works',novelIds:[s.n.id]}}),file={name:exported.filename,text:exported.content};
 const base=await s.get(s.chapter.id);persistDraft(s.storage,s.key(s.chapter.id),{base,value:{...base,content:'恢复前最后的新稿',summary:'恢复前最新梗概'}});
 const protection=await s.prepare();protection.assertClean();const options={mode:'restore',replaceExisting:true,selection:{kind:'works',novelIds:[s.n.id]}};
 const preview=await s.transfer.preview({file,options});assert.equal(preview.valid,true);const result=await s.transfer.import({file,options,proof:preview.proof,requestId:crypto.randomUUID()},actor);
 const backup=JSON.parse(await readFile(join(result.backupDir,'workspace.json'),'utf8'));
 assert.equal(backup.payload.state.novels[s.n.id].chapters[s.chapter.id].content,'恢复前最后的新稿');
 await protection.refresh();await s.sessions.get(s.key(s.chapter.id)).flush();
 const restored=await s.get(s.chapter.id);assert.equal(restored.content,'导出前正文');assert.equal(restored.summary,'导出前梗概');assert.equal(s.sessions.get(s.key(s.chapter.id)).state.value.content,'导出前正文');
 const history=await s.call('chapter.history',{novelId:s.n.id,chapterId:s.chapter.id,includeContent:true});assert.equal(history.at(-1).summary,'导出前梗概');assert.equal(s.storage.getItem(s.key(s.chapter.id)),null);
});
test('an unopened conflicting draft blocks backup and never overwrites the other device',async t=>{
 const s=await setup(t),base=await s.get(s.chapter.id);persistDraft(s.storage,s.key(s.chapter.id),{base,value:{...base,content:'本设备稿'}});
 await s.call('chapter.update',{novelId:s.n.id,chapterId:s.chapter.id,expectedRevision:1,content:'另一设备稿'});
 await assert.rejects(s.prepare,/版本冲突/);assert.equal((await s.get(s.chapter.id)).content,'另一设备稿');assert.equal(JSON.parse(s.storage.getItem(s.key(s.chapter.id))).value.content,'本设备稿');
});
test('backup protection rejects other dirty entity drafts, storage failure, and drafts added after prepare',async t=>{
 const s=await setup(t),key=draftKey('test',`${s.n.id}:node:one`);persistDraft(s.storage,key,{base:{name:'old'},value:{name:'unsaved'}});await assert.rejects(s.prepare,/资料或规划草稿/);s.storage.removeItem(key);
 const protection=await s.prepare();const base=await s.get(s.chapter.id);persistDraft(s.storage,s.key(s.chapter.id),{base,value:{...base,content:'准备后另一个窗口写入'}});assert.throws(()=>protection.assertClean(),/草稿.*变化/);
 await assert.rejects(()=>prepareTransferDrafts({scope:'test',novelIds:[s.n.id],call:s.call,storage:{get length(){throw new Error('storage denied');}},sessions:new Map()}),/storage denied/);
});
test('paginated reads reject identity or hash drift even when the revision number matches',async()=>{
 let i=0;await assert.rejects(()=>readFullChapter(async()=>++i===1?{id:'x',revision:1,contentHash:'first',content:'a',nextStart:1}:{id:'x',revision:1,contentHash:'different',content:'b',nextStart:null},'book','x'),/读取期间正文发生变化/);
});

test('pagehide, backgrounding and online recovery protect all sessions, including an unmounted chapter',async t=>{
 const {ChapterSync}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/sync.ts');
 const {bindChapterLifecycle}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/chapterSessions.ts');
 const s=await setup(t),base=await s.get(s.chapter.id);let online=false;
 const hidden=new ChapterSync({key:s.key(s.chapter.id),initial:base,storage:s.storage,read:()=>s.get(s.chapter.id),write:(value,before,requestId)=>s.call('chapter.update',{novelId:s.n.id,chapterId:base.id,expectedRevision:before.revision,expectedHash:before.contentHash,content:value.content,requestId}),online:()=>online,onSaved:()=>{},delay:60000});s.sessions.set(hidden.options.key,hidden);
 const win=new EventTarget(),doc=new EventTarget();doc.visibilityState='hidden';const unbind=bindChapterLifecycle(win,doc,s.sessions);t.after(unbind);
 hidden.change(v=>({...v,content:'已切走章节的离线稿'}));doc.dispatchEvent(new Event('visibilitychange'));win.dispatchEvent(new Event('pagehide'));await hidden.flush();assert.equal(hidden.state.phase,'offline');assert.equal(JSON.parse(s.storage.getItem(hidden.options.key)).value.content,'已切走章节的离线稿');
 const leave=new Event('beforeunload',{cancelable:true});win.dispatchEvent(leave);assert.equal(leave.defaultPrevented,true);
 online=true;win.dispatchEvent(new Event('online'));await hidden.flush();assert.equal((await s.get(base.id)).content,'已切走章节的离线稿');assert.equal(hidden.state.phase,'saved');
 const cleanLeave=new Event('beforeunload',{cancelable:true});win.dispatchEvent(cleanLeave);assert.equal(cleanLeave.defaultPrevented,false);
});

test('real history restore keeps the just-saved dirty draft in source history and uses revision plus hash CAS',async t=>{
 const {ChapterSync,chapterChanges}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/sync.ts');
 const s=await setup(t),base=await s.get(s.chapter.id),controller=new ChapterSync({key:s.key(base.id),initial:base,storage:s.storage,read:()=>s.get(base.id),write:(value,before,requestId)=>s.call('chapter.update',{novelId:s.n.id,chapterId:base.id,expectedRevision:before.revision,expectedHash:before.contentHash,requestId,...chapterChanges(value,before)}),onSaved:()=>{},delay:60000});s.sessions.set(controller.options.key,controller);
 controller.change(v=>({...v,content:'恢复前未同步的真实服务端测试稿',summary:'待保护梗概'}));
 await controller.restoreVersion(1,(before,requestId)=>s.call('chapter.restore',{novelId:s.n.id,chapterId:base.id,expectedRevision:before.revision,expectedHash:before.contentHash,targetRevision:1,requestId}));
 assert.equal(controller.state.phase,'saved');assert.equal(controller.state.value.content,'导出前正文');
 const history=await s.call('chapter.history',{novelId:s.n.id,chapterId:base.id,includeContent:true});assert.equal(history[1].content,'恢复前未同步的真实服务端测试稿');assert.equal(history[1].summary,'待保护梗概');assert.equal(history.at(-1).summary,'导出前梗概');
 const before=await s.get(base.id);await assert.rejects(()=>s.call('chapter.restore',{novelId:s.n.id,chapterId:base.id,expectedRevision:before.revision,expectedHash:'wrong',targetRevision:1,requestId:crypto.randomUUID()}),/哈希已变化/);assert.equal((await s.get(base.id)).revision,before.revision);
});

test('ordinary active dirty chapters with safety copies still save through the backup barrier',async t=>{
 const {ChapterSync}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/sync.ts');const s=await setup(t),base=await s.get(s.chapter.id);
 const controller=new ChapterSync({key:s.key(base.id),initial:base,storage:s.storage,read:()=>s.get(base.id),write:async()=>{},onSaved:()=>{},delay:60000});s.sessions.set(controller.options.key,controller);
 controller.change(v=>({...v,content:'当前页面的稿'}));assert.equal(s.storage.length,2);
 const protection=await s.prepare();protection.assertClean();assert.equal((await s.get(base.id)).content,'当前页面的稿');assert.equal(s.storage.length,0);
});
