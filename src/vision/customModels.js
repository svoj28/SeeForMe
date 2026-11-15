import { loadTensorflowModel } from 'react-native-fast-tflite';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { photoToRgbTensor } from './imageToTensor';

// The user's own TensorFlow Lite models, imported from the phone's files and kept
// in the app's private folder (documents/models). Two optional slots:
//
// - 'money':    an image classifier (Teachable Machine / TFLite Model Maker export).
//               Input [1, H, W, 3] uint8 or float32; output [1, N] scores; a labels
//               file with one label per line, e.g. "20 piso", "5 sentimo coin",
//               "1000", "background". Labels without a valid peso value mean "no money".
// - 'detector': an object detector that replaces the built-in one for Describe.
//               SSD / EfficientDet style: outputs boxes [1,N,4], classes [1,N],
//               scores [1,N], count [1] (any order), plus a labels file.
//
// Float models get pixels scaled to -1..1 (Teachable Machine / MobileNet convention).

export const SLOTS = ['money', 'detector'];
const dir = () => new Directory(Paths.document, 'models');
const modelPath = (slot) => new File(dir(), `${slot}.tflite`);
const labelsPath = (slot) => new File(dir(), `${slot}.labels.txt`);

const loaded = new Map(); // slot -> Promise<{ model, labels }>

/**
 * Lines of a labels file. Teachable Machine numbers them ("0 20 piso", "1 50 piso");
 * that index is dropped only when every line has it in order, so a label that
 * itself starts with a number ("20 piso") is kept whole.
 */
export function parseLabels(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const numbered = lines.length > 0 && lines.every((l, i) => l.startsWith(`${i} `) && l.length > `${i} `.length);
  return numbered ? lines.map((l, i) => l.slice(`${i} `.length).trim()) : lines;
}

async function pick(types) {
  const r = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true, multiple: false });
  return r.canceled ? null : r.assets?.[0] ?? null;
}

/**
 * Lets the user pick a .tflite file, then its labels .txt file, checks that the
 * model loads, and saves both.
 * @returns {Promise<{ status: 'ok', name: string, labels: number } | { status: 'cancelled' | 'notModel' | 'noLabels' | 'failed', error?: string }>}
 */
export async function importModel(slot) {
  const modelAsset = await pick(['application/octet-stream', '*/*']);
  if (!modelAsset) return { status: 'cancelled' };
  if (!/\.tflite$/i.test(modelAsset.name ?? '')) return { status: 'notModel' };
  const labelsAsset = await pick(['text/plain', '*/*']);
  if (!labelsAsset) return { status: 'cancelled' };
  try {
    const labels = parseLabels(new File(labelsAsset.uri).textSync());
    if (!labels.length) return { status: 'noLabels' };
    // Check the model runs on this phone before replacing a working one.
    const model = await loadTensorflowModel({ url: modelAsset.uri }, []);
    checkShape(slot, model);
    const d = dir();
    if (!d.exists) d.create({ intermediates: true, idempotent: true });
    await new File(modelAsset.uri).copy(modelPath(slot), { overwrite: true });
    const lf = labelsPath(slot);
    if (!lf.exists) lf.create();
    lf.write(labels.join('\n'));
    loaded.delete(slot);
    return { status: 'ok', name: modelAsset.name, labels: labels.length };
  } catch (e) {
    console.warn(`import ${slot} model failed`, e);
    return { status: 'failed', error: String(e?.message ?? e) };
  }
}

function checkShape(slot, model) {
  const input = model.inputs[0];
  if (!input || input.shape.length !== 4 || input.shape[3] !== 3) {
    throw new Error(`input must be [1, height, width, 3], got [${input?.shape}]`);
  }
  if (slot === 'detector' && model.outputs.length < 4) {
    throw new Error('a detector needs 4 outputs (boxes, classes, scores, count)');
  }
}

export function removeModel(slot) {
  loaded.delete(slot);
  for (const f of [modelPath(slot), labelsPath(slot)]) {
    try {
      if (f.exists) f.delete();
    } catch (e) {
      console.warn('remove model failed', e);
    }
  }
}

export const hasModel = (slot) => {
  try {
    return modelPath(slot).exists && labelsPath(slot).exists;
  } catch {
    return false;
  }
};

/** Loads an imported model once. Rejects if none is imported. */
export function loadCustomModel(slot) {
  if (!loaded.has(slot)) {
    const p = (async () => {
      if (!hasModel(slot)) throw new Error(`no ${slot} model imported`);
      const labels = parseLabels(labelsPath(slot).textSync());
      const model = await loadTensorflowModel({ url: modelPath(slot).uri }, []);
      checkShape(slot, model);
      return { model, labels };
    })();
    p.catch(() => loaded.delete(slot));
    loaded.set(slot, p);
  }
  return loaded.get(slot);
}

