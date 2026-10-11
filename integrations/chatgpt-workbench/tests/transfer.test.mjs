import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createService} from '../server/service.mjs';

test('批量导入先预览、原子保存、去重、正文往返、损坏拒绝与替换恢复',async()=>{
  const base=resolve(import.meta.dirname,'../.data/tests');await mkdir(base,{recursive:true});
  const service=await createService(await mkdtemp(join(base,'transfer-')));
  const rpc=(action,args={})=>service.rpc(action,args,'import-test','human');
  const content='　　“雨停了。”——她说。\n\n　　窗外还有灯。';
  const file={name:'批量.json',json:{format:'cuigengji-batch',version:1,files:[
    {file:{name:'01.txt',text:content},kind:'chapters'},
    {file:{name:'林照.md',text:'## 性格\n珍惜朋友。'},kind:'character'},
    {file:{name:'明日邮局.md',text:'午夜收到次日来信。'},kind:'world'},
    {file:{name:'要求.md',text:'保持标点与段落。'},kind:'preset'},
    {file:{name:'情节.md',text:'收到来信。'},kind:'planning'},
  ]}};
  const options={mode:'copy',title:'批量演示'};
  const preview=await rpc('transfer.preview',{file,options});assert.ok(preview.valid);assert.equal(preview.counts.chapters,1);assert.equal(preview.counts.memory,2);
  assert.equal((await rpc('novel.list')).length,1,'预览不写入');
  const args={file,options,proof:preview.proof,requestId:crypto.randomUUID()};
  const done=await rpc('transfer.import',args);const novelId=done.novelIds[0];
  assert.ok((await rpc('transfer.import',args)).repeated);assert.equal((await rpc('novel.list')).length,2);
  const chapters=await rpc('chapter.list',{novelId}),chapterId=chapters[0].id;
  assert.equal((await rpc('chapter.get',{novelId,chapterId})).content,content);
  const nodes=await rpc('graph.list',{novelId});assert.equal(nodes.filter(n=>n.type==='character_card').length,1);assert.equal(nodes.filter(n=>n.type==='world_entry').length,1);
  const backup=await rpc('transfer.export',{selection:{kind:'works',novelIds:[novelId]},format:'package'});
  const restoreFile={name:backup.filename,text:backup.content};
  const before=await rpc('chapter.get',{novelId,chapterId});await rpc('chapter.update',{novelId,chapterId,expectedRevision:before.revision,content:'新的正文'});
  assert.equal((await rpc('transfer.preview',{file:restoreFile,options:{mode:'restore'}})).valid,false,'默认不覆盖已有不同内容');
  const restoreOptions={mode:'restore',replaceExisting:true};
  const restore=await rpc('transfer.preview',{file:restoreFile,options:restoreOptions});assert.deepEqual(restore.replaced,['批量演示']);
  const current=await rpc('chapter.get',{novelId,chapterId});
  await rpc('transfer.import',{file:restoreFile,options:restoreOptions,proof:restore.proof,requestId:crypto.randomUUID()});
  const restored=await rpc('chapter.get',{novelId,chapterId});assert.equal(restored.content,content);assert.ok(restored.revision>current.revision);
  await assert.rejects(rpc('chapter.update',{novelId,chapterId,expectedRevision:current.revision,content:'旧页面覆盖'}),{code:'CONFLICT'});
  const snapshots=await rpc('transfer.snapshots');assert.ok(snapshots.length>=2);assert.ok((await rpc('transfer.inspect',{file:await rpc('transfer.snapshot.get',{id:snapshots[0].id})})).restorable);
  const damaged=JSON.parse(backup.content);damaged.payload.projects[0].title='被改过';
  await assert.rejects(rpc('transfer.preview',{file:{name:'bad.json',json:damaged},options:{mode:'restore'}}));
  const invalid={name:'batch.json',json:{format:'cuigengji-batch',version:1,files:[{file:{name:'ok.txt',text:'可读'},kind:'auto'},{file:{name:'bad.json',text:'broken'},kind:'auto'}]}};
  await assert.rejects(rpc('transfer.preview',{file:invalid,options:{targetId:novelId}}));assert.equal((await rpc('chapter.list',{novelId})).length,1,'坏文件不能导致部分导入');
  const compressed={name:'large.txt',gzipBase64:gzipSync('　　夜色。\n\n'.repeat(180000)).toString('base64')};
  const large=await rpc('transfer.preview',{file:compressed,options:{mode:'copy',title:'长篇容量测试'}});assert.ok(large.valid);
});
