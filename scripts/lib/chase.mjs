/**
 * The chase: a yarn ball and a cat running after it.
 *
 * Drawn as two separate files so each moves on its own terms. The cat trailing
 * the yarn is most of what sells it as a chase rather than two things sliding
 * across together.
 *
 * Same colour tokens as the sitting cats, so both follow the palette.
 */

/**
 * A ball of yarn.
 *
 * CENTRED ON PURPOSE. The stylesheet rolls this with `rotate()`, which turns
 * about the element's centre, and the element is sized to the artwork with
 * `background-size: contain`. If the ball sat off centre in its viewBox, or if
 * a loose end hung outside it, `contain` would fit the bounding box rather than
 * the ball and the rotation would wobble around a point that is not the middle
 * of the ball. Everything stays inside the circle for that reason.
 */
export function makeYarnSvg() {
  const c = 60;
  const r = 50;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">` +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="{{YARN}}" stroke="{{LINE}}" stroke-width="3.4"/>` +
    // Winding. Arcs crossing at different angles read as wound thread; parallel
    // lines read as a beach ball.
    `<path d="M14,48 C36,32 84,36 104,56" fill="none" stroke="{{LINE}}" stroke-width="2.8" opacity="0.45"/>` +
    `<path d="M12,70 C36,56 86,62 107,72" fill="none" stroke="{{LINE}}" stroke-width="2.8" opacity="0.45"/>` +
    `<path d="M38,15 C28,44 34,82 56,108" fill="none" stroke="{{LINE}}" stroke-width="2.8" opacity="0.4"/>` +
    `<path d="M82,16 C96,44 94,82 74,107" fill="none" stroke="{{LINE}}" stroke-width="2.8" opacity="0.4"/>` +
    // The loose end, curled inside the silhouette so the ball stays the extent.
    `<path d="M96,44 C86,30 68,28 58,38" fill="none" stroke="{{LINE}}" stroke-width="3.4" ` +
    `stroke-linecap="round" opacity="0.55"/>` +
    // A highlight, so it reads as round rather than as a disc.
    `<ellipse cx="42" cy="38" rx="15" ry="10" fill="#ffffff" opacity="0.3" transform="rotate(-28 42 38)"/>` +
    `</svg>`
  );
}

/**
 * A rounded ear, matching the sitting cats. Never a sharp triangle.
 *
 * The bow has to be a real fraction of the ear's width. A fixed few pixels on a
 * wide base rounds off too little to see and the ear comes back as a triangle,
 * which is what happened the first time.
 */
function runnerEar(bx1, by1, tx, ty, bx2, by2) {
  const bow = Math.max(8, Math.abs(bx2 - bx1) * 0.42);
  return (
    `<path d="M${bx1},${by1} Q${tx - bow},${ty + bow * 0.8} ${tx},${ty} ` +
    `Q${tx + bow},${ty + bow * 0.9} ${bx2},${by2} Z" ` +
    `fill="{{FUR}}" stroke="{{LINE}}" stroke-width="3" stroke-linejoin="round"/>`
  );
}

/**
 * A cat mid-run, seen from the side and facing right.
 *
 * Front legs forward and back legs back, which is the pose that reads as
 * running at a glance. A four legged walk cycle would need frames, and this has
 * one drawing.
 *
 * Legs are drawn as a dark stroke with a lighter one over it, which gives an
 * outlined limb without a separate outline path.
 */
export function makeRunnerSvg({ phase = 'a' } = {}) {
  const leg = (d, outer, inner) =>
    `<path d="${d}" stroke="{{LINE}}" stroke-width="${outer}" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="{{FUR}}" stroke-width="${inner}" stroke-linecap="round" fill="none"/>`;

  // Two poses, flipped against each other. In A the legs are extended, reaching
  // front and back; in B they are gathered under the body. Alternating the two
  // is a running cycle.
  //
  // It has to be TWO drawings because CSS cannot animate anything inside an SVG
  // used as a background-image: the file is a separate document, and no
  // stylesheet on the page reaches into it. The stylesheet flips between these
  // as whole images instead, which is a discrete animation and therefore free.
  //
  // Diagonal pairs move together, the way a real cat's gait works. Moving both
  // front legs together gives a rabbit hop, which reads as wrong even to
  // someone not thinking about gaits.
  const legs =
    phase === 'a'
      ? leg('M62,88 Q48,100 40,110', 16, 11) + // back, extended
        leg('M128,86 Q146,98 154,108', 16, 11) + // front, reaching
        leg('M84,90 Q78,104 74,114', 15, 10) +
        leg('M112,90 Q120,104 126,114', 15, 10)
      : leg('M62,88 Q60,102 58,112', 16, 11) + // back, gathered
        leg('M128,86 Q132,100 134,110', 16, 11) + // front, tucked
        // Kept apart on purpose. Gathered legs that land within a few pixels of
        // each other merge into one blob at the size this runs at.
        leg('M84,90 Q88,102 90,112', 15, 10) +
        leg('M112,90 Q110,104 110,114', 15, 10);

  // The body rides a little lower in the gathered pose, which is most of what
  // makes the flip read as bounding rather than as a glitch.
  const lift = phase === 'a' ? 0 : 4;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="200" height="130">` +
    // Tail, streaming behind.
    `<path d="M34,58 C10,50 6,28 22,18" fill="none" stroke="{{LINE}}" stroke-width="18" stroke-linecap="round"/>` +
    `<path d="M34,58 C12,51 9,31 23,21" fill="none" stroke="{{FUR}}" stroke-width="13" stroke-linecap="round"/>` +
    // Legs, drawn before the body so they tuck underneath it. Short and thick:
    // long thin ones read as a deer, and at 7vw on screen the difference
    // between four sticks and four legs is entirely the weight.
    legs +
    `<g transform="translate(0 ${lift})">` +
    // Body. Rounder than a true running cat, to stay a loaf in motion.
    `<ellipse cx="96" cy="70" rx="54" ry="36" fill="{{FUR}}" stroke="{{LINE}}" stroke-width="3.4"/>` +
    `<ellipse cx="114" cy="64" rx="24" ry="19" fill="{{TABBY}}" opacity="0.55"/>` +
    // Head, leading the run. Ears sit behind it, wide enough to read as ears
    // rather than as horns.
    runnerEar(132, 38, 128, 6, 156, 28) +
    runnerEar(162, 30, 175, 4, 184, 36) +
    `<circle cx="154" cy="52" r="30" fill="{{FUR}}" stroke="{{LINE}}" stroke-width="3.4"/>` +
    // No fringe here. At this size the tufts landed just above the eye and read
    // as eyebrows, or worse as a visor. The sitting cats are big enough to
    // carry it; this one is not.
    // Eye and nose, facing forward.
    `<ellipse cx="163" cy="50" rx="6.5" ry="8" fill="{{DARK}}"/>` +
    `<circle cx="165" cy="46" r="2.4" fill="#ffffff" opacity="0.9"/>` +
    `<path d="M175,55 Q179,53 182,55 Q180,60 178,60 Q176,60 175,55 Z" fill="{{PINK}}"/>` +
    `</g>` +
    `</svg>`
  );
}
