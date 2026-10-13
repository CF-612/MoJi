import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {textDiff} from '../vendor/cuigengji/src/client/shared/text-diff.js';
import {historyText} from '../vendor/cuigengji/src/client/shared/history-text.js';
const restore=(diff,side)=>diff.chunks.filter(c=>c.kind!==(side==='old'?'add':'remove')).map(c=>c.text).join('');

test('原文精确重建：中文、emoji、重复行、CRLF、空白、无尾换行及随机增删；字内高亮不拆 Unicode 字符',()=>{
 let seed=31;const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;},samples=['甲\n','重复\r\n','　雨夜。\n','😀\n','**原文**\n','\t  \n','没有尾换行'];
 for(let i=0;i<160;i++){const a=Array.from({length:next()%15},()=>samples[next()%samples.length]).join(''),b=Array.from({length:next()%15},()=>samples[next()%samples.length]).join(''),diff=textDiff(a,b);assert.equal(restore(diff,'old'),a);assert.equal(restore(diff,'new'),b);for(const c of diff.chunks)if(c.inline)assert.equal(c.inline.map(p=>p.text).join(''),c.text);}
 const unicode=textDiff('他拿起😀铜钥匙。\r\n','他放下😀银钥匙。\n');assert.equal(restore(unicode,'old'),'他拿起😀铜钥匙。\r\n');for(const c of unicode.chunks)for(const p of c.inline||[])assert.doesNotMatch(p.text,/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u);
 const same=textDiff('完全一样\n','完全一样\n');assert.equal(same.added+same.removed,0);assert.deepEqual(textDiff('','').chunks,[]);
 const one=textDiff('铜钥匙。','银钥匙。');assert.equal(one.added,1);assert.equal(one.removed,1);assert.equal(one.blockStats,false);
});

test('长文使用有限计算量的文本块降级，仍完整保留双方原文；不对巨大段落做逐字矩阵',()=>{
 const before='开头\n'+Array.from({length:1800},(_,i)=>`旧段落 ${i}\n`).join('')+'结尾\n',after='开头\n'+Array.from({length:1800},(_,i)=>`新段落 ${i}\n`).join('')+'结尾\n',result=textDiff(before,after);assert.equal(result.coarse,true);assert.equal(restore(result,'old'),before);assert.equal(restore(result,'new'),after);assert.equal(result.chunks.length,4);assert.equal(result.chunks.some(c=>c.inline),false);
 const paragraph=textDiff('甲'.repeat(100000),'乙'.repeat(100000));assert.equal(restore(paragraph,'new').length,100000);assert.equal(paragraph.chunks.some(c=>c.inline),false);
});

test('字段比较忽略来源时间和版本元数据，保留正文、已归档值、0 值和关系结束；同名引用不会混淆',()=>{
 const nodes=[{id:'samepref-node-a',name:'邮局'},{id:'samepref-node-b',name:'邮局'}],meta={nodes,labels:{age:'年龄段',archived:'旧字段'}};
 const a={id:'source',revision:1,updatedAt:'old',values:{archived:'**旧说明**\r\n',age:0},aliases:['samepref-node-a']},b={...a,id:'another',revision:7,updatedAt:'new',values:{age:0,archived:'**旧说明**\r\n'}};assert.equal(historyText(a,meta),historyText(b,meta));assert.match(historyText(a,meta),/年龄段：0/);assert.match(historyText(a,meta),/\*\*旧说明\*\*\r\n/);assert.match(historyText(a,meta),/别名：\nsamepref-node-a/);
 assert.notEqual(historyText({memoryRefs:[nodes[0].id]},meta),historyText({memoryRefs:[nodes[1].id]},meta));assert.match(historyText({value:{active:false,name:'伙伴'}},meta),/关系存在：否/);assert.equal(historyText(null),'记录不存在');
});

test('差异阅读转义 HTML，不执行原始源码；新增、删除及同文状态具有文字标记',async()=>{
 const root=resolve(import.meta.dirname,'../.data/tests');await mkdir(root,{recursive:true});const dir=await mkdtemp(join(root,'diff-ui-')),output=join(dir,'reader.mjs');await build({entryPoints:[resolve(import.meta.dirname,'../vendor/cuigengji/src/client/shared/TextDiff.jsx')],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external'});const {TextDiff}=await import(pathToFileURL(output));
 const html=renderToStaticMarkup(React.createElement(TextDiff,{before:'原文\n<script>alert(1)</script>',after:'修改\n<img onerror="alert(1)">'}));assert.doesNotMatch(html,/<script|<img/);assert.match(html,/&lt;/);assert.match(html,/aria-label="新增"/);assert.match(html,/aria-label="删除"/);assert.match(html,/<ins/);assert.match(html,/<del/);
 assert.match(renderToStaticMarkup(React.createElement(TextDiff,{before:'相同',after:'相同'})),/两份内容一致/);
});
