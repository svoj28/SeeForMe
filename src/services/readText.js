import { Platform } from 'react-native';
import { extractTextFromImage, isSupported as extractorSupported } from 'expo-text-extractor';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { t } from '../i18n';
import { locateText, textLocatorAvailable } from './textLocator';
import { framingAdvice } from '../tools/framing';

// Below this many letters/digits we assume the first pass mostly failed and
// try again on a smaller copy of the photo.
const RETRY_BELOW_CHARS = 20;
// Photos of TVs, monitors and phones show moiré stripes from the pixel grid at
// full resolution; a downscaled copy averages them out and often reads better.
const RETRY_WIDTH = 1280;

const supported = textLocatorAvailable || extractorSupported;

// expo-text-extractor's Android code opens the path with java.io.File, which rejects file:// URIs.
const toNativePath = (uri) =>
  Platform.OS === 'android' && uri.startsWith('file://') ? decodeURI(uri.replace(/^file:\/\//, '')) : uri;

// Drops OCR noise like "|", "~~" or a lone stray letter.
const isRealLine = (line) => /[A-Za-z0-9À-ɏ]{2,}|[0-9]/.test(line);

const textAmount = (lines) => lines.map((l) => l.text).join('').replace(/[^A-Za-z0-9À-ɏ]/g, '').length;

/**
 * One OCR pass. Returns lines as { text, left?, top?, right?, bottom? };
 * positions are present only with our own TextLocator module.
 */
async function ocr(uri) {
  if (textLocatorAvailable) {
    const result = await locateText(uri);
    return result.lines.map((l) => ({ ...l, text: l.text.trim() })).filter((l) => isRealLine(l.text));
  }
  return (await extractTextFromImage(toNativePath(uri)))
    .flatMap((block) => block.split('\n'))
    .map((text) => ({ text: text.trim() }))
    .filter((l) => isRealLine(l.text));
}

async function downscaled(uri) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: RETRY_WIDTH });
  const image = await context.renderAsync();
  try {
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
    return saved.uri;
  } finally {
    image.release?.();
    context.release?.();
  }
}

/** Text lines with positions (when available), with the downscaled retry for screens. */
export async function readLocatedLines(photo) {
  if (!supported) return [];
  let lines = await ocr(photo.uri);
  if (textAmount(lines) < RETRY_BELOW_CHARS && (photo.width ?? Infinity) > RETRY_WIDTH) {
    try {
      const retry = await ocr(await downscaled(photo.uri));
      if (textAmount(retry) > textAmount(lines)) lines = retry;
    } catch (e) {
      console.warn('OCR retry failed', e);
    }
  }
  return lines;
}

/** Raw text lines in a photo. Used by the money and expiry tools. */
export async function readLines(photo) {
  return (await readLocatedLines(photo)).map((l) => l.text);
}

export const joinWords = (words) =>
  words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} ${t('frame.and')} ${words[words.length - 1]}`;

/**
 * One spoken sentence telling the user how to move the phone, or '' if the
 * framing is fine. @param advice result of framingAdvice()
 */
export function adviceSentence(advice) {
  if (!advice.found || advice.good) return '';
  if (advice.back) return t('frame.back');
  const sides = t('frame.sides');
  const moves = t('frame.moves');
  const cutSides = Object.keys(advice.cut).filter((side) => advice.cut[side]);
  if (cutSides.length) return t('frame.cut', joinWords(cutSides.map((s) => sides[s])), joinWords(advice.moves.map((m) => moves[m])));
  if (advice.closer) return t('frame.closer');
  if (advice.moves.length) return t('frame.offCentre', joinWords(advice.moves.map((m) => moves[m])));
  return '';
}

/**
 * Reads printed text in a photo (signs, labels, letters, and the screens of
 * TVs, computers and phones) using on-device OCR: Google ML Kit on Android,
 * Apple Vision on iOS.
 *
 * @param {{ uri: string, width?: number }} photo
 * @param {{ torchOn?: boolean, tips?: boolean }} [options]
 *   tips: if some text was cut off at the edge of the photo, say which way to move the phone.
 * @returns {Promise<string>} sentence to speak
 */
export async function readText(photo, { torchOn = false, tips = false } = {}) {
  if (!supported) return t('read.unsupported');
  const lines = await readLocatedLines(photo);
  if (lines.length === 0) return t('read.none', torchOn);
  // End each line with a full stop so the voice pauses between lines.
  const spoken = t('read.says', lines.map(({ text }) => (/[.!?:;,]$/.test(text) ? text : `${text}.`)).join(' '));
  if (!tips || lines[0].left == null) return spoken;
  // Only worth a tip if text was actually cut off (it was read, just not all of it).
  const advice = framingAdvice(lines);
  const cut = advice.back || Object.values(advice.cut).some(Boolean);
  return cut ? `${spoken} ${t('frame.tip', adviceSentence(advice))}` : spoken;
}
