import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {chapterDisplayTitle,chapterOrdinalInVolume} from '../vendor/cuigengji/src/client/features/chapters/chapter-display-title.mjs';
const base=new URL('../vendor/cuigengji/src/client/',import.meta.url);
const source=await readFile(new URL('features/chapters/ChapterFooter.jsx',base),'utf8');
const {code}=await transform(source.replace(/^import .*;\n/gm,'').replace('export function','function')+'\nreturn ChapterFooter;',{loader:'jsx'});
const Footer=new Function('React','chapterDisplayTitle',code)(React,chapterDisplayTitle);
const props={novelTitle:'测试作品',chapterTitle:'雨后的清晨',ordinal:9,numbering:'arabic',showInfo:true,wordCount:React.createElement('button',null,'1,200 字'),status:'已保存',problem:false,error:false};
const render=p=>renderToStaticMarkup(React.createElement(Footer,{...props,...p}));
test('真实底栏组件显示作品、章号标题、字数且保留保存状态',()=>{
 const html=render();assert.match(html,/《测试作品》/);assert.match(html,/第9章 雨后的清晨/);assert.equal((html.match(/1,200 字/g)||[]).length,1);assert.match(html,/role="status"/);assert.match(html,/sr-only">已保存/);
});
test('已有编号不重复，尊重中文编号，标题显示不修改原始数据',()=>{
 const before={...props,chapterTitle:'第九章 雨后的清晨'};const html=render(before);assert.match(html,/第9章 雨后的清晨/);assert.doesNotMatch(html,/第9章 第/);assert.equal(before.chapterTitle,'第九章 雨后的清晨');assert.match(render({numbering:'chinese'}),/第九章 雨后的清晨/);
});
test('选择顶部不重复底部字数，关闭信息栏不隐藏失败或离线信息',()=>{
 assert.doesNotMatch(render({wordCount:false}),/1,200 字/);assert.match(render({wordCount:false}),/《测试作品》/);
 for(const status of ['离线草稿 · 仅保存在此设备，联网后同步','待合并 · 双方内容已保留','保存失败：请检查网络']){
  const html=render({showInfo:false,status,problem:true,error:true,retry:()=>{}});assert.doesNotMatch(html,/chapter-bookinfo/);assert.match(html,/data-expanded="true"/);assert.ok(html.includes(status));assert.match(html,/重试保存/);
 }
});
test('接线复用真实作品标题与章节顺序，样式保证名称省略但字数不缩',async()=>{
 const app=await readFile(new URL('index.tsx',base),'utf8'),chapters=await readFile(new URL('features/chapters/index.jsx',base),'utf8'),style=await readFile(new URL('features/chapters/chapter-tools-style.mjs',base),'utf8');
 assert.match(app,/<Chapters novelTitle=\{novel\?\.title\}/);assert.match(chapters,/chapterOrdinal=\{chapterOrdinalInVolume\(live,id\)\}/);assert.match(chapters,/showInfo=\{preferences.showInfoBar\}/);assert.match(style,/chapter-bookinfo-count\{flex:none;white-space:nowrap\}/);assert.match(style,/text-overflow:ellipsis/);assert.match(style,/data-expanded=true\]\{flex:1 0 100%;white-space:normal/);
});

// The manuscript title is already directly editable; directory actions retain rename.
test('正文更多不重复提供重命名，目录重命名和直接标题编辑保留',async()=>{
 const operations=await readFile(new URL('features/chapters/ChapterOperations.jsx',base),'utf8');
 const {code}=await transform(operations.replace(/^import .*;\n/gm,'').replace('export function','function')+'\nreturn ChapterOperations;',{loader:'jsx'});
 const Operations=new Function('React','useDialog','Icon',code)(React,()=>({ask:async()=>null}),()=>null);
 const p={chapter:{title:'雨后的清晨'},onExport:()=>{},onRemove:()=>{}};
 const html=renderToStaticMarkup(React.createElement(Operations,p));assert.doesNotMatch(html,/重命名/);assert.match(html,/导出本章/);assert.match(html,/移入回收站/);
 assert.match(renderToStaticMarkup(React.createElement(Operations,{...p,onRename:()=>{}})),/重命名/);
 const chapters=await readFile(new URL('features/chapters/index.jsx',base),'utf8');
 assert.match(chapters,/<InlineTitle[^>]+label="修改章节标题"[^>]+commit=\{title=>set\('title',title\)\}/);
 assert.doesNotMatch(chapters.match(/<ChapterOperations icons[^\n]+/)[0],/onRename=/);
 assert.match(chapters,/<ChapterOperations chapter=\{contextChapter\}[^\n]+onRename=/);
});

test('正文标题与底栏共用显示规则，章序按卷而非全书且排除删除章节',async()=>{
 const chapters=[{id:'a',volumeId:'one',title:'开篇'},{id:'b',volumeId:'two',title:'另一卷'},{id:'deleted',volumeId:'one',deleted:true},{id:'c',volumeId:'one',title:'继续'},{id:'d',volumeId:null,title:'未分卷'}];
 assert.equal(chapterOrdinalInVolume(chapters,'c'),2);assert.equal(chapterOrdinalInVolume(chapters,'b'),1);assert.equal(chapterOrdinalInVolume(chapters,'d'),1);assert.equal(chapterOrdinalInVolume(chapters,'missing'),0);
 assert.equal(chapterDisplayTitle('继续',2,'arabic'),'第2章 继续');assert.equal(chapterDisplayTitle('继续',2,'chinese'),'第二章 继续');assert.equal(chapterDisplayTitle('第9章 继续',2,'chinese'),'第九章 继续');assert.equal(chapterDisplayTitle('第九章 继续',2,'arabic'),'第9章 继续');
 const editor=await readFile(new URL('features/chapters/index.jsx',base),'utf8');assert.match(editor,/<InlineTitle value=\{draft.title\} displayValue=\{chapterDisplayTitle\(draft.title,chapterOrdinal,preferences.numbering\)\}/);
});

test('实际 InlineTitle 展示推导标题，进入编辑仍使用原始标题',async()=>{
 const src=await readFile(new URL('shared/InlineTitle.tsx',base),'utf8');
 const {code}=await transform(src.replace(/^import .*;\n/gm,'').replace('export function','function')+'\nreturn InlineTitle;',{loader:'tsx'});
 const changes=[];let stateIndex=0;
 const useState=initial=>{const index=stateIndex++;return [initial,value=>changes.push([index,value])];};
 const InlineTitle=new Function('React','useLayoutEffect','useRef','useState',code)(React,()=>{},value=>({current:value}),useState);
 const tree=InlineTitle({value:'雨后的清晨',displayValue:'第三章 雨后的清晨',label:'修改章节标题',commit:()=>{throw Error('显示不能写入标题');}});
 const html=renderToStaticMarkup(tree);assert.match(html,/第三章 雨后的清晨/);
 tree.props.children.props.children.props.onClick();
 assert.deepEqual(changes.find(([index])=>index===1),[1,'雨后的清晨']);assert.deepEqual(changes.find(([index])=>index===0),[0,true]);
});
