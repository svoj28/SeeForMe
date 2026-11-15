// Money is identified by Google Gemini (see src/services/smartMoney.js).
// This file is the on-device fallback, used when Gemini is unavailable (free
// limit reached, busy, or no internet): it reads the value from text found on
// the bill or coin.
//
// Peso bills print "BANGKO SENTRAL NG PILIPINAS", "REPUBLIKA NG PILIPINAS",
// the value in figures, and the value in words ("ISANDAANG PISO").

export const PESO_BILLS = [20, 50, 100, 200, 500, 1000];

const BILL_MARKERS = /\b(bangko\s*sentral|pilipinas|republika|piso|pesos?)\b/i;

const VALUE_WORDS = [
  [1000, /\b(isang\s*libo|isanlibo(ng)?|sanlibo(ng)?)\b/i],
  [500, /\b(limang\s*daan|limandaan(g)?)\b/i],
  [200, /\b(dalawang\s*daan|dalawandaan(g)?)\b/i],
  [100, /\b(isang\s*daan|isandaan(g)?|sandaan(g)?)\b/i],
  [50, /\b(limampu(ng)?|limampung)\b/i],
  [20, /\b(dalawampu(ng)?|dalawampung)\b/i],
];

/**
 * @param {string[]} lines OCR lines
 * @returns {{ kind: 'none' } | { kind: 'unsure' } | { kind: 'bill', value: number }}
 */
export function readPesoBill(lines) {
  const text = lines.join(' ');
  const looksLikeBill = BILL_MARKERS.test(text);

  const votes = new Map();
  const vote = (value, weight) => votes.set(value, (votes.get(value) ?? 0) + weight);

  // Values in words are the most reliable (serial numbers never contain them).
  for (const [value, pattern] of VALUE_WORDS) if (pattern.test(text)) vote(value, 3);

  // Values in figures, as whole tokens only (not part of a serial number or year).
  const tokens = text.replace(/[,.]/g, ' ').split(/\s+/);
  for (const token of tokens) {
    const n = Number(token);
    if (PESO_BILLS.includes(n)) vote(n, 1);
  }

  if (!votes.size) return looksLikeBill ? { kind: 'unsure' } : { kind: 'none' };
  // A bare number without any peso wording is not enough.
  if (!looksLikeBill && Math.max(...votes.values()) < 3) return { kind: 'none' };

  const [value] = [...votes.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
  return { kind: 'bill', value };
}

// Philippine coins (both the 2017+ "New Generation" series and the older BSP
// series) stamp the value as a number followed by PISO or SENTIMO, e.g.
// "5 PISO", "25 SENTIMO". Embossed metal reads poorly, so allow the usual OCR
// mix-ups (I/1/l, O/0, E/3) and a stray symbol between number and word.
export const PESO_COINS = [1, 5, 10, 20];
export const SENTIMO_COINS = [1, 5, 25];

const COIN_PISO = /\b(\d{1,2})\s*[^a-z0-9\s]?\s*p[i1l!|]s[o0]s?\b/gi;
const COIN_SENTIMO = /\b(\d{1,2})\s*[^a-z0-9\s]?\s*s[e3]nt[i1l!|]m[o0]s?\b/gi;
// Value words that only appear on bills, never on coins.
const BILL_ONLY = /\b(isang\s*libo|isanlibo|sanlibo|limang\s*daan|limandaan|dalawang\s*daan|dalawandaan|isang\s*daan|isandaan|sandaan|limampu|dalawampu)/i;

/**
 * Reads a coin's value from OCR lines.
 * @param {string[]} lines
 * @returns {{ kind: 'coin', value: number, unit: 'piso' | 'sentimo' } | null}
 */
export function readPesoCoin(lines) {
  const text = lines.join(' ');
  if (BILL_ONLY.test(text)) return null;
  const first = (pattern, allowed) => {
    for (const m of text.matchAll(pattern)) {
      const n = Number(m[1]);
      if (allowed.includes(n)) return n;
    }
    return null;
  };
  const sentimo = first(COIN_SENTIMO, SENTIMO_COINS);
  if (sentimo != null) return { kind: 'coin', value: sentimo, unit: 'sentimo' };
  const piso = first(COIN_PISO, PESO_COINS);
  if (piso != null) return { kind: 'coin', value: piso, unit: 'piso' };
  return null;
}

/**
 * Reads a peso bill or coin.
 * @param {string[]} lines OCR lines
 * @returns {{ kind: 'none' } | { kind: 'unsure' } | { kind: 'bill', value: number } |
 *   { kind: 'coin', value: number, unit: 'piso' | 'sentimo' }}
 */
export function readPesoMoney(lines) {
  // Coins first: the bill reader ignores "5 PISO" (5 is not a bill), and a
  // "20 PISO" coin is 20 pesos either way.
  return readPesoCoin(lines) ?? readPesoBill(lines);
}

/** Detector labels that, in a close-up, are almost always a coin. */
export const COIN_LOOKALIKES = ['frisbee'];

// The back of a current coin has only the Bangko Sentral seal and name;
// the value, "REPUBLIKA NG PILIPINAS" and the portrait are on the front.
const BACK_WORDS = /\b(bangko|sentral)\b/i;
const FRONT_WORDS = /\b(republika|piso|sentimo)\b/i;
const ANY_COIN_TEXT = /\b(bangko|sentral|republika|pilipinas|piso|sentimo|(19|20)\d{2})\b/i;

/**
 * What to tell the user when a coin's value can't be read.
 * @param {string[]} lines all OCR lines read from the coin
 * @returns {null | 'flip' | 'closer'} flip: only the back is showing;
 *   closer: some coin text was read, just not the value.
 */
export function coinSideHint(lines) {
  const text = lines.join(' ');
  if (BACK_WORDS.test(text) && !FRONT_WORDS.test(text)) return 'flip';
  if (ANY_COIN_TEXT.test(text)) return 'closer';
  return null;
}
