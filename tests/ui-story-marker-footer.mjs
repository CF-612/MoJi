// Real shared editor + shipped styles, synthetic callbacks only; no account/network mutations.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve('artifacts/story-marker-footer');await mkdir(out,{recursive:true});
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{StoryMarkerEditor}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryAxisPanels.jsx';
import{styles}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/style.ts';
import{unifiedStoryStyle}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/unified-story-style.mjs';
const axis={calendar:{kind:'gregorian'},anchor:{coordinate:366}},marker={id:'synthetic-marker',label:'111',coordinate:366};
if(new URLSearchParams(location.search).has('dark'))document.documentElement.dataset.themePreference='dark';window.calls=[];window.mode='cancel';window.busy=false;
function App(){const[panel,setPanel]=useState(new URLSearchParams(location.search).has('preview')?'edit':null),[busy,setBusy]=useState(false);window.setBusy=setBusy;
return <div className="cuigengji"><style>{styles}{unifiedStoryStyle}</style><section className="unified-story"><button onClick={()=>setPanel('edit')}>编辑测试标记</button><button onClick={()=>setPanel('new')}>新建测试标记</button>{panel&&<StoryMarkerEditor axis={axis} marker={panel==='edit'?marker:null} busy={busy} close={()=>setPanel(null)} onInsert={(m,d)=>window.calls.push(['insert',d])} onSave={async v=>{window.calls.push(['save',v]);return true;}} onDelete={async()=>{window.calls.push(['delete']);if(window.mode==='pending')return await new Promise(r=>window.resolveDelete=r);if(window.mode==='error')throw new Error('测试删除失败');return window.mode==='success';}}/>}</section></div>};
createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl'},alias:{react:resolve('node_modules/react'),'react-dom':resolve('node_modules/react-dom')}});
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style><div id="root"></div><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`;
await writeFile(resolve(out,'fixture.html'),html);
if(process.argv.includes('--fixture-only')){console.log(out);process.exit(0);}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+resolve(out,'fixture.html'));
const open=()=>page.getByRole('button',{name:'编辑测试标记',exact:true}).click(),del=()=>page.getByRole('button',{name:'删除这个标记',exact:true});
for(const width of [320,390,600,1100])for(const dark of [false,true]){
await page.setViewportSize({width,height:844});await page.evaluate(d=>document.documentElement.dataset.themePreference=d?'dark':'light',dark);await open();await del().scrollIntoViewIfNeeded();await page.mouse.move(0,0);
const footer=page.locator('.sap-footer'),actions=page.locator('.sap-footer-actions');
assert.equal(await footer.locator('.sap-delete').count(),1);
const f=await footer.boundingBox(),d=await del().boundingBox(),a=await actions.boundingBox();
assert.ok(Math.abs(d.x-f.x)<2,'delete anchored left');assert.ok(Math.abs(a.x+a.width-f.x-f.width)<2,'save/cancel anchored right');
assert.ok(d.x+d.width<=a.x+1||d.y+d.height<=a.y+1,'groups do not overlap');
assert.ok(d.width>=44&&d.height>=44,'touch target');
assert.equal(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
assert.deepEqual(await del().evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]),['rgb(180, 35, 24)','rgb(255, 255, 255)']);
await page.screenshot({path:resolve(out,`footer-${width}-${dark?'dark':'light'}.png`)});
await page.getByRole('button',{name:'取消',exact:true}).click();await expect(page.getByRole('button',{name:'编辑测试标记',exact:true})).toBeFocused();
}
assert.deepEqual(await page.evaluate(()=>window.calls),[]);
await open();await del().click();await expect(page.getByRole('dialog')).toBeVisible();assert.deepEqual(await page.evaluate(()=>window.calls),[['delete']]); // false return keeps confirmation-cancel semantics
await page.evaluate(()=>window.mode='error');await del().click();await expect(page.getByRole('alert')).toHaveText('测试删除失败');await expect(del()).toBeEnabled();
await page.evaluate(()=>window.mode='pending');await del().click();await expect(del()).toBeDisabled();await expect(page.getByRole('button',{name:'取消',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'保存中…',exact:true})).toBeDisabled();
await page.evaluate(()=>document.querySelector('.sap-delete').click());assert.equal(await page.evaluate(()=>window.calls.length),3);
await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeVisible();await page.evaluate(()=>window.resolveDelete(true));await expect(page.getByRole('dialog')).toHaveCount(0);
await open();await page.evaluate(()=>window.setBusy(true));await expect(del()).toBeDisabled();await page.evaluate(()=>window.setBusy(false));await expect(del()).toBeEnabled();await page.getByRole('button',{name:'保存',exact:true}).click();assert.equal(await page.evaluate(()=>window.calls.at(-1)[0]),'save');
await page.getByRole('button',{name:'新建测试标记',exact:true}).click();await expect(del()).toHaveCount(0);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
assert.deepEqual(errors,[]);console.log('PASS marker footer: 4 widths × 2 themes, left danger/right actions, no overflow/overlap, cancel/focus, handler false/error/success, pending/repeat/Escape guard, busy/save/new marker');
}finally{await browser.close();}
