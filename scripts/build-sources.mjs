#!/usr/bin/env node
/**
 * Inline assets/ and src/css/ into TypeScript modules.
 *
 * Unlike the Sakura build, the SVGs are stored RAW rather than encoded into
 * data URIs here. They are colour templates carrying {{TOKEN}} placeholders,
 * and the palette is not known until compose runs. Encoding early would mean
 * encoding a template with holes in it.
 *
 * Both outputs are gitignored. assets/ and src/css/ are the source of truth.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeIfChanged } from './lib/write-if-changed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = path.join(ROOT, 'assets');
const CSS_DIR = path.join(ROOT, 'src', 'css');
const LIB_DIR = path.join(ROOT, 'src', 'lib');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

function readDir(dir, ext, transform) {
  const files = fs.readdirSync(dir).filter((name) => name.endsWith(ext)).sort();
  if (files.length === 0) throw new Error(`no ${ext} files found in ${dir}`);

  const entries = {};
  for (const file of files) {
    entries[path.basename(file, ext)] = transform(fs.readFileSync(path.join(dir, file), 'utf8'), file);
  }
  return entries;
}

function main() {
  const assets = readDir(ASSET_DIR, '.svg', (svg, file) => {
    // A template with no placeholder is almost certainly a drawing that forgot
    // its colour tokens, which would ship as an invisible or black shape.
    if (!svg.includes('{{')) throw new Error(`${file} has no colour tokens, so it cannot follow the palette`);
    return svg.replace(/>\s+</g, '><').trim();
  });

  const css = readDir(CSS_DIR, '.css', minifyCss);

  const wroteAssets = writeIfChanged(
    path.join(LIB_DIR, 'assets.generated.ts'),
    `// GENERATED FILE. Do not edit.\n// Produced by scripts/build-sources.mjs from assets/.\n\n` +
      `export const ASSETS: Record<string, string> = ${JSON.stringify(assets, null, 2)};\n`
  );

  const wroteCss = writeIfChanged(
    path.join(LIB_DIR, 'css.generated.ts'),
    `// GENERATED FILE. Do not edit.\n// Produced by scripts/build-sources.mjs from src/css/.\n\n` +
      `export const CSS: Record<string, string> = ${JSON.stringify(css, null, 2)};\n`
  );

  if (!wroteAssets && !wroteCss) {
    console.log('[build-sources] unchanged');
    return;
  }

  const bytes = Object.values(assets).reduce((n, s) => n + s.length, 0);
  console.log(`[build-sources] assets=${Object.keys(assets).length} (${bytes} bytes) css=${Object.keys(css).length}`);
}

main();
