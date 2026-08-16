#!/usr/bin/env node
/**
 * Generate the artwork as SVG templates.
 *
 * These are NOT finished SVGs: they carry {{TOKEN}} placeholders that compose
 * fills from the active palette. That is what lets one drawing serve every
 * shade while still being full colour.
 *
 * Regenerate with `npm run art`, then commit the result. Writes only on change,
 * because webpack runs this before every compile and also watches the directory
 * it writes into; an unconditional write is an infinite compile loop.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeCatSvg, HOOD_NAMES } from './lib/cat.mjs';
import { makeYarnSvg, makeRunnerSvg } from './lib/chase.mjs';
import { makeBedSvg, makeShelfSvg } from './lib/scenes.mjs';
import { writeIfChanged } from './lib/write-if-changed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets');

const ASSETS = {
  'chase-yarn.svg': makeYarnSvg(),
  // Two poses of the same cat, alternated by the stylesheet to animate the run.
  'chase-runner.svg': makeRunnerSvg({ phase: 'a' }),
  'chase-runner-b.svg': makeRunnerSvg({ phase: 'b' }),
  'scene-bed.svg': makeBedSvg(),
  'scene-shelf.svg': makeShelfSvg(),
};

for (const hood of HOOD_NAMES) {
  ASSETS[`cat-${hood}.svg`] = makeCatSvg({ hood });
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let changed = 0;
  for (const [name, svg] of Object.entries(ASSETS)) {
    if (writeIfChanged(path.join(OUT_DIR, name), svg + '\n')) {
      changed++;
      console.log(`[gen-art] ${name} ${Buffer.byteLength(svg, 'utf8')} bytes`);
    }
  }
  if (changed === 0) console.log('[gen-art] unchanged');
}

main();
