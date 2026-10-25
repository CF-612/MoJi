import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, readdir, rm, stat, rename} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {Store} from '../src/core/store.js';
import {WorkData} from '../src/application/backup/workspace.js';
import {bookPath, fileId, pageKey, splitWorkspace, readableFileName, validManagedFileName, namedChapterFiles, managedFileKey, MANAGED_FILE_BYTE_LIMIT} from '../src/infrastructure/persistence/project-layout.ts';
import {directorySnapshot} from '../src/domain/chapters/order.ts';
import {storageSnapshot} from './helpers/storage-snapshot.js';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'cuigengji-file-names-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  const store = new Store(root), actor = {kind:'human', sessionId:'file-name-author'};
  const novel = await store.dispatch('novel.create', {title:'神人 · 合成测试'}, actor);
  const run = (action, args={}) => store.dispatch(action, {novelId:novel.id, ...args}, actor);
  const chapter = await run('chapter.create', {title:'第1章 雨夜来信', content:'正文、换行和版本需要完整保留。\n\n她收到一封信。', requestId:'create-chapter'});
  await run('chapter.update', {chapterId:chapter.id, expectedRevision:1, content:'第二版正文。\n\n她打开了信。'});
  const duplicate = await run('chapter.create', {title:chapter.title, content:'同名章节不能覆盖原文。'});
  const character = await run('graph.create', {type:'character_card', name:'林序', content:'人物全文。', sources:[{chapterId:chapter.id, revision:2}]});
  const setting = await run('graph.create', {type:'world_entry', name:'雾港/码头', content:'世界设定全文。'});
  await run('edge.create', {from:character.id, to:setting.id, name:'居住', content:'人物与地点的关系。'});
  await run('binding.set', {chapterId:chapter.id});
  const plan = await run('planning.apply', {requestId:'create-plan', operations:[
    {op:'page.create', ref:'page', value:{name:'码头决战推演'}},
    {op:'node.create', ref:'main', value:{title:'等待回信', content:'主线全文。'}},
    {op:'node.create', ref:'scene', value:{pageId:'page', title:'收到警报', content:'规划全文。', chapterRefs:[{chapterId:chapter.id, revision:2}], memoryRefs:[character.id], status:'written'}},
    {op:'decoration.create', ref:'note', value:{pageId:'page', title:'未决问题', content:'是谁发出的警报？'}},
  ]});
  return {root, store, actor, novel, run, chapter, duplicate, character, setting, plan};
}
async function indexes(root, id) {
  const library = await json(join(root, 'library.json')), base = bookPath(id, library.directories);
  return {library, base, chapters:await json(join(root, base, 'chapters/index.json')), settings:await json(join(root, base, 'settings/index.json')), planning:await json(join(root, base, 'planning/index.json'))};
}
async function versionThree(root, state, directories) {
  const files = splitWorkspace(state, directories, 3);
  for (const [path, content] of files) {await mkdir(dirname(join(root, path)), {recursive:true}); await writeFile(join(root, path), content);}
  return files;
}

test('readable filenames are Windows-safe, distinct, bounded and retain collision suffixes with long Unicode titles', () => {
  const titles = ['CON', 'NUL.txt', 'LPT¹', '码头/决战:第?一*部. ', '..', '😀'.repeat(200), 'ABC', 'abc'];
  const names = titles.map((title, i) => readableFileName(title, 'id-' + i));
  assert.ok(names.every(validManagedFileName)); assert.ok(names.every(name => name.length <= 120));
  assert.ok(names.every(name => Buffer.byteLength(name, 'utf8') <= MANAGED_FILE_BYTE_LIMIT));
  assert.ok(names.every(name => Buffer.byteLength('.'+name+'.stage-'+'0'.repeat(36), 'utf8') <= 255));
  assert.ok(names.every(name => !name.includes('\ufffd'))); assert.ok(names[0].startsWith('条目_CON--'));
  assert.ok(names[3].startsWith('码头_决战_第_一_部--')); assert.ok(names[4].startsWith('未命名--'));
  assert.equal(new Set(names.map(managedFileKey)).size, titles.length);
  const title = '😀'.repeat(200), original = readableFileName(title, 'long-id', '未命名章节');
  const duplicate = namedChapterFiles({'long-id':{title}}, {}, [original])['long-id'];
  assert.ok(duplicate.includes('（2）--')); assert.ok(duplicate.length <= 120); assert.notEqual(duplicate, original);
  assert.equal(validManagedFileName('../章节--12345678.json'), false);
  assert.equal(validManagedFileName('index.json'), false);
});

