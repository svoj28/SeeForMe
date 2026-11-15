import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import decodeJpeg from 'jpeg-js/lib/decoder';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < B64.length; i++) LOOKUP[B64.charCodeAt(i)] = i;

export function base64ToBytes(b64) {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = LOOKUP[clean.charCodeAt(i)];
    const b = LOOKUP[clean.charCodeAt(i + 1)];
    const c = LOOKUP[clean.charCodeAt(i + 2)];
    const d = LOOKUP[clean.charCodeAt(i + 3)];
    out[o++] = (a << 2) | (b >> 4);
    if (i + 2 < clean.length) out[o++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < clean.length) out[o++] = ((c & 3) << 6) | d;
  }
  return out.subarray(0, o);
}

/** Decodes JPEG bytes into a tightly packed RGB Uint8Array (no alpha). */
export function jpegToRgb(bytes) {
  const { width, height, data } = decodeJpeg(bytes, { useTArray: true, formatAsRGBA: false });
  return { width, height, data };
}

/**
 * Resizes a photo to size×size and returns its raw RGB bytes, the uint8
 * [1, size, size, 3] layout EfficientDet-Lite0 expects.
 */
export async function photoToRgbTensor(uri, size) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: size, height: size });
  const image = await context.renderAsync();
  try {
    const { base64 } = await image.saveAsync({ base64: true, format: SaveFormat.JPEG, compress: 0.95 });
    const rgb = jpegToRgb(base64ToBytes(base64));
    if (rgb.width !== size || rgb.height !== size) {
      throw new Error(`Resized image is ${rgb.width}x${rgb.height}, expected ${size}x${size}`);
    }
    return rgb.data;
  } finally {
    image.release?.();
    context.release?.();
  }
}
