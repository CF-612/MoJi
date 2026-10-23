// Isolated synthetic 200-chapter fixture exercising the shipped graph hook and controls.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
const output=await build({alias:{react:resolve('node_modules/react'),'react-dom':resolve('node_modules/react-dom')},stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
import React from 'react';import{createRoot}from'react-dom/client';
import{useGraph,GraphControls}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph.tsx';
import{DialogProvider}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/dialog.tsx';
import{emptyWorkspace,reconcile,treeLayout}from'./src/domain/story-workspace.mjs';
const state=emptyWorkspace(),sources={volumes:[{id:'v',title:'合成卷'}],chapters:Array.from({length:200},(_,i)=>({id:'c'+i,volumeId:'v',title:'合成章节'+i,order:i}))};reconcile(state,sources);
const points=treeLayout(state,sources),nodes=Object.entries(points).map(([id,position])=>({id,position,width:248,height:208,revision:1}));window.fixtureWrites=[];
function Fixture(){const graph=useGraph({nodes,edges:[],fallback:points,busy:false,scopeKey:'zoom-synthetic',onLayout:async p=>{window.fixtureWrites.push(p);return true;},onConnect:async()=>true});window.graph=graph;
return <><GraphControls graph={graph} busy={false}/><div id="viewport" ref={graph.scroll} {...graph.scrollProps} style={{position:'relative',overflow:'hidden',width:'100%',height:'calc(100vh - 110px)',touchAction:'none'}}><div ref={graph.surface} style={graph.worldStyle}>{nodes.map(n=><div key={n.id} data-node-id={n.id} {...graph.cardProps(n.id,()=>{})} style={{position:'absolute',left:graph.points[n.id].x,top:graph.points[n.id].y,width:248,height:208,background:'#ddeaff',border:'1px solid #456',boxSizing:'border-box'}}>合成章节</div>)}</div></div></>}
createRoot(document.getElementById('root')).render(<DialogProvider><Fixture/></DialogProvider>);`},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}});
const html=`<html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0"><div id="root"></div><script>${output.outputFiles[0].text}</script></body></html>`;
if(process.argv.includes('--fixture-only')){await mkdir('artifacts/graph-zoom',{recursive:true});await writeFile('artifacts/graph-zoom/index.html',html);console.log('artifacts/graph-zoom/index.html');process.exit(0);}
const server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{
 for(const width of [1400,390]){
  const context=await browser.newContext({viewport:{width,height:800},hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>window.graph?.zoom<.1);
  const fit=await page.evaluate(()=>window.graph.camera);
  const allInside=()=>page.evaluate(()=>{const v=document.querySelector('#viewport').getBoundingClientRect();return [...document.querySelectorAll('[data-node-id]')].every(el=>{const r=el.getBoundingClientRect();return r.left>=v.left-.01&&r.top>=v.top-.01&&r.right<=v.right+.01&&r.bottom<=v.bottom+.01;});});assert.ok(await allInside());
  await page.getByRole('button',{name:'恢复百分之百缩放'}).click();await expect.poll(()=>page.evaluate(()=>window.graph.zoom)).toBe(1);
  for(let i=0;i<8;i++)await page.getByRole('button',{name:'缩小画布',exact:true}).click();assert.ok(await page.evaluate(()=>window.graph.zoom<.35));
  const box=await page.locator('#viewport').boundingBox();const anchor={x:box.width*.6,y:box.height*.6};
  const before=await page.evaluate(p=>window.graph.clientPoint(p.x,p.y),{x:box.x+anchor.x,y:box.y+anchor.y});
  await page.mouse.move(box.x+anchor.x,box.y+anchor.y);await page.mouse.wheel(0,8000);await page.waitForFunction(z=>Math.abs(window.graph.zoom-z)<1e-10,fit.zoom);
  const after=await page.evaluate(p=>window.graph.clientPoint(p.x,p.y),{x:box.x+anchor.x,y:box.y+anchor.y});assert.ok(Math.abs(before.x-after.x)<1e-6&&Math.abs(before.y-after.y)<1e-6);
  // A real two-pointer pinch, not a direct zoom API call.
  await page.getByRole('button',{name:'恢复百分之百缩放'}).click();
  const cdp=await context.newCDPSession(page),touch=(x,id)=>({x:box.x+x,y:box.y+200,id});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(40,1),touch(340,2)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(40,1),touch(70,2)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  await expect.poll(()=>page.evaluate(()=>window.graph.zoom)).toBeCloseTo(.1,8);
  await page.getByRole('button',{name:'适应视图',exact:true}).click();assert.ok(await allInside());
  const saved=await page.evaluate(()=>window.graph.camera);await page.reload();await page.waitForFunction(()=>window.graph?.zoom<.1);const restored=await page.evaluate(()=>window.graph.camera);assert.ok(Math.abs(restored.zoom-saved.zoom)<1e-10);assert.ok(await allInside());
  assert.deepEqual(await page.evaluate(()=>window.fixtureWrites),[]);assert.deepEqual(errors,[]);await context.close();console.log('PASS zoom, fit 201 nodes, wheel anchor, buttons, pinch, reload, no novel writes:',width);
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
