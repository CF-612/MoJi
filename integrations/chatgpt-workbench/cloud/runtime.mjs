import {DurableObject} from 'cloudflare:workers';
import {createCloudService} from './service.mjs';

// One execution queue per author. Durable data remains in D1; eviction/restart
// loses only the queue, never saved novels, receipts or rollback snapshots.
export class WorkbenchRuntime extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.tail=Promise.resolve();}
  async invoke(owner,method,args){
    if(owner!==this.env.OWNER_SUB||!['rpc','bootstrap','collaborationHistory'].includes(method))return {error:{code:'FORBIDDEN',message:'不允许访问此工作库'}};
    const run=this.tail.then(async()=>{
      try{if(this.env.TRANSFER_DISABLED==='1'&&method==='rpc'&&args[0]==='transfer.import')throw Object.assign(new Error('兼容回退版暂停导入；作品与最新数据保留。'),{code:'NOT_AVAILABLE'});return {result:await createCloudService(this.env.DB,owner)[method](...args)};}
      catch(e){return {error:{code:e.code||'ERROR',message:e.message}};}
    });
    this.tail=run.then(()=>undefined,()=>undefined);return run;
  }
}
