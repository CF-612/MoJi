import {Store} from '../../../src/core/store.js';
import {attachWorkbench} from './workbench-service.mjs';

export async function createService(directory) {
  const store = new Store(directory);
  const actor = {kind: 'human', sessionId: 'cuigengji-demo'};
  let books = await store.dispatch('novel.list', {}, actor);
  if (!books.length) {
    const novel = await store.dispatch('novel.create', {title: '墨叽 · 侧栏协作演示'}, actor);
    await store.dispatch('chapter.create', {
      novelId: novel.id, title: '第一章 雨夜来信',
      content: '　　雨停以后，街道重新安静下来。\n\n　　窗边的灯仍亮着，故事还在继续。', reason: '创建演示章节'
    }, actor);
    books = await store.dispatch('novel.list', {}, actor);
  }
  const novelId = books[0].id;
  const chapters = await store.dispatch('chapter.list', {novelId}, actor);
  const chapterId = chapters[0]?.id;
  const get = () => {
    if (!chapterId) throw Object.assign(new Error('演示作品暂无章节，请使用完整工作台选择或创建章节'),{code:'CHAPTER_REQUIRED'});
    return store.dispatch('chapter.get', {novelId, chapterId, maxChars: 200000}, actor);
  };
  return attachWorkbench({
    store, novelId, chapterId,
    async snapshot() { return {novel: books[0], chapter: await get()}; },
    async call(name, args = {}, kind = 'agent') {
      const acting = {kind, sessionId: 'cuigengji-demo'};
      if (name === 'workbench_open' || name === 'chapter_read') return this.snapshot();
      if (name === 'chapter_history') return store.dispatch('chapter.history', {novelId, chapterId, includeContent: true}, acting);
      if (name === 'chapter_save') {
        await store.dispatch('chapter.update', {novelId, chapterId, content: args.content,
          expectedRevision: args.expectedRevision, reason: args.reason || '侧栏协作修改', requestId: args.requestId}, acting);
        return this.snapshot();
      }
      if (name === 'chapter_restore') {
        await store.dispatch('chapter.restore', {novelId, chapterId, targetRevision: args.targetRevision,
          expectedRevision: args.expectedRevision, reason: '恢复历史版本'}, acting);
        return this.snapshot();
      }
      throw new Error('未知工具');
    }
  });
}
