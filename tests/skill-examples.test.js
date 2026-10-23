import {testCredentials} from './helpers/credentials.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {apply} from '../src/index.js';
import {TOOL_ACTIONS} from '../src/contracts/actions.js';
import {planningArgsSchema} from '../src/adapters/dsh/planning-schema.js';

const examples = {};
for (const skill of ['plan','memory','write']) {
  const text = await readFile(new URL(`../skills/moji-${skill}/SKILL.md`, import.meta.url), 'utf8');
  examples[skill] = [...text.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(match => JSON.parse(match[1]));
}

async function fixture(t, {independentPage = false} = {}) {
  const root = await mkdtemp(join(tmpdir(), 'moji-skill-example-'));
  const tools = new Map(), effects = [];
  const ctx = {credentials:testCredentials(),tools:{register:tool=>tools.set(tool.name,tool)}, skills:{register(){}},
    connection:{fetch:{register(){}}}, on(){}, effect:fn=>effects.push(fn()),
    provide:(key,value)=>{ctx[key]=value;}};
  t.after(async()=>{for(const dispose of effects)await dispose();await rm(root,{recursive:true,force:true});});
  await apply(ctx,{dataRoot:root});
  const actor = {kind:'human',sessionId:'skill-reader'};
  const seed = (action,args={}) => ctx.cuigengji.dispatch(action,args,actor);
  const novel=await seed('novel.create',{title:'共享写作示例'});
  await seed('binding.set',{novelId:novel.id});
  const chapter=await seed('chapter.create',{title:'发现假账',content:'她发现账本被改过。她立刻赶往码头。书铺由来客经营。'});
  const character=await seed('graph.create',{type:'character_card',name:'来客',aliases:['夜间店主'],content:'她继承了母亲留下的书铺。',knownBy:[]});
  const place=await seed('graph.create',{type:'world_entry',name:'夜间书铺',content:'旧址仍有灯火。'});
  const memoryGroup=await seed('graph.group.create',{name:'雨城'});
  let story=await seed('story.get');
  const change=async operation=>(story=await seed('story.apply',{expectedRevision:story.state.revision,requestId:crypto.randomUUID(),operation}));
  if(independentPage)await change({type:'page.create',name:'假账推演'});
  const scenePage=story.state.pages.at(-1).id;
  await change({type:'card.create',pageId:scenePage,position:{x:60,y:90},value:{title:'发现假账',content:'留存可疑账册。'}});
  const start=Object.keys(story.state.cards)[0];
  await change({type:'card.create',pageId:scenePage,value:{title:'追查码头',content:'确认目的地后出发。'}});
  const end=Object.keys(story.state.cards).find(id=>id!==start);
  await change({type:'precedence',from:'card:'+start,to:'card:'+end});
  const ids={CARD_ID:start,NEXT_CARD_ID:end,CHARACTER_ID:character.id,PLACE_ID:place.id,
    MEMORY_GROUP_ID:memoryGroup.id,CHAPTER_ID:chapter.id,PAGE_ID:scenePage};
  let callId=0;
  const invoke=async(action,args={})=>{
    const entry=Object.entries(TOOL_ACTIONS).find(([,actions])=>actions.includes(action));
    assert.ok(entry,`Documented action must exist: ${action}`);
    return JSON.parse(await tools.get(entry[0]).execute({action,args},{agent:{id:actor.sessionId},callId:`example-${++callId}`,signal:new AbortController().signal}));
  };
  const expand = value => typeof value==='string'?(Object.hasOwn(ids,value)?ids[value]:value.startsWith('card:')&&ids[value.slice(5)]?'card:'+ids[value.slice(5)]:value):Array.isArray(value)?value.map(expand)
    :value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,expand(item)])):value;
  const execute=example=>{const input=expand(example);return invoke(input.action,input.args);};
  return {ids,invoke,execute,seed,planTool:(action,args={})=>tools.get('moji_plan').execute({action,args},{agent:{id:actor.sessionId},callId:`blocked-${++callId}`,signal:new AbortController().signal})};
}

