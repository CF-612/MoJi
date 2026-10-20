import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir, appendFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import z from '@deepseek-ai/schemastery';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { Store } from './application/store.js';
import { MemoryBridge } from './adapters/mcp/client.js';
import { registerSkills } from './adapters/dsh/skills.js';
import { planningArgsSchema } from './adapters/dsh/planning-schema.js';
import { registerPrompt } from './adapters/dsh/prompt.js';
import { createSessionPolicy } from './application/bindings/session.js';
import { TOOL_ACTIONS as allowed, isReadAction } from './contracts/actions.js';
import { registerRpcRoute } from './adapters/dsh/rpc.js';
import { WorkData } from './application/backup/workspace.js';
import { TransferService } from './application/transfer/service.ts';
import { UpgradeCoordinator } from './application/maintenance/upgrade.ts';

export const name = 'cuigengji';
export const inject = ['tools', 'systemPrompt', 'skills', 'connection'];
export const Config = z.object({
  dataRoot: z.string().default(''),
});
const descriptions = {
  cuigengji_project: '接手本会话绑定的小说并读取或修改卷、章、正文。novel.handoff 只返回作品索引、当前章节/任务、章节目录摘要和资料入口，不返回正文；需要正文时用 chapter.get。读操作返回 revision；修改必须提供 expectedRevision。chapter.update 用 content、append 或 patch:{oldText,newText} 三选一。删除需 confirm:true；非空卷还需 chapterPolicy:detach/delete。chapter.get 支持 start/maxChars。',
  cuigengji_memory: '通过本地 stdio MCP 检索与维护本会话小说图谱。先用 graph.groups 查看人物/世界资料分组，再用 graph.list 的 query/type/groupId 搜索名称、别名和摘要；groupId:null 筛选未分组。列表不返回正文，命中后用 graph.get 读取详情，edge.list 用 nodeId 查关系。edge.create 的 from/to 是端点，name/content 可省略，空关系只显示连线，不编造说明。补充已有资料优先 graph.update；分组支持 graph.group.create/update/delete 和 graph.move 批量移动，删除分组保留条目。检查 status/factType/sources/knownBy，未确认或过期内容不当作既定事实。资料分 character_card 与 world_entry；graph.get/update/delete 必须用 nodeId，edge.get/update/delete 必须用 edgeId。修改需 expectedRevision，删除 confirm:true。',
  cuigengji_plan: '与作者共同推演情节的多页共享画布。节点代表事件、冲突、选择或目标，不等同于章节；同一情节更新原节点。先 planning.pages 按用途选页，再 planning.list/search 定位、planning.get 读取全文与 flow.previous/next。复杂局部推演也可新建页；主线用文字指向详细页，跨页不能连线。单个起点续接可用 planning.continue {nodeId,expectedRevision,value}；并行行动、分支和多因汇合用 planning.apply 一次安排节点及普通箭头，可有暂未相连的构想。新增节点用 title/summary/content，position 的 x/y 为数值；保留作者已有布局。适时用 frame 区分阶段/阵营，用 note 记录未决问题和灵感，planning.decorations 读取。apply 的 operations 用 {op,id,expectedRevision,value}，id/版本与 op 同层；创建用 {op,ref,value}，edge.create 的 value 为 {from,to}，ref 直接引用。删除 confirm:true，版本冲突先重读合并。idea/selected 可以长期不关联章节，written 只表示完整实现并有正文版本证据，chapterRefs 支持多对多。分组用 planning.groups/group.create/update/delete，记录与撤销用 planning.history/revert。规划与批注不当作正文事实。',
  cuigengji_context: '读取会话任务信息、按需参考预览和已启用预设的有效文本。Agent 接手作品优先调用 cuigengji_project 的 novel.handoff；已启用写作预设随系统提示词提供，正文、规划和设定按任务读取。preset.read 只返回作者启用且可用的预设文本，不返回原始导入文件。',
};
function defaultDataRoot() {
  if (process.platform === 'win32') return join(process.env.LOCALAPPDATA || homedir(), 'cuigengji');
  return join(process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'cuigengji');
}

