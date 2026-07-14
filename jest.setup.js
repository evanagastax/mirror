/**
 * Jest global setup — runs after the test framework is installed.
 *
 * Defines React Native globals that are normally injected by the Metro
 * bundler / native runtime but are absent in the Node test environment.
 */

// React Native global flags
global.__DEV__ = true;
global.__RCTProfileIsProfiling = false;

// Required by React 18+ concurrent-mode act() in a non-jsdom environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
