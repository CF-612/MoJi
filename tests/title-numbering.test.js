import test from 'node:test';
import assert from 'node:assert/strict';
import {chineseNumber,nextNumberedTitle,nextChapterTitle,numberedTitle} from '../src/domain/title-numbering.js';
test('中文卷章编号、已有编号与分卷计数；手写番外保留并允许删除前缀',()=>{
 for(const [n,s]of [[1,'一'],[10,'十'],[11,'十一'],[20,'二十'],[101,'一百零一'],[110,'一百一十'],[1001,'一千零一']])assert.equal(chineseNumber(n),s);
 assert.equal(nextNumberedTitle([{title:'第十二卷 夜航'},{title:'番外'}],'卷'),'第十三卷');assert.equal(nextChapterTitle([{title:'第十章',volumeId:'v'},{title:'第九十章',volumeId:'other'}],'v'),'第十一章');assert.equal(numberedTitle(undefined,'第一章'),'第一章');assert.equal(numberedTitle('番外','第三章'),'番外');assert.equal(numberedTitle('归来','第三章',true),'第三章 归来');assert.equal(numberedTitle('第三章 归来','第四章',true),'第三章 归来');assert.equal(numberedTitle('归来','第三章',false),'归来');
});
