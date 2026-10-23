// Read-only live acceptance; use a disposable grant and never log its payload.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createDshCloudClient} from '../src/adapters/dsh/cloud-client.js';
const origin='https://cuigengji-private-workbench.cuigengji-chatgpt-workbench.workers.dev';
const key=(await readFile(new URL('../.data/moji-private-access/MOJI_OWNER_KEY.txt',import.meta.url),'utf8')).trim();
const records=new Map(),credentials={readRecord:async k=>records.get(k),modifyRecord:async(k,fn)=>{const value=await fn(records.get(k));if(value)records.set(k,value);else records.delete(k);return value;},deleteRecord:async k=>records.delete(k)};
const client=createDshCloudClient({credentials});
const json=async response=>{assert.ok(response.ok,'Unexpected HTTP '+response.status);return response.json();};
try{
  const health=await json(await fetch(origin+'/health'));
  assert.equal((await fetch(origin+'/mcp')).status,401);
  assert.equal((await fetch(origin+'/mcp/dsh/dispatch',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  const {authorizationUrl}=await client.beginLogin(origin);
  const authorization=await fetch(authorizationUrl),html=await authorization.text();assert.equal(authorization.status,200);
  const handle=/name="handle" value="([^"]+)"/.exec(html)?.[1];assert.ok(handle);
  const cookie=authorization.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
  const approved=await fetch(origin+'/authorize',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Cookie:cookie,Origin:origin},body:new URLSearchParams({handle,key,decision:'approve'}),redirect:'manual'});assert.equal(approved.status,302);
  const callback=await fetch(approved.headers.get('location'));assert.equal(callback.status,200);
  assert.equal((await client.status(origin)).authenticated,true);
  const dshBooks=await client.rpc(origin,'novel.list',{includeImages:false},'dsh-live-read-check','human');
  const grantKey=[...records.keys()][0];let grant=records.get(grantKey).payload;
  const mcp=async(name,args)=>{
    const response=await fetch(origin+'/mcp',{method:'POST',headers:{Authorization:'Bearer '+grant.accessToken,'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});
    const value=await json(response);assert.ok(!value.result.isError);return value.result.structuredContent.result;
  };
  const codexBooks=await mcp('workbench_query',{action:'novel.list',args:{includeImages:false}});
  const uiBooks=await mcp('workbench_ui_rpc',{action:'novel.list',args:{includeImages:false},sessionId:'dsh-live-read-check'});
  const ids=books=>books.map(book=>book.id).sort();assert.deepEqual(ids(dshBooks),ids(codexBooks));assert.deepEqual(ids(dshBooks),ids(uiBooks));
  assert.equal(await client.rpc(origin,'binding.get',{},'dsh-live-read-check','agent'),null);
  const oldRefresh=grant.refreshToken;records.set(grantKey,{kind:'grant',payload:{...grant,expiresAt:0}});
  await client.rpc(origin,'novel.list',{includeImages:false},'dsh-live-read-check','human');grant=records.get(grantKey).payload;assert.notEqual(grant.refreshToken,oldRefresh);
  await client.logout(origin);assert.equal(records.size,0);
  const report={ok:true,cloudVersion:health.version,nativePkce:true,originalMcpReadable:true,originalUiRpcReadable:true,sameLibrary:true,novels:dshBooks.length,refreshRotation:true,revokedDisposableGrant:true,novelWrites:0};
  await writeFile(new URL('../.data/dsh-candidate/live-cloud-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await client.logout(origin).catch(()=>{});client.close();}
