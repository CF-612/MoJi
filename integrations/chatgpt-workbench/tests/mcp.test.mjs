import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir,mkdtemp} from 'node:fs/promises';
import {Script} from 'node:vm';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

test('真实 MCP 连接包含 thread 入口、内嵌资源、读写和版本恢复',async()=>{
  const root=resolve(import.meta.dirname,'..');
  const base=resolve(root,'.data/tests');await mkdir(base,{recursive:true});
  const data=await mkdtemp(resolve(base,'mcp-'));
  const transport=new StdioClientTransport({
    command:process.execPath,args:[resolve(root,'server/index.mjs'),'--stdio'],
    env:{...process.env,CUIGENGJI_DATA_ROOT:data}
  });
  const client=new Client({name:'sidebar-acceptance',version:'0.1.0'});
  try{
    await client.connect(transport);
    const tools=await client.listTools();
    const open=tools.tools.find(x=>x.name==='workbench_open');
    assert.deepEqual(open._meta['openai/ui'].entrypoints,[{type:'thread'}]);
    assert.equal(tools.tools.find(x=>x.name==='chapter_read')._meta?.ui?.resourceUri,undefined);
    assert.equal(tools.tools.find(x=>x.name==='chapter_save')._meta?.ui?.resourceUri,undefined);
    const resource=await client.readResource({uri:open._meta.ui.resourceUri});
    assert.match(resource.contents[0].text,/小说工作台/);
    assert.equal(resource.contents[0]._meta['openai/ui'].preferredDisplayMode,'inline');
    assert.match(resource.contents[0].mimeType,/mcp-app/);
    assert.match(resource.contents[0].text,/data-mcp-app="true"/);
    new Script(resource.contents[0].text.match(/<script>([\s\S]*)<\/script>/)[1]);
    // 历史聊天保留旧资源 URI；升级后必须仍能回放旧面板。
    const legacy=await client.readResource({uri:'ui://cuigengji/demo'});
    assert.equal(legacy.contents[0].uri,'ui://cuigengji/demo');
    assert.match(legacy.contents[0].mimeType,/mcp-app/);
    assert.match(legacy.contents[0].text,/data-mcp-app="true"/);
    assert.match(legacy.contents[0].text,/小说工作台/);
    new Script(legacy.contents[0].text.match(/<script>([\s\S]*)<\/script>/)[1]);
    assert.deepEqual(tools.tools.find(x=>x.name==='chapter_save_from_ui')._meta.ui.visibility,['app']);
    assert.deepEqual(tools.tools.find(x=>x.name==='workbench_ui_rpc')._meta.ui.visibility,['app']);
    assert.equal(tools.tools.find(x=>x.name==='workbench_edit')._meta?.ui?.resourceUri,undefined);
    const bootstrap=await client.callTool({name:'workbench_bootstrap',arguments:{sessionId:'protocol-test'}});
    const novelId=bootstrap.structuredContent.result.books[0].id;
    const directory=await client.callTool({name:'workbench_query',arguments:{action:'chapter.list',args:{novelId}}});
    assert.equal(directory.structuredContent.result.length,1);
    const blocked=await client.callTool({name:'workbench_query',arguments:{action:'chapter.get',args:{chapterId:directory.structuredContent.result[0].id}}});
    assert.equal(blocked.isError,true);
    const setting=await client.callTool({name:'workbench_edit',arguments:{action:'graph.create',args:{novelId,name:'协议演示人物',type:'character_card',content:'AI 按要求创建。'}}});
    const created=setting.structuredContent.result;
    const author=await client.callTool({name:'workbench_ui_rpc',arguments:{sessionId:'protocol-test',action:'graph.update',args:{novelId,nodeId:created.id,expectedRevision:created.revision,content:'作者补充人物动机。'}}});
    assert.equal(author.structuredContent.result.content,'作者补充人物动机。');
    const conflict=await client.callTool({name:'workbench_edit',arguments:{action:'graph.update',args:{novelId,nodeId:created.id,expectedRevision:created.revision,content:'过期 AI 版本。'}}});
    assert.equal(conflict.isError,true);assert.match(conflict.content[0].text,/^CONFLICT:/);
    const audit=await client.callTool({name:'workbench_history',arguments:{novelId,entityId:created.id}});
    assert.equal(audit.structuredContent.result[0].actor.kind,'human');
    assert.equal(audit.structuredContent.result[0].before.content,'AI 按要求创建。');
    assert.equal(audit.structuredContent.result[1].actor.kind,'agent');
    const read=await client.callTool({name:'chapter_read',arguments:{}});
    const original=read.structuredContent.result;
    const content=original.chapter.content+'\n\n来自真实 MCP 工具的修改。';
    const save=await client.callTool({name:'chapter_save',arguments:{content,expectedRevision:original.chapter.revision,reason:'MCP 验收'}});
    assert.equal(save.structuredContent.result.chapter.content,content);
    const outdated=await client.callTool({name:'chapter_save',arguments:{content:'过期写入',expectedRevision:original.chapter.revision}});
    assert.equal(outdated.isError,true);assert.match(outdated.content[0].text,/CONFLICT/);
    const restore=await client.callTool({name:'chapter_restore',arguments:{targetRevision:original.chapter.revision,expectedRevision:save.structuredContent.result.chapter.revision}});
    assert.equal(restore.structuredContent.result.chapter.content,original.chapter.content);
    const uiSave=await client.callTool({name:'chapter_save_from_ui',arguments:{content:'作者从插件界面保存。',expectedRevision:restore.structuredContent.result.chapter.revision}});
    assert.equal(uiSave.isError,undefined);
    const history=await client.callTool({name:'chapter_history',arguments:{}});
    assert.deepEqual(history.structuredContent.result.map(x=>x.actor.kind),['human','agent','agent','human']);
  }finally{await client.close();}
});
