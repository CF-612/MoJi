// Real-component regression fixture for the reported mobile bugs; all data is synthetic.
// node tests/ui-user-bugs.mjs --fixture-only (or omit flag to run Playwright)
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out=join(root,'.data/user-bugs');
await mkdir(out,{recursive:true});
const bundle=await build({stdin:{resolveDir:root,loader:'tsx',contents:`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{createHostLayout}from'./client/host-layout.mjs';
import{PreferencesProvider,PreferencesDialog,useWorkbenchPreferences}from'./vendor/cuigengji/src/client/shared/preferences.tsx';
import{DialogProvider}from'./vendor/cuigengji/src/client/dialog.tsx';
import{CollaborationContext}from'./vendor/cuigengji/src/client/shared/collaboration.tsx';
import{SessionScope}from'./vendor/cuigengji/src/client/shared/state.js';
import{styles}from'./vendor/cuigengji/src/client/style.ts';
import{Foreshadows}from'./vendor/cuigengji/src/client/features/planning/StoryForeshadows.jsx';
import{ChapterTools}from'./vendor/cuigengji/src/client/features/chapters/ChapterTools.jsx';
import{ChapterOperations}from'./vendor/cuigengji/src/client/features/chapters/ChapterOperations.jsx';
const chapter={id:'chapter-fixture',title:'第一章 雨后的信',revision:1,content:'雨停以后，街道安静下来。信封上留下了一枚徽记。'};
const cards=[{id:'card-fixture',title:'雨后的来信',chapterRefs:[{chapterId:chapter.id}]}];
let shadows=[{id:'shadow-fixture',title:'信封上的徽记',content:'后来会认出这枚徽记，牵出另一个故事。',revision:1,status:'planted',plotNodes:[{id:'node-fixture',kind:'plant',cardId:'card-fixture',note:'让线索第一次出现。',evidence:{chapterId:chapter.id,revision:1,evidence:'信封上留下了一枚徽记。'}}],evidence:[],resolution:'active'}];
window.fixtureCalls=[];
const applyHost=createHostLayout();
window.setFixtureHost=enabled=>{document.documentElement.dataset.hostMode=enabled?'fullscreen':'standalone';applyHost({platform:enabled?'mobile':'desktop',safeAreaInsets:{top:0,right:0,bottom:0,left:0}});};
window.setFixtureHost(false);
window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='fixture-host')window.setFixtureHost(event.data.enabled);});
const call=async(action,args={})=>{window.fixtureCalls.push({action,args});
 if(action==='writing.foreshadow.list')return shadows;
 if(action==='chapter.list')return [chapter];if(action==='chapter.get')return chapter;
 if(action==='writing.history.list')return [];
 if(action==='writing.prose.search'){await new Promise(r=>setTimeout(r,120));return {count:1,chapters:[{chapterId:chapter.id,title:chapter.title,revision:1,count:1,snippets:[{start:0,before:'',match:args.query,after:'……'}]}],fingerprint:'fixture-preview'};}
 if(action==='writing.prose.replace'){await new Promise(r=>setTimeout(r,120));return {count:1};}
 if(action==='story.foreshadow.save'){const index=shadows.findIndex(f=>f.id===args.id);if(index>=0)shadows=shadows.map((f,i)=>i===index?{...f,...args.value,revision:f.revision+1}:f);else shadows=[...shadows,{...args.value,id:'new-'+shadows.length,status:'planned',revision:1}];return {};}
 throw Error('Fixture does not implement '+action);
};
function Fixture(){const [settings,setSettings]=useState(false),[view,setView]=useState('foreshadow'),[notice,setNotice]=useState(''),{preferences:p,update}=useWorkbenchPreferences();
return <main className="cuigengji" style={{padding:0,display:'flex',flexDirection:'column',overflow:'hidden'}}><style>{styles}</style><style>{'.fixture-nav{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:10px;border-bottom:1px solid var(--cg-line);flex:none}.fixture-nav button{min-height:36px;font-size:12px}.fixture-notice{margin:0;padding:8px 14px;color:var(--cg-muted);font-size:12px}.fixture-manuscript{padding:22px;line-height:1.95;overflow:auto;flex:1;min-height:0}.fixture-manuscript h2{font-size:22px}'}</style>
<nav className="fixture-nav"><button onClick={()=>setView('foreshadow')}>伏笔页</button><button onClick={()=>setView('chapter')}>正文页</button><button onClick={()=>setSettings(true)}>打开设置</button><button onClick={()=>update({theme:p.theme==='dark'?'light':'dark'})}>切换{p.theme==='dark'?'浅色':'深色'}</button></nav>
{view==='foreshadow'?<Foreshadows call={call} novelId="fixture-book" busy={false} run={fn=>fn()} planningCards={cards} storyRevision={1} onChapter={()=>setNotice('已请求定位正文')} onPlanning={()=>setNotice('已请求打开剧情卡')}/>:<><header className="fixture-nav writing-toolbar"><span style={{flex:1}}>正文工具栏</span><ChapterTools busy={false} deleted={false} onMaterials={()=>setNotice('已打开本章资料')} onReview={()=>setNotice('已打开整理建议')} reference={{kind:'chapter',novelId:'fixture-book',id:chapter.id,title:chapter.title}} find={{call,novelId:'fixture-book',chapterId:chapter.id,prepare:async()=>{},applied:async()=>setNotice('替换已应用')}}><ChapterOperations icons chapter={chapter} busy={false} onRename={title=>setNotice('重命名：'+title)} onExport={()=>setNotice('已请求导出本章')} onHistory={()=>setNotice('已打开版本历史')} onRemove={()=>setNotice('已请求移入回收站')}/></ChapterTools></header><article className="fixture-manuscript"><h2>{chapter.title}</h2><p style={{fontSize:p.fontSize,lineHeight:p.leading}}>{chapter.content.repeat(10)}</p></article></>}
<p className="fixture-notice" role="status">{notice||'仅用于云端界面回归；演示数据不会访问或修改真实作品。'}</p>{settings&&<PreferencesDialog close={()=>setSettings(false)}/>}</main>}
createRoot(document.getElementById('root')).render(<SessionScope.Provider value="ui-bugs"><PreferencesProvider><DialogProvider><CollaborationContext.Provider value={async()=>{await new Promise(r=>setTimeout(r,100));return '测试引用已就绪';}}><Fixture/></CollaborationContext.Provider></DialogProvider></PreferencesProvider></SessionScope.Provider>);
`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl','.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"production"'},minify:true});
const template=await readFile(join(root,'client/workbench.html'),'utf8');
const html=template.replace('<title>墨叽 · 小说工作台</title>','<title>MoJi mobile regression</title>').replace('<!-- SCRIPT -->',()=>`<script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
await writeFile(join(out,'fixture.html'),html);
const review=`<!doctype html><meta charset="utf-8"><title>MoJi real component review</title><style>body{font:14px system-ui;margin:0;padding:12px;background:#dce3ed}nav{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center}button{padding:8px 12px}.device{position:relative;width:390px;max-width:100%;height:820px;border:1px solid #8796aa;border-radius:12px;overflow:hidden;background:white}iframe{display:block;border:0;width:100%;height:100%;background:white}.host-close{position:absolute;right:8px;top:8px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font:28px system-ui;color:white;background:#202624;box-shadow:0 2px 12px #0004;pointer-events:none}.host-reply{position:absolute;left:0;right:0;bottom:0;height:84px;box-sizing:border-box;background:#202624;padding:16px 12px;color:#b9c0bc;pointer-events:none}.host-reply span{display:block;border:1px solid #59635d;border-radius:28px;padding:13px 16px;font:16px system-ui}.host-overlay[hidden]{display:none}</style><nav><b>真实组件 / 合成数据</b><button onclick="device.style.width='320px'">320px</button><button onclick="device.style.width='390px'">390px</button><button onclick="device.style.width='600px'">600px</button><button onclick="device.style.width='1000px'">1000px</button><button onclick="device.style.height=device.style.height==='480px'?'820px':'480px'">切换键盘高度</button><button id="host-toggle" aria-pressed="false" onclick="toggleHost()">模拟 ChatGPT 固定遮挡：关</button></nav><div class="device" id="device"><iframe id="frame" title="墨叽回归页面"></iframe><div class="host-close host-overlay" hidden aria-label="模拟宿主关闭">×</div><div class="host-reply host-overlay" hidden aria-label="模拟宿主回复栏"><span>＋　回复 ChatGPT</span></div></div><script>frame.srcdoc=${JSON.stringify(html).replaceAll('</script','<\\/script')};let host=false;function toggleHost(){host=!host;document.querySelectorAll('.host-overlay').forEach(el=>el.hidden=!host);const button=document.getElementById('host-toggle');button.setAttribute('aria-pressed',String(host));button.textContent='模拟 ChatGPT 固定遮挡：'+(host?'开':'关');frame.contentWindow.postMessage({type:'fixture-host',enabled:host},'*');}frame.addEventListener('load',()=>{if(host)frame.contentWindow.postMessage({type:'fixture-host',enabled:host},'*');});</script>`;
await writeFile(join(out,'review.html'),review);
console.log(`Fixtures: ${join(out,'fixture.html')} and ${join(out,'review.html')}`);
if(process.argv.includes('--fixture-only'))process.exit(0);
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
try{
 for(const width of [320,390,600,1000])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:820}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(({theme})=>localStorage.setItem('cuigengji:workbench:preferences:v1',JSON.stringify({theme})),{theme});
  await page.goto('https://moji-ui.test/');
  await page.getByRole('button',{name:'展开伏笔 信封上的徽记',exact:true}).click();
  const card=page.locator('.sf-card');
  const colors=await card.evaluate(el=>({background:getComputedStyle(el).backgroundColor,title:getComputedStyle(el.querySelector('h3')).color}));
  assert.notEqual(colors.background,colors.title);
  if(theme==='dark')assert.notEqual(colors.background,'rgb(255, 255, 255)');
  assert.ok(await card.evaluate(el=>el.getBoundingClientRect().right<=innerWidth));
  await page.screenshot({path:join(out,`foreshadow-${width}-${theme}.png`)});
  await page.getByRole('button',{name:'＋ 添加节点',exact:true}).click();
  await page.getByRole('dialog',{name:'添加伏笔节点',exact:true}).waitFor();
  await page.getByLabel('关联剧情卡',{exact:true}).selectOption('card-fixture');
  await page.getByRole('button',{name:'确认正文',exact:true}).click();
  await page.getByLabel('依据章节',{exact:true}).selectOption('chapter-fixture');
  await page.getByLabel('引用原文',{exact:true}).fill('信封上留下了一枚徽记。');
  assert.equal(await page.getByRole('button',{name:'确认正文并保存',exact:true}).isEnabled(),true);
  await page.getByRole('button',{name:'先做计划',exact:true}).click();
  await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByRole('dialog',{name:'添加伏笔节点',exact:true}).waitFor({state:'hidden'});
  await page.getByRole('button',{name:'打开设置',exact:true}).click();
  const layout=await page.locator('.settings-modal').evaluate(el=>{const rect=s=>el.querySelector(s).getBoundingClientRect();return {searchBottom:rect('.settings-search').bottom,layoutTop:rect('.settings-layout').top,mainWidth:rect('.settings-main').width,inputHeight:rect('.settings-search input').height};});
  assert.ok(layout.searchBottom<=layout.layoutTop+1);assert.ok(layout.mainWidth>width*.55||width>=900);assert.ok(layout.inputHeight<=44);
  await page.getByRole('searchbox',{name:'搜索设置',exact:true}).fill('字号');
  await page.locator('[aria-label="设置搜索结果"]').getByRole('button').click();
  await page.getByLabel('默认正文字号',{exact:true}).selectOption('20');
  await page.screenshot({path:join(out,`settings-${width}-${theme}.png`)});
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'打开设置');
  await page.getByRole('button',{name:'正文页',exact:true}).click();
  const trigger=page.getByLabel('正文其他操作',{exact:true});await trigger.click();
  const dialog=page.getByRole('dialog',{name:'正文选项',exact:true});await dialog.waitFor();
  assert.equal(await dialog.locator('.chapter-tool-group').count(),3);
  assert.equal(await dialog.locator('button:has(svg)').count(),9);
  const geometry=await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return {right:r.right,bottom:r.bottom,top:r.top,height:r.height};});
  assert.ok(geometry.right<=width&&geometry.bottom<=820&&geometry.top>=0);
  if(width<=600)assert.ok(Math.abs(geometry.bottom-820)<2);
  await page.screenshot({path:join(out,`chapter-menu-${width}-${theme}.png`)});
  await page.getByRole('button',{name:'字体字号',exact:true}).click();
  await page.getByRole('slider',{name:'正文字号',exact:true}).fill('22');
  await page.getByRole('button',{name:'宽松',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'宽松',exact:true}).getAttribute('aria-pressed'),'true');
  await page.screenshot({path:join(out,`chapter-font-${width}-${theme}.png`)});
  await page.getByLabel('返回正文选项',{exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'字体字号');
  await page.getByRole('button',{name:'查找与替换',exact:true}).click();
  await page.getByLabel('查找原文',{exact:true}).fill('信封');
  await page.getByLabel('替换为',{exact:true}).fill('信件');
  await page.getByRole('button',{name:'预览匹配',exact:true}).click();
  await page.getByText('1 处 · 1 章',{exact:true}).waitFor();
  await page.screenshot({path:join(out,`chapter-find-${width}-${theme}.png`)});
  await page.evaluate(()=>{window.setFixtureHost(true);document.documentElement.style.setProperty('--cg-visible-height','480px');});
  assert.ok(await page.locator('.chapter-tool-sheet').evaluate(el=>el.getBoundingClientRect().bottom<=396&&el.getBoundingClientRect().top>=52),'find avoids both native host X and resized keyboard/composer');
  await page.evaluate(()=>window.setFixtureHost(false));
  await page.getByRole('button',{name:'确认替换全部匹配',exact:true}).click();
  await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>window.fixtureCalls.filter(c=>c.action==='writing.prose.replace').length),1);
  await trigger.click();await page.getByRole('button',{name:'字体字号',exact:true}).click();assert.equal(await page.getByRole('slider',{name:'正文字号',exact:true}).inputValue(),'22');
  await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
  await trigger.click();await page.getByRole('button',{name:'围绕此内容讨论',exact:true}).click();await page.getByText('测试引用已就绪',{exact:true}).waitFor();await page.keyboard.press('Escape');
  await trigger.click();await page.getByRole('button',{name:'版本历史',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);await page.getByText('已打开版本历史',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}px ${theme}: foreshadow, settings, chapter grid, typography, find/replace, focus, repeated navigation`);
 }
}finally{await browser.close();}
