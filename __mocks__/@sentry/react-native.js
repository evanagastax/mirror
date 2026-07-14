/**
 * Manual mock for @sentry/react-native.
 * All methods are no-ops so unit tests don't need a real DSN.
 */

module.exports = {
  init:            jest.fn(),
  captureException: jest.fn(),
  captureMessage:  jest.fn(),
  setUser:         jest.fn(),
  withScope:       jest.fn((cb) => cb({ setExtras: jest.fn(), setTag: jest.fn() })),
  addBreadcrumb:   jest.fn(),
  configureScope:  jest.fn(),
  wrap:            jest.fn((component) => component),
  ErrorBoundary:   ({ children }) => children,
};
