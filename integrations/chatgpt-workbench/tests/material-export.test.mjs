import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {legacyCanvasSvg} from '../vendor/cuigengji/src/client/shared/canvas-export-legacy.mjs';
import {materialConnection} from '../vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
const nodes=[{id:'person',name:'甲<&',type:'character_card',presentation:{fill:'#123456',tone:'#234567',border:'#345678',ink:'#456789',muted:'#56789a',background:'#6789ab'}},{id:'world',name:'港湾',type:'world_entry',presentation:{fill:'#abcdef',tone:'#bcdef0'}},{id:'other',name:'城镇',type:'world_entry'}];
const points={person:{x:0,y:0},world:{x:400,y:250},other:{x:800,y:0}};
test('material SVG and PNG source retains custom type colors, real dimensions and escaped labels',()=>{
 const {svg}=legacyCanvasSvg(nodes,[],points);
 for(const color of ['#123456','#234567','#345678','#456789','#56789a','#6789ab','#abcdef','#bcdef0'])assert.ok(svg.includes(color),color);
 assert.match(svg,/width="248" height="168"/);assert.match(svg,/甲&lt;&amp;/);assert.match(svg,/世界/);
});
test('material exports honor cross-axis endpoints, no character arrows, and world arrows with category/style',()=>{
 const edges=[{id:'character',from:'person',to:'world',fromPort:'top',toPort:'right',name:'认识',content:'关系原文',category:'family',style:'dashed'},{id:'world',from:'world',to:'other',fromPort:'bottom',toPort:'top',name:'邻近',category:'affiliation',style:'dotted'}];
 const {svg}=legacyCanvasSvg(nodes,edges,points),person=svg.match(/<g data-edge-id="character">(.*?)<\/g>/s)[1],world=svg.match(/<g data-edge-id="world">(.*?)<\/g>/s)[1];
 assert.ok(person.includes(materialConnection(edges[0],points).path));assert.doesNotMatch(person,/marker-end/);assert.match(person,/stroke="#8a94a6"/);assert.match(person,/stroke-dasharray="8 5"/);assert.match(person,/关系原文/);
 assert.match(world,/marker-end="url\(#material-arrow-world\)"/);assert.match(world,/stroke-dasharray="2 5"/);
});
test('export captures every rendered material palette and shares SVG with PNG without changing planning path',()=>{
 const src=readFileSync(new URL('../vendor/cuigengji/src/client/shared/CanvasExport.jsx',import.meta.url),'utf8');
 assert.match(src,/querySelectorAll\('\.setting-card\[data-node-id\]'/);assert.match(src,/legacyCanvasSvg\(currentMaterialPresentation\(nodes,element\),currentMaterialEdges\(edges,element\),points\)/);assert.match(src,/planningSvg\(currentCardPresentation\(nodes,element\)/);assert.match(src,/ctx.drawImage\(image/);
});

test('rendered routes and collision-adjusted label coordinates survive export-only snapshots',()=>{
 const {svg}=legacyCanvasSvg(nodes,[{id:'r',from:'person',to:'world',name:'关系',presentation:{path:'M1,2 C3,4 5,6 7,8',labelX:321,labelY:456}}],points);
 assert.match(svg,/d="M1,2 C3,4 5,6 7,8"/);assert.match(svg,/<text x="321" y="456"/);
});

 test('custom relationship types share safe colors and renamed labels across export',()=>{
 const edges=[{id:'a',from:'person',to:'world',name:'父子',typeName:'朋友',relationColor:'#ef9012'},{id:'b',from:'world',to:'other',typeName:'朋友',relationColor:'#ef9012'}];
 const {svg}=legacyCanvasSvg(nodes,edges,points);assert.equal((svg.match(/stroke="#ef9012"/g)||[]).length,2);assert.equal((svg.match(/>朋友<\/text>/g)||[]).length,2);assert.doesNotMatch(svg,/父子/);assert.match(svg,/material-arrow-b/);
 const bad=legacyCanvasSvg(nodes,[{...edges[0],relationColor:'red" onload="alert(1)',typeName:'<script>'}],points).svg;assert.doesNotMatch(bad,/onload/);assert.match(bad,/&lt;script&gt;/);
 });
