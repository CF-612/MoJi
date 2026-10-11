import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
test('真实 Worker：OAuth 保护、MCP 初始化、工具读写及原生 UI 资源',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'worker-');await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const {privateKey,publicKey}=await generateKeyPair('RS256');const jwks={keys:[{...await exportJWK(publicKey),kid:'test',alg:'RS256'}]};
  const env={AUTH0_ISSUER:'https://tenant.auth0.com/',MCP_RESOURCE:'https://novel.example/mcp',OWNER_SUB:'auth0|author'};
  const token=await new SignJWT({scope:'novel:read novel:write'}).setProtectedHeader({alg:'RS256',kid:'test'}).setSubject(env.OWNER_SUB).setIssuer(env.AUTH0_ISSUER).setAudience(env.MCP_RESOURCE).setIssuedAt().setExpirationTime('5m').sign(privateKey);
  const bundle=await build({entryPoints:[fileURLToPath(new URL('../worker.mjs',import.meta.url))],bundle:true,write:false,format:'esm',platform:'neutral',conditions:['workerd','worker','browser'],external:['node:crypto','node:util'],mainFields:['module','main']});
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  const mf=new Miniflare(convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-10',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'worker-demo'},bindings:env,serviceBindings:{ASSETS:()=>new Response(html)},outboundService:request=>request.url==='https://tenant.auth0.com/.well-known/jwks.json'?Response.json(jwks):new Response('Blocked in test',{status:403})}));
  try{
    const db=await mf.getD1Database('DB');const sql=await readFile(new URL('../migrations/0001_workspace.sql',import.meta.url),'utf8');for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();
    assert.equal((await mf.dispatchFetch('http://localhost/mcp')).status,401);
    let id=0;const call=async(method,params={})=>{
      const response=await mf.dispatchFetch('http://localhost/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream',Authorization:`Bearer ${token}`},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params})});
      assert.equal(response.status,200,await response.clone().text());const json=await response.json();assert.equal(json.error,undefined,JSON.stringify(json.error));return json.result;
    };
    assert.ok((await call('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'qa',version:'1'}})).capabilities.tools);
    const listing=await call('tools/list');assert.ok(listing.tools.some(t=>t.name==='workbench_edit'));
    const openTool=listing.tools.find(t=>t.name==='workbench_open');
    assert.equal(openTool._meta.ui.resourceUri,'ui://cuigengji/cloud-v032');
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
    const resource=await call('resources/read',{uri:'ui://cuigengji/cloud-v030'});assert.match(resource.contents[0].text,/data-mcp-app="true"/);assert.equal(resource.contents[0]._meta['openai/ui'].preferredDisplayMode,'inline');
    const current=await call('resources/read',{uri:openTool._meta.ui.resourceUri});assert.match(current.contents[0].text,/data-mcp-app="true"/);
    assert.equal((await mf.dispatchFetch('http://localhost/index.html')).status,404);
  }finally{await mf.dispose();}
});
