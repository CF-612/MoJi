import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createDshCloudClient, normalizeCloudUrl } from '../src/adapters/dsh/cloud-client.js';

const ORIGIN = 'http://127.0.0.1:8787';

function jsonBody(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// 模拟宿主 ctx.credentials：modifyRecord 串行执行，保证 mutate 读到的是最新记录。
function memoryCredentials() {
  const store = new Map();
  let queue = Promise.resolve();
  return {
    store,
    async readRecord(key) {
      const record = store.get(key);
      return record ? structuredClone(record) : undefined;
    },
    modifyRecord(key, mutate) {
      const run = queue.then(async () => {
        const current = store.has(key) ? structuredClone(store.get(key)) : undefined;
        const next = await mutate(current);
        if (next === undefined) store.delete(key);
        else store.set(key, structuredClone(next));
        return next;
      });
      queue = run.then(() => undefined, () => undefined);
      return run;
    },
    async deleteRecord(key) {
      store.delete(key);
    },
  };
}

function grantKey(origin) {
  return `dsh-cuigengji/cloud-${createHash('sha256').update(origin).digest('hex').slice(0, 32)}`;
}

function seedGrant(credentials, origin, overrides = {}) {
  credentials.store.set(grantKey(origin), {
    kind: 'grant',
    payload: {
      instance: origin,
      clientId: 'client-abc',
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
      expiresAt: Date.now() - 1_000,
      ...overrides,
    },
  });
}

// 用注入 fetch 模拟 OAuth 提供器与 dispatch 端点；回调走真实本机 loopback server。
function providerHarness(options = {}) {
  const origin = options.origin || ORIGIN;
  const calls = {
    discovery: 0,
    register: 0,
    exchange: 0,
    refresh: 0,
    revoke: 0,
    dispatch: 0,
    registrations: [],
    exchanges: [],
    refreshes: [],
    revokes: [],
    dispatches: [],
  };
  const tokens = { access: 'access-1', refresh: 'refresh-1', expiresIn: 3600 };
  const state = { auth: null, refreshError: null, revokeError: false };
  const dispatch = options.dispatch || (() => jsonBody(200, { result: { ok: true } }));

  async function fetchImpl(input, init = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url);
    const method = init.method || 'GET';

    if (url.pathname === '/.well-known/oauth-authorization-server' && method === 'GET') {
      calls.discovery += 1;
      return jsonBody(200, {
        issuer: origin,
        authorization_endpoint: `${origin}/authorize`,
        token_endpoint: `${origin}/oauth/token`,
        registration_endpoint: `${origin}/oauth/register`,
        scopes_supported: ['novel:read', 'novel:write', 'offline_access'],
        ...options.metadata,
      });
    }

    if (url.pathname === '/oauth/register' && method === 'POST') {
      calls.register += 1;
      calls.registrations.push(JSON.parse(init.body));
      return jsonBody(201, { client_id: 'client-abc', token_endpoint_auth_method: 'none' });
    }

    if (url.pathname === '/oauth/token' && method === 'POST') {
      const form = new URLSearchParams(init.body);
      if (!form.get('grant_type')) {
        calls.revoke += 1;
        calls.revokes.push(Object.fromEntries(form));
        if (state.revokeError) return jsonBody(503, { error: 'temporarily_unavailable' });
        return jsonBody(200, {});
      }
      if (form.get('grant_type') === 'refresh_token') {
        calls.refresh += 1;
        calls.refreshes.push(Object.fromEntries(form));
        if (state.refreshError) return jsonBody(400, { error: state.refreshError });
        tokens.access = `access-${calls.refresh + 1}`;
        tokens.refresh = `refresh-${calls.refresh + 1}`;
        return jsonBody(200, {
          access_token: tokens.access,
          refresh_token: tokens.refresh,
          token_type: 'Bearer',
          expires_in: tokens.expiresIn,
        });
      }
      calls.exchange += 1;
      calls.exchanges.push(Object.fromEntries(form));
      const verifier = form.get('code_verifier') || '';
      const challenge = state.auth?.get('code_challenge') || '';
      if (!challenge || createHash('sha256').update(verifier).digest('base64url') !== challenge) {
        return jsonBody(400, { error: 'invalid_grant' });
      }
      return jsonBody(200, {
        access_token: tokens.access,
        refresh_token: tokens.refresh,
        token_type: 'Bearer',
        expires_in: tokens.expiresIn,
      });
    }

    if (url.pathname === '/mcp/dsh/dispatch' && method === 'POST') {
      calls.dispatch += 1;
      const request = { body: JSON.parse(init.body), headers: { ...init.headers }, signal: init.signal };
      calls.dispatches.push(request);
      return dispatch(request, calls.dispatch);
    }

    return jsonBody(404, { error: 'not_found' });
  }

  return { origin, calls, tokens, state, fetchImpl };
}

