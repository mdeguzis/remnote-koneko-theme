/**
 * The cats.
 *
 * Original drawings in the soft loaf-kitten style. The style is a reference;
 * the characters are ours.
 *
 * WHAT MAKES IT READ RIGHT
 * ------------------------
 * - Nothing is pointed. Ears, fins and fringe all end in a curve. The first
 *   version used sharp triangles and looked angular and cheap against art that
 *   has no hard corners anywhere.
 * - The fringe matters. A few soft tabby tufts over the forehead is most of
 *   what separates this from a generic round cat face.
 * - Eyes are large, dark teal and set wide, with two highlights rather than
 *   one: a big one high and a small one low. One highlight reads as glass, two
 *   reads as wet.
 * - The shark is a FULL BODY suit, not a hood. The cat stands inside it with
 *   its face through an opening, fins out to the sides and a tail behind.
 *   Drawing it as a hat was the biggest thing wrong with the first pass.
 *
 * COLOR
 * -----
 * These are templates. compose substitutes the active palette into {{TOKEN}}
 * placeholders before encoding, so one drawing serves every shade while still
 * carrying fur, tabby, eyes, pink and a costume colour at once.
 *
 * Tokens: FUR, TABBY, DARK, PINK, HOOD, HOOD_LIGHT, CREAM, CRUST, LINE, YARN
 */

const r = (n) => Math.round(n * 10) / 10;

const LINE = 'stroke="{{LINE}}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"';
const LINE_THIN = 'stroke="{{LINE}}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';

/** A rounded ear. Two quadratics meeting at the tip, so the point is a curve. */
function ear(bx1, by1, tx, ty, bx2, by2) {
  return (
    `<path d="M${r(bx1)},${r(by1)} Q${r(tx - 9)},${r(ty + 10)} ${r(tx)},${r(ty)} ` +
    `Q${r(tx + 9)},${r(ty + 12)} ${r(bx2)},${r(by2)} Z" fill="{{FUR}}" ${LINE}/>`
  );
}

/** The pink inside an ear, inset so a rim of fur remains. */
function earInner(bx1, by1, tx, ty, bx2, by2) {
  return (
    `<path d="M${r(bx1)},${r(by1)} Q${r(tx - 5)},${r(ty + 16)} ${r(tx)},${r(ty + 8)} ` +
    `Q${r(tx + 5)},${r(ty + 17)} ${r(bx2)},${r(by2)} Z" fill="{{PINK}}" opacity="0.55"/>`
  );
}

/**
 * The forehead fringe.
 *
 * Soft tabby tufts hanging over the brow, rounded rather than spiky: this is
 * fur, not teeth.
 *
 * Three tufts of DIFFERENT widths, not five even ones. Evenly repeated arcs in a
 * row read as a scalloped headband sitting on the cat rather than as hair
 * growing out of it, which is exactly how the first version looked. Irregular
 * widths and overlapping edges are what make it read as fur.
 */
function fringe(cx, cy, spread = 44) {
  const tufts = [
    { at: -0.72, w: 0.5, drop: 0.62 },
    { at: -0.08, w: 0.68, drop: 1 },
    { at: 0.62, w: 0.46, drop: 0.72 },
  ];

  return tufts
    .map(({ at, w, drop }) => {
      const x = cx + at * spread;
      const half = w * spread * 0.62;
      return (
        `<path d="M${r(x - half)},${r(cy - 8)} Q${r(x)},${r(cy + drop * 30)} ${r(x + half)},${r(cy - 8)} Z" ` +
        `fill="{{TABBY}}" opacity="0.8"/>`
      );
    })
    .join('');
}

/**
 * Rounded teeth around a shark's mouth opening.
 *
 * This is the whole reason the costume reads as a shark. Without them the suit
 * is a blue sleeping bag with a cat in it, which is what the first version
 * looked like. They are bumps rather than spikes: the reference art has no
 * sharp corners anywhere, including on the predators.
 *
 * Each tooth hangs from the ellipse itself, so they sit on the opening rather
 * than on a straight line across it.
 */
function teeth(cx, cy, rx, ry, { count, from, to, depth, up = false }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = from + (to - from) * t;
    const norm = (x - cx) / rx;
    const edge = cy + (up ? 1 : -1) * Math.sqrt(Math.max(0, 1 - norm * norm)) * ry;
    const tip = edge + (up ? -depth : depth);
    const half = ((to - from) / count) * 0.42;
    out.push(
      `<path d="M${r(x - half)},${r(edge)} Q${r(x)},${r(tip)} ${r(x + half)},${r(edge)} Z" ` +
        `fill="{{CREAM}}" stroke="{{LINE}}" stroke-width="2" stroke-linejoin="round"/>`
    );
  }
  return out.join('');
}

