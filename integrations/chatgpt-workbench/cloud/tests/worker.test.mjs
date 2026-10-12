import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {gzipSync} from 'node:zlib';
test('真实 Worker：OAuth 保护、MCP 初始化、工具读写及原生 UI 资源',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'worker-');await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const {privateKey,publicKey}=await generateKeyPair('RS256');const jwks={keys:[{...await exportJWK(publicKey),kid:'test',alg:'RS256'}]};
  const env={AUTH0_ISSUER:'https://tenant.auth0.com/',MCP_RESOURCE:'https://novel.example/mcp',OWNER_SUB:'auth0|author'};
  const token=await new SignJWT({scope:'novel:read novel:write'}).setProtectedHeader({alg:'RS256',kid:'test'}).setSubject(env.OWNER_SUB).setIssuer(env.AUTH0_ISSUER).setAudience(env.MCP_RESOURCE).setIssuedAt().setExpirationTime('5m').sign(privateKey);
  const bundle=await build({entryPoints:[fileURLToPath(new URL('../entry.mjs',import.meta.url))],bundle:true,write:false,format:'esm',platform:'neutral',conditions:['workerd','worker','browser'],external:['node:*','cloudflare:*'],mainFields:['module','main']});
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-10',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'worker-demo'},durableObjects:{WORKBENCH_RUNTIME:{className:'WorkbenchRuntime',useSQLite:true}},bindings:env,serviceBindings:{ASSETS:()=>new Response(html)},outboundService:request=>request.url==='https://tenant.auth0.com/.well-known/jwks.json'?Response.json(jwks):new Response('Blocked in test',{status:403})}));
  try{
    const db=await mf.getD1Database('DB');const sql=await Promise.all(['../migrations/0001_workspace.sql','../migrations/0002_workspace_blobs.sql'].map(p=>readFile(new URL(p,import.meta.url),'utf8'))).then(v=>v.join('\n'));for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();
    assert.equal((await mf.dispatchFetch('http://localhost/mcp')).status,401);
    let id=0;const call=async(method,params={})=>{
      const response=await mf.dispatchFetch('http://localhost/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream',Authorization:`Bearer ${token}`},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params})});
      assert.equal(response.status,200,await response.clone().text());const json=await response.json();assert.equal(json.error,undefined,JSON.stringify(json.error));return json.result;
    };
    assert.ok((await call('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'qa',version:'1'}})).capabilities.tools);
    const listing=await call('tools/list');assert.ok(listing.tools.some(t=>t.name==='workbench_edit'));
    assert.ok(listing.tools.some(t=>t.name==='workbench_import_preview'),'聊天 AI 必须有导入预览工具');
    assert.ok(listing.tools.some(t=>t.name==='workbench_import'),'聊天 AI 必须有携带预览证明的导入工具');
    const openTool=listing.tools.find(t=>t.name==='workbench_open');
    assert.equal(openTool._meta.ui.resourceUri,'ui://cuigengji/cloud-v060');
    assert.equal(openTool._meta['openai/outputTemplate'],openTool._meta.ui.resourceUri);
    for(const name of ['workbench_bootstrap','workbench_ui_rpc']){
      const tool=listing.tools.find(t=>t.name===name);
      assert.equal(tool._meta['openai/widgetAccessible'],true,'旧组件桥接也必须允许界面调用 '+name);
      assert.deepEqual(tool._meta.ui.visibility,['app']);
      assert.equal(tool._meta['openai/visibility'],'private');
    }
    const opened=await call('tools/call',{name:'workbench_open',arguments:{contextId:'mobile-qa'}});assert.equal(opened.isError,undefined);
    const novelId=opened.structuredContent.result.books[0].id;
    const chapters=await call('tools/call',{name:'workbench_query',arguments:{action:'chapter.list',args:{novelId}}});assert.equal(chapters.structuredContent.result.length,1);
    const ui=async(action,args={})=>{const result=await call('tools/call',{name:'workbench_ui_rpc',arguments:{action,args,sessionId:'mobile-qa'}});assert.equal(result.isError,undefined,JSON.stringify(result.content));return result.structuredContent.result;};
    const manuscript=Array.from({length:60},(_,i)=>`## 第${i+1}章 来信\n\n`+'　　“雨停了。”——她说。\n\n'.repeat(1200)).join('\n\n');
    const file={name:'batch.json',json:{format:'cuigengji-batch',version:1,files:[{file:{name:'长篇.md',gzipBase64:gzipSync(manuscript).toString('base64')},kind:'chapters'}]}},options={mode:'copy',targetId:novelId};
    const preview=await ui('transfer.preview',{file,options});assert.ok(preview.valid);assert.equal(preview.counts.chapters,60);
    await ui('transfer.import',{file,options,proof:preview.proof,requestId:crypto.randomUUID()});assert.equal((await ui('chapter.list',{novelId})).length,61);
    const snapshots=await ui('transfer.snapshots');assert.equal(snapshots.length,1);
    const restoreFile=await ui('transfer.snapshot.get',{id:snapshots[0].id});const restoreOptions={mode:'restore',replaceExisting:true};const restore=await ui('transfer.preview',{file:restoreFile,options:restoreOptions});assert.ok(restore.valid);
    await ui('transfer.import',{file:restoreFile,options:restoreOptions,proof:restore.proof,requestId:crypto.randomUUID()});assert.equal((await ui('chapter.list',{novelId})).length,1);
    const runtime=await mf.getDurableObjectNamespace('WORKBENCH_RUNTIME');assert.equal((await runtime.getByName('foreign').invoke('auth0|foreign','rpc',['novel.list',{},'test','human'])).error.code,'FORBIDDEN');
    const resource=await call('resources/read',{uri:'ui://cuigengji/cloud-v030'});assert.match(resource.contents[0].text,/data-mcp-app="true"/);assert.equal(resource.contents[0]._meta['openai/ui'].preferredDisplayMode,'inline');
    const current=await call('resources/read',{uri:openTool._meta.ui.resourceUri});assert.match(current.contents[0].text,/data-mcp-app="true"/);
    const aiFile={name:'批量.json',json:{format:'cuigengji-batch',version:1,files:[{file:{name:'第1章.txt',text:'　　“无需改写。”——她说。'},kind:'chapters'}]}},aiOptions={mode:'copy',title:'聊天 AI 导入'};
    const aiPreview=await call('tools/call',{name:'workbench_import_preview',arguments:{file:aiFile,options:aiOptions}});assert.equal(aiPreview.isError,undefined);
    const aiArgs={file:aiFile,options:aiOptions,proof:aiPreview.structuredContent.result.proof,requestId:crypto.randomUUID()};
    const imported=await call('tools/call',{name:'workbench_import',arguments:aiArgs});assert.equal(imported.isError,undefined);assert.equal(imported.structuredContent.result.counts.chapters,1);
    assert.ok((await call('tools/call',{name:'workbench_import',arguments:aiArgs})).structuredContent.result.repeated);
    const created=await call('tools/call',{name:'workbench_edit',arguments:{action:'novel.create',args:{title:'AI 新建作品',requestId:crypto.randomUUID()}}});assert.equal(created.isError,undefined);
    assert.equal((await mf.dispatchFetch('http://localhost/index.html')).status,404);
  }finally{await mf.dispose();}
});
