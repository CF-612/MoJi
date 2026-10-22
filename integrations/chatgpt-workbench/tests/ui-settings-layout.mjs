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
 for(const width of [320,390,600,1000])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:820}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(({theme})=>{localStorage.setItem('cuigengji:workbench:preferences:v1',JSON.stringify({theme}));},{theme});
  await page.goto('https://settings.test/');
  await page.evaluate(({theme,width})=>{document.documentElement.dataset.theme=theme;document.documentElement.style.setProperty('--cg-visible-height','820px');document.documentElement.style.setProperty('--cg-host-bottom',width<=600?'84px':'0px');},{theme,width});
  await page.getByRole('button',{name:'打开设置',exact:true}).click();
  await page.getByRole('dialog',{name:'设置',exact:true}).waitFor();
  const layout=await page.evaluate(()=>{
   const box=selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right,client:el.clientWidth,scroll:el.scrollWidth};};
   return {search:box('.settings-search'),input:box('.settings-search input'),layout:box('.settings-layout'),main:box('.settings-main'),nav:box('.settings-nav'),dialog:box('.settings-modal'),card:box('.settings-card')};
  });
  assert.ok(layout.search.bottom<=layout.layout.y+1,'search is a top row');
  assert.ok(layout.input.height>=39&&layout.input.height<=42,'search input stays compact');
  assert.ok(layout.search.width>=layout.layout.width-2,'search spans the dialog width');
  assert.ok(layout.main.width>width*0.55||width>=900,'mobile settings are not squeezed');
  assert.ok(layout.card.width>=220,'settings cards remain readable');
  assert.ok(layout.dialog.right<=width&&layout.dialog.bottom<=820-(width<=600?84:0),'dialog avoids host composer');
  if(width>=900)assert.ok(layout.nav.x<layout.main.x&&layout.nav.width>=180,'desktop keeps a sidebar');
  else assert.ok(layout.nav.bottom<=layout.main.y+1,'narrow dialog uses horizontal tabs');
  await page.getByRole('searchbox',{name:'搜索设置',exact:true}).fill('字号');
  await page.locator('[aria-label="设置搜索结果"]').getByRole('button').click();
  await page.getByLabel('默认正文字号',{exact:true}).selectOption('20');
  assert.equal(await page.getByRole('searchbox',{name:'搜索设置',exact:true}).inputValue(),'');
  await page.screenshot({path:join(out,`settings-${width}-${theme}.png`)});
  await page.getByRole('searchbox',{name:'搜索设置',exact:true}).fill('没有这一项');
  await page.getByText('没有匹配设置',{exact:true}).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog',{name:'设置',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'打开设置');
  await page.getByRole('button',{name:'打开设置',exact:true}).click();
  await page.getByRole('button',{name:'正文与目录',exact:true}).click();
  assert.equal(await page.getByLabel('默认正文字号',{exact:true}).inputValue(),'20');
  await page.evaluate(()=>document.documentElement.style.setProperty('--cg-visible-height','480px'));
  const bottom=await page.locator('.settings-modal').evaluate(el=>el.getBoundingClientRect().bottom);
  assert.ok(bottom<=480-(width<=600?84:0),'keyboard shrink keeps the modal in the visible area');
  assert.deepEqual(errors,[]);
  await page.close();
  console.log(`PASS settings ${width}px ${theme}: search, tabs, scroll geometry, persistence, dismissal and keyboard`);
 }
}finally{await browser.close();}
