import test from 'node:test';import assert from 'node:assert/strict';
import {planningSelection,isPlanningDeleteKey,planningGroupFilter,planningGroupMatches} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/planning-selection.mjs';
const objects={'card:a':{kind:'card'},'chapter:c':{kind:'chapter'},'volume:v':{kind:'volume'}};
test('only explicit live plot cards are deletable; stale and duplicate refs never add implicit descendants',()=>{assert.deepEqual(planningSelection(objects,['card:a','card:a','chapter:c','volume:v','gone']),{refs:['card:a','chapter:c','volume:v'],cards:['card:a'],protected:['chapter:c','volume:v']});});
test('Delete guard blocks text controls, editable regions, dialogs, menus, IME, modifiers, repeat, busy and empty selection',()=>{
 const base={key:'Delete',target:{closest:()=>null}},options={selected:['card:a']};assert.equal(isPlanningDeleteKey(base,options),true);
 for(const field of ['isComposing','repeat','ctrlKey','metaKey','altKey'])assert.equal(isPlanningDeleteKey({...base,[field]:true},options),false,field);
 assert.equal(isPlanningDeleteKey({...base,nativeEvent:{isComposing:true}},options),false);assert.equal(isPlanningDeleteKey(base,{...options,blocked:true}),false);assert.equal(isPlanningDeleteKey(base,{}),false);
 for(const region of ['input','textarea','select','contenteditable','role=dialog','aria-modal','role=menu'])assert.equal(isPlanningDeleteKey({...base,target:{closest:selector=>(assert.match(selector,/input:not/),region)}},options),false);
 assert.equal(isPlanningDeleteKey({...base,target:{isContentEditable:true}},options),false);assert.equal(isPlanningDeleteKey({...base,key:'Backspace'},options),false);
});
test('custom grouping filters only display and disabling module always restores all',()=>{
 const groups=[{id:'g',name:'Group',refs:['card:a']}],before=structuredClone(groups);
 assert.equal(planningGroupFilter(groups,'g',true),'g');assert.equal(planningGroupFilter(groups,'g',false),'');assert.equal(planningGroupFilter(groups,'removed',true),'');assert.equal(planningGroupFilter(groups,'__ungrouped',true),'__ungrouped');
 assert.equal(planningGroupMatches(groups,'g','card:a'),true);assert.equal(planningGroupMatches(groups,'g','chapter:c'),false);assert.equal(planningGroupMatches(groups,'__ungrouped','chapter:c'),true);assert.equal(planningGroupMatches(groups,'__ungrouped','card:a'),false);assert.equal(planningGroupMatches(groups,'','card:a'),true);assert.deepEqual(groups,before);
});
