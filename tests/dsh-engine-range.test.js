import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import semver from 'semver';
const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));
const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url)));
// Official rc5 app-boot evaluates own engines.dsh first with includePrerelease:true.
// Real rc5 loader verification is separate; this is a metadata regression guard.
test('DSH range admits only explicitly tested releases and lock metadata stays aligned',()=>{
 for(const version of ['0.2.0-rc.2','0.2.1-rc.2','0.2.1-rc.3','0.2.1-rc.5'])assert.equal(semver.satisfies(version,manifest.engines.dsh,{includePrerelease:true}),true,version);
 for(const version of ['0.2.1-rc.4','0.2.1-rc.6','0.2.2-alpha.2','0.2.1','0.3.0'])assert.equal(semver.satisfies(version,manifest.engines.dsh,{includePrerelease:true}),false,version);
 assert.equal(lock.packages[''].engines.dsh,manifest.engines.dsh);
});
