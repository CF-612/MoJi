import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';

// This is the release-template gate, not the shortened-TTL provider unit harness.
// Build commands must run first. No date, flags, entry, owner or TTL overrides.
test('actual root template: runtime, readiness, OAuth and persistent default-owner storage',async()=>{
  const root=fileURLToPath(new URL('../../../../',import.meta.url));
  const config=JSON.parse(await readFile(resolve(root,'wrangler.jsonc'),'utf8'));
  const base=resolve(root,'integrations/chatgpt-workbench/.data/cloud-tests');
  await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'/root-template-');
  await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const bundle=await build({entryPoints:[resolve(root,config.main)],bundle:true,write:false,format:'esm',platform:'neutral',conditions:['workerd','worker','browser'],external:['node:*','cloudflare:*'],mainFields:['module','main']});
  const sqliteClasses=new Set(config.migrations.flatMap(m=>m.new_sqlite_classes||[]));
  const settings={resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:bundle.outputFiles[0].text,
    compatibilityDate:config.compatibility_date,compatibilityFlags:config.compatibility_flags,
    bindings:{...config.vars},kvNamespaces:config.kv_namespaces.map(k=>k.binding),
    d1Databases:Object.fromEntries(config.d1_databases.map(d=>[d.binding,'isolated-root-template-'+d.database_name])),
    durableObjects:Object.fromEntries(config.durable_objects.bindings.map(d=>[d.name,{className:d.class_name,useSQLite:sqliteClasses.has(d.class_name)}])),
    assets:{...config.assets,directory:resolve(root,config.assets.directory),routerConfig:{has_user_worker:!!config.main}},
    outboundService:()=>new Response('External network disabled in root-template test',{status:403})};
  const key=randomBytes(32).toString('base64url'),origin='https://root-template.example',callback='https://client.example/callback';
  let mf=new Miniflare(convertV4MiniflareOptions(settings));
  const request=(path,options)=>mf.dispatchFetch(origin+path,options);
  const form=(path,data,headers={})=>request(path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',...headers},body:new URLSearchParams(data).toString(),redirect:'manual'});
  const health=async(stage,status)=>{const response=await request('/health');const body=await response.text();assert.equal(response.status,status,body);assert.equal(JSON.parse(body).stage,stage);assert.ok(!body.includes(key));};
  const migrate=async()=>{const db=await mf.getD1Database('DB');for(const definition of config.d1_databases){const dir=resolve(root,definition.migrations_dir);for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql')).sort()){const sql=await readFile(resolve(dir,name),'utf8');const statements=sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g);assert.ok(statements?.length,'migration statements must be applied, not silently skipped');assert.equal(statements.reduce((rest,statement)=>rest.replace(statement,''),sql).replace(/--[^\n]*/g,'').trim(),'','new migration syntax requires test runner support');for(const statement of statements)await db.prepare(statement).run();}}};
  try{
    await health('configuration',503);
    for(const path of ['/mcp','/mcp/dsh/dispatch','/authorize','/oauth/register','/oauth/token'])assert.equal((await request(path)).status,503,path+' must fail closed without a key');
    settings.bindings.MOJI_OWNER_KEY=key;await mf.setOptions(convertV4MiniflareOptions(settings));
    await health('migrations',503);await migrate();await health('ready',200);
    assert.equal((await request('/mcp')).status,401);
    const rootPage=await request('/');assert.equal(rootPage.status,200);assert.match(await rootPage.text(),/尚待验收/);
    const discovery=await (await request('/.well-known/oauth-authorization-server')).json();assert.ok(discovery.grant_types_supported.includes('refresh_token'));
    const registration=await request('/oauth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_name:'Synthetic root template test',redirect_uris:[callback],grant_types:['authorization_code','refresh_token'],response_types:['code'],token_endpoint_auth_method:'none'})});
    assert.equal(registration.status,201);const client=await registration.json();
    const verifier=randomBytes(48).toString('base64url'),challenge=createHash('sha256').update(verifier).digest('base64url');
    const query=new URLSearchParams({client_id:client.client_id,redirect_uri:callback,response_type:'code',scope:'novel:read novel:write offline_access',state:'synthetic-state',code_challenge:challenge,code_challenge_method:'S256',resource:origin+'/mcp'});
    const invalidCallback=new URLSearchParams(query);invalidCallback.set('redirect_uri','https://other.example/callback');assert.notEqual((await request('/authorize?'+invalidCallback)).status,200);
    async function authorize(checkNegatives=false){
      const page=await request('/authorize?'+query);assert.equal(page.status,200);const handle=/name="handle" value="([^"]+)"/.exec(await page.text())[1],cookie=page.headers.get('set-cookie').split(';')[0];
      const data={handle,key,decision:'approve'};
      if(checkNegatives)for(const Origin of ['https://evil.example','null'])assert.equal((await form('/authorize',data,{Cookie:cookie,Origin})).status,403);
      const approved=await form('/authorize',data,{Cookie:cookie,Origin:origin});assert.equal(approved.status,200);
      const html=await approved.text(),redirect=new URL(html.match(/<a href="([^"]+)"/)[1].replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))));assert.equal(redirect.searchParams.get('state'),'synthetic-state');
      if(checkNegatives)assert.equal((await form('/authorize',data,{Cookie:cookie,Origin:origin})).status,400,'consent replay rejected');
      return {grant_type:'authorization_code',code:redirect.searchParams.get('code'),client_id:client.client_id,redirect_uri:callback,code_verifier:verifier,resource:origin+'/mcp'};
    }
    const badPkce=await authorize();assert.equal((await form('/oauth/token',{...badPkce,code_verifier:randomBytes(48).toString('base64url')})).status,400);
    const badCallback=await authorize();assert.equal((await form('/oauth/token',{...badCallback,redirect_uri:'https://other.example/callback'})).status,400);
    const exchange=await authorize(true),issued=await form('/oauth/token',exchange);assert.equal(issued.status,200);let tokens=await issued.json();assert.equal(tokens.expires_in,3600,'actual entry keeps production default TTL');assert.ok(tokens.refresh_token);
    assert.equal((await form('/oauth/token',exchange)).status,400,'authorization code replay rejected (provider also revokes that grant)');
    const fresh=await form('/oauth/token',await authorize());assert.equal(fresh.status,200);tokens=await fresh.json();
    const native=async(action,args={})=>{const response=await request('/mcp/dsh/dispatch',{method:'POST',headers:{Authorization:'Bearer '+tokens.access_token,'Content-Type':'application/json'},body:JSON.stringify({action,args,kind:'human',sessionId:'synthetic-root-test'})});const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));assert.equal(value.error,undefined);return value.result;};
    const books=await native('novel.list'),novelId=books[0].id,chapter=(await native('chapter.list',{novelId}))[0];
    const initial=await native('chapter.get',{novelId,chapterId:chapter.id});const content='Synthetic root-template persistence check.';
    await native('chapter.update',{novelId,chapterId:chapter.id,expectedRevision:initial.revision,content,requestId:'synthetic-root-save'});
    const db=await mf.getD1Database('DB');assert.equal((await db.prepare('SELECT owner FROM workspaces').first()).owner,'moji-owner');
    await migrate();await mf.dispose();mf=new Miniflare(convertV4MiniflareOptions(settings));await health('ready',200);
    assert.equal((await native('chapter.get',{novelId,chapterId:chapter.id})).content,content,'real storage survives runtime restart and repeated migrations');
    const refresh=token=>form('/oauth/token',{grant_type:'refresh_token',refresh_token:token,client_id:client.client_id,resource:origin+'/mcp'});
    const firstRefresh=tokens.refresh_token,renewed=await refresh(firstRefresh);assert.equal(renewed.status,200);tokens=await renewed.json();assert.notEqual(tokens.refresh_token,firstRefresh);
    const previousReuse=await refresh(firstRefresh);assert.equal(previousReuse.status,200,'provider 1.2.3 accepts immediately previous refresh token for retry');tokens=await previousReuse.json();
    const next=await refresh(tokens.refresh_token);assert.equal(next.status,200);tokens=await next.json();
    assert.equal((await refresh(firstRefresh)).status,400,'older-than-previous refresh token rejected');
    assert.equal((await native('chapter.get',{novelId,chapterId:chapter.id})).content,content);
    const revoke=await form('/oauth/token',{token:tokens.refresh_token,client_id:client.client_id});assert.equal(revoke.status,200);assert.equal((await refresh(tokens.refresh_token)).status,400);
    assert.equal((await request('/mcp',{headers:{Authorization:'Bearer '+tokens.access_token}})).status,401,'revocation also blocks issued access token');
    // No simulated passage of time: this gate proves default TTL issuance and
    // refresh/revocation, not an elapsed one-hour client auto-renewal session.
  }finally{await mf.dispose();await rm(persist,{recursive:true,force:true});}
});
