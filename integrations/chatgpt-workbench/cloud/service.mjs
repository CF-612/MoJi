import {createHash,randomUUID} from 'node:crypto';
import {Store,HUMAN_ACTIONS,TOOL_ACTIONS,isReadAction} from './generated/engine.mjs';
import {encodeState,decodeState} from './state-codec.mjs';
export const QUERY_ACTIONS=[...new Set(Object.values(TOOL_ACTIONS).flat().filter(isReadAction)), 'novel.list','preset.get'];
export const EDIT_ACTIONS=[...new Set(Object.values(TOOL_ACTIONS).flat().filter(a=>!isReadAction(a))), 'preset.set'];
const engine=new Store();
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const empty=()=>({schemaVersion:1,novels:{},bindings:{},requests:{}});
export function createCloudService(db,owner){
  const database=db.withSession?db.withSession('first-primary'):db;
  const read=async()=>{
    let row=await database.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first();
    if(!row){
      const state=empty();
      const novel=engine.execute(state,'novel.create',{title:'催更姬 · 云端协作演示'},{kind:'human'});
      engine.execute(state,'chapter.create',{novelId:novel.id,title:'第一章 雨夜来信',content:'　　雨停了。\n\n“请进。”——她说。'},{kind:'human'});
      await database.prepare('INSERT OR IGNORE INTO workspaces(owner,state,event,updated_at) VALUES(?,?,?,?)').bind(owner,JSON.stringify(state),'{}',new Date().toISOString()).run();
      row=await database.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first();
    }
    return {...row,state:decodeState(row.state)};
  };
  const commit=async(row,state,event)=>{
    const {stored:json}=encodeState(state);
    // D1 changes includes trigger writes; RETURNING identifies the matched row.
    const result=await database.prepare('UPDATE workspaces SET state=?,revision=revision+1,event=?,updated_at=? WHERE owner=? AND revision=? RETURNING revision')
      .bind(json,JSON.stringify(event),new Date().toISOString(),owner,row.revision).first();
    if(!result)fail('CONFLICT','云端资料刚被另一端修改，请重新读取；草稿未覆盖。');
  };
  const rpc=async(action,args={},sessionId='cloud',kind='human')=>{
    if(!args||typeof args!=='object'||Array.isArray(args)||typeof sessionId!=='string'||!sessionId||sessionId.length>512)fail('INVALID_INPUT','工作台参数无效');
    if(!(kind==='human'?HUMAN_ACTIONS:[...QUERY_ACTIONS,...EDIT_ACTIONS]).includes(action))fail('NOT_ALLOWED','不允许此操作');
    if(kind==='agent'&&action!=='novel.list'&&!args.novelId)fail('NOVEL_REQUIRED','请明确提供作品 ID');
    if(action==='settings.get')return {dataRoot:'私有云端 D1（演示）',pluginVersion:'0.3.0-preview',host:'ChatGPT MCP Apps'};
    const row=await read(),state=structuredClone(row.state),actor={kind,sessionId:`cloud:${sessionId}`};
    if(action==='workspace.status')return {dataRoot:'D1',novels:Object.keys(state.novels).length,books:Object.values(state.novels),included:['演示作品与完整版本'],excluded:['本地小说','浏览器未保存草稿']};
    if(action==='workspace.export'){
      const records=await database.prepare('SELECT revision,state,event,updated_at FROM workspace_history WHERE owner=? ORDER BY revision').bind(owner).all();
      const payload={state,history:records.results};
      return {format:'cuigengji-cloud',version:1,exportedAt:new Date().toISOString(),sha256:hash(JSON.stringify(payload)),payload};
    }
    if(action.startsWith('workspace.')||action.startsWith('transfer.')||action.startsWith('maintenance.')||action==='legacy.preview')fail('NOT_AVAILABLE','此云端演示先验收正文、设定、规划及写作要求；完整云端备份可用 workspace.export。导入导出界面尚未迁移。');
    const signature=hash(JSON.stringify({action,args,actor})),requestKey=args.requestId?hash(args.requestId):null;
    if(requestKey&&Object.hasOwn(state.requests,requestKey)){
      if(state.requests[requestKey].signature!==signature)fail('REQUEST_ID_REUSED','请求标识已用于其他操作');
      return structuredClone(state.requests[requestKey].result);
    }
    const result=engine.execute(state,action,args,action==='preset.set'?{...actor,kind:'human'}:actor);
    if(requestKey)state.requests[requestKey]={signature,result:structuredClone(result),timestamp:new Date().toISOString()};
    if(JSON.stringify(state)!==JSON.stringify(row.state))await commit(row,state,{id:randomUUID(),action,actor,novelId:args.novelId??null,entityId:args.chapterId??args.nodeId??args.edgeId??null,reason:args.reason||(kind==='human'?'作者在工作台修改':'AI 按作者要求修改'),timestamp:new Date().toISOString()});
    return structuredClone(result);
  };
  return {rpc,async bootstrap(sessionId){
    const books=await rpc('novel.list',{},sessionId);let binding=await rpc('binding.get',{},sessionId);
    if(!binding&&books[0])binding=await rpc('binding.set',{novelId:books[0].id},sessionId);
    return {books,binding,sessionId};
  },async collaborationHistory({novelId,entityId,limit=20}){
    if(!novelId)fail('NOVEL_REQUIRED','请提供作品 ID');
    const records=await database.prepare("SELECT revision,state,event FROM workspace_history WHERE owner=? AND json_extract(event,'$.novelId')=? ORDER BY revision DESC LIMIT ?")
      .bind(owner,novelId,Math.max(1,Math.min(limit,100))).all();
    return records.results.map(r=>{
      const event=JSON.parse(r.event),state=decodeState(r.state),novel=state.novels[novelId];
      const before=novel?.chapters[event.entityId]??novel?.nodes[event.entityId]??novel?.edges[event.entityId]??(event.action==='preset.set'?novel?.preset:null);
      return {...event,workspaceRevision:r.revision,state:'committed',before};
    }).filter(e=>!entityId||e.entityId===entityId);
  }};
}
