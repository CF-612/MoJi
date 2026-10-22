import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {chapterToolsStyle} from '../vendor/cuigengji/src/client/features/chapters/chapter-tools-style.mjs';
const client=new URL('../vendor/cuigengji/src/client/',import.meta.url);
const read=path=>readFile(new URL(path,client),'utf8');

test('chapter actions are categorized and use secondary pages, without adding unsupported commands',async()=>{
 const tools=await read('features/chapters/ChapterTools.jsx');
 for(const label of ['常用','外观','章节'])assert.ok(tools.includes(`aria-label="${label}"`));
 for(const label of ['查找与替换','本章资料','整理建议','围绕此内容讨论','字体字号'])assert.ok(tools.includes(label));
 assert.match(tools,/page==='display'&&<ChapterTypography/);
 assert.match(tools,/page==='find'&&<ProseFind \{\.\.\.find\} embedded onBusyChange=/);
 assert.doesNotMatch(tools,/屏幕方向|起名助手|长图分享|同步备份/);
 const editor=await read('features/chapters/index.jsx');
 assert.match(editor,/<ChapterTools/);
 assert.match(editor,/<ChapterOperations icons/);
 assert.doesNotMatch(editor,/<ToolSheet label="正文其他操作"/);
 const operations=await read('features/chapters/ChapterOperations.jsx');
 for(const icon of ['edit','download','history','trash','refresh'])assert.ok(operations.includes(`<Icon name="${icon}"/>`));
 // Existing save/concurrency boundaries are preserved when opening find and export.
 assert.match(editor,/if\(conflict\)throw new Error\('请先合并正文冲突'\);await save\(\)/);
 assert.match(operations,/disabled=\{busy\|\|dirty\}/);
});

test('native chapter dialog retains focus, Escape, explicit back/close, and busy guards',async()=>{
 const tools=await read('features/chapters/ChapterTools.jsx');
 assert.match(tools,/dialog\.showModal\(\)/);
 assert.match(tools,/dialog\.close\(\);if\(previous\?\.isConnected\)previous\.focus\(\{preventScroll:true\}\)/);
 assert.match(tools,/onCancel=\{e=>\{e\.preventDefault\(\);if\(!working\)close\(\);\}\}/);
 assert.match(tools,/aria-label="返回正文选项" disabled=\{working\}/);
 assert.match(tools,/aria-label=\{`关闭\$\{title\}`\} disabled=\{working\}/);
 assert.match(tools,/outsidePress\.current&&outside\(e\)/);
 assert.match(tools,/\[data-tool="\$\{returnTo\}"\]/);
 const find=await read('features/chapters/ProseFind.jsx');
 assert.match(find,/onBusyChange\?\.\(busy\)/);
 assert.match(find,/return embedded\?content:<Modal/);
 assert.match(find,/const request=receipt\|\|\{/);
 assert.match(find,/fingerprint:preview\.fingerprint,confirmed:true,requestId:crypto\.randomUUID\(\)/);
});

test('typography continues using persisted supported sizes and leading values',async()=>{
 const tools=await read('features/chapters/ChapterTools.jsx');
 assert.match(tools,/useWorkbenchPreferences\(\)/);
 assert.match(tools,/type="range" min="16" max="22" step="2"/);
 assert.match(tools,/\[\[1\.7,'紧凑'\],\[1\.95,'适中'\],\[2\.2,'宽松'\]\]/);
 assert.match(tools,/fontSize:defaults\.fontSize,leading:defaults\.leading/);
 assert.match(tools,/role="status"/);
});

test('chapter sheet has responsive geometry, keyboard/host bounds and scrollable safe-area content',async()=>{
 assert.match(chapterToolsStyle,/@media\(max-width:600px\)/);
 assert.match(chapterToolsStyle,/bottom:calc\(100dvh - var\(--cg-visible-height,100dvh\) \+ var\(--cg-host-bottom,0px\)\)/);
 assert.match(chapterToolsStyle,/border-radius:20px 20px 0 0/);
 assert.match(chapterToolsStyle,/data-host-platform=mobile.*--chapter-tools-top:max\(52px/);
 assert.match(chapterToolsStyle,/\.chapter-tool-content\{min-height:0;overflow:auto;overscroll-behavior:contain/);
 assert.match(chapterToolsStyle,/env\(safe-area-inset-bottom\)/);
 assert.match(chapterToolsStyle,/repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(chapterToolsStyle,/@container chapter-tools \(max-width:330px\)/);
 assert.match(chapterToolsStyle,/background:var\(--cg-paper\);color:var\(--cg-ink\)/);
 assert.deepEqual((await transform(chapterToolsStyle,{loader:'css'})).warnings,[]);
});
