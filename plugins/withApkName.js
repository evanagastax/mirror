/**
 * Expo config plugin — sets the Android APK/AAB output filename.
 *
 * Adds `archivesBaseName = "mirror"` to android/app/build.gradle so that
 * Gradle names the output files:
 *   APK:  mirror-release.apk  (or mirror-debug.apk)
 *   AAB:  mirror-release.aab
 *
 * This runs automatically during `expo prebuild` and during every
 * EAS build (cloud or local) because EAS runs prebuild before compiling.
 */

const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @param {{ baseName?: string }} options
 */
function withApkName(config, { baseName = "mirror" } = {}) {
  return withAppBuildGradle(config, (mod) => {
    const gradle = mod.modResults.contents;

    // Avoid adding the setting twice if prebuild runs multiple times
    if (gradle.includes("archivesBaseName")) {
      return mod;
    }

    // Insert archivesBaseName inside the android { } block, right after
    // the opening brace. Works for both Groovy and KTS gradle files.
    mod.modResults.contents = gradle.replace(
      /android\s*\{/,
      `android {\n    archivesBaseName = "${baseName}"`
    );

    return mod;
  });
}

module.exports = withApkName;
