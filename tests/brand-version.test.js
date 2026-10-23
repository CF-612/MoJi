import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../package.json' with {type:'json'};
import vendorManifest from '../integrations/chatgpt-workbench/vendor/cuigengji/package.json' with {type:'json'};
import {brand} from '../src/domain/brand.js';
import {brand as embeddedBrand} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/brand.js';

test('local and embedded About/Settings use their actual package versions',()=>{
  assert.equal(brand.version,manifest.version);
  assert.equal(embeddedBrand.version,vendorManifest.version);
});

import {mkdtemp, mkdir, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {defaultDataRoot, name} from '../src/index.js';
import {TOOL_ACTIONS} from '../src/contracts/actions.js';
test('public package and tool identities use Moji', async()=>{
  assert.equal(manifest.name,'dsh-moji');
  assert.equal(name,'moji');
  assert.equal(brand.englishName,'Moji');
  assert.ok(Object.keys(TOOL_ACTIONS).every(key=>key.startsWith('moji_')));
  assert.match(await readFile(new URL('../cordis.patch.yml',import.meta.url),'utf8'),/name: dsh-moji/);
});
test('fresh Moji storage does not move or ignore an existing legacy data directory',async()=>{
  const root=await mkdtemp(join(tmpdir(),'moji-brand-'));
  try {
    assert.equal(defaultDataRoot(root),join(root,'moji'));
    await mkdir(join(root,'cuigengji'));
    assert.equal(defaultDataRoot(root),join(root,'cuigengji'));
    await mkdir(join(root,'moji'));
    assert.equal(defaultDataRoot(root),join(root,'cuigengji'));
  } finally {await rm(root,{recursive:true,force:true});}
});
