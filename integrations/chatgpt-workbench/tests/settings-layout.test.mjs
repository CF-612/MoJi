import test from 'node:test';
import assert from 'node:assert/strict';
import {transform} from 'esbuild';
import {settingsStyles} from '../vendor/cuigengji/src/client/shared/settings-style.ts';
import {previewPolish} from '../vendor/cuigengji/src/client/preview-polish.mjs';

test('settings search stays above the responsive navigation/content layout',async()=>{
 const body=settingsStyles.match(/\.settings-modal \.utility-content\s*\{([^}]+)\}/)?.[1];
 assert.match(body,/flex-direction:column/);
 assert.match(body,/min-width:0/);
 const search=settingsStyles.match(/\.settings-search input\s*\{([^}]+)\}/)?.[1];
 assert.match(search,/width:100%/);
 assert.match(search,/height:40px/);
 assert.match(search,/background:var\(--cg-paper\)/);
 assert.match(settingsStyles,/\[aria-label="设置搜索结果"\]\s*\{[^}]*flex:none/);
 assert.match(settingsStyles,/@container cg-utility \(max-width:600px\)/);
 assert.match(settingsStyles,/grid-template-columns:190px minmax\(0,1fr\)/);
 assert.doesNotMatch(previewPolish,/\.settings-layout\{[^}]*!important/);
 assert.doesNotMatch(previewPolish,/\.settings-nav\{[^}]*!important/);
 const result=await transform(settingsStyles,{loader:'css',minify:false});
 assert.deepEqual(result.warnings,[]);
});

test('settings height and footer account for keyboard, host composer and safe areas',()=>{
 assert.match(settingsStyles,/height:min\(720px,calc\(var\(--cg-visible-height,100dvh\) - var\(--cg-host-bottom,0px\) - var\(--settings-top\) - 24px\)\)/);
 assert.match(settingsStyles,/max-width:calc\(100vw - var\(--cg-host-left,0px\) - var\(--cg-host-right,0px\) - 16px\)/);
 assert.match(settingsStyles,/\.settings-panels\s*\{[^}]*min-height:0[^}]*overflow:auto/);
 assert.match(settingsStyles,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(settingsStyles,/data-host-platform=mobile.*--settings-top:max\(52px/);
});
