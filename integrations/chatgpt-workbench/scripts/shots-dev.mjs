// 本地预览截图：对 preview-dev 起的服务拍关键页面，用于施工前后对照。
// 用法：node scripts/shots-dev.mjs [端口]   （默认 4188，截图写到 .data/shots-dev/）
import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.argv[2]||process.env.MOJI_PREVIEW_PORT||4188);
const out=join(root,'.data','shots-dev');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
const errors=[];
const shot=async(page,name)=>{await page.waitForTimeout(340);await page.screenshot({path:join(out,`${name}.png`),fullPage:false});};
const nav=async(page,label)=>{
  const button=page.locator('.connected-nav button').filter({hasText:label});
  if(await button.count()){await button.first().click();await page.waitForTimeout(420);return true;}
  errors.push(`缺少导航项：${label}`);return false;
};
const openPlanning=async page=>{
  await page.getByRole('button',{name:'规划',exact:true}).click();
  await page.locator('.planning-workspace').waitFor();
  await page.waitForTimeout(500);
};

async function desktop(){
  const page=await browser.newPage({viewport:{width:1440,height:960}});
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(`desktop: ${e.message}`));
  await page.goto(`http://127.0.0.1:${port}/web`,{waitUntil:'networkidle'});
  await openPlanning(page);
  for(const [label,name] of [['画布','web-plan-canvas'],['大纲','web-plan-outline'],['时间线','web-plan-timeline'],['伏笔','web-plan-foreshadow']]){
    if(await nav(page,label))await shot(page,name);
  }
  if(await nav(page,'画布')){
    const card=page.locator('.scene-card').first();
    if(await card.count()){
      await card.click({button:'right'});
      await page.getByRole('button',{name:'打开内容',exact:true}).click().catch(()=>{});
      await page.waitForTimeout(500);
      await shot(page,'web-plan-detail');
      await page.getByLabel('关闭详情').click().catch(()=>{});
    }else errors.push('desktop: 画布上没有剧情卡片');
  }
  await page.close();
}

async function mobile(){
  const page=await browser.newPage({viewport:{width:390,height:820},isMobile:true,hasTouch:true});
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(`mobile: ${e.message}`));
  await page.goto(`http://127.0.0.1:${port}/live`,{waitUntil:'networkidle'});
  await openPlanning(page);
  for(const [label,name] of [['画布','mobile-plan-canvas'],['大纲','mobile-plan-outline'],['时间线','mobile-plan-timeline'],['伏笔','mobile-plan-foreshadow']]){
    if(await nav(page,label))await shot(page,name);
  }
  await page.close();
}

try{
  await desktop();
  await mobile();
  console.log(JSON.stringify({out,errors},null,2));
}catch(error){
  console.error('SHOT FAILED:',error.message,JSON.stringify(errors));
  process.exitCode=1;
}finally{
  await browser.close();
}
