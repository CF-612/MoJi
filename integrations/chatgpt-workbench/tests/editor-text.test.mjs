import test from 'node:test';
import assert from 'node:assert/strict';
import {proseMatches,replaceMatch,chapterCopy,manuscriptCount,formatManuscript,canUndoTransform} from '../vendor/cuigengji/src/client/features/chapters/editor-text.mjs';
import {editorDefaults,normalizeEditorPreferences,proseAppearance} from '../vendor/cuigengji/src/client/shared/editor-preferences.mjs';
import {mapSelection} from '../vendor/cuigengji/src/client/features/chapters/selection.ts';
import {transform} from 'esbuild';
import {chapterToolsStyle} from '../vendor/cuigengji/src/client/features/chapters/chapter-tools-style.mjs';

test('complete exact match index uses textarea offsets, no preview cap, no overlap or empty-query loop',()=>{
 assert.deepEqual(proseMatches('甲😀甲\n甲','甲'),[{start:0,end:1},{start:3,end:4},{start:5,end:6}]);
 assert.equal(proseMatches('雨夜。'.repeat(57),'雨夜').length,57);
 assert.deepEqual(proseMatches('aaaaa','aa'),[{start:0,end:2},{start:2,end:4}]);
 assert.deepEqual(proseMatches('正文',''),[]);
 assert.deepEqual(proseMatches('甲\n乙\n甲\n乙','甲\n乙'),[{start:0,end:3},{start:4,end:7}]);
});
test('replace-current is exact and guarded; undo cannot replace subsequent fresh typing',()=>{
 const before='甲乙甲乙',match=proseMatches(before,'甲乙')[1],after=replaceMatch(before,match,'甲乙','丙');
 assert.equal(after,'甲乙丙');assert.equal(before,'甲乙甲乙');
 assert.throws(()=>replaceMatch('甲乙新稿',match,'甲乙','丙'),/已变化/);
 assert.ok(canUndoTransform({before,after},after));assert.equal(canUndoTransform({before,after},after+'新稿'),false);
 assert.deepEqual(mapSelection(before,after,{start:0,end:2,direction:'forward'}),{start:0,end:2,direction:'forward'});
});
test('four copies never mutate draft; compact removes only blank lines and preserves nonempty indentation',()=>{
 const title='第一章 测试',content='　　雨夜。\r\n \t　\r\n  next  \r\n\r\n\t末段！';
 assert.equal(chapterCopy(title,content,'all'),title+'\n\n'+content);assert.equal(chapterCopy(title,content,'title'),title);assert.equal(chapterCopy(title,content,'body'),content);
 assert.equal(chapterCopy(title,content,'compact'),'　　雨夜。\n  next  \n\t末段！');
 assert.equal(chapterCopy(title,'','compact'),'');assert.equal(content,'　　雨夜。\r\n \t　\r\n  next  \r\n\r\n\t末段！');
});
test('explicit paragraph transforms honor options and display counters use Unicode characters',()=>{
 const source='  甲  乙 \n\n\t丙。\n';
 assert.equal(formatManuscript(source),'　　甲 乙\n\n　　丙。');
 assert.equal(formatManuscript(source,{indent:'preserve',blankLines:0,trimSpaces:false}),'  甲  乙 \n\t丙。');
 assert.equal(manuscriptCount('甲， A😀\n'),4);assert.equal(manuscriptCount('甲， A😀\n',false),2);
});
test('device display defaults are conservative and malformed values cannot remove safety padding or inject CSS',()=>{
 const p=normalizeEditorPreferences({fontSize:99,leading:0,bottomSpace:0,mobilePageMargin:-10,fontColor:'red;position:fixed',fontFamily:'url(evil)',backdropBlur:'true',fontWeight:999});
 assert.equal(editorDefaults.backdropBlur,false);assert.equal(p.fontSize,32);assert.equal(p.leading,1.3);assert.equal(p.bottomSpace,16);assert.equal(p.mobilePageMargin,4);assert.equal(p.fontColor,'auto');assert.equal(p.fontFamily,'system');assert.equal(p.backdropBlur,false);assert.equal(p.fontWeight,400);
 assert.equal(proseAppearance(normalizeEditorPreferences({fontItalic:true,fontUnderline:true,fontColor:'#abcdef'})).fontStyle,'italic');
});
test('editor tools CSS parses without syntax warnings',async()=>assert.deepEqual((await transform(chapterToolsStyle,{loader:'css'})).warnings,[]));
