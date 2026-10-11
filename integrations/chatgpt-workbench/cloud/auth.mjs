import {createRemoteJWKSet,jwtVerify} from 'jose';
const keysets=new Map();
export function authConfig(env){
  if(!env.AUTH0_ISSUER||!env.MCP_RESOURCE)throw Object.assign(new Error('私有云端登录尚未配置'),{status:503});
  const issuer=new URL(env.AUTH0_ISSUER),resource=new URL(env.MCP_RESOURCE);
  if(issuer.protocol!=='https:'||resource.protocol!=='https:'||issuer.pathname!=='/'||resource.pathname!=='/mcp')throw Object.assign(new Error('OAuth 配置无效'),{status:503});
  return {issuer:issuer.href,resource:resource.href,owner:env.OWNER_SUB};
}
export async function authorize(request,env,resolveKeys){
  const config=authConfig(env),token=/^Bearer ([^\s]+)$/.exec(request.headers.get('Authorization')||'')?.[1];
  if(!token)throw Object.assign(new Error('请登录小说工作台'),{status:401});
  // Discovery and the login challenge may be available before author pinning.
  // No token may access data until the operator explicitly pins the author.
  if(!config.owner)throw Object.assign(new Error('作者身份尚未绑定，作品访问仍关闭'),{status:503});
  let keyset=resolveKeys;
  if(!keyset){
    keyset=keysets.get(config.issuer);
    if(!keyset){keyset=createRemoteJWKSet(new URL('.well-known/jwks.json',config.issuer));keysets.set(config.issuer,keyset);}
  }
  let payload;
  try{({payload}=await jwtVerify(token,keyset,{issuer:config.issuer,audience:config.resource,algorithms:['RS256'],requiredClaims:['exp','iat','sub']}));}
  catch{throw Object.assign(new Error('登录已过期或无效，请重新授权'),{status:401});}
  if(payload.sub!==config.owner)throw Object.assign(new Error('此工作台仅允许作者本人访问'),{status:403});
  return {owner:payload.sub,scopes:new Set(String(payload.scope||'').split(' '))};
}
export function requireScope(auth,scope){if(!auth.scopes.has(scope))throw Object.assign(new Error('登录授权缺少所需权限'),{status:403});}
