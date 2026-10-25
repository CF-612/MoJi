import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/application/store.js';
import {TransferService} from '../src/application/transfer/service.ts';
import {catalogBook, counts, legacyPlanningWarnings} from '../src/application/transfer/model.ts';
import {emptyWorkspace} from '../src/domain/story-workspace.mjs';

const fixture = new URL('./fixtures/upstream-050/wholebook.json', import.meta.url);
const actor = {kind: 'human', sessionId: 'synthetic-legacy-planning-catalog'};
test('opening unified story UI does not hide legacy planning from wholebook preview or export', async t => {
  const root = await mkdtemp(join(tmpdir(), 'moji-legacy-catalog-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const packet = JSON.parse(await readFile(fixture, 'utf8')), original = packet.payload.projects[0];
  const store = new Store(root), service = new TransferService(store);
  const file = {name: 'synthetic-upstream-wholebook.json', json: packet}, options = {mode: 'restore'};
  const preview = await service.preview({file, options});
  await service.import({file, options, proof: preview.proof, requestId: randomUUID()}, actor);
  const selection = {kind: 'works', novelIds: [original.id]};
  const before = await service.exportPreview({selection});
  await store.dispatch('story.get', {novelId: original.id}, actor);
  const after = await service.exportPreview({selection});
  assert.equal(after.counts.beats, 2); assert.equal(after.counts.decorations, 2);
  assert.equal(after.counts.pages, before.counts.pages);
  assert.deepEqual(after.counts, before.counts);
  const current = (await store.load()).novels[original.id], snapshot = structuredClone(current);
  assert.ok(current.story);
  assert.deepEqual(catalogBook(current).counts, after.counts);
  assert.ok(legacyPlanningWarnings(current).some(message => message.includes('完整作品')));
  assert.deepEqual(current, snapshot, 'inventory reads must not mutate work data');
  const selectable = catalogBook(current).pages.map(page => page.id);
  assert.deepEqual(selectable, current.story.state.pages.map(page => page.id));
  for (const id of Object.keys(current.planning.pages)) assert.ok(!selectable.includes(id));
  const exported = JSON.parse((await service.export({selection})).content).payload.projects[0];
  assert.equal(JSON.stringify(exported.planning), JSON.stringify(original.planning));
  assert.deepEqual(exported.story, current.story);
});

test('legacy and authored unified planning counts are additive without combining selectable IDs', async () => {
  const original = JSON.parse(await readFile(fixture, 'utf8')).payload.projects[0];
  const n = structuredClone(original);
  n.story = {state: emptyWorkspace(), history: [], redo: []};
  const baseline = counts([original]);
  assert.deepEqual(counts([n]), baseline);
  n.story.state.pages[0].name = '作者命名的空页';
  assert.equal(counts([n]).pages, baseline.pages + 1, 'authored empty pages still count');
  n.story.state.cards['synthetic-card'] = {id: 'synthetic-card'};
  assert.equal(counts([n]).beats, baseline.beats + 1);
  assert.equal(counts([n]).decorations, baseline.decorations);
  assert.deepEqual(catalogBook(n).counts, counts([n]));
  assert.deepEqual(catalogBook(n).pages.map(page => page.id), ['main']);
});

test('ordinary unified-only and legacy-only totals retain their existing interpretation', async () => {
  const n = JSON.parse(await readFile(fixture, 'utf8')).payload.projects[0];
  assert.equal(counts([n]).beats, 2); assert.equal(counts([n]).decorations, 2);
  assert.deepEqual(legacyPlanningWarnings(n), []);
  delete n.planning; n.plan = null;
  n.story = {state: emptyWorkspace(), history: [], redo: []};
  assert.equal(counts([n]).pages, 1); assert.equal(counts([n]).beats, 0);
  assert.deepEqual(catalogBook(n).counts, counts([n]));
  assert.deepEqual(legacyPlanningWarnings(n), []);
});
