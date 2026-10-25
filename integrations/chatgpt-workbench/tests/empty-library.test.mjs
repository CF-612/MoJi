import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {build,transform} from 'esbuild';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {emptyLibraryStyles} from '../vendor/cuigengji/src/client/features/welcome/empty-style.ts';

const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=join(root,'.data/tests');
await mkdir(temporary,{recursive:true});
const directory=await mkdtemp(join(temporary,'empty-library-'));
after(()=>rm(directory,{recursive:true,force:true}));
const bundle=await build({stdin:{resolveDir:root,loader:'tsx',contents:`
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Welcome} from './vendor/cuigengji/src/client/features/welcome/index.tsx';
export {EmptyLibrary} from './vendor/cuigengji/src/client/features/welcome/EmptyLibrary.tsx';
export const render=props=>renderToStaticMarkup(<Welcome books={[]} busy={false} call={async()=>({})} onCreate={()=>{}} onImport={()=>{}} onManage={()=>{}} onOpen={()=>{}} {...props}/>);
`},bundle:true,write:false,format:'esm',platform:'node',external:['react','react-dom/server'],loader:{'.png':'dataurl','.jpg':'dataurl'}});
const compiled=join(directory,'render.mjs');
await writeFile(compiled,bundle.outputFiles[0].contents);
const {render,EmptyLibrary}=await import(pathToFileURL(compiled).href);

test('empty library uses the existing mascot and one clear creation action',async()=>{
 const html=render({});
 const original=await readFile(new URL('../vendor/cuigengji/src/client/assets/moji.png',import.meta.url));
 assert.ok(html.includes(`data:image/png;base64,${original.toString('base64')}`),'reuse original bytes, not a replacement illustration');
 assert.match(html,/class="welcome-empty-mascot"[^>]*alt="蓝色烟灰蛸"/);
 assert.equal((html.match(/创建第一部作品/g)||[]).length,1);
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.match(html,/你的故事，<br\/>从这里开始。/);
 assert.doesNotMatch(html,/<p|<ol|<ul|<footer|welcome-empty-features|welcome-empty-steps/);
 assert.equal((html.match(/<button\b/g)||[]).length,1);
 assert.match(html,/<span class="welcome-empty-ghost" aria-hidden="true">STORIES<\/span>/);
 assert.doesNotMatch(html,/class="cover-shelf"|class="shelf-new"/);
});

test('nonempty shelf keeps its existing structure, recent works and expansion',()=>{
 const books=Array.from({length:8},(_,i)=>({id:`book-${i}`,title:`既有作品${i}`,updatedAt:`2026-10-${10+i}`}));
 const html=render({books});
 assert.doesNotMatch(html,/welcome-empty|创建第一部作品/);
 assert.match(html,/class="welcome-document shelf-document"/);
 assert.match(html,/class="shelf-heading"/);
 assert.equal((html.match(/class="shelf-book"/g)||[]).length,6);
 assert.match(html,/class="shelf-book shelf-new"/);
 assert.match(html,/查看其余 2 部作品/);
 assert.match(html,/aria-label="查找作品"/);
});

test('the sole empty-state creation action preserves its callback and busy guard',()=>{
 const called=[];
 const tree=EmptyLibrary({busy:true,onCreate:()=>called.push('create')});
 const buttons=[];
 function visit(node){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(visit);return;}if(node.type==='button')buttons.push(node);visit(node.props?.children);}
 visit(tree);
 assert.equal(buttons.length,1);
 assert.ok(buttons.every(button=>button.props.disabled===true&&button.props.type==='button'));
 for(const button of buttons)button.props.onClick();
 assert.deepEqual(called,['create']);
 assert.equal((render({busy:true}).match(/disabled=""/g)||[]).length,1);
});

test('empty decoration is component-scoped, noninteractive and responsive',async()=>{
 assert.doesNotMatch(emptyLibraryStyles,/(?:^|[}\n])\s*(?:html|body|:root)\b|position:fixed/);
 for(const rule of emptyLibraryStyles.split('{').slice(0,-1)){
  const selector=rule.slice(rule.lastIndexOf('}')+1).trim();
  if(!selector.startsWith('@'))assert.ok(selector.startsWith('.cuigengji .welcome-'),selector);
 }
 assert.match(emptyLibraryStyles,/pointer-events:none/);
 assert.match(emptyLibraryStyles,/opacity:\.18;filter:grayscale\(1\) contrast\(\.6\) brightness\(1\.2\) sepia\(1\) hue-rotate\(170deg\) saturate\(2\.5\)/);
 assert.match(emptyLibraryStyles,/@container \(max-width:600px\)[\s\S]*?opacity:\.14/);
 assert.doesNotMatch(emptyLibraryStyles,/transform:rotate|hue-rotate\(175deg\)/);
 assert.match(emptyLibraryStyles,/@container \(max-width:360px\)/);
 assert.match(emptyLibraryStyles,/min-height:46px/);
 assert.match(emptyLibraryStyles,/grid-template-columns:minmax\(0,1fr\) minmax\(0,\.8fr\)/);
 assert.match(emptyLibraryStyles,/background:linear-gradient\(135deg/);
 assert.match(emptyLibraryStyles,/width:min\(62cqw,352px,45dvh\)/);
 assert.match(emptyLibraryStyles,/button:focus-visible/);
 assert.match(emptyLibraryStyles,/background:var\(--cg-accent\);color:var\(--dsw-alias-label-on-color\)/);
 assert.match(emptyLibraryStyles,/display:flex;flex-direction:column;align-items:center;gap:16px;min-height:0/);
 assert.match(emptyLibraryStyles,/welcome-empty-mascot \{position:static;order:1;opacity:\.14/);
 assert.match(emptyLibraryStyles,/welcome-empty-create:hover:not\(:disabled\)/);
 assert.match(emptyLibraryStyles,/var\(--cg-paper\)/);
 assert.deepEqual((await transform(emptyLibraryStyles,{loader:'css'})).warnings,[]);
 const source=await readFile(new URL('../vendor/cuigengji/src/client/features/welcome/EmptyLibrary.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/document\.|window\.|localStorage|fetch\(/);
});
