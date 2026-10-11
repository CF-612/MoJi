import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {createService} from '../server/service.mjs';
const root=resolve(import.meta.dirname,'..');
const service=await createService(resolve(root,'.data/desktop-qa'));
const novelId=service.novelId,chapterId=service.chapterId;
const call=(action,args={})=>service.rpc(action,{novelId,...args},'desktop','human');
let people=await call('graph.list');
if(!people.length){
  const person=await call('graph.create',{type:'character_card',name:'林序（演示人物）',summary:'雨夜收到来信的人',content:'林序谨慎，珍惜朋友，不愿轻易相信陌生来信。'});
  const world=await call('graph.create',{type:'world_entry',name:'雨城（演示地点）',summary:'长雨之后的旧街',content:'旧街有一盏常亮的窗灯。'});
  await call('edge.create',{from:person.id,to:world.id,name:'生活于'});
  const page=await call('planning.page.create',{name:'来信主线',requestId:crypto.randomUUID()});
  await call('planning.apply',{requestId:crypto.randomUUID(),operations:[
    {op:'node.create',ref:'a',value:{title:'收到来信',pageId:page.id,summary:'故事的起点',content:'讨论：谁寄出了这封信？',position:{x:0,y:0},memoryRefs:[person.id]}},
    {op:'node.create',ref:'b',value:{title:'寻找寄信人',pageId:page.id,summary:'动机待讨论',position:{x:380,y:0}}},
    {op:'edge.create',value:{from:'a',to:'b'}},
    {op:'decoration.create',value:{kind:'note',pageId:page.id,content:'伏笔：窗边的灯',position:{x:0,y:260}}}
  ]});
  await call('preset.set',{expectedRevision:0,preset:{name:'演示写作要求',enabled:true,blocks:[{identifier:'style',name:'文风与视角',content:'第三人称，克制叙述，保留人物的迟疑。',enabled:true},{identifier:'boundary',name:'创作边界',content:'未确认的情节保留为规划，不自动写入正文。',enabled:true}]}});
}
await mkdir(resolve(root,'qa'),{recursive:true});
await writeFile(resolve(root,'qa/desktop-fixture.json'),JSON.stringify({dataRoot:service.store.root,novelId,chapterId,settings:await call('graph.list'),pages:await call('planning.pages')},null,2));
console.log(JSON.stringify({novelId,chapterId,dataRoot:service.store.root}));
