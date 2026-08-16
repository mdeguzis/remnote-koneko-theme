/**
 * The corner scenes.
 *
 * A cat in its bed, and a cat asleep on a shelf. Unlike the costumed cats these
 * are not interchangeable: each one belongs to a specific corner and reads as
 * furniture in that corner rather than as a sticker placed there. That is why
 * they are fixed art rather than something the costume setting casts.
 *
 * Both are WIDE. A corner scene has to sit along an edge without pushing into
 * the text, so these are drawn about 2:1 and anchored to their edge.
 *
 * A sleeping cat is drawn with closed eyes as simple downward arcs. Two curves
 * do more work here than any amount of shading: they are the whole difference
 * between a cat resting and a cat staring at the reader.
 *
 * Same colour tokens as everything else, so the scenes follow the palette.
 */

const LINE = 'stroke="{{LINE}}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"';
const LINE_THIN = 'stroke="{{LINE}}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';

/** Closed eyes: the sleep signal. */
function closedEyes(cx, cy, spread = 22, w = 9) {
  return (
    `<path d="M${cx - spread - w},${cy} q${w},${w * 0.85} ${w * 2},0" fill="none" ` +
    `stroke="{{LINE}}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M${cx + spread - w},${cy} q${w},${w * 0.85} ${w * 2},0" fill="none" ` +
    `stroke="{{LINE}}" stroke-width="3" stroke-linecap="round"/>`
  );
}

/** A rounded ear, matching the costumed cats. */
function ear(bx1, by1, tx, ty, bx2, by2) {
  const bow = Math.max(7, Math.abs(bx2 - bx1) * 0.4);
  return (
    `<path d="M${bx1},${by1} Q${tx - bow},${ty + bow * 0.8} ${tx},${ty} ` +
    `Q${tx + bow},${ty + bow * 0.9} ${bx2},${by2} Z" fill="{{FUR}}" ${LINE}/>`
  );
}

/** A muzzle with a nose, small enough not to compete with the closed eyes. */
function sleepingMuzzle(cx, cy) {
  return (
    `<path d="M${cx - 5},${cy} Q${cx},${cy - 2.5} ${cx + 5},${cy} ` +
    `Q${cx + 2.5},${cy + 6} ${cx},${cy + 6} Q${cx - 2.5},${cy + 6} ${cx - 5},${cy} Z" fill="{{PINK}}"/>`
  );
}

function wrap(width, height, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}">${body}</svg>`
  );
}

function shadingDefs() {
  return (
    '<defs>' +
    '<radialGradient id="lit" cx="34%" cy="24%" r="78%">' +
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.42"/>' +
    '<stop offset="0.66" stop-color="#ffffff" stop-opacity="0"/>' +
    '</radialGradient>' +
    '</defs>'
  );
}

/**
 * A cat curled asleep in a round bed.
 *
 * The cat is drawn as one curled mass with the tail wrapped around the front,
 * which is how a cat actually sleeps and reads instantly at small size. Legs,
 * paws and a separate body would all be lost by the time this is 12vw wide.
 *
 * The bed rim is drawn twice: once whole, behind the cat, and once as a front
 * arc over it. That is what puts the cat INSIDE the bed rather than on top of a
 * disc, and it is the only part of this drawing that needs the layering to be
 * right.
 */
export function makeBedSvg({ width = 340, height = 200 } = {}) {
  const cx = width / 2;
  const rimY = height - 46;

  return wrap(
    width,
    height,
    [
      shadingDefs(),

      // Bed, back half.
      `<ellipse cx="${cx}" cy="${rimY}" rx="152" ry="46" fill="{{HOOD}}" ${LINE}/>`,
      `<ellipse cx="${cx}" cy="${rimY - 4}" rx="124" ry="32" fill="{{HOOD_LIGHT}}"/>`,

      // The curled cat.
      `<path d="M${cx - 96},${rimY - 16} C${cx - 104},${rimY - 92} ${cx - 40},${rimY - 126} ` +
        `${cx + 14},${rimY - 116} C${cx + 84},${rimY - 104} ${cx + 108},${rimY - 44} ` +
        `${cx + 88},${rimY - 12} Z" fill="{{FUR}}" ${LINE}/>`,
      `<ellipse cx="${cx + 40}" cy="${rimY - 62}" rx="34" ry="26" fill="{{TABBY}}" opacity="0.55"/>`,

      // Tail, curled around the front of the body.
      `<path d="M${cx + 86},${rimY - 30} C${cx + 40},${rimY - 2} ${cx - 28},${rimY - 4} ${cx - 62},${rimY - 26}" ` +
        `fill="none" stroke="{{LINE}}" stroke-width="26" stroke-linecap="round"/>`,
      `<path d="M${cx + 86},${rimY - 30} C${cx + 40},${rimY - 2} ${cx - 28},${rimY - 4} ${cx - 62},${rimY - 26}" ` +
        `fill="none" stroke="{{FUR}}" stroke-width="20" stroke-linecap="round"/>`,

      // Head, tucked down into the curl.
      ear(cx - 92, rimY - 92, cx - 88, rimY - 128, cx - 62, rimY - 106),
      ear(cx - 46, rimY - 108, cx - 24, rimY - 132, cx - 22, rimY - 96),
      `<circle cx="${cx - 60}" cy="${rimY - 72}" r="42" fill="{{FUR}}" ${LINE}/>`,
      closedEyes(cx - 60, rimY - 74, 17, 8),
      sleepingMuzzle(cx - 60, rimY - 58),
      `<ellipse cx="${cx - 92}" cy="${rimY - 60}" rx="9" ry="5.5" fill="{{PINK}}" opacity="0.3"/>`,
      `<ellipse cx="${cx - 28}" cy="${rimY - 60}" rx="9" ry="5.5" fill="{{PINK}}" opacity="0.3"/>`,
      `<circle cx="${cx - 60}" cy="${rimY - 72}" r="42" fill="url(#lit)"/>`,

      // Bed, front arc, drawn over the cat so it sits in the bed.
      `<path d="M${cx - 152},${rimY} A152,46 0 0 0 ${cx + 152},${rimY}" fill="{{HOOD}}" ${LINE}/>`,
      `<path d="M${cx - 124},${rimY - 4} A124,32 0 0 0 ${cx + 124},${rimY - 4}" fill="{{HOOD_LIGHT}}" ` +
        `stroke="{{LINE}}" stroke-width="2" opacity="0.9"/>`,
    ].join('')
  );
}

