/**
 * WasteVision AI – Design System (Eco-Friendly Mobile App design)
 * Light green background, emerald primary, category colors for recycling.
 */

export const colors = {
  // Primary: emerald (eco design from Eco-Friendly zip)
  primary: "#10b981",
  primaryLight: "#34d399",
  primaryDark: "#059669",
  primaryForeground: "#ffffff",
  // Surfaces (theme.css)
  background: "#f0fdf4",
  surface: "#ffffff",
  card: "#ffffff",
  // Text
  text: "#030213",
  textSecondary: "#717182",
  textOnPrimary: "#ffffff",
  // Accent: emerald light (eco)
  accent: "#d1fae5",
  accentForeground: "#065f46",
  accentLight: "#a7f3d0",
  // Muted
  muted: "#ececf0",
  mutedForeground: "#717182",
  // Semantic
  success: "#10b981",
  error: "#d4183d",
  destructive: "#d4183d",
  border: "rgba(0,0,0,0.1)",
  inputBackground: "#f3f3f5",
  // Chart / stats
  chart1: "#10b981",
  chart2: "#3b82f6",
  chart3: "#eab308",
  chart4: "#f97316",
  chart5: "#84cc16",
  // Category colors (recycling bins) – from eco design categoryColors
  category: {
    plastic: { bg: "#eab308", light: "#fef9c3", text: "#713f12" },
    paper_cardboard: { bg: "#f97316", light: "#ffedd5", text: "#7c2d12" },
    glass: { bg: "#3b82f6", light: "#dbeafe", text: "#1e3a8a" },
    metal: { bg: "#64748b", light: "#f1f5f9", text: "#1e293b" },
    organic: { bg: "#84cc16", light: "#ecfccb", text: "#3f6212" },
    non_recyclable: { bg: "#6b7280", light: "#f3f4f6", text: "#1f2937" },
  },
};

/** Get category color for waste_category key */
export function getCategoryColor(categoryKey) {
  return colors.category[categoryKey] || colors.category.non_recyclable;
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
