// Money aiming guide: where is the money in the camera picture, and how should
// the phone move so View money gets a good photo? Runs only on the phone (text
// locator + object detector), never online. Pure functions: easy to test.

const EDGE = 0.03; // a box this close to the picture's edge is probably cut off
const OFF_CENTRE = 0.18; // centre this far from the middle → move the phone toward it

// Words printed on Philippine bills and coins, and the denominations.
const MONEY_TEXT = /\b(bangko|sentral|pilipinas|republika|piso|pesos?|sentimo|20|50|100|200|500|1000|1|5|10|25)\b/i;
// Labels an imported money detector might use.
const MONEY_LABEL = /piso|peso|sentimo|centavo|bill|banknote|coin|money|cash/i;
const COIN_LOOKALIKES = ['frisbee']; // the built-in detector's guess for a coin

// How big the money should look (largest side, share of the picture).
const SIZE = {
  coin: { min: 0.22, max: 0.85 },
  bill: { min: 0.4, max: 0.97 },
  text: { min: 0.3, max: 0.97 }, // bill found from its printed text (covers less than the bill)
};

const union = (boxes) => ({
  left: Math.min(...boxes.map((b) => b.left)),
  top: Math.min(...boxes.map((b) => b.top)),
  right: Math.max(...boxes.map((b) => b.right)),
  bottom: Math.max(...boxes.map((b) => b.bottom)),
});

/**
 * Finds the money in the picture.
 * @param {{ lines?: { text, left, top, right, bottom }[], detections?: { label, score, box }[] }} input
 * @returns {{ kind: 'coin' | 'bill' | 'text', box: { left, top, right, bottom } } | null}
 */
export function findMoney({ lines = [], detections = [] } = {}) {
  const sure = (detections ?? []).filter((d) => d.score >= 0.35);
  const best = (list) => list.reduce((a, b) => (b.score > a.score ? b : a));
  const own = sure.filter((d) => MONEY_LABEL.test(d.label ?? ''));
  if (own.length) {
    const d = best(own);
    return { kind: /coin|sentimo|centavo/i.test(d.label) ? 'coin' : 'bill', box: d.box };
  }
  const coins = sure.filter((d) => COIN_LOOKALIKES.includes(d.label));
  if (coins.length) return { kind: 'coin', box: best(coins).box };
  const moneyLines = (lines ?? []).filter((l) => l.left != null && MONEY_TEXT.test(l.text ?? ''));
  // One stray number isn't money: need a money word, or two or more matches.
  const hasWord = moneyLines.some((l) => /[a-z]{4,}/i.test(l.text));
  if (moneyLines.length && (hasWord || moneyLines.length >= 2)) return { kind: 'text', box: union(moneyLines) };
  return null;
}

/**
 * @returns {{ found: boolean, moves: ('left'|'right'|'up'|'down')[], closer: boolean, farther: boolean, good: boolean, kind?: string }}
 *   moves: which way to move the phone (toward the money).
 */
export function moneyGuideAdvice(input) {
  const money = findMoney(input);
  if (!money) return { found: false, moves: [], closer: false, farther: false, good: false };
  const { box, kind } = money;
  const size = Math.max(box.right - box.left, box.bottom - box.top);
  const cut = { left: box.left < EDGE, right: box.right > 1 - EDGE, top: box.top < EDGE, bottom: box.bottom > 1 - EDGE };
  const limits = SIZE[kind];
  const farther = (cut.left && cut.right) || (cut.top && cut.bottom) || size > limits.max;
  const moves = [];
  if (!farther) {
    const cx = (box.left + box.right) / 2 - 0.5;
    const cy = (box.top + box.bottom) / 2 - 0.5;
    if (cut.left || cx < -OFF_CENTRE) moves.push('left');
    else if (cut.right || cx > OFF_CENTRE) moves.push('right');
    if (cut.top || cy < -OFF_CENTRE) moves.push('up');
    else if (cut.bottom || cy > OFF_CENTRE) moves.push('down');
  }
  const closer = !farther && size < limits.min;
  return { found: true, kind, moves, closer, farther, good: !farther && !closer && !moves.length };
}

/** A short key for "the same advice as last time" (so it isn't repeated every frame). */
export const adviceKey = (a) => (!a.found ? 'none' : a.good ? 'good' : a.farther ? 'farther' : `${a.moves.join('+')}|${a.closer}`);