async function login(client, harness) {
  const result = await client.beginLogin(harness.origin);
  const url = new URL(result.authorizationUrl);
  harness.state.auth = url.searchParams;
  const redirect = url.searchParams.get('redirect_uri');
  const state = encodeURIComponent(url.searchParams.get('state'));
  const response = await fetch(`${redirect}?code=code-1&state=${state}`);
  assert.equal(response.status, 200);
  const status = await client.status(harness.origin);
  assert.equal(status.authenticated, true);
  return { url, redirect };
}

test('PKCE 登录：DCR、回调、令牌只存凭据', async t => {
  const harness = providerHarness();
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl, callbackTimeoutMs: 5_000 });
  t.after(() => client.close());

  assert.deepEqual(await client.status(harness.origin), { authenticated: false, pending: false });

  const begin = await client.beginLogin(harness.origin);
  assert.equal(begin.pending, true);
  const url = new URL(begin.authorizationUrl);
  harness.state.auth = url.searchParams;

  assert.equal(url.origin, harness.origin);
  assert.equal(url.pathname, '/authorize');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('resource'), `${harness.origin}/mcp`);
  assert.equal(url.searchParams.get('scope'), 'novel:read novel:write offline_access');
  assert.ok((url.searchParams.get('state') || '').length >= 32);
  assert.ok((url.searchParams.get('code_challenge') || '').length >= 32);

  const redirect = url.searchParams.get('redirect_uri');
  assert.match(redirect, /^http:\/\/127\.0\.0\.1:\d+\/callback$/);

  const registration = harness.calls.registrations[0];
  assert.deepEqual(registration.redirect_uris, [redirect]);
  assert.equal(registration.client_name, '墨叽 DSH 原生插件');
  assert.deepEqual(registration.grant_types, ['authorization_code', 'refresh_token']);
  assert.equal(registration.token_endpoint_auth_method, 'none');
  assert.equal(registration.scope, 'novel:read novel:write offline_access');

  const state = encodeURIComponent(url.searchParams.get('state'));
  const response = await fetch(`${redirect}?code=code-1&state=${state}`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(await response.text(), /连接成功/);

  const exchange = harness.calls.exchanges[0];
  assert.equal(exchange.grant_type, 'authorization_code');
  assert.equal(exchange.code, 'code-1');
  assert.equal(exchange.client_id, 'client-abc');
  assert.equal(exchange.redirect_uri, redirect);
  assert.equal(
    createHash('sha256').update(exchange.code_verifier).digest('base64url'),
    url.searchParams.get('code_challenge'),
  );

  const status = await client.status(harness.origin);
  assert.deepEqual(status, { authenticated: true, pending: false });
  assert.ok(!JSON.stringify(status).includes('access-1'));
  assert.ok(!JSON.stringify(status).includes('refresh-1'));

  const record = credentials.store.get(grantKey(harness.origin));
  assert.equal(record.kind, 'grant');
  assert.deepEqual(Object.keys(record.payload).sort(), ['accessToken', 'clientId', 'expiresAt', 'instance', 'refreshToken']);
  assert.equal(record.payload.instance, harness.origin);
  assert.equal(record.payload.clientId, 'client-abc');
  assert.equal(record.payload.accessToken, 'access-1');
  assert.equal(record.payload.refreshToken, 'refresh-1');
  assert.ok(record.payload.expiresAt > Date.now());
});

