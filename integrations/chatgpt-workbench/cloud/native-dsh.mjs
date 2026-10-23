import {createHash} from 'node:crypto';
import {HUMAN_ACTIONS,TOOL_ACTIONS,isReadAction} from '../../../src/contracts/actions.js';
import {runtimeService} from './runtime-client.mjs';
import {requireScope} from './auth.mjs';

const modelActions=new Set(Object.values(TOOL_ACTIONS).flat());
const humanActions=new Set([...HUMAN_ACTIONS,'transfer.snapshots','transfer.snapshot.get']);
const reads=new Set(['settings.get','transfer.catalog','transfer.inspect','transfer.preview','transfer.exportPreview','transfer.export','transfer.snapshots','transfer.snapshot.get','workspace.status','workspace.export','workspace.preview','legacy.preview']);
const fail=(code,message,status=400)=>{throw Object.assign(new Error(message),{code,status});};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);

async function jsonBody(request){
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')fail('INVALID_INPUT','请使用 JSON 请求',415);
  const reader=request.body?.getReader();if(!reader)fail('INVALID_INPUT','请求内容为空');
  const parts=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8_000_000){await reader.cancel();fail('CAPACITY_EXCEEDED','请求超过 8 MB',413);}parts.push(value);}}
  finally{reader.releaseLock();}
  try{const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.length;}return JSON.parse(new TextDecoder().decode(buffer));}
  catch{fail('INVALID_INPUT','请求内容不是有效 JSON');}
}

/** Native DSH uses its existing host RPC; all data stays in the original owner DO. */
export async function handleNativeDsh(request,env,auth,serviceFactory=runtimeService){
  const headers={'Cache-Control':'no-store'};
  try{
    if(request.method!=='POST')fail('INVALID_INPUT','仅支持 POST',405);
    const origin=request.headers.get('Origin');if(origin&&origin!==new URL(request.url).origin)fail('FORBIDDEN','来源不允许',403);
    if(!auth?.owner||!auth.clientId)fail('UNAUTHENTICATED','请重新连接墨叽',401);
    requireScope(auth,'novel:read');
    const body=await jsonBody(request);
    if(!object(body)||!object(body.args??{})||typeof body.action!=='string'||typeof body.sessionId!=='string'||!body.sessionId.trim()||body.sessionId.length>512||!['human','agent'].includes(body.kind))fail('INVALID_INPUT','原生工作台参数无效');
    const {action,kind}=body,args={...(body.args??{})};
    for(const key of ['actor','sessionId','owner','clientId','kind'])delete args[key];
    if(!(kind==='agent'?modelActions:humanActions).has(action))fail('NOT_ALLOWED','此入口不支持该操作',403);
    if(!isReadAction(action)&&!reads.has(action))requireScope(auth,'novel:write');
    // OAuth client namespaces host sessions. It is not proof of a human gesture;
    // this personal-instance API retains the same owner-authorized UI capabilities.
    const sessionId='dsh:'+createHash('sha256').update(auth.clientId+'\0'+body.sessionId).digest('hex');
    const service=serviceFactory(env,auth.owner);
    let result;
    if(kind==='agent'){
      const binding=await service.rpc('binding.get',{},sessionId,'human');
      if(action==='binding.get')return Response.json({result:binding},{headers});
      if(!binding?.novelId)fail('UNBOUND','请先在墨叽面板绑定小说',409);
      if(args.novelId&&args.novelId!==binding.novelId)fail('FORBIDDEN','不能访问另一部小说',403);
      result=await service.rpc(action,{...args,novelId:binding.novelId},sessionId,'agent');
    }else result=await service.rpc(action,args,sessionId,'human');
    return Response.json({result},{headers});
  }catch(error){return Response.json({error:error.status===500?'云端操作失败，请保留草稿后重试':error.message,code:error.code||'DSH_CLOUD_ERROR'},{status:error.status||(error.code==='CONFLICT'?409:400),headers});}
}
