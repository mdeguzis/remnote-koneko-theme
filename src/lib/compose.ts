/**
 * Turn a set of options into the finished stylesheet.
 *
 * Single source of truth for the CSS. Both builds call it: the theme zip once
 * at build time with fixed options, because a RemNote theme cannot contain
 * JavaScript, and the plugin again on every settings change. One function means
 * the two artifacts cannot drift.
 *
 * COLOUR SUBSTITUTION
 * -------------------
 * The artwork is stored as SVG templates carrying {{TOKEN}} placeholders, and
 * the active palette is substituted in here before the SVG is encoded into a
 * data URI.
 *
 * The Sakura theme could not do this and drew single-colour alpha masks
 * instead, on the reasoning that baking colour meant a copy per shade and
 * roughly 300 KB of duplicates. That was half wrong: compose only ever emits
 * ONE shade, so baking costs one copy, not one per palette. A cat needs fur,
 * tabby, eyes, pink and a hood colour at once, which a mask cannot carry at
 * all, so the correction matters here.
 */

import { ASSETS } from './assets.generated.ts';
import { CSS } from './css.generated.ts';
import { encodeSvg } from './encode.ts';
import { ART_TOKENS, DEFAULT_SHADE, findShade, triplet, type Palette } from './palettes.ts';
import {
  CAT_OPACITY,
  CAT_SLOTS,
  CHASE_DURATION,
  castSlots,
  normalizeOptions,
  type KoneOptions,
} from './options.ts';

/** Emit one palette's surface colours as CSS channels. */
function paletteVars(palette: Palette): string {
  return [
    ['bg-top', palette.bgTop],
    ['bg-bottom', palette.bgBottom],
    ['surface', palette.surface],
    ['elevated', palette.elevated],
    ['text', palette.text],
    ['text-muted', palette.textMuted],
    ['accent', palette.accent],
    ['accent-soft', palette.accentSoft],
    ['border', palette.border],
  ]
    .map(([name, hex]) => `  --kone-${name}: ${triplet(hex)};`)
    .join('\n');
}

/**
 * Fill an artwork template with the palette and encode it.
 *
 * A template that still contains a placeholder would reach the browser as a
 * literal `{{FUR}}` fill, which paints nothing and is invisible until someone
 * notices a missing cat. Better to fail here.
 */
function artUrl(template: string, palette: Palette, name: string): string {
  let svg = template;

  for (const [token, key] of Object.entries(ART_TOKENS)) {
    svg = svg.split(`{{${token}}}`).join(palette[key]);
  }

  const leftover = /\{\{(\w+)\}\}/.exec(svg);
  if (leftover) {
    throw new Error(`artwork "${name}" has an unfilled placeholder: {{${leftover[1]}}}`);
  }

  return `url("${encodeSvg(svg)}")`;
}

/**
 * The artwork, as data URI values for the active palette.
 *
 * Pieces that are switched off resolve to `none`, which is valid for one layer
 * of a multi-value background and costs nothing to composite. They cannot be
 * removed by dropping a rule, because several share one element.
 */
function artVars(palette: Palette, options: KoneOptions): string {
  const lines: string[] = [];

  // The cats are emitted per SLOT, not per costume. Each slot resolves to
  // whichever cat was cast into it, so the stylesheet can hold placement fixed
  // while the costumes change underneath. Only the four cast costumes are
  // encoded; the others are never inlined.
  const cast = castSlots(options.hood);

  for (const slot of CAT_SLOTS) {
    const name = `cat-${cast[slot]}`;
    const template = ASSETS[name];

    if (!template) {
      throw new Error(`slot "${slot}" was cast as "${cast[slot]}" but there is no artwork "${name}"`);
    }

    const value = options.cats === 'off' ? 'none' : artUrl(template, palette, name);
    lines.push(`  --kone-slot-${slot}: ${value};`);
  }

  for (const [name, template] of Object.entries(ASSETS)) {
    if (!name.startsWith('chase-')) continue;
    const value = options.chase ? artUrl(template, palette, name) : 'none';
    lines.push(`  --kone-${name}: ${value};`);
  }

  return lines.join('\n');
}

/**
 * Where the chase starts and ends, in vw. Must match the element widths in
 * chase.css: both pieces finish past the right edge so neither parks in view
 * during the wait, and both start past the left edge so the loop point is never
 * seen.
 */
