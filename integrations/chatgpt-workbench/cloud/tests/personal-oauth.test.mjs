import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createHash,randomBytes} from 'node:crypto';

test('个人实例 OAuth：PKCE、密钥/CSRF、到期后静默续期、重启、轮换与撤销',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'oauth-');await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const key=randomBytes(32).toString('base64url');
  const bundle=await build({stdin:{contents:`import {personalProvider,LoginGuard} from './personal-oauth.mjs'; export {LoginGuard}; export {WorkbenchRuntime} from './runtime.mjs'; export default {fetch(r,e,c){return personalProvider(new URL(r.url).origin,{accessTokenTTL:60}).fetch(r,e,c)}}`,resolveDir:fileURLToPath(new URL('../',import.meta.url))},bundle:true,write:false,format:'esm',platform:'neutral',conditions:['workerd','worker','browser'],external:['node:*','cloudflare:*'],mainFields:['module','main']});
  const options=convertV4MiniflareOptions({resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-10',compatibilityFlags:['nodejs_compat'],kvNamespaces:['OAUTH_KV'],d1Databases:{DB:'oauth-test'},durableObjects:{WORKBENCH_RUNTIME:{className:'WorkbenchRuntime',useSQLite:true},LOGIN_GUARD:{className:'LoginGuard',useSQLite:true}},bindings:{MOJI_AUTH:'builtin',MOJI_OWNER_KEY:key,OWNER_SUB:'auth0|existing-author'},serviceBindings:{ASSETS:()=>new Response('<html></html>')}});
  let mf=new Miniflare(options);const origin='https://moji.example';
  const form=(path,data,headers={})=>mf.dispatchFetch(origin+path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',...headers},body:new URLSearchParams(data).toString(),redirect:'manual'});
  try{
    const db=await mf.getD1Database('DB');for(const name of ['0001_workspace.sql','0002_workspace_blobs.sql']){const sql=await readFile(new URL('../migrations/'+name,import.meta.url),'utf8');for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();}
    const missing=await mf.dispatchFetch(origin+'/mcp');assert.equal(missing.status,401,await missing.text());
    const discovery=await (await mf.dispatchFetch(origin+'/.well-known/oauth-authorization-server')).json();assert.ok(discovery.grant_types_supported.includes('refresh_token'));
    const register=await mf.dispatchFetch(origin+'/oauth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_name:'MoJi test',redirect_uris:['https://client.example/callback'],grant_types:['authorization_code','refresh_token'],response_types:['code'],token_endpoint_auth_method:'none'})});assert.equal(register.status,201,await register.clone().text());const client=await register.json();
    const verifier=randomBytes(48).toString('base64url'),challenge=createHash('sha256').update(verifier).digest('base64url');
    const query=new URLSearchParams({client_id:client.client_id,redirect_uri:'https://client.example/callback',response_type:'code',scope:'novel:read novel:write offline_access',state:'test-state',code_challenge:challenge,code_challenge_method:'S256',resource:origin+'/mcp'});
    const authorize=await mf.dispatchFetch(origin+'/authorize?'+query);assert.equal(authorize.status,200);assert.equal(authorize.headers.get('referrer-policy'),'same-origin','browser form POST must preserve its origin');const html=await authorize.text(),handle=/name="handle" value="([^"]+)"/.exec(html)[1];
    const cookie=authorize.headers.get('set-cookie').split(';')[0];
    assert.equal((await form('/authorize',{handle,key,decision:'approve'},{Cookie:cookie,Origin:'https://evil.example'})).status,403);
    assert.equal((await form('/authorize',{handle,key,decision:'approve'},{Cookie:cookie,Origin:'null'})).status,403,'opaque origins remain rejected');
    assert.equal((await form('/authorize',{handle,key:'wrong',decision:'approve'},{Cookie:cookie,Origin:origin})).status,403);
    const approved=await form('/authorize',{handle,key,decision:'approve'},{Cookie:cookie,Origin:origin});assert.equal(approved.status,302,await approved.clone().text());
    const redirect=new URL(approved.headers.get('location'));assert.equal(redirect.searchParams.get('state'),'test-state');const code=redirect.searchParams.get('code');assert.ok(code);
    assert.equal((await form('/authorize',{handle,key,decision:'approve'},{Cookie:cookie,Origin:origin})).status,400,'同一授权页面不可重放');
    const exchange={grant_type:'authorization_code',code,client_id:client.client_id,redirect_uri:'https://client.example/callback',code_verifier:verifier,resource:origin+'/mcp'};
    const issued=await form('/oauth/token',exchange);assert.equal(issued.status,200,await issued.clone().text());let tokens=await issued.json();assert.ok(tokens.refresh_token);assert.equal(tokens.expires_in,60);
    const mcp=token=>mf.dispatchFetch(origin+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'workbench_open',arguments:{contextId:'oauth-test'}}})});
    const opened=await mcp(tokens.access_token);assert.equal(opened.status,200,await opened.clone().text());assert.ok((await opened.json()).result.structuredContent.result.books.length);
    const rows=await db.prepare('SELECT owner FROM workspaces').all();assert.equal(rows.results[0].owner,'auth0|existing-author','迁移继续访问原作者作品库');
    await new Promise(r=>setTimeout(r,61000));assert.equal((await mcp(tokens.access_token)).status,401);
    const oldRefresh=tokens.refresh_token;
    await mf.dispose();mf=new Miniflare(options);
    const renewed=await form('/oauth/token',{grant_type:'refresh_token',refresh_token:oldRefresh,client_id:client.client_id,resource:origin+'/mcp'});assert.equal(renewed.status,200,await renewed.clone().text());tokens=await renewed.json();assert.ok(tokens.access_token);assert.ok(tokens.refresh_token);assert.notEqual(tokens.refresh_token,oldRefresh);assert.equal((await mcp(tokens.access_token)).status,200);
    const revoked=await form('/oauth/token',{grant_type:'urn:ietf:params:oauth:grant-type:token-exchange',client_id:client.client_id});assert.notEqual(revoked.status,200);
    // The library accepts RFC 7009 token revocation on its token endpoint.
    const revoke=await form('/oauth/token',{token:tokens.refresh_token,client_id:client.client_id});assert.equal(revoke.status,200,await revoke.clone().text());
    assert.notEqual((await form('/oauth/token',{grant_type:'refresh_token',refresh_token:tokens.refresh_token,client_id:client.client_id})).status,200);
  }finally{await mf.dispose();}
});
