#!/usr/bin/env node
/**
 * Build a standalone preview page.
 *
 * Loading a theme into RemNote to look at a colour takes about a minute. This
 * mocks the RemNote surfaces the theme touches, using the real class names and
 * the real composed CSS, so a shade can be judged in a browser refresh.
 *
 * It is a mock. It proves colour, contrast, where the cats sit and how the
 * chase moves. It cannot prove a selector matches something in the real app,
 * which is what testing in RemNote is for.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compose } from '../src/lib/compose.ts';
import { SHADES } from '../src/lib/palettes.ts';
import { CAT_PRESENCE, CHASE_SPEEDS, DEFAULT_OPTIONS, HOODS } from '../src/lib/options.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'build', 'preview.html');

function buildVariants() {
  const variants = {};
  for (const shade of SHADES) {
    for (const cats of CAT_PRESENCE) {
      for (const hood of HOODS) {
        for (const chase of [false, true]) {
          const key = [shade.id, cats, hood, chase ? 'chase' : 'still'].join('|');
          variants[key] = compose({
            ...DEFAULT_OPTIONS,
            shade: shade.id,
            cats,
            hood,
            chase,
            chaseInterval: chase ? 12 : DEFAULT_OPTIONS.chaseInterval,
          });
        }
      }
    }
  }
  return variants;
}

const MOCK = `
<div class="rn-sidebar app-sidebar rn-clr-background-secondary">
  <div class="side-brand rn-clr-content-primary">Knowledge Base</div>
  <div class="side-item rn-clr-content-secondary">Daily Notes</div>
  <div class="side-item rn-clr-content-secondary">Flashcards</div>
  <div class="side-item active rn-clr-background-elevation-10 rn-clr-content-accent">Cats</div>
  <div class="side-item rn-clr-content-secondary">Reading List</div>
</div>
<div class="app-main rn-clr-background-primary">
  <div class="rn-editor">
    <h1 class="rn-doc-title">Felis catus</h1>
    <p class="rn-clr-content-secondary doc-sub">Edited 4 minutes ago &middot; 12 references</p>
    <div class="rn-editor-divider rn-divider"></div>
    <p class="rn-clr-content-primary">
      A loaf is a cat with its paws tucked underneath it. The shape is a
      <span class="rn-clr-content-accent">thermoregulation</span> strategy and, incidentally, the reason
      this theme draws them the way it does.
    </p>
    <p class="rn-clr-content-primary">
      This paragraph exists so there is enough body copy to judge whether text stays comfortable against a
      translucent background with a cat behind it. If it does not, the panel opacity is the dial to reach for.
    </p>
    <div class="rn-tag-container">loaf</div>
    <div class="rn-tag-container">pastel</div>
    <div class="rn-code-node mock-code">
      <div>html::before {</div>
      <div>&nbsp;&nbsp;background-image: var(--kone-cat-shark);</div>
      <div>}</div>
    </div>
    <div class="rn-dialog mock-dialog">
      <div class="rn-clr-content-primary card-title">A floating panel</div>
      <div class="rn-clr-content-secondary">Menus stay near opaque on purpose. This one sits over a cat.</div>
      <div class="btn-row">
        <button class="rn-button rn-clr-background-accent">Confirm</button>
        <button class="rn-button rn-clr-background-elevation-20 rn-clr-content-primary">Cancel</button>
      </div>
    </div>
  </div>
</div>`;

const PAGE_CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
  .app { display: flex; min-height: 100vh; position: relative; z-index: 1; }
  .app-sidebar { width: 210px; flex: none; padding: 18px 12px; }
  .side-brand { font-weight: 650; font-size: 13px; margin-bottom: 16px; }
  .side-item { font-size: 13px; padding: 7px 10px; border-radius: 8px; margin-bottom: 2px; }
  .app-main { flex: 1; padding: 40px 8px 120px; }
  .rn-editor { max-width: 720px; margin: 0 auto; padding: 0 20px; }
  .rn-doc-title { font-size: 34px; margin: 0 0 4px; }
  .doc-sub { font-size: 13px; margin: 0 0 18px; }
  .rn-editor-divider { height: 1px; margin: 18px 0; }
  .rn-editor p { line-height: 1.65; font-size: 15px; }
  .rn-tag-container { display: inline-block; font-size: 12px; padding: 3px 11px; margin: 2px 4px 2px 0; }
  .mock-code { padding: 16px 20px; margin: 22px 0; font: 12px/1.7 ui-monospace, monospace; }
  .mock-dialog { padding: 18px; margin-top: 26px; }
  .card-title { font-weight: 620; margin-bottom: 5px; font-size: 14px; }
  .btn-row { display: flex; gap: 8px; margin-top: 14px; }
  .rn-button { padding: 7px 16px; font-size: 13px; border: 0; cursor: pointer; font-family: inherit; color: #fff; }
  .controls { position: fixed; top: 12px; right: 12px; z-index: 500; background: rgba(20,20,24,.92); color: #fff;
    padding: 12px; border-radius: 12px; font: 12px/1.4 ui-monospace, monospace; display: grid; gap: 7px; }
  .controls label { display: grid; grid-template-columns: 74px 1fr; gap: 8px; align-items: center; }
  .controls select, .controls button { font: inherit; padding: 3px 6px; border-radius: 6px; border: 1px solid #555; background: #2a2a30; color: #fff; }
`;

/**
 * The artwork data URIs are large and identical across many variants, so they
 * are lifted out and swapped separately. Left inline the page reached megabytes.
 */
