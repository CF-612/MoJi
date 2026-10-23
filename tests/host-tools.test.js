import {testCredentials} from './helpers/credentials.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apply } from '../src/index.js';
import { storageSnapshot } from './helpers/storage-snapshot.js';

test('registered DSH tools execute through session policy and real MCP', async t => {
  const root = await mkdtemp(join(tmpdir(), 'cuigengji-host-'));
  const registered = new Map();
  const effects = [];
  const ctx = {credentials:testCredentials(),
    tools: { register: tool => registered.set(tool.name, tool), guard() {} },
    skills: { register() {} }, connection: { fetch: { register() {} } },
    on() {}, effect: fn => effects.push(fn()), provide: (key, value) => { ctx[key] = value; },
  };
  t.after(async () => { for (const dispose of effects) await dispose(); await rm(root, { recursive: true, force: true }); });
  await apply(ctx, { dataRoot: root });
  const human = { kind: 'human', sessionId: 'writer' };
  const dispatch = (action, args = {}) => ctx.cuigengji.dispatch(action, args, human);
  let id = 0;
  const execute = async (name, action, args = {}) => JSON.parse(await registered.get(name).execute(
    { action, args }, { agent: { id: 'writer' }, callId: `test-${++id}`, signal: new AbortController().signal }));
  assert.equal(await execute('moji_context', 'binding.get'), null);
  const novel = await dispatch('novel.create', { title: '工具边界测试' });
  await dispatch('binding.set', { novelId: novel.id });
  assert.equal((await execute('moji_project', 'novel.get')).id, novel.id);
  await assert.rejects(execute('moji_project','novel.get',{novelId:'other'}),/另一部小说/);
  const initialStory=await execute('moji_plan','story.get');
  const tx=await execute('moji_plan','story.apply',{requestId:'host-planning',expectedRevision:initialStory.state.revision,operation:{type:'card.create',value:{title:'雨夜来客'}}});
  assert.equal(Object.keys(tx.state.cards).length,1);
  const chapter = await execute('moji_project', 'chapter.create', { title: '第一章', content: '雨停了。' });
  const savedPreset = await dispatch('preset.set', { expectedRevision: 0, preset: {
    name: '文风', enabled: true, blocks: [{ identifier: 'style', name: '表达', enabled: true, role: 'system', content: '短句与留白' }],
  } });
  const beforeRead = await storageSnapshot(root);
  const handoff = await execute('moji_project', 'novel.handoff');
  assert.equal(handoff.novel.id, novel.id);
  assert.equal(handoff.chapters[0].id, chapter.id);
  assert.doesNotMatch(JSON.stringify(handoff), /雨停了|短句与留白/);
  assert.equal((await execute('moji_context', 'preset.read')).content, '短句与留白');
  assert.deepEqual((await execute('moji_context', 'context.get')).items, []);
  assert.equal(await storageSnapshot(root), beforeRead, 'read tools must not create request-cache entries or rewrite the store');
  await dispatch('preset.set', { expectedRevision: savedPreset.revision, preset: { ...savedPreset, enabled: false } });
  assert.equal((await execute('moji_context', 'preset.read')).content, '');
  const node = await execute('moji_memory', 'graph.create', { type: 'character_card', name: '来客', sources: [{ chapterId: chapter.id, revision: chapter.revision }] });
  assert.equal((await execute('moji_memory', 'graph.get', { nodeId: node.id })).name, '来客');
  const setting = await execute('moji_memory', 'graph.continue', { nodeId: node.id, expectedRevision: node.revision, value: { type: 'world_entry', name: '旧书铺', content: '临时工具验证设定' } });
  const moved = await execute('moji_memory', 'graph.layout', { requestId: 'host-layout', positions: [{ nodeId: node.id, expectedRevision: node.revision, position: { x: -300, y: -120 } }, { nodeId: setting.node.id, expectedRevision: setting.node.revision, position: { x: 60, y: -120 } }] });
  assert.deepEqual((await execute('moji_memory', 'graph.get', { nodeId: node.id })).position, { x: -300, y: -120 });
  const copies = await execute('moji_memory', 'graph.duplicate', { members: moved.map(n => ({ id: n.id, expectedRevision: n.revision })) });
  assert.equal(copies.nodes.length, 2); assert.equal(copies.edges.length, 1);
  await execute('moji_memory', 'graph.remove', { members: copies.nodes.map(n => ({ id: n.id, expectedRevision: n.revision })), confirm: true });
  await execute('moji_memory', 'edge.disconnect', { edges: [{ id: setting.edge.id, expectedRevision: setting.edge.revision }], confirm: true });
  assert.equal((await execute('moji_memory', 'edge.list')).length, 0);
  assert.equal((await execute('moji_memory', 'graph.list')).length, 2);
  await execute('moji_project', 'chapter.update', { chapterId: chapter.id, expectedRevision: chapter.revision, content: '' });
  assert.equal((await execute('moji_project', 'chapter.get', { chapterId: chapter.id })).content, '');
  assert.equal((await execute('moji_memory', 'graph.get', { nodeId: node.id })).status, 'stale');
  let story=await execute('moji_plan','story.get');
  const change=async operation=>(story=await execute('moji_plan','story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation}));
  await change({type:'card.create',pageId:'main',value:{title:'收到密信'}});
  const start=Object.values(story.state.cards).find(c=>c.title==='收到密信');
  await change({type:'card.create',pageId:'main',value:{title:'秘密赴约',summary:'循线寻找写信人'}});
  const next=Object.values(story.state.cards).find(c=>c.title==='秘密赴约');
  await change({type:'precedence',from:'card:'+start.id,to:'card:'+next.id});
  assert.ok(story.state.precedence.some(e=>e.from==='card:'+start.id&&e.to==='card:'+next.id));
  const update={requestId:'host-story-update',expectedRevision:story.state.revision,operation:{type:'card.update',id:start.id,expectedRevision:1,value:{summary:'原卡片补充',content:'继续讨论这个事件'}}};
  const updated=await execute('moji_plan','story.apply',update);
  assert.deepEqual(await execute('moji_plan','story.apply',update),updated);
  assert.equal(updated.state.cards[start.id].revision,2);assert.equal(updated.state.cards[start.id].content,'继续讨论这个事件');
  await assert.rejects(execute('moji_plan','story.apply',{...update,requestId:'stale-story'}),/已有更新/);
  await assert.rejects(execute('moji_plan','story.apply',{...update,requestId:'stale-card',expectedRevision:updated.state.revision}),/已有更新/);
  await assert.rejects(execute('moji_plan','planning.apply',{operations:[]}),/action.*must be one of/);
  assert.deepEqual((await execute('moji_plan','story.get')).state,updated.state);
});
