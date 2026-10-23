import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {healthResponse,serviceReadiness} from '../readiness.mjs';

const configured=()=>({MOJI_AUTH:'builtin',MOJI_OWNER_KEY:randomBytes(32).toString('base64url'),OAUTH_KV:{},LOGIN_GUARD:{},WORKBENCH_RUNTIME:{}});
test('readiness database failures are generic and metadata-only',async()=>{
  const env=configured();
  assert.deepEqual(await serviceReadiness(env),{ready:false,stage:'database'});
  const privateDetail='private-database-id secret-token author-work';
  const queries=[];
  env.DB={prepare(sql){queries.push(sql);throw new Error(privateDetail);}};
  const response=await healthResponse(env),body=await response.text();
  assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(JSON.parse(body).stage,'database');assert.ok(!body.includes(privateDetail));assert.ok(!body.includes(env.MOJI_OWNER_KEY));
  assert.equal(queries.length,1);assert.match(queries[0],/FROM sqlite_schema/);
});

test('exact entry readiness: empty/partial/migrated D1 and fail-closed keys (supported harness, not root-template acceptance)',async()=>{
  const base=fileURLToPath(new URL('../../.data/cloud-tests/',import.meta.url));await mkdir(base,{recursive:true});const persist=await mkdtemp(base+'readiness-');await mkdir(persist+'/tmp');process.env.TEMP=process.env.TMP=persist+'/tmp';
  const bundle=await build({entryPoints:[fileURLToPath(new URL('../entry.mjs',import.meta.url))],bundle:true,write:false,format:'esm',platform:'neutral',conditions:['workerd','worker','browser'],external:['node:*','cloudflare:*'],mainFields:['module','main']});
  // Explicitly uses the existing supported harness date. The root template date
  // is intentionally untouched; this is P0 behavior evidence, not P1 acceptance.
  const key=randomBytes(32).toString('base64url');
  const settings={resourcePersistencePath:persist,resourceTmpPath:persist+'/tmp',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-10',compatibilityFlags:['nodejs_compat'],kvNamespaces:['OAUTH_KV'],d1Databases:{DB:'readiness-test'},durableObjects:{WORKBENCH_RUNTIME:{className:'WorkbenchRuntime',useSQLite:true},LOGIN_GUARD:{className:'LoginGuard',useSQLite:true}},bindings:{MOJI_AUTH:'builtin',MOJI_OWNER_KEY:key},outboundService:()=>new Response('Network disabled in test',{status:403})};
  const mf=new Miniflare(convertV4MiniflareOptions(settings)),origin='https://readiness.example';
  async function check(expected,status=503){
    const response=await mf.dispatchFetch(origin+'/health'),body=await response.text();
    assert.equal(response.status,status);assert.equal(JSON.parse(body).stage,expected);assert.equal(JSON.parse(body).ready,status===200);assert.ok(!body.includes(key));
    const root=await mf.dispatchFetch(origin+'/');assert.equal(root.status,status);const html=await root.text();assert.ok(!html.includes('你的个人云端工作台已就绪'));
    if(status===200){assert.match(html,/尚待验收/);assert.match(html,/不是浏览器编辑器/);}
  }
  try{
    await check('migrations');
    const db=await mf.getD1Database('DB');
    for(const name of ['0001_workspace.sql','0002_workspace_blobs.sql']){
      const sql=await readFile(new URL('../migrations/'+name,import.meta.url),'utf8');
      for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();
      if(name==='0001_workspace.sql')await check('migrations');
    }
    await check('ready',200);
    assert.equal((await mf.dispatchFetch(origin+'/mcp')).status,401,'readiness does not authenticate a client');
    assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM workspaces').first()).count,0,'public readiness must not create/read author workspaces');
    const syntheticOwner='synthetic-readiness-author',syntheticState=JSON.stringify({title:'synthetic-private-work',content:'preserve this fixture'});
    await db.prepare('INSERT INTO workspaces(owner,revision,state,event,updated_at) VALUES(?,1,?,?,?)').bind(syntheticOwner,syntheticState,'{}','2026-10-23T00:00:00Z').run();
    await db.prepare('INSERT INTO workspace_blobs(owner,digest,state) VALUES(?,?,?)').bind(syntheticOwner,'synthetic-digest',syntheticState).run();
    // Reapply both real additive migrations against existing content, then
    // reload the exact Worker with the same bindings (a local update analogue).
    for(const name of ['0001_workspace.sql','0002_workspace_blobs.sql']){
      const sql=await readFile(new URL('../migrations/'+name,import.meta.url),'utf8');
      for(const s of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g))await db.prepare(s).run();
    }
    await mf.setOptions(convertV4MiniflareOptions(settings));await check('ready',200);
    const updatedDb=await mf.getD1Database('DB');
    assert.deepEqual(await updatedDb.prepare('SELECT owner,revision,state FROM workspaces').first(),{owner:syntheticOwner,revision:1,state:syntheticState});
    assert.equal((await updatedDb.prepare('SELECT state FROM workspace_blobs').first()).state,syntheticState);
    await updatedDb.prepare('UPDATE workspaces SET revision=2 WHERE owner=?').bind(syntheticOwner).run();
    assert.equal((await updatedDb.prepare('SELECT state FROM workspace_history').first()).state,syntheticState,'history trigger survives repeated migrations');
    for(const path of ['/health','/']){
      const body=await (await mf.dispatchFetch(origin+path)).text();
      assert.ok(!body.includes(syntheticOwner));assert.ok(!body.includes('synthetic-private-work'));assert.ok(!body.includes(key));
    }
    await updatedDb.prepare('DROP TRIGGER preserve_workspace').run();await check('migrations');
    await mf.setOptions(convertV4MiniflareOptions({...settings,d1Databases:{}}));
    await check('database');
    for(const invalidKey of [undefined,'short','replace-with-your-own-secret-key']){
      await mf.setOptions(convertV4MiniflareOptions({...settings,bindings:{MOJI_AUTH:'builtin',...(invalidKey===undefined?{}:{MOJI_OWNER_KEY:invalidKey})}}));
      await check('configuration');
      for(const path of ['/mcp','/mcp/dsh/dispatch','/authorize','/oauth/register','/oauth/token'])assert.equal((await mf.dispatchFetch(origin+path)).status,503,`${path} must remain closed`);
    }
  }finally{await mf.dispose();}
});
