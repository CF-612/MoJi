import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile, writeFile, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {Store} from '../src/application/store.js';
import {createTransfer} from '../integrations/chatgpt-workbench/server/transfer-service.mjs';

const actor = {kind:'human',sessionId:'synthetic-migration-050'};
const fixtureURL = new URL('./fixtures/upstream-050/wholebook.json', import.meta.url);
const fileOf = json => ({name:'synthetic-wholebook.json',json});
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// The existing MoJi importer adds these four relation-display defaults. All
// upstream fields (including unknown metadata) must otherwise remain exact.
const normalized = source => {
  const result=structuredClone(source);
  for(const edge of Object.values(result.edges))Object.assign(edge,{category:'other',timing:'base',baseActive:true,style:'solid'});
  return result;
};
async function setup(t) {
  const root = await mkdtemp(join(tmpdir(),'moji-migration-050-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const store = new Store(root);
  return {root,store,transfer:createTransfer(store)};
}
async function restore(transfer,file,options={mode:'restore'}) {
  const preview = await transfer.preview({file,options});
  assert.equal(preview.valid,true,preview.conflicts.join('; '));
  const request = {file,options,proof:preview.proof,requestId:randomUUID()};
  return {result:await transfer.import(request,actor),request};
}

test('pinned upstream fixtures retain their generation provenance and integrity',async()=>{
  for(const [file,metadata] of [['wholebook.json','provenance.json'],['memory-pages.json','provenance-memory-pages.json']]) {
    const text=await readFile(new URL('./fixtures/upstream-050/'+file,import.meta.url),'utf8');
    const provenance=JSON.parse(await readFile(new URL('./fixtures/upstream-050/'+metadata,import.meta.url),'utf8'));
    assert.equal(provenance.synthetic,true);assert.equal(provenance.upstreamVersion,'0.5.0');
    assert.equal(provenance.upstreamCommit,'e9b78d065c0a681c6c516d7bb6f66ecb48108203');
    assert.equal(provenance.sourceStorageVersion,5);
    assert.equal(createHash('sha256').update(text).digest('hex'),provenance.fileSha256);
    const packet=JSON.parse(text);assert.equal(packet.sha256,hash(packet.payload));
  }
});

test('real upstream 0.5.0 wholebook package survives restore, restart and re-export',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t);
  const file=fileOf(packet),source=normalized(packet.payload.projects[0]);
  const {result,request}=await restore(s.transfer,file);
  assert.deepEqual(result.novelIds,[source.id]);
  assert.deepEqual((await new Store(s.root).load()).novels[source.id],source);
  const exported=JSON.parse((await s.transfer.export({selection:{kind:'works',novelIds:[source.id]}})).content);
  assert.deepEqual(exported.payload.projects,[source]);
  assert.equal((await s.transfer.import(request,actor)).repeated,true);
  const duplicate=await restore(s.transfer,file);assert.deepEqual(duplicate.result.skipped,[source.title]);
  const snapshot=JSON.parse(await readFile(join(result.backupDir,'workspace.json'),'utf8'));
  assert.equal(snapshot.format,'cuigengji-workspace');assert.deepEqual(snapshot.payload.state.novels,{});
});

test('upstream import rejects corrupt packages, unsupported envelope versions and same-ID conflicts without writes',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t),file=fileOf(packet);
  await restore(s.transfer,file);
  const before=await s.store.load();
  const corrupt=structuredClone(packet);corrupt.payload.projects[0].title+='tampered';
  await assert.rejects(s.transfer.preview({file:fileOf(corrupt)}),/校验失败/);
  const newer={...packet,version:2};await assert.rejects(s.transfer.preview({file:fileOf(newer)}),/不支持/);
  const conflicting=structuredClone(packet);conflicting.payload.projects[0].title+='different';conflicting.sha256=hash(conflicting.payload);
  const options={mode:'restore'},preview=await s.transfer.preview({file:fileOf(conflicting),options});
  assert.equal(preview.valid,false);
  await assert.rejects(s.transfer.import({file:fileOf(conflicting),options,proof:preview.proof,requestId:randomUUID()},actor),{code:'IMPORT_CONFLICT'});
  assert.deepEqual(await s.store.load(),before);
});

test('upstream flat setting history is readable and actually restores content after import',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t),source=packet.payload.projects[0];
  await restore(s.transfer,fileOf(packet));
  const person=Object.values(source.nodes).find(n=>n.versions.length>1);
  const args={novelId:source.id,nodeId:person.id};
  const before=await s.store.load(),history=await s.store.dispatch('graph.history',args,actor);
  assert.equal(history.versions[0].value.content,person.versions[0].content);
  assert.deepEqual(await s.store.load(),before,'reading adapted history must not mutate the saved original');
  await s.store.dispatch('graph.restore',{...args,expectedRevision:person.revision,targetRevision:1},actor);
  const after=(await new Store(s.root).load()).novels[source.id].nodes[person.id];
  assert.equal(after.content,person.versions[0].content);assert.equal(after.summary,person.versions[0].summary);
  const afterHistory=await s.store.dispatch('graph.history',args,actor);
  assert.equal(afterHistory.versions.at(-1).value.content,person.content,'pre-restore version remains recoverable');
  assert.equal(new Set(after.versions.map(v=>v.revision)).size,after.versions.length);
});

