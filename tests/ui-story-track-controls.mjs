import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {chromium,expect} from '@playwright/test';
const root=resolve(import.meta.dirname,'..');
const bundle=await build({alias:{react:resolve(root,'node_modules/react'),'react-dom':resolve(root,'node_modules/react-dom')},stdin:{resolveDir:root,loader:'jsx',contents:`
import React,{useRef,useState} from 'react';import{createRoot}from'react-dom/client';
import{StoryTrackControls,StoryTrackLane}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryTrackControls.jsx';
const initial=[{id:'same',key:'shared:same',trackSource:'shared',name:'共享轨道',color:'#765432',side:'above'},{id:'same',key:'story:same',name:'故事轨道',color:'#345678',side:'above'},{id:'last',key:'story:last',name:'下方轨道',color:'#345678',side:'below'}];window.ops=[];
function App(){const[catalog,setCatalog]=useState(initial),controlRef=useRef(null),viewport=useRef(null);const mutate=async op=>{window.ops.push(op);if(op.type==='track.reorder')setCatalog(list=>op.order.map(r=>list.find(t=>t.id===r.trackId&&t.trackSource===r.trackSource)));if(op.name)setCatalog(list=>list.map(t=>t.id===op.id&&((op.type==='track.update')===(t.trackSource==='shared'))?{...t,name:op.name}:t));return true;};const placed=[{time:{story:{axisVersion:1,trackId:'same',trackSource:'shared',start:1,end:2}}}];return <div className="cuigengji"><StoryTrackControls {...{catalog,placed,mutate,controlRef,viewport}} onSettings={()=>{}} onCreate={()=>{}}/><div ref={viewport}>{catalog.map(t=><div className="sa-lane" key={t.key} data-story-track={t.key} data-story-space={t.side} style={{height:100,border:'1px solid #ddd',marginTop:10}}><StoryTrackLane track={t} {...{controlRef}} onRename={mutate}/></div>)}</div></div>};createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl'}});
const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:8px;font:14px sans-serif}.cuigengji{--cg-paper:#fff;--cg-line:#cdd;--cg-ink:#234;--cg-muted:#567}button{padding:5px;border:1px solid #ccd;border-radius:4px;background:white}input{font:inherit}</style><div id="root"></div><script>${bundle.outputFiles[0].text}</script>`;
const server=createServer((q,r)=>r.end(html));await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{const page=await browser.newPage({viewport:{width:800,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);
const names=()=>page.locator('.sa-lane input');await names().first().fill('取消的改名');await names().first().press('Escape');assert.equal(await page.evaluate(()=>window.ops.length),0);await names().first().fill('新共享');await names().first().press('Enter');await expect(names().first()).toHaveValue('新共享');assert.equal(await page.evaluate(()=>window.ops.at(-1).type),'track.update');
const handles=()=>page.locator('.sa-lane .sa-track-grip');await handles().first().focus();await handles().first().press('Space');await handles().first().press('ArrowDown');await handles().first().press('Escape');assert.equal(await page.evaluate(()=>window.ops.length),1);
await handles().first().press('Space');await handles().first().press('ArrowDown');await handles().first().press('Enter');await expect(names().first()).toHaveValue('故事轨道');assert.deepEqual(await page.evaluate(()=>window.ops.at(-1).order.slice(0,2)),[{trackId:'same'},{trackId:'same',trackSource:'shared'}]);
// Mouse drag reorder, with visible insertion preview.
let from=await handles().nth(1).boundingBox(),to=await page.locator('.sa-lane').first().boundingBox();await page.mouse.move(from.x+10,from.y+10);await page.mouse.down();await page.mouse.move(to.x+220,to.y+35,{steps:8});const during=await page.locator('.sa-lane').first().boundingBox();assert.equal(during.y,to.y,'drag feedback must not shift lane targets');const zones=await page.locator('.sa-track-drop-zones').boundingBox();assert.ok(zones.y+zones.height<=during.y,'side targets must not cover lane headers');await expect(page.locator('.sa-track-drop-before')).toHaveCount(1);await page.mouse.up();await expect(names().first()).toHaveValue('新共享');
// Native release at a new coordinate may arrive without an intermediate move.
// Assert against mounted DOM and actual pointer events, not a mocked handler.
const mouseClient=await page.context().newCDPSession(page);
from=await handles().nth(1).boundingBox();to=await page.locator('.sa-lane').first().boundingBox();
await mouseClient.send('Input.dispatchMouseEvent',{type:'mousePressed',x:from.x+10,y:from.y+10,button:'left',clickCount:1});
await mouseClient.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:to.x+220,y:to.y+20,button:'left',clickCount:1});
await expect(names().first()).toHaveValue('故事轨道');
// Reset with keyboard so following side/count expectations stay source-aware.
await handles().first().press('Space');await handles().first().press('ArrowDown');await handles().first().press('Enter');
await expect(names().first()).toHaveValue('新共享');
// Crossing axis requires confirmation; cancelling does not mutate.
from=await handles().first().boundingBox();to=await page.locator('.sa-lane').last().boundingBox();await page.mouse.move(from.x+10,from.y+10);await page.mouse.down();await page.mouse.move(to.x+220,to.y+50,{steps:8});await page.mouse.up();await expect(page.getByRole('dialog')).toBeVisible();const before=await page.evaluate(()=>window.ops.length);await page.getByRole('button',{name:'取消',exact:true}).click();assert.equal(await page.evaluate(()=>window.ops.length),before);
// Touch pointer drag follows the same captured-pointer path.
const client=await page.context().newCDPSession(page);from=await handles().first().boundingBox();to=await page.locator('.sa-lane').last().boundingBox();await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x+10,y:from.y+10}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:to.x+220,y:to.y+50}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'确认移动 1 张卡片',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.ops.at(-1)),{type:'storyAxis.track.side',trackId:'same',trackSource:'shared',side:'below'});
await page.setViewportSize({width:390,height:800});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=390));assert.deepEqual(errors,[]);console.log('PASS direct rename/cancel, keyboard and mouse reorder, touch side drag, affected-count confirmation/cancel, narrow screen');
}finally{await browser.close();await new Promise(r=>server.close(r));}
