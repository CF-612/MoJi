import test from 'node:test';
import assert from 'node:assert/strict';
import {ChapterSync,mergeText} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/sync.ts';
import {groupHistory} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/history.ts';
const initial={id:'one',revision:1,contentHash:'h1',deleted:false,title:'第一章',content:'甲段。\n\n乙段。',volumeId:null,order:0};
const cache=()=>{const map=new Map();return{get length(){return map.size;},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
function setup(t,custom={}){
 let server={...initial},writes=[];
 const sync=new ChapterSync({key:'chapter',initial:server,storage:cache(),read:async()=>server,write:async(value,base,id)=>{writes.push({value,base,id});if(base.revision!==server.revision)throw Object.assign(new Error('conflict'),{code:'CONFLICT'});server={...value,revision:server.revision+1,contentHash:'h'+(server.revision+1)};return server;},onSaved:()=>{},delay:60000,...custom});
 t.after(()=>sync.dispose());return{sync,writes,get:()=>server,set:v=>server=v};
}
test('clean editor follows remote updates without a confirmation',async t=>{
 const s=setup(t);s.set({...initial,content:'AI 新正文',revision:2});await s.sync.refresh();assert.equal(s.sync.state.value.content,'AI 新正文');assert.equal(s.sync.dirty,false);
});
test('removal waits for the in-flight receipt and flushes keystrokes added after that snapshot',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),submitted=[];
 const {sync}=setup(t,{write:async(value,base)=>{submitted.push({...value});if(submitted.length===1)await gate;return {...value,revision:base.revision+1};}});
 sync.change(v=>({...v,content:'先输入的正文'}));const saving=sync.flush();
 sync.change(v=>({...v,content:'先输入的正文，继续输入的正文'}));
 let completed=false;const removal=sync.prepareRemoval().then(value=>{completed=true;return value;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(completed,false);
 release();await saving;const snapshot=await removal;
 assert.equal(snapshot.content,'先输入的正文，继续输入的正文');assert.equal(snapshot.revision,3);
 assert.equal(submitted.length,2);assert.equal(sync.dirty,false);
});
test('failed saves and unresolved conflicts prevent removal while retaining the local prose',async t=>{
 const failed=setup(t,{write:async()=>{throw new Error('disk failure');}});
 failed.sync.change(v=>({...v,content:'仍未保存的正文'}));
 await assert.rejects(()=>failed.sync.prepareRemoval(),/草稿/);
 assert.equal(failed.sync.state.value.content,'仍未保存的正文');assert.equal(failed.sync.dirty,true);
 const conflict=setup(t);conflict.sync.change(v=>({...v,content:'作者版本'}));conflict.set({...initial,revision:2,content:'AI 版本'});
 await assert.rejects(()=>conflict.sync.prepareRemoval(),/版本冲突/);
 assert.equal(conflict.sync.state.value.content,'作者版本');assert.equal(conflict.sync.state.remote.content,'AI 版本');
});
test('safe disjoint edits merge; overlapping edits and competing insertions stop',()=>{
 assert.equal(mergeText('甲段。\n\n乙段。','甲段改。\n\n乙段。','甲段。\n\n乙段改。'),'甲段改。\n\n乙段改。');
 assert.equal(mergeText('甲','作者甲','AI甲'),null);
 assert.equal(mergeText('甲段','乙段','丙段'),null);
});
test('saving never replaces keystrokes entered during an in-flight request',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve);
 const {sync}=setup(t,{write:async value=>{await gate;return {...value,revision:2};}});
 sync.change(v=>({...v,content:'第一批输入'}));const saving=sync.flush();sync.change(v=>({...v,content:'第一批输入，继续输入'}));release();await saving;
 assert.equal(sync.state.base.content,'第一批输入');assert.equal(sync.state.value.content,'第一批输入，继续输入');assert.equal(sync.dirty,true);
});
test('version conflict merges different locations and saves against the new revision',async t=>{
 const s=setup(t);s.sync.change(v=>({...v,content:'甲段改。\n\n乙段。'}));s.set({...initial,revision:2,content:'甲段。\n\n乙段改。'});
 await s.sync.flush();assert.equal(s.sync.state.phase,'waiting');await s.sync.flush();assert.equal(s.get().content,'甲段改。\n\n乙段改。');assert.equal(s.get().revision,3);
});
test('true conflicts preserve both sides until explicitly merged',async t=>{
 const s=setup(t);s.sync.change(v=>({...v,content:'作者版本'}));s.set({...initial,revision:2,content:'AI 版本'});await s.sync.flush();
 assert.equal(s.sync.state.phase,'conflict');assert.equal(s.sync.state.value.content,'作者版本');assert.equal(s.sync.state.remote.content,'AI 版本');
 await s.sync.flush();assert.equal(s.get().content,'AI 版本');s.sync.change(v=>({...v,content:'双方合并'}));s.sync.rebase(s.sync.state.remote);await s.sync.flush();assert.equal(s.get().content,'双方合并');
});
test('composition is never submitted halfway, and no-op edits do not create versions',async t=>{
 const {sync,writes}=setup(t);sync.composition(true);sync.change(v=>({...v,content:'中文输入中'}));await sync.flush();assert.equal(writes.length,0);
 sync.composition(false);await sync.flush();assert.equal(writes.length,1);sync.change(v=>({...v}));await sync.flush();assert.equal(writes.length,1);
});

