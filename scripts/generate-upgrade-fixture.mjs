// Developer-only reproducible fixture. Use a git archive of the public commit
// recorded below, never a personal workspace or the private novel repository.
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdtemp, mkdir, copyFile, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';

const source = resolve(process.argv[2] || ''), output = resolve(process.argv[3] || 'tests/fixtures/public-0.3.13');
if (!process.argv[2]) throw new Error('Pass a checkout/archive of public commit 3edeccf59d95b590211f4a0f5cc61631f58636cf');
const {Store} = await import(pathToFileURL(join(source,'src/application/store.js')));
const parent = await mkdtemp(join(tmpdir(),'moji-public-fixture-')), root = join(parent,'data'), store = new Store(root), actor = {kind:'human',sessionId:'synthetic-upgrade-author'};
try {
  const book = await store.dispatch('novel.create',{title:'雾港 · 公开合成升级样例'},actor);
  const run = (action,args={}) => store.dispatch(action,{novelId:book.id,...args},actor);
  const volume = await run('volume.create',{title:'第一卷',order:0});
  await run('volume.create',{title:'尚未动笔',order:1});
  const chapter = await run('chapter.create',{volumeId:volume.id,title:'雨夜来信',content:'　　这完全是用于升级测试的合成正文。\n\n　　信使递来一封信。',requestId:'synthetic-chapter'});
  const updated = await run('chapter.update',{chapterId:chapter.id,expectedRevision:1,append:'\n\n　　第二版补上了封蜡的颜色。'});
  const recycled = await run('chapter.create',{title:'废弃草稿',content:'回收站里的旧构思也必须保留。'});
  await run('chapter.delete',{chapterId:recycled.id,expectedRevision:1,confirm:true});
  await run('binding.set',{chapterId:chapter.id,stage:'plan',goal:'测试迁移后的会话仍绑定原作品'});
  const group = await run('graph.group.create',{name:'码头人物',summary:'合成测试人物'});
  const person = await run('graph.create',{type:'character_card',name:'信使',groupId:group.id,summary:'传递消息',content:'完整的人物设定，用于测试来源引用。',sources:[{chapterId:chapter.id,revision:updated.revision}],factType:'fact',position:{x:-100,y:80}});
  const world = await run('graph.create',{type:'world_entry',name:'雾港',content:'世界规则：所有通行证都有编号。',position:{x:240,y:80}});
  await run('edge.create',{from:person.id,to:world.id,name:'居住',content:'关系说明必须保留。'});
  const preview = await run('tavern.preview',{json:{entries:[{comment:'旧灯塔',content:'酒馆导入原件测试。',enabled:true}]}});
  await run('tavern.import',{json:{entries:[{comment:'旧灯塔',content:'酒馆导入原件测试。',enabled:true}]},confirm:true,fingerprint:preview.fingerprint});
  await run('preset.set',{expectedRevision:0,preset:{name:'合成文风要求',enabled:true,blocks:[{identifier:'style',name:'文风',content:'动作推进，保留人物视角。',enabled:true},{identifier:'unused',name:'暂不启用',content:'这条原文也不能丢。',enabled:false}],raw:{synthetic:true,unrecognizedExtension:{keep:'保留'}}}});
  const groupPlan = await run('planning.group.create',{name:'讨论路线',requestId:'synthetic-plan-group'});
  await run('planning.apply',{requestId:'synthetic-plan',operations:[
    {op:'page.create',ref:'page',value:{name:'码头沙盘',summary:'三方讨论的局部页面'}},
    {op:'node.create',ref:'a',value:{pageId:'page',groupId:groupPlan.id,title:'收到信件',summary:'人物动机对齐',content:'完整事件正文。',status:'written',chapterRefs:[{chapterId:chapter.id,revision:2}],memoryRefs:[person.id],position:{x:0,y:100}}},
    {op:'node.create',ref:'b',value:{pageId:'page',groupId:groupPlan.id,title:'追查封蜡',summary:'下一步尚未采用',content:'保留备选推演。',position:{x:340,y:100}}},
    {op:'edge.create',value:{from:'a',to:'b'}},
    {op:'decoration.create',value:{pageId:'page',kind:'frame',title:'局部讨论',position:{x:-40,y:20},width:720,height:300,color:'sky',moveContents:true}},
    {op:'decoration.create',value:{pageId:'page',kind:'note',title:'未决问题',content:'信使是否知道封蜡的来历？',position:{x:340,y:420},color:'sand'}},
  ]});
  const other = await store.dispatch('novel.create',{title:'另一本已归档合成作品'},actor);
  await store.dispatch('chapter.create',{novelId:other.id,title:'独立内容',content:'另一部作品应不受影响。'},actor);
  const latestOther = await store.dispatch('novel.get',{novelId:other.id},actor);
  await store.dispatch('novel.archive',{novelId:other.id,expectedRevision:latestOther.revision,archived:true},actor);
  await mkdir(output,{recursive:true}); await copyFile(join(root,'store.json'),join(output,'store.json'));
  const bytes = await readFile(join(output,'store.json'));
  await writeFile(join(output,'provenance.json'),JSON.stringify({publicCommit:'3edeccf59d95b590211f4a0f5cc61631f58636cf',pluginVersion:'0.3.13',synthetic:true,sha256:createHash('sha256').update(bytes).digest('hex'),generationScript:'scripts/generate-upgrade-fixture.mjs'},null,2));
  console.log(JSON.stringify({output,bytes:bytes.length,synthetic:true}));
} finally {await rm(parent,{recursive:true,force:true});}
