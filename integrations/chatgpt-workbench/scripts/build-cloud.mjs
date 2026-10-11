import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
// Reuse the upstream command engine; remove only its filesystem dispatch layer.
// Deliberately fail when that seam changes, rather than silently ship a partial port.
const source=await readFile(new URL('../../src/application/store.js',root),'utf8');
const constructorStart=source.indexOf('  constructor(root, options = {}) {');
const constructorEnd=source.indexOf('  validateMigration(state)',constructorStart);
const dispatchStart=source.indexOf('  async dispatch(action, args = {}, actor = {}) {');
const dispatchEnd=source.indexOf('  execute(state, action, a, actor) {',dispatchStart);
if([constructorStart,constructorEnd,dispatchStart,dispatchEnd].some(i=>i<0))throw new Error('Upstream Store seam changed');
const pure=(source.slice(0,constructorStart)+source.slice(constructorEnd,dispatchStart)+source.slice(dispatchEnd))
  .replace("import { writeFile } from 'node:fs/promises';",'')
  .replace("import { ProjectStore } from '../infrastructure/persistence/project-store.ts';",'')
  .replace("import { join } from 'node:path';",'')
  .replace('export class Store extends ProjectStore {','export class Store {');
const result=await build({stdin:{contents:pure+"\nexport {HUMAN_ACTIONS,TOOL_ACTIONS,isReadAction} from '../contracts/actions.js';",resolveDir:fileURLToPath(new URL('../../src/application/',root)),sourcefile:'cloud-engine.js'},bundle:true,write:false,format:'esm',platform:'node',target:'node24'});
await mkdir(new URL('cloud/generated/',root),{recursive:true});
await writeFile(new URL('cloud/generated/engine.mjs',root),'// Generated from MIT upstream; see UPSTREAM.md and LICENSE. Do not edit.\n'+result.outputFiles[0].text);
await mkdir(new URL('cloud/public/',root),{recursive:true});
await writeFile(new URL('cloud/public/index.html',root),await readFile(new URL('dist/workbench-dev.html',root),'utf8'));
console.log('Cloud engine and native UI built; no deployment performed.');
