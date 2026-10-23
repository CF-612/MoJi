import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {runInNewContext} from 'node:vm';
const paths=['src/client/shared/icons.tsx','integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/icons.tsx'];
const icons=[];
for(const path of paths){
 const result=await build({entryPoints:[path],bundle:true,write:false,format:'iife',globalName:'Icons',jsx:'transform'});
 const context={};runInNewContext(result.outputFiles[0].text,context);icons.push(context.Icons.Icon({name:'settings'}));
}
test('both shared settings gears use the same balanced eight-tooth vector',()=>{
 const outlines=icons.map(icon=>icon.props.children.props.children[0].props.d);assert.equal(outlines[0],outlines[1]);
 const numbers=outlines[0].match(/\d+\.\d+/g).map(Number),points=[];
 for(let i=0;i<numbers.length;i+=2)points.push(numbers.slice(i,i+2));
 assert.equal(points.length,24);
 for(const [x,y] of points){assert.ok(points.some(([rx,ry])=>Math.abs(rx-(24-y))<.002&&Math.abs(ry-x)<.002),'quarter-turn symmetry');assert.ok(x>1&&x<23&&y>1&&y<23,'stroke stays inside viewBox');}
});
test('settings SVG is square, nonshrinking, centered, and decorative in labeled controls',()=>{
 for(const {props} of icons){assert.equal(props.width,props.height);assert.equal(props.viewBox,'0 0 24 24');assert.equal(props.preserveAspectRatio,'xMidYMid meet');assert.equal(props.style.flexShrink,0);assert.equal(props.style.aspectRatio,'1 / 1');assert.equal(props['aria-hidden'],'true');}
});
test('card quick settings reuse shared vector; no platform font gear remains',async()=>{
 const base='integrations/chatgpt-workbench/vendor/cuigengji/src/client/';
 const card=await readFile(base+'shared/card-appearance.tsx','utf8'),css=await readFile(base+'card-style.ts','utf8'),studio=await readFile(base+'studio-style.ts','utf8');
 assert.match(card,/<Icon name="settings"\/>/);assert.doesNotMatch(card+studio,/⚙/);
 assert.match(css,/\.card-quick-settings \{display:inline-flex;align-items:center;justify-content:center;/);
 assert.match(css,/\.graph-overview \.card-quick-settings svg.app-icon \{width:calc\(18px \* var\(--graph-title-scale\)\);height:calc\(18px \* var\(--graph-title-scale\)\);/);
});
