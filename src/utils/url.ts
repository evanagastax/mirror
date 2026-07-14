/**
 * URL safety utilities.
 *
 * All user-supplied URLs (evidence_url field on logs) are validated before
 * being stored or opened. Only https:// is accepted — http:// is rejected
 * because it sends data in plaintext, and javascript:/data:/blob:/etc. are
 * attack vectors that must never reach Linking.openURL.
 */

import { Linking, Alert } from "react-native";

/**
 * Returns true only when the URL is a valid https:// link.
 * Rejects: http, javascript, data, blob, and any other scheme.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const { protocol } = new URL(url.trim());
    return protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Opens a URL only after confirming it is safe.
 * Shows an alert and returns false without opening if the URL fails validation.
 *
 * @param url      The URL to open.
 * @param context  Optional human-readable label for the error message (e.g. "evidence link").
 */
export async function openSafeUrl(
  url: string | null | undefined,
  context = "link"
): Promise<boolean> {
  if (!url) return false;

  if (!isSafeUrl(url)) {
    Alert.alert(
      "Unsafe link",
      `This ${context} cannot be opened because it doesn't use a secure https:// address.`
    );
    return false;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Cannot open link", `No app is available to open this ${context}.`);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert("Failed to open link", `Something went wrong while opening this ${context}.`);
    return false;
  }
}
