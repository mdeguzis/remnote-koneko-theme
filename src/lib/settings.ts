import type { RNPlugin } from '@remnote/plugin-sdk';

import { compose } from './compose.ts';
import {
  normalizeOptions,
  type CatPresence,
  type ChaseSpeed,
  type Hood,
  type KoneOptions,
} from './options.ts';

/**
 * Setting ids.
 *
 * RemNote persists a setting the first time it is seen and never re-applies
 * `defaultValue`, so changing a default in code reaches nobody who already has
 * the plugin. Bump a suffix here when a default has to reach existing installs.
 */
export const SETTINGS = {
  shade: 'shade',
  cats: 'cats',
  hood: 'hood',
  chase: 'chase',
  chaseInterval: 'chase-interval',
  chaseSpeed: 'chase-speed',
  tintStrength: 'tint-strength',
  panelOpacity: 'panel-opacity',
} as const;

/** One reader for every caller, so they cannot disagree about what is in effect. */
export async function readOptions(plugin: RNPlugin): Promise<KoneOptions> {
  return normalizeOptions({
    shade: await plugin.settings.getSetting<string>(SETTINGS.shade),
    cats: await plugin.settings.getSetting<CatPresence>(SETTINGS.cats),
    hood: await plugin.settings.getSetting<Hood>(SETTINGS.hood),
    chase: await plugin.settings.getSetting<boolean>(SETTINGS.chase),
    chaseInterval: await plugin.settings.getSetting<number>(SETTINGS.chaseInterval),
    chaseSpeed: await plugin.settings.getSetting<ChaseSpeed>(SETTINGS.chaseSpeed),
    tintStrength: await plugin.settings.getSetting<number>(SETTINGS.tintStrength),
    panelOpacity: await plugin.settings.getSetting<number>(SETTINGS.panelOpacity),
  });
}

/**
 * A report worth pasting into a bug thread.
 *
 * Includes the emitted CSS variables, not just the option values. The gap
 * between "the setting says X" and "the stylesheet says X" is where these bugs
 * live, and showing only the options hides exactly that.
 */
export function buildDebugReport(options: KoneOptions): string {
  const css = compose(options);
  const vars = (css.match(/--kone-(?:cat-opacity|panel-\w+|chase-\w+): [^;]+;/g) || [])
    .map((line) => `  ${line}`)
    .join('\n');

  const emitted = [
    css.includes('html::before') ? 'cats' : null,
    css.includes('@keyframes kone-chase') ? 'chase' : null,
  ].filter(Boolean);

  return [
    '--- koneko debug ---',
    `options:   ${JSON.stringify(options)}`,
    `css bytes: ${css.length}`,
    `emitted:   ${emitted.join(', ') || 'none'}`,
    '',
    'variables:',
    vars || '  (none emitted)',
    '',
    `platform:  ${typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent}`,
    '--- end ---',
  ].join('\n');
}
