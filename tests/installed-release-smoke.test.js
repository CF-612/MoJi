import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// Execute the shipped smoke harness rather than duplicating its assertions.
for (const [name,story,passes] of [
  ['empty card map',{state:{cards:{}}},true],
  ['populated card map',{state:{cards:{card:{id:'card'}}}},true],
  ['obsolete top-level cards',{cards:{}},false],
  ['missing nested cards',{state:{}},false],
  ['null nested cards',{state:{cards:null}},false],
  ['array instead of card map',{state:{cards:[]}},false],
]) test(`installed smoke validates story.get: ${name}`,async t=>{
  const root=await mkdtemp(join(tmpdir(),'moji-smoke-contract-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await writeFile(join(root,'package.json'),JSON.stringify({type:'module',version:'test',main:'index.mjs',engines:{dsh:'0.2.1-rc.2'}}));
  await writeFile(join(root,'index.mjs'),`export async function apply(ctx){
    const responses={status:{status:'ready'},verify:{verified:true,summary:{counts:{novels:1}}},
      'novel.handoff':{novel:{title:'雾港 · 公开合成升级样例'}},'graph.list':[1,2,3],
      'story.get':${JSON.stringify(story)},'preset.read':{content:'动作推进'}};
    for(const name of ['moji_maintenance','moji_project','moji_memory','moji_plan','moji_context'])
      ctx.tools.register({name,execute:async({action})=>JSON.stringify(responses[action])});
  }`);
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/installed-release-smoke.mjs',import.meta.url)),root,join(root,'data')],{encoding:'utf8',timeout:10000});
  assert.equal(result.error,undefined);
  if(passes){assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).ok,true);}
  else {assert.notEqual(result.status,0);assert.match(result.stderr,/story\.get(?:\.state\.cards)? must/);}
});
