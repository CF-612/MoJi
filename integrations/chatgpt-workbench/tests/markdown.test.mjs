import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createService} from '../server/service.mjs';
import {markdownSample} from './fixtures/markdown.mjs';
const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});
const folder=await mkdtemp(join(root,'markdown-')),output=join(folder,'reader.mjs');
await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/shared/MarkdownText.jsx')],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});
const {MarkdownText,markdownUrl}=await import(pathToFileURL(output));
const render=text=>renderToStaticMarkup(React.createElement(MarkdownText,{text}));
test('完整阅读语法：标题、强调、嵌套列表、引用、表格、任务列表、源码块与写作宏',()=>{
 const html=render(markdownSample);for(const tag of ['h1','h2','strong','em','del','ul','ol','blockquote','table','th','td','pre','code','hr'])assert.ok(html.includes(`<${tag}`),`缺少 ${tag}`);
 assert.match(html,/Markdown 表格/);assert.match(html,/type="checkbox" disabled="" checked=""/);assert.match(html,/保留 \*\*源码\*\*/);assert.match(html,/\{\{char\}\}/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);
});
test('HTML、脚本链接及嵌入图片不会执行或自动加载；普通链接和脚注仍可阅读',()=>{
 const html=render('<script>alert(1)</script>\n\n<img src="https://example.com/pixel" onerror="alert(2)">\n\n[脚本](javascript:alert(1))\n\n[相对接口](/api/private)\n\n![示意图](https://example.com/pic.png)\n\n注释[^1]\n\n[^1]: 内容');
 assert.doesNotMatch(html,/<script|<img|href="javascript:|href="\/api/);assert.match(html,/&lt;script&gt;/);assert.match(html,/图片：/);assert.match(html,/href="https:\/\/example.com\/pic.png"/);assert.match(html,/href="#user-content-fn-/);
 for(const unsafe of ['javascript:alert(1)','data:text/html,x','file:///private','/api','//evil.example','vbscript:x'])assert.equal(markdownUrl(unsafe),'');
 assert.equal(markdownUrl('https://example.com/a'),'https://example.com/a');assert.equal(markdownUrl('#note'),'#note');
});
test('Markdown 原文在资料、规划、关系、写作要求和完整导出／复制中保持一致',async()=>{
 const service=await createService(join(folder,'store')),call=(action,args={})=>service.rpc(action,{novelId:service.novelId,...args},'markdown-test','human'),source=markdownSample.replaceAll('\n','\r\n')+'\r\n\t末尾空格  ';
 const actor=await call('writing.card.create',{type:'character_card',name:'岑予',content:source,values:{'character:personality':source}}),world=await call('writing.card.create',{type:'world_book',name:'邮局',content:source}),edge=await call('edge.create',{from:actor.id,to:world.id,name:'所属',content:source});
 const before=await call('story.get'),plan=await call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:before.state.revision,operation:{type:'card.create',value:{title:'来信',content:source}}}),planId=Object.keys(plan.state.cards)[0];
 await call('preset.set',{expectedRevision:0,preset:{name:'要求',enabled:true,blocks:[{identifier:'test',name:'叙述',enabled:true,content:source}]}});
 assert.equal((await call('graph.get',{nodeId:actor.id})).content,source);assert.equal((await call('writing.card.get',{nodeId:actor.id})).values['character:personality'],source);assert.equal((await call('edge.get',{edgeId:edge.id})).content,source);assert.equal((await call('story.get')).state.cards[planId].content,source);assert.equal((await call('preset.get')).blocks[0].content,source);
 const file={name:'markdown.json',json:await call('novel.export')},options={mode:'copy'},preview=await call('transfer.preview',{file,options}),copied=await call('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()}),novel=(await service.rpc('novel.export',{novelId:copied.novelIds[0]},'copied','human')).novel;
 assert.equal(Object.values(novel.nodes).find(n=>n.name==='岑予').content,source);assert.equal(Object.values(novel.edges)[0].content,source);assert.equal(Object.values(novel.story.state.cards)[0].content,source);assert.equal(novel.preset.blocks[0].content,source);
});
