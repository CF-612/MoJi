import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {encodeState} from '../state-codec.mjs';
import {encodeWorkspace,decodeWorkspace,fragmentIds} from '../workspace-storage.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const clone=structuredClone;
function database(blobs,expectedOwner='synthetic-owner'){
  const reads=[];
  return {reads,prepare(sql){assert.match(sql,/WHERE owner=\? AND digest IN/);return {bind(owner,...ids){reads.push({owner,ids});assert.ok(ids.length<=90);return {async all(){return {results:owner===expectedOwner?ids.filter(id=>blobs.has(id)).map(digest=>({digest,state:blobs.get(digest)})):[]};}};}};}};
}
function fixture(){
  const card=(id)=>({id,revision:1,title:'卡片 '+id,content:('正文—🙂e\u0301\r\n'+id).repeat(100),points:[{id:'point-'+id,narration:{chapterId:'chapter',offset:0.1234567890123456},relationships:[]}],extension:{nested:['保留',null]}});
  const current={revision:7,cards:{a:card('a'),b:card('b')},pages:[{id:'empty-page',groups:[{id:'empty-group'}],instances:{},unknownPage:[]},{id:'page',instances:{instance:{id:'instance',cardId:'a',x:-15.123456789012345,y:3.14}},groups:[]}],unknownState:{stateVersion:'future'}};
  const record={id:'character',revision:2,values:{custom:'保留值'},versions:[{revision:1,value:{id:'character',revision:1,values:{custom:'旧值'},unknownVersion:'保留'}}],extension:{future:true}};
  return {schemaVersion:1,novels:{novel:{id:'novel',title:'独立测试，不是真实作品',chapters:{chapter:{id:'chapter',content:'仅用来达到分片门槛'.repeat(30000),versions:[]}},nodes:{},edges:{},planning:{legacy:'旧规划完整只读内容',emptyGroups:[],pages:{}},story:{state:current,history:[{state:{...clone(current),revision:6},at:'2026-01-01',reason:'测试',unknownHistory:{keep:true}}],redo:[{state:{...clone(current),revision:8},at:'2026-01-02',reason:'重做'}],unknownStory:null},writing:{version:2,fields:{},cards:{character:record},links:{},foreshadows:{},events:{},relationshipChanges:{},relationshipTypes:{},reviews:{},goal:null,unknownWriting:{items:['future',null]}},unknownNovel:[false,0,null]}},bindings:{},requests:{request:{signature:'synthetic',result:{id:'novel'}}},unknownWorkspace:{keep:'yes'}};
}

test('MoJi cloud fragments preserve complete story/writing, histories, unknown fields and ordering after restart',async()=>{
  const state=fixture(),encoded=encodeWorkspace(state),manifest=JSON.parse(encoded.stored);
  assert.equal(manifest.format,'moji-workspace-fragments');assert.equal(manifest.version,1);
  const metadata=JSON.parse(encoded.blobs.get(manifest.shape.novels.novel.metadata));
  assert.ok(!Object.hasOwn(metadata,'story'));assert.ok(!Object.hasOwn(metadata,'writing'));assert.deepEqual(metadata.planning,state.novels.novel.planning);
  assert.deepEqual(new Set(encoded.blobs.keys()),fragmentIds(encoded.stored));
  const db=database(encoded.blobs),restored=await decodeWorkspace(encoded.stored,db,'synthetic-owner');
  assert.deepEqual(restored,state);
  const exported=encodeWorkspace(restored);
  assert.deepEqual(await decodeWorkspace(exported.stored,database(exported.blobs),'synthetic-owner'),state);
  assert.ok(db.reads.every(read=>read.owner==='synthetic-owner'));
});

