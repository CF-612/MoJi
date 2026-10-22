import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile} from 'node:fs/promises';
import {createService} from '../server/service.mjs';
import {createCloudService} from '../cloud/service.mjs';

async function exercise(rpc, reopen) {
  const first = await rpc('chapter.create', {title:'批量测试 A', content:'§', order:100});
  const second = await rpc('chapter.create', {title:'批量测试 B', content:'§'.repeat(501), order:101});
  const chapterIds = [first.id, second.id];
  const read = async call => Promise.all(chapterIds.map(chapterId => call('chapter.get', {chapterId})));
  const before = await read(rpc);
  const oversized = {query:'§', replacement:'替'.repeat(10000), chapterIds};
  const preview = await rpc('writing.prose.search', oversized);
  assert.equal(preview.count, 502);
  // A is mutated in memory first; B exceeds the limit afterwards. Neither
  // chapter nor its revision/history may be persisted on that failure.
  await assert.rejects(rpc('writing.prose.replace', {
    ...oversized, fingerprint:preview.fingerprint, confirmed:true, requestId:'batch-overflow',
  }), /替换后正文过长/);
  assert.deepEqual(await read(rpc), before);
  assert.deepEqual(await read(await reopen()), before);

  const normal = {query:'§', replacement:'雨', chapterIds};
  const ready = await rpc('writing.prose.search', normal);
  const args = {...normal, fingerprint:ready.fingerprint, confirmed:true, requestId:'batch-success'};
  const result = await rpc('writing.prose.replace', args);
  assert.equal(result.count, 502);
  const saved = await read(rpc);
  assert.equal(saved[0].content, '雨');
  assert.equal(saved[1].content, '雨'.repeat(501));
  assert.deepEqual(await rpc('writing.prose.replace', args), result, 'lost-response retry returns same receipt');
  assert.deepEqual(await read(rpc), saved, 'retry does not create extra revisions');
  await assert.rejects(rpc('writing.prose.replace', {...args, requestId:'stale-preview'}), {code:'CONFLICT'});
  assert.deepEqual(await read(await reopen()), saved);
  for (let index=0; index<chapterIds.length; index++) {
    const history = await rpc('chapter.history', {chapterId:chapterIds[index], includeContent:true});
    assert.ok(history.some(version => version.content === before[index].content), 'original prose remains recoverable in history');
  }
}

test('filesystem batch replace: late validation failure is atomic, success is retry-safe and recoverable', async () => {
  const base = new URL('../.data/prose-batch-tests/', import.meta.url);
  await mkdir(base, {recursive:true});
  const root = await mkdtemp(new URL('local-', base).pathname);
  const service = await createService(root);
  const bind = instance => (action,args={}) => instance.rpc(action,{novelId:service.novelId,...args},'batch-safety','human');
  await exercise(bind(service), async () => bind(await createService(root)));
});

test('isolated D1 batch replace: late validation failure is atomic, success is retry-safe and recoverable', async t => {
  const {Miniflare,convertV4MiniflareOptions} = await import('miniflare');
  const base = new URL('../.data/prose-batch-tests/', import.meta.url);
  await mkdir(base, {recursive:true});
  const persist = await mkdtemp(new URL('cloud-', base).pathname);
  await mkdir(persist+'/tmp');
  process.env.TEMP=process.env.TMP=persist+'/tmp';
  const mf = new Miniflare(convertV4MiniflareOptions({
    resourcePersistencePath:persist, resourceTmpPath:persist+'/tmp', modules:true,
    script:'export default {fetch(){return new Response("isolated test")}}',
    compatibilityDate:'2026-10-10', d1Databases:{DB:'batch-safety'},
    outboundService:()=>new Response('External network disabled in test',{status:403}),
  }));
  t.after(()=>mf.dispose());
  const db = await mf.getD1Database('DB');
  const sql = (await Promise.all(['0001_workspace.sql','0002_workspace_blobs.sql'].map(name => readFile(new URL('../cloud/migrations/'+name,import.meta.url),'utf8')))).join('\n');
  for (const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g)) await db.prepare(statement).run();
  const service = createCloudService(db,'synthetic-batch-owner');
  const novelId = (await service.bootstrap('batch-safety')).books[0].id;
  const bind = instance => (action,args={}) => instance.rpc(action,{novelId,...args},'batch-safety','human');
  await exercise(bind(service), async () => bind(createCloudService(db,'synthetic-batch-owner')));
});
