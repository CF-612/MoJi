import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createOutlineFoldPreference,outlineFoldKey,outlineFoldControls} from '../vendor/cuigengji/src/client/features/planning/outline-fold-preference.mjs';
const storage = () => {const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('initially expanded; toggle, reload and reopen preserve display state',()=>{
 const disk=storage(),pref=createOutlineFoldPreference(disk,'local','book-a');
 assert.deepEqual(pref.value,[]);
 pref.update(ids=>[...ids,'volume:one']);
 assert.deepEqual(createOutlineFoldPreference(disk,'local','book-a').value,['volume:one']);
 pref.update(ids=>ids.filter(id=>id!=='volume:one'));
 assert.deepEqual(createOutlineFoldPreference(disk,'local','book-a').value,[]);
 pref.update(['volume:one','chapter:two']);
 assert.deepEqual(createOutlineFoldPreference(disk,'local','book-a').value,['volume:one','chapter:two']);
});
test('book and session changes never copy collapse state across keys',()=>{
 const disk=storage();createOutlineFoldPreference(disk,'local','a').update(['volume:shared']);
 assert.deepEqual(createOutlineFoldPreference(disk,'local','b').value,[]);
 assert.deepEqual(createOutlineFoldPreference(disk,'remote','a').value,[]);
 createOutlineFoldPreference(disk,'local','b').update(['volume:b']);
 assert.deepEqual(createOutlineFoldPreference(disk,'local','a').value,['volume:shared']);
 assert.notEqual(outlineFoldKey('a:b','c'),outlineFoldKey('a','b:c'));
});
test('corrupt or invalid storage is safe and valid IDs are deduplicated',()=>{
 const disk=storage(),key=outlineFoldKey('local','a');
 for(const value of ['{bad','null','{}','42','"text"']){disk.setItem(key,value);assert.deepEqual(createOutlineFoldPreference(disk,'local','a').value,[]);}
 disk.setItem(key,JSON.stringify(['volume:a',null,1,'','volume:a']));
 assert.deepEqual(createOutlineFoldPreference(disk,'local','a').value,['volume:a']);
});
test('unavailable storage does not break current-session expand/collapse',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
 const pref=createOutlineFoldPreference(blocked,'local','a');
 assert.deepEqual(pref.value,[]);pref.update(['volume:a']);assert.deepEqual(pref.value,['volume:a']);
 pref.update([]);assert.deepEqual(pref.value,[]);
});
test('loading does not prune saved refs and adapter reloads on novel/session changes',()=>{
 const disk=storage();createOutlineFoldPreference(disk,'local','a').update(['volume:temporarily-absent']);
 const pref=createOutlineFoldPreference(disk,'local','a');
 assert.deepEqual(pref.value,['volume:temporarily-absent']);
 const source=readFileSync(new URL('../vendor/cuigengji/src/client/features/planning/UnifiedPlanning.jsx',import.meta.url),'utf8');
 assert.match(source,/useMemo\(\(\)=>createOutlineFoldPreference\(browserDraftStorage,sessionScope,novelId\),\[sessionScope,novelId\]\)/);
 assert.match(source,/foldPreference.update\(next\);renderFolds/);
});

test('deleted/leaf folded refs do not mislabel or consume the all-collapse action',()=>{
 const objects={'volume:new':{},'chapter:new':{}},placements={child:{parent:'volume:new'},root:{parent:'root'}};
 const controls=outlineFoldControls(['volume:deleted','chapter:new'],placements,objects);
 assert.deepEqual(controls,{targets:['volume:new'],hasFolded:false});
 assert.equal(outlineFoldControls(controls.targets,placements,objects).hasFolded,true);
 assert.deepEqual(outlineFoldControls(['volume:deleted'],{},{}),{targets:[],hasFolded:false});
});
