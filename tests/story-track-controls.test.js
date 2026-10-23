import test from 'node:test';
import assert from 'node:assert/strict';
import {storyTrackDropOrder,storyTrackRenameOperation} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-track-controls.mjs';
const catalog=[{id:'same',key:'shared:same',trackSource:'shared',name:'共享',color:'#123456'},{id:'same',key:'story:same',name:'旧故事',color:'#abcdef',side:'below'},{id:'last',key:'story:last',name:'尾轨'}];
test('drag drop retains source identity and complete order with colliding IDs',()=>{assert.deepEqual(storyTrackDropOrder(catalog,'shared:same','story:same',true),[{trackId:'same'},{trackId:'same',trackSource:'shared'},{trackId:'last'}]);assert.deepEqual(storyTrackDropOrder(catalog,'story:last','shared:same'),[{trackId:'last'},{trackId:'same',trackSource:'shared'},{trackId:'same'}]);});
test('canceled, unknown, and unchanged drops do not emit operations or mutate catalog',()=>{const before=structuredClone(catalog);for(const args of [['shared:same',null],['bad','story:same'],['shared:same','shared:same'],['shared:same','story:same',false]])assert.equal(storyTrackDropOrder(catalog,...args),null);assert.deepEqual(catalog,before);});
test('direct rename reuses source-specific operation and preserves color and legacy side',()=>{assert.deepEqual(storyTrackRenameOperation(catalog[0],' 新名字 '),{type:'track.update',id:'same',name:'新名字',color:'#123456'});assert.deepEqual(storyTrackRenameOperation(catalog[1],'新名字'),{type:'storyAxis.track.update',id:'same',name:'新名字',color:'#abcdef',side:'below'});assert.equal(storyTrackRenameOperation(catalog[0],' '),null);assert.equal(storyTrackRenameOperation(catalog[0],'共享'),null);});

test('pointer target preserves lane hit geometry with overlays, empty opposite lane, and outside cancel',async()=>{
 const {storyTrackPointerTarget}=await import('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-track-controls.mjs');
 const rect=(top,height)=>({left:10,right:610,top,bottom:top+height,width:600,height});
 const lanes=[{dataset:{storySpace:'above',storyTrack:'shared:same'},getBoundingClientRect:()=>rect(310,94)},{dataset:{storySpace:'above',storyTrack:'story:same'},getBoundingClientRect:()=>rect(404,94)},{dataset:{storySpace:'below'},getBoundingClientRect:()=>rect(600,90)}];
 const viewport={getBoundingClientRect:()=>rect(300,400),querySelectorAll:()=>lanes},controls={querySelectorAll:()=>[]},g={key:'shared:same',originSide:'above'};
 assert.deepEqual(storyTrackPointerTarget(controls,viewport,catalog,g,37,458),{target:'story:same',side:null,after:true});
 assert.deepEqual(storyTrackPointerTarget(controls,viewport,catalog,{key:'story:same',originSide:'above'},100,320),{target:'shared:same',side:null,after:false});
 assert.deepEqual(storyTrackPointerTarget(controls,viewport,catalog,g,100,650),{target:null,side:'below',after:false});
 assert.deepEqual(storyTrackPointerTarget(controls,viewport,catalog,g,100,710),{target:null,side:null,after:false});
});
