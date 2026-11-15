const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow bundling TensorFlow Lite models for react-native-fast-tflite
config.resolver.assetExts.push('tflite');

module.exports = config;
