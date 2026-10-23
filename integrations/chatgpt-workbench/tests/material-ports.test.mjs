import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createService} from '../server/service.mjs';
import {materialConnection,characterConnection} from '../vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
test('material attachment metadata saves/reloads independently of relationship labels and historical meaning',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'moji-material-')),s=await createService(directory),novelId=s.novelId,call=(action,args={})=>s.rpc(action,{novelId,...args},'material-test','human');
 const a=await call('graph.create',{name:'甲',type:'character_card'}),b=await call('graph.create',{name:'乙',type:'world_entry'}),edge=await call('edge.create',{from:a.id,to:b.id,name:'朋友',content:'原关系说明',fromPort:'top',toPort:'right'});
 const updated=await call('edge.update',{edgeId:edge.id,expectedRevision:edge.revision,name:'伙伴'});assert.equal(updated.fromPort,'top');assert.equal(updated.toPort,'right');assert.equal(updated.content,'原关系说明');
 const again=await createService(directory),saved=await again.rpc('edge.get',{novelId,edgeId:edge.id},'material-test','human');assert.deepEqual(saved,updated);
 await assert.rejects(call('edge.create',{from:a.id,to:b.id,fromPort:'diagonal'}),{code:'INVALID_INPUT'});
 const route=materialConnection(saved,{[a.id]:{x:0,y:0},[b.id]:{x:400,y:300}});assert.deepEqual(route.start,{x:124,y:0});assert.deepEqual(route.end,{x:648,y:384});assert.equal(characterConnection(saved,[a,b]),true);
});
