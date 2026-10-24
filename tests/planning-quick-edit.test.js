import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {readFileSync} from 'node:fs';
import {unifiedStoryStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/unified-story-style.mjs';
const built=await build({entryPoints:['integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/card-appearance.tsx'],bundle:true,write:false,format:'esm',platform:'node',loader:{'.png':'dataurl'},tsconfigRaw:{compilerOptions:{jsx:'react'}}});
const {CardQuickButton}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('shared gear is accessible and isolates pointer/click/double-click from graph gestures',()=>{
 let opened=0,stopped=0;const button=CardQuickButton({title:'雨夜来客',open:()=>opened++}),event={stopPropagation(){stopped++;}};
 assert.equal(button.type,'button');assert.equal(button.props.type,'button');assert.equal(button.props['aria-label'],'快捷设置 雨夜来客');assert.ok('data-graph-editor' in button.props);
 button.props.onPointerDown(event);assert.equal(opened,0);button.props.onDoubleClick(event);assert.equal(opened,0);button.props.onClick(event);assert.equal(opened,1);assert.equal(stopped,3);
 assert.equal(CardQuickButton({title:'忙碌',open:()=>{},disabled:true}).props.disabled,true);
});
test('gear exists only in planning canvas plot cards, replacing duplicate footer arrow',()=>{
 const source=readFileSync('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx','utf8'),canvas=source.slice(source.indexOf('export function UnifiedCanvas'));
 assert.doesNotMatch(source.slice(source.indexOf('export function UnifiedPlanning'),source.indexOf('export function UnifiedCanvas')),/<CardQuickButton/);
 assert.match(canvas,/obj.kind==='card'&&<CardQuickButton title={obj.title} disabled={unavailable\|\|selectionBlocked} open={\(\)=>open\(n.id\)}/);
 assert.match(canvas,/obj.kind!=='card'&&<button className="u-open-card"/);
 assert.match(unifiedStoryStyle,/width:32px;height:32px/);assert.match(unifiedStoryStyle,/@media\(pointer:coarse\).*width:44px;height:44px/);
 assert.match(unifiedStoryStyle,/svg\{width:16px;height:16px;flex:none\}/);
});
