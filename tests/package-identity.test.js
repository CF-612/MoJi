import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm, symlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {parse} from 'yaml';
import {PACKAGE_NAME, LEGACY_PACKAGE_NAME, renamedBundles, renamedPatch} from '../src/infrastructure/migrations/package-identity.ts';
import {renameInstallation} from '../src/adapters/dsh/rename-installation.ts';

test('rename keeps bundle order and one active writing plugin', () => {
  assert.deepEqual(renamedBundles(['host', LEGACY_PACKAGE_NAME, 'market', PACKAGE_NAME]), ['host', PACKAGE_NAME, 'market']);
  assert.deepEqual(renamedBundles(['host', 'market']), ['host', 'market']);
});

test('qualified config survives either module name; content is not text-replaced', () => {
  const text = `# author config\n- id: cuigengji\n  name: dsh-cuigengji\n  disabled: false\n  config:\n    dataRoot: D:/custom novels\n    example: {id: cuigengji, name: dsh-cuigengji}\n- id: other\n  name: dsh-cuigengji\n- insert:\n    - id: cuigengji\n      name: dsh-cuigengji\n      config: {dataRoot: D:/custom novels}\n`;
  const result = renamedPatch(text), original = parse(text), next = parse(result.text);
  assert.equal(result.changed, 2);
  assert.ok(result.text.includes('# author config'));
  assert.deepEqual(next[0].config, original[0].config);
  assert.equal(next[0].disabled, false);
  assert.equal(next[0].name, undefined);
  assert.deepEqual(next[1], original[1]);
  assert.equal(next[2].insert[0].name, PACKAGE_NAME);
  assert.deepEqual(next[2].insert[0].config, original[2].insert[0].config);
  assert.deepEqual(renamedPatch(result.text), {text: result.text, changed: 0});
});

test('invalid configuration is refused instead of replaced', () => {
  assert.throws(() => renamedPatch('not: a-sequence'), /sequence/);
  assert.throws(() => renamedPatch('- id: [broken'));
});

