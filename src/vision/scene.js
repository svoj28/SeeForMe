// Guesses the kind of place from the objects seen. Strong clues (2 points)
// are enough on their own; weak clues (1 point) need a second clue.
const SCENES = [
  { name: 'a kitchen', clues: { oven: 2, microwave: 2, refrigerator: 2, toaster: 2, sink: 1 } },
  { name: 'a bathroom', clues: { toilet: 2, toothbrush: 1, 'hair drier': 1, sink: 1 } },
  { name: 'a bedroom', clues: { bed: 2, clock: 1, 'teddy bear': 1 } },
  { name: 'a living room', clues: { couch: 1, tv: 1, remote: 1, 'potted plant': 1, vase: 1 } },
  { name: 'a desk or office', clues: { laptop: 1, keyboard: 1, mouse: 1, 'cell phone': 1, book: 1 } },
  {
    name: 'a dining table',
    clues: { 'dining table': 1, cup: 1, bowl: 1, fork: 1, knife: 1, spoon: 1, 'wine glass': 1, pizza: 1, cake: 1, sandwich: 1 },
  },
  {
    name: 'a street',
    clues: { 'traffic light': 2, 'stop sign': 2, bus: 2, 'parking meter': 2, 'fire hydrant': 2, car: 1, truck: 1, motorcycle: 1, bicycle: 1 },
  },
  { name: 'a farm or field', clues: { horse: 1, cow: 1, sheep: 1 } },
];

/** @returns {string | null} e.g. "a kitchen" */
export function guessScene(labels) {
  const present = new Set(labels);
  let best = null;
  for (const scene of SCENES) {
    let score = 0;
    for (const [label, weight] of Object.entries(scene.clues)) {
      if (present.has(label)) score += weight;
    }
    if (score >= 2 && (!best || score > best.score)) best = { name: scene.name, score };
  }
  return best?.name ?? null;
}
