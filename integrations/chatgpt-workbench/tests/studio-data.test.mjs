import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createService} from '../server/service.mjs';
import {chapterChanges,mergeChapter} from '../vendor/cuigengji/src/client/features/chapters/sync.ts';
const base=resolve(import.meta.dirname,'../.data/tests');await mkdir(base,{recursive:true});
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=';
test('创建空白章节可原子保存梗概、已有及新人物、占位事件，失败不残留章节或人物',async()=>{
 const s=await createService(await mkdtemp(join(base,'chapter-quick-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'studio','human');
 const person=await call('graph.create',{type:'character_card',name:'已有角色'});
 const c=await call('chapter.create',{title:'占位章',content:'',summary:'梗概',characters:[{nodeId:person.id,name:person.name},{name:'新角色'}],events:[{title:'',storyTime:'清晨',content:''}]});
 assert.equal((await call('chapter.get',{chapterId:c.id})).summary,'梗概');
 const links=await call('writing.link.list',{chapterId:c.id});assert.equal(links.length,2);assert.ok(links.every(l=>l.manual&&l.kind==='appearance'&&!l.review));
 const events=await call('writing.event.list',{chapterId:c.id});assert.equal(events.length,1);assert.equal(events[0].title,'未命名事件');assert.equal(events[0].planned,true);assert.equal(events[0].chapterRefs[0].chapterId,c.id);
 const before=await call('chapter.list'),nodes=await call('graph.list');
 await assert.rejects(call('chapter.create',{title:'失败章',characters:[{name:'不应残留'}],events:[{title:123}]}));
 assert.equal((await call('chapter.list')).length,before.length);assert.equal((await call('graph.list')).length,nodes.length);
 await assert.rejects(s.rpc('writing.link.create',{novelId:s.novelId,chapterId:c.id,nodeId:person.id,kind:'appearance',expectedChapterRevision:c.revision,manual:true,confirmed:true,evidence:''},'agent','agent'),{code:'HUMAN_REQUIRED'});
 const backup=await call('novel.export');const dest=await createService(await mkdtemp(join(base,'quick-import-')));assert.equal((await dest.rpc('novel.import',{backup},'studio','human')).imported,true);
});
test('封面、像素显示与头像完整跨重启／导出保存，拒绝非图片输入',async()=>{
 const folder=await mkdtemp(join(base,'studio-images-')),s=await createService(folder),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'studio','human');
 const novel=await call('novel.get');await call('novel.update',{expectedRevision:novel.revision,coverImage:image,coverMode:'pixel',genre:'奇幻小说'});
 const person=await call('graph.create',{type:'character_card',name:'试验人物',avatarImage:image});
 const reopened=await createService(folder),books=await reopened.rpc('novel.list',{},'studio','human');assert.equal(books[0].coverImage,image);assert.equal(books[0].coverMode,'pixel');assert.equal(books[0].genre,'奇幻小说');
 assert.equal((await call('graph.get',{nodeId:person.id})).avatarImage,image);
 assert.equal((await reopened.bootstrap('studio')).books[0].coverImage,undefined);
 assert.equal((await reopened.rpc('novel.list',{},'model','agent'))[0].coverImage,undefined);
 const exported=await call('novel.export');assert.equal(exported.novel.coverImage,image);assert.equal(exported.novel.nodes[person.id].avatarImage,image);
 const current=await call('novel.get');await assert.rejects(call('novel.update',{expectedRevision:current.revision,coverImage:'data:image/svg+xml;base64,PHN2Zz4='}),{code:'INVALID_IMAGE'});
 assert.equal((await call('novel.get')).coverImage,image);
});
test('Summary 独立保存、保留正文哈希，历史恢复包含梗概且兼容旧备份',async()=>{
 const s=await createService(await mkdtemp(join(base,'studio-summary-'))),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'studio','human');
 const chapter=await call('chapter.get',{chapterId:s.chapterId});await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,summary:'最初梗概'});
 const one=await call('chapter.get',{chapterId:chapter.id});assert.equal(one.content,chapter.content);assert.equal(one.contentHash,chapter.contentHash);assert.equal(one.summary,'最初梗概');
 await call('chapter.update',{chapterId:chapter.id,expectedRevision:one.revision,summary:'后来梗概'});const two=await call('chapter.get',{chapterId:chapter.id});
 await call('chapter.restore',{chapterId:chapter.id,expectedRevision:two.revision,targetRevision:one.revision});assert.equal((await call('chapter.get',{chapterId:chapter.id})).summary,'最初梗概');
 const history=await call('chapter.history',{chapterId:chapter.id});assert.equal(history.find(v=>v.revision===one.revision).summary,'最初梗概');
 const backup=await call('novel.export');for(const c of Object.values(backup.novel.chapters)){delete c.summary;for(const v of c.versions)delete v.summary;}
 const dest=await createService(await mkdtemp(join(base,'studio-legacy-')));assert.equal((await dest.rpc('novel.import',{backup},'legacy','human')).imported,true);
});
test('Summary 自动保存差量与正文独立三方合并，不覆盖远端梗概',()=>{
 const base={id:'c',revision:1,contentHash:'a',deleted:false,title:'一章',content:'原文',summary:'旧梗概',volumeId:null,order:0};
 assert.deepEqual(chapterChanges({...base,summary:'新梗概'},base),{summary:'新梗概'});
 const merged=mergeChapter(base,{...base,content:'修改正文'},{...base,revision:2,summary:'远端梗概'});assert.equal(merged.content,'修改正文');assert.equal(merged.summary,'远端梗概');
 assert.equal(mergeChapter(base,{...base,summary:'作者梗概'},{...base,summary:'AI梗概'}),null);
});