async function fixture(t, installed = true) {
  const root = await mkdtemp(join(tmpdir(), 'cuigengji-package-rename-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const home = join(root, 'home'), profile = join(home, 'profiles', 'desktop');
  await mkdir(profile, {recursive: true});
  const manifest = {private: true, custom: {keep: true}, dependencies: {[LEGACY_PACKAGE_NAME]: 'old.tgz', [PACKAGE_NAME]: 'new.tgz'},
    dsh: {profile: {otherOption: 'preserved', bundles: ['host', LEGACY_PACKAGE_NAME, 'market', PACKAGE_NAME]}}};
  const profileText = JSON.stringify(manifest, null, 2) + '\n';
  const patch = '# original\n- id: cuigengji\n  name: dsh-cuigengji\n  disabled: false\n  config: {dataRoot: D:/authors/books}\n';
  await writeFile(join(profile, 'package.json'), profileText);
  await writeFile(join(profile, 'cordis.patch.yml'), patch);
  await writeFile(join(home, 'cordis.patch.yml'), patch);
  const prosePath = join(root, 'author.txt');
  await writeFile(prosePath, '这份正文不属于插件安装目录。');
  if (installed) {
    const packageRoot = join(profile, 'node_modules', PACKAGE_NAME);
    await mkdir(packageRoot, {recursive: true});
    await writeFile(join(packageRoot, 'package.json'), JSON.stringify({name: PACKAGE_NAME, version: '0.4.2', dsh: {bundle: {patch: './cordis.patch.yml'}}}));
  }
  return {home, profile, manifest, profileText, patch, prosePath};
}

test('preview and apply retain custom data roots, dependencies and originals; rerun is inert', async t => {
  const f = await fixture(t);
  const preview = await renameInstallation({profile: f.profile, home: f.home});
  assert.equal(preview.mode, 'preview');
  assert.equal(preview.backupPath, null);
  assert.equal(await readFile(join(f.profile, 'package.json'), 'utf8'), f.profileText);
  let guardCalls = 0;
  const assertStopped = () => guardCalls++;
  const applied = await renameInstallation({profile: f.profile, home: f.home, apply: true}, assertStopped);
  assert.equal(guardCalls, 3);
  assert.equal(applied.patchChanges, 2);
  const after = JSON.parse(await readFile(join(f.profile, 'package.json'), 'utf8'));
  assert.deepEqual(after.dependencies, f.manifest.dependencies);
  assert.deepEqual(after.custom, f.manifest.custom);
  assert.equal(after.dsh.profile.otherOption, 'preserved');
  assert.deepEqual(after.dsh.profile.bundles, ['host', PACKAGE_NAME, 'market']);
  for (const path of [join(f.profile, 'cordis.patch.yml'), join(f.home, 'cordis.patch.yml')]) {
    const row = parse(await readFile(path, 'utf8'))[0];
    assert.equal(row.config.dataRoot, 'D:/authors/books');
    assert.equal(row.disabled, false);
    assert.equal(row.name, undefined);
  }
  const backup = JSON.parse(await readFile(join(applied.backupPath, 'manifest.json'), 'utf8'));
  for (const entry of backup.files) {
    assert.equal(await readFile(join(applied.backupPath, entry.original), 'utf8'), entry.path.endsWith('package.json') ? f.profileText : f.patch);
  }
  assert.equal(await readFile(f.prosePath, 'utf8'), '这份正文不属于插件安装目录。');
  const again = await renameInstallation({profile: f.profile, home: f.home, apply: true}, assertStopped);
  assert.deepEqual(again.changedFiles, []);
  assert.equal(again.backupPath, null);
});

test('failed install and running host never disable the old bundle', async t => {
  const missing = await fixture(t, false);
  await assert.rejects(renameInstallation({profile: missing.profile, home: missing.home, apply: true}, () => {}), /ENOENT/);
  assert.equal(await readFile(join(missing.profile, 'package.json'), 'utf8'), missing.profileText);
  const live = await fixture(t);
  await assert.rejects(renameInstallation({profile: live.profile, home: live.home, apply: true}, () => {throw new Error('DSH is running');}), /running/);
  assert.equal(await readFile(join(live.profile, 'package.json'), 'utf8'), live.profileText);
  assert.equal(await readFile(join(live.profile, 'cordis.patch.yml'), 'utf8'), live.patch);
});

test('partially completed override migration can resume without altering author config', async t => {
  const f = await fixture(t);
  await writeFile(join(f.profile, 'cordis.patch.yml'), renamedPatch(f.patch).text);
  const result = await renameInstallation({profile: f.profile, home: f.home, apply: true}, () => {});
  assert.equal(result.patchChanges, 1);
  assert.deepEqual(result.bundles, ['host', PACKAGE_NAME, 'market']);
  assert.equal(parse(await readFile(join(f.profile, 'cordis.patch.yml'), 'utf8'))[0].config.dataRoot, 'D:/authors/books');
});

test('maintenance CLI executes through a linked installation path like pnpm', async t => {
  const f = await fixture(t);
  const linked = join(f.profile, 'linked-install');
  await symlink(fileURLToPath(new URL('../', import.meta.url)), linked, 'junction');
  const result = spawnSync(process.execPath, [join(linked, 'src/adapters/dsh/rename-installation.ts'), '--profile', f.profile, '--home', f.home],
    {encoding: 'utf8', windowsHide: true, timeout: 30000});
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.trim(), 'linked CLI must return its migration result');
  const preview = JSON.parse(result.stdout);
  assert.equal(preview.mode, 'preview');
  assert.deepEqual(preview.bundles, ['host', PACKAGE_NAME, 'market']);
  assert.equal(await readFile(join(f.profile, 'package.json'), 'utf8'), f.profileText);
});