test('all planning skill examples execute and retry through actual host tools',async t=>{
  assert.equal(examples.plan.length,4);
  for(const example of examples.plan)await t.test(example.args.requestId||'read workspace',async t=>{
    const {ids,invoke,execute}=await fixture(t);
    const before=await invoke('story.get');
    const request=structuredClone(example);
    if(request.action==='story.apply')request.args.expectedRevision=before.state.revision;
    const result=await execute(request);
    assert.deepEqual(await execute(request),result,'an identical retry must not duplicate cards or relations');
    const current=await invoke('story.get');
    assert.deepEqual(current.state.pages[0].instances['card:'+ids.CARD_ID],before.state.pages[0].instances['card:'+ids.CARD_ID],'preserve author layout');
    if(request.args.operation?.type==='card.update'){
      assert.equal(Object.keys(current.state.cards).length,2);
      assert.equal(current.state.cards[ids.CARD_ID].revision,2);
      assert.equal(current.state.cards[ids.CARD_ID].summary,request.args.operation.value.summary);
      await assert.rejects(execute({...request,args:{...request.args,requestId:'stale-update'}}),/已有更新/);
    }else if(request.args.operation?.type==='card.create'){
      assert.equal(Object.keys(current.state.cards).length,3);
      const created=Object.values(current.state.cards).find(c=>!before.state.cards[c.id]);
      assert.equal(created.status,'idea');assert.deepEqual(created.evidence,[]);
      assert.deepEqual(current.state.pages[0].instances['card:'+created.id],{x:100,y:120,revision:1});
    }else if(request.args.operation?.type==='precedence')assert.deepEqual(current.state.precedence,before.state.precedence,'existing edge not duplicated');
  });
});

test('setting skill examples preserve fields, move atomically and attach real sources over MCP',async t=>{
  assert.equal(examples.memory.length,3);
  for(const [index,example] of examples.memory.entries())await t.test(`example ${index+1}`,async t=>{
    const {ids,invoke,execute}=await fixture(t);
    const result=await execute(example);
    assert.deepEqual(await execute(example),result);
    if(index===0){
      const node=await invoke('graph.get',{nodeId:ids.CHARACTER_ID});
      assert.deepEqual(node.aliases,['夜间店主']);
      assert.equal(node.revision,2);
      assert.equal((await invoke('graph.list')).length,2);
      assert.equal(node.factType,'fact');
      assert.ok(node.content.includes('她继承了母亲留下的书铺。'));
      assert.deepEqual(node.sources,[],'author-defined settings need no fabricated chapter evidence');
    }else if(index===1){
      const members=await invoke('graph.list',{groupId:ids.MEMORY_GROUP_ID});
      assert.equal(members.length,2);
      assert.equal((await invoke('graph.get',{nodeId:ids.CHARACTER_ID})).content,'她继承了母亲留下的书铺。');
      await assert.rejects(invoke('graph.move',{groupId:null,members:[{id:ids.CHARACTER_ID,expectedRevision:2},{id:ids.PLACE_ID,expectedRevision:1}],requestId:'stale-member'}),/已经变化/);
      assert.equal((await invoke('graph.list',{groupId:ids.MEMORY_GROUP_ID})).length,2);
    }else{
      assert.equal(result.from,ids.CHARACTER_ID);
      assert.equal(result.to,ids.PLACE_ID);
      assert.deepEqual(result.sources,[{chapterId:ids.CHAPTER_ID,revision:1}]);
      await invoke('chapter.update',{chapterId:ids.CHAPTER_ID,expectedRevision:1,append:'后来书铺换了店主。'});
      assert.equal((await invoke('edge.get',{edgeId:result.id})).status,'stale');
      await assert.rejects(invoke('edge.update',{edgeId:result.id,expectedRevision:2,status:'active'}),/来源正文或依赖记忆已变化/);
    }
  });
});

