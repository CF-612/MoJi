import {createHash,randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {TransferService} from '../../../src/application/transfer/service.ts';
import {WorkData} from '../../../src/application/backup/workspace.js';
export {WorkData};
import {recognize} from '../../../src/application/transfer/recognize.ts';
import {catalog,counts,newNovel} from '../../../src/application/transfer/model.ts';
import {dataPackage,selectProjects} from '../../../src/application/transfer/packages.ts';

const hash=s=>createHash('sha256').update(s).digest('hex');
const clone=structuredClone;
const fail=(message,code='INVALID_TRANSFER')=>{throw Object.assign(new Error(message),{code});};
const MAX_BYTES=64*1024*1024;
const kinds=new Set(['auto','chapters','character','world','planning','preset']);

export function unpackFile(file){
  if(!file||typeof file.name!=='string'||file.name.length>512)fail('请选择有效文件');
  if(file.gzipBase64!==undefined){
    if(typeof file.gzipBase64!=='string'||file.gzipBase64.length>12_000_000||file.text!==undefined||file.json!==undefined||file.pngBase64!==undefined)fail('文件传输格式无效');
    try{return {name:file.name,text:gunzipSync(Buffer.from(file.gzipBase64,'base64'),{maxOutputLength:MAX_BYTES}).toString('utf8')};}
    catch{fail('文件传输校验失败或超过 64 MB，请重新选择文件');}
  }
  return file;
}
function json(file){if(file.json!==undefined)return file.json;if(typeof file.text==='string'&&!/\.(md|txt)$/i.test(file.name)){try{return JSON.parse(file.text.replace(/^\uFEFF/,''));}catch{fail('JSON 文件不完整');}}return null;}

// The same transactional import boundary is used by the filesystem host and D1.
// The D1 adapter supplies its own snapshot; no filesystem calls run in a Worker.
export function createTransfer(store,{workData=new WorkData(store),snapshot,capacity}={}){
  const base=new TransferService(store,workData);
  if(snapshot)base.snapshot=snapshot;
  const normalize=input=>{
    const file=unpackFile(input),raw=json(file);
    if(raw?.format==='cuigengji-cloud'){
      if(raw.version!==1||!raw.payload?.state||hash(JSON.stringify(raw.payload))!==raw.sha256)fail('云端备份校验失败','INVALID_WORKSPACE_BACKUP');
      const backup={...workData.archive(raw.payload.state,[]),exportedAt:raw.exportedAt||''};workData.validate(backup);
      return {name:file.name,json:backup};
    }
    return file;
  };
  const inMemory=state=>{
    const memory={root:store.root,acquire:async()=>async()=>{},load:async()=>state,save:async()=>{},
      importNovel:store.importNovel.bind(store),validateProject:store.validateProject.bind(store)};
    const data=new WorkData(memory);data.files=async()=>[];
    const transfer=new TransferService(memory,data);transfer.snapshot=async()=>'';
    return transfer;
  };
  async function locked(fn){const release=await store.acquire();try{return await fn(await store.load());}finally{await release();}}
  function batchFile(entry){
    if(!entry||!kinds.has(entry.kind||'auto'))fail('文件用途无效');
    const file=normalize(entry.file),kind=entry.kind||'auto';
    if(kind==='auto'||kind==='chapters')return file;
    if(!/\.(md|txt)$/i.test(file.name)||typeof file.text!=='string')fail('人物、世界、规划与要求的手动分类适用于 TXT／Markdown；JSON 使用自动识别');
    const title=file.name.replace(/\.(txt|md)$/i,'').slice(0,200),id='source-'+hash(file.name+'\0'+file.text).slice(0,32),novel=newNovel(title,id);
    const state={schemaVersion:1,novels:{[id]:novel},bindings:{},requests:{}};
    const content=file.text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    if(kind==='character'||kind==='world')store.execute(state,'graph.create',{novelId:id,name:title,type:kind==='character'?'character_card':'world_entry',content},{kind:'human'});
    if(kind==='preset')store.execute(state,'preset.set',{novelId:id,expectedRevision:0,preset:{name:title,enabled:false,blocks:[{identifier:'import-'+id,name:title,content,enabled:true}]}},{kind:'human'});
    if(kind==='planning'){const current=store.execute(state,'story.get',{novelId:id},{kind:'human'});store.execute(state,'story.apply',{novelId:id,expectedRevision:current.state.revision,operation:{type:'card.create',value:{title,content},pageId:current.state.pages[0].id}},{kind:'human'});}
    return {name:file.name,json:dataPackage({projects:[novel],dependencies:[],warnings:[]},kind==='character'||kind==='world'?'memory':kind)};
  }
  async function batchPlan(state,file,options,actor){
    const raw=json(file);
    if(raw.version!==1||!Array.isArray(raw.files)||!raw.files.length||raw.files.length>100)fail('每批请选择 1–100 个文件');
    if(options.mode==='restore'||options.replaceExisting)fail('批量导入用于复用内容；恢复备份请使用单文件恢复入口');
    if(options.targetId&&!Object.hasOwn(state.novels,options.targetId))fail('目标作品已不存在');
    const inputBytes=Buffer.byteLength(JSON.stringify(raw));if(inputBytes>MAX_BYTES)fail('每批内容超过 64 MB，请拆分');
    const draft=clone(state),transfer=inMemory(draft),rows=[],ids=new Set(),warnings=new Set(),dependencies=[];
    let targetId=options.targetId||null,totalBytes=0;
    for(let i=0;i<raw.files.length;i++){
      const source=batchFile(raw.files[i]);totalBytes+=Buffer.byteLength(JSON.stringify(source));if(totalBytes>MAX_BYTES)fail('解压后的批量内容超过 64 MB，请拆分');
      const info=transfer.inspect({file:source});
      if(info.kind==='workspace'||info.restorable&&info.kind==='works')fail('完整作品／工作库备份请单独导入；批量入口接收正文、设定、规划和要求');
      if(!targetId){const novel=newNovel(options.title?.trim()||'导入作品');draft.novels[novel.id]=novel;targetId=novel.id;}
      const selection={kind:info.kind,novelId:info.catalog.books[0]?.id,includeDependencies:true};
      const opts={mode:'copy',selection,targetId,presetPolicy:'append'};
      const preview=await transfer.preview({file:source,options:opts});
      if(!preview.valid)fail(preview.conflicts.join('；'),'IMPORT_CONFLICT');
      const done=await transfer.import({file:source,options:opts,proof:preview.proof,requestId:randomUUID()},actor);
      for(const id of done.novelIds)ids.add(id);
      preview.warnings.forEach(w=>warnings.add(w));dependencies.push(...preview.dependencies);
      rows.push({name:raw.files[i].file.name,kind:info.kind,counts:preview.counts,samples:preview.samples});
    }
    // Internal simulation receipts never become part of the author's workspace.
    draft.requests=clone(state.requests);
    const sum=rows.reduce((a,row)=>{for(const key of Object.keys(a))a[key]+=row.counts[key]||0;return a;},{works:0,chapters:0,memory:0,pages:0,beats:0,decorations:0,presets:0});sum.works=ids.size;
    const preview={fingerprint:hash(JSON.stringify(raw)),proof:hash(JSON.stringify({state,file:raw,options})),label:'批量导入',counts:sum,dependencies,warnings:[...warnings],conflicts:[],skipped:[],valid:true,target:draft.novels[targetId].title,files:rows,samples:rows.flatMap(row=>row.samples||[]).slice(0,3)};
    return {draft,preview,novelIds:[...ids]};
  }
  function renewed(incoming,current,actor){
    const next=clone(incoming),now=new Date().toISOString();
    next.revision=Math.max(next.revision,current?.revision||0)+1;next.updatedAt=now;
    const bump=(item,old)=>{item.revision=Math.max(item.revision,old?.revision||0)+1;item.updatedAt=now;};
    for(const section of ['volumes','chapters','nodes','edges','memoryGroups'])for(const [id,item]of Object.entries(next[section]||{})){
      bump(item,current?.[section]?.[id]);
      if(section==='chapters')item.versions.push({revision:item.revision,content:item.content,summary:item.summary||'',contentHash:item.contentHash,title:item.title,volumeId:item.volumeId,order:item.order,deleted:!!item.deleted,timestamp:now,actor:{kind:actor.kind==='agent'?'agent':'human',sessionId:actor.sessionId||null},reason:actor.kind==='agent'?'AI 按作者授权从备份恢复':'作者从备份恢复'});
    }
    if(next.story){next.story.state.revision=Math.max(next.story.state.revision,current?.story?.state?.revision||0)+1;for(const [id,card]of Object.entries(next.story.state.cards))bump(card,current?.story?.state?.cards?.[id]);for(const page of next.story.state.pages)for(const [ref,item]of Object.entries(page.instances))bump(item,current?.story?.state?.pages?.find(p=>p.id===page.id)?.instances?.[ref]);next.story.redo=[];}
    if(next.preset)bump(next.preset,current?.preset);
    if(next.plan)bump(next.plan,current?.plan);
    if(next.planning){
      next.planning.sequence=Math.max(next.planning.sequence,current?.planning?.sequence||0)+1;
      if(next.planning.legacy)bump(next.planning.legacy,current?.planning?.legacy);
      for(const section of ['nodes','edges','pages','groups','decorations'])for(const [id,item]of Object.entries(next.planning[section]||{}))bump(item,current?.planning?.[section]?.[id]);
    }
    return next;
  }
  async function restorePlan(state,file,options,actor){
    const info=base.inspect({file,options});
    if(!info.restorable||options.mode!=='restore'||options.targetId)fail('替换恢复仅支持完整作品或工作库备份');
    const value=recognize(file,options);let projects;
    if(info.kind==='workspace'&&(options.selection?.kind||'workspace')==='workspace'){
      projects=Object.values(workData.validate(value.workspace).state.novels);
    }else{
      if(options.selection?.kind&&options.selection.kind!=='works')fail('恢复需要完整作品');
      projects=selectProjects(value.projects,options.selection||{kind:'works',novelIds:value.projects.map(n=>n.id)}).projects;
    }
    const draft=clone(state),added=[],replaced=[];
    for(const incoming of projects){
      const validated={novels:{}};store.importNovel(validated,{backup:{format:'cuigengji',schemaVersion:2,novel:incoming}});
      const current=draft.novels[incoming.id];(current?replaced:added).push(incoming.title);
      draft.novels[incoming.id]=renewed(validated.novels[incoming.id],current,actor);store.validateProject(draft.novels[incoming.id]);
    }
    for(const [key,binding]of Object.entries(draft.bindings)){
      const novel=draft.novels[binding.novelId];if(!novel)delete draft.bindings[key];else if(binding.chapterId&&!novel.chapters[binding.chapterId])binding.chapterId=null;
    }
    const preview={fingerprint:info.fingerprint,proof:hash(JSON.stringify({state,file,options})),label:'替换恢复',counts:counts(projects),dependencies:[],warnings:['只替换所选作品，未选作品保留。','恢复前自动保存快照；对象版本提升，其他页面的旧草稿必须重新核对。','保留正文历史；聊天绑定和当前操作记录不回退。'],conflicts:[],skipped:[],valid:true,target:'恢复备份中的作品',added,replaced};
    return {draft,preview,novelIds:projects.map(n=>n.id)};
  }
  async function specialPlan(state,file,options,actor){
    const plan=json(file)?.format==='cuigengji-batch'?await batchPlan(state,file,options,actor):await restorePlan(state,file,options,actor);
    if(capacity){try{plan.preview.capacity=capacity(plan.draft);}catch(e){plan.preview.valid=false;plan.preview.conflicts.push(e.message);}}
    return plan;
  }
  const special=(file,options)=>json(file)?.format==='cuigengji-batch'||!!options.replaceExisting;
  return {
    async snapshots(){const folders=await readdir(join(store.root,'backups')).catch(e=>{if(e.code==='ENOENT')return [];throw e;});return folders.filter(id=>/^before-transfer-\d+-[a-f0-9-]+$/.test(id)).sort().reverse().slice(0,30).map(id=>({id,title:'导入／恢复前快照',timestamp:new Date(Number(id.split('-')[2])).toISOString()}));},
    async snapshotGet({id}){if(typeof id!=='string'||!/^before-transfer-\d+-[a-f0-9-]+$/.test(id))fail('快照标识无效');const file={name:id+'.json',text:await readFile(join(store.root,'backups',id,'workspace.json'),'utf8')};base.inspect({file});return file;},
    catalog:()=>base.catalog(),inspect:args=>base.inspect({...args,file:normalize(args.file)}),
    async preview({file,options={}}){file=normalize(file);if(special(file,options))return locked(async state=>(await specialPlan(state,file,options,{kind:'human'})).preview);
      const preview=await base.preview({file,options});
      if(capacity&&preview.valid)await locked(async state=>{const draft=clone(state),transfer=inMemory(draft),p=await transfer.preview({file,options});await transfer.import({file,options,proof:p.proof,requestId:randomUUID()});draft.requests=state.requests;try{preview.capacity=capacity(draft);}catch(e){preview.valid=false;preview.conflicts.push(e.message);}});
      return preview;
    },
    async import({file,options={},proof,requestId},actor={}){
      file=normalize(file);if(!special(file,options))return base.import({file,options,proof,requestId},actor);
      if(typeof proof!=='string'||typeof requestId!=='string'||!requestId.trim()||requestId.length>512)fail('请先预览再导入');
      return locked(async state=>{
        const signature=hash(JSON.stringify({file,options})),key=hash(requestId),receipt=hash('batch:'+signature);
        if(Object.hasOwn(state.requests,key)){if(state.requests[key].signature!==signature)fail('请求标识已用于其他操作','REQUEST_ID_REUSED');return {...clone(state.requests[key].result),repeated:true};}
        if(json(file)?.format==='cuigengji-batch'&&Object.hasOwn(state.requests,receipt))return {...clone(state.requests[receipt].result),repeated:true};
        const plan=await specialPlan(state,file,options,actor);
        if(!plan.preview.valid)fail(plan.preview.conflicts.join('；'),'IMPORT_CONFLICT');
        if(proof!==plan.preview.proof)fail('预览后资料已变化，请重新核对','CONFLICT');
        const backupDir=await base.snapshot(state),result={novelIds:plan.novelIds,counts:plan.preview.counts,skipped:[],backupDir};
        const record={signature,result:clone(result),timestamp:new Date().toISOString()};plan.draft.requests[key]=record;
        if(json(file)?.format==='cuigengji-batch')plan.draft.requests[receipt]=record;
        Object.assign(state,plan.draft);await store.save(state);return result;
      });
    },
    exportPreview:args=>base.exportPreview(args),export:args=>base.export(args),
  };
}
