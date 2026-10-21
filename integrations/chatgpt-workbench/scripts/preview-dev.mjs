// 本地可迭代预览：直接读取共享工作台源码，用隔离的测试作品起服务，改完源码重启即可看到。
// 用法：node scripts/preview-dev.mjs            （默认 http://127.0.0.1:4188/web）
//       MOJI_PREVIEW_PORT=4190 node scripts/preview-dev.mjs
// 与 tests/mobile-workbench.mjs --preview 的区别：这里不跑 Playwright 断言，只起可操作页面，供施工中反复查看。
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdir,mkdtemp,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createService} from '../server/service.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.env.MOJI_PREVIEW_PORT||4188);
const storeRoot=process.env.MOJI_PREVIEW_DATA||join(root,'.data','preview-dev-data');
await mkdir(storeRoot,{recursive:true});
const directory=(process.env.MOJI_PREVIEW_DATA||'').trim()?storeRoot:await mkdtemp(join(storeRoot,'data-'));
const service=await createService(directory);
await service.bootstrap('preview');
const call=(action,args={})=>service.rpc(action,args,'preview','human');
const asset=async name=>'data:image/jpeg;base64,'+(await readFile(join(root,'vendor/cuigengji/src/client/assets',name))).toString('base64');

async function seed(){
  const created=await call('novel.create',{title:'墨叽 · 界面预览',description:'本地 UI 施工用的隔离测试作品，不是真实作品。'});
  const novelId=created.id;
  await call('binding.set',{novelId});
  const vol1=await call('volume.create',{novelId,title:'第一卷 雨夜'});
  const vol2=await call('volume.create',{novelId,title:'第二卷 晴天'});
  const chapterSeeds=[
    {v:vol1.id,title:'第一章 雨夜来信',summary:'雨停以后，街道重新安静下来。一封没有署名的信被塞进门缝。'},
    {v:vol1.id,title:'第二章 徽记',summary:'信纸角落的徽记，和十年前那场大火里的图案一模一样。'},
    {v:vol1.id,title:'第三章 旧友',summary:'她在旧书店遇见了当年唯一还愿意说话的证人。'},
    {v:vol2.id,title:'第四章 出发',summary:'两个人第一次并肩坐上远行的列车。'},
    {v:vol2.id,title:'第五章 晴天',summary:'所有未说出口的话，在晴天里有了重量。'},
  ];
  const chapters=[];
  for(const seed of chapterSeeds){
    const created=await call('chapter.create',{novelId,title:seed.title,content:'（预览正文）'+seed.summary,volumeId:seed.v,summary:seed.summary});
    chapters.push(created);
  }
  const first=chapters[0];
  const event=await call('writing.event.create',{novelId,requestId:crypto.randomUUID(),confirmed:true,value:{title:'雨夜来信',storyTime:'初春',order:10,narrativeKind:'linear',chapterRefs:[{chapterId:first.id,revision:first.revision,evidence:''}]}});
  for(let i=0;i<3;i++)await call('writing.event.create',{novelId,requestId:crypto.randomUUID(),confirmed:true,value:{title:`日常片段${i+1}`,order:20+i,narrativeKind:'linear'}});
  await call('writing.event.create',{novelId,requestId:crypto.randomUUID(),confirmed:true,value:{title:'站台的重逢',order:40,narrativeKind:'linear',chapterRefs:[{chapterId:chapters[3].id,revision:chapters[3].revision,evidence:''}]}});
  await call('writing.foreshadow.create',{novelId,requestId:crypto.randomUUID(),confirmed:true,value:{title:'信封上的徽记',content:'后来会认出这个徽记的来历。',status:'planned',memoryRefs:[],evidence:[],targetChapterId:first.id}});
  const people=[
    {name:'海因',avatar:'cover-a.jpg',summary:'常年带着旧书气味的记录者。'},
    {name:'林晚',avatar:'cover-b.jpg',summary:'在大火之后学会独自生活的证人。'},
    {name:'西尔维娅',avatar:'cover-c.jpg',summary:'旧书店的主人，记得每一封没寄出的信。'},
    {name:'托马斯',avatar:null,summary:'站台上出现过的陌生人，来意不明。'},
  ];
  const cards=[];
  for(const [i,person] of people.entries()){
    cards.push(await call('graph.create',{novelId,type:'character_card',name:person.name,summary:person.summary,content:person.summary,position:{x:(i%3)*260,y:Math.floor(i/3)*220}}));
    if(person.avatar)await call('graph.update',{novelId,nodeId:cards[i].id,expectedRevision:cards[i].revision,avatarImage:await asset(person.avatar)});
  }
  const relation=await call('edge.create',{novelId,from:cards[0].id,to:cards[1].id,name:'陌生'});
  await call('writing.relationshipChange.create',{novelId,requestId:crypto.randomUUID(),confirmed:true,value:{eventId:event.id,edgeId:relation.id,value:{name:'朋友',category:'partner',active:true}}});
  const plan=async(value)=>call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'预览数据',operations:[{op:'node.create',ref:'new',value}]});
  await plan({title:'序：雨夜里的信',summary:'故事从一个没有署名的信封开始。',content:'构思：先写环境，再让信出现，不要急着解释徽记。',status:'written',chapterRefs:[{chapterId:first.id,revision:first.revision}],position:{x:60,y:60},cast:[{nodeId:cards[0].id,kind:'appearance'},{nodeId:cards[1].id,kind:'appearance'},{nodeId:cards[2].id,kind:'mention'}]});
  await plan({title:'徽记的来历',summary:'十年前那场大火的真相，需要分两次揭开。',content:'第一阶段只让读者看到图案重复；真相留到第二卷。',status:'selected',position:{x:380,y:60},cast:[{nodeId:cards[1].id,kind:'appearance'},{nodeId:cards[2].id,kind:'appearance'},{nodeId:cards[3].id,kind:'appearance'}]});
  await plan({title:'两次试探',summary:'托马斯先靠近，再后退。',content:'他是敌是友，留到最后再定。',status:'idea',position:{x:700,y:60},cast:[{nodeId:cards[0].id,kind:'appearance'},{nodeId:cards[3].id,kind:'appearance'}]});
  await plan({title:'旧书店的钥匙',summary:'西尔维娅交出保存多年的钥匙。',content:'这一段的重点不是钥匙，是她为什么现在才给。',status:'idea',position:{x:60,y:320},cast:[{nodeId:cards[2].id,kind:'appearance'}]});
  await plan({title:'车站的抉择',summary:'跨第四到第五章的长剧情，决定两人是否同行。',content:'一整段的关系变化，不在这一轮写死。',status:'selected',chapterRefs:[{chapterId:chapters[3].id,revision:chapters[3].revision},{chapterId:chapters[4].id,revision:chapters[4].revision}],position:{x:380,y:320},cast:[{nodeId:cards[0].id,kind:'appearance'},{nodeId:cards[1].id,kind:'appearance'},{nodeId:cards[3].id,kind:'appearance'}]});
  await plan({title:'（未安排）尾声的空白',summary:'还没有想清楚结尾该落在哪里。',content:'先留一个没有章节归属的想法。',status:'idea',position:{x:700,y:320}});
}

