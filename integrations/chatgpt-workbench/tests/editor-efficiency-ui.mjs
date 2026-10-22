// Native browser regression for quick insertion, IME accounting, work-scoped phrases and PNG export.
// Isolated UI only: no RPC, novel data, cloud service or paid API.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const bundle=await build({stdin:{resolveDir:root,loader:'jsx',contents:`
 import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
 import {QuickInputBar,QuickInputSettings,useQuickPhrases} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/QuickInput.jsx';
 import {useWritingSession,WritingSpeed} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/WritingSession.jsx';
 import {LongImageExport} from './integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/LongImageExport.jsx';
 function App(){const [content,setContent]=useState('甲乙'),[book,setBook]=useState('a'),[enabled,setEnabled]=useState(true),[paired,setPaired]=useState(true),ref=useRef();const phrases=useQuickPhrases(book),speed=useWritingSession({scopeKey:'fixture',documentKey:'chapter',content,enabled:true});window.fixture={metrics:()=>speed.metrics,reset:()=>speed.reset(),content:()=>content};
 return <div className="cuigengji"><textarea aria-label="正文" ref={ref} defaultValue="甲乙" onCompositionStart={()=>speed.compositionStart()} onCompositionEnd={e=>speed.compositionEnd(e.target.value)} onChange={e=>{speed.record(e.target.value,{inputType:e.nativeEvent.inputType});setContent(e.target.value);}}/><QuickInputBar textareaRef={ref} phrases={phrases.phrases} paired={paired} hidden={!enabled} onInsert={(next,meta)=>{speed.record(next,{inputType:meta.inputType});setContent(next);}}/><WritingSpeed controller={speed} compact={false}/><output>{JSON.stringify(speed.metrics)}</output><button onClick={()=>setBook(book==='a'?'b':'a')}>切换作品</button><span data-book>{book}</span><QuickInputSettings {...phrases} enabled={enabled} onEnabledChange={setEnabled} paired={paired} onPairedChange={setPaired}/><LongImageExport title="测试章节" content={content+'\\n'+('　长图测试段落。'.repeat(40)+'\\n').repeat(20)} selectionText={content}/></div>;
 }createRoot(document.getElementById('root')).render(<App/>);
 `},bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}});
const server=createServer((req,res)=>{res.setHeader('content-type',req.url==='/bundle.js'?'text/javascript':'text/html');res.end(req.url==='/bundle.js'?bundle.outputFiles[0].contents:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:12px;font:14px sans-serif;--cg-paper:#fff;--cg-ink:#222;--cg-muted:#777;--cg-line:#ddd;--cg-wash:#f4f4f4;--cg-accent:#5063bb}textarea{box-sizing:border-box;width:100%;min-height:90px}button{cursor:pointer}output{display:block;overflow-wrap:anywhere}</style><div id="root"></div><script src="/bundle.js"></script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);const textarea=page.getByRole('textbox',{name:'正文',exact:true});await expect(textarea).toHaveValue('甲乙');
 await textarea.focus();await textarea.evaluate(el=>el.setSelectionRange(1,1));await page.getByRole('button',{name:'插入“”',exact:true}).click();await expect(textarea).toHaveValue('甲“”乙');assert.deepEqual(await textarea.evaluate(el=>[el.selectionStart,el.selectionEnd]),[2,2]);assert.equal((await page.evaluate(()=>fixture.metrics())).net,2);
 await page.keyboard.press('Control+z');await expect(textarea).toHaveValue('甲乙');assert.equal((await page.evaluate(()=>fixture.metrics())).net,0);
 await page.evaluate(()=>fixture.reset());
 await textarea.evaluate(el=>{el.focus();el.setSelectionRange(2,2);el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:''}));});
 const input=async(text,isComposing=true)=>textarea.evaluate((el,{text,isComposing})=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,text);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertCompositionText',data:text.slice(2),isComposing}));},{text,isComposing});
 await input('甲乙n');await page.waitForTimeout(20);await input('甲乙ni');await page.waitForTimeout(20);assert.equal((await page.evaluate(()=>fixture.metrics())).net,0);
 await input('甲乙你好');await textarea.evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'你好'})));await input('甲乙你好',false);await expect(textarea).toHaveValue('甲乙你好');assert.equal((await page.evaluate(()=>fixture.metrics())).net,2);
 const phrase=page.getByRole('textbox',{name:'快捷短语内容'});await phrase.fill('不见不散');await page.getByRole('button',{name:'添加短语',exact:true}).click();await expect(page.getByRole('button',{name:'编辑短语：不见不散'})).toBeVisible();
 await phrase.fill('来日方长');await page.getByRole('button',{name:'添加短语',exact:true}).click();await page.getByRole('button',{name:'上移短语 2'}).click();assert.equal(await page.locator('.phrase-label').first().innerText(),'来日方长');
 await page.getByRole('button',{name:'切换作品',exact:true}).click();await expect(page.locator('[data-book]')).toHaveText('b');await expect(page.locator('.phrase-label')).toHaveCount(0);await page.getByRole('button',{name:'切换作品',exact:true}).click();await expect(page.locator('.phrase-label')).toHaveCount(2);
 await page.getByRole('button',{name:'编辑短语：不见不散'}).click();await phrase.fill('后会有期');await page.getByRole('button',{name:'保存修改',exact:true}).click();await expect(page.getByRole('button',{name:'编辑短语：后会有期'})).toBeVisible();await page.getByRole('button',{name:'删除短语 2'}).click();await expect(page.locator('.phrase-label')).toHaveCount(1);
 await page.getByLabel('长图分享范围').selectOption('chapter');const before=await textarea.inputValue();await page.getByRole('button',{name:'生成预览',exact:true}).click();await expect(page.locator('.long-image-preview img')).toBeVisible();assert.equal(await textarea.inputValue(),before);const dimensions=await page.locator('.long-image-preview img').evaluate(el=>[el.naturalWidth,el.naturalHeight]);assert.equal(dimensions[0],1080);assert.ok(dimensions[1]<=3600);await expect(page.getByRole('button',{name:'下一张',exact:true})).toBeEnabled();await page.getByRole('button',{name:'下一张',exact:true}).click();await expect(page.getByRole('link',{name:'下载第 2 张',exact:true})).toBeVisible();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,checks:['paired punctuation caret and native undo','IME intermediate edits suppressed and final commit counted once','work-isolated phrase CRUD and reorder','paginated PNG dimensions and unchanged draft','390px no horizontal overflow']}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