/** The face. `s` scales the features so one face fits several body sizes. */
function face({ cx, cy, s = 1 }) {
  const u = (n) => r(n * s);
  return [
    `<ellipse cx="${cx - u(24)}" cy="${cy}" rx="${u(14)}" ry="${u(17)}" fill="{{DARK}}"/>`,
    `<ellipse cx="${cx + u(24)}" cy="${cy}" rx="${u(14)}" ry="${u(17)}" fill="{{DARK}}"/>`,
    `<circle cx="${cx - u(28)}" cy="${cy - u(7)}" r="${u(4.6)}" fill="#ffffff" opacity="0.95"/>`,
    `<circle cx="${cx + u(20)}" cy="${cy - u(7)}" r="${u(4.6)}" fill="#ffffff" opacity="0.95"/>`,
    `<circle cx="${cx - u(19)}" cy="${cy + u(8)}" r="${u(2.2)}" fill="#ffffff" opacity="0.65"/>`,
    `<circle cx="${cx + u(29)}" cy="${cy + u(8)}" r="${u(2.2)}" fill="#ffffff" opacity="0.65"/>`,

    // Nose: rounded, never a sharp triangle.
    `<path d="M${cx - u(6)},${cy + u(16)} Q${cx},${cy + u(13)} ${cx + u(6)},${cy + u(16)} ` +
      `Q${cx + u(3)},${cy + u(23)} ${cx},${cy + u(23)} Q${cx - u(3)},${cy + u(23)} ${cx - u(6)},${cy + u(16)} Z" ` +
      `fill="{{PINK}}"/>`,

    `<path d="M${cx},${cy + u(23)} q${-u(7)},${u(7)} ${-u(13)},${u(1)}" fill="none" ` +
      `stroke="{{LINE}}" stroke-width="${u(2)}" stroke-linecap="round" opacity="0.6"/>`,
    `<path d="M${cx},${cy + u(23)} q${u(7)},${u(7)} ${u(13)},${u(1)}" fill="none" ` +
      `stroke="{{LINE}}" stroke-width="${u(2)}" stroke-linecap="round" opacity="0.6"/>`,

    `<ellipse cx="${cx - u(44)}" cy="${cy + u(14)}" rx="${u(10)}" ry="${u(6)}" fill="{{PINK}}" opacity="0.26"/>`,
    `<ellipse cx="${cx + u(44)}" cy="${cy + u(14)}" rx="${u(10)}" ry="${u(6)}" fill="{{PINK}}" opacity="0.26"/>`,
  ].join('');
}

/** Soft light and shadow, painted over shapes already filled. */
function shadingDefs() {
  return (
    '<defs>' +
    '<radialGradient id="lit" cx="34%" cy="24%" r="78%">' +
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>' +
    '<stop offset="0.64" stop-color="#ffffff" stop-opacity="0"/>' +
    '</radialGradient>' +
    '<radialGradient id="shade" cx="66%" cy="96%" r="72%">' +
    '<stop offset="0" stop-color="{{LINE}}" stop-opacity="0.2"/>' +
    '<stop offset="1" stop-color="{{LINE}}" stop-opacity="0"/>' +
    '</radialGradient>' +
    '</defs>'
  );
}

function loafPath(cx, baseY, w, h) {
  return (
    `M${cx - w},${baseY} C${cx - w},${baseY - h * 0.74} ${cx - w * 0.6},${baseY - h} ${cx},${baseY - h} ` +
    `C${cx + w * 0.6},${baseY - h} ${cx + w},${baseY - h * 0.74} ${cx + w},${baseY} Z`
  );
}

