import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {workSearch} from '../../../src/domain/work-search.js';
import {openSearchHit,isLegacySearchHit,legacySearchNotice} from '../vendor/cuigengji/src/client/shared/search-navigation.mjs';

// Old imported records remain searchable. Their IDs must not be interpreted as
// new story cards, nor should merely opening a hit mutate/migrate the work.
test('legacy imported planning/event search keeps excerpts read-only and never opens nonexistent unified IDs',()=>{
 const novel={revision:1,chapters:{},nodes:{},planning:{sequence:1,nodes:{p:{id:'p',revision:1,title:'旧钥匙规划',content:'保留旧资料全文。'}},pages:{}},writing:{events:{e:{id:'e',revision:1,title:'旧钥匙事件',content:'旧事件说明。',chapterRefs:[]}}}};
 const before=structuredClone(novel),result=workSearch(novel,{query:'钥匙'},{character:[],world:[]});
 assert.equal(result.total,2);assert.deepEqual(new Set(result.items.map(h=>h.kind)),new Set(['planning','event']));
 for(const hit of result.items){let opened=0,notice='';assert.equal(isLegacySearchHit(hit),true);assert.equal(openSearchHit(hit,{onOpen(){opened++;},onLegacy(value){notice=value;}}),false);assert.equal(opened,0);assert.equal(notice,legacySearchNotice);assert.match(notice,/只读搜索摘要/);assert.match(notice,/导出作品备份/);assert.ok(hit.match.snippet.includes('钥匙'));}
 assert.deepEqual(novel,before);
});

test('unified card search still opens the exact card; normal results are not diverted',()=>{
 const novel={revision:1,chapters:{},nodes:{},story:{state:{revision:1,cards:{c:{id:'c',revision:1,title:'新钥匙卡',content:'当前卡片'}}}}};
 const hit=workSearch(novel,{query:'钥匙'},{character:[],world:[]}).items[0];let opened;
 assert.equal(hit.unified,true);assert.equal(openSearchHit(hit,{onOpen(value){opened=value;},onLegacy(){assert.fail('current card must open');}}),true);assert.equal(opened.id,'c');
 for(const kind of ['chapter','character','world','foreshadow','requirements'])assert.equal(isLegacySearchHit({kind}),false);
});

test('actual search component uses guarded navigation; active shell and MCP instructions never call removed planning APIs',async()=>{
 const client=new URL('../vendor/cuigengji/src/client/',import.meta.url);
 const search=await readFile(new URL('shared/WorkSearch.jsx',client),'utf8'),shell=await readFile(new URL('index.tsx',client),'utf8'),mcp=await readFile(new URL('../server/mcp.mjs',import.meta.url),'utf8');
 assert.match(search,/openSearchHit\(hit,\{onOpen,onLegacy:setError\}\)/);assert.match(search,/旧版只读摘要/);
 assert.doesNotMatch(shell,/call\(['"]planning\./);assert.doesNotMatch(mcp,/planning\.apply 使用/);assert.match(mcp,/story\.apply 使用工作区 expectedRevision/);
});
