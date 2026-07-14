/**
 * Manual mock for expo-secure-store.
 * Uses a simple in-memory map so unit tests can exercise the storage adapter
 * without a native runtime.
 */

const store = {};

module.exports = {
  getItemAsync:    jest.fn((key)        => Promise.resolve(store[key] ?? null)),
  setItemAsync:    jest.fn((key, value) => { store[key] = value; return Promise.resolve(); }),
  deleteItemAsync: jest.fn((key)        => { delete store[key]; return Promise.resolve(); }),
  // Expose the in-memory store so tests can inspect / reset it if needed
  _store: store,
  _reset: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
