import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {storyTickIntervalLabel} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/story-axis-copy.mjs';
test('big-tick copy describes the selected interval, not subdivisions, without resetting values',()=>{
 for(const [unit,step,expected] of [['year',1,'每 1 年显示一个大刻度'],['year',6,'每 6 年显示一个大刻度'],['month',6,'每 6 个月显示一个大刻度'],['day',2,'每 2 天显示一个大刻度']]){
  const tick=Object.freeze({unit,step});assert.equal(storyTickIntervalLabel(tick),expected);assert.equal(tick.step,step);
 }
 for(const step of ['',0,-1,1.5])assert.equal(storyTickIntervalLabel({unit:'year',step}),'请填写大于零的整数间隔。');
});
test('setup explains labelled big ticks, exact event dates, and zoom-controlled small ticks',()=>{
 const source=readFileSync(new URL('../integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/StoryAxisPanels.jsx',import.meta.url),'utf8');
 for(const text of ['时间轴大刻度间隔','间隔数值','间隔单位','相邻两个带日期标签的大刻度','不是把一年分成几小格','不改变事件日期','小刻度随缩放变化','storyTickIntervalLabel(draft.primaryTick)'])assert.ok(source.includes(text),text);
 assert.ok(!source.includes('坐标单位 · 主刻度'));
});