test('v3 migration changes managed names and indexes only, preserving all record bytes, IDs, references and extra files', async t => {
  const {root, store, novel, actor, chapter, character, plan} = await fixture(t), expected = await store.load();
  const directories = (await indexes(root, novel.id)).library.directories, legacy = join(root, 'v3');
  const original = await versionThree(legacy, expected, directories), base = bookPath(novel.id, directories);
  const occupied = readableFileName(chapter.title, chapter.id, '未命名章节');
  await writeFile(join(legacy, base, 'chapters', occupied), '作者自己的同名文件');
  await writeFile(join(legacy, base, 'notes.txt'), '作者额外摘录');
  const migrated = new Store(legacy); assert.deepEqual(await migrated.load(), expected);
  const index = await indexes(legacy, novel.id); assert.equal(index.library.storageVersion, 5);
  assert.ok(index.chapters[chapter.id].file.includes('（2）--'));
  for (const [path, content] of original) {
    if (path === 'library.json' || /\/(chapters|settings|planning)\/index\.json$/.test(path)) continue;
    let destination = path;
    for (const id of Object.keys(index.chapters)) if (path === `${base}/chapters/${fileId(id)}.json`) destination = `${base}/chapters/${index.chapters[id].file}`;
    for (const id of Object.keys(index.settings)) if (path === `${base}/settings/entries/${fileId(id)}.json`) destination = `${base}/settings/entries/${index.settings[id].file}`;
    for (const id of index.planning.pageIds) if (path === `${base}/planning/${pageKey(id)}.json`) destination = `${base}/planning/${index.planning.pageFiles[pageKey(id)]}`;
    assert.equal(await readFile(join(legacy, destination), 'utf8'), content, destination);
    if (destination !== path) await assert.rejects(stat(join(legacy, path)), {code:'ENOENT'});
  }
  assert.equal(await readFile(join(legacy, base, 'chapters', occupied), 'utf8'), '作者自己的同名文件');
  assert.equal(await readFile(join(legacy, base, 'notes.txt'), 'utf8'), '作者额外摘录');
  const checkpoints = (await readdir(join(legacy, 'backups'))).filter(name => name.startsWith('before-readable-files-'));
  assert.equal(checkpoints.length, 1);
  assert.deepEqual(await json(join(legacy, 'backups', checkpoints[0], 'store.json')), expected);
  assert.equal(await readFile(join(legacy, 'backups', checkpoints[0], 'library.json'), 'utf8'), original.get('library.json'));
  assert.equal((await migrated.dispatch('chapter.create', {novelId:novel.id, title:chapter.title, content:'正文、换行和版本需要完整保留。\n\n她收到一封信。', requestId:'create-chapter'}, actor)).id, chapter.id);
  assert.equal((await migrated.dispatch('planning.get', {novelId:novel.id, nodeId:plan.mapping.scene})).node.memoryRefs[0], character.id);
  const portable = await new WorkData(migrated).export(), restored = new Store(join(root, 'restored'));
  await new WorkData(restored).import(portable); assert.deepEqual(await restored.load(), expected);
  assert.equal((await new WorkData(migrated).status()).storageVersion, 5);
});

