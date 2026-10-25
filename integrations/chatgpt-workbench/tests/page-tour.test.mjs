import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PAGE_TOUR_KEY,createTourPreference,pageTourSteps} from '../vendor/cuigengji/src/client/shared/page-tour.mjs';
const memory=()=>{const items=new Map();return {items,getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,value)};};
test('first successful creation claim is shared across mounts, skip and completion persist locally',()=>{
 const storage=memory(),a=createTourPreference(()=>storage);
 assert.equal(a.read(),null);assert.equal(a.claim(),true);assert.equal(a.claim(),false);
 const b=createTourPreference(()=>storage);assert.equal(b.claim(),false);b.save('skipped');assert.equal(a.read(),'skipped');
 b.save('completed');assert.equal(createTourPreference(()=>storage).read(),'completed');assert.deepEqual([...storage.items.keys()],[PAGE_TOUR_KEY]);
});
test('unavailable storage and malformed preferences cannot break a tour',()=>{
 const throwing=createTourPreference(()=>{throw Error('disabled');});assert.equal(throwing.claim(),true);assert.equal(throwing.claim(),false);throwing.save('completed');assert.equal(throwing.read(),'completed');
 const storage=memory();storage.setItem(PAGE_TOUR_KEY,'not-json');assert.equal(createTourPreference(()=>storage).claim(),true);
});
test('page stops match the actual navigation and disabled modules are not advertised',()=>{
 const minimal=pageTourSteps({timeline:false,foreshadow:false,evolution:false,overview:false});
 assert.deepEqual(minimal.map(s=>s.id),['detail','chapters','plan-canvas','plan-outline','memory','settings-entry','settings-menu','settings']);assert.doesNotMatch(minimal[2].body,/时间线/);assert.match(pageTourSteps({timeline:true}).find(s=>s.id==='plan-timeline').body,/叙述顺序.*故事时间/);
 assert.match(minimal.at(-1).body,/关闭/);assert.match(minimal.at(-1).body,/AI.*开发扩展/);
});
test('offer is tied to successful new-work creation, not opening or importing',async()=>{
 const source=await readFile(new URL('../vendor/cuigengji/src/client/index.tsx',import.meta.url),'utf8');
 const create=source.slice(source.indexOf('const create ='),source.indexOf('// An in-flight'));
 assert.ok(create.indexOf("await call('binding.set'")<create.indexOf('tourPreference.claim()'));
 assert.equal((source.match(/tourPreference.claim\(\)/g)||[]).length,1);
 assert.doesNotMatch(source.slice(source.indexOf('const openNovel='),source.indexOf('const openManagement=')),/tourPreference|setTour\(/);
 assert.match(source,/initialTab="modules" guide=\{guide\}/);
});
test('tour is scoped, non-modal, has real issue/PR links and uses native keyboard controls',async()=>{
 const component=await readFile(new URL('../vendor/cuigengji/src/client/shared/PageTour.tsx',import.meta.url),'utf8');
 assert.match(component,/<aside/);assert.doesNotMatch(component,/showModal|inert|\.click\(|dispatchEvent|call\(/);
 for(const text of ['上一步','下一步','跳过导览','完成导览','https://github.com/CF-612/MoJi/issues','https://github.com/CF-612/MoJi/pulls'])assert.ok(component.includes(text));
 const css=await readFile(new URL('../vendor/cuigengji/src/client/shared/page-tour-style.ts',import.meta.url),'utf8');assert.match(css,/@container/);assert.doesNotMatch(css,/@keyframes|animation:|position:fixed/);
});

test('empty chapter directory reuses the exact pale blue welcome asset/filter without another action',async()=>{
 const source=await readFile(new URL('../vendor/cuigengji/src/client/features/chapters/EmptyDirectory.tsx',import.meta.url),'utf8');
 const welcome=await readFile(new URL('../vendor/cuigengji/src/client/features/welcome/empty-style.ts',import.meta.url),'utf8');
 assert.ok(source.includes("import moji from '../../assets/moji.png'"));assert.match(source,/alt="蓝色烟灰蛸"/);
 const filter=welcome.match(/filter:([^;]+);/)[1];assert.ok(source.includes('filter:'+filter));assert.match(source,/opacity:\.18/);
 assert.doesNotMatch(source,/<button|onClick|call\(|localStorage/);assert.match(source,/还没有章节/);assert.match(source,/新建一章，开始你的故事/);
});

test('unselected prose placeholder is separate from an opened empty chapter and resource failures',async()=>{
 const source=await readFile(new URL('../vendor/cuigengji/src/client/features/chapters/index.jsx',import.meta.url),'utf8');
 assert.match(source,/id \? <ChapterLoader/);assert.match(source,/<ResourceState resource=\{resource\}><EmptyEditor hasChapters=\{live.length>0\}/);
 const empty=await readFile(new URL('../vendor/cuigengji/src/client/features/chapters/EmptyEditor.tsx',import.meta.url),'utf8');
 assert.match(empty,/尚未选择章节/);assert.match(empty,/从目录选择章节，开始写作/);assert.match(empty,/hasChapters/);assert.match(empty,/alt="蓝色烟灰蛸"/);assert.doesNotMatch(empty,/call\(|localStorage|textarea/);
});

test('canvas tour mounts never restore shared layout drafts or persist cameras',async()=>{
 const source=await readFile(new URL('../vendor/cuigengji/src/client/shared/graph.tsx',import.meta.url),'utf8');
 assert.match(source,/const saved=useRef\(transient\?null:readLocal/);assert.match(source,/transient\?previewQueue.current!:sharedLayoutQueue/);assert.match(source,/createLayoutQueue\(\{persist:/);assert.match(source,/rememberCamera=.*if\(transient\|\|tourTransition.current\)return/);
});
test('restart refuses to unmount an open inline editor',async()=>{
 const source=await readFile(new URL('../vendor/cuigengji/src/client/index.tsx',import.meta.url),'utf8');
 const start=source.slice(source.indexOf('const canTourTransition='),source.indexOf('const create ='));assert.match(start,/querySelector/);assert.match(start,/workbench-body form/);assert.match(start,/请先保存或取消当前编辑/);assert.ok(start.indexOf('return;}')<start.indexOf("setTour('detail')"));
});

test('planning preview visits each enabled subview without updating the saved view; fresh default is canvas',async()=>{
 const all=pageTourSteps({timeline:true,foreshadow:true});assert.deepEqual(all.filter(s=>s.area).map(s=>s.area),['canvas','outline','timeline','foreshadow']);
 const source=await readFile(new URL('../vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx',import.meta.url),'utf8');assert.match(source,/const area=tourArea\|\|savedArea/);assert.match(source,/if\(tourArea&&onTourArea\)/);
 const preferences=await readFile(new URL('../vendor/cuigengji/src/client/shared/preferences.tsx',import.meta.url),'utf8');assert.match(preferences,/directory: true, planningView: 'canvas'/);assert.match(preferences,/已有作品优先恢复上次视图/);
});
test('settings is reached through its real menu and final stop has no skip button',async()=>{
 const component=await readFile(new URL('../vendor/cuigengji/src/client/shared/PageTour.tsx',import.meta.url),'utf8');assert.match(component,/index!==steps.length-1&&<button/);
 const source=await readFile(new URL('../vendor/cuigengji/src/client/index.tsx',import.meta.url),'utf8');assert.match(source,/tourMenuGuide=\{tourMenu\?guide:null\}/);assert.match(source,/if\(tourMenu\|\|tourEntry\)setTour\('settings'\)/);
 const registry=await readFile(new URL('../vendor/cuigengji/src/client/modules/registry.mjs',import.meta.url),'utf8');assert.match(registry,/id:'pages',name:'多页画布'/);
});

test('standard profile includes dashboard without changing stored explicit flags',async()=>{const {profileModules,normalizeModules}=await import('../vendor/cuigengji/src/client/modules/registry.mjs');const standard=profileModules('standard');assert.equal(standard.overview,true);assert.equal(standard.timeline,true);assert.equal(standard.foreshadow,true);assert.equal(standard.pages,false);assert.equal(normalizeModules({overview:false}).overview,false);});

test('settings walkthrough has exactly one forward affordance: the real menu then Settings',async()=>{const component=await readFile(new URL('../vendor/cuigengji/src/client/shared/PageTour.tsx',import.meta.url),'utf8');assert.match(component,/!target&&<button type="button" className="primary"/);assert.match(component,/step\?\.id==='settings-entry'\?'\[aria-label="工作台更多功能"\]'/);assert.match(component,/step\?\.id==='settings-menu'\?'\.tool-sheet \[aria-label="设置"\]'/);assert.match(component,/querySelector\(target\)/);});

test('settings action stops use one concise instruction without a repeated paragraph',()=>{const steps=pageTourSteps({timeline:true,foreshadow:true});for(const [id,title] of [['settings-entry','点击顶部「⋯」。'],['settings-menu','点击「设置」。']]){const step=steps.find(s=>s.id===id);assert.equal(step.title,title);assert.equal(step.body,'');}});
