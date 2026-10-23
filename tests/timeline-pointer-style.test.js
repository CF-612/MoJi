import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/',import.meta.url);
const css=readFileSync(new URL('unified-story-style.mjs',base),'utf8');
const jsx=readFileSync(new URL('UnifiedTimeline.jsx',base),'utf8');
test('narrative cursor has a slim navy axis and compact thumb with a larger drag target',()=>{
 assert.match(css,/\.u-time-cursor\{[^}]*width:1px;[^}]*#234d7b/);
 assert.match(css,/\.u-time-pointer\{[^}]*touch-action:none;[^}]*width:40px;[^}]*min-height:40px!important/);
 assert.match(css,/\.u-time-pointer::before\{[^}]*width:22px;height:24px;[^}]*border-radius:7px 7px 6px 6px;[^}]*background:#234d7b/);
 assert.match(css,/\.u-time-pointer::after\{[^}]*border-right:2px solid #fff/);
 assert.match(css,/\.u-time-pointer:focus-visible\{outline:2px/);
});
test('cursor retains its accessible name and original pointer gesture action',()=>{
 assert.match(jsx,/className="u-time-pointer" aria-label="拖动时间指针" onPointerDown=\{e=>startGesture\(e,'pointer'\)\}/);
 assert.match(jsx,/className="u-time-cursor" style=\{\{left:cursor\*unit\}\}/);
});
