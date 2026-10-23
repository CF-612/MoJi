import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
import {validateWriting,copyWriting,sliceWriting} from '../../../src/domain/writing.js';
async function setup(){const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const s=await createService(await mkdtemp(join(root,'ai-review-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'review-test','human');const ch=await call('chapter.update',{chapterId:s.chapterId,expectedRevision:1,content:'岑予捡起银钥匙。他想起江遥。'}),person=await call('writing.card.create',{name:'岑予',type:'character_card'}),other=await call('writing.card.create',{name:'江遥',type:'character_card'});return {s,call,ch:await call('chapter.get',{chapterId:ch.id}),person,other};}
const candidates=(x)=>({chapterId:x.ch.id,expectedChapterRevision:x.ch.revision,title:'雨夜章整理',items:[{id:'appearance',kind:'link',nodeId:x.person.id,linkKind:'appearance',evidence:'岑予捡起银钥匙。',reason:'明确动作'},{id:'mention',kind:'link',nodeId:x.other.id,linkKind:'mention',evidence:'他想起江遥。'},{id:'event',kind:'event',evidence:'岑予捡起银钥匙。',value:{title:'捡起钥匙',memoryRefs:[x.person.id],order:10,narrativeKind:'linear'}},{id:'shadow',kind:'foreshadow',value:{title:'银钥匙的主人',status:'planted',memoryRefs:[x.person.id],evidence:[{kind:'plant',chapterId:x.ch.id,revision:x.ch.revision,evidence:'岑予捡起银钥匙。'}]}}]});
async function submit(x,args=candidates(x),requestId='submit'){const p=await x.call('writing.review.preview',args);return x.call('writing.review.submit',{...args,proof:p.proof,requestId});}
test('预览与提交仅留候选，跨服务重开保留；按选择原子采用，共享事实和首次出场；重试不重复',async()=>{
 const x=await setup(),args=candidates(x),before=await x.call('novel.export'),p=await x.call('writing.review.preview',args);assert.deepEqual((await x.call('novel.export')).novel,before.novel);assert.equal(p.candidateOnly,true);
 const r=await x.call('writing.review.submit',{...args,proof:p.proof,requestId:'submit'});assert.equal((await x.call('novel.export')).novel.writing.version,2);assert.equal((await x.call('writing.review.submit',{...args,proof:p.proof,requestId:'submit'})).id,r.id);assert.equal(Object.keys((await x.call('story.get')).state.cards).length,0);assert.equal((await x.call('writing.link.list')).length,0);assert.equal((await x.call('writing.foreshadow.list')).length,0);
 const opened=await createService(x.s.store.root);assert.equal((await opened.rpc('writing.review.get',{novelId:x.s.novelId,id:r.id},'another','human')).items.length,4);
 const apply={id:r.id,expectedRevision:1,itemIds:['appearance','event','shadow'],confirmed:true,requestId:'apply'},done=await x.call('writing.review.apply',apply);assert.equal(done.items.filter(i=>i.state==='applied').length,3);assert.equal(done.items.find(i=>i.id==='mention').state,'pending');assert.equal((await x.call('writing.review.apply',apply)).revision,done.revision);assert.equal(Object.keys((await x.call('story.get')).state.cards).length,2);assert.equal((await x.call('writing.foreshadow.list')).length,1);assert.equal((await x.call('writing.card.get',{nodeId:x.person.id})).firstAppearance.chapterId,x.ch.id);assert.equal((await x.call('writing.card.get',{nodeId:x.other.id})).firstMention,null);
 const dismissed=await x.call('writing.review.dismiss',{id:r.id,expectedRevision:done.revision,itemIds:['mention'],confirmed:true,requestId:'dismiss'});assert.equal(dismissed.items.find(i=>i.id==='mention').state,'dismissed');assert.equal((await x.call('writing.link.list')).length,1);
 const file={name:'虚构完整备份.json',json:await x.call('novel.export')},options={mode:'copy',title:'虚构候选复制'},copyPreview=await x.call('transfer.preview',{file,options}),copied=await x.call('transfer.import',{file,options,proof:copyPreview.proof,requestId:'review-copy'}),book=(await x.s.rpc('novel.export',{novelId:copied.novelIds[0]},'copy-reader','human')).novel;
 assert.equal(book.writing.version,2);const copiedReview=Object.values(book.writing.reviews)[0];assert.ok(book.writing.links[copiedReview.items.find(i=>i.kind==='link'&&i.state==='applied').result.id]);assert.ok(book.story.state.cards[copiedReview.items.find(i=>i.kind==='event').result.id]);assert.ok(book.writing.foreshadows[copiedReview.items.find(i=>i.kind==='foreshadow').result.id]);
});
test('正文变动、资料改名、预览篡改均拒绝；候选保留；确认及请求标识不可省略',async()=>{
 const x=await setup(),args=candidates(x),p=await x.call('writing.review.preview',args);
 await assert.rejects(x.call('writing.review.submit',{...args,title:'篡改标题',proof:p.proof,requestId:'tamper'}),{code:'CONFLICT'});const r=await submit(x);
 await assert.rejects(x.call('writing.review.apply',{id:r.id,expectedRevision:1,itemIds:['appearance'],requestId:'no-confirm'}),{code:'CONFIRM_REQUIRED'});
 await assert.rejects(x.call('writing.review.apply',{id:r.id,expectedRevision:1,itemIds:['appearance'],confirmed:true}),{code:'INVALID_REVIEW'});
 await x.call('graph.update',{nodeId:x.person.id,expectedRevision:x.person.revision,name:'岑予改名'});assert.equal((await x.call('writing.review.get',{id:r.id})).items.find(i=>i.id==='appearance').stale,true);
 await assert.rejects(x.call('writing.review.apply',{id:r.id,expectedRevision:1,itemIds:['appearance','mention'],confirmed:true,requestId:'stale'}),{code:'CONFLICT'});assert.equal((await x.call('writing.link.list')).length,0);
 await x.call('chapter.update',{chapterId:x.ch.id,expectedRevision:x.ch.revision,content:x.ch.content+'新段落。'});assert.ok((await x.call('writing.review.get',{id:r.id})).items.every(i=>i.stale));assert.equal((await x.call('writing.review.list',{chapterId:x.ch.id}))[0].pending,4);
});
test('坏证据、错误类型、无回收依据无法提交；批内互相冲突不留下半条事实',async()=>{
 const x=await setup(),args=candidates(x);
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{...args.items[0],evidence:'正文没有这句'}]}));
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{id:'unsupported',kind:'chapter-delete'}]}),{code:'INVALID_REVIEW'});
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{...args.items[3],value:{...args.items[3].value,status:'recovered'}}]}),{code:'INVALID_WRITING'});
 const shadow=await x.call('writing.foreshadow.create',{value:args.items[3].value,confirmed:true});
 const item={kind:'foreshadow',targetId:shadow.id,expectedRevision:shadow.revision,value:{...args.items[3].value,content:'同一版本的更新'}};
 const r=await submit(x,{...args,items:[{...item,id:'update1'},{...item,id:'update2'}]});
 await assert.rejects(x.call('writing.review.apply',{id:r.id,expectedRevision:1,itemIds:['update1','update2'],confirmed:true,requestId:'atomic'}),{code:'CONFLICT'});
 assert.equal(Object.keys((await x.call('story.get')).state.cards).length,0);assert.equal((await x.call('writing.foreshadow.get',{id:shadow.id})).revision,shadow.revision);assert.ok((await x.call('writing.review.get',{id:r.id})).items.every(i=>i.state==='pending'));
});
test('已有伏笔的疑似回收先候选；采用更新同一 ID、保留旧历史和理由；重复候选不能覆盖新版本',async()=>{
 const x=await setup(),base=candidates(x).items[3].value,shadow=await x.call('writing.foreshadow.create',{value:base,confirmed:true}),args={chapterId:x.ch.id,expectedChapterRevision:x.ch.revision,items:[{id:'recover',kind:'foreshadow',targetId:shadow.id,expectedRevision:shadow.revision,value:{status:'recovered',evidence:[...base.evidence,{kind:'recover',chapterId:x.ch.id,revision:x.ch.revision,evidence:'岑予捡起银钥匙。'}]}}]};
 const r=await submit(x,args);assert.equal((await x.call('writing.foreshadow.get',{id:shadow.id})).status,'planted');const done=await x.call('writing.review.apply',{id:r.id,expectedRevision:r.revision,itemIds:['recover'],confirmed:true,requestId:'recover'});assert.equal(done.items[0].result.id,shadow.id);assert.equal((await x.call('writing.foreshadow.get',{id:shadow.id})).status,'recovered');assert.equal((await x.call('writing.history',{collection:'foreshadows',id:shadow.id})).versions[0].value.status,'planted');
});
test('完整备份与复制保留候选和稳定引用，部分导出排除范围外建议；旧作品无需迁移',async()=>{
 const x=await setup(),r=await submit(x);const backup=await x.call('novel.export');validateWriting(backup.novel);
 const restored=await x.call('novel.import',{backup:{...backup,novel:{...backup.novel,id:'review-import-copy'}}});assert.ok(restored.id);
 const source=backup.novel,target=structuredClone(source),maps={nodes:new Map(Object.keys(source.nodes).map(id=>[id,'n-'+id])),chapters:new Map(Object.keys(source.chapters).map(id=>[id,'c-'+id])),planning:new Map(),edges:new Map()};
 target.nodes=Object.fromEntries(Object.values(target.nodes).map(v=>[maps.nodes.get(v.id),{...v,id:maps.nodes.get(v.id)}]));target.chapters=Object.fromEntries(Object.values(target.chapters).map(v=>[maps.chapters.get(v.id),{...v,id:maps.chapters.get(v.id)}]));delete target.writing;copyWriting(source,target,maps);validateWriting(target);const copy=Object.values(target.writing.reviews)[0];assert.notEqual(copy.id,r.id);assert.equal(copy.chapterId,maps.chapters.get(x.ch.id));assert.equal(copy.items[0].nodeId,maps.nodes.get(x.person.id));assert.equal(copy.items[3].value.evidence[0].chapterId,maps.chapters.get(x.ch.id));
 const sliced=structuredClone(source);delete sliced.nodes[x.other.id];delete sliced.writing;assert.ok(sliceWriting(source,sliced).omitted>0);assert.equal(Object.keys(sliced.writing.reviews).length,0);assert.equal((await x.call('chapter.get',{chapterId:x.ch.id})).content,x.ch.content);
});

