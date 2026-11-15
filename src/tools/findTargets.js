// Objects the "Find" tool can look for, with the detector labels they map to
// and the words people might say for them (English and Filipino).

export const FIND_TARGETS = [
  { id: 'person', labels: ['person'], en: 'person', fil: 'tao', words: ['person', 'someone', 'somebody', 'people', 'man', 'woman', 'tao', 'kasama'] },
  { id: 'chair', labels: ['chair', 'couch', 'bench'], en: 'chair', fil: 'upuan', words: ['chair', 'seat', 'couch', 'sofa', 'bench', 'upuan', 'silya', 'sopa'] },
  { id: 'table', labels: ['dining table'], en: 'table', fil: 'mesa', words: ['table', 'desk', 'mesa', 'lamesa'] },
  { id: 'cup', labels: ['cup', 'wine glass'], en: 'cup', fil: 'tasa', words: ['cup', 'mug', 'glass', 'tasa', 'baso'] },
  { id: 'bottle', labels: ['bottle'], en: 'bottle', fil: 'bote', words: ['bottle', 'water bottle', 'bote', 'tumbler'] },
  { id: 'phone', labels: ['cell phone'], en: 'phone', fil: 'cellphone', words: ['phone', 'cellphone', 'cell phone', 'mobile', 'selpon', 'telepono'] },
  { id: 'bag', labels: ['backpack', 'handbag', 'suitcase'], en: 'bag', fil: 'bag', words: ['bag', 'backpack', 'handbag', 'purse', 'suitcase', 'luggage', 'maleta', 'pitaka'] },
  { id: 'laptop', labels: ['laptop'], en: 'laptop', fil: 'laptop', words: ['laptop', 'computer', 'kompyuter'] },
  { id: 'tv', labels: ['tv'], en: 'TV', fil: 'TV', words: ['tv', 'television', 'telebisyon'] },
  { id: 'remote', labels: ['remote'], en: 'remote control', fil: 'remote', words: ['remote', 'remote control'] },
  { id: 'book', labels: ['book'], en: 'book', fil: 'libro', words: ['book', 'notebook', 'libro', 'aklat'] },
  { id: 'bowl', labels: ['bowl'], en: 'bowl', fil: 'mangkok', words: ['bowl', 'plate', 'mangkok', 'plato', 'pinggan'] },
  { id: 'toilet', labels: ['toilet'], en: 'toilet', fil: 'inidoro', words: ['toilet', 'comfort room', 'cr', 'inidoro', 'kubeta', 'banyo'] },
  { id: 'sink', labels: ['sink'], en: 'sink', fil: 'lababo', words: ['sink', 'lababo'] },
  { id: 'bed', labels: ['bed'], en: 'bed', fil: 'kama', words: ['bed', 'kama', 'higaan'] },
  { id: 'dog', labels: ['dog'], en: 'dog', fil: 'aso', words: ['dog', 'puppy', 'aso', 'tuta'] },
  { id: 'cat', labels: ['cat'], en: 'cat', fil: 'pusa', words: ['cat', 'kitten', 'pusa', 'kuting'] },
  { id: 'car', labels: ['car', 'truck', 'bus'], en: 'car', fil: 'sasakyan', words: ['car', 'vehicle', 'truck', 'bus', 'jeep', 'jeepney', 'kotse', 'sasakyan', 'dyip'] },
  { id: 'bicycle', labels: ['bicycle', 'motorcycle'], en: 'bicycle', fil: 'bisikleta', words: ['bicycle', 'bike', 'motorcycle', 'motor', 'bisikleta', 'motorsiklo'] },
];

/** Name of a target in the given language. */
export const targetName = (target, lang) => target[lang] ?? target.en;

/**
 * Finds the target the user asked for in free text, e.g. "find my cup",
 * "hanapin ang bote". @returns {object | null}
 */
export function resolveTarget(text) {
  const words = ` ${(text || '').toLowerCase().replace(/[^a-zÀ-ɏ ]/g, ' ').replace(/\s+/g, ' ')} `;
  let best = null;
  for (const target of FIND_TARGETS) {
    for (const word of target.words) {
      if (words.includes(` ${word} `) && (!best || word.length > best.len)) best = { target, len: word.length };
    }
  }
  return best?.target ?? null;
}

/** What the user said after "find", for "I can't find X" messages. */
export function spokenObject(text) {
  // Longer alternatives first, and articles only as whole words ("ang", not "a" + "ng").
  const m = /(?:look for|where's|where is|hanapin mo|hanapin|nasaan ang|nasaan|find)\s+(?:(?:my|the|an|a|ang|yung|iyong|aking|ko)\s+)*(.+)$/i.exec(text || '');
  return (m?.[1] ?? '').replace(/\b(ko|please|po)\b/gi, '').trim();
}