function loafBody(cx, baseY, w, h) {
  const d = loafPath(cx, baseY, w, h);
  return [
    `<path d="${d}" fill="{{FUR}}" ${LINE}/>`,
    `<ellipse cx="${cx + 42}" cy="${baseY - 52}" rx="26" ry="30" fill="{{TABBY}}" opacity="0.65"/>`,
    `<ellipse cx="${cx - 50}" cy="${baseY - 38}" rx="18" ry="22" fill="{{TABBY}}" opacity="0.42"/>`,
    `<path d="${d}" fill="url(#shade)"/>`,
    `<path d="${d}" fill="url(#lit)"/>`,
    `<ellipse cx="${cx - 30}" cy="${baseY - 8}" rx="20" ry="14" fill="{{FUR}}" ${LINE_THIN}/>`,
    `<ellipse cx="${cx + 30}" cy="${baseY - 8}" rx="20" ry="14" fill="{{FUR}}" ${LINE_THIN}/>`,
    `<ellipse cx="${cx - 30}" cy="${baseY - 8}" rx="8" ry="5.5" fill="{{PINK}}" opacity="0.7"/>`,
    `<ellipse cx="${cx + 30}" cy="${baseY - 8}" rx="8" ry="5.5" fill="{{PINK}}" opacity="0.7"/>`,
  ].join('');
}

function tail(cx, baseY) {
  const d =
    `M${cx + 68},${baseY - 8} C${cx + 106},${baseY - 4} ${cx + 118},${baseY - 42} ${cx + 96},${baseY - 58}`;
  return (
    `<path d="${d}" fill="none" stroke="{{LINE}}" stroke-width="24" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="{{FUR}}" stroke-width="18" stroke-linecap="round"/>`
  );
}

/* ------------------------------------------------------------------ hoods */

/**
 * Shark.
 *
 * The cat's face sits in the shark's OPEN MOUTH, with teeth around the opening
 * and the shark's own small eyes above them. That arrangement is the whole
 * signal: it is what the eye uses to decide this is a shark and not a hood in a
 * cool colour.
 *
 * An earlier version built this as a full body suit the cat stood inside, on
 * the reasoning that the reference art shows a garment rather than a hat. That
 * was true and still failed, because at the size these are drawn the silhouette
 * of a rounded blue mass with a cat in it is a sleeping bag. The parts that
 * would have named it, fins and tail, hung off the edges as detached blobs and
 * the dorsal fin read as a single cat ear. Legibility beats accuracy here: the
 * hood keeps the shape language of the other costumes, which already work, and
 * spends its detail on the mouth instead.
 */
function sharkHood(cx, cy) {
  return [
    // Dorsal fin, on top and swept back. It sits centred over the dome rather
    // than off to one side, where it hung past the head's edge and read as a
    // flap. What stops it being mistaken for an ear is the sweep and the
    // shark's eyes below it, not its position.
    `<path d="M${cx - 26},${cy - 92} C${cx - 16},${cy - 150} ${cx},${cy - 164} ${cx + 12},${cy - 158} ` +
      `C${cx + 20},${cy - 138} ${cx + 26},${cy - 110} ${cx + 32},${cy - 90} Z" fill="{{HOOD}}" ${LINE}/>`,

    // Side fins, low and swept, reading as fins because they rake backwards.
    `<path d="M${cx - 74},${cy - 6} C${cx - 122},${cy + 6} ${cx - 128},${cy + 40} ${cx - 92},${cy + 44} Z" ` +
      `fill="{{HOOD}}" ${LINE}/>`,
    `<path d="M${cx + 74},${cy - 6} C${cx + 122},${cy + 6} ${cx + 128},${cy + 40} ${cx + 92},${cy + 44} Z" ` +
      `fill="{{HOOD}}" ${LINE}/>`,

    // The head, taller than the other hoods to leave room for a face above the
    // mouth.
    `<path d="M${cx - 86},${cy + 22} C${cx - 86},${cy - 74} ${cx - 46},${cy - 104} ${cx},${cy - 104} ` +
      `C${cx + 46},${cy - 104} ${cx + 86},${cy - 74} ${cx + 86},${cy + 22} ` +
      `C${cx + 66},${cy + 54} ${cx - 66},${cy + 54} ${cx - 86},${cy + 22} Z" fill="{{HOOD}}" ${LINE}/>`,

    // The shark's own eyes, small and wide set, above the mouth.
    `<circle cx="${cx - 40}" cy="${cy - 66}" r="8" fill="{{LINE}}"/>`,
    `<circle cx="${cx + 40}" cy="${cy - 66}" r="8" fill="{{LINE}}"/>`,
    `<circle cx="${cx - 37}" cy="${cy - 69}" r="2.6" fill="#ffffff" opacity="0.85"/>`,
    `<circle cx="${cx + 43}" cy="${cy - 69}" r="2.6" fill="#ffffff" opacity="0.85"/>`,

    // Gill slits on the cheek, where they have something to sit on.
    ...[0, 1, 2].map(
      (i) =>
        `<path d="M${cx - 74 + i * 10},${cy - 34} q6,9 0,18" fill="none" stroke="{{LINE}}" ` +
        `stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>`
    ),
  ].join('');
}

