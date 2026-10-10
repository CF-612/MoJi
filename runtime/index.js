import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, appendFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Store } from "./application/store.js";
import { MemoryBridge } from "./adapters/mcp/client.js";
import { registerSkills } from "./adapters/dsh/skills.js";
import { planningArgsSchema } from "./adapters/dsh/planning-schema.js";
import { registerPrompt } from "./adapters/dsh/prompt.js";
import { createSessionPolicy } from "./application/bindings/session.js";
import { TOOL_ACTIONS as allowed, isReadAction } from "./contracts/actions.js";
import { registerRpcRoute } from "./adapters/dsh/rpc.js";
import { WorkData } from "./application/backup/workspace.js";
import { TransferService } from "./application/transfer/service.js";
import { UpgradeCoordinator } from "./application/maintenance/upgrade.js";
const name = "cuigengji";
const inject = ["tools", "systemPrompt", "skills", "connection"];
const Config = z.object({
  dataRoot: z.string().default("")
});
const descriptions = {
  cuigengji_project: "\u63A5\u624B\u672C\u4F1A\u8BDD\u7ED1\u5B9A\u7684\u5C0F\u8BF4\u5E76\u8BFB\u53D6\u6216\u4FEE\u6539\u5377\u3001\u7AE0\u3001\u6B63\u6587\u3002novel.handoff \u53EA\u8FD4\u56DE\u4F5C\u54C1\u7D22\u5F15\u3001\u5F53\u524D\u7AE0\u8282/\u4EFB\u52A1\u3001\u7AE0\u8282\u76EE\u5F55\u6458\u8981\u548C\u8D44\u6599\u5165\u53E3\uFF0C\u4E0D\u8FD4\u56DE\u6B63\u6587\uFF1B\u9700\u8981\u6B63\u6587\u65F6\u7528 chapter.get\u3002\u8BFB\u64CD\u4F5C\u8FD4\u56DE revision\uFF1B\u4FEE\u6539\u5FC5\u987B\u63D0\u4F9B expectedRevision\u3002chapter.update \u7528 content\u3001append \u6216 patch:{oldText,newText} \u4E09\u9009\u4E00\u3002\u5220\u9664\u9700 confirm:true\uFF1B\u975E\u7A7A\u5377\u8FD8\u9700 chapterPolicy:detach/delete\u3002chapter.get \u652F\u6301 start/maxChars\u3002",
  cuigengji_memory: "\u901A\u8FC7\u672C\u5730 stdio MCP \u68C0\u7D22\u4E0E\u7EF4\u62A4\u672C\u4F1A\u8BDD\u5C0F\u8BF4\u56FE\u8C31\u3002\u5148\u7528 graph.groups \u67E5\u770B\u4EBA\u7269/\u4E16\u754C\u8D44\u6599\u5206\u7EC4\uFF0C\u518D\u7528 graph.list \u7684 query/type/groupId \u641C\u7D22\u540D\u79F0\u3001\u522B\u540D\u548C\u6458\u8981\uFF1BgroupId:null \u7B5B\u9009\u672A\u5206\u7EC4\u3002\u5217\u8868\u4E0D\u8FD4\u56DE\u6B63\u6587\uFF0C\u547D\u4E2D\u540E\u7528 graph.get \u8BFB\u53D6\u8BE6\u60C5\uFF0Cedge.list \u7528 nodeId \u67E5\u5173\u7CFB\u3002edge.create \u7684 from/to \u662F\u7AEF\u70B9\uFF0Cname/content \u53EF\u7701\u7565\uFF0C\u7A7A\u5173\u7CFB\u53EA\u663E\u793A\u8FDE\u7EBF\uFF0C\u4E0D\u7F16\u9020\u8BF4\u660E\u3002\u8865\u5145\u5DF2\u6709\u8D44\u6599\u4F18\u5148 graph.update\uFF1B\u5206\u7EC4\u652F\u6301 graph.group.create/update/delete \u548C graph.move \u6279\u91CF\u79FB\u52A8\uFF0C\u5220\u9664\u5206\u7EC4\u4FDD\u7559\u6761\u76EE\u3002\u68C0\u67E5 status/factType/sources/knownBy\uFF0C\u672A\u786E\u8BA4\u6216\u8FC7\u671F\u5185\u5BB9\u4E0D\u5F53\u4F5C\u65E2\u5B9A\u4E8B\u5B9E\u3002\u8D44\u6599\u5206 character_card \u4E0E world_entry\uFF1Bgraph.get/update/delete \u5FC5\u987B\u7528 nodeId\uFF0Cedge.get/update/delete \u5FC5\u987B\u7528 edgeId\u3002\u4FEE\u6539\u9700 expectedRevision\uFF0C\u5220\u9664 confirm:true\u3002",
  cuigengji_plan: "\u4E0E\u4F5C\u8005\u5171\u540C\u63A8\u6F14\u60C5\u8282\u7684\u591A\u9875\u5171\u4EAB\u753B\u5E03\u3002\u8282\u70B9\u4EE3\u8868\u4E8B\u4EF6\u3001\u51B2\u7A81\u3001\u9009\u62E9\u6216\u76EE\u6807\uFF0C\u4E0D\u7B49\u540C\u4E8E\u7AE0\u8282\uFF1B\u540C\u4E00\u60C5\u8282\u66F4\u65B0\u539F\u8282\u70B9\u3002\u5148 planning.pages \u6309\u7528\u9014\u9009\u9875\uFF0C\u518D planning.list/search \u5B9A\u4F4D\u3001planning.get \u8BFB\u53D6\u5168\u6587\u4E0E flow.previous/next\u3002\u590D\u6742\u5C40\u90E8\u63A8\u6F14\u4E5F\u53EF\u65B0\u5EFA\u9875\uFF1B\u4E3B\u7EBF\u7528\u6587\u5B57\u6307\u5411\u8BE6\u7EC6\u9875\uFF0C\u8DE8\u9875\u4E0D\u80FD\u8FDE\u7EBF\u3002\u5355\u4E2A\u8D77\u70B9\u7EED\u63A5\u53EF\u7528 planning.continue {nodeId,expectedRevision,value}\uFF1B\u5E76\u884C\u884C\u52A8\u3001\u5206\u652F\u548C\u591A\u56E0\u6C47\u5408\u7528 planning.apply \u4E00\u6B21\u5B89\u6392\u8282\u70B9\u53CA\u666E\u901A\u7BAD\u5934\uFF0C\u53EF\u6709\u6682\u672A\u76F8\u8FDE\u7684\u6784\u60F3\u3002\u65B0\u589E\u8282\u70B9\u7528 title/summary/content\uFF0Cposition \u7684 x/y \u4E3A\u6570\u503C\uFF1B\u4FDD\u7559\u4F5C\u8005\u5DF2\u6709\u5E03\u5C40\u3002\u9002\u65F6\u7528 frame \u533A\u5206\u9636\u6BB5/\u9635\u8425\uFF0C\u7528 note \u8BB0\u5F55\u672A\u51B3\u95EE\u9898\u548C\u7075\u611F\uFF0Cplanning.decorations \u8BFB\u53D6\u3002apply \u7684 operations \u7528 {op,id,expectedRevision,value}\uFF0Cid/\u7248\u672C\u4E0E op \u540C\u5C42\uFF1B\u521B\u5EFA\u7528 {op,ref,value}\uFF0Cedge.create \u7684 value \u4E3A {from,to}\uFF0Cref \u76F4\u63A5\u5F15\u7528\u3002\u5220\u9664 confirm:true\uFF0C\u7248\u672C\u51B2\u7A81\u5148\u91CD\u8BFB\u5408\u5E76\u3002idea/selected \u53EF\u4EE5\u957F\u671F\u4E0D\u5173\u8054\u7AE0\u8282\uFF0Cwritten \u53EA\u8868\u793A\u5B8C\u6574\u5B9E\u73B0\u5E76\u6709\u6B63\u6587\u7248\u672C\u8BC1\u636E\uFF0CchapterRefs \u652F\u6301\u591A\u5BF9\u591A\u3002\u5206\u7EC4\u7528 planning.groups/group.create/update/delete\uFF0C\u8BB0\u5F55\u4E0E\u64A4\u9500\u7528 planning.history/revert\u3002\u89C4\u5212\u4E0E\u6279\u6CE8\u4E0D\u5F53\u4F5C\u6B63\u6587\u4E8B\u5B9E\u3002",
  cuigengji_context: "\u8BFB\u53D6\u4F1A\u8BDD\u4EFB\u52A1\u4FE1\u606F\u3001\u6309\u9700\u53C2\u8003\u9884\u89C8\u548C\u5DF2\u542F\u7528\u9884\u8BBE\u7684\u6709\u6548\u6587\u672C\u3002Agent \u63A5\u624B\u4F5C\u54C1\u4F18\u5148\u8C03\u7528 cuigengji_project \u7684 novel.handoff\uFF1B\u5DF2\u542F\u7528\u5199\u4F5C\u9884\u8BBE\u968F\u7CFB\u7EDF\u63D0\u793A\u8BCD\u63D0\u4F9B\uFF0C\u6B63\u6587\u3001\u89C4\u5212\u548C\u8BBE\u5B9A\u6309\u4EFB\u52A1\u8BFB\u53D6\u3002preset.read \u53EA\u8FD4\u56DE\u4F5C\u8005\u542F\u7528\u4E14\u53EF\u7528\u7684\u9884\u8BBE\u6587\u672C\uFF0C\u4E0D\u8FD4\u56DE\u539F\u59CB\u5BFC\u5165\u6587\u4EF6\u3002"
};
function defaultDataRoot() {
  if (process.platform === "win32") return join(process.env.LOCALAPPDATA || homedir(), "cuigengji");
  return join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "cuigengji");
}
async function apply(ctx, config = {}) {
  const root = config.dataRoot || process.env.CUIGENGJI_DATA_ROOT || defaultDataRoot();
  const store = new Store(root);
  const maintenance = new UpgradeCoordinator(store);
  await maintenance.start();
  const auditRoot = join(root, "audit");
  const audit = async (sessionId, value) => {
    const file = createHash("sha256").update(sessionId || "human").digest("hex") + ".jsonl";
    const release = await store.acquire();
    try {
      await store.transaction.recover();
      await mkdir(auditRoot, { recursive: true, mode: 448 });
      await appendFile(join(auditRoot, file), JSON.stringify({ time: (/* @__PURE__ */ new Date()).toISOString(), ...value }) + "\n", { mode: 384 });
    } finally {
      await release();
    }
  };
  const sessionPolicy = createSessionPolicy({ store, audit, ready: () => maintenance.ensureReady() });
  const { dispatch } = sessionPolicy;
  const memory = new MemoryBridge(store, { dispatch });
  await memory.start();
  ctx.effect(() => () => memory.close());
  ctx.provide("cuigengji", { store, dispatch, memory, maintenance });
  registerSkills(ctx);
  registerPrompt(ctx, { store, audit, resolveBinding: sessionPolicy.resolveBinding });
  for (const [toolName, actions] of Object.entries(allowed)) {
    ctx.tools.register(defineTool({
      name: toolName,
      description: descriptions[toolName],
      parameters: { action: { type: "string", enum: actions, required: true }, args: toolName === "cuigengji_plan" ? planningArgsSchema : { type: "object", additionalProperties: true, description: "\u64CD\u4F5C\u53C2\u6570\uFF1A\u5B9E\u4F53ID\u3001\u6587\u672C\u3001\u7248\u672C\u7B49\u3002\u7701\u7565\u5C0F\u8BF4ID\uFF0C\u4F7F\u7528\u672C\u4F1A\u8BDD\u7ED1\u5B9A\u3002" } },
      output: { schema: { type: "string" }, render: (_args, value) => [{ type: "text", text: value }] },
      execute: async ({ action, args }, exec) => {
        if (!exec.agent?.id) throw new Error("\u5C0F\u8BF4\u5DE5\u5177\u9700\u8981 DSH \u4F1A\u8BDD");
        exec.signal?.throwIfAborted();
        const actor = { kind: "agent", sessionId: String(exec.agent.id) };
        const input = { ...args || {} };
        delete input.sessionId;
        delete input.actor;
        if (!isReadAction(action)) input.requestId ??= String(exec.callId);
        return JSON.stringify(toolName === "cuigengji_memory" ? await memory.call(actor.sessionId, action, input, { signal: exec.signal }) : await dispatch(action, input, actor));
      }
    }));
  }
  ctx.tools.register(defineTool({
    name: "cuigengji_maintenance",
    description: "\u67E5\u8BE2\u50AC\u66F4\u59EC\u63D2\u4EF6\u5347\u7EA7\u3001\u6570\u636E\u8FC1\u79FB\u548C\u5B8C\u6574\u6027\u6821\u9A8C\u7ED3\u679C\u3002\u8FD9\u4E2A\u5DE5\u5177\u4E0D\u8981\u6C42\u7ED1\u5B9A\u5C0F\u8BF4\uFF1B\u66F4\u65B0\u540E\u5148\u8C03\u7528 status\uFF0C\u518D\u7528 verify \u6838\u5BF9\u5B9E\u9645\u52A0\u8F7D\u7248\u672C\u3001\u6570\u636E\u76EE\u5F55\u548C\u8BB0\u5F55\u6570\u91CF\u3002\u8FC1\u79FB\u7531\u63D2\u4EF6\u542F\u52A8\u9636\u6BB5\u81EA\u52A8\u5B8C\u6210\uFF0CAgent \u4E0D\u5E94\u76F4\u63A5\u6539\u5C0F\u8BF4\u6587\u4EF6\u3002",
    parameters: {
      action: { type: "string", enum: ["status", "verify"], required: true },
      args: { type: "object", additionalProperties: true, description: "verify \u53EF\u9009 expectedVersion\u3001expectedDataRoot\u3001expectedNovelIds\uFF08\u539F\u4F5C\u54C1ID\u6570\u7EC4\uFF09\u3002" }
    },
    output: { schema: { type: "string" }, render: (_args, value) => [{ type: "text", text: value }] },
    execute: async ({ action, args }, exec) => {
      exec.signal?.throwIfAborted();
      if (!["status", "verify"].includes(action)) throw new Error("\u65E0\u6548\u7684\u7EF4\u62A4\u64CD\u4F5C");
      const result = action === "status" ? await maintenance.status() : await maintenance.verify(args || {});
      return JSON.stringify(result);
    }
  }));
  sessionPolicy.register(ctx, memory);
  const workData = new WorkData(store);
  registerRpcRoute(ctx, { dispatch, dataRoot: store.root, workData, transfer: new TransferService(store, workData), maintenance });
}
export {
  Config,
  apply,
  inject,
  name
};
