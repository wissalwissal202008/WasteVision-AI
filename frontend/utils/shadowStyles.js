/**
 * Ombres compatibles web : sur le web, RN déprécie shadow* au profit de boxShadow.
 * Sur iOS/Android on garde les props shadow* natives.
 */
import { Platform } from "react-native";

function colorWithOpacity(hex, opacity) {
  if (typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(0,0,0,${opacity})`;
  }
  let h = hex.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return `rgba(0,0,0,${opacity})`;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * @param {object} o
 * @param {string} [o.shadowColor]
 * @param {{width:number,height:number}} [o.shadowOffset]
 * @param {number} [o.shadowOpacity]
 * @param {number} [o.shadowRadius]
 * @param {number} [o.elevation]
 */
export function createShadowStyle({
  shadowColor = "#000000",
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.1,
  shadowRadius = 8,
  elevation = 3,
} = {}) {
  if (Platform.OS === "web") {
    const rgba = colorWithOpacity(shadowColor, shadowOpacity);
    const { width: ox = 0, height: oy = 0 } = shadowOffset || {};
    return {
      boxShadow: `${ox}px ${oy}px ${shadowRadius}px ${rgba}`,
    };
  }
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
  };
}