test('an in-flight conflict waits for final IME input before merging and saving',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),writes=[];
 const remote={...initial,revision:2,content:'甲段。\n\n乙段新。'};
 const {sync}=setup(t,{read:async()=>remote,write:async(value,base)=>{writes.push(value.content);if(base.revision===1){await gate;throw Object.assign(new Error('conflict'),{code:'CONFLICT'});}return {...value,revision:3};}});
 sync.change(v=>({...v,content:'甲段改。\n\n乙段。'}));const saving=sync.flush();
 sync.composition(true);sync.change(v=>({...v,content:'甲段改写zhong。\n\n乙段。'}));release();await saving;
 assert.equal(sync.state.base.revision,1);assert.equal(sync.state.value.content,'甲段改写zhong。\n\n乙段。');assert.equal(writes.length,1);
 sync.change(v=>({...v,content:'甲段改写中文。\n\n乙段。'}));sync.composition(false);await sync.flush();
 assert.equal(sync.state.value.content,'甲段改写中文。\n\n乙段新。');assert.equal(sync.state.base.revision,3);
 assert.deepEqual(writes,['甲段改。\n\n乙段。','甲段改写中文。\n\n乙段新。']);
});

test('an overlapping remote edit is exposed only after composition, preserving the final author text',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),remote={...initial,revision:2,content:'AI 的走向'};
 const {sync}=setup(t,{read:async()=>remote,write:async()=>{await gate;throw Object.assign(new Error('conflict'),{code:'CONFLICT'});}});
 sync.change(v=>({...v,content:'作者的走向'}));const saving=sync.flush();sync.composition(true);sync.change(v=>({...v,content:'作者的zhong文'}));release();await saving;
 assert.equal(sync.state.remote,null);assert.equal(sync.state.base.revision,1);
 sync.change(v=>({...v,content:'作者的中文定稿'}));sync.composition(false);await sync.flush();
 assert.equal(sync.state.phase,'conflict');assert.equal(sync.state.value.content,'作者的中文定稿');assert.equal(sync.state.remote.content,'AI 的走向');
});
test('failed writes retain the draft and retry the same request identity',async t=>{
 let fail=true;const ids=[];const {sync}=setup(t,{write:async(value,base,id)=>{ids.push(id);if(fail)throw new Error('offline');return {...value,revision:2};}});
 sync.change(v=>({...v,content:'离线草稿'}));await sync.flush();assert.equal(sync.state.phase,'error');assert.equal(sync.state.value.content,'离线草稿');assert.ok(sync.options.storage.getItem('chapter'));
 fail=false;await sync.flush();assert.equal(ids[0],ids[1]);assert.equal(sync.state.phase,'saved');assert.equal(sync.options.storage.getItem('chapter'),null);
});
test('remote deletion never destroys an unsaved local draft',async t=>{
 const s=setup(t);s.sync.change(v=>({...v,content:'还在写'}));s.set({...initial,revision:2,deleted:true});await s.sync.flush();assert.equal(s.sync.state.phase,'conflict');assert.equal(s.sync.state.value.content,'还在写');
});
test('history folds nearby human autosaves, keeping every source revision',()=>{
 const versions=[1,2,3].map(revision=>({revision,timestamp:`2026-09-29T10:00:0${revision}Z`,reason:'作者自动保存',actor:{kind:'human',sessionId:'one'}}));
 versions.push({revision:4,timestamp:'2026-09-29T10:00:04Z',actor:{kind:'agent'}});
 const groups=groupHistory(versions);assert.deepEqual(groups.map(g=>g.map(v=>v.revision)),[[4],[3,2,1]]);
});