/**
 * Bread: a slice of toast the cat's head comes through.
 *
 * The whole slice sits BEHIND the head, so what shows is a thick crust border
 * all the way around. The first version drew the crust as an outline with a
 * cream fill covering the middle, which left a thin brown rim that read as a
 * hair band rather than as bread.
 */
function breadHood(cx, cy) {
  const slice = (inset, fill) =>
    `<path d="M${cx - 92 + inset},${cy + 62 - inset} ` +
    `L${cx - 92 + inset},${cy - 26} ` +
    `Q${cx - 92 + inset},${cy - 70 + inset} ${cx - 50},${cy - 74 + inset} ` +
    `Q${cx},${cy - 96 + inset} ${cx + 50},${cy - 74 + inset} ` +
    `Q${cx + 92 - inset},${cy - 70 + inset} ${cx + 92 - inset},${cy - 26} ` +
    `L${cx + 92 - inset},${cy + 62 - inset} Z" fill="${fill}"`;

  return [
    `${slice(0, '{{CRUST}}')} ${LINE}/>`,
    `${slice(16, '{{CREAM}}')}/>`,
  ].join('');
}

/** Bunny: a soft hood with two long rounded ears. */
function bunnyHood(cx, cy) {
  return [
    `<path d="M${cx - 36},${cy - 44} Q${cx - 54},${cy - 116} ${cx - 26},${cy - 134} ` +
      `Q${cx - 4},${cy - 118} ${cx - 12},${cy - 46} Z" fill="{{HOOD_LIGHT}}" ${LINE}/>`,
    `<path d="M${cx + 36},${cy - 44} Q${cx + 54},${cy - 116} ${cx + 26},${cy - 134} ` +
      `Q${cx + 4},${cy - 118} ${cx + 12},${cy - 46} Z" fill="{{HOOD_LIGHT}}" ${LINE}/>`,
    `<path d="M${cx - 30},${cy - 56} Q${cx - 42},${cy - 108} ${cx - 26},${cy - 122} ` +
      `Q${cx - 12},${cy - 108} ${cx - 18},${cy - 56} Z" fill="{{PINK}}" opacity="0.45"/>`,
    `<path d="M${cx + 30},${cy - 56} Q${cx + 42},${cy - 108} ${cx + 26},${cy - 122} ` +
      `Q${cx + 12},${cy - 108} ${cx + 18},${cy - 56} Z" fill="{{PINK}}" opacity="0.45"/>`,
    `<path d="M${cx - 80},${cy + 12} C${cx - 80},${cy - 64} ${cx - 42},${cy - 88} ${cx},${cy - 88} ` +
      `C${cx + 42},${cy - 88} ${cx + 80},${cy - 64} ${cx + 80},${cy + 12} ` +
      `C${cx + 62},${cy + 42} ${cx - 62},${cy + 42} ${cx - 80},${cy + 12} Z" fill="{{HOOD_LIGHT}}" ${LINE}/>`,
  ].join('');
}

/**
 * Strawberry: a berry cap with seeds and a leafy crown.
 *
 * Uses BERRY and LEAF rather than the shade's HOOD colour. HOOD is whatever the
 * palette's costume colour is, which is blue in Samecat, and a blue strawberry
 * with a blue crown reads as a swim cap.
 */
