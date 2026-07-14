module.exports = {
  addEventListener: jest.fn(() => jest.fn()), // returns unsubscribe fn
  fetch:            jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
};
