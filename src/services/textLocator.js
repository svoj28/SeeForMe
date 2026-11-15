import { requireOptionalNativeModule } from 'expo';

// Our own native module (modules/text-locator): text plus where each line is.
const native = requireOptionalNativeModule('TextLocator');

export const textLocatorAvailable = native != null;

/**
 * @returns {Promise<{ width: number, height: number,
 *   lines: { text: string, block: number, left: number, top: number, right: number, bottom: number, angle: number, confidence: number }[] }>}
 *   Positions are 0–1 in the upright photo, top-left origin.
 */
export async function locateText(uri) {
  if (!native) throw new Error('TextLocator native module is not available');
  return native.recognize(uri);
}
