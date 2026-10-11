import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {createService} from '../server/service.mjs';

test('作者保存、AI 读取与修改、重启、历史恢复共用同一数据', async () => {
  const base = resolve(import.meta.dirname, '../.data/tests');
  await mkdir(base,{recursive:true});
  const root = await mkdtemp(join(base,'adapter-'));
  const ui = await createService(root), agent = await createService(root);
  const initial = await ui.snapshot();
  const text = '　　窗边的灯仍亮着。\n\n“请进。”——她说。';
  const saved = await ui.call('chapter_save', {content:text,expectedRevision:initial.chapter.revision,reason:'作者修改'}, 'human');
  assert.equal((await agent.call('chapter_read')).chapter.content,text);
  const request = {content:text+'\n\n故事还在继续。',expectedRevision:saved.chapter.revision,requestId:'agent-request'};
  const edited = await agent.call('chapter_save',request);
  assert.equal((await ui.call('chapter_read')).chapter.content,request.content);
  const repeated = await agent.call('chapter_save',request);
  assert.equal(repeated.chapter.revision,edited.chapter.revision);
  const restarted = await createService(root);
  assert.equal((await restarted.snapshot()).chapter.content,request.content);
  await assert.rejects(()=>ui.call('chapter_save',{content:'过期编辑',expectedRevision:saved.chapter.revision},'human'),error=>error.code==='CONFLICT');
  const history = await restarted.call('chapter_history');
  assert.deepEqual(history.map(x=>x.actor.kind),['human','human','agent']);
  const restored = await restarted.call('chapter_restore',{targetRevision:saved.chapter.revision,expectedRevision:edited.chapter.revision},'human');
  assert.equal(restored.chapter.content,text);
  assert.equal(restored.chapter.revision,edited.chapter.revision+1);
});
