/** Everything the user can change, and what it does. */

export type CatPresence = 'off' | 'subtle' | 'normal' | 'bold';
export type Hood = 'shark' | 'bunny' | 'bread' | 'strawberry' | 'none';
export type ChaseSpeed = 'amble' | 'trot' | 'dash';

export interface KoneOptions {
  shade: string;
  /** How strongly the corner cats show behind the interface. */
  cats: CatPresence;
  /** Which costume the cats wear. */
  hood: Hood;
  /**
   * A yarn ball rolls across the bottom and a cat chases it.
   *
   * Off by default. Motion that crosses the window is the kind of thing that
   * delights once and distracts afterwards, so it is opt in.
   */
  chase: boolean;
  /** Seconds between one chase and the next. */
  chaseInterval: number;
  chaseSpeed: ChaseSpeed;
  /**
   * Opacity of the inset panels, as a percentage.
   *
   * Drives `--current-background-color`, which RemNote paints code blocks, the
   * editor container and other inset surfaces with. 0 removes the panel and
   * content sits on the artwork; 100 is solid.
   */
  panelOpacity: number;
}

export const DEFAULT_OPTIONS: KoneOptions = {
  shade: 'samecat',
  cats: 'normal',
  hood: 'shark',
  chase: false,
  chaseInterval: 60,
  chaseSpeed: 'trot',
  panelOpacity: 75,
};

/** Opacity of the cat layer for each presence setting. */
export const CAT_OPACITY: Record<CatPresence, number> = {
  off: 0,
  subtle: 0.2,
  normal: 0.38,
  bold: 0.6,
};

/** Seconds the crossing itself takes, independent of the gap between them. */
export const CHASE_DURATION: Record<ChaseSpeed, number> = {
  amble: 14,
  trot: 9,
  dash: 5,
};

export const CAT_PRESENCE: CatPresence[] = ['off', 'subtle', 'normal', 'bold'];
export const HOODS: Hood[] = ['shark', 'bunny', 'bread', 'strawberry', 'none'];

/**
 * How many cats the collage places, and in what order they are cast.
 *
 * The chosen costume takes the hero slot and the rest are filled from the
 * remaining costumes, so the corners hold four different cats rather than four
 * copies of one. Slot names are placements; they carry no costume meaning.
 */
export const CAT_SLOTS = ['hero', 'companion', 'left', 'top'] as const;
export type CatSlot = (typeof CAT_SLOTS)[number];

/**
 * Cast the collage.
 *
 * `none` is excluded from the supporting slots because a plain cat next to a
 * costumed one reads as a missing costume rather than a deliberate choice. It
 * is still available as the hero, for anyone who wants no costumes at all.
 */
export function castSlots(featured: Hood): Record<CatSlot, Hood> {
  const supporting = HOODS.filter((hood) => hood !== featured && hood !== 'none');
  const cast = {} as Record<CatSlot, Hood>;

  cast.hero = featured;
  for (const [index, slot] of CAT_SLOTS.slice(1).entries()) {
    cast[slot] = supporting[index % supporting.length] ?? featured;
  }

  return cast;
}
export const CHASE_SPEEDS: ChaseSpeed[] = ['amble', 'trot', 'dash'];

/** The interval has to stay long enough that the crossing reads as an event. */
export const CHASE_INTERVAL_MIN = 10;
export const CHASE_INTERVAL_MAX = 3600;

/**
 * Clamp a number that came from a free text setting.
 *
 * RemNote number settings accept anything typed, and an out of range value
 * produces CSS that is silently invalid rather than merely wrong.
 */
export function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Coerce stored settings into something usable.
 *
 * Settings survive upgrades, so a stored value may name an option that no
 * longer exists. Fall back rather than emit `undefined` into the stylesheet,
 * which invalidates the declaration it lands in.
 */
export function normalizeOptions(raw: Partial<KoneOptions> | null | undefined): KoneOptions {
  const input = raw ?? {};
  const pick = <T extends string>(value: unknown, allowed: T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

  return {
    shade: typeof input.shade === 'string' ? input.shade : DEFAULT_OPTIONS.shade,
    cats: pick(input.cats, CAT_PRESENCE, DEFAULT_OPTIONS.cats),
    hood: pick(input.hood, HOODS, DEFAULT_OPTIONS.hood),
    chase: typeof input.chase === 'boolean' ? input.chase : DEFAULT_OPTIONS.chase,
    chaseInterval: clampNumber(
      input.chaseInterval,
      DEFAULT_OPTIONS.chaseInterval,
      CHASE_INTERVAL_MIN,
      CHASE_INTERVAL_MAX
    ),
    chaseSpeed: pick(input.chaseSpeed, CHASE_SPEEDS, DEFAULT_OPTIONS.chaseSpeed),
    panelOpacity: clampNumber(input.panelOpacity, DEFAULT_OPTIONS.panelOpacity, 0, 100),
  };
}
