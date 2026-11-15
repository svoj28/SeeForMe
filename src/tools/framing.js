// Turns "where is the text in the photo" into "how should I move the phone".
// Pure functions: easy to test without a phone.

const EDGE = 0.025; // a line this close to the photo's edge probably continues past it
const SMALL_LINE = 0.018; // median line height (share of photo height) below which text is hard to read
const OFF_CENTRE = 0.22; // text block centre this far from the middle → suggest moving
// Median line height above which the phone is simply too close: shifting sideways
// would only push text off the other edge. (Well-framed page in tests: ~0.021; too close: ~0.042.)
const LARGE_LINE = 0.035;

const isRealLine = (text) => /[A-Za-z0-9À-ɏ]{2,}|[0-9]/.test(text || '');

/**
 * @param {{ text, left, top, right, bottom }[]} lines positions 0–1, top-left origin
 * @returns {{
 *   found: boolean,
 *   cut: { left: boolean, right: boolean, top: boolean, bottom: boolean },
 *   tooSmall: boolean,
 *   moves: ('left'|'right'|'up'|'down')[],   // which way to move the phone
 *   back: boolean,                            // move farther away (text wider/taller than the photo)
 *   closer: boolean,                          // move closer (text too small)
 *   good: boolean,                            // whole text in view and big enough
 * }}
 */
export function framingAdvice(lines) {
  const text = (lines || []).filter((l) => isRealLine(l.text));
  const none = { found: false, cut: { left: false, right: false, top: false, bottom: false }, tooSmall: false, moves: [], back: false, closer: false, good: false };
  if (!text.length) return none;

  const cut = {
    left: text.some((l) => l.left < EDGE),
    right: text.some((l) => l.right > 1 - EDGE),
    top: text.some((l) => l.top < EDGE),
    bottom: text.some((l) => l.bottom > 1 - EDGE),
  };
  const heights = text.map((l) => l.bottom - l.top).sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)];
  const tooSmall = median < SMALL_LINE;

  // Text sticking out on opposite sides, or cut off while already large: it's
  // bigger than the picture → move back rather than sideways.
  const anyCutEdge = cut.left || cut.right || cut.top || cut.bottom;
  const back = (cut.left && cut.right) || (cut.top && cut.bottom) || (anyCutEdge && median > LARGE_LINE);
  const moves = [];
  if (!back) {
    if (cut.left) moves.push('left');
    if (cut.right) moves.push('right');
    if (cut.top) moves.push('up');
    if (cut.bottom) moves.push('down');
  }

  // Nothing cut off, but the text sits far from the middle: nudge towards it.
  if (!back && !moves.length) {
    const left = Math.min(...text.map((l) => l.left));
    const right = Math.max(...text.map((l) => l.right));
    const top = Math.min(...text.map((l) => l.top));
    const bottom = Math.max(...text.map((l) => l.bottom));
    const cx = (left + right) / 2 - 0.5;
    const cy = (top + bottom) / 2 - 0.5;
    if (cx < -OFF_CENTRE) moves.push('left');
    if (cx > OFF_CENTRE) moves.push('right');
    if (cy < -OFF_CENTRE) moves.push('up');
    if (cy > OFF_CENTRE) moves.push('down');
  }

  const closer = !back && tooSmall;
  const anyCut = cut.left || cut.right || cut.top || cut.bottom;
  return { found: true, cut, tooSmall, moves, back, closer, good: !anyCut && !closer && !moves.length };
}

/** Lines in reading order: top to bottom, then left to right within a row. */
export function readingOrder(lines) {
  return [...lines].sort((a, b) => {
    const rowTolerance = Math.min(a.bottom - a.top, b.bottom - b.top) * 0.6;
    if (Math.abs(a.top - b.top) > rowTolerance) return a.top - b.top;
    return a.left - b.left;
  });
}