test('错误 state 被拒绝但不消耗合法登录流程', async t => {
  const harness = providerHarness();
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());

  const begin = await client.beginLogin(harness.origin);
  const url = new URL(begin.authorizationUrl);
  harness.state.auth = url.searchParams;
  const redirect = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');

  assert.deepEqual(await client.status(harness.origin), { authenticated: false, pending: true });

  const bad = await fetch(`${redirect}?code=code-1&state=${encodeURIComponent(`wrong-${state}`)}`);
  assert.equal(bad.status, 400);

  assert.equal((await client.status(harness.origin)).pending, true);
  assert.equal(harness.calls.exchanges.length, 0);

  const reused = await client.beginLogin(harness.origin);
  assert.equal(reused.authorizationUrl, begin.authorizationUrl);

  const good = await fetch(`${redirect}?code=code-1&state=${encodeURIComponent(state)}`);
  assert.equal(good.status, 200);
  assert.equal((await client.status(harness.origin)).authenticated, true);
});

test('rpc 使用 bearer 并处理 result / 错误码，403 不刷新', async t => {
  const harness = providerHarness({
    dispatch: request => {
      switch (request.body.action) {
        case 'denied': return jsonBody(403, { error: '没有权限', code: 'FORBIDDEN' });
        case 'bad.result': return jsonBody(200, { error: '业务错误', code: 'BAD_RESULT' });
        case 'bad.http': return jsonBody(502, { error: { message: '上游不可用' }, code: 'UPSTREAM' });
        case 'bad.shape': return jsonBody(200, { unexpected: true });
        default: return jsonBody(200, { result: { ok: true } });
      }
    },
  });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  assert.deepEqual(
    await client.rpc(harness.origin, 'novel.list', { page: 1 }, 'session-1', 'agent'),
    { ok: true },
  );
  const request = harness.calls.dispatches[0];
  assert.deepEqual(request.body, {
    action: 'novel.list', args: { page: 1 }, sessionId: 'session-1', kind: 'agent',
  });
  assert.equal(request.headers.authorization, 'Bearer access-1');
  assert.ok(request.headers['x-request-id']);
  assert.ok(!request.headers.authorization.includes('MOJI_OWNER_KEY'));

  await assert.rejects(
    client.rpc(harness.origin, 'denied', {}, 'session-1'),
    error => error.code === 'FORBIDDEN' && error.status === 403,
  );
  await assert.rejects(
    client.rpc(harness.origin, 'bad.result', {}, 'session-1'),
    error => error.code === 'BAD_RESULT',
  );
  await assert.rejects(
    client.rpc(harness.origin, 'bad.http', {}, 'session-1'),
    error => error.code === 'UPSTREAM' && error.status === 502,
  );
  await assert.rejects(
    client.rpc(harness.origin, 'bad.shape', {}, 'session-1'),
    error => error.code === 'INVALID_RESPONSE',
  );
  assert.equal(harness.calls.refresh, 0);
});

test('401 最多刷新一次，用相同 args 和 requestId 重试', async t => {
  const harness = providerHarness({
    dispatch: request => request.headers.authorization === 'Bearer access-1'
      ? jsonBody(401, { error: '令牌已过期', code: 'UNAUTHORIZED' })
      : jsonBody(200, { result: { ok: true } }),
  });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  assert.deepEqual(
    await client.rpc(harness.origin, 'novel.list', { page: 2 }, 'session-1'),
    { ok: true },
  );
  assert.equal(harness.calls.refresh, 1);
  assert.equal(harness.calls.dispatch, 2);
  assert.equal(harness.calls.dispatches[0].headers.authorization, 'Bearer access-1');
  assert.equal(harness.calls.dispatches[1].headers.authorization, 'Bearer access-2');
  assert.equal(
    harness.calls.dispatches[0].headers['x-request-id'],
    harness.calls.dispatches[1].headers['x-request-id'],
  );
  assert.deepEqual(harness.calls.dispatches[0].body, harness.calls.dispatches[1].body);

  const record = credentials.store.get(grantKey(harness.origin));
  assert.equal(record.payload.accessToken, 'access-2');
  assert.equal(record.payload.refreshToken, 'refresh-2');
});