test('chapter and setting renames remove old managed files, preserve historical references, and restore the original chapter title', async t => {
  const {root, store, novel, run, chapter, duplicate, character, plan} = await fixture(t), before = await indexes(root, novel.id);
  const originalHistory = await readFile(join(root, before.base, 'history/chapters', `${fileId(chapter.id)}.json`), 'utf8');
  const occupied = readableFileName('第2章 新标题', chapter.id, '未命名章节');
  await writeFile(join(root, before.base, 'chapters', occupied), '请勿覆盖的文件');
  await run('chapter.update', {chapterId:chapter.id, expectedRevision:2, title:'第2章 新标题', requestId:'rename-chapter'});
  await run('graph.update', {nodeId:character.id, expectedRevision:(await run('graph.get', {nodeId:character.id})).revision, name:'林序:船长'});
  const after = await indexes(root, novel.id);
  assert.ok(after.chapters[chapter.id].file.includes('（2）--')); assert.ok(after.settings[character.id].file.startsWith('角色-林序_船长--'));
  assert.equal(await readFile(join(root, after.base, 'chapters', occupied), 'utf8'), '请勿覆盖的文件');
  await assert.rejects(stat(join(root, before.base, 'chapters', before.chapters[chapter.id].file)), {code:'ENOENT'});
  await assert.rejects(stat(join(root, before.base, 'settings/entries', before.settings[character.id].file)), {code:'ENOENT'});
  assert.equal(after.chapters[duplicate.id].file, before.chapters[duplicate.id].file);
  assert.equal((await run('graph.get', {nodeId:character.id})).content, '人物全文。');
  assert.equal((await run('planning.get', {nodeId:plan.mapping.scene})).node.chapterRefs[0].revision, 2);
  const history = await json(join(root, before.base, 'history/chapters', `${fileId(chapter.id)}.json`)); assert.deepEqual(history.slice(0, 2), JSON.parse(originalHistory));
  await run('chapter.restore', {chapterId:chapter.id, expectedRevision:3, targetRevision:2});
  assert.equal((await run('chapter.get', {chapterId:chapter.id})).title, chapter.title);
  const restored = await indexes(root, novel.id); assert.equal(restored.chapters[chapter.id].file, before.chapters[chapter.id].file);
  await assert.rejects(stat(join(root, after.base, 'chapters', after.chapters[chapter.id].file)), {code:'ENOENT'});
  const state = await store.load(), filesBeforeMove = {...restored.chapters};
  await run('chapter.move', {chapterId:duplicate.id, beforeChapterId:chapter.id, expectedDirectory:directorySnapshot(Object.values(state.novels[novel.id].chapters), Object.values(state.novels[novel.id].volumes || {})), requestId:'move-chapter'});
  const moved = await indexes(root, novel.id);
  for (const id of Object.keys(filesBeforeMove)) assert.equal(moved.chapters[id].file, filesBeforeMove[id].file, 'reordering does not rename chapters');
});

test('renaming an unread planning page preserves every node and annotation body and reserves unowned destinations', async t => {
  const {root, novel, run, plan} = await fixture(t), before = await indexes(root, novel.id), pageId = plan.mapping.page;
  const oldFile = before.planning.pageFiles[pageKey(pageId)], mainFile = before.planning.pageFiles[pageKey(null)];
  const mainBytes = await readFile(join(root, before.base, 'planning', mainFile), 'utf8');
  const occupied = readableFileName('决战沙盘', pageId);
  await writeFile(join(root, before.base, 'planning', occupied), '自存推演');
  const renamed = await run('planning.page.update', {pageId, expectedRevision:1, name:'决战沙盘', requestId:'rename-page'});
  assert.equal(renamed.id, pageId); const after = await indexes(root, novel.id);
  assert.ok(after.planning.pageFiles[pageKey(pageId)].includes('（2）--'));
  await assert.rejects(stat(join(root, before.base, 'planning', oldFile)), {code:'ENOENT'});
  assert.equal(await readFile(join(root, before.base, 'planning', occupied), 'utf8'), '自存推演');
  assert.equal((await run('planning.get', {nodeId:plan.mapping.scene})).node.content, '规划全文。');
  assert.equal((await run('planning.decorations', {pageId})).items[0].content, '是谁发出的警报？');
  assert.equal(await readFile(join(root, before.base, 'planning', mainFile), 'utf8'), mainBytes);
});

