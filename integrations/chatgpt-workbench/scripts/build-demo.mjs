import {build} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildNativePaused} from './build-native-paused.mjs';
const root = new URL('../', import.meta.url);
const output = await build({entryPoints: [fileURLToPath(new URL('client/demo.mjs', root))], bundle:true, write:false, format:'iife', minify:false});
const template = await readFile(new URL('client/demo.html', root), 'utf8');
await mkdir(new URL('dist/', root), {recursive:true});
const code = output.outputFiles[0].text.replaceAll('</script', '<\\/script');
new Script(code, {filename: 'demo.bundle.js'});
// A function replacement preserves literal $& and $' inside bundled dependencies.
await writeFile(new URL('dist/demo-dev.html', root), template.replace('<!-- SCRIPT -->', () => `<script>${code}</script>`));
await buildNativePaused();
console.log('已保留演示开发资源；原生入口保留启用或隔离状态');
