import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const mode=process.argv[2];
if(!['paused','candidate','enabled'].includes(mode))throw new Error('使用 paused、candidate 或 enabled；切换不修改作品数据。');
const source=mode==='paused'?'native-paused-template.html':'workbench-dev.html';
const html=await readFile(new URL(`dist/${source}`,root),'utf8');
for(const name of ['native-paused.html','workbench.html','demo.html'])await writeFile(new URL(`dist/${name}`,root),html);
await writeFile(new URL('.data/native-mode.json',root),JSON.stringify({mode,changedAt:new Date().toISOString()},null,2));
console.log(mode==='paused'?'原生界面已恢复隔离页':mode==='enabled'?'原生尺寸修复版已启用，后续构建保留启用状态':'原生界面已切换为尺寸修复候选版，完整验收仍需确认');
