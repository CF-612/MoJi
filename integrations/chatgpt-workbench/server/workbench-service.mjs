import {randomUUID,createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {WorkData} from '../../../src/data/workspace.js';
import {TransferService} from '../../../src/application/transfer/service.ts';
import {convertLegacyExport} from '../../../src/infrastructure/migrations/legacy.js';
import {HUMAN_ACTIONS,TOOL_ACTIONS,isReadAction} from '../../../src/contracts/actions.js';

const actions=[...new Set(Object.values(TOOL_ACTIONS).flat())];
export const QUERY_ACTIONS=[...actions.filter(isReadAction),'novel.list','preset.get'];
export const EDIT_ACTIONS=[...actions.filter(action=>!isReadAction(action)),'preset.set'];
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const object=value=>value && typeof value==='object' && !Array.isArray(value);
const transferMethods={catalog:'catalog',inspect:'inspect',preview:'preview',import:'import',exportPreview:'exportPreview',export:'export'};

export function attachWorkbench(service) {
  const {store}=service;
  const workData=new WorkData(store),transfer=new TransferService(store,workData);
  const historyRoot=join(store.root,'audit');
  const writeEvent=async event=>{
    await mkdir(historyRoot,{recursive:true});
    const key=createHash('sha256').update(event.id).digest('hex');
    const path=join(historyRoot,`${key}.jsonl`),temp=`${path}.${randomUUID()}.tmp`;
    await writeFile(temp,JSON.stringify(event)+'\n','utf8');await rename(temp,path);
  };
  const readBefore=async(action,args,actor)=>{
    const kind=action.split('.')[0];
    const id=kind==='chapter'?args.chapterId:kind==='edge'?args.edgeId:args.nodeId;
    if(id && ['chapter','graph','edge','planning'].includes(kind)) {
      const result=await store.dispatch(`${kind}.get`,{novelId:args.novelId,...(kind==='chapter'?{chapterId:id,maxChars:200000}:kind==='edge'?{edgeId:id}:{nodeId:id})},actor);
      return result.node??result;
    }
    if(action==='preset.set')return store.dispatch('preset.get',{novelId:args.novelId},actor);
    return null;
  };
  service.bootstrap=async(sessionId='desktop')=>{
    const actor={kind:'human',sessionId:`native:${sessionId}`};
    const books=await store.dispatch('novel.list',{},actor);
    let binding=await store.dispatch('binding.get',{},actor);
    if(!binding && books[0]) binding=await store.dispatch('binding.set',{novelId:books[0].id,chapterId:books[0].id===service.novelId?service.chapterId:undefined},actor);
    return {books,binding,sessionId};
  };
  service.rpc=async(action,args={},sessionId='desktop',kind='human')=>{
    if(!object(args))fail('INVALID_INPUT','参数必须是对象');
    if(typeof sessionId!=='string'||!sessionId.trim()||sessionId.length>512)fail('INVALID_INPUT','工作台标识无效');
    const allowed=kind==='human'?HUMAN_ACTIONS:[...QUERY_ACTIONS,...EDIT_ACTIONS];
    if(!allowed.includes(action))fail('NOT_ALLOWED','不允许此操作');
    // Model tools always identify the work explicitly, independent of a panel's binding.
    if(kind==='agent' && action!=='novel.list' && !args.novelId)fail('NOVEL_REQUIRED','请明确提供作品 ID，不从其他聊天继承选择');
    const actor={kind,sessionId:kind==='agent'?'native-agent':`native:${sessionId}`};
    if(action==='settings.get')return {dataRoot:store.root,pluginVersion:'0.2.0',host:'Codex native conversation panel'};
    if(action==='legacy.preview')return convertLegacyExport(args.input);
    if(action.startsWith('transfer.'))return transfer[transferMethods[action.slice(9)]](args,actor);
    if(action.startsWith('workspace.'))return workData[action.slice(10)](args.backup);
    if(action.startsWith('maintenance.'))fail('NOT_AVAILABLE','此迁移版使用独立工作数据目录；维护请先导出完整备份');
    if(isReadAction(action)||['binding.set','preset.preview'].includes(action))return store.dispatch(action,args,actor);
    // Persist the before-image before committing. A lost response leaves a recoverable record.
    const event={type:'native-collaboration',id:randomUUID(),timestamp:new Date().toISOString(),state:'requested',action,actor,novelId:args.novelId??null,entityId:args.chapterId??args.nodeId??args.edgeId??null,reason:args.reason||(kind==='human'?'作者在工作台修改':'AI 按作者要求修改'),before:await readBefore(action,args,actor)};
    await writeEvent(event);
    try {
      // Upstream preset writes are author-only. Explicit model delegation uses that
      // boundary while retaining the actual model source in the collaboration audit.
      const result=await store.dispatch(action,args,action==='preset.set'?{...actor,kind:'human'}:actor);
      event.state='committed';event.after=result;event.entityId??=result?.id??null;
      try {await writeEvent(event);}catch(error){console.error('工作台已保存；历史提交标记未更新，修改前快照仍在：',error.message);}
      return result;
    }catch(error){event.state='rejected';event.error={code:error.code,message:error.message};await writeEvent(event);throw error;}
  };
  service.collaborationHistory=async({novelId,entityId,limit=50}={})=>{
    if(!novelId)fail('NOVEL_REQUIRED','请提供作品 ID');
    let files=[];try{files=await readdir(historyRoot);}catch(error){if(error.code!=='ENOENT')throw error;}
    const chunks=await Promise.all(files.filter(name=>/^[a-f0-9]{64}\.jsonl$/.test(name)).map(async name=>(await readFile(join(historyRoot,name),'utf8')).split('\n').filter(Boolean).map(line=>JSON.parse(line))));
    return chunks.flat().filter(event=>event.type==='native-collaboration'&&event.novelId===novelId&&(!entityId||event.entityId===entityId)&&event.state!=='rejected').sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0,Math.max(1,Math.min(limit,100)));
  };
  return service;
}
