// Shared shipped hook + actual planning/material CSS; isolated cards, no account writes.
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
const bundle=await build({alias:{react:resolve('node_modules/react'),'react-dom':resolve('node_modules/react-dom')},stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
import React from 'react';import{createRoot}from'react-dom/client';
import{materialConnection}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
import{useGraph}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph.tsx';
import{graphStyles}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph-style.ts';
import{materialCardStyle}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/material-card-style.mjs';
import{unifiedStoryStyle}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/unified-story-style.mjs';
import{DialogProvider}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/dialog.tsx';
const mode=new URLSearchParams(location.search).get('mode'),nodes=[{id:'a',revision:1,position:{x:100,y:120}},{id:'b',revision:1,position:{x:480,y:120}}];window.links=[];
function Fixture(){const graph=useGraph({nodes,edges:[],fallback:{},freePorts:true,busy:false,scopeKey:'port-zoom',onLayout:async()=>true,onConnect:async(...args)=>{window.links.push(args);return false;}});window.graph=graph;
return <div className="cuigengji"><nav style={{height:48,display:'flex',gap:12,alignItems:'center'}}>{[.1,.35,.59,.6,1].map(z=><button onClick={()=>graph.zoomTo(z,{x:0,y:0})}>{Math.round(z*100)}%</button>)}<button onClick={()=>graph.fit()}>Fit</button><span>Zoom {Math.round(graph.zoom*100)}% · {graph.wire?'Connecting':'Drag cards'} · links {window.links.length}</span></nav><style>{graphStyles}{materialCardStyle}{unifiedStoryStyle}</style><div id="viewport" className={mode==='planning'?'u-canvas':'material-canvas material-connect-mode'} ref={graph.scroll} {...graph.scrollProps} style={{...graph.viewportStyle,position:'relative',width:'100%',height:700,overflow:'hidden',touchAction:'none'}}><div ref={graph.surface} style={graph.worldStyle}><svg style={{position:'absolute',overflow:'visible',pointerEvents:'none'}}>{[{from:'a',to:'b',fromPort:'right',toPort:'left'},{from:'b',to:'a',fromPort:'top',toPort:'bottom'}].map((edge,i)=><path id={i===0?'existing-edge':undefined} d={materialConnection(edge,graph.points,nodes).path} stroke={i?'#528067':'#596dc2'} strokeWidth="2" fill="none"/>)}</svg>{nodes.map(n=><div key={n.id} data-node-id={n.id} {...graph.cardProps(n.id,()=>{})} className={'planning-card selected '+(mode==='planning'?'u-canvas-card':'setting-card')} style={{position:'absolute',left:graph.points[n.id].x,top:graph.points[n.id].y,width:248,height:168,background:'#eef',boxSizing:'border-box'}}><span>Card {n.id}</span>{['top','bottom','left','right'].map(side=><button key={side} {...graph.portProps(n.id,side,n.id)}/>)}</div>)}</div></div></div>}
createRoot(document.getElementById('root')).render(<DialogProvider><Fixture/></DialogProvider>);`},bundle:true,write:false,format:'iife'});
if(process.argv.includes('--fixture-only')){await mkdir('artifacts/graph-port-zoom',{recursive:true});await writeFile('artifacts/graph-port-zoom/index.html',`<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><body style=\"margin:0\"><div id=\"root\"></div><script>${bundle.outputFiles[0].text}</script></body>`);console.log('artifacts/graph-port-zoom/index.html');process.exit(0);}
const server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(`<body style="margin:0"><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body>`)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{for(const mode of ['planning','material','character','world'])for(const touch of [false,true]){
 const page=await browser.newPage({viewport:{width:1000,height:720},hasTouch:touch,isMobile:touch}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?mode=${mode}`);await page.waitForFunction(()=>window.graph);
 const ports=page.locator('[data-graph-port]'),card=page.locator('[data-node-id="a"]').first();
 for(const zoom of [.1,.35,.599999]){
  await page.evaluate(z=>window.graph.zoomTo(z,{x:0,y:0}),zoom);await expect(ports.first()).toBeHidden();
  assert.ok(await ports.evaluateAll(ps=>ps.every(p=>p.disabled&&p.tabIndex===-1&&getComputedStyle(p).display==='none')));
  // Drag near former top port, not only from the safe center.
  const r=await card.boundingBox(),x=r.x+r.width/2,y=r.y+2;assert.equal(await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('[data-graph-port]'),{x,y}),false);
  const before=await page.evaluate(()=>window.graph.points.a);
  if(touch){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+12,y:y+12,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+12,y+12,{steps:3});await page.mouse.up();}
  await expect.poll(()=>page.evaluate(()=>window.graph.points.a.x)).toBeGreaterThan(before.x+5);
  assert.equal(await page.evaluate(()=>window.graph.wire),null);assert.deepEqual(await page.evaluate(()=>window.links),[]);await expect(page.locator('#existing-edge')).toBeAttached();
 }
 for(const zoom of [.6,1]){await page.evaluate(z=>window.graph.zoomTo(z,{x:0,y:0}),zoom);await expect(ports.first()).toBeVisible();await expect(ports.first()).toBeEnabled();assert.ok(await ports.first().evaluate(p=>parseFloat(getComputedStyle(p,'::after').width)*window.graph.zoom<=44.01));}
 // An armed click-to-connect cannot survive the overview boundary.
 await page.locator('[data-node-id="a"].port-top').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.graph.wire);await page.evaluate(()=>window.graph.zoomTo(.35,{x:0,y:0}));await expect.poll(()=>page.evaluate(()=>window.graph.wire)).toBe(null);
 await page.evaluate(()=>window.graph.zoomTo(1,{x:0,y:0}));
 // Free top-to-right linking survives the gate (including touch input).
 const source=page.locator('[data-node-id="a"].port-top'),target=page.locator('[data-node-id="b"].port-right');
 if(touch){await source.tap();await target.tap();}else{await source.click();await target.click();}
 await expect.poll(()=>page.evaluate(()=>window.links.length)).toBe(1);assert.deepEqual(await page.evaluate(()=>window.links[0][3]),{fromPort:'right',toPort:'top'});assert.deepEqual(errors,[]);
 console.log('PASS',mode,touch?'touch':'mouse','overview hidden+disabled, near-port drag, boundary restore, cancellation, free top/right connection');await page.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
