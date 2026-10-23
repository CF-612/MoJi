import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {foreshadowCardIds,planningCardPresentation,planningCardColorStyle} from '../vendor/cuigengji/src/client/shared/planning-card-presentation.mjs';
import {cardColorVariables} from '../vendor/cuigengji/src/client/shared/card-colors.js';
import {planningSvg} from '../vendor/cuigengji/src/client/shared/planning-canvas-geometry.mjs';
const client='../vendor/cuigengji/src/client/';
for(const status of ['idea','selected','written','dropped'])for(const linked of [false,true])test(`${status}: ${linked?'linked':'plain'} preserves status and accessible distinction`,()=>{
 const card={id:'sample',title:'演示卡片',status},before=structuredClone(card),attrs=planningCardPresentation(card,linked?new Set(['sample']):new Set());
 assert.equal(attrs['data-card-state'],status);assert.equal(attrs['data-foreshadow-linked'],linked);assert.equal(attrs['aria-label'].includes('关联伏笔'),linked);assert.match(attrs.title,/演示卡片/);assert.deepEqual(card,before);
});
test('link membership is actual plotNodes.cardId, including planned/evidenced, not guessed from labels',()=>{
 const ids=foreshadowCardIds([{title:'sample',plotNodes:[{cardId:'one',kind:'plant'},{cardId:'two',kind:'recover',evidence:{chapterId:'ch'}},{cardId:'one'},{cardId:''}]},{title:'three'},{}]);assert.deepEqual([...ids],['one','two']);assert.equal(planningCardPresentation({id:'three',status:'bad'},ids)['data-card-state'],'idea');
});
test('palette follows user preferences, color surface follows light/dark paper and text tokens',()=>{
 const palette=cardColorVariables({idea:'#112233',selected:'#445566',written:'#778899',dropped:'#aabbcc'});
 for(const state of ['idea','selected','written','dropped']){assert.match(planningCardColorStyle,new RegExp(`data-card-state=${state}.*var\\(--card-${state}`));assert.ok(palette[`--card-${state}`]);}
 assert.match(planningCardColorStyle,/var\(--cg-paper\)/);assert.match(planningCardColorStyle,/color:var\(--cg-ink\)/);assert.match(planningCardColorStyle,/data-foreshadow-linked=true/);assert.match(planningCardColorStyle,/border-right:4px double/);assert.match(planningCardColorStyle,/forced-colors/);
});
test('canvas and outline render shared attributes, not hardcoded legacy status hues',()=>{
 const source=readFileSync(new URL(client+'features/planning/UnifiedPlanning.jsx',import.meta.url),'utf8');assert.equal((source.match(/planningCardPresentation\(obj,foreshadowIds\)/g)||[]).length,2);
});
test('SVG/PNG source preserves per-node fill, custom status edges, linked edge and accessible title',()=>{
 const nodes=['a','b'].map((id,i)=>({id,title:id,kind:'card',presentation:{fill:i?'#202830':'#eff4ff',border:'#123456',tone:i?'#778899':'#112233',linked:!!i,linkedTone:'#8765ab',dashed:!!i,label:`${id} ${i?'关联伏笔':'讨论中'}`}}));
 const svg=planningSvg(nodes,[],{a:{x:0,y:0},b:{x:400,y:0}},'dark').svg;
 for(const value of ['#202830','#eff4ff','#123456','#778899','#112233','#8765ab'])assert.ok(svg.includes(value),value);assert.match(svg,/stroke-dasharray="5 4"/);assert.match(svg,/<title>b 关联伏笔<\/title>/);
 const src=readFileSync(new URL(client+'shared/CanvasExport.jsx',import.meta.url),'utf8');assert.match(src,/planningSvg\(currentCardPresentation\(nodes,element\)/);assert.match(src,/querySelectorAll\('\.u-canvas-card\[data-node-id\]'/);
});
test('both timelines and pending trays share status/link attributes without fixed palette override',()=>{
 for(const name of ['UnifiedTimeline.jsx','StoryTimeAxis.jsx']){
  const src=readFileSync(new URL(client+'features/planning/'+name,import.meta.url),'utf8');
  assert.ok((src.match(/\.\.\.planningCardPresentation\(/g)||[]).length>=2,name);
  assert.doesNotMatch(src,/'--state-color':\(cardStates/);
 }
 const host=readFileSync(new URL(client+'features/planning/UnifiedPlanning.jsx',import.meta.url),'utf8');
 assert.match(host,/modules\.foreshadow\?call\('writing.foreshadow.list'/);assert.match(host,/foreshadowCardIds\(shadowResource.value\|\|\[\]\)/);
 assert.match(host,/<StoryTimeAxis[^>]*foreshadowIds/);assert.match(host,/<UnifiedTimeline[^>]*foreshadowIds/);assert.match(host,/<UnifiedCanvas[^>]*foreshadowIds/);
});