test('interrupted migration after deleting a legacy filename resumes with the complete workspace and exactly one checkpoint', async t => {
  const {root, store, novel} = await fixture(t), expected = await store.load(), legacy = join(root, 'interrupted-v3');
  await versionThree(legacy, expected, (await indexes(root, novel.id)).library.directories);
  const migrating = new Store(legacy), apply = migrating.transaction.applyEntry.bind(migrating.transaction);
  migrating.transaction.applyEntry = async (entry, content) => {await apply(entry, content); if (content === null) throw new Error('删除旧文件后中断');};
  await assert.rejects(migrating.dispatch('novel.list'), /中断/);
  assert.equal((await json(join(legacy, 'library.json'))).storageVersion, 3);
  assert.ok(await stat(join(legacy, 'transaction.pending.json')));
  const recovered = new Store(legacy); assert.deepEqual(await recovered.load(), expected);
  assert.equal((await json(join(legacy, 'library.json'))).storageVersion, 5);
  await assert.rejects(stat(join(legacy, 'transaction.pending.json')), {code:'ENOENT'});
  assert.equal((await readdir(join(legacy, 'backups'))).filter(name => name.startsWith('before-readable-files-')).length, 1);
});

test('interrupted chapter rename recovers the new name, content, history and cached result together', async t => {
  const {root, store, novel, actor, chapter} = await fixture(t), before = await indexes(root, novel.id);
  const args = {novelId:novel.id, chapterId:chapter.id, title:'改名后的章节', content:'改名同时更新的正文。', expectedRevision:2, requestId:'interrupted-rename'};
  const apply = store.transaction.applyEntry.bind(store.transaction);
  store.transaction.applyEntry = async (entry, content) => {await apply(entry, content); if (content === null) throw new Error('改名提交中断');};
  await assert.rejects(store.dispatch('chapter.update', args, actor), /中断/);
  const recovered = new Store(root), result = await recovered.dispatch('chapter.update', args, actor);
  assert.equal(result.revision, 3); assert.equal(result.id, chapter.id);
  const body = await recovered.dispatch('chapter.get', {novelId:novel.id, chapterId:chapter.id}); assert.equal(body.content, args.content);
  assert.equal((await recovered.dispatch('chapter.history', {novelId:novel.id, chapterId:chapter.id})).length, 3);
  await assert.rejects(stat(join(root, before.base, 'chapters', before.chapters[chapter.id].file)), {code:'ENOENT'});
});

test('invalid or duplicate readable mappings and corrupt v3 records fail before writing any novel file', async t => {
  const {root, store, novel, chapter, duplicate} = await fixture(t), index = await indexes(root, novel.id), legacy = join(root, 'bad-v3');
  const expected = await store.load(); await versionThree(legacy, expected, index.library.directories);
  await writeFile(join(legacy, index.base, 'chapters', `${fileId(chapter.id)}.json`), '{}');
  const beforeLegacy = await storageSnapshot(legacy);
  await assert.rejects(new Store(legacy).dispatch('novel.list'), {code:'CORRUPT_STORE'});
  assert.equal(await storageSnapshot(legacy), beforeLegacy); await assert.rejects(stat(join(legacy, 'backups')), {code:'ENOENT'});
  const path = join(root, index.base, 'chapters/index.json');
  for (const file of ['../outside--12345678.json', 'index.json', index.chapters[duplicate.id].file]) {
    index.chapters[chapter.id].file = file; await writeFile(path, JSON.stringify(index.chapters));
    const before = await storageSnapshot(root);
    await assert.rejects(new Store(root).dispatch('chapter.list', {novelId:novel.id}), {code:'CORRUPT_STORE'});
    assert.equal(await storageSnapshot(root), before);
  }
});

