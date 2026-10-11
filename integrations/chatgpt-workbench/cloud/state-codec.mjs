import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';

export const MAX_RAW_BYTES=64*1024*1024;
export const MAX_STORED_BYTES=1_800_000;
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=message=>{throw Object.assign(new Error(message),{code:'CAPACITY_LIMIT'});};
export function encodeState(state){
  const text=JSON.stringify(state),rawBytes=Buffer.byteLength(text);
  if(rawBytes>MAX_RAW_BYTES)fail('工作库超过 64 MB，请拆分作品或导出历史；未覆盖保存。');
  const stored=rawBytes<512_000?text:JSON.stringify({format:'cuigengji-state-gzip',version:1,bytes:rawBytes,sha256:hash(text),data:gzipSync(text).toString('base64')});
  const storedBytes=Buffer.byteLength(stored);
  if(storedBytes>MAX_STORED_BYTES)fail('压缩后的工作库超过安全存储上限（1.8 MB），请拆分或导出历史；未覆盖保存。');
  return {stored,rawBytes,storedBytes};
}
export function decodeState(stored){
  const value=JSON.parse(stored);
  if(value.format!=='cuigengji-state-gzip')return value;
  if(value.version!==1||!Number.isSafeInteger(value.bytes)||value.bytes<0||value.bytes>MAX_RAW_BYTES||typeof value.data!=='string')throw new Error('工作库压缩格式无效');
  const buffer=gunzipSync(Buffer.from(value.data,'base64'),{maxOutputLength:MAX_RAW_BYTES});
  const text=buffer.toString('utf8');
  if(buffer.length!==value.bytes||hash(text)!==value.sha256)throw new Error('工作库完整性校验失败，停止写入');
  return JSON.parse(text);
}
