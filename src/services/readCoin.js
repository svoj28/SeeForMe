import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { readLines } from './readText';
import { COIN_LOOKALIKES, coinSideHint, readPesoCoin } from '../tools/money';

// On-device coin reading (fallback when Gemini is unavailable).
// The coin is cropped out of the photo and enlarged to this width, so its
// small embossed numbers become big enough for the text recognizer.
const CROP_SIDE = 1000;
// Coin text is upright only if the user happens to hold the coin that way.
// The recognizer copes with a little tilt, so 8 turns cover every angle.
// Upright and upside-down first: those are the most common.
const ANGLES = [0, 180, 90, 270, 45, 135, 225, 315];
// Stop early once this many passes agree on the same value.
const AGREE = 2;
// Without a detector box, look at this much of the middle of the photo
// (a coin held close often fills the frame and the detector misses it).
const CENTRE_FRACTION = 0.7;

/** The most confident coin-like detector box, or null. */
export function coinBox(detections) {
  const coins = (detections ?? []).filter((d) => d.score >= 0.3 && COIN_LOOKALIKES.includes(d.label));
  if (!coins.length) return null;
  return coins.reduce((a, b) => (b.score > a.score ? b : a)).box;
}

/** A square crop rectangle (in pixels) around the coin, with some margin. */
function cropRect(box, width, height) {
  let cx = width / 2;
  let cy = height / 2;
  let side = Math.min(width, height) * CENTRE_FRACTION;
  if (box) {
    cx = ((box.left + box.right) / 2) * width;
    cy = ((box.top + box.bottom) / 2) * height;
    side = Math.max((box.right - box.left) * width, (box.bottom - box.top) * height) * 1.3;
  }
  side = Math.min(side, width, height);
  const originX = Math.round(Math.min(Math.max(0, cx - side / 2), width - side));
  const originY = Math.round(Math.min(Math.max(0, cy - side / 2), height - side));
  return { originX, originY, width: Math.round(side), height: Math.round(side) };
}

async function render(uri, edit) {
  const context = ImageManipulator.manipulate(uri);
  edit(context);
  const image = await context.renderAsync();
  try {
    return (await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.92 })).uri;
  } finally {
    image.release?.();
    context.release?.();
  }
}

/**
 * Reads a coin's value by cropping to the coin and reading it at several angles.
 *
 * @param {{ uri: string, width: number, height: number }} photo
 * @param {{ detections?: Array, lines?: string[], isActive?: () => boolean }} [options]
 *   detections: detector output for this photo (to find the coin);
 *   lines: OCR lines already read from the whole photo (counted as one pass);
 *   isActive: return false to stop early (e.g. the user cancelled).
 * @returns {Promise<{ kind: 'coin', value: number, unit: 'piso' | 'sentimo' } |
 *   { kind: 'unread', hint: null | 'flip' | 'closer' }>}
 */
export async function readCoin(photo, { detections, lines, isActive = () => true } = {}) {
  const votes = new Map();
  const seen = [];
  const count = (found) => {
    seen.push(...found);
    const coin = readPesoCoin(found);
    if (!coin) return null;
    const key = `${coin.value}|${coin.unit}`;
    votes.set(key, (votes.get(key) ?? 0) + 1);
    return votes.get(key) >= AGREE ? coin : null;
  };

  if (lines?.length) {
    const sure = count(lines);
    if (sure) return sure;
  }

  let crop;
  try {
    const rect = cropRect(coinBox(detections), photo.width, photo.height);
    crop = await render(photo.uri, (c) => c.crop(rect).resize({ width: CROP_SIDE }));
  } catch (e) {
    console.warn('coin crop failed', e);
    crop = photo.uri;
  }

  for (const angle of ANGLES) {
    if (!isActive()) break;
    try {
      const uri = angle ? await render(crop, (c) => c.rotate(angle)) : crop;
      // width keeps readLines from retrying on a downscaled copy.
      const sure = count(await readLines({ uri, width: CROP_SIDE }));
      if (sure) return sure;
    } catch (e) {
      console.warn(`coin read at ${angle}° failed`, e);
    }
  }

  // One clear reading with nothing contradicting it is good enough.
  if (votes.size === 1) {
    const [key] = [...votes.keys()];
    const [value, unit] = key.split('|');
    return { kind: 'coin', value: Number(value), unit };
  }
  return { kind: 'unread', hint: votes.size > 1 ? 'closer' : coinSideHint(seen) };
}
