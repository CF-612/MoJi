import OAuthProvider from '@cloudflare/workers-oauth-provider';
import {DurableObject} from 'cloudflare:workers';
import legacy from './worker.mjs';
import {handleNativeDsh} from './native-dsh.mjs';
import {oauthFailure} from './oauth-failure.mjs';
import {oauthReturnPage} from './oauth-return.mjs';

export const oauthLifetimes={accessTokenTTL:3600,refreshTokenTTL:365*86400,refreshTokenIdleTTL:365*86400,clientRegistrationTTL:undefined};
const scopes=['novel:read','novel:write','offline_access'];
const owner=env=>env.OWNER_SUB||'moji-owner';
const escape=value=>String(value).replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`);
function page(body,status=200,headers=new Headers()){
  headers.set('Content-Type','text/html; charset=utf-8');headers.set('Cache-Control','no-store');
  headers.set('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  // Preserve same-origin form Origin while withholding cross-origin referrers.
  headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','DENY');
  return new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>墨叽 · 小说工作台</title><style>body{margin:0;background:#edf4ff;color:#12345b;font:16px/1.7 system-ui}main{max-width:480px;margin:8vh auto;padding:32px;background:white;border-top:5px solid #245deb;box-shadow:8px 8px 0 #d6e5ff}h1{font-size:26px}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #b5ccec;font:inherit}button{padding:10px 22px;background:#245deb;color:white;border:0;font:inherit;cursor:pointer;margin:16px 12px 0 0}small{color:#607895}hr{border:0;border-top:1px solid #d6e5ff}a{color:#245deb}@media(max-width:560px){main{margin:32px 16px;padding:24px}}</style><main>${body}</main></html>`,{status,headers});
}
// An atomic, durable rate counter survives Worker restarts and concurrent attempts.
export class LoginGuard extends DurableObject {
  async allow(){
    return this.ctx.storage.transaction(async storage=>{
      const now=Date.now();let record=await storage.get('attempts');
      if(!record||now-record.start>=60000)record={start:now,count:0};
      record.count++;await storage.put('attempts',record);return record.count<=5;
    });
  }
}
async function validKey(request,env,value){
  const address=request.headers.get('CF-Connecting-IP')||'local';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address));
  const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(!await env.LOGIN_GUARD.getByName(id).allow())return false;
  const hash=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const [actual,expected]=await Promise.all([hash(value),hash(env.MOJI_OWNER_KEY)]);
  let different=0;for(let i=0;i<actual.length;i++)different|=actual[i]^expected[i];return different===0;
}
const defaultHandler={async fetch(request,env){
  const url=new URL(request.url),oauth=env.OAUTH_PROVIDER;
  if(url.pathname==='/health')return legacy.fetch(request,env);
  if(url.pathname==='/')return page('<h1>墨叽 · 小说工作台</h1><p>你的个人云端工作台已就绪。</p><p>在聊天客户端添加此 MCP 地址：</p><p><code>'+escape(url.origin+'/mcp')+'</code></p><hr><p>连接时输入部署时设置的工作台密钥，批准后由客户端自动续期。</p><small>此实例只属于你，不开放用户注册。请妥善保存密钥。</small>');
  if(url.pathname!=='/authorize')return page('<h1>页面不存在</h1>',404);
  try{
    if(request.method==='GET'){
      const auth=await oauth.parseAuthRequest(request),details=await oauth.describeConsent(auth),consent=await oauth.beginConsent(auth);
      return page(`<h1>连接墨叽</h1><p><strong>${escape(details.clientName)}</strong> 请求访问你的小说工作台。</p><p>回调地址：<strong>${escape(details.redirectHost)}</strong></p><small>${details.clientDomain?'发布域名：'+escape(details.clientDomain):'应用名称由连接方自行声明，请核对回调地址。'}${details.redirectIsLoopback?' 这是本机应用的回调，仅在你主动连接时允许。':''}</small><p>将允许读取、编辑作品和自动续期。不会开放给其他用户。</p><form method="post"><input type="hidden" name="handle" value="${escape(consent.handle)}"><label>工作台密钥<input type="password" name="key" required autocomplete="current-password" maxlength="256"></label><button name="decision" value="approve">允许连接</button><button name="decision" value="deny">拒绝</button></form>`,200,consent.headers);
    }
    if(request.method!=='POST')return page('不支持的请求',405);
    if(request.headers.get('Origin')!==url.origin)return page('请从原授权页面提交。',403);
    if(Number(request.headers.get('Content-Length')||0)>8192)return page('请求过大',413);
    const body=await request.text();if(body.length>8192)return page('请求过大',413);
    const form=new URLSearchParams(body),handle=form.get('handle')||'';
    if(form.get('decision')!=='approve'){
      const denied=await oauth.denyConsent(request,handle);return oauthReturnPage(denied.headers.get('Location'),denied.headers,page,false);
    }
    if(!await validKey(request,env,form.get('key')||''))return page('<h1>密钥不正确或尝试过于频繁</h1><p>请稍后从客户端重新发起连接。</p>',403);
    const approved=await oauth.approveConsent(request,handle,{scope:scopes});
    const {redirectTo}=await oauth.completeAuthorization({request:approved.request,userId:owner(env),metadata:{},scope:scopes,props:{owner:owner(env)}});
    return oauthReturnPage(redirectTo,approved.headers,page);
  }catch(error){
    const failure=oauthFailure(error);
    return page(`<h1>本次授权未完成</h1><p>${failure.message}</p><small>诊断码：${failure.code}</small>`,failure.status);
  }
}};
export function personalProvider(origin,overrides={}){
  return new OAuthProvider({apiRoute:['/mcp','/mcp/dsh/dispatch'],apiHandler:{fetch(request,env,ctx){
    if(ctx.props?.owner!==owner(env)||ctx.auth?.userId!==owner(env))return new Response('此工作台仅允许作者本人访问',{status:403});
    if(new URL(request.url).pathname==='/mcp/dsh/dispatch')return handleNativeDsh(request,env,{owner:owner(env),clientId:ctx.auth.clientId,scopes:new Set(ctx.auth.scope)});
    return legacy.fetch(request,env,{mojiAuth:{owner:owner(env),scopes:new Set(ctx.auth.scope)}});
  }},defaultHandler,authorizeEndpoint:'/authorize',tokenEndpoint:'/oauth/token',clientRegistrationEndpoint:'/oauth/register',
  scopesSupported:scopes,requiredScopes:['novel:read','novel:write'],resourceMetadata:{resource:origin+'/mcp',resource_name:'墨叽 · 小说工作台'},
  ...oauthLifetimes,...overrides});
}
export default {async fetch(request,env,ctx){
  if(env.MOJI_AUTH!=='builtin')return legacy.fetch(request,env,ctx);
  // Existing clients may still hold the former issuer's signed access token.
  // Verify it through the original owner-pinned verifier while they reconnect;
  // new discovery and all newly issued credentials use the built-in provider.
  if(env.AUTH0_ISSUER&&new URL(request.url).pathname==='/mcp'&&/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(request.headers.get('Authorization')||''))return legacy.fetch(request,env,ctx);
  if(!env.MOJI_OWNER_KEY||env.MOJI_OWNER_KEY.length<24||env.MOJI_OWNER_KEY==='replace-with-your-own-secret-key'||!env.OAUTH_KV||!env.LOGIN_GUARD)return page('<h1>还差一步</h1><p>请在部署配置中设置至少 24 个字符的工作台密钥（MOJI_OWNER_KEY），并启用授权存储绑定。设置完成前作品访问保持关闭。</p>',503);
  return personalProvider(new URL(request.url).origin).fetch(request,env,ctx);
}};
