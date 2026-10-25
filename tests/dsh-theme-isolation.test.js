import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build,transform} from 'esbuild';
import {runInNewContext} from 'node:vm';

const shared='integrations/chatgpt-workbench/vendor/cuigengji/src/client/';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const preferenceSource=await read(shared+'shared/preferences.tsx');
const built=await build({entryPoints:[shared+'structure-style.ts'],bundle:true,write:false,format:'iife',globalName:'Style',loader:{'.png':'dataurl','.jpg':'dataurl'}});
const context={};runInNewContext(built.outputFiles[0].text,context);const css=context.Style.structureStyles;

test('shared preferences never write theme or blur onto the host document',()=>{
 assert.doesNotMatch(preferenceSource,/document\.(?:documentElement|body)/);
 assert.match(preferenceSource,/className="moji-preferences" data-theme-preference=\{preferences\.theme\} data-backdrop-blur=\{String\(preferences\.backdropBlur\)\}/);
 assert.match(preferenceSource,/style=\{\{display:'contents'\}\}/,'preference ownership must not add a layout box');
 assert.match(preferenceSource,/\.moji-preferences\[data-backdrop-blur=true\] dialog::backdrop/);
 assert.doesNotMatch(preferenceSource,/html[^`]*dialog::backdrop/);
});
test('the shipped shared theme targets only MoJi, never html/body or host tokens',async()=>{
 assert.doesNotMatch(css,/html\[data-theme-preference/);
 assert.doesNotMatch(css,/\bbody\s*\{/);
 assert.match(css,/\.moji-preferences\[data-theme-preference=dark\]\{color-scheme:dark/);
 assert.match(css,/\.moji-preferences\[data-theme-preference=light\]\{color-scheme:light/);
 assert.match(css,/html\[data-theme=dark\] \.moji-preferences\[data-theme-preference=system\]/);
 assert.match(css,/html\[data-theme=light\] \.moji-preferences\[data-theme-preference=system\]/);
 assert.deepEqual((await transform(css,{loader:'css'})).warnings,[]);
});
test('native sibling dialog observes only its own workbench scope',async()=>{
 const native=await read('src/client/native-connection.tsx');
 assert.doesNotMatch(native,/html\[data-theme-preference/);
 assert.match(native,/\.moji-native:has\(\.moji-preferences\[data-theme-preference=dark\]\)/);
 assert.match(native,/\.moji-native:has\(\.moji-preferences\[data-backdrop-blur=true\]\)>\.moji-connection-panel::backdrop/);
 assert.match(native,/\.moji-native-body \.moji-preferences>\.cuigengji/);
});
test('page-wide background styling stays in the standalone HTML entry, not the native bundle',async()=>{
 const standalone=await read('integrations/chatgpt-workbench/client/workbench.html');
 assert.match(standalone,/html:has\(#root \.moji-preferences\[data-theme-preference=dark\]\) body/);
 assert.match(standalone,/html:has\(#root \.moji-preferences\[data-theme-preference=light\]\) body/);
 const native=await read('lib/client.js');
 assert.doesNotMatch(native,/html\[data-theme-preference=(dark|light)\]/);
 assert.doesNotMatch(native,/document\.documentElement\.dataset\.(themePreference|backdropBlur)\s*=/);
});