test('history restore saves dirty prose first, uses that receipt, and keeps the draft in history',async t=>{
 const s=setup(t),history=[];
 s.sync.change(v=>({...v,content:'恢复前未保存的重要正文'}));
 await s.sync.restoreVersion(1,async(base,id)=>{history.push({...s.get()});assert.equal(base.revision,2);assert.equal(base.content,'恢复前未保存的重要正文');assert.ok(id);s.set({...initial,revision:3});});
 assert.equal(history[0].content,'恢复前未保存的重要正文');assert.equal(s.sync.state.value.content,initial.content);assert.equal(s.sync.state.phase,'saved');
});
test('history restore stops before mutating when offline, failed save, conflict, or IME composition',async t=>{
 for(const mode of ['offline','failure','conflict','ime']){
  const s=setup(t,mode==='offline'?{online:()=>false}:mode==='failure'?{write:async()=>{throw new Error('failed');}}:{});
  s.sync.change(v=>({...v,content:'不能丢失'}));if(mode==='conflict')s.set({...initial,revision:2,content:'远端也不能丢失'});if(mode==='ime')s.sync.composition(true);
  let called=false;await assert.rejects(()=>s.sync.restoreVersion(1,async()=>{called=true;}));
  assert.equal(called,false);assert.equal(s.sync.state.value.content,'不能丢失');assert.ok(s.sync.options.storage.getItem('chapter'));
 }
});
test('typing during a history restore is retained as an explicit conflict, never accepted over',async t=>{
 const s=setup(t);let release;const gate=new Promise(resolve=>release=resolve);
 const restored=s.sync.restoreVersion(1,async()=>{await gate;s.set({...initial,revision:2,content:'历史正文'});});
 await new Promise(resolve=>setImmediate(resolve));s.sync.change(v=>({...v,content:'恢复请求期间的新输入'}));release();await restored;
 assert.equal(s.sync.state.value.content,'恢复请求期间的新输入');assert.equal(s.sync.state.remote.content,'历史正文');assert.equal(s.sync.state.phase,'conflict');await s.sync.flush();assert.equal(s.writes.length,0);
});
test('lost history restore response retries the original request and cannot silently autosave over it',async t=>{
 const s=setup(t),ids=[];let fail=true;
 const restore=async(base,id)=>{ids.push(id);if(fail){s.set({...initial,revision:2,content:'历史正文'});fail=false;throw new Error('response lost');}};
 await assert.rejects(()=>s.sync.restoreVersion(1,restore));s.sync.change(v=>({...v,content:'失败后继续写'}));await s.sync.flush();assert.equal(s.writes.length,0);
 await assert.rejects(()=>s.sync.restoreVersion(2,restore),/上次恢复/);await s.sync.restoreVersion(1,restore);
 assert.equal(ids[0],ids[1]);assert.equal(s.sync.state.phase,'conflict');assert.equal(s.sync.state.value.content,'失败后继续写');assert.equal(s.sync.state.remote.content,'历史正文');
});
test('warm offline editing remains cached and online recovery waits for server confirmation',async t=>{
 let online=false;const s=setup(t,{online:()=>online});s.sync.change(v=>({...v,content:'离线新稿'}));await s.sync.flush();assert.equal(s.sync.state.phase,'offline');assert.equal(s.writes.length,0);
 s.sync.checkpoint();const reopened=setup(t,{storage:s.sync.options.storage,online:()=>online});assert.equal(reopened.sync.state.value.content,'离线新稿');assert.equal(reopened.sync.state.base.revision,1);
 online=true;await reopened.sync.flush();assert.equal(reopened.sync.state.phase,'saved');assert.equal(reopened.get().content,'离线新稿');
});
test('storage access and quota failures surface; failed cache cleanup blocks destructive restore',async t=>{
 const unavailable={getItem(){throw new Error('SecurityError');},setItem(){throw new Error('quota');},removeItem(){throw new Error('SecurityError');}};
 const s=setup(t,{storage:unavailable});assert.match(s.sync.state.cacheError,/不可用|读取失败/);s.sync.change(v=>({...v,content:'只在内存的稿'}));assert.match(s.sync.state.cacheError,/缓存失败/);
 let restored=false;await assert.rejects(()=>s.sync.restoreVersion(1,async()=>{restored=true;}),/缓存无法清理/);assert.equal(restored,false);assert.equal(s.get().content,'只在内存的稿');
});
test('backup revisions can rewind or keep the same number with a different hash without hiding conflicts',async t=>{
 for(const revision of [1,0]){const s=setup(t);s.sync.change(v=>({...v,content:'旧基准上的本地稿'}));s.set({...initial,revision,contentHash:'backup',content:'备份正文'});await s.sync.refresh();await s.sync.flush();assert.equal(s.sync.state.phase,'conflict');assert.equal(s.sync.state.value.content,'旧基准上的本地稿');assert.equal(s.sync.state.remote.content,'备份正文');}
 const clean=setup(t);clean.set({...initial,revision:0,contentHash:'rewound',content:'较早备份'});await clean.sync.refresh();assert.equal(clean.sync.state.value.content,'较早备份');assert.equal(clean.sync.dirty,false);
});

