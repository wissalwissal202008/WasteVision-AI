import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * API client for WasteVision backend.
 *
 * - Sur le web : http://localhost:8001
 * - Sur téléphone (Expo Go) : utilise automatiquement l’IP de ton PC
 *   en se basant sur l’URL de développement Expo.
 */
function resolveApiBase() {
  // Web: le backend tourne sur la même machine
  if (Platform.OS === "web") {
    return "http://localhost:8001";
  }

  // Native (Expo Go): on récupère l'hôte du dev server Expo
  const hostFromExpo =
    Constants.expoConfig?.hostUri?.split(":")[0] ||
    Constants.manifest?.debuggerHost?.split(":")[0];

  const host = hostFromExpo || "192.168.1.10"; // valeur de secours si Expo ne fournit rien
  return `http://${host}:8001`;
}

const API_BASE = resolveApiBase();

export async function predict(uri, mimeType = "image/jpeg") {
  const formData = new FormData();
  const response = await fetch(uri);
  const blob = await response.blob();
  formData.append("file", blob, "photo.jpg");

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export function getUploadUrl(imageName) {
  if (!imageName) return null;
  return `${API_BASE}/uploads/${imageName}`;
}

/**
 * Submit user correction for a scan (human-in-the-loop).
 * @param {number} scanId - ID from predict response
 * @param {string} correctedCategory - One of: plastic, paper_cardboard, glass, metal, organic, non_recyclable
 */
export async function submitCorrection(scanId, correctedCategory) {
  const res = await fetch(`${API_BASE}/history/${scanId}/correct`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ corrected_category: correctedCategory }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Correction failed");
  }
  return res.json();
}

/**
 * Envoyer un retour utilisateur : bug, suggestion ou notation.
 * @param {{ type: 'bug'|'suggestion'|'rating', content?: string, rating?: number }} payload
 */
export async function submitFeedback(payload) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: payload.type,
      content: payload.content || null,
      rating: payload.rating ?? null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Envoi du retour impossible");
  }
  return res.json();
}
