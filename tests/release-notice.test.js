import test from 'node:test';
import assert from 'node:assert/strict';
import {compareVersions,validateRelease} from '../src/domain/release.js';
test('更新检查正确比较数字版本和预览版本，避免升级后仍提示旧版',()=>{
 assert.equal(compareVersions('0.10.0','0.9.8'),1);
 assert.equal(compareVersions('1.0.0','1.0.0'),0);
 assert.equal(compareVersions('1.0.0-beta.2','1.0.0-beta.10'),-1);
 assert.equal(compareVersions('1.0.0-beta','1.0.0'),-1);
 assert.throws(()=>compareVersions('latest','1.0.0'));
});
test('正式提醒拒绝其他产品、预览版、非 HTTPS 下载地址和带凭据的 URL',()=>{
 const release={product:'moji',version:'0.10.0',downloadUrl:'https://example.com/moji/releases/0.10.0',notes:'更新说明'};
 assert.deepEqual(validateRelease(release),{version:release.version,downloadUrl:release.downloadUrl,notes:'更新说明'});
 for(const patch of [{product:'other'},{version:'1.0.0-beta.1'},{prerelease:true},{downloadUrl:'javascript:alert(1)'},{downloadUrl:'https://secret@example.com'}])assert.throws(()=>validateRelease({...release,...patch}));
});
