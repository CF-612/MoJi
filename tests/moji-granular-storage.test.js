import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {Store} from '../src/core/store.js';
import {WorkData} from '../src/application/backup/workspace.js';
import {splitWorkspace,bookPath,fileId,STORAGE_FORMAT,STORAGE_VERSION} from '../src/infrastructure/persistence/project-layout.ts';
import {extensionFragmentIds,fragmentDigest} from '../src/infrastructure/persistence/story-fragments.ts';
import {storageSnapshot} from './helpers/storage-snapshot.js';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
async function temporary(t){const root=await mkdtemp(join(tmpdir(),'moji-fragments-synthetic-'));t.after(()=>rm(root,{recursive:true,force:true}));return root;}
async function fixture(t){
 const root=await temporary(t),store=new Store(root),actor={kind:'human',sessionId:'synthetic-fragments'};
 const novel=await store.dispatch('novel.create',{title:'合成：兼容分片'},actor),run=(action,args={})=>store.dispatch(action,{novelId:novel.id,...args},actor);
 const chapter=await run('chapter.create',{title:'正文',content:'完整证据。\r\n第二行。'}),other=await run('chapter.create',{title:'无关正文',content:'不能被剧情读取。'});
 await run('chapter.update',{chapterId:chapter.id,expectedRevision:1,content:'完整证据。\n第二版。'});
 const node=await run('graph.create',{type:'character_card',name:'甲',content:'不随剧情读取的资料。'});
 await run('writing.card.update',{nodeId:node.id,expectedRevision:0,values:{'character:gender':'合成'}});
 await run('writing.card.update',{nodeId:node.id,expectedRevision:1,values:{'character:occupation':'作者'}});
 await run('planning.apply',{requestId:'synthetic-old-plan',operations:[{op:'page.create',ref:'empty',value:{name:'保留空页'}},{op:'node.create',value:{title:'旧版只读规划',content:'旧规划全文。'}}]});
 let story=await run('story.get');
 for(const title of ['甲卡','乙卡'])story=await run('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.create',pageId:'main',value:{title,content:title+'正文'}}});
 const card=Object.keys(story.state.cards)[0];
 const axis={schemaVersion:1,calendar:{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor:{date:{year:0,month:1,day:1},coordinate:0,label:'合成锚点',chapterId:chapter.id},coordinateUnit:'day',primaryTick:{unit:'year',step:100},legacyMode:'unmapped',tracks:[{id:'story-main',name:'精确日期',color:'#123456',side:'above'}],markers:[]};
 story=await run('story.apply',{expectedRevision:story.state.revision,operation:{type:'storyAxis.configure',value:axis}});
 story=await run('story.apply',{expectedRevision:story.state.revision,operation:{type:'storyAxis.place',id:card,start:-21914550000000,end:-21914549999999,trackId:'story-main'}});
 story=await run('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.update',id:card,expectedRevision:story.state.cards[card].revision,value:{time:{...story.state.cards[card].time,narration:{startChapterId:chapter.id,endChapterId:chapter.id,startOffset:0.123456789012345,endOffset:0.987654321098765,trackId:'main'}}}}});
 story=await run('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.update',id:card,expectedRevision:story.state.cards[card].revision,value:{content:'改写后的剧情正文。'}}});
 await run('story.undo',{expectedRevision:story.state.revision});
 const state=await store.load(),n=state.novels[novel.id];
 n.story.extension={future:['保留',0.000000123456789]};n.story.state.extension={exactDay:'21914549999999999999999',custom:{empty:{}}};
 n.story.state.pages.push({id:'empty-page',name:'空画布',instances:{}});n.story.state.groups=[{id:'empty-group',name:'空组',refs:[]}];
 n.story.state.cards[card].future={nested:['不丢字段']};n.writing.future={arbitrary:{versions:['不是记录历史']}};
 store.validateMigration(state);await store.save(state);
 const library=await json(join(root,'library.json')),base=bookPath(novel.id,library.directories);
 return {root,store,actor,novel,run,chapter,other,node,card,state:await store.load(),base};
}
async function seed(root,state,version){
 const directories=Object.fromEntries(Object.keys(state.novels).map(id=>[id,version===2?fileId(id):'旧作品']));
 const files=splitWorkspace(state,directories,version===2?3:version);
 if(version===2){const library=JSON.parse(files.get('library.json'));library.storageVersion=2;delete library.directories;files.set('library.json',JSON.stringify(library));}
 for(const [path,text]of files){await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),text);}return files;
}
for(const version of [2,3,4])test(`v${version} migration preserves IDs, current/history/redo, unknown extensions and empty pages/groups across restart and export`,async t=>{
 const f=await fixture(t),root=await temporary(t),original=await seed(root,f.state,version),store=new Store(root);
 assert.deepEqual(await store.readStoredWorkspace(),f.state,'read-only old-format reconstruction');
 assert.deepEqual(await store.load(),f.state);const exact=(await store.load()).novels[f.novel.id].story.state.cards[f.card].time;assert.equal(exact.story.end-exact.story.start,1);assert.equal(exact.narration.startOffset,0.123456789012345);const library=await json(join(root,'library.json'));
 assert.equal(library.format,STORAGE_FORMAT);assert.equal(library.storageVersion,STORAGE_VERSION);
 const base=bookPath(f.novel.id,library.directories),project=await json(join(root,base,'project.json'));
 assert.equal(Object.hasOwn(project.novel,'story'),false);assert.equal(Object.hasOwn(project.novel,'writing'),false);
 assert.ok(project.sections.includes('story')&&project.sections.includes('writing'));
 const checkpoints=(await readdir(join(root,'backups'))).filter(name=>name.startsWith('before-moji-fragments-'));assert.equal(checkpoints.length,1);
 const checkpoint=join(root,'backups',checkpoints[0]);assert.deepEqual(await json(join(checkpoint,'store.json')),f.state);
 const manifest=await json(join(checkpoint,'migration.json'));assert.equal(manifest.sourceSha256,fragmentDigest(await readFile(join(checkpoint,'store.json'),'utf8')));
 if(version===4)assert.equal(await readFile(join(checkpoint,'library.json'),'utf8'),original.get('library.json'));
 const restarted=new Store(root);assert.deepEqual(await restarted.load(),f.state);
 const portable=await new WorkData(restarted).export(),destination=new Store(await temporary(t));await new WorkData(destination).import(portable);
 assert.deepEqual(await destination.load(),f.state);assert.deepEqual((await new WorkData(destination).export()).payload.state,portable.payload.state);
 assert.equal((await readdir(join(root,'backups'))).filter(name=>name.startsWith('before-moji-fragments-')).length,1);
});