test('过期刷新：同客户端并发共享一次刷新', async t => {
  const origin = 'http://127.0.0.1:8790';
  const harness = providerHarness({ origin });
  const credentials = memoryCredentials();
  seedGrant(credentials, origin);
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());

  await Promise.all([
    client.rpc(origin, 'novel.list', { from: 'first' }, 'session-1'),
    client.rpc(origin, 'novel.list', { from: 'second' }, 'session-2'),
  ]);

  assert.equal(harness.calls.refresh, 1);
  assert.equal(harness.calls.dispatch, 2);
  assert.equal(harness.calls.dispatches[0].headers.authorization, 'Bearer access-2');
  assert.equal(harness.calls.dispatches[1].headers.authorization, 'Bearer access-2');
  assert.equal(harness.calls.refreshes[0].refresh_token, 'refresh-old');
  assert.equal(harness.calls.refreshes[0].client_id, 'client-abc');

  await client.rpc(origin, 'novel.list', {}, 'session-1');
  assert.equal(harness.calls.refresh, 1);
});

test('过期刷新：跨客户端并发不丢轮换后的 refresh token', async () => {
  const origin = 'http://127.0.0.1:8791';
  const harness = providerHarness({ origin });
  const credentials = memoryCredentials();
  seedGrant(credentials, origin);
  const first = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  const second = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });

  try {
    await Promise.all([
      first.rpc(origin, 'novel.list', { from: 'first' }, 'session-1'),
      second.rpc(origin, 'novel.list', { from: 'second' }, 'session-2'),
    ]);

    assert.equal(harness.calls.refresh, 1);
    assert.equal(harness.calls.refreshes[0].refresh_token, 'refresh-old');
    assert.equal(harness.calls.dispatch, 2);
    assert.equal(harness.calls.dispatches[0].headers.authorization, 'Bearer access-2');
    assert.equal(harness.calls.dispatches[1].headers.authorization, 'Bearer access-2');

    const stored = credentials.store.get(grantKey(origin)).payload;
    assert.equal(stored.accessToken, 'access-2');
    assert.equal(stored.refreshToken, 'refresh-2');
  } finally {
    first.close();
    second.close();
  }
});

test('实例隔离与实例 URL 校验', async t => {
  const harness = providerHarness();
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  const other = 'http://127.0.0.1:8792';
  assert.deepEqual(await client.status(other), { authenticated: false, pending: false });
  await assert.rejects(
    client.rpc(other, 'novel.list', {}, 'session-1'),
    error => error.code === 'NOT_AUTHENTICATED',
  );

  assert.equal(normalizeCloudUrl('https://novel.example.com'), 'https://novel.example.com');
  assert.equal(normalizeCloudUrl('https://novel.example.com/'), 'https://novel.example.com');
  assert.equal(normalizeCloudUrl('http://localhost:8787/'), 'http://localhost:8787');
  assert.equal(normalizeCloudUrl('http://127.0.0.1:8787'), 'http://127.0.0.1:8787');

  for (const bad of [
    'http://novel.example.com',
    'ftp://novel.example.com',
    'https://user:pass@novel.example.com',
    'https://novel.example.com/?a=1',
    'https://novel.example.com/#x',
    'https://novel.example.com/path',
    'http://127.0.0.1.evil.example',
    'not a url',
  ]) {
    assert.throws(() => normalizeCloudUrl(bad), error => error.code === 'INVALID_INSTANCE_URL', bad);
  }
});

test('发现端点必须与实例同源', async t => {
  const origin = 'http://127.0.0.1:8793';
  const harness = providerHarness({
    origin,
    metadata: { token_endpoint: 'https://evil.example/token' },
  });
  const client = createDshCloudClient({ credentials: memoryCredentials(), fetchImpl: harness.fetchImpl });
  t.after(() => client.close());

  await assert.rejects(
    client.beginLogin(origin),
    error => error.code === 'OAUTH_DISCOVERY_FAILED',
  );
  assert.deepEqual(await client.status(origin), { authenticated: false, pending: false });
});

