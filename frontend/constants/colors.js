/**
 * Default light palette only. No dependencies – ensures "colors" is always defined when imported.
 * Used by theme.js and by any module that needs the palette before theme is fully loaded.
 */
export const colors = {
  primary: "#10b981",
  primaryLight: "#34d399",
  primaryDark: "#059669",
  primaryForeground: "#ffffff",
  background: "#f0fdf4",
  surface: "#ffffff",
  card: "#ffffff",
  text: "#030213",
  textSecondary: "#717182",
  textOnPrimary: "#ffffff",
  accent: "#d1fae5",
  accentForeground: "#065f46",
  accentLight: "#a7f3d0",
  muted: "#ececf0",
  mutedForeground: "#717182",
  success: "#10b981",
  error: "#d4183d",
  destructive: "#d4183d",
  border: "rgba(0,0,0,0.1)",
  inputBackground: "#f3f3f5",
  chart1: "#10b981",
  chart2: "#3b82f6",
  chart3: "#eab308",
  chart4: "#f97316",
  chart5: "#84cc16",
  category: {
    plastic: { bg: "#eab308", light: "#fef9c3", text: "#713f12" },
    paper_cardboard: { bg: "#f97316", light: "#ffedd5", text: "#7c2d12" },
    glass: { bg: "#3b82f6", light: "#dbeafe", text: "#1e3a8a" },
    metal: { bg: "#64748b", light: "#f1f5f9", text: "#1e293b" },
    organic: { bg: "#84cc16", light: "#ecfccb", text: "#3f6212" },
    non_recyclable: { bg: "#6b7280", light: "#f3f4f6", text: "#1f2937" },
  },
};