test('story get/backup/apply use current fragments and metadata, not old snapshots or unrelated book bodies',async t=>{
 const f=await fixture(t),reads=[],read=f.store.readText.bind(f.store);f.store.readText=async path=>{reads.push(path);return read(path);};
 const index=await json(join(f.root,f.base,'story/index.json')),payload=index.payload;
 const current=new Set([payload.metadata,payload.state.metadata,...payload.state.cards.map(([,ref])=>ref),...payload.state.pages]);
 const historyOnly=[...extensionFragmentIds('story',index)].filter(ref=>!current.has(ref));assert.ok(historyOnly.length>0);
 const noUnrelated=()=>{assert.ok(reads.every(path=>!path.includes('/history/')&&!/\/chapters\/(?!index\.json$)/.test(path)&&!path.includes('/settings/entries/')&&!/\/planning\//.test(path)),reads.join('\n'));assert.ok(historyOnly.every(ref=>!reads.some(path=>path.endsWith('/'+ref+'.json'))));};
 const before=await storageSnapshot(f.root);let story=await f.run('story.get');noUnrelated();assert.equal(await storageSnapshot(f.root),before);
 reads.length=0;await f.run('story.backup');noUnrelated();
 reads.length=0;const writes=[],commit=f.store.transaction.commit.bind(f.store.transaction);f.store.transaction.commit=async(changes,moves)=>{writes.push(...changes.keys());return commit(changes,moves);};
 const other=Object.keys(story.state.cards).find(id=>id!==f.card),otherRef=payload.state.cards.find(([id])=>id===other)[1];
 story=await f.run('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.update',id:f.card,expectedRevision:story.state.cards[f.card].revision,value:{summary:'只改一张'}}});noUnrelated();
 assert.ok(!writes.includes(`${f.base}/story/fragments/${otherRef}.json`));
 assert.ok(writes.filter(path=>path.includes('/story/fragments/')).length<8,'bounded current-card write/delete set, not all history bodies');
 const loaded=await new Store(f.root).load();assert.equal(loaded.novels[f.novel.id].story.state.cards[f.card].summary,'只改一张');assert.deepEqual(loaded.novels[f.novel.id].story.history.slice(0,-1),f.state.novels[f.novel.id].story.history);
 reads.length=0;await f.run('chapter.get',{chapterId:f.chapter.id});assert.ok(reads.every(path=>!path.includes('/story/')&&!path.includes('/writing/')),'prose reads do not hydrate story or writing');
});

test('metadata reconciliation retains deferred history and undo/redo after restart',async t=>{
 const f=await fixture(t),prior=f.state.novels[f.novel.id].story.history;
 await f.run('chapter.create',{title:'触发同步',content:'新增正文'});const current=await f.run('story.get');
 const saved=(await new Store(f.root).load()).novels[f.novel.id].story;assert.deepEqual(saved.history.slice(0,-1),prior);assert.equal(saved.history.at(-1).reason,'同步正文目录');
 const run=(action,args)=>new Store(f.root).dispatch(action,{novelId:f.novel.id,...args},f.actor);
 const undo=await run('story.undo',{expectedRevision:current.state.revision}),redo=await run('story.redo',{expectedRevision:undo.state.revision});assert.equal(redo.canRedo,saved.redo.length>0);
 assert.deepEqual(redo.state.cards,current.state.cards);assert.deepEqual(redo.state.groups,current.state.groups);
});

test('proof-bearing story edits read only the referenced saved chapter and reject fabricated proof without writes',async t=>{
 const f=await fixture(t),story=await f.run('story.get'),reads=[],read=f.store.readText.bind(f.store);f.store.readText=async path=>{reads.push(path);return read(path);};
 const evidence={chapterId:f.chapter.id,revision:2,evidence:'完整证据。'};
 const next=await f.run('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.update',id:f.card,expectedRevision:story.state.cards[f.card].revision,value:{evidence:[evidence]}}});
 assert.ok(reads.some(path=>path.endsWith(`/history/chapters/${f.chapter.id}.json`)));assert.ok(reads.every(path=>!path.endsWith(`/history/chapters/${f.other.id}.json`)));
 const before=await storageSnapshot(f.root);await assert.rejects(f.run('story.apply',{expectedRevision:next.state.revision,operation:{type:'card.update',id:f.card,expectedRevision:next.state.cards[f.card].revision,value:{evidence:[{...evidence,evidence:'伪造证据'}]}}}),{code:'STORY_INVALID'});assert.equal(await storageSnapshot(f.root),before);
});

