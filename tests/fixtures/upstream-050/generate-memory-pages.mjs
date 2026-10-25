// Separate real upstream API fixture; never rewrites wholebook.json.
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash, randomUUID} from 'node:crypto';
const upstreamCommit = 'e9b78d065c0a681c6c516d7bb6f66ecb48108203';
const source = resolve(process.argv[2] || '.');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: source, encoding: 'utf8'}).trim(), upstreamCommit);
assert.equal(JSON.parse(await readFile(join(source, 'package.json'), 'utf8')).version, '0.5.0');
const {Store} = await import(pathToFileURL(join(source, 'src/application/store.js')));
const {TransferService} = await import(pathToFileURL(join(source, 'src/application/transfer/service.ts')));
const root = await mkdtemp(join(tmpdir(), 'synthetic-upstream-memory-pages-'));
const output = dirname(fileURLToPath(import.meta.url));
try {
  const store = new Store(root), actor = {kind: 'human', sessionId: 'synthetic-memory-pages'};
  const novel = await store.dispatch('novel.create', {title: '合成迁移样本：独立设定画布'}, actor);
  const call = (action, args = {}) => store.dispatch(action, {novelId: novel.id, requestId: randomUUID(), ...args}, actor);
  const page = await call('graph.page.create', {name: '合成港湾设定页'});
  const emptyPage = await call('graph.page.create', {name: '合成空设定页'});
  const group = await call('graph.group.create', {name: '合成页内根目录', pageId: page.id});
  const childGroup = await call('graph.group.create', {name: '合成页内子目录', parentId: group.id});
  const person = await call('graph.create', {type: 'character_card', name: '合成页内人物', content: '页内人物最初正文。', groupId: childGroup.id, position: {x: 40, y: 90}});
  const world = await call('graph.create', {type: 'world_entry', name: '合成页内地点', content: '页内地点正文。', groupId: childGroup.id});
  const main = await call('graph.create', {type: 'world_entry', name: '合成总览地点', content: '总览页面正文。'});
  const edge = await call('edge.create', {from: person.id, to: world.id, name: '居住于'});
  const crossEdge = await call('edge.create', {from: person.id, to: main.id, name: '曾到访'});
  await call('graph.update', {nodeId: person.id, expectedRevision: 1, content: '页内人物更新正文。'});
  // Create history across both page homes, then restore the original page via API.
  await call('graph.move', {pageId: null, groupId: null, members: [{id: person.id, expectedRevision: 2}]});
  await call('graph.restore', {nodeId: person.id, expectedRevision: 3, targetRevision: 2});
  const library = JSON.parse(await readFile(join(root, 'library.json'), 'utf8'));
  assert.equal(library.storageVersion, 5);
  const index = JSON.parse(await readFile(join(root, 'novels', library.directories[novel.id], 'settings/index.json'), 'utf8'));
  const before = await store.load();
  const exported = await new TransferService(store).export({selection: {kind: 'works', novelIds: [novel.id]}});
  assert.deepEqual(await store.load(), before);
  const pkg = JSON.parse(exported.content), book = pkg.payload.projects[0];
  assert.equal(book.nodes[person.id].pageId, page.id);
  assert.equal(book.memoryGroups[childGroup.id].pageId, page.id);
  assert.equal(book.memoryGroups[childGroup.id].parentId, group.id);
  assert.equal(Object.keys(book.memoryPages).length, 2);
  assert.deepEqual(book.nodes[person.id].versions.map(v => v.pageId), [page.id, page.id, null, page.id]);
  await writeFile(join(output, 'memory-pages.json'), exported.content);
  await writeFile(join(output, 'provenance-memory-pages.json'), JSON.stringify({
    synthetic: true, upstreamRepository: 'mistnest/dsh-cuigengji-plugin', upstreamCommit,
    upstreamVersion: '0.5.0', sourceStorageVersion: 5, packageFormat: pkg.format, packageVersion: pkg.version,
    generatedVia: ['Store.dispatch', 'TransferService.export'],
    fileSha256: createHash('sha256').update(exported.content).digest('hex'), payloadSha256: pkg.sha256,
    ids: {novel: novel.id, page: page.id, emptyPage: emptyPage.id, group: group.id, childGroup: childGroup.id, person: person.id, world: world.id, main: main.id, edge: edge.id, crossEdge: crossEdge.id},
    sourceSettingFiles: Object.fromEntries(Object.entries(index).map(([id, row]) => [id, row.file])),
  }, null, 2) + '\n');
  console.log(JSON.stringify({output, filename: 'memory-pages.json', bytes: Buffer.byteLength(exported.content), sourceStorageVersion: 5}));
} finally { await rm(root, {recursive: true, force: true}); }
