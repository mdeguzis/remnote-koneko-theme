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
  /**
   * How strongly the shade colours the page, as a percentage.
   *
   * 100 is the palette as authored. Lower washes it toward neutral, higher
   * deepens it. Pastels read as too pale to some people and that is a matter of
   * taste rather than a bug, so it is a knob instead of a redesign.
   */
  tintStrength: number;
}

export const DEFAULT_OPTIONS: KoneOptions = {
  shade: 'samecat',
  cats: 'normal',
  hood: 'shark',
  chase: false,
  chaseInterval: 60,
  chaseSpeed: 'trot',
  panelOpacity: 75,
  tintStrength: 100,
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

/**
 * Seconds for one full stride, per speed.
 *
 * Deliberately not derived from the crossing time. A cat that takes longer to
 * cross should take MORE strides, not slower ones, so this is its own scale: a
 * dash flickers, an amble plods, and neither looks like slow motion.
 */
export const GAIT_DURATION: Record<ChaseSpeed, number> = {
  amble: 0.44,
  trot: 0.3,
  dash: 0.18,
};

export const CAT_PRESENCE: CatPresence[] = ['off', 'subtle', 'normal', 'bold'];
export const HOODS: Hood[] = ['shark', 'bunny', 'bread', 'strawberry', 'none'];

/**
 * The costume slots: the pair in the bottom right corner.
 *
 * The chosen costume takes `hero` and `companion` gets a different one, so the
 * pair is varied rather than two copies of the same cat. Slot names are
 * placements; they carry no costume meaning, and the stylesheet decides where
 * they land.
 *
 * The other two corners are SCENES, not costume slots. A cat asleep on a shelf
 * belongs to that shelf, so putting a shark hood on it would be nonsense.
 */
export const CAT_SLOTS = ['hero', 'companion'] as const;
export type CatSlot = (typeof CAT_SLOTS)[number];

/** The fixed corner scenes, drawn regardless of the costume setting. */
export const SCENES = ['shelf', 'bed'] as const;
export type Scene = (typeof SCENES)[number];

/**
 * Cast the costumed pair.
 *
 * `none` is excluded from the companion slot because a plain cat next to a
 * costumed one reads as a missing costume rather than a deliberate choice. It
 * is still available as the hero, for anyone who wants no costumes at all.
 */
export function castSlots(featured: Hood): Record<CatSlot, Hood> {
  const supporting = HOODS.filter((hood) => hood !== featured && hood !== 'none');

  return {
    hero: featured,
    companion: supporting[0] ?? featured,
  };
}
export const CHASE_SPEEDS: ChaseSpeed[] = ['amble', 'trot', 'dash'];

/** The interval has to stay long enough that the crossing reads as an event. */
export const CHASE_INTERVAL_MIN = 10;
export const CHASE_INTERVAL_MAX = 3600;

/**
 * The tint range.
 *
 * Capped at 200 rather than left open. Deepening a light ground costs contrast
 * against text that does not move with it, and the ceiling is set where the
 * contrast tests still hold across every shade.
 */
export const TINT_MIN = 0;
export const TINT_MAX = 200;

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
    tintStrength: clampNumber(input.tintStrength, DEFAULT_OPTIONS.tintStrength, TINT_MIN, TINT_MAX),
  };
}
