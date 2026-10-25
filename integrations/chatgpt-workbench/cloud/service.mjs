import {createHash,randomUUID} from 'node:crypto';
import {Store,HUMAN_ACTIONS,TOOL_ACTIONS,isReadAction} from './generated/engine.mjs';
import {createTransfer,WorkData} from './generated/transfer.mjs';
import {gzipSync} from 'node:zlib';
import {encodeWorkspace,decodeWorkspace,fragmentIds} from './workspace-storage.mjs';
export const QUERY_ACTIONS=[...new Set(Object.values(TOOL_ACTIONS).flat().filter(isReadAction)), 'novel.list','preset.get','settings.get','transfer.catalog','transfer.inspect','transfer.preview'];
export const EDIT_ACTIONS=[...new Set(Object.values(TOOL_ACTIONS).flat().filter(a=>!isReadAction(a))), 'preset.set','novel.create','transfer.import'];
const engine=new Store();
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const empty=()=>({schemaVersion:1,novels:{},bindings:{},requests:{}});
const download=value=>Buffer.byteLength(value.content)>96*1024?{filename:value.filename,mime:value.mime,gzipBase64:gzipSync(value.content).toString('base64')}:value;
export function createCloudService(db,owner){
  const database=db.withSession?db.withSession('first-primary'):db;
  const read=async()=>{
    let row=await database.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first();
    if(!row){
      const state=empty();
      const novel=engine.execute(state,'novel.create',{title:'墨叽 · 云端协作演示'},{kind:'human'});
      engine.execute(state,'chapter.create',{novelId:novel.id,title:'第一章 雨夜来信',content:'　　雨停了。\n\n“请进。”——她说。'},{kind:'human'});
      await database.prepare('INSERT OR IGNORE INTO workspaces(owner,state,event,updated_at) VALUES(?,?,?,?)').bind(owner,JSON.stringify(state),'{}',new Date().toISOString()).run();
      row=await database.prepare('SELECT * FROM workspaces WHERE owner=?').bind(owner).first();
    }
    return {...row,storedState:row.state,state:await decodeWorkspace(row.state,database,owner)};
  };
  const commit=async(row,state,event)=>{
    const {stored:json,blobs}=encodeWorkspace(state),previous=fragmentIds(row.storedState),statements=[];
    const fresh=[...blobs].filter(([digest])=>!previous.has(digest));
    // Keep imports within Free's 50-query invocation limit and D1's 100 binds.
    for(let offset=0;offset<fresh.length;offset+=30){const group=fresh.slice(offset,offset+30);statements.push(database.prepare('INSERT OR IGNORE INTO workspace_blobs(owner,digest,state) VALUES '+group.map(()=>'(?,?,?)').join(',')).bind(...group.flatMap(([digest,value])=>[owner,digest,value])));}
    // D1 changes includes trigger writes; RETURNING identifies the matched row.
    const update=database.prepare('UPDATE workspaces SET state=?,revision=revision+1,event=?,updated_at=? WHERE owner=? AND revision=? RETURNING revision')
      .bind(json,JSON.stringify(event),new Date().toISOString(),owner,row.revision);
    let result;
    if(statements.length){const committed=await database.batch([...statements,update]);result=committed.at(-1).results[0];}
    else result=await update.first();
    if(!result)fail('CONFLICT','云端资料刚被另一端修改，请重新读取；草稿未覆盖。');
  };
  const rpc=async(action,args={},sessionId='cloud',kind='human')=>{
    if(!args||typeof args!=='object'||Array.isArray(args)||typeof sessionId!=='string'||!sessionId||sessionId.length>512)fail('INVALID_INPUT','工作台参数无效');
    if(!(kind==='human'?[...HUMAN_ACTIONS,'transfer.snapshots','transfer.snapshot.get']:[...QUERY_ACTIONS,...EDIT_ACTIONS]).includes(action))fail('NOT_ALLOWED','不允许此操作');
    if(kind==='agent'&&!['novel.list','novel.create','settings.get'].includes(action)&&!action.startsWith('transfer.')&&!args.novelId)fail('NOVEL_REQUIRED','请明确提供作品 ID');
    if(action==='settings.get')return {dataRoot:'私有云端 D1',pluginVersion:'0.11.5',host:'ChatGPT MCP Apps'};
    const row=await read(),state=structuredClone(row.state),actor={kind,sessionId:`cloud:${sessionId}`};
    if(action==='workspace.status')return {dataRoot:'D1',novels:Object.keys(state.novels).length,books:Object.values(state.novels),included:['演示作品与完整版本'],excluded:['本地小说','浏览器未保存草稿']};
    if(action==='workspace.export'){
      const records=await database.prepare('SELECT revision,state,event,updated_at FROM workspace_history WHERE owner=? ORDER BY revision').bind(owner).all();
      const fragments=await database.prepare('SELECT digest,state FROM workspace_blobs WHERE owner=?').bind(owner).all();
      const payload={state,history:records.results,fragments:fragments.results};
      return {format:'cuigengji-cloud',version:1,exportedAt:new Date().toISOString(),sha256:hash(JSON.stringify(payload)),payload};
    }
    if(action.startsWith('transfer.')){
      const method=action.slice(9);let saved=false;
      const adapter={root:'私有云端 D1',acquire:async()=>async()=>{},load:async()=>state,save:async draft=>{Object.assign(state,draft);saved=true;},importNovel:engine.importNovel.bind(engine),validateProject:engine.validateProject.bind(engine),execute:engine.execute.bind(engine)};
      // Generated WorkData archive/validation is shared with local imports. Its
      // files() method is replaced so Workers never use the filesystem boundary.
      const workData=new WorkData(adapter);workData.files=async()=>[];
      const transfer=createTransfer(adapter,{workData,snapshot:async()=>`云端快照 · 修订 ${row.revision}`,capacity:s=>{const {rawBytes,storedBytes}=encodeWorkspace(s);return {rawBytes,storedBytes};}});
      if(method==='snapshots'){
        const rows=await database.prepare("SELECT revision,event,updated_at FROM workspace_history WHERE owner=? AND json_extract(event,'$.action')='transfer.import' ORDER BY revision DESC LIMIT 30").bind(owner).all();
        return rows.results.map(r=>({id:String(r.revision),title:JSON.parse(r.event).reason||'导入／恢复前快照',timestamp:r.updated_at}));
      }
      if(method==='snapshot.get'){
        const revision=Number(args.id);if(!Number.isSafeInteger(revision)||revision<1)fail('INVALID_INPUT','快照标识无效');
        const saved=await database.prepare('SELECT state FROM workspace_history WHERE owner=? AND revision=?').bind(owner,revision).first();
        if(!saved)fail('NOT_FOUND','快照不存在');
        return {name:`云端快照-${revision}.json`,gzipBase64:gzipSync(JSON.stringify(workData.archive(await decodeWorkspace(saved.state,database,owner),[]))).toString('base64')};
      }
      if(method==='export'&&args.selection?.kind==='workspace')return download({filename:`墨叽云端工作库-${new Date().toISOString().slice(0,10)}.json`,mime:'application/json',content:JSON.stringify(await rpc('workspace.export',{},sessionId),null,2)});
      const result=await transfer[method](args,actor);
      if(saved)await commit(row,state,{id:randomUUID(),action,actor,novelIds:result.novelIds,novelId:result.novelIds?.length===1?result.novelIds[0]:null,reason:args.reason||(kind==='agent'?'AI 按作者授权导入／恢复作品':args.options?.replaceExisting?'作者从备份恢复':'作者导入作品资料'),timestamp:new Date().toISOString()});
      return method==='export'?download(result):result;
    }
    if(action.startsWith('workspace.')||action.startsWith('transfer.')||action.startsWith('maintenance.')||action==='legacy.preview')fail('NOT_AVAILABLE','此操作未开放；请通过导入／恢复入口校验并预览备份。');
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
    const books=await rpc('novel.list',{includeImages:false},sessionId);let binding=await rpc('binding.get',{},sessionId);
    if(!binding&&books[0])binding=await rpc('binding.set',{novelId:books[0].id},sessionId);
    return {books,binding,sessionId};
  },async collaborationHistory({novelId,entityId,limit=20}){
    if(!novelId)fail('NOVEL_REQUIRED','请提供作品 ID');
    const records=await database.prepare("SELECT revision,state,event FROM workspace_history WHERE owner=? AND json_extract(event,'$.novelId')=? ORDER BY revision DESC LIMIT ?")
      .bind(owner,novelId,Math.max(1,Math.min(limit,100))).all();
    const cache=new Map();return (await Promise.all(records.results.map(async r=>{
      const event=JSON.parse(r.event),state=await decodeWorkspace(r.state,database,owner,cache),novel=state.novels[novelId];
      const before=novel?.chapters[event.entityId]??novel?.nodes[event.entityId]??novel?.edges[event.entityId]??(event.action==='preset.set'?novel?.preset:null);
      return {...event,workspaceRevision:r.revision,state:'committed',before};
    }))).filter(e=>!entityId||e.entityId===entityId);
  }};
}