test('interrupted v4 migration resumes its journal and checkpoint without changing logical data',async t=>{
 const f=await fixture(t),root=await temporary(t);await seed(root,f.state,4);const store=new Store(root),apply=store.transaction.applyEntry.bind(store.transaction);let count=0;
 store.transaction.applyEntry=async(...args)=>{await apply(...args);if(++count===2)throw new Error('synthetic crash');};
 await assert.rejects(store.load(),/synthetic crash/);assert.ok(await stat(join(root,'transaction.pending.json')));
 const recovered=new Store(root);assert.deepEqual(await recovered.load(),f.state);assert.equal((await readdir(join(root,'backups'))).filter(name=>name.startsWith('before-moji-fragments-')).length,1);
 await assert.rejects(stat(join(root,'transaction.pending.json')),{code:'ENOENT'});
});

test('staging ENOSPC and destination collision leave the old library and original bytes intact',async t=>{
 const f=await fixture(t),root=await temporary(t);await seed(root,f.state,4);const before=await storageSnapshot(root),store=new Store(root);
 store.transaction.commit=async()=>{throw Object.assign(new Error('synthetic staging capacity failure'),{code:'ENOSPC'});};
 await assert.rejects(store.load(),{code:'ENOSPC'});assert.equal(await storageSnapshot(root),before);assert.ok((await readdir(join(root,'backups'))).some(name=>name.startsWith('before-moji-fragments-')));
 const library=await json(join(root,'library.json')),base=bookPath(f.novel.id,library.directories);await mkdir(join(root,base,'story'),{recursive:true});await writeFile(join(root,base,'story/index.json'),'author-owned file');
 const collision=await storageSnapshot(root);await assert.rejects(new Store(root).load(),{code:'CORRUPT_STORE'});assert.equal(await storageSnapshot(root),collision);
});

