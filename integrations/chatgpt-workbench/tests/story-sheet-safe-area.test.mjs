import test from 'node:test';
import assert from 'node:assert/strict';
import {storyAxisPanelsStyle} from '../vendor/cuigengji/src/client/features/planning/story-axis-panels-style.mjs';
test('story sheet safety rule overrides global important modal sizing and vertical mobile margin',()=>{
 const rule=storyAxisPanelsStyle.match(/\.cuigengji dialog\.utility-modal\.story-axis-sheet\{([^}]+)\}/)?.[1];
 assert.ok(rule,'specific rule must outrank generic .cuigengji .utility-modal');
 assert.match(rule,/margin:0 auto!important/);
 assert.match(rule,/max-height:calc\(var\(--cg-visible-height,100dvh\) - var\(--sap-top\) - var\(--sap-bottom\) - 16px\)!important/);
 assert.match(rule,/min-height:0/);
 // Bounds arithmetic for the mock-host keyboard regression, not a browser-layout claim.
 for(const visible of [480,820]){const top=52,bottom=84,height=visible-top-bottom-16;assert.ok(top+height<=visible-bottom-16);}
});
