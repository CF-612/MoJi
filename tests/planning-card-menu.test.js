import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {planningCardMenuItems} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/planning-card-menu.mjs';
const selection={refs:['card:a'],cards:['card:a'],protected:[]};
const callbacks=()=>Object.fromEntries(['edit','organize','assign','group','remove','deleteCards'].map(key=>[key,()=>{}]));
test('single card menu preserves scoped actions and never exposes page deletion',()=>{
 const calls=[],handlers=Object.fromEntries(Object.keys(callbacks()).map(key=>[key,value=>calls.push([key,value])]));
 const items=planningCardMenuItems(selection,{...handlers,groupsEnabled:true});items.forEach(item=>item.action());
 assert.deepEqual(calls,[['edit','card:a'],['organize','card:a'],['assign',['card:a']],['group',['card:a']],['remove',['card:a']],['deleteCards',['card:a']]]);
 assert.ok(items.every(item=>!item.label.includes('页面')));assert.equal(items.at(-1).danger,true);
});
test('source volumes/chapters are protected and blocked actions disabled',()=>{
 for(const kind of ['chapter','volume']){const items=planningCardMenuItems({refs:[kind+':a'],cards:[],protected:[kind+':a']},callbacks());assert.equal(items.at(-1).disabled,true);assert.equal(items.at(-1).label,'正文卷章受保护');}
 assert.ok(planningCardMenuItems(selection,{...callbacks(),blocked:true}).every(item=>item.disabled));
 assert.ok(!planningCardMenuItems(selection,callbacks()).some(item=>item.label==='加入分组'));
 for(const refs of [[],['card:a','card:b']])assert.deepEqual(planningCardMenuItems({...selection,refs},callbacks()),[]);
});
test('live canvas routes only one selection to anchored menu; batch modal and page management remain separate',()=>{
 const source=readFileSync('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx','utf8');
 assert.match(source,/contextSelection.refs.length===1&&<CanvasMenu x={context.x} y={context.y}/);
 assert.match(source,/contextSelection.refs.length>1&&<Modal/);
 assert.match(source,/setContext\(\{\.\.\.value,refs\}\)/);
 const canvas=source.slice(source.indexOf('export function UnifiedCanvas'));
 assert.doesNotMatch(canvas,/删除当前画布页面|onDeletePage/);
 assert.match(source.slice(0,source.indexOf('export function UnifiedCanvas')),/删除当前画布页面/);
 assert.match(canvas,/graph.cardProps\(n.id,\(\)=>open\(n.id\)\)/);
});
