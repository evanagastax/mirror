const React = require("react");
const stub  = ({ children }) => React.createElement(React.Fragment, null, children);

module.exports = {
  Svg: stub, G: stub, Path: stub, Circle: stub, Rect: stub,
  Text: stub, Line: stub, Polyline: stub, Polygon: stub,
  default: stub,
};
