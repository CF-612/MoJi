import test from 'node:test';
import assert from 'node:assert/strict';
import {oauthReturnPage} from '../oauth-return.mjs';
test('授权返回先完成同源表单，再导航至已验证客户端，保留防重放cookie和严格CSP',async()=>{
  const headers=new Headers({'Set-Cookie':'binding=; Secure; HttpOnly; Path=/; Max-Age=0'});
  const render=(body,status,headers)=>{headers.set('Content-Security-Policy',"default-src 'none'; form-action 'self'");return new Response(body,{status,headers});};
  const response=oauthReturnPage('https://client.example/callback?code=test-code&state=test-state',headers,render);
  assert.equal(response.status,200);
  assert.match(response.headers.get('Content-Security-Policy'),/form-action 'self'/);
  assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);
  assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
  const html=await response.text();assert.match(html,/http-equiv="refresh"/);assert.match(html,/href="https:\/\/client.example/);assert.match(html,/&#38;state=/);
  assert.ok(!html.includes('<script'));
});
