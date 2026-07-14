module.exports = {
  scheduleNotificationAsync:    jest.fn().mockResolvedValue("id"),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync:  jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync:          jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync:      jest.fn().mockResolvedValue({ status: "granted" }),
  AndroidImportance: { MAX: 5, DEFAULT: 3 },
};
