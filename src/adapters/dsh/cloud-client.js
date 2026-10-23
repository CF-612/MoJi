import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const CLIENT_NAME = '墨叽 DSH 原生插件';
const SCOPE = 'novel:read novel:write offline_access';
const FRESH_MARGIN_MS = 30_000;
const DEFAULT_TOKEN_LIFETIME_MS = 3_600_000;

function failure(message, code, extra) {
  const error = new Error(message);
  error.code = code;
  if (extra) Object.assign(error, extra);
  return error;
}

function abortError() {
  const error = failure('云端请求已取消', 'ABORTED');
  error.name = 'AbortError';
  return error;
}

function abortIf(signal) {
  if (signal?.aborted) throw abortError();
}

// 只接受根路径的 HTTPS 实例；本机回环地址允许 http，便于本地开发与测试。
export function normalizeCloudUrl(instanceUrl) {
  let url;
  try {
    url = new URL(instanceUrl instanceof URL ? instanceUrl.href : String(instanceUrl));
  } catch {
    throw failure('云端实例地址无效', 'INVALID_INSTANCE_URL');
  }
  if (url.username || url.password) throw failure('云端实例地址不能包含用户名或密码', 'INVALID_INSTANCE_URL');
  if (url.search || url.hash) throw failure('云端实例地址不能包含查询参数或片段', 'INVALID_INSTANCE_URL');
  if (url.pathname !== '/') throw failure('云端实例地址必须是根路径', 'INVALID_INSTANCE_URL');
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:')) {
    throw failure('云端实例必须使用 HTTPS，本机开发仅允许 http://127.0.0.1 或 http://localhost', 'INVALID_INSTANCE_URL');
  }
  return url.origin;
}

function credentialKey(origin) {
  return `dsh-cuigengji/cloud-${createHash('sha256').update(origin).digest('hex').slice(0, 32)}`;
}

function grantOf(record) {
  if (!record || record.kind !== 'grant' || !record.payload || typeof record.payload !== 'object') return null;
  const payload = record.payload;
  if (typeof payload.accessToken !== 'string' || !payload.accessToken) return null;
  return {
    instance: typeof payload.instance === 'string' ? payload.instance : undefined,
    clientId: typeof payload.clientId === 'string' ? payload.clientId : undefined,
    accessToken: payload.accessToken,
    refreshToken: typeof payload.refreshToken === 'string' && payload.refreshToken ? payload.refreshToken : undefined,
    expiresAt: Number(payload.expiresAt),
  };
}

// 留 30 秒裕量，避免令牌在请求途中过期。
function isFresh(grant) {
  return Number.isFinite(grant.expiresAt) && grant.expiresAt - FRESH_MARGIN_MS > Date.now();
}

function expiryOf(tokens) {
  const seconds = Number(tokens?.expires_in);
  return Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_TOKEN_LIFETIME_MS);
}

function sameSecret(actual, expected) {
  const left = Buffer.from(String(actual));
  const right = Buffer.from(String(expected));
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeCode(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]+$/.test(value) ? value.toUpperCase() : 'ERROR';
}

function cloudFailure(data, status) {
  const error = data?.error;
  const message = typeof error === 'string' && error
    ? error
    : typeof error?.message === 'string' && error.message
      ? error.message
      : `云端请求失败（HTTP ${status}）`;
  const code = typeof data?.code === 'string' && data.code
    ? data.code
    : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : `HTTP_${status}`;
  return failure(message, code, { status });
}

