const React = require("react");

module.exports = {
  SafeAreaView:     ({ children, ...props }) => React.createElement("View", props, children),
  SafeAreaProvider: ({ children })            => React.createElement(React.Fragment, null, children),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};
