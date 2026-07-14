/**
 * Expo config plugin — sets the Android APK/AAB output filename.
 *
 * AGP 8+ removed archivesBaseName from inside the android { } block.
 * It must now be set at the project level (outside android { }).
 *
 * Result:
 *   APK:  mirror-release.apk  /  mirror-debug.apk
 *   AAB:  mirror-release.aab
 */

const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @param {{ baseName?: string }} options
 */
function withApkName(config, { baseName = "mirror" } = {}) {
  return withAppBuildGradle(config, (mod) => {
    let gradle = mod.modResults.contents;

    // Avoid inserting twice if prebuild runs multiple times
    if (gradle.includes("archivesBaseName")) {
      return mod;
    }

    // In AGP 8+, archivesBaseName must live at the top level of build.gradle,
    // NOT inside the android { } block. Prepend it before the first block.
    mod.modResults.contents = `base.archivesName.set("${baseName}")\n` + gradle;

    return mod;
  });
}

module.exports = withApkName;
