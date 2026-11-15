// Rough distance estimates from a single photo, using the pinhole camera
// model: distance = realHeight × focalLength / heightOnSensor.
// Only objects with a fairly consistent real-world height are included.
const TYPICAL_HEIGHT_M = {
  person: 1.7,
  bicycle: 1.0,
  car: 1.5,
  motorcycle: 1.1,
  bus: 3.0,
  truck: 3.0,
  'stop sign': 0.75,
  'fire hydrant': 0.7,
  'parking meter': 1.3,
  bench: 0.85,
  dog: 0.55,
  horse: 1.6,
  cow: 1.4,
  chair: 0.9,
  couch: 0.85,
  toilet: 0.75,
  refrigerator: 1.75,
  'dining table': 0.75,
  suitcase: 0.65,
  bottle: 0.25,
  cup: 0.1,
  'wine glass': 0.2,
  tv: 0.6,
};

const DEFAULT_FOCAL_35MM = 26; // typical main phone camera
const FULL_FRAME_DIAGONAL_MM = 43.27;

/**
 * Camera info for distance maths. "35mm-equivalent" focal length is defined
 * against the full-frame diagonal, so map the image's height onto it.
 */
export function cameraFromPhoto(photo) {
  const exif = photo?.exif ?? {};
  const focal35 = Number(exif.FocalLenIn35mmFilm ?? exif.FocalLengthIn35mmFilm) || DEFAULT_FOCAL_35MM;
  const w = photo?.width || 3;
  const h = photo?.height || 4;
  const imageHeightMm = (FULL_FRAME_DIAGONAL_MM * h) / Math.hypot(w, h);
  return { focal35, imageHeightMm };
}

/**
 * @returns {number | null} estimated metres, or null when it can't be judged
 * (unknown object size, or the object runs off the top/bottom of the photo).
 */
export function estimateDistance(label, box, camera) {
  const realHeight = TYPICAL_HEIGHT_M[label];
  if (!realHeight || !camera) return null;
  const clipped = box.top <= 0.01 || box.bottom >= 0.99;
  const fraction = box.bottom - box.top;
  if (clipped || fraction <= 0.01) return null;
  return (realHeight * camera.focal35) / (camera.imageHeightMm * fraction);
}

export function distancePhrase(metres, lang = 'en') {
  if (metres == null) return '';
  const rounded = Math.round(metres * 2) / 2;
  if (lang === 'fil') {
    if (metres < 1) return 'wala pang 1 metro ang layo';
    if (metres > 15) return 'malayo';
    return `mga ${rounded} metro ang layo`;
  }
  if (metres < 1) return 'less than 1 meter away';
  if (metres > 15) return 'far away';
  return `about ${rounded} meters away`;
}
