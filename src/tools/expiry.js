// Finds expiry / best-before dates in text read from a package.

const MONTHS = {
  jan: 1, january: 1, enero: 1, feb: 2, february: 2, pebrero: 2, mar: 3, march: 3, marso: 3,
  apr: 4, april: 4, abril: 4, may: 5, mayo: 5, jun: 6, june: 6, hunyo: 6, jul: 7, july: 7, hulyo: 7,
  aug: 8, august: 8, agosto: 8, sep: 9, sept: 9, september: 9, setyembre: 9, oct: 10, october: 10, oktubre: 10,
  nov: 11, november: 11, nobyembre: 11, dec: 12, december: 12, disyembre: 12,
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');
// Words printed before an expiry date (and ones that mean "made on", to skip).
const EXPIRY_WORDS = /\b(exp\.?|expiry|expires?|expiration|best\s*before|bb|bbe|use\s*by|consume\s*before|best\s*by)\b/i;
const MADE_WORDS = /\b(mfg|mfd|mft|manufactured|made|prod(uction)?|packed|pkd|lot)\b/i;

const fullYear = (y) => (y < 100 ? 2000 + y : y);
const validDay = (d, m, y) => m >= 1 && m <= 12 && d >= 1 && d <= new Date(y, m, 0).getDate();

/** All dates found in one line of text, with their position. */
function datesInLine(line) {
  const found = [];
  const text = line.toLowerCase();
  let m;

  // 12 MAR 2026 / 12-MAR-26 / 12 March 2026
  const dmy = new RegExp(`\\b(\\d{1,2})[\\s./-]*(${MONTH_RE})[a-z]*[\\s.,/-]*(\\d{2,4})\\b`, 'g');
  while ((m = dmy.exec(text))) {
    const d = +m[1]; const mo = MONTHS[m[2]]; const y = fullYear(+m[3]);
    if (validDay(d, mo, y)) found.push({ at: m.index, y, m: mo, d });
  }
  // MAR 12 2026 / March 12, 2026
  const mdy = new RegExp(`\\b(${MONTH_RE})[a-z]*[\\s.]*(\\d{1,2})[\\s,]+(\\d{4})\\b`, 'g');
  while ((m = mdy.exec(text))) {
    const mo = MONTHS[m[1]]; const d = +m[2]; const y = +m[3];
    if (validDay(d, mo, y)) found.push({ at: m.index, y, m: mo, d });
  }
  // MAR 2026 / MAR-26 (month only)
  const my = new RegExp(`\\b(${MONTH_RE})[a-z]*[\\s./-]*(\\d{4}|\\d{2})\\b(?![\\s./-]*\\d)`, 'g');
  while ((m = my.exec(text))) {
    if (found.some((f) => Math.abs(f.at - m.index) < 4)) continue;
    found.push({ at: m.index, y: fullYear(+m[2]), m: MONTHS[m[1]], d: null });
  }
  // 2026-03-12 / 2026/03/12
  const iso = /\b(20\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/g;
  while ((m = iso.exec(text))) {
    const y = +m[1]; const mo = +m[2]; const d = +m[3];
    if (validDay(d, mo, y)) found.push({ at: m.index, y, m: mo, d });
  }
  // 12/03/2026, 03.12.26 — day/month order can be ambiguous
  const num = /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g;
  while ((m = num.exec(text))) {
    const a = +m[1]; const b = +m[2]; const y = fullYear(+m[3]);
    const dm = validDay(a, b, y);
    const md = validDay(b, a, y);
    if (dm && md && a !== b) found.push({ at: m.index, y, m: b, d: a, alt: { y, m: a, d: b } });
    else if (dm) found.push({ at: m.index, y, m: b, d: a });
    else if (md) found.push({ at: m.index, y, m: a, d: b });
  }
  // 03/2026, 03/26 (month/year)
  const numMy = /\b(\d{1,2})[./-](20\d{2}|\d{2})\b(?![./-]\d)/g;
  while ((m = numMy.exec(text))) {
    const mo = +m[1];
    if (mo < 1 || mo > 12 || found.some((f) => Math.abs(f.at - m.index) < 6)) continue;
    found.push({ at: m.index, y: fullYear(+m[2]), m: mo, d: null });
  }
  return found;
}

/**
 * Picks the most likely expiry date from OCR lines.
 * @returns {null | { y, m, d|null, alt?, labelled: boolean }}
 */
export function findExpiryDate(lines) {
  const candidates = [];
  lines.forEach((line, index) => {
    const prev = lines[index - 1] ?? '';
    for (const date of datesInLine(line)) {
      const before = line.slice(0, date.at);
      const labelled = EXPIRY_WORDS.test(before) || (EXPIRY_WORDS.test(prev) && !/\d/.test(before));
      const made = MADE_WORDS.test(before) || (MADE_WORDS.test(prev) && !labelled);
      candidates.push({ ...date, labelled, made });
    }
  });
  if (!candidates.length) return null;
  const labelled = candidates.find((c) => c.labelled);
  if (labelled) return labelled;
  // No label: the latest date that isn't marked as a manufacturing date.
  const usable = candidates.filter((c) => !c.made);
  const pool = usable.length ? usable : candidates;
  return pool.reduce((best, c) => (dateValue(c) > dateValue(best) ? c : best));
}

const dateValue = (c) => c.y * 10000 + c.m * 100 + (c.d ?? 28);

/** "12 March 2026" / "March 2026" in the given month names. */
export function formatDate(date, monthNames) {
  const month = monthNames[date.m - 1];
  return date.d ? `${date.d} ${month} ${date.y}` : `${month} ${date.y}`;
}

/** Whole days from `today` to the date (end of month if no day). */
export function daysUntil(date, today = new Date()) {
  const day = date.d ?? new Date(date.y, date.m, 0).getDate();
  const target = Date.UTC(date.y, date.m - 1, day);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86400000);
}

/** Rounds a number of days to the clearest unit: { n, unit: 'day'|'week'|'month'|'year' }. */
export function roughDuration(days) {
  const a = Math.abs(days);
  if (a < 14) return { n: a, unit: 'day' };
  if (a < 60) return { n: Math.round(a / 7), unit: 'week' };
  if (a < 730) return { n: Math.round(a / 30.4), unit: 'month' };
  return { n: Math.round(a / 365), unit: 'year' };
}