test('重复计划出场合法，混合引用去重并保留出场计划；不变成正式首次出场',async()=>{
 const x=await setup(),args=candidates(x),event=args.items[2];
 const items=['enter1','enter2'].map(id=>({...event,id,value:{...event.value,memoryRefs:[x.person.id,x.other.id],enteringRefs:[x.person.id]}}));
 const r=await submit(x,{...args,items});
 const done=await x.call('writing.review.apply',{id:r.id,expectedRevision:r.revision,itemIds:items.map(i=>i.id),confirmed:true,requestId:'repeat-cast'});
 const cards=Object.values((await x.call('story.get')).state.cards);assert.equal(cards.length,2);
 for(const card of cards){assert.deepEqual(card.cast,[{nodeId:x.person.id,kind:'appearance'},{nodeId:x.other.id,kind:'mention'}]);assert.equal(card.evidence[0].evidence,event.evidence);}
 assert.ok(done.items.every(i=>cards.some(c=>c.id===i.result.id)));
 assert.equal((await x.call('writing.link.list')).length,0);assert.equal((await x.call('writing.card.get',{nodeId:x.person.id})).firstAppearance,null);
});
test('事件预览与采用都校验引用及原文，不接受已删除资料或伪造证据',async()=>{
 const x=await setup(),args=candidates(x),event=args.items[2];
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{...event,value:{...event.value,enteringRefs:['missing']}}]}),{code:'NOT_FOUND'});
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{...event,evidence:'伪造原文'}]}));
 const r=await submit(x,{...args,items:[event]});
 await x.call('graph.update',{nodeId:x.person.id,expectedRevision:x.person.revision,name:'已变更'});
 await assert.rejects(x.call('writing.review.apply',{id:r.id,expectedRevision:r.revision,itemIds:[event.id],confirmed:true,requestId:'changed-ref'}),{code:'CONFLICT'});
 assert.equal(Object.keys((await x.call('story.get')).state.cards).length,0);
 await x.call('graph.delete',{nodeId:x.other.id,expectedRevision:x.other.revision,confirm:true});
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{...event,value:{...event.value,enteringRefs:[x.other.id]}}]}),{code:'INVALID_WRITING'});
});
test('回收依据本身只推进至部分回收，显式完成仍须埋设与回收原文',async()=>{
 const x=await setup(),args=candidates(x),base=args.items[3].value;
 const evidence=[...base.evidence,{...base.evidence[0],kind:'recover'}];
 const r=await submit(x,{...args,items:[{id:'partial',kind:'foreshadow',value:{...base,evidence}}]});
 const done=await x.call('writing.review.apply',{id:r.id,expectedRevision:r.revision,itemIds:['partial'],confirmed:true,requestId:'partial',reason:'仅校验候选，不保存'});
 const shadow=await x.call('writing.foreshadow.get',{id:done.items[0].result.id});assert.equal(shadow.status,'partial');assert.equal(shadow.resolution,'active');assert.equal(shadow.plotNodes.length,2);
 await assert.rejects(x.call('writing.review.preview',{...args,items:[{id:'invalid-complete',kind:'foreshadow',value:{...base,resolution:'complete'}}]}),{code:'INVALID_WRITING'});
});

