/**
 * App-wide color palette for light and dark modes.
 * Direction: Geometric Islamic — ink, gold, parchment.
 */

export type ThemeColors = {
  // Backgrounds
  bg: string;
  bgCard: string;
  bgInput: string;
  bgSubtle: string;

  // Borders
  border: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;

  // Interactive
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;

  // Signature
  gold: string;
  goldMuted: string;
};

export const light: ThemeColors = {
  bg: "#F5F0E5",           // parchment
  bgCard: "#FFFFFF",
  bgInput: "#EDE8DA",
  bgSubtle: "#EDE8DA",

  border: "#D4CFC2",
  borderStrong: "#B8B3A6",

  textPrimary: "#0A0A0F",  // ink
  textSecondary: "#4A4A50",
  textMuted: "#8A8A90",
  textDisabled: "#B0B0B5",

  tabBar: "#F5F0E5",
  tabBarBorder: "#D4CFC2",
  tabActive: "#0A0A0F",
  tabInactive: "#8A8A90",

  gold: "#C9A84C",
  goldMuted: "#C9A84C40",
};

export const dark: ThemeColors = {
  bg: "#0A0A0F",           // ink
  bgCard: "#141419",
  bgInput: "#1A1A20",
  bgSubtle: "#121217",

  border: "#2A2A30",
  borderStrong: "#222228",

  textPrimary: "#F5F0E5",  // parchment
  textSecondary: "#A0A0A5",
  textMuted: "#606068",
  textDisabled: "#3A3A42",

  tabBar: "#0A0A0F",
  tabBarBorder: "#1A1A20",
  tabActive: "#C9A84C",    // gold for active in dark mode
  tabInactive: "#505058",

  gold: "#C9A84C",
  goldMuted: "#C9A84C30",
};
