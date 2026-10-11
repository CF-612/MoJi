import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {encodeState,decodeState} from '../state-codec.mjs';
test('大作品可无损保存，旧 JSON 仍可读取，损坏和超限停止写入',()=>{
  const small={schemaVersion:1,novels:{}};
  assert.deepEqual(decodeState(JSON.stringify(small)),small);
  const state={...small,prose:'　　“你来啦。”——她说。\n\n'.repeat(80000)};
  const encoded=encodeState(state);assert.ok(encoded.rawBytes>3_000_000);assert.ok(encoded.storedBytes<1_800_000);
  assert.deepEqual(decodeState(encoded.stored),state);
  const corrupt=JSON.parse(encoded.stored);corrupt.sha256='bad';assert.throws(()=>decodeState(JSON.stringify(corrupt)),/校验失败/);
  assert.throws(()=>encodeState({data:randomBytes(2_000_000).toString('base64')}),{code:'CAPACITY_LIMIT'});
});
