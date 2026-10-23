import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {normalizeEditorPreferences,editorDefaults} from '../vendor/cuigengji/src/client/shared/editor-preferences.mjs';
import {manuscriptCount} from '../vendor/cuigengji/src/client/features/chapters/editor-text.mjs';
const source=path=>readFile(new URL('../vendor/cuigengji/src/client/'+path,import.meta.url),'utf8');

test('字数位置兼容旧偏好，异常值回落底部，保存后恢复顶部且不丢失字号行距',()=>{
 assert.equal(editorDefaults.wordCountPosition,'bottom');
 for(const value of [undefined,null,'invalid',true])assert.equal(normalizeEditorPreferences({wordCountPosition:value}).wordCountPosition,'bottom');
 const saved=JSON.parse(JSON.stringify({wordCountPosition:'top',showInfoBar:false,countPunctuation:false,fontSize:23,leading:2.1}));
 const p=normalizeEditorPreferences(saved);assert.equal(p.wordCountPosition,'top');assert.equal(p.showInfoBar,false);assert.equal(p.countPunctuation,false);assert.equal(p.fontSize,23);assert.equal(p.leading,2.1);
});

test('实际计数 JSX 复用同一按钮，顶部/底部互斥，顶部不依赖底栏，切换统计口径正确',async()=>{
 const src=await source('features/chapters/index.jsx');
 assert.match(src,/preferences.wordCountPosition==='top'&&<div className="editor-top-wordcount">\{wordCount\}<\/div>/);
 assert.match(src,/preferences.wordCountPosition!=='top'&&wordCount/);
 assert.equal((src.match(/manuscriptCount\(draft.content,preferences.countPunctuation\)/g)||[]).length,1);
 const expression=src.match(/  const wordCount=(.*);\n/)[1];
 const {code}=await transform('return '+expression,{loader:'jsx'});
 const render=new Function('React','preferences','draft','updatePreferences','manuscriptCount',code);
 for(const position of ['top','bottom'])for(const punctuation of [true,false]){
  const p=normalizeEditorPreferences({wordCountPosition:position,countPunctuation:punctuation,showInfoBar:false});
  let changed;const element=render(React,p,{content:'甲， A😀\n'},v=>changed=v,manuscriptCount);
  assert.match(renderToStaticMarkup(element),punctuation?/4 字<span class="wordcount-mode"> · 含标点/:/2 字<span class="wordcount-mode"> · 不含标点/);
  element.props.children.props.onClick();assert.deepEqual(changed,{countPunctuation:!punctuation});
 }
});

test('普通搜索不显示修订号但保留原始命中引用，历史比较仍保留版本',async()=>{
 const search=await source('shared/WorkSearch.jsx');assert.doesNotMatch(search,/版本 \{hit.revision\}/);assert.match(search,/onOpen\(hit\)/);assert.match(search,/hit.match.label/);
 const chapter=await source('features/chapters/index.jsx');assert.match(chapter,/版本 \{h.revision\}/);assert.match(chapter,/expectedRevision:before.revision/);
});

test('全局设置移除字号行距重复控件，正文入口及偏好值仍保留',async()=>{
 const global=await source('shared/preferences.tsx'),appearance=await source('features/chapters/ChapterAppearance.jsx');
 assert.doesNotMatch(global,/aria-label="默认正文字号"|aria-label="正文行距"/);
 assert.match(global,/打开任意章节 → 更多 → 字体字号 \/ 页面布局/);
 assert.match(appearance,/name="fontSize"/);assert.match(appearance,/name="leading"/);assert.match(appearance,/aria-label="字数显示位置"/);
 assert.match(global,/normalizeEditorPreferences\(p\)/);
});
