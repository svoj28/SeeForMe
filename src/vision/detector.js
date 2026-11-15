import { loadTensorflowModel } from 'react-native-fast-tflite';
import { modelFile } from './modelSource';
import { detectCustom, hasModel } from './customModels';
import { LABELS } from './labels';
import { photoToRgbTensor } from './imageToTensor';

// EfficientDet-Lite0 (COCO, int8, Apache-2.0) from TensorFlow:
// https://storage.googleapis.com/download.tensorflow.org/models/tflite/task_library/object_detection/android/lite-model_efficientdet_lite0_detection_metadata_1.tflite
// Input: uint8 [1, 320, 320, 3] RGB.
// Outputs (in order): boxes [1,25,4] (ymin, xmin, ymax, xmax; 0..1),
// classes [1,25], scores [1,25], count [1].
const MODEL = require('../../assets/efficientdet_lite0.tflite');
const INPUT_SIZE = 320;

let modelPromise = null;

/** Loads the model once and reuses it. Safe to call early to warm it up. */
export function loadDetector() {
  if (!modelPromise) {
    modelPromise = modelFile(MODEL).then((source) => loadTensorflowModel(source, [])).catch((e) => {
      modelPromise = null; // allow retry
      throw e;
    });
  }
  return modelPromise;
}

/** Parses the 4 raw output buffers into labelled detections. */
export function parseOutputs(outputs) {
  const boxes = new Float32Array(outputs[0]);
  const classes = new Float32Array(outputs[1]);
  const scores = new Float32Array(outputs[2]);
  const count = Math.min(Math.round(new Float32Array(outputs[3])[0]), scores.length);
  const clamp = (v) => Math.min(1, Math.max(0, v));

  const detections = [];
  for (let i = 0; i < count; i++) {
    const label = LABELS[Math.round(classes[i])];
    if (!label || label === '???') continue;
    detections.push({
      label,
      score: scores[i],
      box: {
        top: clamp(boxes[i * 4]),
        left: clamp(boxes[i * 4 + 1]),
        bottom: clamp(boxes[i * 4 + 2]),
        right: clamp(boxes[i * 4 + 3]),
      },
    });
  }
  return detections;
}

/**
 * @returns {Promise<Array<{ label: string, score: number, box: { top: number, left: number, bottom: number, right: number } }>>}
 */
export async function detectObjects(photoUri) {
  return (await detectWithImage(photoUri)).detections;
}

export const DETECTOR_INPUT_SIZE = INPUT_SIZE;

// The user's own detector (imported in Settings) replaces the built-in one when turned on.
let useCustom = false;
export function setUseCustomDetector(on) {
  useCustom = !!on;
}

/** Like detectObjects, but also returns the 320x320 RGB copy (for quality and colour checks). */
export async function detectWithImage(photoUri) {
  if (useCustom && hasModel('detector')) {
    try {
      const detections = await detectCustom(photoUri);
      return { detections, rgb: await photoToRgbTensor(photoUri, INPUT_SIZE) };
    } catch (e) {
      console.warn('own detector failed; using the built-in one', e);
    }
  }
  const model = await loadDetector();
  const rgb = await photoToRgbTensor(photoUri, INPUT_SIZE);
  const input = rgb.buffer.slice(rgb.byteOffset, rgb.byteOffset + rgb.byteLength);
  return { detections: parseOutputs(await model.run([input])), rgb };
}
