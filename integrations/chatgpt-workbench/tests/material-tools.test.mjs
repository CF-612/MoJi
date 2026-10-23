import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../vendor/cuigengji/src/client/'+file,import.meta.url),'utf8');
test('materials tools reuse grouped planning language and host-safe dialog',()=>{
 const source=read('features/memory/index.jsx');
 assert.match(source,/<PlanningToolsDialog page="materials" title="资料工具"/);
 for(const title of ['导入与导出','整理资料'])assert.ok(source.includes(`<PlanningToolGroup title="${title}">`));
 assert.match(source,/<CanvasExport \{\.\.\.exportRef.current\} grouped/);
 assert.match(source,/view==='canvas'&&!batch/);
 assert.match(source,/mode:'export',selection:\{kind:'memory',novelId,nodeIds:visible.map/);
 for(const text of ['导入设定','导出当前范围','批量管理资料','清除筛选','分组管理与筛选','颜色说明'])assert.ok(source.includes(text),text);
});
test('materials toolbar no longer renders standalone exports; live payload moves through ref',()=>{
 const source=read('features/memory/RelationCanvas.tsx'),parent=read('features/memory/index.jsx');
 assert.match(parent,/onExportReady=\{value=>\{exportRef.current=value;/);
 assert.match(source,/props.onExportReady\?\.\(\{nodes,edges:visible,points,name:'资料关系图',element:graph.scroll.current\}\)/);
 assert.match(source,/!props.onExportReady&&<div className="u-subbar">/);
});
test('shared dialog custom title does not alter planning defaults or focus behavior',()=>{
 const source=read('features/planning/PlanningToolsDialog.jsx');
 assert.match(source,/title=customTitle\|\|\(page==='create'/);assert.match(source,/'规划选项'/);assert.match(source,/previous.focus/);assert.match(source,/onCancel/);
});

test('relationship legend is the current book custom catalog, not legacy categories or only used edges',()=>{
 const source=read('features/memory/index.jsx');assert.match(source,/call\('writing.relationshipType.list',\{novelId\}\)/);assert.match(source,/relationshipTypes.map\(t=><span key=\{t.id\} style=\{\{color:t.color\}\}>━ \{t.name\}/);assert.doesNotMatch(source,/relationKinds|relationColors/);
});
