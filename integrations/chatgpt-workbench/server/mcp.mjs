import {readFile} from 'node:fs/promises';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';
import {QUERY_ACTIONS,EDIT_ACTIONS} from './workbench-service.mjs';

const uri = 'ui://cuigengji/workbench-v020';
export function createMcp(service) {
  const server = new McpServer({name: 'cuigengji-sidebar', version: '0.2.0'});
  server.registerResource('cuigengji-workbench', uri, {mimeType: 'text/html;profile=mcp-app'}, async () => ({contents: [{
    uri, mimeType: 'text/html;profile=mcp-app', text: (await readFile(new URL('../dist/native-paused.html', import.meta.url), 'utf8')).replace('<html ', '<html data-mcp-app="true" '),
    _meta: {'openai/ui': {preferredDisplayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen']}}
  }]}));
  // 已保存的聊天工具结果引用旧 URI；不能在升级时撤销历史资源。
  const legacyUri = 'ui://cuigengji/demo';
  server.registerResource('cuigengji-demo-legacy', legacyUri, {mimeType: 'text/html;profile=mcp-app'}, async () => ({contents: [{
    uri: legacyUri, mimeType: 'text/html;profile=mcp-app',
    text: (await readFile(new URL('../dist/native-paused.html', import.meta.url), 'utf8')).replace('<html ', '<html data-mcp-app="true" '),
    _meta: {'openai/ui': {preferredDisplayMode: 'inline', availableDisplayModes: ['inline', 'fullscreen']}}
  }]}));
  const definitions = [
    ['workbench_open', '小说工作台', '打开小说工作台。聊天内显示短卡片，展开后在侧栏编辑；若主动隔离则显示暂停提示。可传当前聊天 contextId 保留独立作品选择。', {contextId:z.string().optional()}, true],
    ['chapter_read', '读取演示章节', '读取侧栏演示章节的最新正文和版本号；修改前调用。', {}, true],
    ['chapter_history', '读取章节历史', '读取演示章节可恢复的历史版本。', {}, true],
    ['chapter_save', '保存演示章节', '明确要求修改或保存时调用；expectedRevision 使用读取到的版本，冲突时重新读取，不强制覆盖。', {
      content: z.string(), expectedRevision: z.number().int().positive(), reason: z.string().optional(), requestId: z.string().optional()
    }, false],
    ['chapter_restore', '恢复演示章节', '恢复指定历史版本，同时形成新版本。', {
      targetRevision: z.number().int().positive(), expectedRevision: z.number().int().positive()
    }, false]
  ];
  for (const definition of definitions.filter(x=>['chapter_save','chapter_restore'].includes(x[0]))) {
    definitions.push([`${definition[0]}_from_ui`, ...definition.slice(1)]);
  }
  definitions.push(
    ['workbench_bootstrap','载入作品选择','初始化作者工作台，不向模型自动加载正文。',{sessionId:z.string()},true],
    ['workbench_ui_rpc','作者工作台操作','仅供作者界面调用，读写同一业务服务。',{action:z.string(),args:z.record(z.string(),z.unknown()).optional(),sessionId:z.string()},false],
    ['workbench_query','查询小说资料','按需读取目录、搜索、章节、人物、世界、规划及写作要求；必须使用明确的 novelId。创作前读取 preset.read；正文 get 支持 start/maxChars 分页；不默认加载全书。',{action:z.enum(QUERY_ACTIONS),args:z.record(z.string(),z.unknown()).optional()},true],
    ['workbench_edit','修改小说资料','仅在作者明确要求修改或保存时使用。args 必须含 novelId 和目标 ID；更新含 expectedRevision，正文可用 content、append 或唯一匹配 patch；planning.apply 使用带 expectedRevision 的 operations。冲突停止覆盖，保留作者草稿。',{action:z.enum(EDIT_ACTIONS),args:z.record(z.string(),z.unknown()).optional()},false],
    ['workbench_history','查询协作记录','读取指定作品和对象的协作修改来源及修改前快照。章节及规划另有原生 history/revert。',{novelId:z.string(),entityId:z.string().optional(),limit:z.number().optional()},true]
  );
  const file=z.record(z.string(),z.unknown()),options=z.record(z.string(),z.unknown()).optional();
  definitions.push(
    ['workbench_import_preview','预览导入','预览作者指定的文件／批量包。file 为 {name,text/json/gzipBase64}，传文件内容，不传路径。新作品 options 为 {mode:"copy",title:"作品名"}；已有作品明确 targetId。恢复完整备份用 mode:"restore"，替换同 ID 作品需作者明确要求并设置 replaceExisting:true。返回 proof；此工具不保存。',{file,options},true],
    ['workbench_import','导入作品','仅在作者明确授权后保存；使用预览时相同的 file/options 和 proof，保持 requestId 稳定。版本变化停止写入；保存前自动快照。',{file,options,proof:z.string().min(1),requestId:z.string().min(1),reason:z.string().optional()},false]
  );
  for (const [name, title, description, inputSchema, readOnlyHint] of definitions) {
    const fromUi = name.endsWith('_from_ui')||['workbench_bootstrap','workbench_ui_rpc'].includes(name);
    server.registerTool(name, {title, description, inputSchema,
      annotations: {readOnlyHint, destructiveHint: ['workbench_edit','workbench_ui_rpc'].includes(name), openWorldHint: false},
      ...(name === 'workbench_open' ? {_meta: {ui: {resourceUri: uri}, 'openai/ui': {entrypoints: [{type: 'thread'}]}}} : fromUi ? {_meta: {ui: {visibility:['app']}}} : {})
    }, async args => {
      try {
        const result = name==='workbench_open'?{...(await service.bootstrap(args.contextId||'desktop')),contextId:args.contextId||'desktop'}
          :name==='workbench_bootstrap'?await service.bootstrap(args.sessionId)
          :name==='workbench_ui_rpc'?await service.rpc(args.action,args.args||{},args.sessionId,'human')
          :name==='workbench_query'||name==='workbench_edit'?await service.rpc(args.action,args.args||{},'model','agent')
          :name==='workbench_history'?await service.collaborationHistory(args)
          :name==='workbench_import_preview'||name==='workbench_import'?await service.rpc(name==='workbench_import'?'transfer.import':'transfer.preview',args,'model','agent')
          :await service.call(fromUi ? name.replace(/_from_ui$/, '') : name, args, fromUi ? 'human' : 'agent');
        return {content: [{type: 'text', text: JSON.stringify(result)}], structuredContent: {result}};
      } catch (error) {
        return {isError: true, content: [{type: 'text', text: `${error.code || 'ERROR'}: ${error.message}`} ]};
      }
    });
  }
  return server;
}
