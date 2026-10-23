import test from 'node:test';
import assert from 'node:assert/strict';
import {ChapterSync,chapterChanges} from '../vendor/cuigengji/src/client/features/chapters/sync.ts';
import {displayNumberedTitle} from '../vendor/cuigengji/src/domain/title-numbering.js';

test('手动合并正文后保留远端最新分卷及顺序，自动保存不回写旧位置',async t=>{
 const initial={id:'c',title:'第一章',content:'旧正文',summary:'',revision:1,contentHash:'h1',deleted:false,volumeId:null,order:10};
 const remote={...initial,revision:2,contentHash:'h2',content:'远端正文',volumeId:'new-volume',order:70};
 let sent;
 const sync=new ChapterSync({initial,key:'review',storage:{getItem:()=>null,setItem(){},removeItem(){}},read:async()=>remote,write:async(value,base)=>{sent=chapterChanges(value,base);return {...value,revision:3};},onSaved(){},delay:60000});
 t.after(()=>sync.dispose());
 sync.change(v=>({...v,content:'手动合并正文'}));sync.rebase(remote);await sync.flush();
 assert.equal(sync.state.value.content,'手动合并正文');
 assert.equal(sync.state.value.volumeId,'new-volume');assert.equal(sync.state.value.order,70);
 assert.deepEqual(sent,{content:'手动合并正文'});
});
test('卷章复合标签统一编号，不改变自由标题内的数字',()=>{
 assert.equal(displayNumberedTitle('第二卷 晴天 · 第七章 窗外的雨','arabic'),'第2卷 晴天 · 第7章 窗外的雨');
 assert.equal(displayNumberedTitle('未分卷 · 第七章 窗外的雨','arabic'),'未分卷 · 第7章 窗外的雨');
 assert.equal(displayNumberedTitle('回忆第七章的约定','arabic'),'回忆第七章的约定');
});
