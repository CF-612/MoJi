import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {storyAxisPanelsStyle} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-panels-style.mjs';
const source=readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryAxisPanels.jsx',import.meta.url),'utf8');
test('marker delete uses the shared footer and retains its submission guard and handler',()=>{
 const marker=source.split('export function StoryMarkerEditor')[1].split('export function StoryPlacementEditor')[0];
 assert.match(marker,/<Footer submission=\{submission\}[^\n]* destructiveAction=\{marker&&onDelete&&<button type="button" className="sap-danger sap-delete" disabled=\{submission.disabled\} onClick=\{\(\)=>submission.submit\(onDelete\)\}>删除这个标记<\/button>\}/);
 assert.equal((marker.match(/删除这个标记/g)||[]).length,1);
 assert.match(source,/className="sap-footer">\{destructiveAction\}<div className="sap-footer-actions">/);
});
test('footer separates danger and primary groups without imposing a phone-width minimum',()=>{
 assert.match(storyAxisPanelsStyle,/\.sap-footer\{[^}]*flex-wrap:wrap/);
 assert.match(storyAxisPanelsStyle,/\.sap-footer-actions\{[^}]*margin-left:auto/);
 assert.match(storyAxisPanelsStyle,/\.sap-footer \.sap-delete\{[^}]*margin-right:auto[^}]*background:#b42318[^}]*color:#fff/);
 assert.match(storyAxisPanelsStyle,/\.sap-footer \.sap-delete:focus-visible/);
});

test('marker editor explains creating a named point and previews its full exact date',()=>{
 const marker=source.split('export function StoryMarkerEditor')[1].split('export function StoryPlacementEditor')[0];
 for(const text of ['新建时间点','编辑时间点','时间点名称','时间点放在哪一天？','不会新建剧情卡','日期已带入当前选择的位置','保存后将把','visibility:{year:true,month:true,day:true}','在前一天新建','在后一天新建',"submitDisabled={!label.trim()||!datePreview}"])assert.ok(marker.includes(text),text);
 assert.match(marker,/marker\?\.coordinate\?\?coordinate\?\?axis.anchor.coordinate/);
 assert.match(marker,/onSave\(\{label:label.trim\(\),coordinate:Number\(point\)\}\)/);
});
