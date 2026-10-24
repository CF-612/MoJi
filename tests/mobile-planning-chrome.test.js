import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {build} from 'esbuild';
const base='integrations/chatgpt-workbench/vendor/cuigengji/src/client/';
const planning=readFileSync(base+'features/planning/UnifiedPlanning.jsx','utf8'),chrome=readFileSync(base+'shared/chrome-style.ts','utf8'),style=readFileSync(base+'features/planning/unified-story-style.mjs','utf8');
const built=await build({entryPoints:[base+'shared/graph.tsx'],bundle:true,write:false,format:'esm',platform:'node',loader:{'.png':'dataurl'},tsconfigRaw:{compilerOptions:{jsx:'react'}}});
const{GraphControls}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
function text(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);if(Array.isArray(node))return node.map(text).join('');return text(node.props?.children);}
test('graph help describes actual distinct mouse/touch selection and only supported frame shortcut',()=>{
 const graph={zoom:1,fallback:{},canCreateFrame:false};const help=text(GraphControls({graph,busy:false,help:'上下连接包含 · 左右连接先后'}));
 for(const phrase of ['多选模式点卡片选择','长按卡片查看操作','右键拖动空白框选','双指平移缩放','双击打开内容','上下连接包含'])assert.ok(help.includes(phrase),phrase);
 assert.ok(!help.includes('C 创建讨论框'));assert.ok(text(GraphControls({graph:{...graph,canCreateFrame:true},busy:false})).includes('C 创建讨论框'));
});
test('planning removes duplicate upper instructions and keeps protected generation in existing more sheet',()=>{
 assert.doesNotMatch(planning,/className="u-canvas-instruction"/);
 const filters=planning.slice(planning.indexOf('className="u-subbar u-canvas-toolbar"'),planning.indexOf('<UnifiedCanvas'));
 assert.ok(filters.includes('aria-label="画布页面"'));assert.ok(filters.includes('aria-label="规划分组"'));assert.ok(!filters.includes('生成大纲视图'));
 assert.match(planning,/<PlanningToolGroup title="整理与恢复">\{area==='canvas'&&<button disabled=\{unavailable\|\|issues.length>0\} onClick=\{\(\)=>\{setMenu\(false\);generate\(\);\}\}/);
 assert.match(planning,/正文卷章受保护/);
});
test('narrow chrome retains bounded controls, aligned hit heights, and flexible canvas height',()=>{
 assert.match(chrome,/@container\(max-width:600px\)/);assert.match(chrome,/graph-controls\{left:8px;right:8px;bottom:8px/);
 assert.match(chrome,/graph-view-controls>button\{flex:1;min-width:0;min-height:40px/);
 assert.match(chrome,/graph-help>summary\{[^}]*min-height:40px/);
 assert.match(style,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(style,/unified-story>\.u-canvas\{min-height:0;max-height:none;flex:1\}/);
});

test('outline guidance matches title folding and summary editing without a permanent upper strip',()=>{
 assert.doesNotMatch(planning,/卷：单击切换内容/);assert.match(planning,/点击卷、章节标题展开或收起；多选模式点击选择/);assert.match(planning,/双击梗概编辑，触屏长按梗概编辑/);assert.match(planning,/details className="u-outline-help"/);
});
