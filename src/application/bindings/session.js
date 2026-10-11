import { isReadAction } from '../../contracts/actions.js';
import {novelLifecycleActions, recyclesNovel} from '../novels/lifecycle.ts';
import {createHash} from 'node:crypto';
const sessionKey = id => createHash('sha256').update(id || '').digest('hex');

export function createSessionPolicy({ store, audit, ready = async () => undefined }) {
  const active = new Set();
  const resolveBinding = async sessionId => {
    await ready();
    return store.dispatch('binding.get', {}, { kind: 'agent', sessionId });
  };

  async function dispatch(action, args = {}, actor = { kind: 'agent' }) {
    await ready();
    if (action === 'binding.set' && active.has(actor.sessionId)) throw new Error('会话正在运行，请停止后切换小说或章节');
    if (novelLifecycleActions.includes(action) && actor.kind !== 'human') throw new Error('整部作品的回收、恢复与永久删除需要作者操作');
    if (actor.kind === 'agent') {
      const binding = await resolveBinding(actor.sessionId);
      // Inspecting an unbound session is valid and lets the agent explain how
      // to begin; all novel data operations still require an author binding.
      if (action === 'binding.get') return binding;
      if (!binding) throw new Error('请先在催更姬面板绑定小说');
      if (args.novelId && args.novelId !== binding.novelId) throw new Error('不能访问另一部小说');
      args = { ...args, novelId: binding.novelId };

    }
    const guard = action === 'binding.set' || recyclesNovel(action, args) ? state => {
      if (action === 'binding.set' && active.has(actor.sessionId)) throw new Error('会话正在运行，请停止后切换小说或章节');
      if (recyclesNovel(action, args)) {
        const novelId = args.novelId || state.bindings[sessionKey(actor.sessionId)]?.novelId;
        for (const sessionId of active) if (novelId && state.bindings[sessionKey(sessionId)]?.novelId === novelId) {
          throw Object.assign(new Error('这部作品仍有 AI 写作任务在运行，请先停止相关会话，再移入回收站'), {code: 'NOVEL_BUSY'});
        }
      }
    } : undefined;
    const result = await store.dispatch(action, args, actor, guard);
    if (!isReadAction(action)) await audit(actor.sessionId, {
      action, actor: actor.kind, entityId: result?.id, revision: result?.revision, reason: args.reason || '',
    });
    return result;
  }

  function register(ctx, memory) {
    const disconnect = sessionId => {
      // Status/disposal are emit events; do not leave an unhandled rejection.
      void memory.disconnect(sessionId).catch(error => ctx.logger?.warn?.(`cuigengji memory cleanup: ${error.message}`));
    };
    ctx.on('agent/pre-step', async ({ agent }, next) => {
      const sessionId = String(agent.id);
      // DSH only emits pre-step for running agents. Record this before any I/O
      // so a simultaneous recycle sees the active session inside the lock.
      active.add(sessionId);
      try {await resolveBinding(sessionId);}
      catch (error) {if (error.code !== 'UPGRADE_REQUIRED') throw error;}
      return next();
    });
    ctx.on('agent/status', ({ agent, status }) => {
      const sessionId = String(agent.id);
      if (status === 'running') active.add(sessionId);
      else {
        active.delete(sessionId);
        disconnect(sessionId);
      }
    });
    ctx.on('agent/disposed', ({ agent }) => {
      const sessionId = String(agent.id);
      active.delete(sessionId);
      disconnect(sessionId);
    });
  }
  return { dispatch, resolveBinding, register };
}
