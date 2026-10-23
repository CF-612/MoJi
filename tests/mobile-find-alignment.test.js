import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mobileEditorStyles} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/mobile-editor-style.ts';
const base='integrations/chatgpt-workbench/vendor/cuigengji/src/client/';
test('narrow editor highlight resets only block padding inside the same 760px container as textarea',()=>{
 const split=mobileEditorStyles.split('@container(max-width:760px){');assert.ok(split.length>=2);
 assert.doesNotMatch(split[0],/prose-match-layer/);
 assert.match(split[1],/\.chapter-main textarea\.manuscript\{padding:0;/);
 assert.match(split[1],/\.cuigengji \.chapter-main \.manuscript-surface \.prose-match-layer\{padding-block:0\}/);
});
test('desktop baseline and mobile inline padding remain shared, highlight inherits exact editor appearance',async()=>{
 const css=await readFile(base+'features/chapters/chapter-tools-style.mjs','utf8'),layer=await readFile(base+'features/chapters/ProseFind.jsx','utf8');
 assert.match(css,/\.chapter-main \.prose-match-layer\{[^}]*padding:16px;/);
 assert.match(css,/\.chapter-main \.manuscript-surface \.manuscript\{padding-inline:8px\}/);
 assert.match(layer,/className="prose-match-layer manuscript" aria-hidden="true" style=\{appearance\}/);
 const override=mobileEditorStyles.match(/\.prose-match-layer\{([^}]*)\}/)[1];assert.equal(override,'padding-block:0');
});
