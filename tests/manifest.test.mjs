import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

test('the plugin manifest version matches package.json', () => {
  // The theme manifest is generated from package.json, but the plugin manifest
  // is written by hand. Nothing else keeps the two in step, so the plugin can
  // ship claiming a version it is not. Bumping one and forgetting the other is
  // the easiest mistake here and the hardest to notice.
  const pkg = read('package.json');
  const { major, minor, patch } = read('public/manifest.json').version;

  assert.equal(`${major}.${minor}.${patch}`, pkg.version);
});

test('the checked in manifest carries the real id, not a dev one', () => {
  // The "-dev" suffix exists only to stop a development build colliding with an
  // installed release, and webpack applies it on the way into the bundle. If it
  // ever appears in the source manifest it would ship, and the released plugin
  // would install under the wrong id.
  const manifest = read('public/manifest.json');
  assert.doesNotMatch(manifest.id, /-dev$/, `manifest id is "${manifest.id}"`);
  assert.doesNotMatch(manifest.name, /\(dev\)/, `manifest name is "${manifest.name}"`);
});

test('the plugin bundle carries the files RemNote requires', () => {
  // RemNote's uploader rejects a manifest declaring "theme" if the zip has no
  // theme.css: "Theme plugins must include a theme.css file." That rule appears
  // nowhere in the submission documentation, so nothing but a failed upload
  // would reveal it again.
  for (const file of ['manifest.json', 'theme.css']) {
    assert.ok(fs.existsSync(path.join(ROOT, 'public', file)), `public/${file} is missing`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, 'logo.png')), 'logo.png is missing');
});
