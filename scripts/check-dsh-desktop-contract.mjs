// Run with the installed desktop executable in ELECTRON_RUN_AS_NODE mode.
import {readFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),semver=require('semver');
const base=join(dirname(process.execPath),'resources/app.asar/dsh/node_modules');
const manifest=JSON.parse(readFileSync(resolve(process.argv[2]||'package.json'),'utf8'));
const pkg=name=>JSON.parse(readFileSync(join(base,'@deepseek-ai',name,'package.json'),'utf8'));
const version=pkg('dsh-app-boot').version;
assert.ok(semver.satisfies(version,manifest.engines.dsh,{includePrerelease:true}));
for(const name of ['dsh-tools','dsh-credentials','dsh-api-session-controller','dsh-client-ui-conversation'])assert.equal(pkg(name).version,version);
const read=(name,path)=>readFileSync(join(base,'@deepseek-ai',name,path),'utf8');
assert.match(read('dsh-credentials','lib/index.js'),/modifyRecord/);
assert.match(read('dsh-api-session-controller','lib/client.js'),/using\(/);
assert.match(read('dsh-client-ui-conversation','lib/client.js'),/send\(text\)/);
const sidebar=read('dsh-client-ui-sidebar-right','lib/client.js');
assert.ok(sidebar.includes('sidebar.right.pane.tab'));
console.log(JSON.stringify({ok:true,desktopDsh:version,supported:manifest.engines.dsh,credentials:true,sessionReference:true,conversationSend:true,rightPaneSlot:true}));
