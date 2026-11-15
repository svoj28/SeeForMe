import { loadTensorflowModel } from 'react-native-fast-tflite';
import { modelFile } from './modelSource';
import { photoToRgbTensor } from './imageToTensor';

// MiDaS v2.1 small (Intel, MIT License), LiteRT build with fp16 weights:
// https://huggingface.co/litert-community/MiDaS-small
// Input:  float32 [1, 256, 256, 3], RGB, ImageNet-normalized.
// Output: float32 [1, 256, 256], RELATIVE inverse depth (bigger = closer, no units).
const MODEL = require('../../assets/midas_small_256.tflite');
const SIZE = 256;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

// Calibrated on sample photos (close-ups vs open rooms and streets):
//   near = share of the walking path that is among the closest things in view
//   flat = how evenly close everything is; ~1–2 when one surface fills the frame
const VERY_NEAR = { near: 0.6, flat: 2.5 };
const NEAR = { near: 0.4, flat: 4 };

let modelPromise = null;

export function loadDepthModel() {
  if (!modelPromise) {
    modelPromise = modelFile(MODEL).then((source) => loadTensorflowModel(source, [])).catch((e) => {
      modelPromise = null;
      throw e;
    });
  }
  return modelPromise;
}

export function toModelInput(rgb) {
  const input = new Float32Array(SIZE * SIZE * 3);
  for (let i = 0; i < input.length; i++) {
    const c = i % 3;
    input[i] = (rgb[i] / 255 - MEAN[c]) / STD[c];
  }
  return input;
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))];
}

/**
 * @param {Float32Array} depth SIZE x SIZE relative inverse depth
 * @returns {{ level: 0 | 1 | 2, near: number, flat: number }} 0 clear, 1 near, 2 very near
 */
export function obstacleLevel(depth, size = SIZE) {
  // Every other pixel is plenty for percentiles, and 4x faster to sort.
  const sample = new Float32Array(Math.ceil(depth.length / 2));
  for (let i = 0, j = 0; i < depth.length; i += 2, j++) sample[j] = depth[i];
  sample.sort();
  const lo = percentile(sample, 2);
  const hi = percentile(sample, 98);
  const range = Math.max(hi - lo, 1e-6);

  // Walking path: middle half of the width, from 25% to 85% of the height.
  const r0 = Math.round(size * 0.25);
  const r1 = Math.round(size * 0.85);
  const c0 = Math.round(size * 0.25);
  const c1 = Math.round(size * 0.75);
  let nearCount = 0;
  let total = 0;
  for (let r = r0; r < r1; r++) {
    for (let c = c0; c < c1; c++) {
      if ((depth[r * size + c] - lo) / range > 0.7) nearCount++;
      total++;
    }
  }
  const near = nearCount / total;
  const flat = percentile(sample, 95) / Math.max(percentile(sample, 5), 1e-6);

  let level = 0;
  if (near > VERY_NEAR.near || flat < VERY_NEAR.flat) level = 2;
  else if (near > NEAR.near || flat < NEAR.flat) level = 1;
  return { level, near, flat };
}

/** Runs the depth model on a photo and rates what's ahead. */
export async function measureObstacle(photoUri) {
  const model = await loadDepthModel();
  const rgb = await photoToRgbTensor(photoUri, SIZE);
  const input = toModelInput(rgb);
  const [out] = await model.run([input.buffer]);
  return obstacleLevel(new Float32Array(out));
}
