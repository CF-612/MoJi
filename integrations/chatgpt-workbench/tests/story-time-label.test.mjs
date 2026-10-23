import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storyTimeLabel} from '../vendor/cuigengji/src/client/shared/story-time-label.mjs';
import {dateToCoordinate} from '../vendor/cuigengji/src/domain/story-axis.mjs';
const axis={calendar:{kind:'custom',name:'灯历',era:'灯历',monthLengths:Array(12).fill(30),visibility:{year:true,month:true,day:true}}};
const start=dateToCoordinate({year:73,month:1,day:3},axis.calendar);
test('chapter-linked cards display mapped custom calendar dates without legacy date text',()=>{
 const card={time:{story:{axisVersion:1,start,end:start+1},narration:{startChapterId:'ch',startOffset:.4}},storyDateText:'',scope:['ch'],evidence:[{chapterId:'ch',revision:2}]};
 const before=structuredClone(card);
 assert.equal(storyTimeLabel(card,axis),'灯历73年1月3日');
 assert.deepEqual(card,before);
 assert.equal(storyTimeLabel({...card,storyDateText:'旧备注',legacyStoryTime:{start:2,end:3}},axis),'灯历73年1月3日');
});
test('legacy and retained legacy times are never interpreted using the configured calendar',()=>{
 for(const card of [{time:{story:{start:2,end:3}}},{time:{story:null},legacyStoryTime:{start:2,end:3}}]){
  const before=structuredClone(card);
  assert.equal(storyTimeLabel(card,axis),'旧时间未换算');
  assert.equal(storyTimeLabel({...card,storyDateText:'初春'},axis),'旧时间未换算 · 初春');
  assert.deepEqual(card,before);
 }
});
test('unplaced date notes are distinguished from placement; zero and negative coordinates remain valid',()=>{
 assert.equal(storyTimeLabel({storyDateText:'初春'},axis),'故事时间待定 · 初春');
 assert.equal(storyTimeLabel({storyDateText:'初春'},null),'初春');
 assert.equal(storyTimeLabel({},axis),'故事时间待定');
 assert.equal(storyTimeLabel({time:{story:{axisVersion:1,start:0}}},axis),'灯历0年1月1日');
 assert.equal(storyTimeLabel({time:{story:{axisVersion:1,start:-1}}},axis),'灯历-1年12月30日');
 assert.equal(storyTimeLabel({time:{story:{axisVersion:1,start:2.5}}},axis),'故事时间待定');
});
test('all adjacent linked-card labels use the shared canonical formatter',()=>{
 for(const file of ['ChapterMaterials.jsx','ChapterRibbon.jsx','MaterialStoryLinks.jsx']){
  const source=readFileSync(new URL(`../vendor/cuigengji/src/client/shared/${file}`,import.meta.url),'utf8');
  assert.match(source,/storyTimeLabel\(c,\w+(?:\.value)?\.state\.storyAxis\)/);
  assert.doesNotMatch(source,/c\.storyDateText\|\|/);
 }
});
