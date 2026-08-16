/**
 * The shades.
 *
 * Colours are hex here, not "r, g, b" triplets as in the Sakura theme, because
 * these values are substituted into SVG artwork as well as into CSS. SVG needs
 * a real colour; CSS needs channels so a surface can be drawn at partial alpha.
 * `triplet()` converts on the way into the stylesheet, so hex stays the single
 * source and nothing is written twice.
 *
 * Every shade defines both a light and a dark palette. RemNote applies a `dark`
 * class when dark mode is on, not necessarily to the root element, so both are
 * always needed. See compose.ts for how that selector is handled.
 *
 * The dark palettes are not near black. A pastel theme that drops to charcoal
 * keeps its cats and loses its character, so these hold a tinted ground and the
 * contrast that remains is checked by tests rather than by eye.
 */

export interface Palette {
  /** Page background, top and bottom of the vertical wash. */
  bgTop: string;
  bgBottom: string;
  /** Panels and sidebars. */
  surface: string;
  /** Cards, dialogs and menus, which sit above the page. */
  elevated: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  border: string;

  /** Artwork. These are the tokens the SVG templates carry. */
  fur: string;
  tabby: string;
  dark: string;
  pink: string;
  hood: string;
  hoodLight: string;
  cream: string;
  crust: string;
  line: string;
  yarn: string;
  /** Strawberry red and its leafy crown. Separate from `hood`, which is the
   * shade's own costume colour and is blue in Samecat, where a blue strawberry
   * reads as a swim cap. */
  berry: string;
  leaf: string;
}

export interface Shade {
  id: string;
  name: string;
  description: string;
  light: Palette;
  dark: Palette;
}

/** The artwork tokens, mapped to the palette keys that fill them. */
export const ART_TOKENS = {
  FUR: 'fur',
  TABBY: 'tabby',
  DARK: 'dark',
  PINK: 'pink',
  HOOD: 'hood',
  HOOD_LIGHT: 'hoodLight',
  CREAM: 'cream',
  CRUST: 'crust',
  LINE: 'line',
  YARN: 'yarn',
  BERRY: 'berry',
  LEAF: 'leaf',
} as const satisfies Record<string, keyof Palette>;

