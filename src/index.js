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
import { UpgradeCoordinator } from './application/maintenance/upgrade.ts';
import {createTransfer} from './adapters/dsh/transfer-service.js';
import {createDshCloudClient} from './adapters/dsh/cloud-client.js';
import {createDshRuntime} from './adapters/dsh/runtime.js';
import {readFileSync,existsSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

export const name = 'moji';
export const inject = ['tools', 'systemPrompt', 'skills', 'connection', 'credentials'];
export const Config = z.object({
  dataRoot: z.string().default(''),
  mode: z.string().default('local'),
  cloudUrl: z.string().default(''),
});
const descriptions = {
  moji_project: '接手本会话绑定的小说并读取或修改卷、章、正文。novel.handoff 只返回作品索引、当前章节/任务、章节目录摘要和资料入口，不返回正文；需要正文时用 chapter.get。读操作返回 revision；修改必须提供 expectedRevision。chapter.update 用 content、append 或 patch:{oldText,newText} 三选一。删除需 confirm:true；非空卷还需 chapterPolicy:detach/delete。chapter.get 支持 start/maxChars。',
  moji_memory: '通过本地 stdio MCP 检索与维护本会话小说图谱。先用 graph.groups 查看人物/世界资料分组，再用 graph.list 的 query/type/groupId 搜索名称、别名和摘要；groupId:null 筛选未分组。列表不返回正文，命中后用 graph.get 读取详情，edge.list 用 nodeId 查关系。edge.create 的 from/to 是端点，name/content 可省略，空关系只显示连线，不编造说明。补充已有资料优先 graph.update；分组支持 graph.group.create/update/delete 和 graph.move 批量移动，删除分组保留条目。检查 status/factType/sources/knownBy，未确认或过期内容不当作既定事实。资料分 character_card 与 world_entry；graph.get/update/delete 必须用 nodeId，edge.get/update/delete 必须用 edgeId。修改需 expectedRevision，删除 confirm:true。',
  moji_plan: '统一剧情工作区。story.get 读取 cards、包含树、页面实例、时间安排和工作区 revision。story.apply 需要 expectedRevision 与 operation:{type,...}。card.create/value 创建剧情卡；card.update/id/expectedRevision/value 更新卡；move/refs/parent/before/after 调整包含与同级顺序。卷章只来自正文目录，不在规划创建。time.narration 与 time.story 独立；points 为固定发生点，拖卡不平移。证据须真实保存版本；AI 可安排计划，不得确认人物关系事实。冲突重读，保留作者草稿。',
  moji_context: '读取会话任务信息、按需参考预览和已启用预设的有效文本。Agent 接手作品优先调用 moji_project 的 novel.handoff；已启用写作预设随系统提示词提供，正文、规划和设定按任务读取。preset.read 只返回作者启用且可用的预设文本，不返回原始导入文件。',
};
// Existing installations keep their data in place; fresh installations use Moji.
export function defaultDataRoot(base = process.platform === 'win32'
  ? process.env.LOCALAPPDATA || homedir()
  : process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share')) {
  const legacy = join(base, 'cuigengji');
  return existsSync(legacy) ? legacy : join(base, 'moji');
}

export async function apply(ctx, config = {}) {
  const root = config.dataRoot || process.env.MOJI_DATA_ROOT || process.env.CUIGENGJI_DATA_ROOT || defaultDataRoot();
  let sessionPolicy;
  const cloudClient=createDshCloudClient({credentials:ctx.credentials});
  const runtime=await createDshRuntime({credentials:ctx.credentials,cloudClient,
    config:{...config,dataRoot:root},version:manifest.version,supportedDsh:manifest.engines.dsh,
    isBusy:()=>sessionPolicy?.isBusy()||false,
    isSessionBusy:id=>sessionPolicy?.isSessionBusy(id)||false,
    createLocal:async()=>{
      const store=new Store(root),maintenance=new UpgradeCoordinator(store);
      await maintenance.start();
      const workData=new WorkData(store),transfer=createTransfer(store,{workData});
      const memory=new MemoryBridge(store,{dispatch:(...args)=>sessionPolicy.dispatch(...args)});
      await memory.start();
      return {store,maintenance,workData,transfer,memory,dispatch:(...args)=>sessionPolicy.dispatch(...args)};
    },
  });
  const store={dispatch:(...args)=>runtime.rawDispatch(...args)};
  const audit = async (sessionId, value) => {
    if(runtime.mode()==='cloud')return; // The shared cloud service writes its own history.
    const {store:localStore}=await runtime.local();
    const auditRoot=join(root,'audit');
    const file = createHash('sha256').update(sessionId || 'human').digest('hex') + '.jsonl';
    const release = await localStore.acquire();
    try {await localStore.transaction.recover(); await mkdir(auditRoot, {recursive:true,mode:0o700}); await appendFile(join(auditRoot,file), JSON.stringify({time:new Date().toISOString(),...value})+'\n', {mode:0o600});}
    finally {await release();}
  };
  sessionPolicy = createSessionPolicy({ store, audit, ready: () => runtime.ready() });
  const { dispatch } = sessionPolicy;
  const memory={
    call:async(sessionId,action,args,options)=>runtime.mode()==='cloud'
      ?dispatch(action,args,{kind:'agent',sessionId,signal:options?.signal})
      :(await runtime.local()).memory.call(sessionId,action,args,options),
    disconnect:async sessionId=>{if(runtime.mode()==='local')await (await runtime.local()).memory.disconnect(sessionId);},
  };
  const maintenance={pluginVersion:manifest.version,ensureReady:()=>runtime.ready(),status:()=>runtime.maintenance('status'),verify:args=>runtime.maintenance('verify',args)};
  ctx.effect(() => () => runtime.close());
  const service={store,dispatch,memory,maintenance,runtime};
  ctx.provide('moji',service);
  ctx.provide('cuigengji',service); // Legacy internal consumers; not a public tool name.
  registerSkills(ctx);
  registerPrompt(ctx, { store, audit, resolveBinding: sessionPolicy.resolveBinding });

  for (const [toolName, actions] of Object.entries(allowed)) {
    ctx.tools.register(defineTool({
      name:toolName, description:descriptions[toolName],
      parameters:{action:{type:'string',enum:actions,required:true},args:toolName==='moji_plan'?planningArgsSchema:{type:'object',additionalProperties:true,description:'操作参数：实体ID、文本、版本等。省略小说ID，使用本会话绑定。'}},
      output:{schema:{type:'string'},render:(_args,value)=>[{type:'text',text:value}]},
      execute:async ({action,args},exec)=>{
        if (!exec.agent?.id) throw new Error('小说工具需要 DSH 会话');
        exec.signal?.throwIfAborted();
        const actor={kind:'agent',sessionId:String(exec.agent.session?.id || exec.agent.id),signal:exec.signal};
        const input={...(args || {})};
        delete input.sessionId; delete input.actor;
        if (!isReadAction(action)) input.requestId ??= String(exec.callId);
        return JSON.stringify(toolName==='moji_memory'
          ? await memory.call(actor.sessionId,action,input,{signal:exec.signal})
          : await dispatch(action,input,actor));
      },
    }));
  }
  ctx.tools.register(defineTool({
    name: 'moji_maintenance',
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
  registerRpcRoute(ctx, { dispatch, dataRoot: root, maintenance, runtime });
}
