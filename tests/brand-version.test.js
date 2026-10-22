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
