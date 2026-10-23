import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {settingsStyles} from '../vendor/cuigengji/src/client/shared/settings-style.ts';

test('settings own their responsive container and reset legacy navigation/panel sizing',async()=>{
 assert.match(settingsStyles,/container:cg-settings \/ inline-size/);
 assert.match(settingsStyles,/@container cg-settings \(max-width:600px\)/);
 assert.match(settingsStyles,/grid-template-columns:190px minmax\(0,1fr\)/);
 assert.match(settingsStyles,/\.settings-nav button \{[^}]*flex:none[^}]*min-height:42px/);
 assert.match(settingsStyles,/\.settings-panel \{width:100%;max-width:none/);
 assert.ok(settingsStyles.includes('.settings-panel:not([hidden])~.settings-panel:not([hidden]) {margin-top:14px;}'));
 assert.ok(settingsStyles.includes('.settings-panel:not([hidden])~.settings-panel:not([hidden]) {margin-top:12px;}'));
 assert.doesNotMatch(settingsStyles,/settings-search|设置搜索结果/);
 const source=await readFile(new URL('../vendor/cuigengji/src/client/shared/preferences.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/settings-search|searchRows|setSearch|搜索设置/);
 assert.deepEqual((await transform(settingsStyles,{loader:'css'})).warnings,[]);
});
test('settings retain visible-height, host and safe-area constraints',()=>{
 assert.match(settingsStyles,/height:min\(720px,calc\(var\(--cg-visible-height,100dvh\) - var\(--cg-host-bottom,0px\) - var\(--settings-top\) - 24px\)\)/);
 assert.match(settingsStyles,/max-width:calc\(100vw - var\(--cg-host-left,0px\) - var\(--cg-host-right,0px\) - 16px\)/);
 assert.match(settingsStyles,/\.settings-panels\s*\{[^}]*min-height:0[^}]*overflow:auto/);
 assert.match(settingsStyles,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(settingsStyles,/data-host-platform=mobile.*--settings-top:max\(52px/);
});