test('invalid flat history fails before import instead of becoming a broken restore',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t),source=packet.payload.projects[0];
  const person=Object.values(source.nodes).find(n=>n.versions.length>1);
  person.versions[0].content+='tampered';packet.sha256=hash(packet.payload);
  const before=await s.store.load();
  await assert.rejects(s.transfer.preview({file:fileOf(packet),options:{mode:'restore'}}),{code:'INVALID_BACKUP'});
  assert.deepEqual(await s.store.load(),before);
});

test('copying upstream setting histories and nested group references never keeps source IDs',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t),source=packet.payload.projects[0];
  const {result}=await restore(s.transfer,fileOf(packet),{mode:'copy'}),n=(await s.store.load()).novels[result.novelIds[0]];
  assert.notEqual(n.id,source.id);assert.equal(n.preset.enabled,false);
  for(const groups of [n.memoryGroups,n.planning.groups])for(const group of Object.values(groups))if(group.parentId)assert.ok(groups[group.parentId]);
  for(const group of Object.values(n.planning.groups))if(group.pageId)assert.ok(n.planning.pages[group.pageId]);
  for(const node of Object.values(n.nodes)) {
    assert.ok(!source.nodes[node.id]);assert.equal(node.status,'unconfirmed');
    const history=await s.store.dispatch('graph.history',{novelId:n.id,nodeId:node.id},actor);
    for(const version of history.versions){
      assert.ok(n.memoryGroups[version.value.groupId]);
      for(const ref of version.value.sources)assert.ok(n.chapters[ref.chapterId]);
      for(const ref of version.value.dependsOn)assert.ok(n.nodes[ref]);
    }
  }
});

test('imported grouped decorations remap on copy and unsafe group deletion is blocked',async t=>{
  const packet=JSON.parse(await readFile(fixtureURL,'utf8')),s=await setup(t),source=packet.payload.projects[0];
  const leaf=Object.values(source.planning.groups).find(g=>g.parentId),decor=Object.values(source.planning.decorations)[0];
  decor.groupId=leaf.id;packet.sha256=hash(packet.payload);
  const {result}=await restore(s.transfer,fileOf(packet),{mode:'copy'}),n=(await s.store.load()).novels[result.novelIds[0]];
  const imported=Object.values(n.planning.decorations).find(d=>d.title===decor.title);
  assert.notEqual(imported.groupId,leaf.id);assert.ok(n.planning.groups[imported.groupId]);
  const before=await s.store.load();
  for(const group of [n.planning.groups[imported.groupId],...Object.values(n.planning.groups).filter(g=>Object.values(n.planning.groups).some(c=>c.parentId===g.id))]) {
    await assert.rejects(s.store.dispatch('planning.apply',{novelId:n.id,requestId:randomUUID(),operations:[{op:'group.delete',id:group.id,expectedRevision:group.revision,confirm:true}]},actor),{code:'UNSUPPORTED_STRUCTURE_EDIT'});
  }
  assert.deepEqual(await s.store.load(),before);
});

test('MoJi-only story, summary, layout, inline assets and history survive wholebook restore',async t=>{
  const source=await setup(t),target=await setup(t),store=source.store;
  const novel=await store.dispatch('novel.create',{title:'合成墨叽完整作品'},actor),novelId=novel.id;
  const call=(action,args={})=>store.dispatch(action,{novelId,...args},actor);
  const chapter=await call('chapter.create',{title:'第一章',content:'合成正文 v1',summary:'合成梗概 v1'});
  await call('chapter.update',{chapterId:chapter.id,expectedRevision:1,content:'合成正文 v2',summary:'合成梗概 v2'});
  const person=await call('graph.create',{name:'合成人物',type:'character_card',content:'非真实资料'});
  let story=await call('story.get');
  story=await call('story.apply',{expectedRevision:story.state.revision,operation:{type:'card.create',pageId:'main',value:{title:'合成剧情卡'}}});
  const cardId=Object.keys(story.state.cards)[0];
  story=await call('story.apply',{expectedRevision:story.state.revision,operation:{type:'group.create',name:'合成剧情组',refs:[`card:${cardId}`,`chapter:${chapter.id}`]}});
  const layout=await call('timeline.layout.get');
  await call('timeline.layout.save',{expectedRevision:layout.revision,value:{tracks:layout.tracks,placements:{'planning:synthetic':{trackId:'main',narration:{start:{anchorId:chapter.id,offset:.2},end:{anchorId:chapter.id,offset:.8}}}}}});
  // Inline raster data and extension metadata are part of the logical novel,
  // not filesystem attachments. Use a synthetic one-pixel image only.
  const state=await store.load(),image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1sAAAAASUVORK5CYII=';
  Object.assign(state.novels[novelId],{coverImage:image,coverMode:'pixel',genre:'合成测试',workStatus:'draft'});
  state.novels[novelId].nodes[person.id].avatarImage=image;
  await store.save(state);
  const before=(await store.load()).novels[novelId];
  const exported=await source.transfer.export({selection:{kind:'works',novelIds:[novelId]}});
  await restore(target.transfer,{name:exported.filename,text:exported.content});
  assert.deepEqual((await new Store(target.root).load()).novels[novelId],before);
  assert.ok(before.story.history.length);assert.equal(before.chapters[chapter.id].versions[0].summary,'合成梗概 v1');
});

