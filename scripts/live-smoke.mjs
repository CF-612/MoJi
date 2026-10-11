import { readFile, access, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

// Read-only installation check. RPC connectivity is checked by test:rpc.
const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const home = process.env.DSH_HOME || join(homedir(), '.dsh');
const profile = join(home, 'profiles', 'desktop');
const config = JSON.parse(await readFile(join(profile, 'package.json'), 'utf8'));
assert.ok(config.dsh?.profile?.bundles?.includes(manifest.name), 'desktop bundle is not enabled');
assert.ok(!config.dsh.profile.bundles.includes('dsh-cuigengji'), 'old and new bundles must not both be selected');
const installedRoot = join(profile, 'node_modules', manifest.name);
const installed = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'));
assert.equal(installed.version, manifest.version, 'installed package needs updating');
assert.equal(installed.engines.dsh, manifest.engines.dsh, 'DSH compatibility target differs');
await access(join(installedRoot, installed.main));
await access(join(installedRoot, 'lib', 'client.js'));

// The local build can change without a version bump. Compare actual installed
// files so an old same-version package cannot be reported as the new build.
async function filesUnder(directory, relative = '') {
  const result = [];
  for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(directory, path));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}
const checkedFiles = [
  'package.json', join('lib', 'client.js'),
  ...await filesUnder(join(root, 'runtime')).then(files => files.map(path => join('runtime', path))),
  ...await filesUnder(join(root, 'skills')).then(files => files.map(path => join('skills', path))),
];
for (const file of checkedFiles) {
  const expected = await readFile(join(root, file));
  const actual = await readFile(join(installedRoot, file)).catch(error => {
    throw new Error(`Installed plugin is missing ${file}; install the current local build.`, { cause: error });
  });
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest(actual), digest(expected), `Installed file is stale: ${file}; install the current local build.`);
}
console.log(JSON.stringify({ ok: true, check: 'installed-files', pluginVersion: installed.version,
  supportedDsh: installed.engines.dsh, profile: 'desktop', dshHome: home, checkedFiles: checkedFiles.length }));
