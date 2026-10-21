// A form POST must finish on this origin before navigating to the client.
// Chromium applies form-action 'self' to a POST's cross-origin redirect chain.
// The destination is produced only by the provider after client/redirect checks.
export function oauthReturnPage(redirectTo,headers,renderPage,approved=true){
  const safe=String(redirectTo).replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`);
  const response=renderPage(`<meta http-equiv="refresh" content="0;url=${safe}"><h1>${approved?'连接已批准':'已取消连接'}</h1><p>正在返回客户端。</p><p><a href="${safe}">没有自动返回？点击继续</a></p>`,200,headers);
  response.headers.set('Referrer-Policy','no-referrer');
  return response;
}
