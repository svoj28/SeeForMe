// Fast checks on the small RGB copy of a photo (e.g. 320 x 320, 3 bytes per pixel).
// Thresholds were calibrated on sample photos plus darkened, blurred and
// lens-covered versions of them:
//   normal photos: mean brightness 68–124, sharpness 625–2830
//   blurred:       sharpness 1–5;  darkened x0.15: mean 10–18;  covered: mean ~4, spread ~1

const COVERED_MEAN = 12;
const COVERED_SPREAD = 4;
const DARK_MEAN = 35;
const BLURRY_SHARPNESS = 40;

function luminance(rgb, count) {
  const y = new Float32Array(count);
  for (let i = 0, p = 0; i < count; i++, p += 3) y[i] = 0.299 * rgb[p] + 0.587 * rgb[p + 1] + 0.114 * rgb[p + 2];
  return y;
}

/** Brightness mean/spread and sharpness (variance of the Laplacian). */
export function imageStats(rgb, width, height) {
  const y = luminance(rgb, width * height);
  let sum = 0;
  for (let i = 0; i < y.length; i++) sum += y[i];
  const mean = sum / y.length;
  let sq = 0;
  for (let i = 0; i < y.length; i++) sq += (y[i] - mean) ** 2;
  const spread = Math.sqrt(sq / y.length);

  let lapSum = 0;
  let lapSq = 0;
  let n = 0;
  for (let r = 1; r < height - 1; r++) {
    for (let c = 1; c < width - 1; c++) {
      const i = r * width + c;
      const lap = -4 * y[i] + y[i - 1] + y[i + 1] + y[i - width] + y[i + width];
      lapSum += lap;
      lapSq += lap * lap;
      n++;
    }
  }
  const lapMean = lapSum / n;
  const sharpness = lapSq / n - lapMean * lapMean;
  return { mean, spread, sharpness };
}

/** @returns {null | 'covered' | 'dark' | 'blurry'} */
export function photoProblem(stats) {
  if (stats.mean < COVERED_MEAN && stats.spread < COVERED_SPREAD) return 'covered';
  if (stats.mean < DARK_MEAN) return 'dark';
  if (stats.sharpness < BLURRY_SHARPNESS) return 'blurry';
  return null;
}

// --- Colour -------------------------------------------------------------------

/** Average colour of the centre square (`fraction` of the width) of the image. */
export function centreColour(rgb, width, height, fraction = 0.2) {
  const half = Math.round((width * fraction) / 2);
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = cy - half; y < cy + half; y++) {
    for (let x = cx - half; x < cx + half; x++) {
      const p = (y * width + x) * 3;
      r += rgb[p];
      g += rgb[p + 1];
      b += rgb[p + 2];
      n++;
    }
  }
  return [r / n, g / n, b / n];
}

export function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

const COLOUR_WORDS = {
  en: {
    black: 'black', white: 'white', gray: 'gray', red: 'red', orange: 'orange', yellow: 'yellow', green: 'green',
    teal: 'teal', blue: 'blue', purple: 'purple', pink: 'pink', brown: 'brown', beige: 'beige',
    light: (c) => `light ${c}`, dark: (c) => `dark ${c}`,
  },
  fil: {
    black: 'itim', white: 'puti', gray: 'kulay abo', red: 'pula', orange: 'kahel', yellow: 'dilaw', green: 'berde',
    teal: 'asul-berde', blue: 'asul', purple: 'lila', pink: 'rosas', brown: 'kayumanggi', beige: 'krema',
    light: (c) => `mapusyaw na ${c}`, dark: (c) => `madilim na ${c}`,
  },
};

/** Names a colour in plain words, e.g. "dark blue" / "madilim na asul". */
export function colourName(rgb, lang = 'en') {
  const w = COLOUR_WORDS[lang] ?? COLOUR_WORDS.en;
  const [h, s, l] = rgbToHsl(rgb);
  if (l < 0.12) return w.black;
  if (l > 0.9 && s < 0.3) return w.white;
  if (s < 0.15) {
    if (l > 0.7) return w.light(w.gray);
    if (l < 0.3) return w.dark(w.gray);
    return w.gray;
  }
  let base;
  // Pale colours have high HSL saturation: beige is ~0.63, a real peach ~1.0.
  if (h >= 20 && h < 50 && s < 0.75 && l > 0.7) base = 'beige';
  else if (h < 15 || h >= 345) base = l > 0.7 ? 'pink' : 'red';
  else if (h < 40) base = l < 0.4 ? 'brown' : 'orange';
  else if (h < 65) base = l < 0.3 ? 'brown' : 'yellow';
  else if (h < 170) base = 'green';
  else if (h < 200) base = 'teal';
  else if (h < 255) base = 'blue';
  else if (h < 290) base = 'purple';
  else base = 'pink';

  const name = w[base];
  if (base === 'brown' || base === 'beige') return name;
  if (l > 0.72) return w.light(name);
  if (l < 0.28) return w.dark(name);
  return name;
}