test('single-book exports omit physical filenames and imports regenerate readable paths without changing IDs', async t => {
  const {root, store, novel, run, chapter, character, plan} = await fixture(t), backup = await run('novel.export');
  assert.ok(!Object.hasOwn(backup.novel.chapters[chapter.id], 'file')); assert.ok(!Object.hasOwn(backup.novel.nodes[character.id], 'file'));
  assert.ok(!Object.hasOwn(backup.novel.planning, 'pageFiles'));
  const target = join(root, 'imported'), restored = new Store(target); await restored.dispatch('novel.import', {backup});
  assert.deepEqual((await restored.load()).novels[novel.id], (await store.load()).novels[novel.id]);
  const index = await indexes(target, novel.id);
  assert.ok(index.chapters[chapter.id].file.startsWith('第1章 雨夜来信--'));
  assert.ok(index.settings[character.id].file.startsWith('角色-林序--'));
  assert.ok(index.planning.pageFiles[pageKey(plan.mapping.page)].startsWith('码头决战推演--'));
  assert.equal(index.planning.pageFiles[pageKey(null)], '主线--main.json');
});

test('case and sanitized-equivalent renames keep valid filenames and repeated metadata saves do not rename collision paths again', async t => {
  const {root, novel, run, chapter, character, plan} = await fixture(t);
  let c = await run('chapter.update', {chapterId:chapter.id, expectedRevision:2, title:'A/B'});
  c = await run('chapter.update', {chapterId:chapter.id, expectedRevision:c.revision, title:'a:b'});
  let n = await run('graph.update', {nodeId:character.id, expectedRevision:(await run('graph.get', {nodeId:character.id})).revision, name:'A/B'});
  n = await run('graph.update', {nodeId:character.id, expectedRevision:n.revision, name:'a:b'});
  let p = await run('planning.page.update', {pageId:plan.mapping.page, expectedRevision:1, name:'A/B', requestId:'case-page-first'});
  p = await run('planning.page.update', {pageId:p.id, expectedRevision:p.revision, name:'a:b', requestId:'case-page-second'});
  const before = await indexes(root, novel.id);
  assert.ok(Object.values(before.chapters).every(row => validManagedFileName(row.file)));
  assert.ok(Object.values(before.settings).every(row => validManagedFileName(row.file)));
  assert.ok(Object.values(before.planning.pageFiles).every(validManagedFileName));
  await run('chapter.update', {chapterId:chapter.id, expectedRevision:c.revision, content:'改名后的正文继续写。'});
  await run('graph.update', {nodeId:character.id, expectedRevision:n.revision, summary:'摘要更新'});
  await run('planning.page.update', {pageId:p.id, expectedRevision:p.revision, summary:'页面摘要更新', requestId:'case-page-summary'});
  const after = await indexes(root, novel.id);
  assert.equal(after.chapters[chapter.id].file, before.chapters[chapter.id].file);
  assert.equal(after.settings[character.id].file, before.settings[character.id].file);
  assert.deepEqual(after.planning.pageFiles, before.planning.pageFiles);
  assert.equal((await run('graph.get', {nodeId:character.id})).content, '人物全文。');
  assert.equal((await run('planning.get', {nodeId:plan.mapping.scene})).node.content, '规划全文。');
});

test('legacy deleted planning records retain their body when their historical page metadata is absent', async t => {
  const {root, store, novel, plan} = await fixture(t), expected = await store.load();
  const board = expected.novels[novel.id].planning;
  delete board.pages[plan.mapping.page];
  board.nodes[plan.mapping.scene].deleted = true; board.decorations[plan.mapping.note].deleted = true;
  const legacy = join(root, 'deleted-legacy-page');
  await versionThree(legacy, expected, (await indexes(root, novel.id)).library.directories);
  const migrated = new Store(legacy); assert.deepEqual(await migrated.load(), expected);
  const index = await indexes(legacy, novel.id);
  assert.ok(validManagedFileName(index.planning.pageFiles[pageKey(plan.mapping.page)]));
  assert.equal((await migrated.dispatch('planning.get', {novelId:novel.id, nodeId:plan.mapping.scene})).node.content, '规划全文。');
  assert.deepEqual((await new WorkData(migrated).export()).payload.state, expected);
});