export async function apply(ctx, config = {}) {
  const root = config.dataRoot || process.env.CUIGENGJI_DATA_ROOT || defaultDataRoot();
  const store = new Store(root);
  // Complete physical migration before exposing normal project operations.
  // A failed run is kept queryable through the maintenance tool and causes
  // ordinary project actions to remain gated until the next restart.
  const maintenance = new UpgradeCoordinator(store);
  await maintenance.start();
  const auditRoot = join(root, 'audit');
  const audit = async (sessionId, value) => {
    const file = createHash('sha256').update(sessionId || 'human').digest('hex') + '.jsonl';
    const release = await store.acquire();
    try {await store.transaction.recover(); await mkdir(auditRoot, {recursive:true,mode:0o700}); await appendFile(join(auditRoot,file), JSON.stringify({time:new Date().toISOString(),...value})+'\n', {mode:0o600});}
    finally {await release();}
  };
  const sessionPolicy = createSessionPolicy({ store, audit, ready: () => maintenance.ensureReady() });
  const { dispatch } = sessionPolicy;
  const memory = new MemoryBridge(store,{dispatch});
  await memory.start();
  ctx.effect(() => () => memory.close());
  ctx.provide('cuigengji',{store,dispatch,memory,maintenance});
  registerSkills(ctx);
  registerPrompt(ctx, { store, audit, resolveBinding: sessionPolicy.resolveBinding });

  for (const [toolName, actions] of Object.entries(allowed)) {
    ctx.tools.register(defineTool({
      name:toolName, description:descriptions[toolName],
      parameters:{action:{type:'string',enum:actions,required:true},args:toolName==='cuigengji_plan'?planningArgsSchema:{type:'object',additionalProperties:true,description:'操作参数：实体ID、文本、版本等。省略小说ID，使用本会话绑定。'}},
      output:{schema:{type:'string'},render:(_args,value)=>[{type:'text',text:value}]},
      execute:async ({action,args},exec)=>{
        if (!exec.agent?.id) throw new Error('小说工具需要 DSH 会话');
        exec.signal?.throwIfAborted();
        const actor={kind:'agent',sessionId:String(exec.agent.id)};
        const input={...(args || {})};
        delete input.sessionId; delete input.actor;
        if (!isReadAction(action)) input.requestId ??= String(exec.callId);
        return JSON.stringify(toolName==='cuigengji_memory'
          ? await memory.call(actor.sessionId,action,input,{signal:exec.signal})
          : await dispatch(action,input,actor));
      },
    }));
  }
  ctx.tools.register(defineTool({
    name: 'cuigengji_maintenance',
    description: '查询墨叽插件升级、数据迁移和完整性校验结果。这个工具不要求绑定小说；更新后先调用 status，再用 verify 核对实际加载版本、数据目录和记录数量。迁移由插件启动阶段自动完成，Agent 不应直接改小说文件。',
    parameters: {
      action: { type: 'string', enum: ['status', 'verify'], required: true },
      args: { type: 'object', additionalProperties: true, description: 'verify 可选 expectedVersion、expectedDataRoot、expectedNovelIds（原作品ID数组）。' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    execute: async ({ action, args }, exec) => {
      exec.signal?.throwIfAborted();
      if (!['status','verify'].includes(action)) throw new Error('无效的维护操作');
      const result = action === 'status' ? await maintenance.status() : await maintenance.verify(args || {});
      return JSON.stringify(result);
    },
  }));
  sessionPolicy.register(ctx, memory);
  const workData = new WorkData(store);
  registerRpcRoute(ctx, { dispatch, dataRoot: store.root, workData, transfer: new TransferService(store, workData), maintenance });
}