/** "#8fb2c4" -> "143, 178, 196", for rgba() in the stylesheet. */
export function triplet(hex: string): string {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const n = Number.parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export const SHADES: Shade[] = [
  {
    id: 'samecat',
    name: 'Samecat',
    description: 'Shark hood blue over cream. The default.',
    light: {
      bgTop: '#eef5f8',
      bgBottom: '#e2edf2',
      surface: '#e8f1f5',
      elevated: '#fbfdfe',
      text: '#2f3a42',
      textMuted: '#6d7c86',
      accent: '#3f7791',
      accentSoft: '#cfe2ea',
      border: '#c8dce4',
      fur: '#fdf6ee',
      tabby: '#d9a066',
      dark: '#3d4a52',
      pink: '#f0a9b4',
      hood: '#8fb2c4',
      hoodLight: '#dbe6ec',
      cream: '#fffdf8',
      crust: '#c98f52',
      line: '#6b5c57',
      yarn: '#e8918f',
      berry: '#e2798c',
      leaf: '#8fbb84',
    },
    dark: {
      bgTop: '#26313a',
      bgBottom: '#1c252c',
      surface: '#2e3a44',
      elevated: '#39464f',
      text: '#e9f1f5',
      textMuted: '#a5b6c0',
      accent: '#8fc0d8',
      accentSoft: '#3c4f5c',
      border: '#46545e',
      fur: '#f6efe6',
      tabby: '#d9a066',
      dark: '#2b343a',
      pink: '#eda3ae',
      hood: '#7ea6ba',
      hoodLight: '#c3d4dd',
      cream: '#fffdf8',
      crust: '#c2874c',
      line: '#4a4340',
      yarn: '#e8918f',
      berry: '#d8788a',
      leaf: '#7fae74',
    },
  },
  {
    id: 'ichigo',
    name: 'Ichigo',
    description: 'Strawberry milk. Blush pink with warm cream.',
    light: {
      bgTop: '#fdf0f2',
      bgBottom: '#f9e3e8',
      surface: '#fbe9ed',
      elevated: '#fffbfc',
      text: '#42323a',
      textMuted: '#8a7078',
      accent: '#b85068',
      accentSoft: '#f7d5dd',
      border: '#eecdd5',
      fur: '#fdf6ee',
      tabby: '#dda36b',
      dark: '#413740',
      pink: '#ef97a8',
      hood: '#ee8fa0',
      hoodLight: '#f8dde2',
      cream: '#fffdf9',
      crust: '#cf9257',
      line: '#6d5359',
      yarn: '#c96b83',
      berry: '#e07189',
      leaf: '#93bd86',
    },
    dark: {
      bgTop: '#33262c',
      bgBottom: '#271c21',
      surface: '#3d2e35',
      elevated: '#4a3840',
      text: '#f6e9ed',
      textMuted: '#bfa3ac',
      accent: '#e896ab',
      accentSoft: '#563e47',
      border: '#5a444d',
      fur: '#f7f0e8',
      tabby: '#d79c65',
      dark: '#2f2830',
      pink: '#ec93a4',
      hood: '#d97f92',
      hoodLight: '#e6c3cb',
      cream: '#fffdf9',
      crust: '#c2874c',
      line: '#4d3b40',
      yarn: '#d97f92',
      berry: '#d4788e',
      leaf: '#7fae74',
    },
  },
  {
    id: 'matcha',
    name: 'Matcha',
    description: 'Soft green tea with a cream top.',
    light: {
      bgTop: '#eff5ec',
      bgBottom: '#e4eddf',
      surface: '#eaf2e6',
      elevated: '#fbfdfa',
      text: '#333c30',
      textMuted: '#6f7c69',
      accent: '#4e7343',
      accentSoft: '#d8e6d0',
      border: '#cddcc4',
      fur: '#fdf7ec',
      tabby: '#d5a05f',
      dark: '#37423a',
      pink: '#eda6ad',
      hood: '#94b784',
      hoodLight: '#dfe9d8',
      cream: '#fffdf6',
      crust: '#c48c4e',
      line: '#5d6154',
      yarn: '#d98f77',
      berry: '#dd7f7f',
      leaf: '#94b784',
    },
    dark: {
      bgTop: '#28302a',
      bgBottom: '#1e241f',
      surface: '#313a32',
      elevated: '#3c463d',
      text: '#ebf2e7',
      textMuted: '#a8b5a3',
      accent: '#a3c992',
      accentSoft: '#3f4d3f',
      border: '#4a554a',
      fur: '#f5efe3',
      tabby: '#d3a063',
      dark: '#2a322c',
      pink: '#e79fa8',
      hood: '#85a877',
      hoodLight: '#c6d4bd',
      cream: '#fffdf6',
      crust: '#bd8749',
      line: '#454a40',
      yarn: '#cf8570',
      berry: '#d07575',
      leaf: '#85a877',
    },
  },
  {
    id: 'purin',
    name: 'Purin',
    description: 'Custard pudding. Butter yellow and caramel.',
    light: {
      bgTop: '#fdf6e6',
      bgBottom: '#f8ebd4',
      surface: '#fbf1de',
      elevated: '#fffcf5',
      text: '#413628',
      textMuted: '#88755b',
      accent: '#9c6a22',
      accentSoft: '#f6e0b8',
      border: '#edd9b4',
      fur: '#fdf8ef',
      tabby: '#d99f5c',
      dark: '#403626',
      pink: '#efa5aa',
      hood: '#e8b75c',
      hoodLight: '#f8e6c2',
      cream: '#fffdf6',
      crust: '#c07f3c',
      line: '#6a563d',
      yarn: '#c98a4e',
      berry: '#de8272',
      leaf: '#9cbd7e',
    },
    dark: {
      bgTop: '#332b1f',
      bgBottom: '#272117',
      surface: '#3d3325',
      elevated: '#4a3f2e',
      text: '#f7eedd',
      textMuted: '#c0ac8c',
      accent: '#e0ae5c',
      accentSoft: '#564730',
      border: '#5a4c36',
      fur: '#f7f1e5',
      tabby: '#d59a58',
      dark: '#2f2820',
      pink: '#eaa0a6',
      hood: '#d4a24d',
      hoodLight: '#e5cf9f',
      cream: '#fffdf6',
      crust: '#b5773a',
      line: '#4c3f2d',
      yarn: '#bd8046',
      berry: '#d1786a',
      leaf: '#8aab6e',
    },
  },
];

export const DEFAULT_SHADE = 'samecat';

export function findShade(id: string): Shade | undefined {
  return SHADES.find((shade) => shade.id === id);
}
