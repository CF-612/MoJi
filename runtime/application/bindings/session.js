import { isReadAction } from "../../contracts/actions.js";
import { novelLifecycleActions, recyclesNovel } from "../novels/lifecycle.js";
import { createHash } from "node:crypto";
const sessionKey = (id) => createHash("sha256").update(id || "").digest("hex");
function createSessionPolicy({ store, audit, ready = async () => void 0 }) {
  const active = /* @__PURE__ */ new Set();
  const resolveBinding = async (sessionId) => {
    await ready();
    return store.dispatch("binding.get", {}, { kind: "agent", sessionId });
  };
  async function dispatch(action, args = {}, actor = { kind: "agent" }) {
    await ready();
    if (action === "binding.set" && active.has(actor.sessionId)) throw new Error("\u4F1A\u8BDD\u6B63\u5728\u8FD0\u884C\uFF0C\u8BF7\u505C\u6B62\u540E\u5207\u6362\u5C0F\u8BF4\u6216\u7AE0\u8282");
    if (novelLifecycleActions.includes(action) && actor.kind !== "human") throw new Error("\u6574\u90E8\u4F5C\u54C1\u7684\u56DE\u6536\u3001\u6062\u590D\u4E0E\u6C38\u4E45\u5220\u9664\u9700\u8981\u4F5C\u8005\u64CD\u4F5C");
    if (actor.kind === "agent") {
      const binding = await resolveBinding(actor.sessionId);
      if (action === "binding.get") return binding;
      if (!binding) throw new Error("\u8BF7\u5148\u5728\u50AC\u66F4\u59EC\u9762\u677F\u7ED1\u5B9A\u5C0F\u8BF4");
      if (args.novelId && args.novelId !== binding.novelId) throw new Error("\u4E0D\u80FD\u8BBF\u95EE\u53E6\u4E00\u90E8\u5C0F\u8BF4");
      args = { ...args, novelId: binding.novelId };
    }
    const guard = action === "binding.set" || recyclesNovel(action, args) ? (state) => {
      if (action === "binding.set" && active.has(actor.sessionId)) throw new Error("\u4F1A\u8BDD\u6B63\u5728\u8FD0\u884C\uFF0C\u8BF7\u505C\u6B62\u540E\u5207\u6362\u5C0F\u8BF4\u6216\u7AE0\u8282");
      if (recyclesNovel(action, args)) {
        const novelId = args.novelId || state.bindings[sessionKey(actor.sessionId)]?.novelId;
        for (const sessionId of active) if (novelId && state.bindings[sessionKey(sessionId)]?.novelId === novelId) {
          throw Object.assign(new Error("\u8FD9\u90E8\u4F5C\u54C1\u4ECD\u6709 AI \u5199\u4F5C\u4EFB\u52A1\u5728\u8FD0\u884C\uFF0C\u8BF7\u5148\u505C\u6B62\u76F8\u5173\u4F1A\u8BDD\uFF0C\u518D\u79FB\u5165\u56DE\u6536\u7AD9"), { code: "NOVEL_BUSY" });
        }
      }
    } : void 0;
    const result = await store.dispatch(action, args, actor, guard);
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
      active.add(sessionId);
      try {
        await resolveBinding(sessionId);
      } catch (error) {
        if (error.code !== "UPGRADE_REQUIRED") throw error;
      }
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