test('newer on-disk layouts fail closed without rewriting library.json',async t=>{
  for(const storageVersion of [5,999]) {
    const s=await setup(t),library={format:'cuigengji-library',storageVersion,metadata:{schemaVersion:1},novels:{},directories:{}};
    const original=JSON.stringify(library);await writeFile(join(s.root,'library.json'),original);
    await assert.rejects(s.store.load(),error=>error.code==='UNSUPPORTED_STORAGE_VERSION'&&/不要手改版本号/.test(error.message));
    assert.equal(await readFile(join(s.root,'library.json'),'utf8'),original);
    assert.deepEqual((await readdir(s.root)).filter(p=>p!=='library.json'),[]);
  }
});

test('upstream multiple setting pages round-trip intact, warn on display limits and reject unsafe copy',async t=>{
  const packet=JSON.parse(await readFile(new URL('./fixtures/upstream-050/memory-pages.json',import.meta.url),'utf8')),s=await setup(t);
  const file=fileOf(packet),expected=normalized(packet.payload.projects[0]);
  const inspection=s.transfer.inspect({file});assert.ok(inspection.warnings.some(w=>w.includes('多资料画布')));
  await restore(s.transfer,file);assert.deepEqual((await new Store(s.root).load()).novels[expected.id],expected);
  const exported=JSON.parse((await s.transfer.export({selection:{kind:'works',novelIds:[expected.id]}})).content);
  assert.deepEqual(exported.payload.projects,[expected]);
  const before=await s.store.load(),options={mode:'copy'},preview=await s.transfer.preview({file,options});
  assert.equal(preview.valid,false);assert.ok(preview.conflicts.some(w=>w.includes('暂不支持复用合并')));
  await assert.rejects(s.transfer.import({file,options,proof:preview.proof,requestId:randomUUID()},actor),{code:'IMPORT_CONFLICT'});
  assert.deepEqual(await s.store.load(),before);
  const parent=Object.values(expected.memoryGroups).find(g=>Object.values(expected.memoryGroups).some(child=>child.parentId===g.id));
  await assert.rejects(s.store.dispatch('graph.group.delete',{novelId:expected.id,groupId:parent.id,expectedRevision:parent.revision,confirm:true},actor),{code:'UNSUPPORTED_STRUCTURE_EDIT'});
  const mainNode=Object.values(expected.nodes).find(n=>n.pageId===null),otherGroup=Object.values(expected.memoryGroups).find(g=>g.pageId);
  await assert.rejects(s.store.dispatch('graph.move',{novelId:expected.id,groupId:otherGroup.id,members:[{id:mainNode.id,expectedRevision:mainNode.revision}]},actor),{code:'UNSUPPORTED_STRUCTURE_EDIT'});
  await assert.rejects(s.store.dispatch('graph.update',{novelId:expected.id,nodeId:mainNode.id,expectedRevision:mainNode.revision,groupId:otherGroup.id},actor),{code:'UNSUPPORTED_STRUCTURE_EDIT'});
  await assert.rejects(s.store.dispatch('graph.create',{novelId:expected.id,type:'character_card',name:'不应写入',groupId:otherGroup.id},actor),{code:'UNSUPPORTED_STRUCTURE_EDIT'});
  assert.deepEqual(await s.store.load(),before);
  const person=Object.values(expected.nodes).find(n=>n.versions?.some(v=>v.pageId===null)&&n.versions?.some(v=>v.pageId));
  const old=person.versions.find(v=>v.pageId===null),args={novelId:expected.id,nodeId:person.id};
  await s.store.dispatch('graph.restore',{...args,expectedRevision:person.revision,targetRevision:old.revision},actor);
  assert.equal((await s.store.load()).novels[expected.id].nodes[person.id].pageId,null);
});
