const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// ─── Web: stub out @sentry/react-native entirely ─────────────────────────────
//
// @sentry/react-native is a native SDK — it has no web support and pulls in
// a huge transitive dependency tree that causes Metro's Hermes transformer
// worker to exhaust its V8 semi-space on Node 22+.
//
// On web we resolve the entire package (and its @sentry/* sub-packages) to an
// empty module. Our sentry.ts service already no-ops when the DSN is absent,
// so this has zero functional impact on web.
//
// On iOS / Android the resolver falls through to the real modules as normal.

const SENTRY_PACKAGES = [
  "@sentry/react-native",
  "@sentry/core",
  "@sentry/hub",
  "@sentry/types",
  "@sentry/utils",
  "@sentry/browser",
  "@sentry/integrations",
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    // Stub the whole @sentry namespace on web
    const isSentry = SENTRY_PACKAGES.some(
      (pkg) => moduleName === pkg || moduleName.startsWith(pkg + "/")
    );
    if (isSentry) return { type: "empty" };
  }

  return context.resolveRequest(context, moduleName, platform);
};

// ─── Reduce transformer concurrency ──────────────────────────────────────────
//
// Metro defaults to (CPU count - 1) parallel transform workers. On large
// codebases this causes each worker to hold many module ASTs in memory
// simultaneously, triggering V8 semi-space exhaustion on Node 22/24.
// Capping at 2 workers keeps peak RSS well under 512MB.

config.transformer = {
  ...config.transformer,
  workerThreads: false,  // use processes, not threads (more stable on Node 24)
};

config.maxWorkers = 2;

module.exports = config;
