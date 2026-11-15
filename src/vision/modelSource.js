import { Asset } from 'expo-asset';

/**
 * Turns a bundled model (`require('...tflite')`) into a `{ url: 'file://...' }`
 * source for react-native-fast-tflite.
 *
 * fast-tflite 3 reads models with `URL(path).readBytes()` on Android. In a dev
 * build the bundled path is Metro's http:// URL, which works, but in an installed
 * (release/EAS) build it is a bare resource name like "assets_efficientdet_lite0",
 * which isn't a URL, so the model failed to load ("The recognition model could
 * not load"). expo-asset copies the resource to a real file first.
 */
export async function modelFile(moduleId) {
  const asset = Asset.fromModule(moduleId);
  if (!asset.localUri) await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) throw new Error('model asset has no uri');
  return { url: uri.includes('://') ? uri : `file://${uri}` };
}