/**
 * A cat asleep on a wall shelf.
 *
 * The tail hangs off the front edge. That one detail is what makes the shelf
 * read as a shelf rather than as a line under a cat, because it says there is
 * an edge here with nothing below it.
 */
export function makeShelfSvg({ width = 340, height = 210 } = {}) {
  const cx = width / 2;
  // Room below the plank for the whole hanging tail, INCLUDING its stroke
  // width. At height - 66 the tail's outline ran past the bottom edge and the
  // tip came out squared off.
  const shelfY = height - 86;
  const left = 18;
  const right = width - 18;

  return wrap(
    width,
    height,
    [
      shadingDefs(),

      // Tail first: it hangs BEHIND the shelf front, over the edge.
      `<path d="M${cx + 62},${shelfY - 16} C${cx + 104},${shelfY - 6} ${cx + 108},${shelfY + 44} ${cx + 78},${shelfY + 60}" ` +
        `fill="none" stroke="{{LINE}}" stroke-width="24" stroke-linecap="round"/>`,
      `<path d="M${cx + 62},${shelfY - 16} C${cx + 104},${shelfY - 6} ${cx + 108},${shelfY + 44} ${cx + 78},${shelfY + 60}" ` +
        `fill="none" stroke="{{FUR}}" stroke-width="18" stroke-linecap="round"/>`,

      // The loaf, asleep.
      `<path d="M${cx - 86},${shelfY} C${cx - 86},${shelfY - 62} ${cx - 52},${shelfY - 84} ${cx},${shelfY - 84} ` +
        `C${cx + 52},${shelfY - 84} ${cx + 86},${shelfY - 62} ${cx + 86},${shelfY} Z" fill="{{FUR}}" ${LINE}/>`,
      `<ellipse cx="${cx + 40}" cy="${shelfY - 34}" rx="28" ry="22" fill="{{TABBY}}" opacity="0.5"/>`,

      // Head resting on the paws. Both ears have to sit ON the head circle
      // (centre cx-42, r 40); the second one started past its right edge and
      // read as a horn growing out of the cat's back.
      ear(cx - 74, shelfY - 58, cx - 70, shelfY - 100, cx - 44, shelfY - 78),
      ear(cx - 34, shelfY - 76, cx - 14, shelfY - 100, cx - 8, shelfY - 62),
      `<circle cx="${cx - 42}" cy="${shelfY - 42}" r="40" fill="{{FUR}}" ${LINE}/>`,
      closedEyes(cx - 42, shelfY - 44, 16, 8),
      sleepingMuzzle(cx - 42, shelfY - 28),
      `<ellipse cx="${cx - 72}" cy="${shelfY - 30}" rx="9" ry="5.5" fill="{{PINK}}" opacity="0.3"/>`,
      `<ellipse cx="${cx - 12}" cy="${shelfY - 30}" rx="9" ry="5.5" fill="{{PINK}}" opacity="0.3"/>`,
      `<circle cx="${cx - 42}" cy="${shelfY - 42}" r="40" fill="url(#lit)"/>`,

      // Front paws over the shelf edge, the other half of "asleep up here".
      `<ellipse cx="${cx - 62}" cy="${shelfY - 6}" rx="19" ry="11" fill="{{FUR}}" ${LINE_THIN}/>`,
      `<ellipse cx="${cx - 24}" cy="${shelfY - 6}" rx="19" ry="11" fill="{{FUR}}" ${LINE_THIN}/>`,

      // The plank.
      `<rect x="${left}" y="${shelfY}" width="${right - left}" height="18" rx="8" fill="{{CRUST}}" ${LINE}/>`,
      `<rect x="${left + 10}" y="${shelfY + 3}" width="${right - left - 20}" height="6" rx="3" ` +
        `fill="{{CREAM}}" opacity="0.28"/>`,

      // Brackets, each mirrored so its vertical edge faces the wall it would be
      // fixed to. Both drawn from the same corner made the right hand one point
      // the wrong way and read as a broken shelf.
      // The right bracket clears the hanging tail. Placed symmetrically it sat
      // directly under the tail and the two merged into one brown shape.
      ...[
        { x: left + 40, dir: 1 },
        { x: right - 26, dir: -1 },
      ].map(
        ({ x, dir }) =>
          `<path d="M${x - 12 * dir},${shelfY + 18} L${x - 12 * dir},${shelfY + 44} ` +
          `L${x + 12 * dir},${shelfY + 18} Z" fill="{{CRUST}}" ${LINE_THIN}/>`
      ),
    ].join('')
  );
}
