/**
 * WasteVision AI – Design System (Eco-Friendly Mobile App design)
 * Re-exports colors from colors.js (no deps) so bundler always has it; adds getThemeColors, getCategoryColor, spacing, etc.
 */
import { colors } from "./colors";

export { colors };

const lightColors = colors;

const darkColors = {
  ...lightColors,
  background: "#0f1419",
  surface: "#1a2332",
  card: "#1e2a3a",
  text: "#e6edf3",
  textSecondary: "#8b949e",
  accent: "#0d3d2e",
  accentForeground: "#34d399",
  accentLight: "#064e3b",
  muted: "#21262d",
  mutedForeground: "#8b949e",
  border: "rgba(255,255,255,0.12)",
  inputBackground: "#21262d",
};

/** Resolve theme colors by isDark. */
export function getThemeColors(isDark) {
  return isDark ? darkColors : lightColors;
}

/** Get category color for waste_category key */
export function getCategoryColor(categoryKey) {
  return lightColors.category[categoryKey] || lightColors.category.non_recyclable;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  subhead: 18,
  title: 20,
  headline: 24,
  display: 28,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  xxl: 28,
  full: 9999,
};

export const iconSize = {
  sm: 20,
  md: 24,
  lg: 32,
};
