// Audit npm's exact package file list before uploading a Release asset.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const manifest = JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const input = JSON.parse((await readFile(process.argv[2] || '.test-runtime/pack-files.json','utf8')).replace(/^\uFEFF/,''));
assert.equal(input.length,1); const entry = input[0]; assert.equal(entry.name,manifest.name); assert.equal(entry.version,manifest.version,'packed version must match the current source manifest');
const allowed = /^(?:scripts\/update-dsh-github\.mjs$|src\/|runtime\/|lib\/|skills\/|docs\/|README\.md$|LICENSE$|package\.json$|cordis\.patch\.yml$)/;
const blocked = /(?:^|\/)(?:\.env(?:\..*)?|node_modules|\.git|\.dsh|novel-data|test-data|backups|releases|migration|\.cuigengji-upgrade-backups)(?:\/|$)|(?:^|\/)store(?:\.pending)?\.json$|\.(?:cuigengji|moji)\.json$/;
const files = new Set(entry.files.map(file => file.path));
for (const path of files) {assert.ok(allowed.test(path),`unapproved package path: ${path}`); assert.ok(!blocked.test(path),`private/runtime data: ${path}`); assert.ok(!/^runtime\/.*\.ts$/.test(path),`uncompiled runtime: ${path}`);}
for (const path of ['runtime/index.js','runtime/application/maintenance/upgrade.js','runtime/infrastructure/persistence/upgrade-backup.js','lib/client.js','skills/moji-maintenance/SKILL.md','docs/agent-installation.md','docs/upgrade.md','LICENSE']) assert.ok(files.has(path),`missing release capability: ${path}`);
console.log(JSON.stringify({ok:true,version:entry.version,files:files.size,unpackedBytes:entry.unpackedSize,privateData:false,compiledRuntime:true}));
