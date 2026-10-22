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
import {createPreviewLayouts} from '../server/timeline-preview-layout.mjs';
import {adoptPreviewStories} from '../server/story-preview-adopt.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.env.MOJI_PREVIEW_PORT||4190);
const storeRoot=process.env.MOJI_PREVIEW_DATA||join(root,'.data','preview-dev-data');
await mkdir(storeRoot,{recursive:true});
const directory=(process.env.MOJI_PREVIEW_DATA||'').trim()?storeRoot:await mkdtemp(join(storeRoot,'data-'));
const service=await createService(directory);
await service.bootstrap('preview');
const layouts=createPreviewLayouts(directory);
const rpc=(action,args={})=>service.rpc(action,args,'preview','human');
await adoptPreviewStories(service.store,directory);
const stories=rpc;
const call=(action,args={})=>action.startsWith('story.')?stories(action,args):action==='timeline.layout.get'?layouts.get(args.novelId):action==='timeline.layout.save'?layouts.save(args.novelId,args):rpc(action,args);
const asset=async name=>'data:image/jpeg;base64,'+(await readFile(join(root,'vendor/cuigengji/src/client/assets',name))).toString('base64');

async function seed(){
  const created=await call('novel.create',{title:'墨叽 · 卡片时间线预览',description:'本地 UI 施工用的隔离测试作品，不是真实作品。'});
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
  const snapshot=await call('planning.list',{novelId,limit:200});
  const intro=snapshot.items.find(p=>p.title==='序：雨夜里的信');
  const mark=snapshot.items.find(p=>p.title==='徽记的来历');
  const shadow=(await call('writing.foreshadow.list',{novelId}))[0];
  await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'隔离预览：演示卡片信息',operations:[
    {op:'node.update',id:intro.id,expectedRevision:intro.revision,value:{foreshadowRefs:shadow?[shadow.id]:[]}},
    {op:'node.update',id:mark.id,expectedRevision:mark.revision,value:{cast:cards.map(c=>({nodeId:c.id,kind:'appearance'}))}}
  ]});
  await call('writing.event.update',{novelId,id:event.id,expectedRevision:event.revision,confirmed:true,value:{content:'雨停之后，一封没有署名的信被塞进门缝。两人从信封上的徽记认出旧日的线索。',memoryRefs:[cards[0].id,cards[1].id],planningRefs:[intro.id],foreshadowRefs:shadow?[shadow.id]:[],chapterRefs:[{chapterId:first.id,revision:first.revision,evidence:chapterSeeds[0].summary}]},reason:'隔离预览：保留带正文依据的事件以验证拖动不覆盖'});
  const station=(await call('writing.event.list',{novelId})).find(e=>e.title==='站台的重逢');
  await call('writing.event.update',{novelId,id:station.id,expectedRevision:station.revision,confirmed:true,value:{content:'在最后一班列车开走前，两人必须决定是否一起离开。',memoryRefs:[cards[0].id,cards[1].id]},reason:'隔离预览：补充事件说明与关联人物'});

}

const hostStub=`export class App{constructor(){window.testHost=this;}async connect(){this.ontoolresult({structuredContent:{result:{contextId:'preview',books:[]}}});}getHostContext(){return window.testContext;}async callServerTool({arguments:a}){const r=await fetch('/dispatch',{method:'POST',body:JSON.stringify(a)});const v=await r.json();return r.ok?{structuredContent:{result:v}}:{isError:true,content:[{type:'text',text:v.error}]};}async requestDisplayMode(){return {mode:'fullscreen'};}async sendSizeChanged(){}async sendMessage(){return {};}}`;

async function bundle(){
  const result=await build({entryPoints:[join(root,'client/workbench.tsx')],bundle:true,write:false,format:'iife',loader:{'.png':'dataurl','.jpg':'dataurl'},plugins:[{name:'preview-host',setup(b){b.onResolve({filter:/^@modelcontextprotocol\/ext-apps$/},()=>({path:'host',namespace:'preview-host'}));b.onLoad({filter:/.*/,namespace:'preview-host'},()=>({contents:hostStub,loader:'js'}));}}]});
  return result.outputFiles[0].contents;
}