function strawberryHood(cx, cy) {
  // Seeds across the face of the berry, staggered rather than in an arc: a
  // single row of evenly spaced dots reads as stitching.
  const rows = [
    { y: cy - 62, xs: [-46, -16, 16, 46] },
    { y: cy - 34, xs: [-62, -32, 0, 32, 62] },
    { y: cy - 6, xs: [-70, -40, 40, 70] },
  ];
  const seeds = rows
    .flatMap(({ y, xs }) =>
      xs.map((dx) => {
        const sx = cx + dx;
        return (
          `<ellipse cx="${sx}" cy="${y}" rx="3.4" ry="5" fill="{{CREAM}}" opacity="0.9" ` +
          `transform="rotate(${r(dx * 0.28)} ${sx} ${y})"/>`
        );
      })
    )
    .join('');

  return [
    `<path d="M${cx - 84},${cy + 6} C${cx - 84},${cy - 70} ${cx - 46},${cy - 92} ${cx},${cy - 92} ` +
      `C${cx + 46},${cy - 92} ${cx + 84},${cy - 70} ${cx + 84},${cy + 6} ` +
      `C${cx + 66},${cy + 40} ${cx - 66},${cy + 40} ${cx - 84},${cy + 6} Z" fill="{{BERRY}}" ${LINE}/>`,
    seeds,
    // Crown: three rounded lobes and a stalk.
    `<path d="M${cx - 44},${cy - 84} Q${cx - 30},${cy - 112} ${cx - 12},${cy - 96} ` +
      `Q${cx},${cy - 122} ${cx + 12},${cy - 96} Q${cx + 30},${cy - 112} ${cx + 44},${cy - 84} ` +
      `Q${cx},${cy - 68} ${cx - 44},${cy - 84} Z" fill="{{LEAF}}" ${LINE_THIN}/>`,
    `<path d="M${cx},${cy - 100} q3,-16 -2,-24" fill="none" stroke="{{LINE}}" stroke-width="5" ` +
      `stroke-linecap="round" opacity="0.7"/>`,
  ].join('');
}

/**
 * The costumes.
 *
 * `draw` goes on before the face opening is cut, `overlay` after it. The shark
 * needs the second hook because its teeth have to sit ON the opening: drawn
 * earlier they would be covered by it.
 */
const HOODS = {
  shark: {
    draw: sharkHood,
    overlay: (cx, cy, rx, ry) =>
      teeth(cx, cy, rx, ry, { count: 6, from: cx - 42, to: cx + 42, depth: 16 }) +
      teeth(cx, cy, rx, ry, { count: 5, from: cx - 34, to: cx + 34, depth: 14, up: true }),
  },
  bread: { draw: breadHood },
  bunny: { draw: bunnyHood },
  strawberry: { draw: strawberryHood },
};

export const HOOD_NAMES = ['shark', 'bread', 'bunny', 'strawberry', 'none'];

function wrap(width, height, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}">${body}</svg>`
  );
}

/** A whole cat. */
export function makeCatSvg({ hood = 'shark', width = 300, height = 330 } = {}) {
  const cx = width / 2;
  const baseY = height - 16;
  const bodyH = 108;
  const bodyTop = baseY - bodyH;
  const headY = bodyTop - 26;

  const parts = [
    shadingDefs(),
    tail(cx, baseY),
    loafBody(cx, baseY, 76, bodyH),
    `<ellipse cx="${cx}" cy="${bodyTop + 6}" rx="52" ry="14" fill="{{LINE}}" opacity="0.12"/>`,
  ];

  if (hood === 'none') {
    parts.push(
      ear(cx - 58, headY - 26, cx - 46, headY - 94, cx - 14, headY - 54),
      ear(cx + 58, headY - 26, cx + 46, headY - 94, cx + 14, headY - 54),
      `<circle cx="${cx}" cy="${headY}" r="62" fill="{{FUR}}" ${LINE}/>`,
      earInner(cx - 50, headY - 34, cx - 45, headY - 86, cx - 24, headY - 54),
      earInner(cx + 50, headY - 34, cx + 45, headY - 86, cx + 24, headY - 54),
      fringe(cx, headY - 40, 42),
      `<circle cx="${cx}" cy="${headY}" r="62" fill="url(#shade)"/>`,
      `<circle cx="${cx}" cy="${headY}" r="62" fill="url(#lit)"/>`,
      face({ cx, cy: headY, s: 0.92 })
    );
  } else {
    const costume = HOODS[hood] ?? HOODS.bread;

    // The shark's mouth sits lower than the other hoods' openings, because it
    // has the shark's own face above it.
    const openY = hood === 'shark' ? headY + 22 : headY + 8;
    const rx = 54;
    const ry = 48;

    parts.push(
      `<circle cx="${cx}" cy="${headY}" r="62" fill="{{FUR}}" ${LINE}/>`,
      costume.draw(cx, headY),
      `<ellipse cx="${cx}" cy="${openY}" rx="${rx}" ry="${ry}" fill="{{FUR}}" ${LINE}/>`,
      // Fringe first, teeth over it. The other way round left the tufts sitting
      // on top of the shark's teeth, which turned the whole opening into one
      // busy band where neither shape was readable.
      fringe(cx, openY - 26, 34),
      costume.overlay ? costume.overlay(cx, openY, rx, ry) : '',
      face({ cx, cy: openY, s: 0.9 })
    );
  }

  return wrap(width, height, parts.join(''));
}
