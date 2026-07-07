/**
 * App-wide color palette for light and dark modes.
 * Import `useTheme` to access the active palette at runtime.
 */

export type ThemeColors = {
  // Backgrounds
  bg: string;           // main screen background
  bgCard: string;       // card / elevated surface
  bgInput: string;      // text input background
  bgSubtle: string;     // slightly-off background (fafafa / 111111)

  // Borders
  border: string;       // standard border
  borderStrong: string; // stronger divider

  // Text
  textPrimary: string;  // headings, body
  textSecondary: string;// labels, metadata
  textMuted: string;    // placeholder, faint labels
  textDisabled: string; // very faint

  // Interactive
  tabBar: string;        // tab bar background
  tabBarBorder: string;  // tab bar top border
  tabActive: string;     // active tab icon / label
  tabInactive: string;   // inactive tab icon / label
};

export const light: ThemeColors = {
  bg: "#ffffff",
  bgCard: "#ffffff",
  bgInput: "#fafafa",
  bgSubtle: "#fafafa",

  border: "#e5e5e5",
  borderStrong: "#f0f0f0",

  textPrimary: "#111111",
  textSecondary: "#888888",
  textMuted: "#aaaaaa",
  textDisabled: "#cccccc",

  tabBar: "#ffffff",
  tabBarBorder: "#e5e5e5",
  tabActive: "#111111",
  tabInactive: "#aaaaaa",
};

export const dark: ThemeColors = {
  bg: "#0D0D0D",
  bgCard: "#1a1a1a",
  bgInput: "#1a1a1a",
  bgSubtle: "#111111",

  border: "#2a2a2a",
  borderStrong: "#222222",

  textPrimary: "#ffffff",
  textSecondary: "#888888",
  textMuted: "#555555",
  textDisabled: "#333333",

  tabBar: "#0D0D0D",
  tabBarBorder: "#1a1a1a",
  tabActive: "#ffffff",
  tabInactive: "#444444",
};