test('AI 可预览并提交映射后候选，但不写正式事实',async()=>{
 const x=await setup(),args={novelId:x.s.novelId,...candidates(x)},before=await x.call('novel.export');
 const p=await x.s.rpc('writing.review.preview',args,'candidate-agent','agent');
 assert.deepEqual((await x.call('novel.export')).novel,before.novel);
 const r=await x.s.rpc('writing.review.submit',{...args,proof:p.proof,requestId:'agent-submit'},'candidate-agent','agent');
 assert.equal(r.items.length,4);assert.ok(r.items.every(i=>i.state==='pending'));
 assert.equal(Object.keys((await x.call('story.get')).state.cards).length,0);assert.equal((await x.call('writing.foreshadow.list')).length,0);assert.equal((await x.call('writing.link.list')).length,0);
});
test('只改说明的候选保留已有旧格式完成或放弃决定，不静默重新激活',async()=>{
 for(const status of ['recovered','abandoned']){
  const x=await setup(),args=candidates(x),base=args.items[3].value;
  const evidence=status==='recovered'?[...base.evidence,{...base.evidence[0],kind:'recover'}]:base.evidence;
  const old=await x.call('writing.foreshadow.create',{value:{...base,status,evidence,abandonReason:status==='abandoned'?'作者保留开放线索':''},confirmed:true});
  assert.equal(old.resolution,undefined);
  const r=await submit(x,{...args,items:[{id:'note',kind:'foreshadow',targetId:old.id,expectedRevision:old.revision,value:{content:'只改说明'}}]});
  await x.call('writing.review.apply',{id:r.id,expectedRevision:r.revision,itemIds:['note'],confirmed:true,requestId:'note'});
  const next=await x.call('writing.foreshadow.get',{id:old.id});assert.equal(next.status,status);assert.equal(next.content,'只改说明');assert.equal(next.abandonReason,old.abandonReason);
 }
});
