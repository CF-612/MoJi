// Isolated real-component browser regression: no service, account, or network calls.
// node tests/ui-settings-layout.mjs [--fixture-only]
// Set PLAYWRIGHT_CHROMIUM_EXECUTABLE when Chromium is not in Playwright's cache.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=join(root,'.data/settings-layout');
await mkdir(out,{recursive:true});
const bundle=await build({stdin:{resolveDir:root,loader:'tsx',contents:`
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PreferencesProvider,PreferencesDialog} from './vendor/cuigengji/src/client/shared/preferences.tsx';
import {styles} from './vendor/cuigengji/src/client/style.ts';
function Fixture(){const [open,setOpen]=useState(false);return <PreferencesProvider><main className="cuigengji"><style>{styles}</style><button onClick={()=>setOpen(true)}>打开设置</button>{open&&<PreferencesDialog close={()=>setOpen(false)}/>}</main></PreferencesProvider>}
createRoot(document.getElementById('root')).render(<Fixture/>);
`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl','.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}});
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Settings layout regression</title><style>html,body,#root{height:100%;margin:0}body{font-family:system-ui}html{--cg-host-bottom:0px}</style></head><body><div id="root"></div><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
await writeFile(join(out,'fixture.html'),html);
if(process.argv.includes('--fixture-only')){console.log(join(out,'fixture.html'));process.exit(0);}
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
try{
 for(const {width,embedded} of [{width:320},{width:390},{width:600},{width:800},{width:1000},{width:1400,embedded:480},{width:1400,embedded:800}])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:820}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(({theme})=>{localStorage.setItem('cuigengji:workbench:preferences:v1',JSON.stringify({theme}));},{theme});
  await page.goto('https://settings.test/');
  await page.evaluate(({theme,width})=>{document.documentElement.dataset.theme=theme;document.documentElement.style.setProperty('--cg-visible-height','820px');document.documentElement.style.setProperty('--cg-host-bottom',width<=600?'84px':'0px');},{theme,width});
  if(embedded)await page.evaluate(embedded=>document.documentElement.style.setProperty('--cg-host-left',`${innerWidth-embedded}px`),embedded);
  await page.getByRole('button',{name:'打开设置',exact:true}).click();
  await page.getByRole('dialog',{name:'设置',exact:true}).waitFor();
  const layout=await page.evaluate(()=>{
   const box=selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right,client:el.clientWidth,scroll:el.scrollWidth};};
   return {head:box('.utility-head'),layout:box('.settings-layout'),main:box('.settings-main'),nav:box('.settings-nav'),button:box('.settings-nav button'),dialog:box('.settings-modal'),card:box('.settings-card'),panel:box('.settings-panels')};
  });
  assert.equal(await page.getByRole('searchbox').count(),0,'settings search is removed');
  assert.ok(layout.head.bottom<=layout.layout.y+1,'title directly precedes settings');
  assert.ok(layout.card.width>=220,'settings cards remain readable');
  assert.ok(layout.card.width>=layout.panel.width-64,'cards fill the available content instead of a 300px cap');
  assert.ok(layout.dialog.right<=width&&layout.dialog.bottom<=820-(width<=600?84:0),'dialog avoids host composer');
  if(layout.dialog.width>602){
   assert.ok(layout.nav.x<layout.main.x&&layout.nav.width>=180,'desktop keeps a sidebar');
   assert.ok(layout.button.height>=40&&layout.button.height<=44,'desktop categories stay compact');
   assert.ok(layout.button.y-layout.nav.y<20,'desktop navigation is top aligned');
  }else{
   assert.ok(layout.nav.bottom<=layout.main.y+1,'narrow dialog uses horizontal tabs even in a wide viewport');
   assert.ok(layout.button.height>=44,'mobile tabs retain touch targets');
  }
  assert.ok(layout.card.right<=layout.dialog.right,'no horizontal overflow');
  const gaps=await page.locator('.settings-panel:not([hidden])').evaluateAll(panels=>panels.slice(1).map((panel,index)=>panel.getBoundingClientRect().top-panels[index].getBoundingClientRect().bottom));
  assert.ok(gaps.every(gap=>gap>=12&&gap<=14),'visible settings groups have consistent card spacing');
  await page.locator('.settings-panels').evaluate(el=>el.scrollTop=el.scrollHeight);
  assert.ok(await page.locator('.settings-panels').evaluate(el=>el.scrollTop>0),'long settings content scrolls independently');
  await page.getByRole('button',{name:'正文与目录',exact:true}).click();
  await page.getByLabel('章节编号格式',{exact:true}).selectOption('arabic');
  await page.screenshot({path:join(out,`settings-${width}${embedded?`-embedded-${embedded}`:''}-${theme}.png`)});
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog',{name:'设置',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'打开设置');
  await page.getByRole('button',{name:'打开设置',exact:true}).click();
  await page.getByRole('button',{name:'正文与目录',exact:true}).click();
  assert.equal(await page.getByLabel('章节编号格式',{exact:true}).inputValue(),'arabic');
  await page.getByRole('button',{name:'功能模块',exact:true}).click();
  assert.ok(await page.getByRole('checkbox',{name:'显示伏笔',exact:true}).count());
  await page.getByRole('button',{name:'其他',exact:true}).click();
  await page.getByRole('button',{name:'界面与视图',exact:true}).click();
  await page.getByRole('radio',{name:'深色',exact:true}).click();
  assert.equal(await page.getByRole('radio',{name:'深色',exact:true}).getAttribute('aria-checked'),'true');
  await page.evaluate(()=>document.documentElement.style.setProperty('--cg-visible-height','480px'));
  const bottom=await page.locator('.settings-modal').evaluate(el=>el.getBoundingClientRect().bottom);
  assert.ok(bottom<=480-(width<=600?84:0),'keyboard shrink keeps the modal in the visible area');
  assert.deepEqual(errors,[]);
  await page.close();
  console.log(`PASS settings ${width}px embedded=${embedded||false} ${theme}: no search, compact/full-width tabs, scroll geometry, persistence, dismissal and keyboard`);
 }
}finally{await browser.close();}
