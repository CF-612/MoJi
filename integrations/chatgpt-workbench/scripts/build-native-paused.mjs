import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
export async function buildNativePaused(){
  const root=new URL('../',import.meta.url);
  const output=await build({entryPoints:[fileURLToPath(new URL('client/native-paused.mjs',root))],bundle:true,write:false,format:'iife',minify:true});
  const code=output.outputFiles[0].text.replaceAll('</script','<\\/script');
  new Script(code);
  const template=await readFile(new URL('client/native-paused.html',root),'utf8');
  const html=template.replace('<!-- SCRIPT -->',()=>`<script>${code}</script>`);
  await mkdir(new URL('dist/',root),{recursive:true});
  await writeFile(new URL('dist/native-paused-template.html',root),html);
  let mode='enabled';
  try{if(JSON.parse(await readFile(new URL('.data/native-mode.json',root),'utf8')).mode==='enabled')mode='enabled';}catch{}
  const active=mode==='enabled'?await readFile(new URL('dist/workbench-dev.html',root),'utf8'):html;
  // 运行中的旧 MCP 进程每次读取这些文件，也会得到隔离页面。
  for(const name of ['native-paused.html','workbench.html','demo.html']){
    await writeFile(new URL(`dist/${name}`,root),active);
  }
  await mkdir(new URL('.data/',root),{recursive:true});
  await writeFile(new URL('.data/native-mode.json',root),JSON.stringify({mode,changedAt:new Date().toISOString()},null,2));
}
