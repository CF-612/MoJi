// Shared release invariants. No credentials, author data or host profiles live here.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export const REPOSITORY = 'mistnest/dsh-cuigengji-plugin';
export const PACKAGE = 'dsh-cuigengji-plugin';
export const REGISTRY = 'https://registry.npmjs.org';
export const WORKFLOW = 'publish-npm.yml';
export const MARKET = {repository:'mistnest/awesome-dsh-plugin', upstream:'awesome-dsh-plugin/awesome-dsh-plugin',
  branch:'add-cuigengji', path:'data/plugins/mistnest__dsh-cuigengji-plugin.yml', pr:7064};

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const assetName = version => `${PACKAGE}-${version}.tgz`;
export const assetURL = version => `https://github.com/${REPOSITORY}/releases/download/v${version}/${assetName(version)}`;
export const distTag = version => version.includes('-') ? 'next' : 'latest';

export function identity(pkg) {
  assert.equal(pkg.name, PACKAGE, 'Public package name must remain stable');
  assert.match(pkg.version, /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/, 'Invalid release version');
  assert.notEqual(pkg.version, '0.0.0-stage', 'A registry placeholder is not a plugin release');
  assert.equal(pkg.repository?.url, `git+https://github.com/${REPOSITORY}.git`);
  for (const hook of ['prepare','prepack','postpack','preinstall','install','postinstall','prepublish','prepublishOnly','publish','postpublish']) {
    assert.ok(!pkg.scripts?.[hook], `Unexpected package lifecycle hook: ${hook}`);
  }
  return {packageName:PACKAGE, version:pkg.version, tag:`v${pkg.version}`, asset:assetName(pkg.version)};
}

export function checksumFor(text, filename) {
  const rows = text.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/));
  const matches = rows.filter(row => row.length === 2 && row[1].replace(/^\*/, '') === filename);
  assert.equal(matches.length, 1, 'Exactly one checksum must name this archive');
  assert.match(matches[0][0], /^[a-fA-F0-9]{64}$/);
  return matches[0][0].toLowerCase();
}

export function assertPrepared(state, {commit, clean, version, hash}) {
  assert.ok(clean, 'Commit the release changes before continuing');
  assert.equal(state.schemaVersion, 1, 'Unknown release state');
  assert.equal(state.packageName, PACKAGE);
  assert.equal(state.version, version, 'Prepared version no longer matches package.json');
  assert.equal(state.sourceCommit, commit, 'Source changed after preparation; prepare the new commit');
  assert.equal(state.sha256, hash, 'Prepared archive changed; do not publish it');
  assert.equal(state.checks?.prepared, true, 'Preparation and native upgrade acceptance must pass first');
}

// Public assets are immutable. A stopped draft may only receive missing files.
export function assetAction({draft, exists, expected, actual}) {
  if (exists) {
    assert.equal(actual, expected, 'Existing release asset differs; use a new version');
    return 'keep';
  }
  assert.equal(draft, true, 'Never add or replace an asset on an already public release');
  return 'upload';
}