test('writing skill patch preserves surrounding prose and feeds saved revisions into planning',async t=>{
  assert.equal(examples.write.length,1);
  const {ids,invoke,execute}=await fixture(t);
  const result=await execute(examples.write[0]);
  assert.equal(result.revision,2);
  const chapter=await invoke('chapter.get',{chapterId:ids.CHAPTER_ID});
  assert.equal(chapter.content,`她发现账本被改过。${examples.write[0].args.patch.newText}书铺由来客经营。`);
  await assert.rejects(execute({...examples.write[0],args:{...examples.write[0].args,requestId:'stale-prose'}}),/版本已变化/);
  let story=await invoke('story.get');
  const evidence={chapterId:chapter.id,revision:chapter.revision,evidence:chapter.content};
  story=await invoke('story.apply',{requestId:'link-written-scene',expectedRevision:story.state.revision,operation:{type:'card.update',id:ids.CARD_ID,expectedRevision:story.state.cards[ids.CARD_ID].revision,value:{status:'written',evidence:[evidence],cast:[ids.CHARACTER_ID]}}});
  assert.equal(story.state.cards[ids.CARD_ID].status,'written');
  assert.equal(story.state.cards[ids.CARD_ID].evidence[0].revision,2);
  assert.equal(story.state.cards[ids.CARD_ID].evidence[0].evidence,chapter.content);
  await assert.rejects(invoke('story.apply',{requestId:'invented-proof',expectedRevision:story.state.revision,operation:{type:'card.update',id:ids.CARD_ID,expectedRevision:2,value:{evidence:[{...evidence,evidence:'不存在的正文'}]}}}),/依据不在/);
  assert.deepEqual((await invoke('story.get')).state,story.state,'invalid proof is atomic');
});

test('independent page instances share content without duplicating cards; author undo restores membership',async t=>{
 const {ids,invoke,seed}=await fixture(t,{independentPage:true});let story=await invoke('story.get');
 const before=structuredClone(story.state),ref='card:'+ids.CARD_ID;
 story=await invoke('story.apply',{requestId:'display-existing',expectedRevision:story.state.revision,operation:{type:'instance.add',pageId:'main',ref,position:{x:500,y:300}}});
 assert.equal(Object.keys(story.state.cards).length,2);
 assert.deepEqual(Object.keys(story.state.pages.find(p=>p.id===ids.PAGE_ID).instances).sort(),['card:'+ids.CARD_ID,'card:'+ids.NEXT_CARD_ID].sort());
 assert.ok(story.state.pages[0].instances[ref]);assert.deepEqual(story.state.precedence,before.precedence);
 story=await seed('story.undo',{expectedRevision:story.state.revision});
 assert.deepEqual(story.state.pages,before.pages);assert.deepEqual(story.state.cards,before.cards);
});

