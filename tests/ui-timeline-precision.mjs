// Real shared DSH/web UI + Store; all data is synthetic and disposable.
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {chromium,expect} from '@playwright/test';
import {Store} from '../src/core/store.js';
const root=resolve(import.meta.dirname,'..'),directory=await mkdtemp(join(tmpdir(),'moji-precision-'));
const store=new Store(directory),actor={kind:'human',sessionId:'precision-regression'};
const call=(action,args={})=>store.dispatch(action,args,actor);
let browser,server;
try{
 const novelId=(await call('novel.create',{title:'Synthetic precision regression'})).id;
 const chapters=[];for(let i=0;i<5;i++)chapters.push(await call('chapter.create',{novelId,title:`测试章 ${i+1}`,content:'Synthetic only.'}));
 await call('binding.set',{novelId});
 let snapshot=await call('story.get',{novelId});
 await call('story.apply',{novelId,expectedRevision:snapshot.state.revision,operation:{type:'card.create',value:{title:'精度测试卡',time:{narration:{startChapterId:chapters[0].id,startOffset:0.2,endChapterId:chapters[0].id,endOffset:0.8,trackId:'main'}}}}});
 const card=()=>call('story.get',{novelId}).then(s=>Object.values(s.state.cards)[0]);
 const {outputFiles}=await build({stdin:{resolveDir:root,loader:'jsx',contents:`import React from 'react';import{createRoot}from'react-dom/client';import{Workbench}from'./integrations/chatgpt-workbench/client/native-shared-ui.mjs';const rpc=async(action,args)=>{const r=await fetch('/dispatch',{method:'POST',body:JSON.stringify({action,args})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;};createRoot(document.getElementById('root')).render(<Workbench sessionId="precision-regression" rpc={rpc}/>);`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl','.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"development"'}});
 server=createServer(async(req,res)=>{try{if(req.url==='/dispatch'){let body='';for await(const chunk of req)body+=chunk;const {action,args}=JSON.parse(body);res.setHeader('content-type','application/json');res.end(JSON.stringify(await call(action,args)));}else if(req.url==='/bundle.js'){res.setHeader('content-type','text/javascript');res.end(outputFiles[0].contents);}else{res.end('<!doctype html><meta charset="utf-8"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script src="/bundle.js"></script>');}}catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.getByRole('button',{name:'规划',exact:true}).click();
 await page.getByRole('button',{name:'时间线',exact:true}).click();
 const item=page.locator('[data-time-item]').first();await expect(item).toBeVisible();
 const before=await card(),box=await item.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+37,box.y+box.height/2,{steps:8});await page.mouse.up();
 await expect.poll(async()=>(await card()).revision).toBeGreaterThan(before.revision);
 const dragged=await card();expect(dragged.time.narration.startOffset).not.toBe(before.time.narration.startOffset);
 expect(dragged.time.narration.startOffset*100%1).not.toBe(0);
 for(const width of [1400,390]){
  await page.setViewportSize({width,height:950});await item.dblclick();
  const panel=page.getByRole('region',{name:'正在编辑剧情卡'});
  const note=panel.getByLabel(/故事.*(备注|日期)/).first();
  await note.fill(`保存精确位置 ${width}`);
  await panel.getByRole('button',{name:'保存',exact:true}).first().click();
  await expect.poll(async()=>(await card()).storyDateText).toBe(`保存精确位置 ${width}`);
  expect((await card()).time).toEqual(dragged.time);
 }
 // Existing boundary-adjacent decimals must survive unchanged, not just dragged values.
 snapshot=await call('story.get',{novelId});const current=await card();
 const precise={...current.time.narration,startOffset:0.999999,endChapterId:chapters[1].id,endOffset:0.000001};
 await call('story.apply',{novelId,expectedRevision:snapshot.state.revision,operation:{type:'card.update',id:current.id,expectedRevision:current.revision,value:{time:{narration:precise}}}});
 await page.reload();await item.dblclick();
 const panel=page.getByRole('region',{name:'正在编辑剧情卡'}),start=panel.getByLabel('起点章内位置',{exact:true}),end=panel.getByLabel('终点章内位置',{exact:true});
 await panel.getByLabel(/故事.*(备注|日期)/).first().fill('既有精度保持');await panel.getByRole('button',{name:'保存',exact:true}).first().click();
 await expect.poll(async()=>(await card()).storyDateText).toBe('既有精度保持');expect((await card()).time.narration).toEqual(precise);
 await item.dblclick();await panel.locator('summary').filter({hasText:'时间安排'}).click();
 for(const [input,value] of [[start,''],[start,'1'],[start,'-0.1'],[end,'0'],[end,'1.01']]){
  await start.fill('0.999999');await end.fill('0.000001');await input.fill(value);
  const revision=(await card()).revision;await panel.getByRole('button',{name:'保存',exact:true}).first().click();
  expect(await input.evaluate(el=>el.checkValidity())).toBe(false);expect((await card()).revision).toBe(revision);
 }
 await start.fill('0.999999');await end.fill('0.000001');await panel.getByRole('button',{name:'保存',exact:true}).first().click();await expect(panel).toHaveCount(0);
 expect(errors).toEqual([]);console.log(JSON.stringify({ok:true,checks:['real-pointer-drag-edit-save','desktop-and-mobile','existing-boundary-decimals-preserved','invalid-and-empty-blocked','correct-and-retry'],dragged:dragged.time.narration}));
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await rm(directory,{recursive:true,force:true});}
