import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export async function reviewScenarios({browser,url,call,novelId,first,shots}){
 const results=[];
 const planningPage=await call('planning.page.create',{novelId,name:'复查页面',requestId:crypto.randomUUID()});
 const made=await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:'隔离复查夹具',operations:[{op:'node.create',ref:'plan',value:{title:'复查规划卡',position:{x:40,y:60}}},{op:'node.create',ref:'peer',value:{title:'复查相邻卡',position:{x:340,y:60}}},{op:'edge.create',ref:'link',value:{from:'plan',to:'peer',type:'next'}}]});
 const nodeId=made.mapping.plan;
 const fresh=async(prefs={},ui={})=>{
  const p=await browser.newPage({viewport:{width:430,height:900}});p.setDefaultTimeout(4000);
  await p.addInitScript(({prefs,ui,novelId})=>{localStorage.setItem('cuigengji:workbench:preferences:v1',JSON.stringify({theme:'light',...prefs}));for(const [k,v]of Object.entries(ui))localStorage.setItem(`cuigengji:ui:native:mobile:${novelId}:${k}`,JSON.stringify(v));},{prefs,ui,novelId});
  return p;
 };
 const scenario=async(id,fn)=>{let p;try{p=await fn();results.push({id,pass:true});}catch(e){results.push({id,pass:false,error:e.message.split('\n').slice(0,7).join('\n')});}finally{if(p)await p.close();}console.log(JSON.stringify(results.at(-1)));};
 const open=async(p,tab)=>{await p.goto(url);await p.getByRole('button',{name:tab,exact:true}).click();};
 const newPlan=async p=>{await p.getByLabel('新建规划内容',{exact:true}).click();await p.getByRole('button',{name:'规划卡片',exact:true}).click();await p.getByLabel('情节标题',{exact:true}).waitFor();};
 await scenario('1 保存失败后可修改、重试最新内容，关闭后草稿可找回',async()=>{
  const p=await fresh();await open(p,'规划');await p.locator('.track-scroll').waitFor();await newPlan(p);
  await p.getByLabel('情节标题',{exact:true}).fill('复查失败草稿');let attempts=0;const requests=[];
  await p.route('**/dispatch',async route=>{const data=route.request().postDataJSON();if(data.action==='planning.apply'&&data.args.reason==='新建规划'){requests.push(data.args);if(++attempts<=2){await route.fulfill({status:400,json:{error:'复查模拟网络失败'}});return;}}await route.continue();});
  await p.locator('.canvas-draft').getByRole('button',{name:'创建',exact:true}).click();await p.locator('.draft-error').waitFor();
  assert.equal(await p.getByLabel('情节标题',{exact:true}).isEnabled(),true,'失败后表单仍锁死');
  await p.locator('.canvas-draft').getByRole('button',{name:'重试保存',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.draft-error')&&!document.querySelector('.canvas-draft input').disabled);assert.equal(requests[0].requestId,requests[1].requestId);await p.getByLabel('情节标题',{exact:true}).fill('复查修改后重试');
  await p.locator('.canvas-draft').getByRole('button',{name:/创建|重试保存/}).click();await p.locator('.canvas-draft').waitFor({state:'detached'});const list=await call('planning.list',{novelId});assert.ok(list.items.some(n=>n.title==='复查修改后重试'));assert.notEqual(requests[1].requestId,requests[2].requestId);await newPlan(p);await p.getByLabel('情节标题',{exact:true}).fill('关闭后找回的草稿');await p.locator('.canvas-draft').getByRole('button',{name:'取消',exact:true}).click();await newPlan(p);assert.equal(await p.getByLabel('情节标题',{exact:true}).inputValue(),'关闭后找回的草稿');return p;
 });
 await scenario('3 已有规划可以跨页面移动且保留连线事务校验',async()=>{
  const p=await fresh({modules:{pages:true}},{'planning-area':'scenes','planning-selected':nodeId});await open(p,'规划');await p.getByRole('button',{name:'编辑规划',exact:true}).click();await p.getByLabel('规划所属页面',{exact:true}).selectOption(planningPage.id);const confirm=p.getByRole('dialog').filter({hasText:'条跨页连线'});await confirm.getByRole('button',{name:'取消',exact:true}).click();assert.equal((await call('planning.get',{novelId,nodeId})).node.pageId,null);await p.getByLabel('规划所属页面',{exact:true}).selectOption(planningPage.id);await confirm.getByRole('button',{name:'确定',exact:true}).click();await p.waitForTimeout(350);const node=(await call('planning.get',{novelId,nodeId})).node;assert.equal(node.pageId,planningPage.id);assert.equal((await call('planning.get',{novelId,nodeId:made.mapping.peer})).node.pageId,null);assert.equal((await call('planning.list',{novelId})).edges.length,0);return p;
 });
 await scenario('4A 事件新建请求消费后切回时间线不再弹出',async()=>{
  const p=await fresh();await open(p,'规划');await p.locator('.track-scroll').waitFor();await p.getByLabel('新建规划内容',{exact:true}).click();await p.getByRole('button',{name:'事件',exact:true}).click();await p.getByRole('dialog',{name:'新建事件',exact:true}).waitFor();await p.getByLabel('关闭新建事件',{exact:true}).click();await p.getByRole('button',{name:'画布',exact:true}).click();await p.locator('.planning-canvas').waitFor();await p.getByRole('button',{name:'时间线',exact:true}).click();await p.locator('.track-scroll').waitFor();await p.waitForTimeout(150);assert.equal(await p.getByRole('dialog',{name:'新建事件',exact:true}).count(),0);return p;
 });
 await scenario('4C 伏笔新建请求消费后切回不再弹出',async()=>{const p=await fresh();await open(p,'规划');await p.locator('.track-scroll').waitFor();await p.getByLabel('新建规划内容',{exact:true}).click();await p.getByRole('button',{name:'伏笔',exact:true}).click();await p.getByRole('dialog',{name:'新建伏笔',exact:true}).waitFor();await p.getByLabel('关闭新建伏笔',{exact:true}).click();await p.getByRole('button',{name:'画布',exact:true}).click();await p.locator('.planning-canvas').waitFor();await p.getByRole('button',{name:'时间线',exact:true}).click();await p.locator('.track-scroll').waitFor();assert.equal(await p.getByRole('dialog',{name:'新建伏笔',exact:true}).count(),0);await p.getByLabel('工作台更多功能',{exact:true}).click();await p.getByRole('button',{name:'设置',exact:true}).click();await p.getByRole('checkbox',{name:'显示时间线',exact:true}).uncheck();await p.getByLabel('关闭设置',{exact:true}).click();assert.equal(await p.getByRole('dialog',{name:'新建伏笔',exact:true}).count(),0);return p;});
 await scenario('4B 目录历史请求消费后切章不重开',async()=>{
  const p=await fresh();await open(p,'正文');await p.locator('.chapter-item').first().click({button:'right'});await p.getByRole('button',{name:'版本历史',exact:true}).click();await p.getByRole('button',{name:'关闭历史',exact:true}).click();await p.getByRole('button',{name:'目录',exact:true}).click();await p.locator('.chapter-open').nth(1).click();await p.getByRole('textbox',{name:'正文',exact:true}).waitFor();await p.getByRole('button',{name:'目录',exact:true}).click();await p.locator('.chapter-open').first().click();await p.getByRole('textbox',{name:'正文',exact:true}).waitFor();await p.waitForTimeout(150);assert.equal(await p.getByRole('button',{name:'关闭历史',exact:true}).count(),0);return p;
 });
 await scenario('5 正文中被其他端删除的章节可以恢复',async()=>{
  const c=await call('chapter.create',{novelId,title:'复查恢复章',content:'恢复后保留正文'});const p=await fresh({}, {chapter:c.id});await open(p,'正文');await p.getByRole('textbox',{name:'正文',exact:true}).waitFor();await call('chapter.delete',{novelId,chapterId:c.id,expectedRevision:c.revision,confirm:true,requestId:crypto.randomUUID()});await p.getByText('本章已移入回收站。可从目录的回收站恢复。',{exact:true}).waitFor({timeout:12000});await p.getByLabel('正文其他操作',{exact:true}).click();await p.getByRole('button',{name:'恢复章节',exact:true}).click();await p.waitForTimeout(300);assert.equal((await call('chapter.get',{novelId,chapterId:c.id})).deleted,false);return p;
 });
 await scenario('6 时间线关闭时可从正文打开已有伏笔',async()=>{
  const p=await fresh({modules:{timeline:false,evolution:false,foreshadow:true}},{chapter:first.id});await open(p,'正文');await p.getByRole('button',{name:'信封上的徽记 计划回收'}).click();await p.getByRole('dialog',{name:'编辑伏笔',exact:true}).waitFor();return p;
 });
 await scenario('7 切换编号后目录按可见标题搜索',async()=>{
  const p=await fresh({numbering:'arabic'});await open(p,'正文');await p.locator('.chapter-open').first().waitFor();await p.getByRole('textbox',{name:'搜索章节',exact:true}).fill('第1章');assert.equal(await p.locator('.chapter-open').count(),1);return p;
 });
 await scenario('7B 规划关联正文按显示章号查找',async()=>{const p=await fresh({numbering:'arabic'},{'planning-area':'scenes','planning-selected':nodeId});await open(p,'规划');await p.getByRole('button',{name:'编辑规划',exact:true}).click();await p.getByText('关联正文与人物设定',{exact:true}).click();await p.getByLabel('筛选关联资料',{exact:true}).fill('第1章');await p.getByRole('button',{name:'打开',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'打开',exact:true}).count(),1);return p;});
 await scenario('8 重命名直接确认不重写显示格式',async()=>{
  const c=await call('chapter.create',{novelId,title:'第21章 编号原文'});const p=await fresh({numbering:'chinese'},{chapter:c.id});await open(p,'正文');await p.getByRole('textbox',{name:'正文',exact:true}).waitFor();await p.getByLabel('正文其他操作',{exact:true}).click();await p.getByRole('button',{name:'重命名',exact:true}).click();await p.getByRole('dialog',{name:'章节标题',exact:true}).getByRole('button',{name:'确定',exact:true}).click();await p.waitForTimeout(1900);assert.equal((await call('chapter.get',{novelId,chapterId:c.id})).title,'第21章 编号原文');await p.getByRole('button',{name:'目录',exact:true}).click();await p.locator('.chapter-item').filter({hasText:'第二十一章 编号原文'}).click({button:'right'});await p.getByRole('button',{name:'重命名',exact:true}).click();await p.getByRole('dialog',{name:'章节标题',exact:true}).getByRole('button',{name:'确定',exact:true}).click();await p.waitForTimeout(250);const same=await call('chapter.get',{novelId,chapterId:c.id});assert.equal(same.title,c.title);assert.equal(same.revision,c.revision);return p;
 });
 await scenario('9 分组关闭时画布不提供分组移动，开启后恢复',async()=>{
  const p=await fresh({modules:{groups:false,pages:false}},{'planning-area':'scenes'});await open(p,'规划');await p.locator('.scene-card').first().dispatchEvent('contextmenu',{clientX:180,clientY:260});await p.getByRole('menu',{name:'画布操作',exact:true}).waitFor();assert.equal(await p.getByRole('menuitem',{name:'移入分组',exact:true}).count(),0);assert.equal(await p.getByLabel('移动选中卡片',{exact:true}).count(),0);return p;
 });
 await scenario('9B 分组开启后画布恢复移动入口',async()=>{const p=await fresh({modules:{groups:true,pages:false}},{'planning-area':'scenes'});await open(p,'规划');await p.locator('.scene-card').first().dispatchEvent('contextmenu',{clientX:180,clientY:260});await p.getByRole('menuitem',{name:'移入分组',exact:true}).waitFor();return p;});
 await scenario('10A 目录首次加载期间不能用空列表生成重复章号',async()=>{
  const p=await fresh();await p.route('**/dispatch',async route=>{const data=route.request().postDataJSON();if(data.action==='chapter.list')await new Promise(r=>setTimeout(r,1000));await route.continue();});await open(p,'正文');await p.getByRole('button',{name:'新建章节',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'新建章节',exact:true}).isEnabled(),false);await p.getByRole('button',{name:'新建章节',exact:true}).waitFor({state:'visible'});return p;
 });
 await scenario('10B 目录慢加载时移除当前正文使用实际章节而非空目录',async()=>{const c=await call('chapter.create',{novelId,title:'复查慢目录删除',content:'保留可恢复内容'}),p=await fresh({}, {chapter:c.id});await p.route('**/dispatch',async route=>{const d=route.request().postDataJSON();if(d.action==='chapter.list')await new Promise(r=>setTimeout(r,1700));await route.continue();});await open(p,'正文');await p.getByRole('textbox',{name:'正文',exact:true}).waitFor();await p.getByLabel('正文其他操作',{exact:true}).click();await p.getByRole('button',{name:'移入回收站',exact:true}).click();for(let i=0;i<30;i++){if((await call('chapter.get',{novelId,chapterId:c.id})).deleted)break;await p.waitForTimeout(50);}assert.equal((await call('chapter.get',{novelId,chapterId:c.id})).deleted,true);return p;});
 await writeFile(join(shots,'review-result.json'),JSON.stringify(results,null,2));assert.ok(results.every(r=>r.pass),JSON.stringify(results.filter(r=>!r.pass),null,2));
}
