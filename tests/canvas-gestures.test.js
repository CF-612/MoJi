import test from 'node:test';
import assert from 'node:assert/strict';
import {canvasGestureKind,dragExceeded,marqueeRect,intersectingIds,appendSelection,isAdditiveSelection} from '../src/client/shared/canvas-gestures.ts';
import {toScreen,toWorld} from '../src/client/shared/graph-geometry.ts';
test('desktop blank gestures and card right clicks are distinct; touch is preserved',()=>{
 assert.equal(canvasGestureKind(0,'mouse',true),'pan');
 assert.equal(canvasGestureKind(2,'mouse',true),'marquee');
 for(const button of [0,2])assert.equal(canvasGestureKind(button,'mouse',false),null);
 assert.equal(canvasGestureKind(1,'mouse',false),'pan');
 assert.equal(canvasGestureKind(0,'mouse',false,true),'pan');
 assert.equal(canvasGestureKind(0,'touch',true),'marquee');
 assert.equal(canvasGestureKind(2,'touch',true),null);
});
test('five screen pixels distinguish clicks from drags, independently of zoom',()=>{
 assert.equal(dragExceeded({x:20,y:30},{x:22,y:33}),false);
 assert.equal(dragExceeded({x:20,y:30},{x:23,y:34}),true);
 assert.equal(dragExceeded({x:20,y:30},{x:14,y:30}),true);
});
test('marquee intersects actual cards in both axes under zoom and translated camera',()=>{
 const items=[{id:'card',bounds:{x:100,y:200,width:80,height:60}},{id:'same-row',bounds:{x:300,y:200,width:80,height:60}},{id:'same-column',bounds:{x:100,y:600,width:80,height:60}}];
 for(const zoom of [.1,.5,1,1.8]){
  const camera={x:391,y:-160,zoom};
  const start=toScreen({x:190,y:270},camera),end=toScreen({x:90,y:190},camera);
  const rect=marqueeRect(toWorld(start,camera),toWorld(end,camera));
  assert.deepEqual(intersectingIds(rect,items),['card']);
 }
});
test('append selection deduplicates without mutating data and supports all modifiers',()=>{
 const ids=['b','a'],prior=['a','c'];assert.deepEqual(appendSelection(ids,prior),['a','c','b']);assert.deepEqual(ids,['b','a']);assert.deepEqual(prior,['a','c']);
 for(const modifier of ['shiftKey','ctrlKey','metaKey'])assert.equal(isAdditiveSelection({shiftKey:false,ctrlKey:false,metaKey:false,[modifier]:true}),true);
 assert.equal(isAdditiveSelection({shiftKey:false,ctrlKey:false,metaKey:false}),false);
});
