import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {identity,sha256,checksumFor,assertPrepared,assetAction,releaseNotes,verifyRegistry,REPOSITORY,PACKAGE,REGISTRY,
  assetName,distTag,safeError,trustEntries,matchingTrust,marketUpdate} from '../scripts/release-support.mjs';

const version='0.4.3';
const pkg={name:PACKAGE,version,repository:{url:`git+https://github.com/${REPOSITORY}.git`}};

test('release identity rejects placeholder, renamed package and install hooks',()=>{
  assert.equal(identity(pkg).tag,'v0.4.3');
  assert.throws(()=>identity({...pkg,version:'0.0.0-stage'}),/placeholder/);
  assert.throws(()=>identity({...pkg,name:'dsh-cuigengji'}),/stable/);
  assert.throws(()=>identity({...pkg,version:'../0.4.3'}),/Invalid/);
  assert.throws(()=>identity({...pkg,scripts:{prepare:'node compile.js'}}),/lifecycle/);
  assert.equal(distTag('0.4.3-beta.1'),'next'); assert.equal(distTag(version),'latest');
});

test('preparation cannot be reused with dirty source, different commit or changed bytes',()=>{
  const hash=sha256(Buffer.from('tested archive'));
  const state={schemaVersion:1,packageName:PACKAGE,version,sourceCommit:'abc',sha256:hash,checks:{prepared:true}};
  const current={commit:'abc',clean:true,version,hash};
  assert.doesNotThrow(()=>assertPrepared(state,current));
  for (const change of [{clean:false},{commit:'def'},{version:'0.4.4'},{hash:sha256(Buffer.from('changed archive'))}]) {
    assert.throws(()=>assertPrepared(state,{...current,...change}));
  }
  assert.throws(()=>assertPrepared({...state,checks:{}},current),/acceptance/);
});

test('draft upload resumes without replacing assets; public release is immutable',()=>{
  assert.equal(assetAction({draft:true,exists:false,expected:'a'}),'upload');
  assert.equal(assetAction({draft:true,exists:true,expected:'a',actual:'a'}),'keep');
  assert.equal(assetAction({draft:false,exists:true,expected:'a',actual:'a'}),'keep');
  assert.throws(()=>assetAction({draft:false,exists:false,expected:'a'}),/already public/);
  assert.throws(()=>assetAction({draft:true,exists:true,expected:'a',actual:'b'}),/new version/);
  assert.throws(()=>assetAction({draft:false,exists:true,expected:'a',actual:'b'}),/new version/);
});

test('checksum must uniquely identify the tested package',()=>{
  const hash='f'.repeat(64),name=assetName(version);
  assert.equal(checksumFor(`${hash.toUpperCase()}  *${name}\n`,name),hash);
  assert.throws(()=>checksumFor(`${hash} other.tgz`,name));
  assert.throws(()=>checksumFor(`${hash} ${name}\n${hash} ${name}`,name));
  assert.throws(()=>checksumFor(`short ${name}`,name));
});

function registryFixture({missing=false,bytes=Buffer.from('archive'),tag=version,host='registry.npmjs.org',badIntegrity=false}={}) {
  const expected=Buffer.from('archive');
  const tarball=`https://${host}/${PACKAGE}/-/${assetName(version)}`;
  const manifest={...pkg,dist:{tarball,integrity:`sha512-${createHash('sha512').update(badIntegrity?'other':bytes).digest('base64')}`}};
  const fetcher=async url=>{
    if (url===`${REGISTRY}/${PACKAGE}/${version}`) return missing?new Response('',{status:404}):Response.json(manifest);
    if (url===`${REGISTRY}/${PACKAGE}`) return Response.json({'dist-tags':{latest:tag}});
    if (url===tarball) return new Response(bytes);
    throw new Error(`Unexpected URL ${url}`);
  };
  return {version,expectedHash:sha256(expected),fetcher};
}

test('an exact public version, matching bytes, integrity and dist-tag establishes npm success',async()=>{
  const result=await verifyRegistry(registryFixture()); assert.equal(result.published,true); assert.equal(result.tag,'latest');
});

test('npm placeholder or successful upload with no public version remains pending',async()=>{
  const result=await verifyRegistry(registryFixture({missing:true}));
  assert.deepEqual(result,{published:false,reason:'EXACT_VERSION_NOT_PUBLIC'});
  await assert.rejects(verifyRegistry(registryFixture({tag:'0.0.0-stage'})),/tag/);
});

test('registry tampering, wrong archive origin and stale tags cannot pass publication',async()=>{
  await assert.rejects(verifyRegistry(registryFixture({bytes:Buffer.from('changed')})),/archives differ/);
  await assert.rejects(verifyRegistry(registryFixture({host:'example.invalid'})),/host/);
  await assert.rejects(verifyRegistry(registryFixture({badIntegrity:true})),/integrity/);
  await assert.rejects(verifyRegistry(registryFixture({tag:'0.4.2'})),/tag/);
});

test('trust must target the exact repo/workflow and allow direct publication',()=>{
  const row={type:'github',repository:REPOSITORY,file:'publish-npm.yml',permissions:['createPackage']};
  assert.deepEqual(trustEntries(`${JSON.stringify(row)}\n\n${JSON.stringify({...row,repository:'someone/else'})}`),[row,{...row,repository:'someone/else'}]);
  assert.deepEqual(matchingTrust([row]),row);
  for (const change of [{repository:'someone/else'},{file:'other.yml'},{environment:'production'},{permissions:['createStagedPackage']}]) {
    assert.equal(matchingTrust([{...row,...change}]),undefined);
  }
  assert.deepEqual(trustEntries(''),[]); assert.throws(()=>trustEntries('{"id":'),/Incomplete/);
});

test('market sync preserves author text and refuses unfamiliar sources',()=>{
  const text=`# author\nurl: https://github.com/${REPOSITORY}\nname: ${PACKAGE}\ndescription:\n  zh: 催更姬\ntarball: https://github.com/${REPOSITORY}/releases/download/v0.4.2/${PACKAGE}-0.4.2.tgz\n`;
  const result=marketUpdate(text,version); assert.ok(result.startsWith(text.split('tarball:')[0]));
  assert.match(result,/v0\.4\.3\/dsh-cuigengji-plugin-0\.4\.3\.tgz/);
  assert.equal(marketUpdate(result,version),result);
  assert.throws(()=>marketUpdate(text.replace('tarball: https://github.com/','tarball: https://other.invalid/'),version));
});

test('notes require this version and error reports exclude authorization secrets',()=>{
  const changelog='# Updates\n\n## 0.4.3 发布\n\n- 完整更新流程。\n\n## 0.4.2\n\n- 旧内容。\n';
  const notes=releaseNotes(changelog,version,'0.2.0-rc.2'); assert.match(notes,/完整更新流程/); assert.ok(!notes.includes('旧内容'));
  assert.throws(()=>releaseNotes(changelog,'0.5.0','0.2.0'),/CHANGELOG/);
  const error=safeError('https://www.npmjs.com/auth/cli/authorization-secret\nhttps://registry.npmjs.org/-/v1/done?authId=private-id npm_fakeToken ghp_fakeToken');
  assert.ok(!error.includes('authorization-secret')); assert.ok(!error.includes('private-id')); assert.ok(!error.includes('fakeToken'));
});