test('one story-card edit reuses other cards/pages and snapshot data instead of rewriting full metadata/history',async()=>{
  const before=fixture(),first=encodeWorkspace(before),after=clone(before);
  const story=after.novels.novel.story;
  story.history.push({state:clone(story.state),at:'2026-01-03',reason:'只改卡片 a'});
  story.redo=[];story.state.cards.a.content='新内容';story.state.cards.a.revision++;story.state.revision++;
  const second=encodeWorkspace(after),fresh=[...second.blobs].filter(([id])=>!first.blobs.has(id));
  const one=JSON.parse(first.stored).shape.novels.novel,two=JSON.parse(second.stored).shape.novels.novel;
  assert.equal(one.metadata,two.metadata);assert.equal(one.writing,two.writing);assert.notEqual(one.story,two.story);
  assert.ok(fresh.length<14,`only changed tree paths and the new snapshot envelope are new: ${fresh.length}`);
  assert.ok(fresh.every(([,body])=>!body.includes('卡片 b')),'unchanged card b remains shared');
  const all=new Map([...first.blobs,...second.blobs]);
  assert.deepEqual(await decodeWorkspace(first.stored,database(all),'synthetic-owner'),before,'old rollback revision remains readable');
  assert.deepEqual(await decodeWorkspace(second.stored,database(all),'synthetic-owner'),after,'new committed revision remains readable');
});

test('one writing record edit shares prior versions and unrelated story data',async()=>{
  const before=fixture(),first=encodeWorkspace(before),after=clone(before),record=after.novels.novel.writing.cards.character;
  record.versions.push({revision:record.revision,value:{...clone(record),versions:undefined},timestamp:'2026-01-03'});
  record.values.custom='新的值';record.revision++;
  // Workspaces contain JSON data; undefined fields are omitted at the public boundary.
  const expected=JSON.parse(JSON.stringify(after)),second=encodeWorkspace(expected);
  const one=JSON.parse(first.stored).shape.novels.novel,two=JSON.parse(second.stored).shape.novels.novel;
  assert.equal(one.metadata,two.metadata);assert.equal(one.story,two.story);assert.notEqual(one.writing,two.writing);
  const fresh=[...second.blobs].filter(([id])=>!first.blobs.has(id));
  assert.ok(fresh.length<=7,`only changed record/version paths are new: ${fresh.length}`);
  assert.deepEqual(await decodeWorkspace(second.stored,database(second.blobs),'synthetic-owner'),expected);
});

test('legacy raw JSON, gzip, and v1 fragment snapshots remain readable alongside MoJi writes',async()=>{
  const small={schemaVersion:1,novels:{},bindings:{},requests:{}};
  assert.deepEqual(await decodeWorkspace(JSON.stringify(small),null,'synthetic-owner'),small);
  const state=fixture();assert.deepEqual(await decodeWorkspace(encodeState(state).stored,null,'synthetic-owner'),state);
  const blobs=new Map(),put=value=>{const id=hash(value);blobs.set(id,encodeState(value).stored);return id;};
  const novel=state.novels.novel,metadata={...novel};for(const key of ['chapters','nodes','edges'])delete metadata[key];
  const shape={...state,requests:{request:put(state.requests.request)},novels:{novel:{metadata:put(metadata),chapters:{chapter:put(novel.chapters.chapter)},nodes:{},edges:{}}}};
  const legacy=JSON.stringify({format:'cuigengji-workspace-fragments',version:1,shape});
  assert.deepEqual(await decodeWorkspace(legacy,database(blobs),'synthetic-owner'),state);
  const rewritten=encodeWorkspace(await decodeWorkspace(legacy,database(blobs),'synthetic-owner'));
  assert.equal(JSON.parse(rewritten.stored).format,'moji-workspace-fragments');
  assert.deepEqual(await decodeWorkspace(rewritten.stored,database(rewritten.blobs),'synthetic-owner'),state);
});

test('absent, null and empty optional extensions stay distinct, including empty maps/pages',async()=>{
  for(const optional of [{},{story:null,writing:null},{story:{state:{cards:{},pages:[]},history:[],redo:[],future:[]},writing:{cards:{},future:{}}}]){
    const state=fixture();delete state.novels.novel.story;delete state.novels.novel.writing;Object.assign(state.novels.novel,optional);
    const encoded=encodeWorkspace(state);
    assert.deepEqual(await decodeWorkspace(encoded.stored,database(encoded.blobs),'synthetic-owner'),state);
  }
});