test('登录超时关闭 loopback server 且不留下 pending', async () => {
  const origin = 'http://127.0.0.1:8794';
  const harness = providerHarness({ origin });
  const client = createDshCloudClient({
    credentials: memoryCredentials(),
    fetchImpl: harness.fetchImpl,
    callbackTimeoutMs: 40,
  });

  const begin = await client.beginLogin(origin);
  const url = new URL(begin.authorizationUrl);
  const redirect = url.searchParams.get('redirect_uri');
  const state = encodeURIComponent(url.searchParams.get('state'));

  await new Promise(resolve => setTimeout(resolve, 120));

  const status = await client.status(origin);
  assert.equal(status.pending, false);
  assert.equal(status.error, '登录等待超时，请重新发起登录');
  await assert.rejects(fetch(`${redirect}?code=code-1&state=${state}`));
  client.close();
});

test('close 关闭待授权 server 但不删除已保存授权', async t => {
  const origin = 'http://127.0.0.1:8795';
  const harness = providerHarness({ origin });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  const begin = await client.beginLogin(origin);
  const url = new URL(begin.authorizationUrl);
  const redirect = url.searchParams.get('redirect_uri');
  const state = encodeURIComponent(url.searchParams.get('state'));

  client.close();

  const status = await client.status(origin);
  assert.equal(status.pending, false);
  assert.equal(status.authenticated, true);
  await assert.rejects(fetch(`${redirect}?code=code-1&state=${state}`));
});

test('rpc 取消会中止在途请求', async t => {
  const origin = 'http://127.0.0.1:8796';
  const harness = providerHarness({
    origin,
    dispatch: request => new Promise((resolve, reject) => {
      const abort = () => reject(new DOMException('aborted', 'AbortError'));
      if (request.signal.aborted) abort();
      else request.signal.addEventListener('abort', abort, { once: true });
    }),
  });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  const controller = new AbortController();
  const pending = client.rpc(origin, 'novel.list', {}, 'session-1', 'human', { signal: controller.signal });
  setTimeout(() => controller.abort(), 20);
  await assert.rejects(pending, error => error.code === 'ABORTED' && error.name === 'AbortError');

  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(
    client.rpc(origin, 'novel.list', {}, 'session-1', 'human', { signal: aborted.signal }),
    error => error.code === 'ABORTED',
  );
  assert.equal(harness.calls.dispatch, 1);
});

test('logout 取消待授权流程', async () => {
  const origin = 'http://127.0.0.1:8799';
  const harness = providerHarness({ origin });
  const client = createDshCloudClient({ credentials: memoryCredentials(), fetchImpl: harness.fetchImpl });

  const begin = await client.beginLogin(origin);
  const url = new URL(begin.authorizationUrl);
  await client.logout(origin);

  assert.equal((await client.status(origin)).pending, false);
  await assert.rejects(
    fetch(`${url.searchParams.get('redirect_uri')}?code=code-1&state=${encodeURIComponent(url.searchParams.get('state'))}`),
  );
  client.close();
});

test('logout 撤销 refresh token 并删除本地授权', async t => {
  const origin = 'http://127.0.0.1:8797';
  const harness = providerHarness({ origin });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  await client.logout(origin);

  assert.equal(harness.calls.revoke, 1);
  assert.equal(harness.calls.revokes[0].token, 'refresh-1');
  assert.equal(harness.calls.revokes[0].token_type_hint, 'refresh_token');
  assert.equal(harness.calls.revokes[0].client_id, 'client-abc');
  assert.deepEqual(await client.status(origin), { authenticated: false, pending: false });
});

test('撤销失败仍然删除本地授权', async t => {
  const origin = 'http://127.0.0.1:8798';
  const harness = providerHarness({ origin });
  const credentials = memoryCredentials();
  const client = createDshCloudClient({ credentials, fetchImpl: harness.fetchImpl });
  t.after(() => client.close());
  await login(client, harness);

  harness.state.revokeError = true;
  await client.logout(origin);

  assert.equal(credentials.store.has(grantKey(origin)), false);
  assert.deepEqual(await client.status(origin), { authenticated: false, pending: false });
});
