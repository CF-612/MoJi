// Real DOM/React regression. --fixture-only prepares a CUA-reviewable page without launching Chromium.
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const root=resolve(new URL('../../../',import.meta.url).pathname),out=resolve(root,'artifacts/ui-outline-row');
const source=`import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{OutlineRow}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/OutlineRow.jsx';
import{isOutlineActionTarget}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/outline-row-interaction.mjs';
function App(){const[fold,setFold]=useState(false),[edits,setEdits]=useState(0),[actions,setActions]=useState(0);return <><OutlineRow volume fold={fold} hasChildren title="测试卷" onToggle={()=>setFold(v=>!v)} onEdit={()=>setEdits(v=>v+1)} data-testid="row"><span data-testid="title">测试卷</span><span data-testid="caret"><svg width="24" height="24"><path d="M8 4 L16 12 L8 20" stroke="currentColor" fill="none"/></svg></span><button data-testid="grip" onClick={()=>setActions(v=>v+1)}><span>拖动手柄</span></button><button data-testid="menu" onClick={()=>setActions(v=>v+1)}>操作</button></OutlineRow>{!fold&&<p data-testid="child">正文第一章</p>}<output data-testid="edits">{edits}</output><output data-testid="actions">{actions}</output></>}
createRoot(document.getElementById('root')).render(<App/>);
window.checkOutlineDOM=()=>{const row=document.querySelector('[data-testid=row]');const check=target=>isOutlineActionTarget({target,currentTarget:row});const checks={row:!check(row),title:!check(row.querySelector('[data-testid=title]')),svg:!check(row.querySelector('svg')),path:!check(row.querySelector('path')),grip:check(row.querySelector('[data-testid=grip] span')),menu:check(row.querySelector('[data-testid=menu]'))};return checks;};`;
const built=await build({stdin:{contents:source,loader:'jsx',resolveDir:root},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"production"'}});
const html=`<!doctype html><meta charset="utf-8"><title>Outline row real DOM regression</title><style>body{font:16px system-ui;padding:30px}[data-testid=row]{display:flex;align-items:center;gap:20px;padding:20px;background:#eaf3ff;border-radius:12px;cursor:pointer;touch-action:pan-y}output{display:block;margin:20px}</style><div id="root"></div><script>${built.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`;
await mkdir(out,{recursive:true});await writeFile(resolve(out,'fixture.html'),html);console.log(resolve(out,'fixture.html'));
if(process.argv.includes('--fixture-only'))process.exit(0);
const browser=await chromium.launch({headless:true});
try{const page=await browser.newPage();await page.setContent(html);await page.getByTestId('row').waitFor();
assert.ok(Object.values(await page.evaluate(()=>window.checkOutlineDOM())).every(Boolean),'real closest() distinguishes row itself, SVG descendants and nested action buttons');
await page.getByTestId('title').click();await page.waitForTimeout(350);assert.equal(await page.getByTestId('row').getAttribute('aria-expanded'),'false');
await page.getByTestId('caret').click();await page.waitForTimeout(350);assert.equal(await page.getByTestId('row').getAttribute('aria-expanded'),'true');
await page.getByTestId('title').dblclick();await page.waitForTimeout(350);assert.equal(await page.getByTestId('row').getAttribute('aria-expanded'),'true');assert.equal(await page.getByTestId('edits').textContent(),'1');
await page.getByTestId('title').click({button:'right'});assert.equal(await page.getByTestId('edits').textContent(),'2');
await page.getByTestId('menu').click();await page.waitForTimeout(350);assert.equal(await page.getByTestId('row').getAttribute('aria-expanded'),'true');assert.equal(await page.getByTestId('actions').textContent(),'1');
await page.getByTestId('row').focus();await page.keyboard.press('Space');assert.equal(await page.getByTestId('row').getAttribute('aria-expanded'),'false');await page.keyboard.press('F2');assert.equal(await page.getByTestId('edits').textContent(),'3');
console.log('Outline real DOM interactions passed');}finally{await browser.close();}
