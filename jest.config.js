/** @type {import('jest').Config} */
module.exports = {
  // No preset — we configure everything directly so jest-expo's native
  // setup scripts (which import expo-modules-core TS source) don't run.
  testEnvironment: "node",

  // Defines __DEV__ and IS_REACT_ACT_ENVIRONMENT before any test module loads
  setupFiles: ["<rootDir>/jest.setup.js"],

  // Correct key is setupFilesAfterEnv (not setupFilesAfterFramework)
  setupFilesAfterEnv: [],

  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },

  // Resolve .ts/.tsx before .js so TypeScript source is preferred
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  moduleNameMapper: {
    // Static assets
    "\\.(png|jpg|jpeg|gif|svg|webp|ttf|otf|woff|woff2|eot)$":
      "<rootDir>/__mocks__/fileMock.js",
    // Expo / RN native modules
    "^expo-router$":        "<rootDir>/__mocks__/expo-router.js",
    "^expo-status-bar$":    "<rootDir>/__mocks__/expo-status-bar.js",
    "^expo-notifications$": "<rootDir>/__mocks__/expo-notifications.js",
    "^expo-secure-store$":  "<rootDir>/__mocks__/expo-secure-store.js",
    "^@sentry/react-native$": "<rootDir>/__mocks__/@sentry/react-native.js",
    "^@react-native-async-storage/async-storage$":
      "<rootDir>/__mocks__/@react-native-async-storage/async-storage.js",
    "^@react-native-community/netinfo$":
      "<rootDir>/__mocks__/@react-native-community/netinfo.js",
    "^react-native-safe-area-context$":
      "<rootDir>/__mocks__/react-native-safe-area-context.js",
    "^react-native-svg$": "<rootDir>/__mocks__/react-native-svg.js",
    // react-native itself — stub StyleSheet and component primitives
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
    // Supabase client — always mocked in unit tests
    "^((\\.{1,2}/)+)api/supabase$": "<rootDir>/__mocks__/supabase.js",
    "^((\\.{1,2}/)+)src/api/supabase$": "<rootDir>/__mocks__/supabase.js",
  },

  // Transform Expo / React Native packages that ship as ESM or TypeScript
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "@react-native|" +
      "react-native|" +
      "@expo|" +
      "expo|" +
      "@tanstack|" +
      "zustand|" +
      "@supabase" +
    ")/)",
  ],

  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/services/**/*.ts",
    "src/hooks/**/*.ts",
    "src/store/**/*.ts",
    "src/components/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],

  coverageReporters: ["text", "lcov", "html"],
};
