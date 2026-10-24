import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {build} from 'esbuild';
import {mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {materialLabelSize} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/material-graph-geometry.mjs';
import {materialViewStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/memory/material-view-style.mjs';

const base=resolve('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/memory');
await mkdir('.test-runtime',{recursive:true});
const dir=await mkdtemp(resolve('.test-runtime/relation-label-'));
after(()=>rm(dir,{recursive:true,force:true}));
// Export the real label only in this test bundle, without broadening its public API.
const result=await build({stdin:{resolveDir:base,contents:"export {EdgeLabel} from './RelationCanvas.tsx';"},bundle:true,write:false,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'},plugins:[{name:'expose-label',setup(builder){builder.onLoad({filter:/[/\\]RelationCanvas\.tsx$/},async({path})=>({loader:'tsx',contents:(await readFile(path,'utf8'))+'\nexport {EdgeLabel};'}));}}]});
const file=join(dir,'label.mjs');await writeFile(file,result.outputFiles[0].text);
const {EdgeLabel}=await import(pathToFileURL(file));
function renderLabel(overrides={}){
 const calls=[];let tree;
 const props={edge:{id:'edge',name:'挚友',content:'一起长大',relationColor:'#d96e89'},x:12,y:24,width:60,choose:()=>calls.push('history'),edit:()=>calls.push('edit'),openLabel:'查看两人关系演变',...overrides};
 function Capture(){tree=EdgeLabel(props);return tree;}
 const html=renderToStaticMarkup(React.createElement(Capture));
 return {html,tree,button:tree.props.children[0],calls};
}
test('one native button edits a relationship label directly, including repeated activation',()=>{
 for(const openLabel of ['查看两人关系演变',undefined]){
  const {html,tree,button,calls}=renderLabel({openLabel});
  assert.equal(button.type,'button');assert.equal(button.props.type,'button');
  assert.equal(button.props['aria-label'],'编辑关系 挚友');
  assert.equal(button.props.onDoubleClick,undefined);
  button.props.onClick();button.props.onClick();assert.deepEqual(calls,['edit','edit']);
  assert.doesNotMatch(html,/relation-edit-button|app-icon/);
  assert.equal((html.match(/<button/g)||[]).length,1);
  assert.equal(tree.props.style.color,'#d96e89');
  assert.match(materialViewStyle,/edge-label-content strong\{color:inherit\}/);
  assert.match(materialViewStyle,/edge-label-content:focus-visible\{outline:2px solid currentColor/);
 }
});
test('read-only timeline labels retain history activation, never edit',()=>{
 const {button,calls}=renderLabel({readOnly:true});
 assert.equal(button.props['aria-label'],'查看两人关系演变');
 button.props.onClick();assert.deepEqual(calls,['history']);
});
test('compact character relation labels no longer reserve pencil width',()=>{
 assert.equal(materialLabelSize('挚友','',true).width,40);
 assert.equal(materialLabelSize('挚友','',true).width,materialLabelSize('挚友','',false).width);
 assert.doesNotMatch(materialViewStyle,/relation-edit-button/);
});
