// Real UnifiedCanvas + graph hook; isolated sample data, no account or persistence API.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
const root=resolve(import.meta.dirname,'..'),output=process.env.MOJI_PORT_SCREENSHOTS;
const bundle=await build({stdin:{resolveDir:root,loader:'jsx',contents:`
import React from 'react';import{createRoot}from'react-dom/client';
import {UnifiedCanvas} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx';
import {unifiedStoryStyle} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/unified-story-style.mjs';
import {graphStyles} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph-style.ts';
import {DialogProvider} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/dialog.tsx';
import {emptyWorkspace,objectIndex} from './integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-workspace.mjs';
const state=emptyWorkspace(),sources={volumes:[],chapters:[]},page=state.pages[0];
for(const [i,title] of ['雨夜来信','潮声里的约定'].entries()){const id='c'+i;state.cards[id]={id,title,purpose:'情节',status:'idea',summary:i?'她在灯塔下等待一封迟来的回信。':'雨停以后，街道重新安静下来。窗边的灯仍亮着。',cast:[]};state.placements['card:'+id]={parent:'root',order:i};page.instances['card:'+id]={x:70+i*340,y:70,revision:1};}
window.saved=[];createRoot(document.getElementById('root')).render(<DialogProvider><div className="cuigengji unified-story"><style>{graphStyles}{unifiedStoryStyle}</style><h2>剧情规划</h2><UnifiedCanvas state={state} sources={sources} objects={objectIndex(state,sources)} page={page} people={[]} open={()=>{}} onMemory={()=>{}} save={async value=>{window.saved.push(value);return true}} onMenu={()=>{}}/></div></DialogProvider>);
`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl'}});
const server=createServer((req,res)=>{res.setHeader('content-type',req.url==='/app.js'?'application/javascript':'text/html');res.end(req.url==='/app.js'?bundle.outputFiles[0].text:`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{margin:0;height:100%;font-family:Arial,sans-serif}.cuigengji{--cg-paper:#fffefb;--cg-ink:#292b27;--cg-muted:#70766b;--cg-line:#deded5;--cg-accent:#718065;--cg-wash:#f0f2eb;height:100%;color-scheme:light}h2{padding:20px;margin:0;font-size:20px}.u-canvas{flex:1}button{font:inherit;color:inherit}</style><div id="root"></div><script src="/app.js"></script>`)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
const url=`http://127.0.0.1:${server.address().port}`;
try{
 if(output)await mkdir(output,{recursive:true});
 const page=await browser.newPage({viewport:{width:1000,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const card=page.locator('.u-canvas-card').first(),top=card.locator('.port-top'),bottom=card.locator('.port-bottom'),side=card.locator('.port-right');
 await expect(card).toBeVisible();await page.mouse.move(980,20);
 await expect(top).toHaveCSS('opacity','0');await expect(top).toHaveCSS('pointer-events','none');await expect(side).toHaveCSS('opacity','0.7');
 assert.equal(await side.evaluate(e=>getComputedStyle(e).width),'7px');assert.equal(await side.evaluate(e=>getComputedStyle(e,'::after').width),'44px');
 if(output)await page.screenshot({path:resolve(output,'desktop-idle.png')});
 await card.hover();await expect(top).toHaveCSS('opacity','1');await expect(bottom).toHaveCSS('pointer-events','auto');
 if(output)await page.screenshot({path:resolve(output,'desktop-hover.png')});
 await card.click();await page.mouse.move(980,20);await expect(top).toHaveCSS('opacity','1');
 // Keyboard activation keeps vertical targets discoverable without hover.
 await bottom.focus();await page.keyboard.press('Enter');const target=page.locator('.u-canvas-card').nth(1).locator('.port-top');await expect(target).toHaveClass(/port-valid/);await expect(target).toHaveCSS('opacity','1');await expect(target).toBeEnabled();
 await expect(page.locator('.u-canvas-card').nth(1).locator('.port-right')).toBeDisabled();
 if(output)await page.screenshot({path:resolve(output,'desktop-connecting.png')});
 await target.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.saved[0].type),'move');
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mobile.goto(url);const mobileCard=mobile.locator('.u-canvas-card').first(),mobileTop=mobileCard.locator('.port-top');await expect(mobileTop).toHaveCSS('opacity','0');const cdp=await mobile.context().newCDPSession(mobile),box=await mobileCard.boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await expect(mobileCard).toHaveClass(/selected/);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(mobileTop).toHaveCSS('opacity','1');
 if(output)await mobile.screenshot({path:resolve(output,'mobile-selected.png')});
 await mobile.emulateMedia({reducedMotion:'reduce'});await expect(mobileTop).toHaveCSS('transition-duration','0s');assert.deepEqual(errors,[]);
 console.log('PASS: actual UnifiedCanvas desktop idle/hover/selected, 7px visual/44px hit target, keyboard containment connection, disabled incompatible ports, mobile long-press reveal, reduced motion.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
