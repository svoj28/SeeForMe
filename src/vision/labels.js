// COCO label map bundled inside efficientdet_lite0.tflite (90 class ids).
// '???' marks ids the model never uses. Index = class id output by the model.
export const LABELS = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', '???', 'stop sign', 'parking meter', 'bench', 'bird',
  'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', '???',
  'backpack', 'umbrella', '???', '???', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis',
  'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
  'surfboard', 'tennis racket', 'bottle', '???', 'wine glass', 'cup', 'fork', 'knife',
  'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog',
  'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', '???', 'dining table',
  '???', '???', 'toilet', '???', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
  'microwave', 'oven', 'toaster', 'sink', 'refrigerator', '???', 'book', 'clock', 'vase',
  'scissors', 'teddy bear', 'hair drier', 'toothbrush',
];

// Friendlier spoken names. Anything not listed is spoken as-is.
const SPOKEN = {
  tv: 'TV',
  'cell phone': 'phone',
  'dining table': 'table',
  'potted plant': 'plant',
  'hair drier': 'hair dryer',
  'sports ball': 'ball',
  remote: 'remote control',
  mouse: 'computer mouse',
  // The model has no "coin" class: a coin held up to the camera comes out as a frisbee.
  frisbee: 'round object',
};

const PLURAL = {
  person: 'people',
  bus: 'buses',
  'wine glass': 'wine glasses',
  bench: 'benches',
  couch: 'couches',
  sandwich: 'sandwiches',
  knife: 'knives',
  sheep: 'sheep',
  skis: 'skis',
  scissors: 'scissors',
  toothbrush: 'toothbrushes',
};

// Filipino names (no plural forms: Filipino uses the number, e.g. "2 tao").
const FIL = {
  person: 'tao', bicycle: 'bisikleta', car: 'kotse', motorcycle: 'motorsiklo', airplane: 'eroplano', bus: 'bus',
  train: 'tren', truck: 'trak', boat: 'bangka', 'traffic light': 'traffic light', 'fire hydrant': 'fire hydrant',
  'stop sign': 'stop sign', 'parking meter': 'parking meter', bench: 'bangko', bird: 'ibon', cat: 'pusa', dog: 'aso',
  horse: 'kabayo', sheep: 'tupa', cow: 'baka', elephant: 'elepante', bear: 'oso', zebra: 'zebra', giraffe: 'dyirap',
  backpack: 'backpack', umbrella: 'payong', handbag: 'bag', tie: 'kurbata', suitcase: 'maleta', frisbee: 'bilog na bagay',
  skis: 'ski', snowboard: 'snowboard', 'sports ball': 'bola', kite: 'saranggola', 'baseball bat': 'baseball bat',
  'baseball glove': 'baseball glove', skateboard: 'skateboard', surfboard: 'surfboard', 'tennis racket': 'raketa',
  bottle: 'bote', 'wine glass': 'baso', cup: 'tasa', fork: 'tinidor', knife: 'kutsilyo', spoon: 'kutsara',
  bowl: 'mangkok', banana: 'saging', apple: 'mansanas', sandwich: 'sandwich', orange: 'dalandan', broccoli: 'broccoli',
  carrot: 'karot', 'hot dog': 'hotdog', pizza: 'pizza', donut: 'donut', cake: 'keyk', chair: 'upuan', couch: 'sopa',
  'potted plant': 'halaman', bed: 'kama', 'dining table': 'mesa', toilet: 'inidoro', tv: 'TV', laptop: 'laptop',
  mouse: 'mouse', remote: 'remote', keyboard: 'keyboard', 'cell phone': 'cellphone', microwave: 'microwave',
  oven: 'oven', toaster: 'toaster', sink: 'lababo', refrigerator: 'ref', book: 'libro', clock: 'orasan',
  vase: 'plorera', scissors: 'gunting', 'teddy bear': 'teddy bear', 'hair drier': 'hair dryer', toothbrush: 'sepilyo',
};

export function spokenName(label, count = 1, lang = 'en') {
  if (lang === 'fil') return FIL[label] ?? label;
  if (count === 1) return SPOKEN[label] ?? label;
  if (PLURAL[label]) return PLURAL[label];
  return `${SPOKEN[label] ?? label}s`;
}
