// Synthetic mounted StoryTimeAxis regression: zero, first and grouped cards.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createServer} from 'node:http';
import {createStoryProjection,formatStoryDate} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
import {axisViewportOptions} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-view.mjs';
import {chromium,expect} from '@playwright/test';
const root=resolve(import.meta.dirname,'..');
const bundle=await build({alias:{react:resolve(root,'node_modules/react'),'react-dom':resolve(root,'node_modules/react-dom')},stdin:{resolveDir:root,loader:'jsx',contents:`
import React,{useState}from'react';import{createRoot}from'react-dom/client';
import{StoryTimeAxis}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryTimeAxis.jsx';
import{StoryPlacementEditor}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryAxisPanels.jsx';
import{unifiedStoryStyle}from'./integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/unified-story-style.mjs';
const coordinate=706258,axis={schemaVersion:1,calendar:{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor:{coordinate,label:'第一章 · 故事起点与非常长的中文名称用于验证窄屏不会撑开布局'.repeat(3)},coordinateUnit:'day',primaryTick:{unit:'year',step:1},legacyMode:'unmapped',tracks:[{id:'above',name:'上方轨道',color:'#778899',side:'above'},{id:'below',name:'下方轨道',color:'#aa8899',side:'below'}],markers:[]};
if(location.search.includes('custom'))axis.calendar={kind:'custom',name:'星历',era:'星纪',monthLengths:[30,30,30],visibility:{year:true,month:true,day:true}};function makeCards(count){return count===0?{draft:{id:'draft',title:'待安排的第一张剧情卡',revision:1,status:'selected',cast:[],time:{},points:[]}}:Object.fromEntries(Array.from({length:count},(_,i)=>{const id='c'+i;return[id,{id,title:'合成剧情卡 '+i,revision:1,status:'selected',cast:[],time:{story:{axisVersion:1,start:coordinate+i*10000,end:coordinate+i*10000+1,trackId:i%2?'below':'above',side:i%2?'below':'above',row:0}},points:[]}]}));}
function App(){const[cards,setCards]=useState(()=>makeCards(6)),[editing,setEditing]=useState(null);window.fixtureCards=cards;window.fixtureAxis=axis;const save=async op=>{window.saveCalls=(window.saveCalls||0)+1;if(op.type==='storyAxis.place')setCards(all=>({...all,[op.id]:{...all[op.id],time:{story:{...op,axisVersion:1}}}}));return true;};return <div className="cuigengji"><nav><button onClick={()=>setCards(makeCards(0))}>空时间轴</button><button onClick={()=>setCards(makeCards(1))}>首张剧情卡</button><button onClick={()=>setCards(makeCards(6))}>上下六张卡</button></nav><div className="unified-story area-timeline"><style>{unifiedStoryStyle}</style><StoryTimeAxis state={{revision:1,storyAxis:axis,cards,tracks:[]}} sources={{chapters:[],volumes:[]}} people={[]} relations={[]} relationClock={{setMode(){}}} novelId="synthetic-empty-axis" save={save} open={setEditing} onCreate={()=>{}} onMore={()=>{}}/>{editing&&<StoryPlacementEditor axis={axis} card={editing} close={()=>setEditing(null)} onSave={p=>save({type:'storyAxis.place',id:editing.id,...p})}/>}</div></div>};createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,write:false,format:'iife',loader:{'.png':'dataurl'}});
const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}.cuigengji{--cg-paper:#fff;--cg-ink:#213b56;--cg-muted:#52677d;--cg-line:#d2dfed;--cg-accent:#315e96;--cg-wash:#f4f7fb;height:100vh;display:flex;flex-direction:column}.cuigengji>nav{flex:none;padding:8px}.unified-story{min-height:0;flex:1}button,select{font:inherit;color:inherit;background:#fff;border:1px solid #d2dfed;border-radius:7px;padding:5px}button{cursor:pointer}nav button{margin-right:6px}</style><div id="root"></div><script>${bundle.outputFiles[0].text}</script>`;
await mkdir(resolve(root,'artifacts/story-playhead'),{recursive:true});await writeFile(resolve(root,'artifacts/story-playhead/index.html'),html);
if(process.argv.includes('--fixture-only')){console.log('artifacts/story-playhead/index.html');process.exit(0);}
const server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium'});
try{const page=await browser.newPage({viewport:{width:900,height:844}});
for(const custom of [false,true]){
 await page.goto(`http://127.0.0.1:${server.address().port}/${custom?'?custom':''}`);
 const slider=page.getByRole('slider',{name:'当前故事时间'});await expect(slider).toHaveAttribute('aria-valuenow','706258');
 const original=await page.evaluate(()=>JSON.stringify({cards:window.fixtureCards,axis:window.fixtureAxis}));
 const axis=await page.evaluate(()=>window.fixtureAxis);
 for(const zoom of [0,1]){
  if(zoom)await page.getByRole('button',{name:'放大故事时间',exact:true}).click();
  const p=createStoryProjection([axis.anchor.coordinate,...Array.from({length:6},(_,i)=>[706258+i*10000,706259+i*10000]).flat()],axisViewportOptions(axis,zoom,await page.locator('.sa-viewport').evaluate(el=>el.clientWidth)));
  for(const segment of [p.segments[0],p.segments.find(s=>s.folded),p.segments[2]]){
   await slider.focus();await page.keyboard.press('Home');await page.evaluate(()=>new Promise(requestAnimationFrame));
   const box=await slider.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   const localX=segment.x+segment.width*.7;
   await page.locator('.sa-viewport').evaluate((el,x)=>el.scrollLeft=Math.max(0,x-220),localX+64);
   const geometry=await page.locator('.sa-viewport').evaluate(el=>({left:el.getBoundingClientRect().left,scroll:el.scrollLeft}));
   const x=geometry.left+localX+64-geometry.scroll;
   await page.mouse.move(x,box.y+box.height/2,{steps:4});await page.mouse.up();
   const expected=p.xToTime(x-geometry.left+geometry.scroll-64);
   await expect(slider).toHaveAttribute('aria-valuenow',String(expected));await expect(slider).toHaveAttribute('aria-valuetext',formatStoryDate(expected,axis.calendar));
   await expect(page.locator('.sa-playhead-date')).toHaveText('当前时间 · '+formatStoryDate(expected,axis.calendar));
  }
 }
 await slider.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await expect(slider).toHaveAttribute('aria-valuenow','706259');await page.keyboard.press('-');await expect(slider).toHaveAttribute('aria-valuenow','706258');
 // Cancellation must leave the next pan/playhead gesture usable.
 await slider.dispatchEvent('pointerdown',{pointerId:81,pointerType:'touch',button:0,clientX:200,clientY:100});await slider.dispatchEvent('pointercancel',{pointerId:81,pointerType:'touch'});await page.keyboard.press('ArrowRight');await expect(slider).toHaveAttribute('aria-valuenow','706259');
 assert.equal(await page.evaluate(()=>window.saveCalls||0),0);assert.equal(await page.evaluate(()=>JSON.stringify({cards:window.fixtureCards,axis:window.fixtureAxis})),original);
 console.log('PASS current-time playhead: zoom/scroll/folded mapping, calendar label, keyboard, cancellation and no mutation',custom?'custom':'gregorian');
}
}finally{await browser.close();await new Promise(r=>server.close(r));}