const hostStub=`export class App{constructor(){window.testHost=this;}async connect(){this.ontoolresult({structuredContent:{result:{contextId:'preview',books:[]}}});}getHostContext(){return window.testContext;}async callServerTool({arguments:a}){const r=await fetch('/dispatch',{method:'POST',body:JSON.stringify(a)});const v=await r.json();return r.ok?{structuredContent:{result:v}}:{isError:true,content:[{type:'text',text:v.error}]};}async requestDisplayMode(){return {mode:'fullscreen'};}async sendSizeChanged(){}async sendMessage(){return {};}}`;

async function bundle(){
  const result=await build({entryPoints:[join(root,'client/workbench.tsx')],bundle:true,write:false,format:'iife',loader:{'.png':'dataurl','.jpg':'dataurl'},plugins:[{name:'preview-host',setup(b){b.onResolve({filter:/^@modelcontextprotocol\/ext-apps$/},()=>({path:'host',namespace:'preview-host'}));b.onLoad({filter:/.*/,namespace:'preview-host'},()=>({contents:hostStub,loader:'js'}));}}]});
  return result.outputFiles[0].contents;
}

await seed();
const script=await bundle();
const template=(await readFile(join(root,'client/workbench.html'),'utf8')).replace('<html ','<html data-mcp-app="true" ').replace('<!-- SCRIPT -->','<script>window.testContext??={displayMode:"fullscreen",platform:innerWidth<800?"mobile":"desktop",theme:"dark",availableDisplayModes:["inline","fullscreen"],safeAreaInsets:{top:0,right:0,bottom:0,left:0}};</script><script src="/bundle.js"></script>');
const standalone=template.replace('data-mcp-app="true"','data-mcp-app="false"');

createServer(async(req,res)=>{
  try{
    if(req.url==='/'||req.url==='/live'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(template);return;}
    if(req.url==='/web'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(standalone);return;}
    if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(script);return;}
    if(req.url==='/api/bootstrap'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await service.bootstrap('preview')));return;}
    if(req.url==='/dispatch'||req.url==='/api/dispatch'){let text='';for await(const part of req)text+=part;const {action,args}=JSON.parse(text);res.setHeader('Content-Type','application/json');const result=await call(action,args);res.end(JSON.stringify(req.url==='/api/dispatch'?{result}:result));return;}
    res.statusCode=404;res.end('not found');
  }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}
}).listen(port,'127.0.0.1',()=>{
  console.log(`DEV PREVIEW  http://127.0.0.1:${port}/live  （手机嵌入形态）`);
  console.log(`DEV PREVIEW  http://127.0.0.1:${port}/web   （宽屏网页形态）`);
  console.log(`data: ${directory}`);
});
