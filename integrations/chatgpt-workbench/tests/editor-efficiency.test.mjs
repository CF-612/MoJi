import test from 'node:test';
import assert from 'node:assert/strict';
import {quickInsertion,normalizeQuickPhrases,moveQuickPhrase,quickPhrasesKey} from '../vendor/cuigengji/src/client/features/chapters/quick-input.mjs';
import {createWritingSession,reconcileWritingDocument,advanceWritingSession,suspendWritingSession,recordWritingEdit,writingMetrics} from '../vendor/cuigengji/src/client/features/chapters/writing-session.mjs';
import {wrapShareText,paginateShareLines,shareFilename,paintSharePage} from '../vendor/cuigengji/src/client/features/chapters/long-image.mjs';
import {efficiencyStyle} from '../vendor/cuigengji/src/client/features/chapters/efficiency-style.mjs';
import {transform} from 'esbuild';
import {readFile} from 'node:fs/promises';

test('quick pairs position caret inside; wrapping preserves a selection and never edits input',()=>{
 const original='甲乙\n　丙';assert.deepEqual(quickInsertion(original,1,1,'“','”'),{content:'甲“”乙\n　丙',insert:'“”',start:2,end:2});
 assert.deepEqual(quickInsertion(original,1,2,'（','）'),{content:'甲（乙）\n　丙',insert:'（乙）',start:2,end:3});
 assert.equal(original,'甲乙\n　丙');assert.deepEqual(quickInsertion('甲乙',1,2,'……'),{content:'甲……',insert:'……',start:3,end:3});
 assert.equal(quickInsertion('甲',-5,999,'人名').content,'人名');
});
test('phrases retain meaningful whitespace, validate, reorder without mutation and isolate works',()=>{
 const raw=[{id:'1',text:'　别来无恙。\n'}, {id:'2',text:'人名'}, {id:'2',text:'duplicate'}, {id:'3',text:'   '}];
 const phrases=normalizeQuickPhrases(raw);assert.equal(phrases.length,2);assert.equal(phrases[0].text,'　别来无恙。\n');
 assert.deepEqual(moveQuickPhrase(phrases,0,1).map(p=>p.id),['2','1']);assert.deepEqual(phrases.map(p=>p.id),['1','2']);
 assert.deepEqual(moveQuickPhrase(phrases,-1,1),phrases);assert.notEqual(quickPhrasesKey('a','book1'),quickPhrasesKey('a','book2'));assert.notEqual(quickPhrasesKey('a','book1'),quickPhrasesKey('b','book1'));
});
const edit=(session,before,after,inputType='insertText',now=1000,key='a')=>recordWritingEdit(session,{key,before,after,inputType,now});
test('session starts only on changed prose, idles at 30 seconds and pauses at 20 minutes',()=>{
 let session=reconcileWritingDocument(createWritingSession(),'a','旧稿');assert.equal(writingMetrics(session,10000).status,'未开始');
 session=edit(session,'旧稿','旧稿新增','insertText',1000);assert.equal(writingMetrics(session,1000).net,2);assert.equal(writingMetrics(session,1000).perMinute,2);
 let metrics=writingMetrics(session,31000);assert.equal(metrics.status,'空闲');assert.equal(metrics.activeMs,30000);assert.equal(metrics.idleMs,0);
 session=advanceWritingSession(session,61000);metrics=writingMetrics(session,61000);assert.equal(metrics.activeMs,30000);assert.equal(metrics.idleMs,30000);
 metrics=writingMetrics(session,1201000);assert.equal(metrics.status,'已暂停');assert.equal(metrics.idleMs,1170000);
 assert.deepEqual(writingMetrics(session,2401000),metrics);
 session=edit(session,'旧稿新增','旧稿新增又','insertText',2401000);assert.equal(writingMetrics(session,2402000).activeMs,31000);
});
test('pasting is separated from handwriting speed; deleting pasted text and undo/redo preserve attribution',()=>{
 let session=edit(createWritingSession(),'原稿','原稿甲','insertText',1000);
 session=edit(session,'原稿甲','原稿甲复制复制','insertFromPaste',2000);let m=writingMetrics(session,2000);assert.equal(m.net,5);assert.equal(m.typed,1);assert.equal(m.pasted,4);
 session=edit(session,'原稿甲复制复制','原稿甲复制','deleteContentBackward',3000);m=writingMetrics(session,3000);assert.equal(m.net,3);assert.equal(m.typed,1);assert.equal(m.pasted,2);
 session=edit(session,'原稿甲复制','原稿甲复制复制','historyUndo',4000);assert.equal(writingMetrics(session,4000).typed,1);assert.equal(writingMetrics(session,4000).pasted,4);
 session=edit(session,'原稿甲复制复制','原稿甲复制','historyRedo',5000);assert.equal(writingMetrics(session,5000).pasted,2);
 session=edit(session,'原稿甲复制','原稿甲复制乙','insertText',6000);assert.equal(writingMetrics(session,6000).typed,2);
});
test('net changes cannot be inflated by repeatedly replacing, deleting, undoing, or by programmatic restore',()=>{
 let session=edit(createWritingSession(),'原稿','新稿');assert.equal(writingMetrics(session).net,0);
 session=edit(session,'新稿','新稿甲');assert.equal(writingMetrics(session).net,1);
 session=edit(session,'新稿甲','新稿','historyUndo');assert.equal(writingMetrics(session).net,0);
 session=edit(session,'新稿','新稿甲','historyRedo');assert.equal(writingMetrics(session).net,1);
 session=reconcileWritingDocument(session,'a','恢复的很长很长的旧版本');assert.equal(writingMetrics(session).net,0);
});
test('Unicode code points, whitespace and chapter totals are counted consistently; background is paused',()=>{
 let session=edit(createWritingSession(),'','甲😀\n　。','insertText',1000);assert.equal(writingMetrics(session,1000).net,3);
 session=edit(session,'','乙','insertText',2000,'b');assert.equal(writingMetrics(session,2000).net,4);
 session=suspendWritingSession(session,3000);assert.equal(writingMetrics(session,600000).activeMs,2000);assert.equal(writingMetrics(session,600000).status,'已暂停');
 session=edit(session,'乙','乙丙','insertText',700000,'b');assert.equal(writingMetrics(session,701000).activeMs,3000);
});
test('long image wraps without removing explicit blank lines, whitespace or Unicode; pagination is bounded',()=>{
 const original='　甲乙😀\n\n丙';const lines=wrapShareText(original,3,value=>Array.from(value).length);assert.deepEqual(lines,['　甲乙','😀','','丙']);
 const pages=paginateShareLines(Array.from({length:400},(_,i)=>String(i)),{maxHeight:900,fontSize:40,titleLines:['测试章']});assert.ok(pages.length>1);assert.ok(pages.every(page=>page.height<=900));assert.deepEqual(pages.flatMap(page=>page.lines),Array.from({length:400},(_,i)=>String(i)));assert.equal(original,'　甲乙😀\n\n丙');assert.deepEqual(wrapShareText('甲👩‍👩‍👧乙',2,value=>value.length),['甲','👩‍👩‍👧','乙']);
 assert.throws(()=>paginateShareLines(['甲'],{maxHeight:10}),/尺寸过小/);assert.equal(shareFilename('章/节',0,2),'章_节-1-2.png');
});
test('share painter draws the exact planned text without needing DOM mutation',()=>{
 const texts=[],context={fillRect(){},fillText(...args){texts.push(args);}},canvas={getContext:()=>context};const [page]=paginateShareLines(['　甲','乙'],{titleLines:['第一章']});
 paintSharePage(canvas,page,0,1);assert.equal(canvas.width,1080);assert.equal(canvas.height,page.height);assert.deepEqual(texts.map(row=>row[0]),['第一章','　甲','乙','墨叽 · 1 / 1']);
});
test('new UI modules and isolated styles compile',async()=>{
 for(const name of ['QuickInput','WritingSession','LongImageExport']){const source=await readFile(new URL(`../vendor/cuigengji/src/client/features/chapters/${name}.jsx`,import.meta.url),'utf8');assert.deepEqual((await transform(source,{loader:'jsx'})).warnings,[]);}
 assert.deepEqual((await transform(efficiencyStyle,{loader:'css'})).warnings,[]);
});
