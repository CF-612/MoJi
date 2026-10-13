import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createService} from '../server/service.mjs';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const folder=await mkdtemp(join(root,'titles-'));
test('共享服务创建编号默认值、分卷重置、可选自动前缀和原文原样保留',async()=>{
 const s=await createService(join(folder,'titles')),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'titles','human'),v=await call('volume.create');assert.equal(v.title,'第一卷');const c=await call('chapter.create',{volumeId:v.id,content:'保留正文'});assert.equal(c.title,'第一章');assert.equal((await call('chapter.get',{chapterId:c.id})).content,'保留正文');assert.equal((await call('chapter.create',{volumeId:v.id,title:'相遇',autoNumber:true})).title,'第二章 相遇');assert.equal((await call('chapter.create',{volumeId:v.id,title:'番外'})).title,'番外');assert.equal((await call('chapter.create',{volumeId:v.id})).title,'第四章');await assert.rejects(call('chapter.create',{autoNumber:'yes'}),{code:'INVALID_INPUT'});assert.equal((await call('chapter.get',{chapterId:s.chapterId})).title,'第一章 雨夜来信');
});
