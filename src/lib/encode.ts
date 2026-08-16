/**
 * Encode an SVG for use inside a `url("...")` value.
 *
 * Base64 would be simpler but inflates by a third and is unreadable in
 * devtools. Percent encoding only the characters that actually break a CSS
 * value keeps it compact and inspectable.
 *
 * The order matters: `%` has to be escaped before any `%` escapes are
 * introduced, or a literal percent turns into a broken sequence.
 */
export function encodeSvg(svg: string): string {
  const collapsed = svg
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const encoded = collapsed
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/"/g, "'")
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\n/g, '');

  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
