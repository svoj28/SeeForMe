import { detectWithImage, DETECTOR_INPUT_SIZE } from '../vision/detector';
import { describeDetections, MIN_SCORE, nothingFound } from '../vision/describe';
import { cameraFromPhoto } from '../vision/distance';
import { imageStats, photoProblem } from '../vision/imageStats';

export { loadDetector } from '../vision/detector';

/**
 * Turns a captured photo into a sentence to read aloud, using the on-device
 * EfficientDet-Lite0 object detector (works offline, nothing leaves the phone).
 * Take the photo with { exif: true } so distances use the real lens focal length.
 *
 * @param {{ uri: string, width: number, height: number, exif?: object }} photo
 * @param {{ brief?: boolean, scene?: boolean, distances?: boolean, lang?: string, checkQuality?: boolean }} [options]
 * @returns {Promise<{ text: string, labels?: string[], empty: boolean, problem: null | 'covered' | 'dark' | 'blurry' }>}
 *   labels: the distinct confidently-detected labels (absent when problem is set).
 *   problem: the photo is unusable (only when checkQuality is on); text is then empty.
 */
export async function describeScene(photo, options = {}) {
  const { detections, rgb } = await detectWithImage(photo.uri);
  if (options.checkQuality) {
    const problem = photoProblem(imageStats(rgb, DETECTOR_INPUT_SIZE, DETECTOR_INPUT_SIZE));
    // A dark or blurry photo can still show big things clearly: only give up if nothing was found.
    const found = detections.some((d) => d.score >= 0.5);
    if (problem === 'covered' || (problem && !found)) return { text: '', empty: true, problem };
  }
  const text = describeDetections(detections, cameraFromPhoto(photo), options);
  const labels = [...new Set(detections.filter((d) => d.score >= MIN_SCORE).map((d) => d.label))];
  return { text, labels, detections, empty: text === nothingFound(options.lang), problem: null };
}
