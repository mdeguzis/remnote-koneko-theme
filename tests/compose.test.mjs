import { test } from 'node:test';
import assert from 'node:assert/strict';

import { compose } from '../src/lib/compose.ts';
import { SHADES, findShade, DEFAULT_SHADE, triplet } from '../src/lib/palettes.ts';
import {
  CAT_PRESENCE,
  CAT_SLOTS,
  CHASE_INTERVAL_MAX,
  CHASE_INTERVAL_MIN,
  CHASE_SPEEDS,
  DEFAULT_OPTIONS,
  HOODS,
  castSlots,
  clampNumber,
  normalizeOptions,
} from '../src/lib/options.ts';

test('the chase is off by default', () => {
  // Motion crossing the window has to be opt in.
  assert.equal(DEFAULT_OPTIONS.chase, false);
  assert.doesNotMatch(compose(DEFAULT_OPTIONS), /@keyframes kone-chase/);
});

test('turning the chase on adds its keyframes', () => {
  assert.match(compose({ ...DEFAULT_OPTIONS, chase: true }), /@keyframes kone-chase/);
});

test('every shade and option combination composes', () => {
  for (const shade of SHADES) {
    for (const cats of CAT_PRESENCE) {
      for (const hood of HOODS) {
        for (const chase of [false, true]) {
          const css = compose({ shade: shade.id, cats, hood, chase });
          assert.ok(css.length > 500, `${shade.id}/${cats}/${hood} produced a short stylesheet`);
        }
      }
    }
  }
});

test('composed css never contains undefined, NaN or an unfilled token', () => {
  // Any of the three invalidates the declaration it lands in, silently.
  for (const shade of SHADES) {
    const css = compose({ ...DEFAULT_OPTIONS, shade: shade.id, chase: true });
    assert.doesNotMatch(css, /undefined/, `${shade.id} emitted undefined`);
    assert.doesNotMatch(css, /NaN/, `${shade.id} emitted NaN`);
    assert.doesNotMatch(css, /\{\{\w+\}\}/, `${shade.id} left an artwork token unfilled`);
  }
});

test('every collage slot is filled, whatever the costume', () => {
  // The first version named the layers after costumes, so choosing a hood
  // filled one corner and left the other three empty.
  for (const hood of HOODS) {
    const css = compose({ ...DEFAULT_OPTIONS, hood });
    for (const slot of CAT_SLOTS) {
      assert.match(css, new RegExp(`--kone-slot-${slot}: url\\(`), `${hood} left ${slot} empty`);
    }
  }
});

test('the collage casts different cats, not four of the same', () => {
  for (const hood of HOODS) {
    const cast = castSlots(hood);
    assert.equal(cast.hero, hood, 'the chosen costume should be the featured one');
    assert.ok(new Set(Object.values(cast)).size >= 3, `${hood} produced a repetitive collage`);
  }
});

test('turning the cats off inlines no artwork at all', () => {
  const css = compose({ ...DEFAULT_OPTIONS, cats: 'off' });
  for (const slot of CAT_SLOTS) {
    assert.match(css, new RegExp(`--kone-slot-${slot}: none`));
  }
});