const existing=await call('novel.list');
const work=existing.find(n=>n.title==='墨叽 · 卡片时间线预览');
if(work)await call('binding.set',{novelId:work.id});else await seed();
const script=await bundle();
const template=(await readFile(join(root,'client/workbench.html'),'utf8')).replace('<html ','<html data-mcp-app="true" ').replace('<title>墨叽 · 小说工作台</title>','<title>墨叽 · V3.1 统一剧情 · 隔离预览</title>').replace('<!-- SCRIPT -->','<script>localStorage.getItem("cuigengji:ui:native:desktop:page")||localStorage.setItem("cuigengji:ui:native:desktop:page",JSON.stringify("plan"));localStorage.getItem("cuigengji:ui:native:preview:page")||localStorage.setItem("cuigengji:ui:native:preview:page",JSON.stringify("plan"));window.testContext??={displayMode:"fullscreen",platform:innerWidth<800?"mobile":"desktop",theme:"dark",availableDisplayModes:["inline","fullscreen"],safeAreaInsets:{top:0,right:0,bottom:0,left:0}};</script><script src="/bundle.js"></script>');
const standalone=template.replace('data-mcp-app="true"','data-mcp-app="false"');
const hostPreview=template.replace('</body>','<style>@media(max-width:799px){.preview-host-close{position:fixed;right:8px;top:5px;width:40px;height:40px;border:0;border-radius:50%;background:#202624;color:white;font:25px system-ui;z-index:9999}.preview-host-reply{position:fixed;left:0;right:0;bottom:0;height:84px;background:#202624;color:#aab4ae;z-index:9999;box-sizing:border-box;padding:17px 18px;font:16px system-ui}.preview-host-reply span{display:block;border:1px solid #59635d;border-radius:24px;padding:8px 16px}}@media(min-width:800px){.preview-host-close,.preview-host-reply{display:none}}</style><button class="preview-host-close" aria-label="模拟宿主关闭">×</button><div class="preview-host-reply" aria-label="模拟宿主回复栏"><span>＋　回复 ChatGPT</span></div></body>');

createServer(async(req,res)=>{
  try{
    if(req.url==='/'||req.url==='/live'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(hostPreview);return;}
    if(req.url==='/mobile'||req.url==='/mobile?landscape=1'){
      const landscape=req.url.includes('landscape=1');
      res.setHeader('Content-Type','text/html;charset=utf-8');
      res.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>墨叽 · 手机隔离预览</title><style>body{margin:0;padding:22px;background:#eef1f5;color:#283e50;font:14px/1.6 system-ui}header{max-width:1000px;margin:0 auto 20px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}h1{font-size:17px;margin:0}a{color:#315e96;text-decoration:none}small{color:#7b8994}iframe{display:block;width:${landscape?760:390}px;max-width:100%;height:${landscape?430:820}px;margin:0 auto;border:1px solid #dbe2e8;border-radius:18px;box-shadow:0 10px 40px #182b4514;background:white}</style><header><h1>墨叽 · 手机预览</h1><a href="/mobile">竖屏</a><a href="/mobile?landscape=1">横屏</a><a href="/web">宽屏工作台 ↗</a><small>独立测试作品，含模拟退出与回复栏</small></header><iframe src="/live" title="手机工作台预览"></iframe></html>`);return;
    }
    if(req.url==='/web'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(standalone);return;}
    if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(script);return;}
    if(req.url==='/api/bootstrap'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await service.bootstrap('preview')));return;}
    if(req.url==='/dispatch'||req.url==='/api/dispatch'){let text='';for await(const part of req)text+=part;const {action,args}=JSON.parse(text);res.setHeader('Content-Type','application/json');const result=await call(action,args);res.end(JSON.stringify(req.url==='/api/dispatch'?{result}:result));return;}
    res.statusCode=404;res.end('not found');
  }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message,code:error.code}));}
}).listen(port,'127.0.0.1',()=>{
  console.log(`DEV PREVIEW  http://127.0.0.1:${port}/live  （手机嵌入形态）`);
  console.log(`DEV PREVIEW  http://127.0.0.1:${port}/web   （宽屏网页形态）`);
  console.log(`data: ${directory}`);
});
