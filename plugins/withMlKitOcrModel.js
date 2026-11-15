// Asks Google Play Services to download the ML Kit text-recognition model when
// the app is installed, instead of on the first "Read text" tap.
// https://developers.google.com/ml-kit/vision/text-recognition/v2/android
//
// expo-dev-launcher declares the same meta-data key (value "barcode_ui", for its
// QR scanner), so we merge both values and tell the manifest merger ours wins.
const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

const KEY = 'com.google.mlkit.vision.DEPENDENCIES';
const VALUE = 'ocr,barcode_ui';

module.exports = function withMlKitOcrModel(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app['meta-data'] = (app['meta-data'] || []).filter((m) => m.$['android:name'] !== KEY);
    app['meta-data'].push({
      $: { 'android:name': KEY, 'android:value': VALUE, 'tools:replace': 'android:value' },
    });
    return cfg;
  });
};