test('both palettes are emitted, dark gated on the dark class', () => {
  const css = compose(DEFAULT_OPTIONS);
  assert.match(css, /^:root \{/m);
  // RemNote may put the class on a wrapper rather than the root element, so
  // html.dark alone leaves every surface on the light palette.
  assert.match(css, /html\.dark,\s*\n?html:has\(\.dark\)/);
  assert.ok(css.indexOf(':root {') < css.indexOf('html.dark'));
});

test('an unknown shade falls back rather than throwing', () => {
  const fallback = findShade(DEFAULT_SHADE);
  assert.ok(fallback);
  assert.match(compose({ ...DEFAULT_OPTIONS, shade: 'nope' }), new RegExp(fallback.name));
});

/**
 * Pull one piece's timeline out of the composed stylesheet.
 *
 * Returns where it starts, where it finishes, and the percentage of the cycle
 * at which it gets there.
 */
function chaseTrack(css, piece) {
  const block = new RegExp(`@keyframes kone-chase-${piece} \\{([^}]*\\}[^@]*?)\\n\\}`).exec(css);
  assert.ok(block, `no keyframes for ${piece}`);

  const stops = [...block[1].matchAll(/([\d.]+)% \{ transform: translateX\((-?[\d.]+)vw\)/g)].map(
    (m) => ({ at: Number.parseFloat(m[1]), x: Number.parseFloat(m[2]) })
  );
  assert.ok(stops.length >= 2, `${piece} has too few stops`);

  const arrival = stops.find((s) => s.at > 0);
  return { start: stops[0].x, arrivesAt: arrival.at, end: arrival.x };
}

test('the chase crossing is a fraction of the interval, never the whole of it', () => {
  // The gap IS the rest of the timeline. A crossing that filled it would mean
  // the cat never leaves the screen.
  for (const interval of [10, 60, 600]) {
    const css = compose({ ...DEFAULT_OPTIONS, chase: true, chaseInterval: interval });
    const { arrivesAt } = chaseTrack(css, 'cat');
    assert.ok(arrivesAt > 0 && arrivesAt <= 90, `crossing at ${arrivesAt}% for a ${interval}s interval`);
  }
});

test('the cat never gets ahead of the ball it is chasing', () => {
  // The first version separated the two with a NEGATIVE animation-delay, which
  // advances an animation rather than holding it back, so the cat led the ball.
  // The lag is geometry now: the cat starts further back and arrives later, at
  // the same speed, so it cannot overtake at any interval or speed.
  for (const chaseSpeed of CHASE_SPEEDS) {
    for (const interval of [10, 60, 3600]) {
      const css = compose({ ...DEFAULT_OPTIONS, chase: true, chaseSpeed, chaseInterval: interval });
      const yarn = chaseTrack(css, 'yarn');
      const cat = chaseTrack(css, 'cat');

      const where = `${chaseSpeed}/${interval}s`;
      assert.ok(cat.start < yarn.start, `${where}: the cat should start behind the ball`);
      assert.ok(cat.arrivesAt > yarn.arrivesAt, `${where}: the cat should arrive after the ball`);
      assert.equal(cat.end, yarn.end, `${where}: both should leave at the same edge`);

      // Both must finish off screen, or whichever stopped short would sit in
      // view for the whole of the wait.
      assert.ok(yarn.end > 100 && cat.start < 0, `${where}: a piece parks on screen`);
    }
  }
});

test('the ball rolls rather than skating', () => {
  const css = compose({ ...DEFAULT_OPTIONS, chase: true });
  const spin = /translateX\(112vw\) rotate\((\d+)deg\)/.exec(css);
  assert.ok(spin, 'the yarn should end on a rotation');
  assert.ok(Number.parseInt(spin[1], 10) > 360, 'the ball should turn more than once crossing a window');
});

test('a longer interval means a smaller share of the timeline', () => {
  const read = (interval) =>
    chaseTrack(compose({ ...DEFAULT_OPTIONS, chase: true, chaseInterval: interval }), 'cat').arrivesAt;
  assert.ok(read(600) < read(60), 'a rarer chase should occupy less of the cycle');
});

test('a faster speed crosses in less of the cycle', () => {
  const read = (chaseSpeed) =>
    chaseTrack(compose({ ...DEFAULT_OPTIONS, chase: true, chaseSpeed }), 'cat').arrivesAt;
  assert.ok(read('dash') < read('amble'));
});

test('shade ids are unique and every palette is complete', () => {
  const ids = SHADES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);

  const keys = Object.keys(SHADES[0].light);
  for (const shade of SHADES) {
    for (const mode of ['light', 'dark']) {
      assert.deepEqual(Object.keys(shade[mode]).sort(), keys.slice().sort(), `${shade.id}.${mode}`);
      for (const [key, value] of Object.entries(shade[mode])) {
        assert.match(value, /^#[0-9a-f]{6}$/i, `${shade.id}.${mode}.${key} is not a hex colour`);
      }
    }
  }
});

test('triplet converts hex to css channels', () => {
  assert.equal(triplet('#8fb2c4'), '143, 178, 196');
  assert.equal(triplet('#fff'), '255, 255, 255');
});

// --- option handling -----------------------------------------------------

test('normalizeOptions repairs junk from stored settings', () => {
  const out = normalizeOptions({ cats: 'enormous', hood: 7, chase: 'yes', chaseSpeed: null });
  assert.equal(out.cats, DEFAULT_OPTIONS.cats);
  assert.equal(out.hood, DEFAULT_OPTIONS.hood);
  assert.equal(out.chase, DEFAULT_OPTIONS.chase);
  assert.equal(out.chaseSpeed, DEFAULT_OPTIONS.chaseSpeed);
});

test('normalizeOptions handles null and undefined', () => {
  assert.deepEqual(normalizeOptions(null), DEFAULT_OPTIONS);
  assert.deepEqual(normalizeOptions(undefined), DEFAULT_OPTIONS);
});

test('the chase interval is clamped to a sane range', () => {
  // A number setting accepts whatever is typed, and zero would divide into an
  // infinite crossing fraction.
  assert.equal(clampNumber(0, 60, CHASE_INTERVAL_MIN, CHASE_INTERVAL_MAX), CHASE_INTERVAL_MIN);
  assert.equal(clampNumber(99999, 60, CHASE_INTERVAL_MIN, CHASE_INTERVAL_MAX), CHASE_INTERVAL_MAX);
  assert.equal(clampNumber('abc', 60, CHASE_INTERVAL_MIN, CHASE_INTERVAL_MAX), 60);
});

test('an out of range interval never produces an invalid keyframe', () => {
  for (const interval of [0, -5, 99999, Number.NaN, 'soon']) {
    const css = compose({ ...DEFAULT_OPTIONS, chase: true, chaseInterval: interval });
    const { arrivesAt } = chaseTrack(css, 'cat');
    assert.ok(
      Number.isFinite(arrivesAt) && arrivesAt > 0 && arrivesAt <= 90,
      `stop ${arrivesAt} for input ${interval}`
    );
  }
});

test('panel opacity reaches the variable RemNote actually paints', () => {
  const css = compose({ ...DEFAULT_OPTIONS, panelOpacity: 40 });
  assert.match(css, /--current-background-color:\s*rgba\(var\(--kone-elevated\), var\(--kone-panel-opacity\)\)/);
  assert.match(css, /--kone-panel-opacity: 0\.400/);
});
