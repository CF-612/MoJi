import test from 'node:test';
import assert from 'node:assert/strict';
import {goalWords,goalAmount,goalDisplay} from '../vendor/cuigengji/src/client/features/structure/goal-units.mjs';
test('千、万和小数精确保存为字数，切换单位不改目标',()=>{for(const [amount,unit,words]of [['20','w',200000],['50','k',50000],['1.001','k',1001],['1.2345','w',12345]]){assert.equal(goalWords(amount,unit),words);for(const u of ['words','k','w'])assert.equal(goalWords(goalAmount(words,u),u),words);}assert.deepEqual(goalDisplay(200000),{amount:'20',unit:'w'});assert.deepEqual(goalDisplay(3000),{amount:'3',unit:'k'});assert.equal(goalWords('', 'w'),null);});
test('不保存负数、非法文本、半个字或溢出数值',()=>{for(const s of ['-1','0','abc','1e6','0.00001','9007199254740992'])assert.equal(goalWords(s,'w'),undefined);assert.equal(goalWords('0.5','words'),undefined);assert.equal(goalWords('0.5','k'),500);assert.equal(goalWords(goalAmount(Number.MAX_SAFE_INTEGER,'w'),'w'),Number.MAX_SAFE_INTEGER);});
