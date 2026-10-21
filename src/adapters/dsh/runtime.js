import {normalizeCloudUrl} from './cloud-client.js';
import {convertLegacyExport} from '../../infrastructure/migrations/legacy.js';

const connectionKey='dsh-cuigengji/connection';
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const transferMethods={catalog:'catalog',inspect:'inspect',preview:'preview',import:'import',exportPreview:'exportPreview',export:'export',snapshots:'snapshots','snapshot.get':'snapshotGet'};

/** Select a backend without copying works or opening a local fallback in cloud mode. */
export async function createDshRuntime({credentials,config={},cloudClient,createLocal,isBusy=()=>false,isSessionBusy=()=>false,version,supportedDsh}){
  const saved=await credentials.readRecord(connectionKey);
  let selection=saved?.kind==='grant'&&saved.payload?.type==='connection'?saved.payload:{mode:config.mode||'local',instanceUrl:config.cloudUrl||''};
  selection={mode:selection?.mode==='cloud'?'cloud':'local',instanceUrl:selection?.instanceUrl||''};
  if(selection.instanceUrl)selection.instanceUrl=normalizeCloudUrl(selection.instanceUrl);
  let localPromise;
  const local=()=>localPromise??=(Promise.resolve().then(createLocal).catch(error=>{localPromise=undefined;throw error;}));
  const status=async()=>({...selection,...(selection.mode==='cloud'&&selection.instanceUrl?await cloudClient.status(selection.instanceUrl):{authenticated:selection.mode==='local',pending:false}),pluginVersion:version,supportedDsh});
  async function control(action,args={}){
    if(action==='connection.status')return status();
    if(action==='connection.configure'){
      if(isBusy())fail('SESSION_BUSY','请先停止正在运行的写作会话，再切换连接');
      if(!['local','cloud'].includes(args.mode))fail('INVALID_INPUT','请选择本机或个人云端');
      const next={mode:args.mode,instanceUrl:args.mode==='cloud'?normalizeCloudUrl(args.instanceUrl):selection.instanceUrl};
      await credentials.modifyRecord(connectionKey,async()=>({kind:'grant',payload:{type:'connection',...next}}));
      selection=next;return status();
    }
    if(!selection.instanceUrl)fail('INVALID_INPUT','请先设置个人云端地址');
    if(action==='connection.login')return cloudClient.beginLogin(selection.instanceUrl);
    if(action==='connection.logout'){
      if(isBusy())fail('SESSION_BUSY','请先停止正在运行的写作会话，再退出连接');
      await cloudClient.logout(selection.instanceUrl);return status();
    }
    fail('INVALID_INPUT','未知的连接操作');
  }
  async function rawDispatch(action,args,actor){
    if(selection.mode==='cloud'){
      if(!selection.instanceUrl)fail('UNAUTHENTICATED','请先连接个人云端');
      return cloudClient.rpc(selection.instanceUrl,action,args,actor.sessionId,actor.kind||'agent',{signal:actor.signal});
    }
    const {signal,...identity}=actor;
    signal?.throwIfAborted();return (await local()).store.dispatch(action,args,identity);
  }
  async function rpc(action,args={},sessionId){
    if(action.startsWith('connection.'))return control(action,args);
    if(action==='settings.get')return {...await status(),dataRoot:selection.mode==='cloud'?'个人云端':config.dataRoot||'',host:'DSH 原生工作台'};
    if(action==='legacy.preview')return convertLegacyExport(args.input);
    if(selection.mode==='cloud'){
      if(!selection.instanceUrl)fail('UNAUTHENTICATED','请先连接个人云端');
      return cloudClient.rpc(selection.instanceUrl,action,args,sessionId,'human');
    }
    const backend=await local();await backend.maintenance.ensureReady();
    if(action.startsWith('transfer.')){
      const method=transferMethods[action.slice(9)];if(!method||typeof backend.transfer[method]!=='function')fail('INVALID_INPUT','无效的导入导出操作');
      return backend.transfer[method](args,{sessionId});
    }
    if(action.startsWith('workspace.')){
      const method={status:'status',export:'export',preview:'preview',import:'import'}[action.slice(10)];
      if(!method)fail('INVALID_INPUT','无效的工作库操作');return backend.workData[method](args.backup);
    }
    return backend.dispatch(action,args,{kind:'human',sessionId});
  }
  return {status,control,rpc,rawDispatch,local,isSessionBusy,
    mode:()=>selection.mode,
    async ready(){if(selection.mode==='local')await (await local()).maintenance.ensureReady();},
    async maintenance(action,args){if(selection.mode==='cloud')return {...await status(),dataRoot:'个人云端',migrationRequired:false};return (await local()).maintenance[action](args);},
    async close(){cloudClient.close();if(localPromise){const backend=await localPromise.catch(()=>null);await backend?.memory.close();}},
  };
}