const CHASE_TRACK = { leadStart: -12, trailStart: -32, end: 112 } as const;

/** The yarn ball's width in vw, from chase.css. Sets how fast it rolls. */
const YARN_WIDTH_VW = 3.4;

/**
 * The chase keyframes.
 *
 * Generated rather than written in the stylesheet because a keyframe stop has
 * to be a literal percentage. A custom property cannot appear there, and the
 * stops depend on the interval and speed the user chose.
 *
 * Two separate sets, one per piece, sharing a duration. The cat starts further
 * left and therefore finishes later, which is the whole of the lag: it is
 * geometry, not timing, so the cat cannot overtake the ball at any interval or
 * speed. An earlier version separated them with a negative `animation-delay`,
 * which ADVANCES an animation rather than holding it back and put the cat in
 * front of the ball it was chasing.
 *
 * The ball's rotation is derived from the distance it covers divided by its own
 * circumference, so it turns at the rate a ball that size actually would. A
 * round number of turns would visibly slip.
 *
 * Everything after the crossing holds both pieces off the right edge, which is
 * what produces the gap without any JavaScript timer.
 */
function chaseKeyframes(crossFraction: number): string {
  const { leadStart, trailStart, end } = CHASE_TRACK;
  const leadTravel = end - leadStart;
  const trailTravel = end - trailStart;

  // The duration is what the CAT needs, since it has the longer run. The ball
  // covers less ground at the same speed, so it arrives proportionally sooner.
  const catPercent = crossFraction * 100;
  const yarnPercent = catPercent * (leadTravel / trailTravel);

  const spin = (leadTravel / (Math.PI * YARN_WIDTH_VW)) * 360;

  return `@keyframes kone-chase-yarn {
  0% { transform: translateX(${leadStart}vw) rotate(0deg); }
  ${yarnPercent.toFixed(2)}% { transform: translateX(${end}vw) rotate(${spin.toFixed(0)}deg); }
  100% { transform: translateX(${end}vw) rotate(${spin.toFixed(0)}deg); }
}

@keyframes kone-chase-cat {
  0% { transform: translateX(${trailStart}vw); }
  ${catPercent.toFixed(2)}% { transform: translateX(${end}vw); }
  100% { transform: translateX(${end}vw); }
}`;
}

export function compose(rawOptions: Partial<KoneOptions>): string {
  const options = normalizeOptions(rawOptions);
  const shade = findShade(options.shade) ?? findShade(DEFAULT_SHADE);

  if (!shade) {
    throw new Error(`no shade found for "${options.shade}" and no default available`);
  }

  const duration = CHASE_DURATION[options.chaseSpeed];

  // The gap between crossings is made by animating for the whole interval and
  // confining the movement to the slice of the timeline the crossing occupies.
  // CSS has no "wait then run" without JavaScript, and this needs neither.
  const crossFraction = Math.min(0.9, duration / options.chaseInterval);

  const parts: string[] = [];

  parts.push(`/* Koneko for RemNote - shade: ${shade.name} */`);

  parts.push(`:root {
${artVars(shade.light, options)}

${paletteVars(shade.light)}

  --kone-cat-opacity: ${CAT_OPACITY[options.cats]};
  --kone-panel-opacity: ${(options.panelOpacity / 100).toFixed(3)};
  --kone-panel-blur: ${options.panelOpacity === 0 ? 'none' : 'blur(8px) saturate(115%)'};
  --kone-chase-duration: ${options.chaseInterval}s;
  --kone-chase-cross: ${(crossFraction * 100).toFixed(2)}%;
}`);

  // Dark mode has to land on the ROOT element, not on whichever element RemNote
  // puts its `dark` class on. The docs demonstrate dark mode as `.dark div`, a
  // descendant selector, so the class may sit on a wrapper; `html.dark` alone
  // left every surface on the light palette in the real app. The values also
  // have to be declared on the root because custom properties set on a nested
  // element cannot reach `html::before`, where the artwork is drawn.
  parts.push(`html.dark,
html:has(.dark) {
${artVars(shade.dark, options)}

${paletteVars(shade.dark)}
}`);

  parts.push(CSS.base);

  if (options.cats !== 'off') {
    parts.push(CSS.cats);
  }
  if (options.chase) {
    parts.push(CSS.chase);
    parts.push(chaseKeyframes(crossFraction));
  }

  return parts.join('\n\n');
}