test('missing or corrupt current/history fragments fail complete export; unknown future MoJi identity fails closed',async t=>{
 const f=await fixture(t),index=await json(join(f.root,f.base,'story/index.json')),hash=index.payload.state.cards[0][1],path=join(f.root,f.base,'story/fragments',hash+'.json'),original=await readFile(path,'utf8');
 await writeFile(path,'{}');const before=await storageSnapshot(f.root);await assert.rejects(f.run('story.get'),{code:'CORRUPT_STORE'});await assert.rejects(new WorkData(f.store).export(),{code:'CORRUPT_STORE'});assert.equal(await storageSnapshot(f.root),before);
 await writeFile(path,original);await rm(path);await assert.rejects(new WorkData(f.store).export(),{code:'CORRUPT_STORE'});
 for(const version of [4,6,999]){const root=await temporary(t),value=JSON.stringify({format:STORAGE_FORMAT,storageVersion:version,metadata:{schemaVersion:1},novels:{},directories:{}});await writeFile(join(root,'library.json'),value);await assert.rejects(new Store(root).load(),{code:'UNSUPPORTED_STORAGE_VERSION'});assert.deepEqual(await readdir(root),['library.json']);assert.equal(await readFile(join(root,'library.json'),'utf8'),value);}
});

test('removing and recreating optional extensions deletes only owned refs and supports repeated saves of one view',async t=>{
 const f=await fixture(t),state=await f.store.load(),n=state.novels[f.novel.id];
 await writeFile(join(f.root,f.base,'story','author-notes.json'),'keep me');
 delete n.story;delete n.writing;await f.store.save(state);
 await assert.rejects(stat(join(f.root,f.base,'story/index.json')),{code:'ENOENT'});await assert.rejects(stat(join(f.root,f.base,'writing/index.json')),{code:'ENOENT'});
 assert.equal(await readFile(join(f.root,f.base,'story/author-notes.json'),'utf8'),'keep me');
 const story=await f.run('story.get');assert.equal(Object.keys(story.state.cards).length,0);
 await f.run('writing.card.update',{nodeId:f.node.id,expectedRevision:0,values:{'character:gender':'重建'}});
 const again=await f.store.load();again.novels[f.novel.id].story.state.extension={saved:1};await f.store.save(again);
 again.novels[f.novel.id].story.state.extension.saved=2;await f.store.save(again);
 assert.equal((await new Store(f.root).load()).novels[f.novel.id].story.state.extension.saved,2);
});