export function releaseNotes(changelog, version, dshVersion) {
  const sections = changelog.split(/(?=^## )/m);
  const section = sections.find(text => new RegExp(`^## ${version.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\s|$)`).test(text));
  assert.ok(section?.trim(), `Add a CHANGELOG section for ${version} before publishing`);
  return `${section.trim()}\n\n兼容基线：DSH ${dshVersion}，Windows 桌面版。\n\n安装包：\`${assetName(version)}\`；GitHub 与 npm 使用同一归档。旧版升级由 Agent 按[安装与更新指南](https://github.com/${REPOSITORY}/blob/v${version}/docs/agent-installation.md)处理，并核对自动迁移结果。\n`;
}

export function safeError(error) {
  return String(error?.message || error)
    .replace(/https:\/\/www\.npmjs\.com\/auth\/cli\/[^\s]+/g,'[npm authorization URL]')
    .replace(/([?&](?:authId|token|otp)=)[^\s&]+/gi,'$1[redacted]')
    .replace(/\b(?:npm_[A-Za-z0-9]+|gh[pousr]_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+)\b/g,'[redacted]');
}

export async function responseJSON(url, fetcher = fetch) {
  const response = await fetcher(url, {headers:{'cache-control':'no-cache'}, signal:AbortSignal.timeout(30000)});
  if (response.status === 404) return null;
  assert.ok(response.ok, `Request returned ${response.status}: ${url}`);
  return response.json();
}

// CLI exit=0 and package-name existence alone cannot establish publication.
export async function verifyRegistry({version, expectedHash, checkTag = true, fetcher = fetch}) {
  const pkg = await responseJSON(`${REGISTRY}/${PACKAGE}/${version}`, fetcher);
  if (!pkg) return {published:false, reason:'EXACT_VERSION_NOT_PUBLIC'};
  assert.equal(pkg.name, PACKAGE);
  assert.equal(pkg.version, version);
  assert.equal(pkg.repository?.url, `git+https://github.com/${REPOSITORY}.git`);
  const tarball = new URL(pkg.dist?.tarball);
  assert.equal(tarball.protocol, 'https:', 'Registry archive must use HTTPS');
  assert.equal(tarball.hostname, 'registry.npmjs.org', 'Unexpected registry archive host');
  assert.equal(tarball.pathname, `/${PACKAGE}/-/${assetName(version)}`);
  const response = await fetcher(tarball.href, {signal:AbortSignal.timeout(60000)});
  assert.ok(response.ok, `Registry archive returned ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(sha256(bytes), expectedHash, 'npm and GitHub archives differ');
  assert.equal(pkg.dist.integrity, `sha512-${createHash('sha512').update(bytes).digest('base64')}`, 'npm integrity mismatch');
  const result = {published:true, version, sha256:expectedHash, tarball:tarball.href};
  if (checkTag) {
    const meta = await responseJSON(`${REGISTRY}/${PACKAGE}`, fetcher);
    assert.equal(meta?.['dist-tags']?.[distTag(version)], version, 'Distribution tag does not point to this release');
    result.tag = distTag(version);
  }
  return result;
}

// npm scans new uploads before exposing them. Retry only an absent version;
// mismatched bytes, integrity, tags and network errors still fail immediately.
export async function waitForRegistry({timeoutMs = 30 * 60 * 1000, intervalMs = 30000,
  now = Date.now, wait = ms => new Promise(done => setTimeout(done, ms)), onPending = () => {}, ...options}) {
  assert.ok(Number.isFinite(timeoutMs) && timeoutMs >= 0, 'Invalid registry wait timeout');
  assert.ok(Number.isFinite(intervalMs) && intervalMs > 0 && intervalMs <= 60000, 'Registry checks must be spaced by at most one minute');
  const started = now();
  for (let attempt = 1; ; attempt++) {
    const result = await verifyRegistry(options);
    if (result.published) return result;
    const elapsedMs = now() - started;
    const remainingMs = timeoutMs - elapsedMs;
    if (remainingMs <= 0) return result;
    onPending({attempt, elapsedMs, remainingMs});
    await wait(Math.min(intervalMs, remainingMs));
  }
}

// npm trust --json emits separate JSON objects, rather than one array.
export function trustEntries(text) {
  const entries=[];
  let start=-1, depth=0, quoted=false, escaped=false;
  for (let i=0;i<text.length;i++) {
    const char=text[i];
    if (quoted) {if (escaped) escaped=false; else if (char==='\\') escaped=true; else if (char==='"') quoted=false; continue;}
    if (char==='"' && depth) {quoted=true; continue;}
    if (char==='{') {if (!depth) start=i; depth++;}
    if (char==='}' && depth && --depth===0) entries.push(JSON.parse(text.slice(start,i+1)));
  }
  assert.equal(depth,0,'Incomplete npm trust response');
  return entries;
}

export function matchingTrust(entries) {
  return entries.find(row => row.type==='github' && row.repository===REPOSITORY && row.file===WORKFLOW
    && !row.environment && row.permissions?.includes('createPackage'));
}

export function marketUpdate(text, version) {
  assert.match(text,new RegExp(`^name: ${PACKAGE}$`,'m'));
  assert.match(text,new RegExp(`^url: https://github\\.com/${REPOSITORY}$`,'m'));
  const rows=text.match(/^tarball: .+$/gm);
  assert.equal(rows?.length,1,'Market entry must have exactly one archive target');
  assert.match(rows[0],new RegExp(`^tarball: https://github\\.com/${REPOSITORY}/releases/download/`),'Do not change an unfamiliar market source');
  return text.replace(/^tarball: .+$/m,`tarball: ${assetURL(version)}`);
}
