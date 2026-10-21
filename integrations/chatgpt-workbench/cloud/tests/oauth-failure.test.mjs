import test from 'node:test';
import assert from 'node:assert/strict';
import {oauthFailure} from '../oauth-failure.mjs';

test('授权错误区分浏览器凭据、已用表单、配置错误与服务异常，不泄露未知错误',()=>{
  const fail=description=>oauthFailure({name:'AuthorizationError',description});
  assert.equal(fail('This authorization was not started in this browser; start again').code,'BROWSER_SESSION_MISSING');
  assert.equal(fail('This authorization belongs to a different browser session; start again').code,'BROWSER_SESSION_CHANGED');
  assert.equal(fail('This authorization expired or was already used; start again').code,'CONSENT_EXPIRED_OR_USED');
  assert.equal(oauthFailure(new TypeError('userId must be a non-empty string without ":"')).code,'OWNER_ID_FORMAT');
  const unknown=oauthFailure(new Error('sensitive-private-value'));
  assert.equal(unknown.status,503);
  assert.ok(!JSON.stringify(unknown).includes('sensitive-private-value'));
  assert.ok(!unknown.message.includes('过期'));
});
