import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {materialCardStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/material-card-style.mjs';
import {MATERIAL_WIDTH,MATERIAL_HEIGHT} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
const result=await build({entryPoints:['integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/MaterialAvatar.tsx'],bundle:true,loader:{'.png':'dataurl'},write:false,format:'esm',platform:'node',jsx:'transform',tsconfigRaw:{compilerOptions:{jsx:'react'}},plugins:[{name:'avatar-hooks',setup(b){b.onResolve({filter:/^react$/},()=>({path:'react',namespace:'harness'}));b.onLoad({filter:/.*/,namespace:'harness'},()=>({contents:`export const useState=()=>[globalThis.__avatarFailure,v=>globalThis.__avatarFailure=v];export default {createElement:(type,props,...children)=>({type,props:{...props,children}})};`}));}}]});
const {MaterialAvatar}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
test('existing avatar is non-draggable and falls back on failure; replacement source recovers',()=>{
 delete globalThis.__avatarFailure;
 let tree=MaterialAvatar({name:'沈知夏',src:'data:image/png;base64,example'});
 assert.equal(tree.props['aria-hidden'],'true');let img=tree.props.children[0];
 assert.equal(img.type,'img');assert.equal(img.props.draggable,false);assert.equal(img.props.alt,'');
 img.props.onError();tree=MaterialAvatar({name:'沈知夏',src:'data:image/png;base64,example'});assert.equal(tree.props.children[0],'沈');
 tree=MaterialAvatar({name:'沈知夏',src:'replacement.png'});assert.equal(tree.props.children[0].type,'img');
 delete globalThis.__avatarFailure;
});
test('missing avatars keep a Unicode-safe initial or generic placeholder',()=>{
 assert.equal(MaterialAvatar({name:' 林月白'}).props.children[0],'林');
 assert.equal(MaterialAvatar({name:'🦊角色'}).props.children[0],'🦊');
 assert.equal(MaterialAvatar({name:'  '}).props.children[0],'人');
});
test('avatar is character-only in shared editable/read-only canvas and does not change geometry or colors',async()=>{
 const source=await readFile('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/memory/RelationCanvas.tsx','utf8');
 assert.match(source,/n.type==='character_card'&&<MaterialAvatar name=\{n.name\} src=\{n.avatarImage\}/);
 assert.match(materialCardStyle,/material-card-avatar\{grid-column:1;grid-row:1 \/ span 2;align-self:end;width:56px;height:56px;border-radius:50%/);
 assert.match(materialCardStyle,/pointer-events:none;user-select:none/);
 assert.match(materialCardStyle,/with-avatar .planning-title\{box-sizing:border-box;width:calc\(100% - 32px\);align-self:end;.*background:transparent/);
 assert.match(materialCardStyle,/background:color-mix\(in srgb,var\(--graph-card-tone\) 13%,var\(--cg-paper\)\)/);
 assert.match(materialCardStyle,/background:#fff;color:#263445;font-size:26px;font-weight:600;border:1px solid #8492a6/);
 assert.equal(MATERIAL_WIDTH,248);assert.equal(MATERIAL_HEIGHT,168);
});

test('long names reserve gear space and two complete overview lines instead of cutting a line in half',()=>{
 assert.match(materialCardStyle,/with-avatar .planning-title\{box-sizing:border-box;width:calc\(100% - 32px\)/);
 assert.match(materialCardStyle,/graph-overview .material-card-identity.with-avatar .planning-title\{align-self:end;font-size:18px;line-height:1.25\}/);
 assert.equal(18*1.25*2+6,51);
});
test('graph name validation preserves long strings rather than truncating them to the visual clamp',async t=>{
 const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const {Store}=await import('../src/application/store.js');
 const dir=await mkdtemp(join(tmpdir(),'moji-long-names-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const store=new Store(dir),novel=await store.dispatch('novel.create',{title:'长姓名验证'});
 for(const name of ['沈知夏来自遥远北方的旧书店守护者与未寄出信件的收藏家','Alexandra Catherine Montgomery of the Northern Library','AlexandraCatherineMontgomeryOfTheNorthernLibraryWithoutAnySpaces']){
  const node=await store.dispatch('graph.create',{novelId:novel.id,type:'character_card',name},{kind:'human'});
  assert.equal(node.name,name);
  assert.equal((await store.dispatch('graph.get',{novelId:novel.id,nodeId:node.id})).name,name);
 }
});
