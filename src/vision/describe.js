import { spokenName } from './labels';
import { distancePhrase, estimateDistance } from './distance';
import { guessScene } from './scene';

export const MIN_SCORE = 0.5;
const MAX_PHRASES = 5;
// Short mode (Live, or the "Short descriptions" setting): only the nearest few things.
const BRIEF_PHRASES = 3;

const WORDS = {
  en: {
    nothing:
      "I don't recognize anything. Try pointing the camera another way, moving back a little, or turning on the light.",
    where: { ahead: 'ahead', left: 'on your left', right: 'on your right' },
    one: (name) => `${/^[aeiou]/i.test(name) ? 'An' : 'A'} ${name}`,
    many: (n, name) => `${n} ${name}`,
    phrase: (what, where, howFar) => `${what} ${where}${howFar}.`,
    howFar: (d, many) => `, ${many ? 'nearest ' : ''}${d}`,
    veryClose: ', very close',
    scene: (s) => `This looks like ${s}.`,
  },
  fil: {
    nothing:
      'Wala akong makilala. Subukang itutok ang camera sa ibang direksyon, umatras nang kaunti, o buksan ang ilaw.',
    where: { ahead: 'sa harap', left: 'sa kaliwa mo', right: 'sa kanan mo' },
    one: (name) => `May ${name}`,
    many: (n, name) => `May ${n} ${name}`,
    phrase: (what, where, howFar) => `${what} ${where}${howFar}.`,
    howFar: (d, many) => `, ${many ? 'ang pinakamalapit ay ' : ''}${d}`,
    veryClose: ', napakalapit',
    scene: (s) => `Mukhang ${s} ito.`,
  },
};

const SCENE_FIL = {
  'a kitchen': 'kusina',
  'a bathroom': 'banyo',
  'a bedroom': 'kwarto',
  'a living room': 'sala',
  'a desk or office': 'opisina o mesa ng trabaho',
  'a dining table': 'hapag-kainan',
  'a street': 'kalsada',
  'a farm or field': 'bukid',
};

/** The "nothing recognized" sentence in a language (used to stay quiet in Live mode). */
export const nothingFound = (lang = 'en') => (WORDS[lang] ?? WORDS.en).nothing;
// Kept for older callers.
export const NOTHING_FOUND = WORDS.en.nothing;

const area = (b) => Math.max(0, b.right - b.left) * Math.max(0, b.bottom - b.top);

function overlapOfSmaller(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.min(area(a), area(b));
}

// The detector sometimes adds one big box around a group of the same thing
// (e.g. "cat" around two cats). Drop boxes that mostly contain 2+ others.
function dropGroupBoxes(dets) {
  return dets.filter((d) => {
    const inside = dets.filter(
      (o) => o !== d && o.label === d.label && area(o.box) < area(d.box) && overlapOfSmaller(d.box, o.box) > 0.8,
    );
    return inside.length < 2;
  });
}

export function position(box) {
  const cx = (box.left + box.right) / 2;
  if (cx < 0.33) return 'left';
  if (cx > 0.67) return 'right';
  return 'ahead';
}

/**
 * Turns detections into a short spoken description, e.g.
 * "This looks like a street. A person ahead, about 3 meters away. 2 cars on your left."
 *
 * @param detections output of detectObjects()
 * @param camera optional result of cameraFromPhoto(); enables distance estimates
 * @param {{ brief?: boolean, scene?: boolean, distances?: boolean, lang?: 'en' | 'fil' }} [options]
 */
export function describeDetections(detections, camera = null, { brief = false, scene = true, distances = true, lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  const confident = dropGroupBoxes(detections.filter((d) => d.score >= MIN_SCORE));
  if (confident.length === 0) return w.nothing;

  // Group by "label + where it is", e.g. "2 people ahead"; keep the nearest one's distance.
  const groups = new Map();
  for (const d of confident) {
    const where = position(d.box);
    const key = `${d.label}|${where}`;
    const g = groups.get(key) ?? { label: d.label, where, count: 0, best: 0, close: false, metres: null };
    g.count += 1;
    g.best = Math.max(g.best, d.score);
    g.close = g.close || area(d.box) > 0.35;
    const m = distances ? estimateDistance(d.label, d.box, camera) : null;
    if (m != null && (g.metres == null || m < g.metres)) g.metres = m;
    groups.set(key, g);
  }

  const nearness = (g) => (g.metres != null ? g.metres : g.close ? 0.5 : 100);

  const phrases = [...groups.values()]
    .sort((a, b) => nearness(a) - nearness(b) || b.best - a.best)
    .slice(0, brief ? BRIEF_PHRASES : MAX_PHRASES)
    .map((g) => {
      const name = spokenName(g.label, g.count, lang);
      const what = g.count === 1 ? w.one(name) : w.many(g.count, name);
      const howFar =
        g.metres != null ? w.howFar(distancePhrase(g.metres, lang), g.count > 1) : g.close ? w.veryClose : '';
      return w.phrase(what, w.where[g.where], howFar);
    });

  const place = !brief && scene ? guessScene(confident.map((d) => d.label)) : null;
  const placeName = place && (lang === 'fil' ? SCENE_FIL[place] ?? place : place);
  return [placeName ? w.scene(placeName) : null, ...phrases].filter(Boolean).join(' ');
}