export function createDshCloudClient({
  credentials,
  fetchImpl = globalThis.fetch,
  callbackTimeoutMs = 180_000,
  requestTimeoutMs = 20_000,
} = {}) {
  if (!credentials || ['readRecord', 'modifyRecord', 'deleteRecord']
    .some(name => typeof credentials[name] !== 'function')) {
    throw new TypeError('createDshCloudClient 需要 credentials.readRecord / modifyRecord / deleteRecord');
  }
  if (typeof fetchImpl !== 'function') throw new TypeError('createDshCloudClient 需要可用的 fetch');

  const timeoutMs = Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0 ? requestTimeoutMs : 20_000;
  const loginTimeoutMs = Number.isFinite(callbackTimeoutMs) && callbackTimeoutMs > 0 ? callbackTimeoutMs : 180_000;

  const pending = new Map();
  const starting = new Map();
  const errors = new Map();
  const providers = new Map();
  const refreshing = new Map();
  const flows = new Set();
  let epoch = 0;

  async function fetchText(url, init = {}, { signal } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    timer.unref?.();
    const signals = [controller.signal, signal].filter(Boolean);
    try {
      const response = await fetchImpl(url, {
        ...init,
        signal: signals.length === 1 ? signals[0] : AbortSignal.any(signals),
      });
      return { response, text: await response.text() };
    } catch {
      if (signal?.aborted) throw abortError();
      if (controller.signal.aborted) throw failure('云端请求超时', 'TIMEOUT');
      throw failure('无法连接云端服务', 'NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
    }
  }

  async function requestJson(url, init, options) {
    const { response, text } = await fetchText(url, init, options);
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    return { response, data };
  }

  function endpointUrl(origin, value, label) {
    if (typeof value !== 'string' || !value) throw failure(`云端 ${label} 地址无效`, 'OAUTH_DISCOVERY_FAILED');
    let url;
    try {
      url = new URL(value, origin);
    } catch {
      throw failure(`云端 ${label} 地址无效`, 'OAUTH_DISCOVERY_FAILED');
    }
    const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    if (url.origin !== origin || (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:'))) {
      throw failure(`云端 ${label} 必须位于同一实例`, 'OAUTH_DISCOVERY_FAILED');
    }
    return url.href;
  }

  function provider(origin) {
    const cached = providers.get(origin);
    if (cached) return cached;
    const task = (async () => {
      const { response, data } = await requestJson(`${origin}/.well-known/oauth-authorization-server`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok || !data || typeof data !== 'object') {
        throw failure('无法获取云端授权配置', 'OAUTH_DISCOVERY_FAILED', { status: response.status });
      }
      return {
        authorization_endpoint: endpointUrl(origin, data.authorization_endpoint, '授权端点'),
        token_endpoint: endpointUrl(origin, data.token_endpoint, '令牌端点'),
        registration_endpoint: endpointUrl(origin, data.registration_endpoint, '注册端点'),
      };
    })().catch(error => {
      providers.delete(origin);
      throw error;
    });
    providers.set(origin, task);
    return task;
  }

  async function registerClient(providerInfo, redirectUri) {
    const { response, data } = await requestJson(providerInfo.registration_endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_name: CLIENT_NAME,
        redirect_uris: [redirectUri],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        scope: SCOPE,
      }),
    });
    if (!response.ok || !data || typeof data.client_id !== 'string' || !data.client_id) {
      throw failure('云端客户端注册失败', 'OAUTH_REGISTRATION_FAILED', { status: response.status });
    }
    return data.client_id;
  }

  async function tokenRequest(endpoint, params) {
    const { response, data } = await requestJson(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams(params).toString(),
    });
    if (!response.ok || !data || typeof data.access_token !== 'string' || !data.access_token) {
      throw failure('云端令牌请求失败', `OAUTH_${safeCode(data?.error)}`, { status: response.status });
    }
    return data;
  }

  async function readGrant(origin) {
    return grantOf(await credentials.readRecord(credentialKey(origin)));
  }

  async function saveGrant(origin, payload) {
    await credentials.modifyRecord(credentialKey(origin), async () => ({ kind: 'grant', payload }));
  }

  function closeFlow(flow) {
    flow.done = true;
    flows.delete(flow);
    if (flow.timer) {
      clearTimeout(flow.timer);
      flow.timer = null;
    }
    if (pending.get(flow.origin) === flow) pending.delete(flow.origin);
    try {
      flow.server?.close();
    } catch {
      // 已经关闭时忽略。
    }
  }

  function ensureAttempt(attempt) {
    if (epoch !== attempt.generation) throw failure('云端客户端已关闭', 'CLIENT_CLOSED');
    if (attempt.cancelled) throw failure('登录已取消', 'LOGIN_CANCELLED');
  }

  async function handleCallback(flow, req, res) {
    const respond = (status, message) => {
      if (res.headersSent) return;
      res.once('finish', () => {
        try {
          flow.server?.closeIdleConnections?.();
        } catch {
          // 连接已断开时忽略。
        }
      });
      res.writeHead(status, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
        'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
      });
      res.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>墨叽 · 云端连接</title><p>${message}</p></html>`);
    };

    let url;
    try {
      url = new URL(req.url || '/', 'http://127.0.0.1');
    } catch {
      respond(400, '登录请求无效，请回到 DSH 重新发起登录。');
      return;
    }
    if (url.pathname !== '/callback') {
      respond(404, '页面不存在。');
      return;
    }
    if (req.method !== 'GET') {
      respond(405, '不支持的请求方法。');
      return;
    }
    if (flow.done || flow.consumed) {
      respond(400, '本次登录已结束，请回到 DSH 重新发起登录。');
      return;
    }
    // 错误 state 直接拒绝，但不消耗合法登录流程。
    if (!sameSecret(url.searchParams.get('state') || '', flow.state)) {
      respond(400, '登录校验失败，请回到 DSH 重新发起登录。');
      return;
    }

    flow.consumed = true;
    if (flow.timer) {
      clearTimeout(flow.timer);
      flow.timer = null;
    }
    try {
      const oauthError = url.searchParams.get('error');
      const code = url.searchParams.get('code');
      if (oauthError || !code) {
        errors.set(flow.origin, '登录未完成，请重新发起登录');
        respond(400, '登录未完成，请回到 DSH 重新发起登录。');
        return;
      }
      const tokens = await tokenRequest(flow.tokenEndpoint, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: flow.redirectUri,
        client_id: flow.clientId,
        code_verifier: flow.verifier,
      });
      // 换取令牌期间若已 close()/logout()，不再写回授权。
      if (flow.done) {
        respond(400, '登录已取消，请回到 DSH 重新发起登录。');
        return;
      }
      await saveGrant(flow.origin, {
        instance: flow.origin,
        clientId: flow.clientId,
        accessToken: tokens.access_token,
        refreshToken: typeof tokens.refresh_token === 'string' && tokens.refresh_token ? tokens.refresh_token : undefined,
        expiresAt: expiryOf(tokens),
      });
      errors.delete(flow.origin);
      respond(200, '云端连接成功，可以关闭此页面并回到 DSH。');
    } catch {
      // 不向浏览器回显令牌端点响应或请求体。
      errors.set(flow.origin, '登录失败，请重新发起登录');
      respond(400, '登录失败，请回到 DSH 重新发起登录。');
    } finally {
      closeFlow(flow);
    }
  }

  async function startLogin(origin, attempt) {
    ensureAttempt(attempt);
    errors.delete(origin);
    const providerInfo = await provider(origin);
    ensureAttempt(attempt);
    const flow = { origin, server: null, timer: null, done: false, consumed: false };

    const server = createServer((req, res) => {
      handleCallback(flow, req, res).catch(() => {
        if (!res.headersSent) {
          try {
            res.destroy();
          } catch {
            // 忽略连接已断开的错误。
          }
        }
      });
    });
    flow.server = server;
    try {
      await new Promise((resolve, reject) => {
        const onError = error => {
          server.off('listening', onListening);
          reject(failure('无法启动本机登录回调', 'LOGIN_FAILED', { cause: error }));
        };
        const onListening = () => {
          server.off('error', onError);
          resolve();
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(0, '127.0.0.1');
      });
    } catch (error) {
      closeFlow(flow);
      throw error;
    }
    try {
      ensureAttempt(attempt);
    } catch (error) {
      closeFlow(flow);
      throw error;
    }
    flows.add(flow);
    server.on('error', () => {
      errors.set(origin, '本机登录回调异常，请重新发起登录');
      closeFlow(flow);
    });

    const address = server.address();
    const port = address && typeof address === 'object' ? address.port : 0;
    if (!port) {
      closeFlow(flow);
      throw failure('无法启动本机登录回调', 'LOGIN_FAILED');
    }
    flow.redirectUri = `http://127.0.0.1:${port}/callback`;

    try {
      flow.clientId = await registerClient(providerInfo, flow.redirectUri);
      ensureAttempt(attempt);
      if (flow.done) throw failure('登录已取消', 'LOGIN_CANCELLED');
    } catch (error) {
      closeFlow(flow);
      throw error;
    }

    flow.state = randomBytes(32).toString('base64url');
    flow.verifier = randomBytes(48).toString('base64url');
    const challenge = createHash('sha256').update(flow.verifier).digest('base64url');
    flow.tokenEndpoint = providerInfo.token_endpoint;

    const authorizationUrl = new URL(providerInfo.authorization_endpoint);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('client_id', flow.clientId);
    authorizationUrl.searchParams.set('redirect_uri', flow.redirectUri);
    authorizationUrl.searchParams.set('scope', SCOPE);
    authorizationUrl.searchParams.set('state', flow.state);
    authorizationUrl.searchParams.set('code_challenge', challenge);
    authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    authorizationUrl.searchParams.set('resource', `${origin}/mcp`);
    flow.authorizationUrl = authorizationUrl.href;

    pending.set(origin, flow);
    flow.timer = setTimeout(() => {
      errors.set(origin, '登录等待超时，请重新发起登录');
      closeFlow(flow);
    }, loginTimeoutMs);
    flow.timer.unref?.();

    return { authorizationUrl: flow.authorizationUrl, pending: true };
  }

  function refreshGrant(origin, staleToken) {
    const active = refreshing.get(origin);
    if (active) return active;
    const task = (async () => {
      const providerInfo = await provider(origin);
      let accessToken = null;
      await credentials.modifyRecord(credentialKey(origin), async current => {
        // modifyRecord 的 mutate 内以当前记录为准，避免并发刷新覆盖轮换后的 refresh token。
        const grant = grantOf(current);
        if (!grant) throw failure('尚未登录云端', 'NOT_AUTHENTICATED');
        if (!staleToken && isFresh(grant)) {
          accessToken = grant.accessToken;
          return current;
        }
        if (staleToken && grant.accessToken !== staleToken) {
          accessToken = grant.accessToken;
          return current;
        }
        if (!grant.refreshToken) throw failure('登录已过期，请重新登录', 'NOT_AUTHENTICATED');
        let tokens;
        try {
          tokens = await tokenRequest(providerInfo.token_endpoint, {
            grant_type: 'refresh_token',
            refresh_token: grant.refreshToken,
            client_id: grant.clientId || '',
          });
        } catch (error) {
          if (['OAUTH_INVALID_GRANT', 'OAUTH_INVALID_CLIENT', 'OAUTH_UNAUTHORIZED_CLIENT'].includes(error.code)) {
            throw failure('登录已过期，请重新登录', 'NOT_AUTHENTICATED');
          }
          throw failure('刷新云端登录失败', 'REFRESH_FAILED', { cause: error });
        }
        const next = {
          instance: origin,
          clientId: grant.clientId,
          accessToken: tokens.access_token,
          refreshToken: typeof tokens.refresh_token === 'string' && tokens.refresh_token
            ? tokens.refresh_token
            : grant.refreshToken,
          expiresAt: expiryOf(tokens),
        };
        accessToken = next.accessToken;
        return { kind: 'grant', payload: next };
      });
      if (!accessToken) throw failure('尚未登录云端', 'NOT_AUTHENTICATED');
      return accessToken;
    })().finally(() => {
      refreshing.delete(origin);
    });
    refreshing.set(origin, task);
    return task;
  }

  async function accessTokenFor(origin, { signal } = {}) {
    const grant = await readGrant(origin);
    if (!grant) throw failure('尚未登录云端', 'NOT_AUTHENTICATED');
    abortIf(signal);
    if (isFresh(grant)) return grant.accessToken;
    const token = await refreshGrant(origin);
    abortIf(signal);
    return token;
  }

  async function beginLogin(instanceUrl) {
    const origin = normalizeCloudUrl(instanceUrl);
    const existing = pending.get(origin);
    if (existing) return { authorizationUrl: existing.authorizationUrl, pending: true };
    const active = starting.get(origin);
    if (active && active.generation === epoch) return active.task;
    const entry = { generation: epoch, cancelled: false, task: null };
    entry.task = startLogin(origin, entry).finally(() => {
      if (starting.get(origin) === entry) starting.delete(origin);
    });
    starting.set(origin, entry);
    return entry.task;
  }

  async function status(instanceUrl) {
    const origin = normalizeCloudUrl(instanceUrl);
    const isPending = pending.has(origin);
    try {
      const grant = await readGrant(origin);
      const authenticated = Boolean(grant && (isFresh(grant) || grant.refreshToken));
      if (authenticated) return { authenticated: true, pending: isPending };
      const message = errors.get(origin) || (grant ? '登录已过期，请重新登录' : undefined);
      return message
        ? { authenticated: false, pending: isPending, error: message }
        : { authenticated: false, pending: isPending };
    } catch {
      return { authenticated: false, pending: isPending, error: '无法读取云端登录状态' };
    }
  }

  async function rpc(instanceUrl, action, args, sessionId, kind = 'human', options = {}) {
    const origin = normalizeCloudUrl(instanceUrl);
    if (typeof action !== 'string' || !action) throw failure('云端操作名称无效', 'INVALID_INPUT');
    const signal = options?.signal;
    abortIf(signal);

    let token = await accessTokenFor(origin, { signal });
    const requestId = randomUUID();
    const body = JSON.stringify({ action, args: args ?? {}, sessionId, kind });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      abortIf(signal);
      const { response, data } = await requestJson(`${origin}/mcp/dsh/dispatch`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          accept: 'application/json',
          'x-request-id': requestId,
        },
        body,
      }, { signal });

      if (response.ok) {
        if (data && typeof data === 'object' && data.error) throw cloudFailure(data, response.status);
        if (!data || typeof data !== 'object' || !('result' in data)) {
          throw failure('云端返回格式无效', 'INVALID_RESPONSE', { status: response.status });
        }
        return data.result;
      }

      // 只有 401 才刷新并重试一次；403 不盲目刷新，其余错误原样抛出。
      if (response.status === 401 && attempt === 0) {
        token = await refreshGrant(origin, token);
        abortIf(signal);
        continue;
      }
      throw cloudFailure(data, response.status);
    }
    throw failure('云端请求未被授权', 'UNAUTHORIZED');
  }

  async function logout(instanceUrl) {
    const origin = normalizeCloudUrl(instanceUrl);
    const active = starting.get(origin);
    if (active) active.cancelled = true;
    const flow = pending.get(origin);
    if (flow) closeFlow(flow);
    errors.delete(origin);

    let grant = null;
    try {
      grant = await readGrant(origin);
    } catch {
      grant = null;
    }

    if (grant?.refreshToken) {
      // 已知提供器时用其令牌端点，否则按 OAuth 提供器惯例走 /oauth/token；不为此再拉发现文档。
      let endpoint = `${origin}/oauth/token`;
      const cached = providers.get(origin);
      if (cached) {
        try {
          endpoint = (await cached).token_endpoint;
        } catch {
          // 发现缓存不可用时退回实例自身的令牌端点。
        }
      }
      try {
        await fetchText(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
          body: new URLSearchParams({
            token: grant.refreshToken,
            token_type_hint: 'refresh_token',
            ...(grant.clientId ? { client_id: grant.clientId } : {}),
          }).toString(),
        });
      } catch {
        // 撤销失败不阻止本地退出。
      }
    }

    await credentials.deleteRecord(credentialKey(origin));
  }

  function close() {
    epoch += 1;
    for (const flow of [...flows]) closeFlow(flow);
  }

  return { status, beginLogin, rpc, logout, close };
}
