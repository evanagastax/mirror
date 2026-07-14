const React = require("react");

module.exports = {
  useRouter:   () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  Stack: {
    Screen: () => null,
  },
  Tabs: Object.assign(
    ({ children }) => React.createElement(React.Fragment, null, children),
    { Screen: () => null }
  ),
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
};
