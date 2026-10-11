import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {z} from 'zod';
import {createCloudService,QUERY_ACTIONS,EDIT_ACTIONS} from './service.mjs';
import {authorize,authConfig,requireScope} from './auth.mjs';
const uri='ui://cuigengji/cloud-v032';
function createServer(service,auth,env){
  const server=new McpServer({name:'cuigengji-private-cloud',version:'0.3.2-stability'});
  // Keep previously opened conversations readable while new calls use a fresh UI cache key.
  for(const resourceUri of [uri,'ui://cuigengji/cloud-v031','ui://cuigengji/cloud-v030'])server.registerResource('novel-workbench-'+resourceUri.slice(-4),resourceUri,{mimeType:'text/html;profile=mcp-app'},async()=>({contents:[{uri:resourceUri,mimeType:'text/html;profile=mcp-app',text:(await (await env.ASSETS.fetch('https://assets.invalid/index.html')).text()).replace('<html ','<html data-mcp-app="true" '),_meta:{'openai/ui':{preferredDisplayMode:'inline',availableDisplayModes:['inline','fullscreen']}}}]}));
  const argsSchema=z.record(z.string(),z.unknown()).optional();
  const define=(name,description,inputSchema,read,fn,ui)=>server.registerTool(name,{description,inputSchema,annotations:{readOnlyHint:read,destructiveHint:!read,openWorldHint:false},_meta:{securitySchemes:[{type:'oauth2',scopes:['novel:read',...(read?[]:['novel:write'])]}],...(ui?{ui,'openai/widgetAccessible':true,...(ui.visibility?.includes('app')?{'openai/visibility':'private'}:{}),...(ui.resourceUri?{'openai/outputTemplate':ui.resourceUri}:{})}:{}),...(name==='workbench_open'?{'openai/ui':{entrypoints:[{type:'thread'}]}}:{})}},async args=>{
    try{requireScope(auth,read?'novel:read':'novel:write');const result=await fn(args);return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:{result}};}
    catch(error){return {isError:true,content:[{type:'text',text:`${error.code||'ERROR'}: ${error.message}`} ]};}
  });
  define('workbench_open','打开私有小说工作台。手机展开后可查看和轻量编辑。',{contextId:z.string().optional()},true,async a=>({...await service.bootstrap(a.contextId||'cloud'),contextId:a.contextId||'cloud'}),{resourceUri:uri});
  define('workbench_bootstrap','载入作者工作台',{sessionId:z.string()},true,a=>service.bootstrap(a.sessionId),{visibility:['app']});
  define('workbench_ui_rpc','作者工作台操作',{action:z.string(),args:argsSchema,sessionId:z.string()},false,a=>service.rpc(a.action,a.args,a.sessionId,'human'),{visibility:['app']});
  define('workbench_query','按需读取正文、人物、世界、规划和写作要求；提供作品 ID。',{action:z.enum(QUERY_ACTIONS),args:argsSchema},true,a=>service.rpc(a.action,a.args,'model','agent'));
  define('workbench_edit','仅在作者明确要求修改后写入，携带读取版本；冲突停止覆盖。',{action:z.enum(EDIT_ACTIONS),args:argsSchema},false,a=>service.rpc(a.action,a.args,'model','agent'));
  define('workbench_history','读取修改来源与修改前正文或资料。',{novelId:z.string(),entityId:z.string().optional(),limit:z.number().optional()},true,a=>service.collaborationHistory(a));
  return server;
}
async function handleRequest(request,env){
  const url=new URL(request.url);
  try{
    if(url.pathname==='/health')return Response.json({service:'cuigengji-private-cloud',version:'0.3.2-stability'});
    if(['/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/mcp'].includes(url.pathname)){
      const config=authConfig(env);return Response.json({resource:config.resource,authorization_servers:[config.issuer],scopes_supported:['novel:read','novel:write'],bearer_methods_supported:['header']});
    }
    if(url.pathname!=='/mcp')return new Response('请从 ChatGPT／Work 插件入口打开小说工作台。',{status:404});
    const origin=request.headers.get('Origin');
    if(origin&&origin!==url.origin&&!['https://chatgpt.com','https://chat.openai.com'].includes(origin))return new Response('Origin denied',{status:403});
    const auth=await authorize(request,env);requireScope(auth,'novel:read');
    const server=createServer(createCloudService(env.DB,auth.owner),auth,env);
    const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true,maxRequestBodySize:1_000_000});
    await server.connect(transport);
    try{return await transport.handleRequest(request);}finally{await server.close();}
  }catch(error){
    const status=error.status||500;
    return Response.json({error:status===500?'工作台服务异常；请重试，未保存草稿请保留。':error.message},{status,headers:{'Cache-Control':'no-store',...(status===401?{'WWW-Authenticate':`Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource/mcp"`}:{})}});
  }
}
const trustedOrigins=new Set(['https://chatgpt.com','https://chat.openai.com']);
const discoveryPaths=new Set(['/mcp','/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/mcp']);
export default {async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin');
  if(origin&&origin!==url.origin&&!trustedOrigins.has(origin))return new Response('Origin denied',{status:403});
  const headers=new Headers({'Cache-Control':'no-store'});
  if(origin){
    headers.set('Access-Control-Allow-Origin',origin);
    headers.set('Vary','Origin');
    headers.set('Access-Control-Expose-Headers','WWW-Authenticate, Mcp-Session-Id, MCP-Protocol-Version');
  }
  if(request.method==='OPTIONS'&&discoveryPaths.has(url.pathname)){
    headers.set('Access-Control-Allow-Methods','GET, HEAD, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers','Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID');
    headers.set('Access-Control-Max-Age','600');
    return new Response(null,{status:204,headers});
  }
  const response=await handleRequest(request,env);
  for(const [key,value]of response.headers)headers.set(key,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}};
