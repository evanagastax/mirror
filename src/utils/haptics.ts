/**
 * Haptic feedback helpers.
 * Wraps expo-haptics with graceful fallback for web/simulators.
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Light tap — button presses, tab switches */
export function hapticLight() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium tap — log created, prayer toggled */
export function hapticMedium() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Heavy — level up, badge earned, streak milestone */
export function hapticHeavy() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/** Success — save confirmed, export complete */
export function hapticSuccess() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Warning — streak about to break */
export function hapticWarning() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/** Error — validation failed, network error */
export function hapticError() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Selection changed — filter switched, tab changed */
export function hapticSelection() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync();
}
