import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {chromium,expect} from '@playwright/test';
import {openAuthorPage} from './helpers/navigation.mjs';

const root=resolve(import.meta.dirname,'..'),shots=join(root,'test-results','presets');
await mkdir(shots,{recursive:true});
const preview=spawn(process.execPath,['scripts/preview-workbench.mjs'],{cwd:root,stdio:['ignore','pipe','pipe']});
let browser;
try {
  const {url}=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(new Error('Preview timeout')),20000);preview.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview exit ${code}`));});preview.stdout.on('data',chunk=>{output+=chunk;const line=output.split('\n').find(line=>line.startsWith('{'));if(line){clearTimeout(timer);resolve(JSON.parse(line));}});});
  const call=async(action,args={})=>{const r=await fetch(new URL('/dispatch',url),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,args})});if(!r.ok)throw new Error(await r.text());return r.json();};
  const novelId=(await call('novel.list'))[0].id;
  browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1100,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  const enter=()=>openAuthorPage(page,'写作预设');
  await enter();
  const upload=async(raw)=>{if(!await page.getByLabel('导入文件',{exact:true}).isVisible())await page.getByRole('button',{name:'导入预设',exact:true}).click();await page.getByLabel('导入文件',{exact:true}).setInputFiles({name:'preset.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});await expect(page.getByRole('button',{name:'确认导入',exact:true})).toBeEnabled();if(await page.getByLabel('现有预设',{exact:true}).count())await page.getByLabel('现有预设',{exact:true}).selectOption('replace');};
  const parse=async()=>{await expect(page.getByRole('button',{name:'确认导入',exact:true})).toBeEnabled();await page.getByRole('button',{name:'确认导入',exact:true}).click();await expect(page.getByRole('heading',{name:'导入完成',exact:true})).toBeVisible();await page.getByRole('button',{name:'‹ 返回写作预设',exact:true}).click();await expect(page.getByRole('heading',{name:'写作预设',exact:true})).toBeVisible();};
  const newerNotice=page.getByText('已保存的预设有更新，当前草稿仍保留。可保存后核对，或在预设设置里读取最新版本。',{exact:true});
  const save=async()=>{await page.getByLabel('启用',{exact:true}).check();await page.getByRole('button',{name:'保存预设',exact:true}).click();await expect(page.getByRole('button',{name:'保存预设',exact:true})).toBeDisabled();await expect(newerNotice).toHaveCount(0);};
  const input={name:'规则忽略校验',prompts:[{identifier:'a',name:'宏与角色',role:'assistant',content:'请保持 {{char}} 的叙述视角。',injection_position:1,injection_trigger:['continue']},{identifier:'b',name:'停用条目',content:'不启用'},{identifier:'history',marker:true}],prompt_order:[{character_id:7,order:[{identifier:'b',enabled:true}]},{character_id:100001,order:[{identifier:'a',enabled:true},{identifier:'b',enabled:false},{identifier:'history',enabled:true}]}]};
  await upload(input);await expect(page.getByLabel('提示词排列')).toHaveValue('100001');await parse();await save();
  expect((await call('preset.read',{novelId})).content).toBe('请保持 {{char}} 的叙述视角。');
  expect((await call('preset.get',{novelId})).importFormat).toBe('chat-completion');
  await expect(page.getByText('旧版导入的停用状态已保留；重新导入原文件可按新的内容优先规则解析。',{exact:true})).toHaveCount(0);
  await expect(page.getByText('含酒馆宏或占位符：按原文保留，不执行替换；可在下方改成明确的写作要求。',{exact:true})).toBeVisible();
  await page.getByText('预设设置',{exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载原始文件（不含编辑）'}).click();const file=await download;expect(JSON.parse(await readFile(await file.path(),'utf8'))).toEqual(input);
  await page.screenshot({path:join(shots,'content-first.png')});
  const envelope={version:1,type:'full',data:{prompts:[{identifier:'a',content:'平缓叙事。',role:'user'}],prompt_order:[{identifier:'chatHistory',enabled:true},{identifier:'a',enabled:true}]}};
  await upload(envelope);await expect(page.getByLabel('提示词排列')).toHaveCount(0);await parse();await save();
  expect((await call('preset.read',{novelId})).content).toBe('平缓叙事。');
  await upload({name:'简单写作预设',content:'第三人称。',post_history:'避免说教。'});await parse();await save();
  expect((await call('preset.read',{novelId})).content).toBe('第三人称。\n\n避免说教。');
  await page.reload();await enter();expect((await call('preset.get',{novelId})).enabled).toBe(true);
  await upload({name:'空预设',content:''});await parse();await expect(page.getByText('当前没有可生效的提示词正文。请启用有内容的条目，或新增写作要求。',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'保存预设',exact:true})).toBeDisabled();expect((await call('preset.get',{novelId})).blocks[0].content).toBe('');
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:join(shots,'empty-narrow.png')});
  // Optional local official fixture from the pinned audit; never a network dependency.
  if(process.env.CG_OFFICIAL_PRESET){
    await page.setViewportSize({width:1100,height:900});const raw=JSON.parse(await readFile(process.env.CG_OFFICIAL_PRESET,'utf8'));
    await upload(raw);await parse();await save();const effective=await call('preset.read',{novelId});expect(effective.content.length).toBeGreaterThan(0);expect(effective.content).toContain(raw.prompts.find(p=>p.identifier==='main').content);
    await page.screenshot({path:join(shots,'official-preset.png')});
    console.log(JSON.stringify({officialPresetCharacters:effective.content.length}));
  }
  await page.setViewportSize({width:1100,height:900});
  await page.getByLabel('提示词内容',{exact:true}).fill('作者尚未保存的草稿。');
  const latest=await call('preset.get',{novelId});
  await call('preset.set',{novelId,expectedRevision:latest.revision,preset:{...latest,blocks:latest.blocks.map((block,i)=>i===0?{...block,content:'另一位作者的新要求。'}:block)}});
  await page.getByRole('button',{name:'刷新当前页面',exact:true}).click();
  await expect(newerNotice).toBeVisible();
  await expect(page.getByLabel('提示词内容',{exact:true})).toHaveValue('作者尚未保存的草稿。');
  expect(errors).toEqual([]);console.log(JSON.stringify({ok:true,checks:['actual JSON uploads: full preset, Prompt Manager, standalone system prompt','ordering, disabled items, ignored role/placement/trigger rules','literal macros, original download, persistence and zero-content notice','own save does not report a stale resource as newer; real concurrent updates keep the local draft']}));
} finally {await browser?.close();preview.kill();}