/** Photo -> input buffer in the model's size and type. */
export async function modelInput(model, photoUri) {
  const [, h, w] = model.inputs[0].shape;
  const size = Math.max(h, w); // photoToRgbTensor makes square images; nearly all models are square
  const rgb = await photoToRgbTensor(photoUri, size);
  const type = model.inputs[0].dataType;
  if (type === 'float32') {
    const f = new Float32Array(rgb.length);
    for (let i = 0; i < rgb.length; i++) f[i] = rgb[i] / 127.5 - 1;
    return f.buffer;
  }
  if (type === 'int8') {
    const q = new Int8Array(rgb.length);
    for (let i = 0; i < rgb.length; i++) q[i] = rgb[i] - 128;
    return q.buffer;
  }
  return rgb.buffer.slice(rgb.byteOffset, rgb.byteOffset + rgb.byteLength);
}

/** Raw output buffer -> numbers, as 0..1 scores for quantized outputs. */
function scores(buffer, dataType) {
  if (dataType === 'uint8') return Array.from(new Uint8Array(buffer), (v) => v / 255);
  if (dataType === 'int8') return Array.from(new Int8Array(buffer), (v) => (v + 128) / 255);
  return Array.from(new Float32Array(buffer));
}

// --- Money classifier ------------------------------------------------------------------
const BILLS = [20, 50, 100, 200, 500, 1000];

/**
 * A label like "20 piso", "₱1000 bill", "25 sentimo", "5 peso coin" -> a piece of money,
 * or null for "background" / "nothing" / anything without a valid value.
 */
export function labelToMoney(label) {
  const s = label.toLowerCase();
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const value = Number(m[1]);
  if (/sentimo|centavo|cents?\b/.test(s)) return [1, 5, 25].includes(value) ? { kind: 'coin', value, unit: 'sentimo' } : null;
  if (/coin|barya/.test(s)) return [1, 5, 10, 20].includes(value) ? { kind: 'coin', value, unit: 'piso' } : null;
  if (/bill|papel|note|polymer/.test(s) || value >= 50) return BILLS.includes(value) ? { kind: 'bill', value, unit: 'piso' } : null;
  if ([1, 5, 10].includes(value)) return { kind: 'coin', value, unit: 'piso' };
  if (value === 20) return { kind: 'bill', value, unit: 'piso' };
  return null;
}

const MONEY_MIN_SCORE = 0.7;

/**
 * Reads money with the imported classifier.
 * @returns {Promise<null | { status: 'ok', piece: { kind, value, unit }, score: number } | { status: 'none' | 'unsure', score: number }>}
 *   null: no money model imported (or it failed to load).
 */
export async function readMoneyCustom(photo) {
  let m;
  try {
    m = await loadCustomModel('money');
  } catch {
    return null;
  }
  const out = await m.model.run([await modelInput(m.model, photo.uri)]);
  const s = scores(out[0], m.model.outputs[0].dataType);
  let best = 0;
  for (let i = 1; i < s.length; i++) if (s[i] > s[best]) best = i;
  const score = s[best] ?? 0;
  if (score < MONEY_MIN_SCORE) return { status: 'unsure', score };
  const piece = m.labels[best] != null ? labelToMoney(m.labels[best]) : null;
  if (!piece) return { status: 'none', score };
  return { status: 'ok', piece, score };
}

// --- Object detector -------------------------------------------------------------------
/**
 * Finds which raw output is boxes / classes / scores / count. Exporters don't agree
 * on the order, so it is worked out from sizes and values.
 */
export function splitDetectorOutputs(outputs) {
  const arrays = outputs.map((b) => new Float32Array(b));
  const count = arrays.find((a) => a.length === 1);
  const rest = arrays.filter((a) => a !== count);
  const n = Math.min(...rest.map((a) => a.length));
  const boxes = rest.find((a) => a.length === n * 4);
  const pair = rest.filter((a) => a !== boxes && a.length === n);
  const isInts = (a) => a.every((v) => Number.isInteger(v));
  // Classes are whole numbers, scores are fractions. If both look whole (e.g. all
  // zero), keep the usual order: classes first.
  let [classes, sc] = pair;
  if (pair.length === 2 && !isInts(pair[0]) && isInts(pair[1])) [sc, classes] = pair;
  if (!count || !boxes || !classes || !sc) throw new Error('unexpected detector outputs');
  return { boxes, classes, scores: sc, count: Math.min(Math.round(count[0]), sc.length) };
}

/** Detections in the same shape as the built-in detector's. */
export async function detectCustom(photoUri) {
  const { model, labels } = await loadCustomModel('detector');
  const { boxes, classes, scores: sc, count } = splitDetectorOutputs(await model.run([await modelInput(model, photoUri)]));
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const detections = [];
  for (let i = 0; i < count; i++) {
    const label = labels[Math.round(classes[i])];
    if (!label || label === '???') continue;
    detections.push({
      label,
      score: sc[i],
      box: { top: clamp(boxes[i * 4]), left: clamp(boxes[i * 4 + 1]), bottom: clamp(boxes[i * 4 + 2]), right: clamp(boxes[i * 4 + 3]) },
    });
  }
  return detections;
}