test('a reopened unresolved restore never auto-merges a later local edit into the restored text',async t=>{
 const s=setup(t),restore=async()=>{s.sync.change(v=>({...v,content:'甲段。\n\n乙段后写。'}));s.set({...initial,revision:2,content:'甲段历史。\n\n乙段。'});throw new Error('lost');};
 await assert.rejects(()=>s.sync.restoreVersion(1,restore));
 const reopened=setup(t,{initial:s.get(),storage:s.sync.options.storage,read:async()=>s.get()});
 assert.equal(reopened.sync.state.phase,'conflict');assert.equal(reopened.sync.state.remote.content,'甲段历史。\n\n乙段。');await reopened.sync.refresh();await reopened.sync.flush();assert.equal(reopened.writes.length,0);assert.equal(reopened.sync.state.value.content,'甲段。\n\n乙段后写。');
});
test('explicit reload does not discard typing that arrives while the read is pending',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),s=setup(t,{read:async()=>{await gate;return {...initial,revision:2,content:'当前服务器正文'};}});
 const reading=s.sync.reloadLatest();s.sync.change(v=>({...v,content:'读取时继续输入'}));release();await reading;
 assert.equal(s.sync.state.value.content,'读取时继续输入');assert.equal(s.sync.state.remote.content,'当前服务器正文');assert.equal(s.sync.state.phase,'conflict');
});

test('polling cannot silently resolve a conflict after the user starts merging',async t=>{
 const s=setup(t);s.sync.change(v=>({...v,content:'作者重写'}));s.set({...initial,revision:2,content:'AI 重写'});await s.sync.flush();assert.equal(s.sync.state.phase,'conflict');
 s.sync.change(v=>({...v,content:initial.content}));await s.sync.refresh();await s.sync.flush();assert.equal(s.sync.state.phase,'conflict');assert.equal(s.sync.state.base.revision,1);assert.equal(s.sync.state.value.content,initial.content);
});
test('repeated restore clicks share the operation rather than issuing duplicate mutations',async t=>{
 const s=setup(t);s.sync.change(v=>({...v,content:'要先保存'}));let mutations=0;
 const restore=async()=>{mutations++;s.set({...initial,revision:3});};
 await Promise.all([s.sync.restoreVersion(1,restore),s.sync.restoreVersion(1,restore)]);assert.equal(mutations,1);assert.equal(s.writes.length,1);
});

