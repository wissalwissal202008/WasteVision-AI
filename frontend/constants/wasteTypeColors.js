/**
 * UI color coding by waste type for labels, badges, and cards.
 * Green = recyclable, Red = non-recyclable, Yellow = plastic, Blue = glass, etc.
 */
import { getCategoryColor } from "./theme";

export const WASTE_TYPE_LABELS = {
  plastic: "Plastic",
  paper_cardboard: "Paper / Cardboard",
  glass: "Glass",
  metal: "Metal",
  organic: "Organic",
  non_recyclable: "Non-recyclable",
};

/** Get display label for waste_category key */
export function getWasteTypeLabel(categoryKey) {
  return WASTE_TYPE_LABELS[categoryKey] || categoryKey?.replace(/_/g, " ") || "—";
}

/** Get { bg, light, text } for UI (reuses theme category colors) */
export function getWasteTypeColors(categoryKey) {
  return getCategoryColor(categoryKey);
}

/** Semantic role for accessibility: recyclable vs non-recyclable */
export function isRecyclable(categoryKey) {
  return categoryKey !== "non_recyclable";
}
