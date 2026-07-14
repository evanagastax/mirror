/**
 * Minimal react-native stub for pure Node/Jest tests.
 * Provides just enough of the API for components that use StyleSheet,
 * View, Text, Pressable, ScrollView, and ActivityIndicator.
 *
 * Components are rendered as plain React elements — no native bridge needed.
 */

const React = require("react");

// StyleSheet.create() just returns the style object unchanged
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style),
  hairlineWidth: 1,
  absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
};

// Generic stub component factory
function stub(name) {
  const C = ({ children, ...props }) =>
    React.createElement(name, props, children);
  C.displayName = name;
  return C;
}

const View          = stub("View");
const Text          = stub("Text");
const Pressable     = stub("Pressable");
const TouchableOpacity = stub("TouchableOpacity");
const ScrollView    = stub("ScrollView");
const TextInput     = stub("TextInput");
const KeyboardAvoidingView = stub("KeyboardAvoidingView");
const ActivityIndicator = stub("ActivityIndicator");
const Animated = {
  View: stub("Animated.View"),
  Text: stub("Animated.Text"),
  Value: class {
    constructor(v) { this._value = v; }
    __getValue() { return this._value; }
    setValue(v) { this._value = v; }
  },
  timing: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  spring: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  sequence: (anims) => ({ start: (cb) => cb && cb({ finished: true }) }),
  parallel: (anims) => ({ start: (cb) => cb && cb({ finished: true }) }),
  delay:   () => ({ start: (cb) => cb && cb({ finished: true }) }),
  loop:    () => ({ start: (cb) => cb && cb({ finished: true }) }),
};

const Platform = { OS: "ios", select: (obj) => obj.ios ?? obj.default };
const Alert    = { alert: jest.fn() };

module.exports = {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
  // Commonly imported but not used in unit tests
  Image: stub("Image"),
  FlatList: stub("FlatList"),
  SectionList: stub("SectionList"),
  Modal: stub("Modal"),
  Switch: stub("Switch"),
  StatusBar: stub("StatusBar"),
  SafeAreaView: stub("SafeAreaView"),
  RefreshControl: stub("RefreshControl"),
  TouchableHighlight: stub("TouchableHighlight"),
  TouchableNativeFeedback: stub("TouchableNativeFeedback"),
  TouchableWithoutFeedback: stub("TouchableWithoutFeedback"),
  Dimensions: { get: () => ({ width: 375, height: 812 }), addEventListener: jest.fn() },
  AppState:   { currentState: "active", addEventListener: jest.fn() },
  Linking:    { openURL: jest.fn(), canOpenURL: jest.fn() },
  Keyboard:   { dismiss: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) },
  Vibration:  { vibrate: jest.fn() },
  PixelRatio: { get: () => 2, getPixelSizeForLayoutSize: (n) => n * 2 },
  NativeModules: {},
  NativeEventEmitter: class { addListener() { return { remove: jest.fn() }; } },
};
