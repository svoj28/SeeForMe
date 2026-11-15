// Builds native code with a newer CMake on every machine.
//
// The Android Gradle Plugin's default CMake (3.22.1) ships a ninja that can't
// handle Windows paths over 260 characters, and react-native-safe-area-context's
// generated object paths exceed that. CMake 3.31.6 ships ninja 1.12, which
// supports long paths. The Android SDK downloads this version automatically.
//
// Only applied when prebuilding on Windows: other machines don't have the path
// limit, and cloud builders (EAS, Linux) don't have this CMake version installed
// ("CMake '3.31.6' was not found in SDK"), so they keep the default.
const { withAppBuildGradle } = require('expo/config-plugins');

const CMAKE_VERSION = '3.31.6';
const MARKER = '// @seeforme cmake-version';

module.exports = function withCmakeVersion(config) {
  if (process.platform !== 'win32') return config;
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes(MARKER)) {
      gradle = gradle.replace(
        /^android\s*\{/m,
        `android {\n    ${MARKER}\n    externalNativeBuild {\n        cmake {\n            version "${CMAKE_VERSION}"\n        }\n    }`,
      );
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