test('parallel sandbox converges three actions, preserves author layout and keeps unresolved notes in content',async t=>{
 const {ids,invoke}=await fixture(t);let story=await invoke('story.get');const original=structuredClone(story.state);
 const change=async operation=>(story=await invoke('story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation}));
 await change({type:'page.create',name:'码头决战推演'});const pageId=story.state.pages.at(-1).id;
 const create=async(title,x,y,content='')=>{const old=new Set(Object.keys(story.state.cards));await change({type:'card.create',pageId,position:{x,y},value:{title,content,status:'idea'}});return Object.keys(story.state.cards).find(id=>!old.has(id));};
 const meeting=await create('黑暗中抢夺账本',820,420,'待讨论：完整带走，还是付出损失保住证据？');
 const starts=[],ends=[];
 for(const [i,title]of ['主角潜入','守方设伏','第三方等候'].entries()){const id=await create(title,100,120+i*300),end=await create(['识破诱饵','封锁出口','切断照明'][i],420,120+i*300);starts.push(id);ends.push(end);await change({type:'precedence',from:'card:'+id,to:'card:'+end});await change({type:'precedence',from:'card:'+end,to:'card:'+meeting});}
 assert.equal(Object.keys(story.state.pages.at(-1).instances).length,7);
 assert.equal(story.state.precedence.length-original.precedence.length,6);
 assert.deepEqual(new Set(story.state.precedence.filter(e=>e.to==='card:'+meeting).map(e=>e.from)),new Set(ends.map(id=>'card:'+id)));
 const positions=Object.values(story.state.pages.at(-1).instances);
 for(const [i,a] of positions.entries())for(const b of positions.slice(i+1))assert.ok(Math.abs(a.x-b.x)>=248||Math.abs(a.y-b.y)>=208,'story cards do not overlap');
 assert.ok(starts.every(id=>story.state.cards[id].status==='idea'&&story.state.cards[id].evidence.length===0));
 assert.equal(new Set(starts.map(id=>story.state.pages.at(-1).instances['card:'+id].y)).size,3);
 assert.match(story.state.cards[meeting].content,/待讨论/);
 assert.deepEqual(story.state.pages[0],original.pages[0]);assert.deepEqual(story.state.cards[ids.CARD_ID],original.cards[ids.CARD_ID]);
 const before=structuredClone(story.state);
 await assert.rejects(change({type:'decoration.create',value:{kind:'frame'}}),/不支持/);
 assert.deepEqual((await invoke('story.get')).state,before,'retired frame writes cannot mutate state');
});

test('published planning actions stay aligned with the AI allowlist; legacy writes remain forbidden',async t=>{
 assert.deepEqual(TOOL_ACTIONS.moji_plan,['story.get','story.apply']);
 assert.ok(planningArgsSchema.properties.operation.properties.type);
 assert.equal(planningArgsSchema.properties.operations,undefined);
 assert.equal(planningArgsSchema.properties.nodeId,undefined);
 const {planTool}=await fixture(t);
 for(const action of ['planning.apply','planning.continue','planning.page.create','writing.event.create'])await assert.rejects(planTool(action,{}),/action.*must be one of/);
 for(const name of ['plan','project','write','revise']){
  const text=await readFile(new URL(`../skills/moji-${name}/SKILL.md`,import.meta.url),'utf8');
  assert.doesNotMatch(text,/planning\.(?:apply|get|list|continue|search|page|revert)|writing\.event\./);
 }
});

// The current public contract intentionally has no multi-operation transaction.
// Exercise insertion as explicit steps and verify each committed result, not a
// false claim that the removed planning.apply batch is still atomic.
test('inserting a scene preserves independent page and causal neighbors through explicit story steps',async t=>{
 const {ids,invoke,seed}=await fixture(t,{independentPage:true});let story=await invoke('story.get');
 const original=structuredClone(story.state),from='card:'+ids.CARD_ID,to='card:'+ids.NEXT_CARD_ID;
 const change=async operation=>(story=await invoke('story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation}));
 await change({type:'card.create',pageId:ids.PAGE_ID,value:{title:'核对送账时间',content:'账本时间与码头收据不符。'}});
 const middle=Object.keys(story.state.cards).find(id=>!original.cards[id]),ref='card:'+middle;
 await change({type:'precedence',from,to,remove:true});
 await change({type:'precedence',from,to:ref});await change({type:'precedence',from:ref,to});
 assert.deepEqual(story.state.precedence.map(e=>[e.from,e.to]),[[from,ref],[ref,to]]);
 assert.ok(story.state.pages.find(p=>p.id===ids.PAGE_ID).instances[ref]);
 assert.equal(Object.keys(story.state.pages[0].instances).length,0);
 for(let i=0;i<4;i++)story=await seed('story.undo',{expectedRevision:story.state.revision});
 assert.deepEqual(story.state.cards,original.cards);assert.deepEqual(story.state.pages,original.pages);assert.deepEqual(story.state.precedence,original.precedence);
});
