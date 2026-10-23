import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const source=name=>readFile(new URL(`../vendor/cuigengji/src/client/features/chapters/${name}`,import.meta.url),'utf8');
async function loadIcons(){const src=(await source('ChapterToolIcon.jsx')).replace("import React from 'react';",'').replaceAll('export ','');const {code}=await transform(src+'\nreturn {chapterToolIcons,ChapterToolIcon};',{loader:'jsx'});return new Function('React',code)(React);}
test('dedicated action icons all render, are distinct, and are decorative beside text labels',async()=>{
 const {chapterToolIcons,ChapterToolIcon}=await loadIcons();const seen=new Set();
 for(const name of Object.keys(chapterToolIcons)){
  const html=renderToStaticMarkup(React.createElement(ChapterToolIcon,{name}));
  assert.match(html,/viewBox="0 0 24 24"/);assert.match(html,/aria-hidden="true"/);assert.match(html,/focusable="false"/);assert.match(html,/<path/);
  const geometry=html.replace(/data-chapter-icon="[^"]+"/,'');assert.ok(!seen.has(geometry),`duplicate geometry for ${name}`);seen.add(geometry);
 }
 assert.equal(seen.size,19);
});
test('all menu pictograms resolve; commonly confused functions have dedicated identities',async()=>{
 const src=await source('ChapterTools.jsx'),ops=await source('ChapterOperations.jsx');const {chapterToolIcons}=await loadIcons();
 for(const [,id]of (src+ops).matchAll(/<ChapterToolIcon name="([^"]+)"/g))assert.ok(chapterToolIcons[id],id);
 for(const [,id]of src.matchAll(/button\('[^']+','[^']+','([^']+)'/g))assert.ok(chapterToolIcons[id],id);
 for(const [label,id]of [['码字时速','speed'],['快捷输入','quick'],['长图分享','share'],['快捷复制','copy'],['页面布局','layout']])assert.ok(src.includes(`'${label}','${id}'`));
 assert.match(ops,/name="export"/);assert.match(src,/name="backup"/);assert.match(src,/name="history"/);
});
test('materials appears only in chapter/data and existing callbacks remain available',async()=>{
 const src=await source('ChapterTools.jsx');assert.equal(src.split('本章资料').length-1,1);
 const data=src.slice(src.indexOf('<h3>章节与数据</h3>'));assert.match(data,/onClick=\{onMaterials\}/);assert.match(data,/本章资料/);
 assert.ok(!src.slice(0,src.indexOf('<h3>章节与数据</h3>')).includes('本章资料'));
 for(const handler of ['onHistory','onReview','onUndoFormat'])assert.match(src,new RegExp(`action\\([^)]*${handler}`));
 assert.match(src,/action\(\(\)=>requestAnimationFrame\(onFind\)\)/);
 assert.match(data,/onClick=\{onBackup\}/);assert.match(data,/\{children\}/);assert.match(src,/<ReferenceButton reference=\{reference\}>/);
 const ops=await source('ChapterOperations.jsx');for(const h of ['onExport','onRemove','onRestore'])assert.match(ops,new RegExp(`onClick=\\{${h}\\}`));assert.match(ops,/onRename&&<button/);
 assert.doesNotMatch(src,/起名助手|独立字数统计|行间线/);
});
test('frequent actions follow approved order with copy first; writing tools remain four and review unique',async()=>{
 const src=await source('ChapterTools.jsx');
 const common=src.slice(src.indexOf('aria-label="常用"'),src.indexOf('aria-label="写作工具"'));
 const labels=['快捷复制','查找与替换','围绕此内容讨论','整理建议'];
 const positions=labels.map(label=>common.indexOf(label));assert.ok(positions.every(p=>p>=0));assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
 const writing=src.slice(src.indexOf('aria-label="写作工具"'),src.indexOf('aria-label="外观"'));
 for(const label of ['码字时速','快捷输入','长图分享','版本历史'])assert.ok(writing.includes(label));
 assert.doesNotMatch(writing,/整理建议/);assert.equal((src.match(/action\(onReview\)/g)||[]).length,1);
 assert.equal((src.match(/action\(onUndoFormat\)/g)||[]).length,1);
 const {chapterToolIcons}=await loadIcons();const share=renderToStaticMarkup(chapterToolIcons.share),format=renderToStaticMarkup(chapterToolIcons.format);
 assert.match(share,/width="20" height="18"/);assert.match(share,/<circle/);
 assert.match(format,/M3 4h18M11 9h10M11 14h10M3 20h18/);assert.match(format,/M3 9l4 3-4 3/);
});
test('toolbar quick format shares the menu format pictogram without changing action or accessible label',async()=>{
 const editor=await source('index.jsx'),menu=await source('ChapterTools.jsx');
 assert.match(editor,/import \{ChapterToolIcon\} from '\.\/ChapterToolIcon.jsx'/);
 assert.match(editor,/<button type="button" className="icon-button format-button" aria-label="快速排版" title="快速排版" disabled=\{busy\|\|base.deleted\|\|!draft.content.trim\(\)\} onClick=\{format\}><ChapterToolIcon name="format"\/><\/button>/);
 assert.ok(menu.includes("button('format','正文排版','format','green')"));
 const {ChapterToolIcon}=await loadIcons();assert.match(renderToStaticMarkup(React.createElement(ChapterToolIcon,{name:'format'})),/class="app-icon chapter-tool-icon"/);
});
