import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';

import { compose } from '../lib/compose.ts';
import { SHADES } from '../lib/palettes.ts';
import { SETTINGS, readOptions } from '../lib/settings.ts';
import {
  CAT_PRESENCE,
  CHASE_INTERVAL_MAX,
  CHASE_INTERVAL_MIN,
  CHASE_SPEEDS,
  DEFAULT_OPTIONS,
  HOODS,
  type CatPresence,
  type ChaseSpeed,
  type Hood,
} from '../lib/options.ts';

const LOG_PREFIX = '[koneko]';

/** The registerCSS id this plugin owns. Re-registering it replaces the sheet. */
const CSS_KEY = 'koneko-theme';

const CAT_LABELS: Record<CatPresence, string> = {
  off: 'Off',
  subtle: 'Subtle',
  normal: 'Normal',
  bold: 'Bold',
};

const HOOD_LABELS: Record<Hood, string> = {
  shark: 'Shark',
  bunny: 'Bunny',
  bread: 'Bread',
  strawberry: 'Strawberry',
  none: 'No costume',
};

const SPEED_LABELS: Record<ChaseSpeed, string> = {
  amble: 'Amble',
  trot: 'Trot',
  dash: 'Dash',
};

async function onActivate(plugin: ReactRNPlugin) {
  try {
    await registerEverything(plugin);
  } catch (error) {
    // A throw here leaves the plugin loaded but inert, with nothing in the UI
    // to say why. Surfacing it beats a silently unstyled app.
    console.error(`${LOG_PREFIX} activation failed`, error);
    await plugin.app.toast('Koneko failed to start. Run "Koneko: Show debug info" for details.');
  }
}

async function registerEverything(plugin: ReactRNPlugin) {
  await plugin.settings.registerDropdownSetting({
    id: SETTINGS.shade,
    title: 'Shade',
    description: 'Which pastel palette to use. Each one carries its own light and dark mode.',
    defaultValue: DEFAULT_OPTIONS.shade,
    options: SHADES.map((shade) => ({
      key: shade.id,
      label: `${shade.name} - ${shade.description}`,
      value: shade.id,
    })),
  });

  await plugin.settings.registerDropdownSetting({
    id: SETTINGS.cats,
    title: 'Corner cats',
    description: 'How strongly the cats show behind the interface.',
    defaultValue: DEFAULT_OPTIONS.cats,
    options: CAT_PRESENCE.map((value) => ({ key: value, label: CAT_LABELS[value], value })),
  });

  await plugin.settings.registerDropdownSetting({
    id: SETTINGS.hood,
    title: 'Costume',
    description:
      'What the featured cat wears. The other corners take the remaining costumes, so the collage stays varied.',
    defaultValue: DEFAULT_OPTIONS.hood,
    options: HOODS.map((value) => ({ key: value, label: HOOD_LABELS[value], value })),
  });

  await plugin.settings.registerNumberSetting({
    id: SETTINGS.panelOpacity,
    title: 'Panel opacity',
    description:
      'How solid the inset panels are, from 0 to 100. Affects code blocks, the editor container and other surfaces RemNote insets. Lower lets more of the cats through, higher keeps text flatter to read. 0 removes the panel entirely, 100 makes it solid.',
    defaultValue: DEFAULT_OPTIONS.panelOpacity,
  });

  await plugin.settings.registerBooleanSetting({
    id: SETTINGS.chase,
    title: 'Yarn chase',
    description:
      'Send a ball of yarn rolling across the bottom of the window with a cat after it. Off by default, and it holds still if your system asks for reduced motion.',
    defaultValue: DEFAULT_OPTIONS.chase,
  });

  await plugin.settings.registerNumberSetting({
    id: SETTINGS.chaseInterval,
    title: 'Chase interval (seconds)',
    description: `How long between one chase and the next, from ${CHASE_INTERVAL_MIN} to ${CHASE_INTERVAL_MAX}. Only applies when the yarn chase is on.`,
    defaultValue: DEFAULT_OPTIONS.chaseInterval,
  });

  await plugin.settings.registerDropdownSetting({
    id: SETTINGS.chaseSpeed,
    title: 'Chase speed',
    description: 'How fast the crossing itself is. Only applies when the yarn chase is on.',
    defaultValue: DEFAULT_OPTIONS.chaseSpeed,
    options: CHASE_SPEEDS.map((value) => ({ key: value, label: SPEED_LABELS[value], value })),
  });

  await plugin.app.registerWidget('debug_report', WidgetLocation.Popup, {
    dimensions: { height: 'auto', width: 560 },
  });

  await plugin.app.registerCommand({
    id: 'koneko-debug',
    name: 'Koneko: Show debug info',
    description: 'Open a readable, copyable report of what the theme is actually doing',
    action: async () => {
      await plugin.widget.openPopup('debug_report');
    },
  });

  // Re-runs whenever any setting changes, which is what makes the dropdowns
  // feel live rather than needing a reload.
  plugin.track(async (reactivePlugin) => {
    const options = await readOptions(reactivePlugin as ReactRNPlugin);
    const css = compose(options);
    await reactivePlugin.app.registerCSS(CSS_KEY, css);

    console.debug(`${LOG_PREFIX} applied stylesheet`, {
      ...options,
      cssBytes: css.length,
      source: 'settings.getSetting',
      cssKey: CSS_KEY,
    });
  });

  console.debug(`${LOG_PREFIX} activated`, { shades: SHADES.map((s) => s.id) });
}

/**
 * Clear the stylesheet on deactivate, or the theme stays applied after the
 * plugin is disabled, which reads as a broken app rather than a disabled one.
 */
async function onDeactivate(plugin: ReactRNPlugin) {
  await plugin.app.registerCSS(CSS_KEY, '');
  console.debug(`${LOG_PREFIX} deactivated, cleared css`, { cssKey: CSS_KEY });
}

declareIndexPlugin(onActivate, onDeactivate);
