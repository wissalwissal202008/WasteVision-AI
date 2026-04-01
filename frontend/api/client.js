import { Platform } from "react-native";
import Constants from "expo-constants";

const DEBUG = __DEV__;

const EMPTY_STATS = {
  total_co2_grams_saved: 0,
  co2_saved_today_grams: 0,
  counts_by_category: {},
  co2_by_day: [],
};

/**
 * Resolve backend API base URL.
 * - Web: http://localhost:8001
 * - Expo Go (device): use expo.extra.apiBaseUrl if set, else host from Expo dev server (same machine as backend), else fallback IP.
 * Set apiBaseUrl in app.json (expo.extra) to your PC's local IP (e.g. 192.168.1.20) when testing on physical device.
 */
export function getApiBase() {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  const explicit = extra.apiBaseUrl?.trim?.();
  if (explicit) {
    let url = explicit.startsWith("http") ? explicit : `http://${explicit}`;
    url = url.replace(/\/+$/, "");
    if (!url.includes(":8001")) url += ":8001";
    if (DEBUG) console.log("[API] Using explicit apiBaseUrl:", url);
    return url;
  }
  if (Platform.OS === "web") {
    if (DEBUG) console.log("[API] Web: using http://localhost:8001");
    return "http://localhost:8001";
  }
  const hostFromExpo =
    Constants.expoConfig?.hostUri?.split?.(":")?.[0] ||
    Constants.manifest?.debuggerHost?.split?.(":")?.[0];
  const host = hostFromExpo || "192.168.1.10";
  const url = `http://${host}:8001`;
  if (DEBUG) console.log("[API] Native API base:", url, "(host from Expo:", hostFromExpo || "fallback", ")");
  return url;
}

const API_BASE = getApiBase();

/**
 * Code langue court pour l’API (query ?lang=) — aligné sur i18n.language (ex. fr, en, ar).
 */
export function normalizeLangForApi(lang) {
  if (lang == null || !String(lang).trim()) return "fr";
  return String(lang).trim().split("-")[0].toLowerCase();
}

/**
 * Send image to backend POST /predict.
 * Converts image to FormData. On React Native, appends file via { uri, name, type }; on web, uses blob.
 * @param {string} uri - Local file URI (file:// or content URI) or blob URL
 * @param {string} [mimeType] - e.g. "image/jpeg"
 * @param {string} [lang] - i18n.language (ou null → fr) : envoyé en ?lang= sur l’URL
 * @returns {Promise<{ waste_type: string, confidence: number, recycling_advice: string, ... }>}
 */
export async function predict(uri, mimeType = "image/jpeg", lang = null) {
  const code = normalizeLangForApi(lang);
  const url = `${getApiBase()}/predict?lang=${encodeURIComponent(code)}`;
  if (DEBUG) console.log("[API] Captured image URI:", uri);
  const formData = new FormData();
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, "photo.jpg");
    } catch (e) {
      if (DEBUG) console.error("[API] Web fetch image failed:", e);
      throw new Error("Could not read image. Use a valid image.");
    }
  } else {
    formData.append("file", {
      uri,
      name: "photo.jpg",
      type: mimeType,
    });
  }
  if (DEBUG) console.log("[API] Request POST", url, "FormData with file, lang=", code);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
  } catch (e) {
    if (DEBUG) console.error("[API] Network error (backend unreachable):", e?.message || e);
    throw new Error(
      "Cannot reach the backend. Is it running? Start with: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001. On device, set your PC IP in app.json (expo.extra.apiBaseUrl)."
    );
  }
  const text = await res.text();
  if (DEBUG) console.log("[API] Response status:", res.status, "body:", text?.slice?.(0, 200));
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = JSON.parse(text);
      detail = json.detail ?? detail;
    } catch (_) {}
    throw new Error(detail || "Prediction failed");
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error("Invalid JSON from backend");
  }
  if (DEBUG) console.log("[API] Prediction result:", data?.waste_type ?? data?.waste_category, data?.confidence);
  return data;
}

/**
 * POST /detect – real-time detection (multiple objects, bounding boxes).
 * @param {string} uri - Image URI
 * @param {string} [mimeType] - e.g. "image/jpeg"
 * @param {string} [lang] - i18n.language → ?lang= (défaut fr)
 * @returns {Promise<{ detections: Array<{ label: string, confidence: number, bounding_box: [number,number,number,number], recycling_advice?: string }> }>}
 */
export async function detect(uri, mimeType = "image/jpeg", lang = null) {
  const code = normalizeLangForApi(lang);
  const url = `${getApiBase()}/detect?lang=${encodeURIComponent(code)}`;
  if (DEBUG) console.log("[API] Detect request:", url);
  const formData = new FormData();
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, "photo.jpg");
    } catch (e) {
      if (DEBUG) console.error("[API] Web fetch image failed:", e);
      throw new Error("Could not read image.");
    }
  } else {
    formData.append("file", { uri, name: "photo.jpg", type: mimeType });
  }
  let res;
  try {
    res = await fetch(url, { method: "POST", body: formData, headers: { Accept: "application/json" } });
  } catch (e) {
    if (DEBUG) console.error("[API] Detect network error:", e?.message);
    throw new Error("Cannot reach backend. Start: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001");
  }
  const text = await res.text();
  if (DEBUG) console.log("[API] Detect response:", res.status, text?.slice(0, 150));
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = JSON.parse(text);
      detail = json.detail ?? detail;
    } catch (_) {}
    throw new Error(detail || "Detection failed");
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error("Invalid JSON from backend");
  }
  return data;
}

/** Une seule requête /history à la fois (évite 3× GET identiques au montage web). */
let historyFetchPromise = null;

export async function getHistory() {
  if (historyFetchPromise) return historyFetchPromise;
  historyFetchPromise = (async () => {
    try {
      const res = await fetch(`${getApiBase()}/history`);
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    } catch (e) {
      if (DEBUG) {
        console.warn(
          "[API] /history indisponible — démarrez le backend : cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001",
          e?.message || e
        );
      }
      return [];
    } finally {
      historyFetchPromise = null;
    }
  })();
  return historyFetchPromise;
}

let statsFetchPromise = null;

/**
 * GET /stats – impact tracker (CO2 grams saved + counts per category).
 * @returns {Promise<{ total_co2_grams_saved: number, co2_saved_today_grams: number, counts_by_category: Record<string, number> }>}
 */
export async function getStats() {
  if (statsFetchPromise) return statsFetchPromise;
  statsFetchPromise = (async () => {
    try {
      const res = await fetch(`${getApiBase()}/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    } catch (e) {
      if (DEBUG) {
        console.warn(
          "[API] /stats indisponible — même remède que pour /history (port 8001).",
          e?.message || e
        );
      }
      return { ...EMPTY_STATS };
    } finally {
      statsFetchPromise = null;
    }
  })();
  return statsFetchPromise;
}

export function getUploadUrl(imageName) {
  if (!imageName) return null;
  return `${getApiBase()}/uploads/${imageName}`;
}

/**
 * Submit user correction for a scan (human-in-the-loop).
 */
export async function submitCorrection(scanId, correctedCategory) {
  const res = await fetch(`${getApiBase()}/history/${scanId}/correct`, {
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

export async function submitFeedback(payload) {
  const res = await fetch(`${getApiBase()}/feedback`, {
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