function hoistArt(variants) {
  const artLine = /^\s*--kone-(?:cat|chase)-[\w-]*: [^\n]*\n/gm;
  const blocks = new Map();
  const byVariant = {};

  for (const [key, css] of Object.entries(variants)) {
    const found = css.match(artLine);
    if (!found) continue;
    const block = found.join('');
    if (!blocks.has(block)) blocks.set(block, `a${blocks.size}`);
    byVariant[key] = blocks.get(block);
    variants[key] = css.replace(artLine, '');
  }

  const art = {};
  for (const [block, id] of blocks) art[id] = `:root {\n${block}}`;
  return { art, byVariant };
}

function main() {
  const variants = buildVariants();
  const { art, byVariant } = hoistArt(variants);

  const sel = (id, values, def) =>
    `<label>${id}<select id="${id}">${values
      .map((v) => `<option value="${v}"${v === def ? ' selected' : ''}>${v}</option>`)
      .join('')}</select></label>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Koneko preview</title><style>${PAGE_CSS}</style><style id="art"></style><style id="theme"></style></head>
<body>
<div class="app">${MOCK}</div>
<div class="controls">
  ${sel('shade', SHADES.map((s) => s.id), DEFAULT_OPTIONS.shade)}
  ${sel('cats', CAT_PRESENCE, DEFAULT_OPTIONS.cats)}
  ${sel('hood', HOODS, DEFAULT_OPTIONS.hood)}
  ${sel('chase', ['still', 'chase'], 'still')}
  <button id="mode" type="button">dark mode</button>
</div>
<script>
const VARIANTS = ${JSON.stringify(variants)};
const ART = ${JSON.stringify(art)};
const ART_BY = ${JSON.stringify(byVariant)};
const el = (id) => document.getElementById(id);
function apply() {
  const key = [el('shade').value, el('cats').value, el('hood').value, el('chase').value].join('|');
  const css = VARIANTS[key];
  if (!css) { console.error('no variant for', key); return; }
  el('art').textContent = ART[ART_BY[key]] || '';
  el('theme').textContent = css;
}
for (const id of ['shade','cats','hood','chase']) el(id).addEventListener('change', apply);
el('mode').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  el('mode').textContent = document.documentElement.classList.contains('dark') ? 'light mode' : 'dark mode';
});
apply();
</script></body></html>`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');
  console.log(
    `[preview] ${path.relative(ROOT, OUT)} variants=${Object.keys(variants).length} ` +
      `artBlocks=${Object.keys(art).length} ${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(0)} KB`
  );
  console.log(`[preview] open file://${OUT}`);
}

main();