test('1000-character Unicode and ASCII setting names create, reopen, rename and delete without truncating stored text', async t => {
 const {root,novel,run}=await fixture(t),content='完整正文\n不随文件名前缀截断。';
 for(const name of ['长'.repeat(1000),'A'.repeat(1000),'😀'.repeat(1000)]){
  const first=await run('graph.create',{type:'character_card',name,content});
  let reopened=new Store(root),row=await reopened.dispatch('graph.get',{novelId:novel.id,nodeId:first.id});
  assert.equal(row.name,name);assert.equal(row.content,content);
  let index=await indexes(root,novel.id);const file=index.settings[row.id].file;
  assert.ok(Buffer.byteLength(file,'utf8')<=MANAGED_FILE_BYTE_LIMIT);assert.ok(validManagedFileName(file));
  const renamed=name+'/:?重命名';
  row=await reopened.dispatch('graph.update',{novelId:novel.id,nodeId:row.id,expectedRevision:row.revision,name:renamed},{kind:'human'});
  reopened=new Store(root);const saved=await reopened.dispatch('graph.get',{novelId:novel.id,nodeId:row.id});assert.equal(saved.name,renamed);assert.equal(saved.content,content);
  index=await indexes(root,novel.id);assert.ok(Buffer.byteLength(index.settings[row.id].file,'utf8')<=MANAGED_FILE_BYTE_LIMIT);
  const deleted=await reopened.dispatch('graph.delete',{novelId:novel.id,nodeId:row.id,expectedRevision:row.revision,confirm:true},{kind:'human'});assert.equal(deleted.deleted,true);
  assert.equal((await new Store(root).load()).novels[novel.id].nodes[row.id].name,renamed);
 }
});

test('existing readable Unicode files remain readable and only oversized writable names shorten on a normal save',async t=>{
 const {root,novel,character}=await fixture(t),before=await indexes(root,novel.id),original=before.settings[character.id].file;
 const legacy='旧'.repeat(70)+'--12345678.json';assert.equal(validManagedFileName(legacy),true);assert.ok(Buffer.byteLength(legacy)>MANAGED_FILE_BYTE_LIMIT);
 await rename(join(root,before.base,'settings/entries',original),join(root,before.base,'settings/entries',legacy));
 before.settings[character.id].file=legacy;await writeFile(join(root,before.base,'settings/index.json'),JSON.stringify(before.settings));
 const reopened=new Store(root),row=await reopened.dispatch('graph.get',{novelId:novel.id,nodeId:character.id});assert.equal(row.name,character.name);assert.equal(row.content,character.content);
 // Reading the old index does not migrate it or require a storage-version change.
 assert.equal((await indexes(root,novel.id)).settings[character.id].file,legacy);
 await reopened.dispatch('graph.update',{novelId:novel.id,nodeId:row.id,expectedRevision:row.revision,summary:'正常修改摘要'},{kind:'human'});
 const after=await indexes(root,novel.id);assert.equal(after.library.storageVersion,before.library.storageVersion);assert.ok(Buffer.byteLength(after.settings[row.id].file)<=MANAGED_FILE_BYTE_LIMIT);
 await assert.rejects(stat(join(root,before.base,'settings/entries',legacy)),{code:'ENOENT'});
 assert.equal((await new Store(root).dispatch('graph.get',{novelId:novel.id,nodeId:row.id})).content,character.content);
 for(const [id,entry] of Object.entries(before.settings))if(id!==row.id)assert.equal(after.settings[id].file,entry.file);
});