test('missing, altered, cross-owner, malformed and undeclared fragments fail closed',async()=>{
  const state=fixture(),encoded=encodeWorkspace(state),ids=[...encoded.blobs.keys()];
  const missing=new Map(encoded.blobs);missing.delete(ids[0]);
  await assert.rejects(decodeWorkspace(encoded.stored,database(missing),'synthetic-owner'),{code:'CORRUPT_STORE'});
  const altered=new Map(encoded.blobs);altered.set(ids[0],JSON.stringify({changed:true}));
  await assert.rejects(decodeWorkspace(encoded.stored,database(altered),'synthetic-owner'),{code:'CORRUPT_STORE'});
  await assert.rejects(decodeWorkspace(encoded.stored,database(encoded.blobs),'another-owner'),{code:'CORRUPT_STORE'});
  const badId=JSON.parse(encoded.stored);badId.trees[0]='../other-owner';
  assert.throws(()=>fragmentIds(JSON.stringify(badId)),{code:'CORRUPT_STORE'});
  const badVersion=JSON.parse(encoded.stored);badVersion.version=2;
  assert.throws(()=>fragmentIds(JSON.stringify(badVersion)),{code:'CORRUPT_STORE'});
  const unlisted=JSON.parse(encoded.stored);unlisted.trees.pop();
  await assert.rejects(decodeWorkspace(JSON.stringify(unlisted),database(encoded.blobs),'synthetic-owner'),{code:'CORRUPT_STORE'});
  const cache=new Map([[ids[0],{tampered:true}]]);
  await assert.rejects(decodeWorkspace(encoded.stored,database(encoded.blobs),'synthetic-owner',cache),{code:'CORRUPT_STORE'});
  const extra={kind:'value',value:'unreferenced'},extraId=hash(extra),extraManifest=JSON.parse(encoded.stored),extraBlobs=new Map(encoded.blobs);
  extraManifest.trees.push(extraId);extraBlobs.set(extraId,JSON.stringify(extra));
  await assert.rejects(decodeWorkspace(JSON.stringify(extraManifest),database(extraBlobs),'synthetic-owner'),{code:'CORRUPT_STORE'});
  assert.deepEqual(await decodeWorkspace(encoded.stored,database(encoded.blobs),'synthetic-owner'),state,'failure does not mutate the committed manifest or payloads');
});

test('ordinary chapter saves keep their existing small fragment write count',()=>{
  const state=fixture(),first=encodeWorkspace(state);state.novels.novel.chapters.chapter.content='改写';state.novels.novel.revision=2;
  // Keep this synthetic workspace above the fragmentation threshold independently of prose.
  state.largeStable='x'.repeat(520000);const baseline=encodeWorkspace(state);state.novels.novel.chapters.chapter.content='再次改写';state.novels.novel.revision=3;
  const next=encodeWorkspace(state),fresh=[...next.blobs.keys()].filter(id=>!baseline.blobs.has(id));
  assert.ok(first.blobs.size>0);assert.equal(fresh.length,2);
});


test('broad story/writing trees fall back losslessly before exhausting the existing D1 query budget',async()=>{
  const state=fixture(),book=state.novels.novel;
  book.story={state:{revision:1,cards:Object.fromEntries(Array.from({length:1000},(_,i)=>['c'+i,{id:'c'+i,title:'卡片 '+i}])),pages:[]},history:[],redo:[]};
  book.writing={version:2,fields:{},cards:Object.fromEntries(Array.from({length:1000},(_,i)=>['n'+i,{id:'n'+i,revision:1,values:{custom:'值 '+i},versions:[]}]))};
  const encoded=encodeWorkspace(state),db=database(encoded.blobs);
  assert.ok(encoded.blobs.size<900,`bounded fallback avoids thousands of first-write fragments: ${encoded.blobs.size}`);
  assert.ok(Math.ceil(encoded.blobs.size/90)+Math.ceil(encoded.blobs.size/30)+2<50,'leave query headroom for the D1 adapter');
  assert.deepEqual(await decodeWorkspace(encoded.stored,db,'synthetic-owner'),state);
});
