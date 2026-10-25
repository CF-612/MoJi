// Generate only synthetic data through the pinned upstream 0.5.0 public API.
// Usage: node generate.mjs /absolute/path/to/upstream-checkout
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {randomUUID, createHash} from 'node:crypto';

const expectedCommit = 'e9b78d065c0a681c6c516d7bb6f66ecb48108203';
const source = resolve(process.argv[2] || '.');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: source, encoding: 'utf8'}).trim(), expectedCommit);
assert.equal(JSON.parse(await readFile(join(source, 'package.json'), 'utf8')).version, '0.5.0');
const {Store} = await import(pathToFileURL(join(source, 'src/application/store.js')));
const {TransferService} = await import(pathToFileURL(join(source, 'src/application/transfer/service.ts')));
const root = await mkdtemp(join(tmpdir(), 'synthetic-upstream-050-'));
const output = dirname(fileURLToPath(import.meta.url));
try {
  const store = new Store(root), actor = {kind: 'human', sessionId: 'synthetic-migration-fixture'};
  const novel = await store.dispatch('novel.create', {title: '合成迁移样本：灯塔来信', description: '自动生成的测试数据，不含真实用户作品。'}, actor);
  const call = (action, args = {}) => store.dispatch(action, {novelId: novel.id, ...args}, actor);
  const volume = await call('volume.create', {title: '第一卷 合成港湾'});
  const chapter = await call('chapter.create', {title: '第一章 测试来信', content: '这是合成正文第一版。', volumeId: volume.id});
  await call('chapter.update', {chapterId: chapter.id, expectedRevision: 1, content: '这是合成正文第二版。\n灯塔亮起。'});
  const trash = await call('chapter.create', {title: '回收站合成章节', content: '回收站内容应随整本保存。'});
  await call('chapter.delete', {chapterId: trash.id, expectedRevision: 1, confirm: true});
  const group = await call('graph.group.create', {name: '合成设定根目录'});
  const childGroup = await call('graph.group.create', {name: '合成嵌套目录', parentId: group.id});
  const world = await call('graph.create', {type: 'world_entry', status: 'unconfirmed', name: '合成灯塔', content: '虚构测试灯塔正文。', groupId: childGroup.id, sources: [{chapterId: chapter.id, revision: 1}]});
  const person = await call('graph.create', {type: 'character_card', status: 'unconfirmed', name: '合成守塔人', summary: '初始摘要', content: '人物设定第一版。', groupId: childGroup.id, dependsOn: [world.id], knownBy: [world.id], sources: [{chapterId: chapter.id, revision: 1}]});
  await call('graph.update', {nodeId: person.id, expectedRevision: 1, summary: '更新摘要', content: '人物设定第二版。', reason: '合成迁移历史测试'});
  const relation = await call('edge.create', {from: person.id, to: world.id, status: 'unconfirmed', name: '看守', content: '合成关系正文。', sources: [{chapterId: chapter.id, revision: 1}]});
  const page = await call('planning.page.create', {name: '合成规划画布', requestId: randomUUID()});
  const plan = await call('planning.apply', {requestId: randomUUID(), operations: [
    {op: 'group.create', ref: 'root', value: {name: '规划根分组', pageId: page.id}},
    {op: 'group.create', ref: 'child', value: {name: '规划嵌套分组', pageId: page.id, parentId: 'root'}},
    {op: 'node.create', ref: 'a', value: {title: '发现来信', summary: '合成节点摘要', content: '独立节点文件中的完整规划正文。', pageId: page.id, groupId: 'child', position: {x: -220, y: 40}, memoryRefs: [person.id], chapterRefs: [{chapterId: chapter.id, revision: 1}], status: 'written'}},
    {op: 'node.create', ref: 'b', value: {title: '点亮灯塔', content: '第二段合成规划。', pageId: page.id, groupId: 'child'}},
    {op: 'edge.create', value: {from: 'a', to: 'b', type: 'next'}},
    {op: 'decoration.create', value: {kind: 'frame', title: '合成讨论框', content: '讨论框正文不能丢失。', pageId: page.id}},
    {op: 'decoration.create', value: {kind: 'note', content: '合成便签正文不能丢失。', pageId: page.id}},
  ]});
  await call('preset.set', {expectedRevision: 0, preset: {name: '合成写作要求', enabled: true, blocks: [{identifier: 'synthetic-voice', name: '声音', content: '仅用于合成测试的写作要求。', enabled: true}]}});
  const library = JSON.parse(await readFile(join(root, 'library.json'), 'utf8'));
  assert.equal(library.storageVersion, 5);
  const base = join(root, 'novels', library.directories[novel.id]);
  const planningIndex = JSON.parse(await readFile(join(base, 'planning/index.json'), 'utf8'));
  assert.equal(Object.keys(planningIndex.nodeFiles).length, 2);
  assert.equal(Object.keys(planningIndex.decorationFiles).length, 2);
  const before = await store.load();
  const exported = await new TransferService(store).export({selection: {kind: 'works', novelIds: [novel.id]}});
  assert.deepEqual(await store.load(), before, 'export must not change logical work data');
  const packet = JSON.parse(exported.content), book = packet.payload.projects[0];
  assert.equal(packet.format, 'cuigengji-package'); assert.equal(packet.version, 1);
  assert.equal(book.chapters[chapter.id].versions.length, 2);
  assert.equal(book.chapters[trash.id].deleted, true);
  assert.equal(book.nodes[person.id].versions.length, 2);
  assert.equal(book.memoryGroups[childGroup.id].parentId, group.id);
  assert.equal(book.planning.groups[plan.mapping.child].parentId, plan.mapping.root);
  assert.equal(Object.keys(book.planning.decorations).length, 2);
  await writeFile(join(output, 'wholebook.json'), exported.content);
  const provenance = {
    synthetic: true, upstreamRepository: 'mistnest/dsh-cuigengji-plugin', upstreamCommit: expectedCommit,
    upstreamVersion: '0.5.0', sourceStorageVersion: library.storageVersion,
    packageFormat: packet.format, packageVersion: packet.version,
    generatedVia: ['Store.dispatch', 'TransferService.export'],
    fileSha256: createHash('sha256').update(exported.content).digest('hex'),
    payloadSha256: packet.sha256,
    ids: {novel: novel.id, volume: volume.id, chapter: chapter.id, trash: trash.id, world: world.id, person: person.id, relation: relation.id, group: group.id, childGroup: childGroup.id, page: page.id, ...plan.mapping},
    sourcePlanningFileMaps: {pageFiles: planningIndex.pageFiles, nodeFiles: planningIndex.nodeFiles, decorationFiles: planningIndex.decorationFiles},
  };
  await writeFile(join(output, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
  console.log(JSON.stringify({output, bytes: Buffer.byteLength(exported.content), sourceStorageVersion: 5, novelId: novel.id}));
} finally { await rm(root, {recursive: true, force: true}); }
