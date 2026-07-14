const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// ─── Sentry web-bundling fix ──────────────────────────────────────────────────
// @sentry/core re-exports a trpc.js module that doesn't exist in its own build.
// Metro fails when bundling for web because it can't resolve the file.
// We intercept those requests and return an empty stub so the web bundle works.
// This has zero effect on native builds (iOS / Android) where Sentry works fine.
const SENTRY_MISSING_MODULES = new Set([
  "@sentry/core/build/esm/trpc.js",
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check both the bare name and any path that ends with the known missing file
  const isMissing = SENTRY_MISSING_MODULES.has(moduleName) ||
    [...SENTRY_MISSING_MODULES].some((m) => moduleName.endsWith(m.replace(/^.*\//, "/")));

  if (platform === "web" && isMissing) {
    // Return the empty-module stub that ships with Metro
    return { type: "empty" };
  }

  // Fall through to Metro's default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
