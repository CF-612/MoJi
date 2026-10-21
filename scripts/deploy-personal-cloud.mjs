import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const root=fileURLToPath(new URL('../',import.meta.url));
const cli=fileURLToPath(new URL('../integrations/chatgpt-workbench/node_modules/wrangler/bin/wrangler.js',import.meta.url));
if(!existsSync(cli)){
  const args=['ci','--prefix','integrations/chatgpt-workbench'];
  const result=process.env.npm_execpath?spawnSync(process.execPath,[process.env.npm_execpath,...args],{cwd:root,stdio:'inherit'}):spawnSync(process.platform==='win32'?'npm.cmd':'npm',args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
}
function run(args){const result=spawnSync(process.execPath,[cli,...args],{cwd:root,stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
// Deployment provisions the template's unbound D1/KV first. Migrations are
// idempotent, use the binding name, and never touch the existing private config.
run(['deploy','--config','wrangler.jsonc']);
run(['d1','migrations','apply','DB','--remote','--config','wrangler.jsonc']);
console.log('墨叽已部署。打开上方 workers.dev 地址；添加 /mcp 即为客户端连接地址。');
