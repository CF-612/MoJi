// Only known descriptions become public diagnostics. Never echo request data,
// provider exceptions, handles, cookies, or credentials into the page.
export function oauthFailure(error) {
  const description=error?.description;
  if(description==='This authorization was not started in this browser; start again')return {code:'BROWSER_SESSION_MISSING',message:'此页面缺少本次连接的浏览器凭据。请从客户端重新关联，并在打开的同一个浏览器里完成。',status:400};
  if(description==='This authorization belongs to a different browser session; start again')return {code:'BROWSER_SESSION_CHANGED',message:'本次连接的浏览器会话发生了变化。请从客户端重新关联。',status:400};
  if(description==='This authorization expired or was already used; start again')return {code:'CONSENT_EXPIRED_OR_USED',message:'这张授权表单已经使用或超过有效期。刷新失败页会重发旧表单，请从客户端重新关联。',status:400};
  if(error?.message==='userId must be a non-empty string without ":"')return {code:'OWNER_ID_FORMAT',message:'服务端作者身份配置需要修复，无需重新输入密钥。',status:503};
  if(error?.name==='AuthorizationError')return {code:'AUTH_REQUEST_INVALID',message:'本次连接请求未通过验证。请从客户端重新关联。',status:400};
  return {code:'AUTH_SERVICE_ERROR',message:'授权服务暂时处理失败，无需反复输入密钥。',status:503};
}