test('an interrupted story edit recovers once with request identity and unchanged other cards',async t=>{
 const f=await fixture(t),story=await f.run('story.get'),apply=f.store.transaction.applyEntry.bind(f.store.transaction);let count=0;
 f.store.transaction.applyEntry=async(...args)=>{await apply(...args);if(++count===2)throw new Error('synthetic edit crash');};
 const args={novelId:f.novel.id,requestId:'synthetic-story-retry',expectedRevision:story.state.revision,operation:{type:'card.update',id:f.card,expectedRevision:story.state.cards[f.card].revision,value:{summary:'一次提交'}}};
 await assert.rejects(f.store.dispatch('story.apply',args,f.actor),/synthetic edit crash/);
 const restarted=new Store(f.root),result=await restarted.dispatch('story.apply',args,f.actor);
 assert.equal(result.state.revision,story.state.revision+1);assert.equal(result.state.cards[f.card].summary,'一次提交');
 const saved=(await restarted.load()).novels[f.novel.id].story;assert.equal(saved.history.length,f.state.novels[f.novel.id].story.history.length+1);
 for(const [id,card]of Object.entries(story.state.cards))if(id!==f.card)assert.deepEqual(saved.state.cards[id],card);
 assert.deepEqual(await restarted.dispatch('story.apply',args,f.actor),result);
});

test('renaming a MoJi project with fragments recovers directory and indexes together',async t=>{
 const f=await fixture(t),before=await f.store.load(),apply=f.store.transaction.applyEntry.bind(f.store.transaction);let count=0;
 f.store.transaction.applyEntry=async(...args)=>{await apply(...args);if(++count===1)throw new Error('synthetic rename crash');};
 const args={novelId:f.novel.id,expectedRevision:before.novels[f.novel.id].revision,title:'改名后作品',requestId:'fragment-rename'};
 await assert.rejects(f.store.dispatch('novel.update',args,f.actor),/synthetic rename crash/);
 const restarted=new Store(f.root);await restarted.dispatch('novel.update',args,f.actor);const restored=(await restarted.load()).novels[f.novel.id];
 assert.deepEqual(restored.story,before.novels[f.novel.id].story);assert.deepEqual(restored.writing,before.novels[f.novel.id].writing);assert.equal(restored.title,args.title);
});

test('migration audit rehearsal distinguishes unchanged bytes from repartitioned metadata and never changes source',async t=>{
 const {execFile}=await import('node:child_process'),{promisify}=await import('node:util');
 const f=await fixture(t),root=await temporary(t);await seed(root,f.state,4);const before=await storageSnapshot(root);
 const {stdout}=await promisify(execFile)(process.execPath,['scripts/check-project-names-migration.mjs',root],{cwd:new URL('../',import.meta.url),maxBuffer:1024*1024});
 const report=JSON.parse(stdout);assert.equal(report.mode,'isolated-rehearsal');assert.equal(report.storageFormat,STORAGE_FORMAT);assert.equal(report.logicalDataUnchanged,true);assert.equal(report.repartitionedMetadataVerified,true);assert.equal(report.backupRoundtrip,true);assert.ok(report.byteIdenticalUnchangedRecords>0);
 assert.equal(await storageSnapshot(root),before);
 t.after(()=>rm(dirname(report.target),{recursive:true,force:true}));
});

test('fast story reads reject rehashed but structurally invalid current records without rewriting files',async t=>{
 const f=await fixture(t),state=await f.store.load();
 state.novels[f.novel.id].story.state.cards[f.card].title='';
 // A well-hashed envelope is not a substitute for domain structure validation.
 await f.store.save(state);const before=await storageSnapshot(f.root);
 for(const action of ['story.get','story.backup'])await assert.rejects(f.run(action),{code:'CORRUPT_STORE'});
 await assert.rejects(f.run('story.apply',{expectedRevision:state.novels[f.novel.id].story.state.revision,operation:{type:'track.create',name:'不能写入'}}),{code:'CORRUPT_STORE'});
 assert.equal(await storageSnapshot(f.root),before);
});
