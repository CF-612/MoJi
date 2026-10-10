import { isReadAction } from "../../contracts/actions.js";
function createSessionPolicy({ store, audit, ready = async () => void 0 }) {
  const active = /* @__PURE__ */ new Set();
  const resolveBinding = async (sessionId) => {
    await ready();
    return store.dispatch("binding.get", {}, { kind: "agent", sessionId });
  };
  async function dispatch(action, args = {}, actor = { kind: "agent" }) {
    await ready();
    if (action === "binding.set" && active.has(actor.sessionId)) throw new Error("\u4F1A\u8BDD\u6B63\u5728\u8FD0\u884C\uFF0C\u8BF7\u505C\u6B62\u540E\u5207\u6362\u5C0F\u8BF4\u6216\u7AE0\u8282");
    if (actor.kind === "agent") {
      const binding = await resolveBinding(actor.sessionId);
      if (action === "binding.get") return binding;
      if (!binding) throw new Error("\u8BF7\u5148\u5728\u50AC\u66F4\u59EC\u9762\u677F\u7ED1\u5B9A\u5C0F\u8BF4");
      if (args.novelId && args.novelId !== binding.novelId) throw new Error("\u4E0D\u80FD\u8BBF\u95EE\u53E6\u4E00\u90E8\u5C0F\u8BF4");
      args = { ...args, novelId: binding.novelId };
    }
    const result = await store.dispatch(action, args, actor);
    if (!isReadAction(action)) await audit(actor.sessionId, {
      action,
      actor: actor.kind,
      entityId: result?.id,
      revision: result?.revision,
      reason: args.reason || ""
    });
    return result;
  }
  function register(ctx, memory) {
    const disconnect = (sessionId) => {
      void memory.disconnect(sessionId).catch((error) => ctx.logger?.warn?.(`cuigengji memory cleanup: ${error.message}`));
    };
    ctx.on("agent/pre-step", async ({ agent }, next) => {
      const sessionId = String(agent.id);
      try {
        await resolveBinding(sessionId);
      } catch (error) {
        if (error.code !== "UPGRADE_REQUIRED") throw error;
      }
      active.add(sessionId);
      return next();
    });
    ctx.on("agent/status", ({ agent, status }) => {
      const sessionId = String(agent.id);
      if (status === "running") active.add(sessionId);
      else {
        active.delete(sessionId);
        disconnect(sessionId);
      }
    });
    ctx.on("agent/disposed", ({ agent }) => {
      const sessionId = String(agent.id);
      active.delete(sessionId);
      disconnect(sessionId);
    });
  }
  return { dispatch, resolveBinding, register };
}
export {
  createSessionPolicy
};
