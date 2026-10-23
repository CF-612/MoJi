import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
// Optional code-only deployment artifact; contains the same UI as ASSETS.
await build({
 entryPoints:[fileURLToPath(new URL('../cloud/embedded-entry.mjs',import.meta.url))],
 outfile:fileURLToPath(new URL('../dist/cloud-embedded.mjs',import.meta.url)),
 bundle:true,minify:true,format:'esm',platform:'neutral',
 conditions:['workerd','worker','browser'],mainFields:['module','main'],
 external:['node:*','cloudflare:*'],loader:{'.html':'text'}
});
