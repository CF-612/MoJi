import {prepareSelection,finishSelection,selectionSignature,validateCardSelectionProofs} from './story-selection.mjs';
import {validateRelationshipProofs} from './story-relation-proof.mjs';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {emptyWorkspace,reconcile,applyStory,clone,validateRestore,refOf} from '../vendor/cuigengji/src/domain/story-workspace.mjs';

// 只接入本地 preview-dev，不提供线上路由，不读取旧计划／事件实体。
export function createStoryPreview(directory,rpc){
 let queue=Promise.resolve();
 const dir=join(directory,'story-v31');
 const save=async(file,value)=>{await mkdir(dir,{recursive:true});const temp=file+'.tmp';await writeFile(temp,JSON.stringify(value,null,2));await rename(temp,file);};
 return (action,args={})=>{
  const job=queue.then(async()=>{
   if(!/^[\w-]+$/.test(args.novelId||''))throw new Error('作品 ID 无效');
   await rpc('novel.get',{novelId:args.novelId});
   const sources={volumes:await rpc('volume.list',{novelId:args.novelId}),chapters:await rpc('chapter.list',{novelId:args.novelId})};
   const file=join(dir,args.novelId+'.json');let data;
   try{data=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;data={state:emptyWorkspace(),history:[]};
    reconcile(data.state,sources);
    // 仅为新结构创建代表性样例，旧测试计划不迁移。
    const chapters=sources.chapters,first=chapters[0],last=chapters[Math.min(3,chapters.length-1)];
    for(const [i,value] of [{title:'雨夜与旧日的徽记',purpose:'篇章',summary:'从来信到追查：先保留疑问，再逐步揭示真相。',content:'卡片完整内容会在大纲、画布和详情中保留。时间线只展示紧凑信息，不会删掉说明。',status:'selected'}, {title:'没有寄出的信',purpose:'情节',summary:'信封上的徽记成为线索。',content:'先写环境，再让信出现。人物动机和伏笔可以逐步补充。',status:'idea'}, {title:'跨卷的追查',purpose:'时期',summary:'这一时期横跨两卷，正式目录的所属卷保持不变。',content:'章节可以纳入同一时期卡，只有大纲组织改变。',status:'selected'}, {title:'尚未安排的尾声',purpose:'情节',summary:'先自由构思，不强制选择章节。',status:'idea'}].entries()){
     if(first&&last&&i<3)value.time={narration:{startChapterId:first.id,startOffset:i*.12,endChapterId:(i===2?last:first).id,endOffset:.85,trackId:'main'}};
     data.state=applyStory(data.state,sources,{type:'card.create',value,parent:i===0&&sources.volumes[0]?refOf('volume',sources.volumes[0].id):'root',pageId:'main',position:{x:60+(i%2)*340,y:60+Math.floor(i/2)*240}},randomUUID);
    }
   }
   const selectionRpc=(name,value)=>rpc(name,{novelId:args.novelId,...value});
   if(data.pendingSelection)await finishSelection(data,selectionRpc,value=>save(file,value));
   const beforeReconcile=clone(data.state);
   if(reconcile(data.state,sources)){data.history.push({at:new Date().toISOString(),reason:'修复无效层级／同步正文目录',state:beforeReconcile});data.history=data.history.slice(-30);data.state.revision++;await save(file,data);}
   const response=()=>({state:clone(data.state),sources,history:data.history.map(h=>({revision:h.state.revision,at:h.at,reason:h.reason}))});
   if(action==='story.selection.apply'){
    const receipt=data.selectionReceipts?.find(r=>r.requestId===args.requestId);
    if(receipt){if(receipt.signature!==selectionSignature(args))throw new Error('选区请求标识已用于其他内容，请重新打开。');return receipt.result;}
    data.pendingSelection=await prepareSelection(args,data,sources,selectionRpc);
    await save(file,data);
    return finishSelection(data,selectionRpc,value=>save(file,value));
   }
   if(action==='story.foreshadow.save'){
    if(args.expectedRevision!==data.state.revision)throw Object.assign(new Error('剧情卡已有更新；填写内容已保留，请核对后重试。'),{code:'CONFLICT'});
    const old=args.id?await rpc('writing.foreshadow.get',{novelId:args.novelId,id:args.id}):null;
    for(const node of args.value?.plotNodes||[]){
     const previous=old?.plotNodes?.find(p=>p.id===node.id);
     if(!data.state.cards[node.cardId]&&JSON.stringify({...previous,review:undefined})!==JSON.stringify({...node,review:undefined}))throw new Error('关联剧情卡已不存在，请重新选择。');
    }
    return rpc(args.id?'writing.foreshadow.update':'writing.foreshadow.create',{novelId:args.novelId,id:args.id,expectedRevision:args.expectedForeshadowRevision,requestId:args.requestId,confirmed:true,value:args.value,reason:args.reason||'作者编辑伏笔与剧情节点'});
   }
   if(action==='story.get'){await save(file,data);return response();}
   if(action==='story.backup')return {format:'moji-story-backup-v1',novelId:args.novelId,createdAt:new Date().toISOString(),state:clone(data.state)};
   if(args.expectedRevision!==data.state.revision)throw Object.assign(new Error('规划已被其他操作更新，已保留当前数据，请刷新后重试。'),{code:'CONFLICT'});
   let next;
   if(action==='story.apply')next=applyStory(data.state,sources,args.operation,randomUUID);
   else if(action==='story.restore'){
    if(args.backup?.format!=='moji-story-backup-v1'||args.backup.novelId!==args.novelId)throw new Error('请选择同一隔离作品的规划备份。');
    next=validateRestore(args.backup.state,sources);next.revision=data.state.revision+1;
   }else if(action==='story.undo'){
    const last=data.history.at(-1);if(!last)throw new Error('没有可撤销的修改。');
    next=clone(last.state);reconcile(next,sources);next.revision=data.state.revision+1;const shadows=await rpc('writing.foreshadow.list',{novelId:args.novelId});for(const f of shadows)for(const node of f.plotNodes||[])if(data.state.cards[node.cardId]&&!next.cards[node.cardId])throw new Error('撤销会移除伏笔关联的剧情卡，请先调整伏笔节点。');await validateRelationshipProofs(data.state,next,sources,(name,value)=>rpc(name,{novelId:args.novelId,...value}),{restore:true});await validateCardSelectionProofs(data.state,next,sources,selectionRpc,{restore:true});data.history.pop();data.state=next;await save(file,data);return response();
   }else throw new Error('未知的新结构接口。');
   await validateRelationshipProofs(data.state,next,sources,(name,value)=>rpc(name,{novelId:args.novelId,...value}),{confirmed:args.operation?.confirmed===true,restore:action==='story.restore'});
   await validateCardSelectionProofs(data.state,next,sources,selectionRpc,{restore:action==='story.restore'});
   const shadows=await rpc('writing.foreshadow.list',{novelId:args.novelId});
   for(const f of shadows)for(const node of f.plotNodes||[])if(data.state.cards[node.cardId]&&!next.cards[node.cardId])throw new Error('这张剧情卡仍关联伏笔「'+f.title+'」，请先在伏笔页移除或改挂节点。');
   data.history.push({at:new Date().toISOString(),reason:args.operation?.type||'恢复规划备份',state:clone(data.state)});data.history=data.history.slice(-30);data.state=next;await save(file,data);return response();
  });queue=job.catch(()=>{});return job;
 };
}
