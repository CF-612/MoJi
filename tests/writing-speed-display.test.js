import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {normalizeEditorPreferences} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/editor-preferences.mjs';
import {writingSpeedBounds,moveWritingSpeed} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/writing-speed-position.mjs';
import {createWritingSession,recordWritingEdit,writingMetrics} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/writing-session.mjs';
test('old/malformed preferences retain banner default; both modes persist through existing JSON normalization',()=>{
 for(const value of [{},{writingSpeed:true},{writingSpeedDisplay:'bad'},{writingSpeedDisplay:null}])assert.equal(normalizeEditorPreferences(value).writingSpeedDisplay,'banner');
 for(const mode of ['banner','floating']){const p=normalizeEditorPreferences({writingSpeed:true,writingSpeedDisplay:mode});assert.equal(normalizeEditorPreferences(JSON.parse(JSON.stringify(p))).writingSpeedDisplay,mode);assert.equal(p.writingSpeed,true);}
});
test('mode only changes presentation; session metrics and recorded text are unchanged',()=>{
 const state=recordWritingEdit(createWritingSession(),{key:'chapter',before:'',after:'雨夜来信',inputType:'insertText',now:1000}),before=structuredClone(state),metrics=writingMetrics(state,2000);
 for(const mode of ['floating','banner']){normalizeEditorPreferences({writingSpeedDisplay:mode});assert.deepEqual(state,before);assert.deepEqual(writingMetrics(state,2000),metrics);}
 const source=readFileSync('integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/WritingSession.jsx','utf8');assert.doesNotMatch(source.slice(0,source.indexOf('export function WritingSpeed')),/writingSpeedDisplay|onDisplayChange/);
 assert.match(source,/visualViewport\?\.addEventListener\('resize'/);assert.match(source,/onPointerDown={start}/);assert.match(source,/e.preventDefault\(\);e.stopPropagation\(\);drag.current/);
});
test('floating panel stays inside editor and visible keyboard viewport; narrow/resize bounds never escape',()=>{
 const editor={left:30,top:120,right:390,bottom:700},view={left:0,top:0,right:390,bottom:760};
 for(const position of [{x:0,y:0},{x:1,y:1},{x:-10,y:10}]){const b=writingSpeedBounds(editor,view,{width:216,height:92},position);assert.ok(b.left>=38&&b.left+216<=382);assert.ok(b.top>=128&&b.top+92<=692);}
 const keyboard=writingSpeedBounds(editor,{...view,bottom:360},{width:216,height:92},{x:1,y:1});assert.equal(keyboard.top+92,352);
 const scrolled=writingSpeedBounds(editor,{left:0,top:180,right:320,bottom:500},{width:216,height:92});assert.equal(scrolled.top,188);assert.ok(scrolled.left+216<=312);
 const tiny=writingSpeedBounds(editor,{...view,bottom:130});assert.equal(tiny.visible,false);assert.equal(tiny.travelY,0);
 const b=writingSpeedBounds(editor,view);assert.deepEqual(moveWritingSpeed({x:.5,y:.5},{x:9999,y:-9999},b),{x:1,y:0});assert.deepEqual(moveWritingSpeed({x:1,y:1},{x:10,y:10},{travelX:0,travelY:0}),{x:0,y:0});
});