test('a refresh begun before a successful save cannot later rewind the confirmed receipt',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),s=setup(t,{read:async()=>{await gate;return {...initial};}});
 const reading=s.sync.refresh();s.sync.change(v=>({...v,content:'已成功保存的新正文'}));await s.sync.flush();release();await reading;
 assert.equal(s.sync.state.base.revision,2);assert.equal(s.sync.state.value.content,'已成功保存的新正文');assert.equal(s.sync.state.phase,'saved');
});
test('a delayed discard read cannot accept an older version after autosave has completed',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),s=setup(t,{read:async()=>{await gate;return {...initial};}});
 s.sync.change(v=>({...v,content:'新正文'}));const reading=s.sync.reloadLatest();await s.sync.flush();release();await assert.rejects(reading,/读取期间正文已保存/);assert.equal(s.sync.state.base.revision,2);assert.equal(s.sync.state.value.content,'新正文');
});

test('clean background checkpoints cannot delete another tab draft; divergent offline writers both retain durable copies',async t=>{
 const storage=cache(),a=setup(t,{storage,online:()=>false}),b=setup(t,{storage,online:()=>false});
 b.sync.change(v=>({...v,content:'B 标签页离线稿'}));const primary=storage.getItem('chapter');a.sync.checkpoint();assert.equal(storage.getItem('chapter'),primary);assert.match(a.sync.state.cacheError,/另一窗口/);
 a.sync.change(v=>({...v,content:'A 标签页也离线写'}));a.sync.checkpoint();b.sync.checkpoint();assert.equal(JSON.parse(storage.getItem('chapter')).value.content,'B 标签页离线稿');
 const values=Array.from({length:storage.length},(_,i)=>JSON.parse(storage.getItem(storage.key(i))).value.content);assert.ok(values.includes('A 标签页也离线写'));assert.ok(values.includes('B 标签页离线稿'));
 const reopened=setup(t,{storage,online:()=>false});assert.equal(reopened.sync.state.value.content,'B 标签页离线稿');assert.ok(reopened.sync.state.recoveryDrafts.some(copy=>copy.chapter.content==='A 标签页也离线写'));
});
test('malformed and wrong-chapter caches are not hydrated or erased, and newly typed text is separately protected',async t=>{
 for(const raw of ['{bad',JSON.stringify({base:{revision:1},value:{}}),JSON.stringify({base:{...initial,id:'wrong'},value:{...initial,id:'wrong',content:'其他章稿'}})]){
  const storage=cache();storage.setItem('chapter',raw);const s=setup(t,{storage,online:()=>false});assert.equal(s.sync.state.value.content,initial.content);assert.match(s.sync.state.cacheError,/异常/);s.sync.checkpoint();assert.equal(storage.getItem('chapter'),raw);
  s.sync.change(v=>({...v,content:'有效的新输入'}));await s.sync.flush();assert.equal(storage.getItem('chapter'),raw);assert.equal(s.sync.state.value.content,'有效的新输入');assert.ok(Array.from({length:storage.length},(_,i)=>storage.key(i)).some(key=>key.startsWith('chapter:recovery:')));
 }
});
test('a recovery copy updated after it was displayed cannot be deleted using the stale choice',async t=>{
 const storage=cache(),a=setup(t,{storage,online:()=>false}),b=setup(t,{storage,online:()=>false});a.sync.change(v=>({...v,content:'A 草稿'}));b.sync.change(v=>({...v,content:'B 草稿'}));
 const reopened=setup(t,{storage,online:()=>false}),copy=reopened.sync.state.recoveryDrafts.find(item=>item.chapter.content==='B 草稿');assert.ok(copy);storage.setItem(copy.key,copy.raw+' ');assert.throws(()=>reopened.sync.removeRecovery(copy.key),/已变化/);assert.equal(storage.getItem(copy.key),copy.raw+' ');
});
