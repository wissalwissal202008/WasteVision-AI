/**
 * Unified detection for WasteVision AI: backend (online) or TensorFlow Lite (offline).
 *
 * - If "Offline AI" is enabled in Settings and TFLite is available → use on-device
 *   MobileNet SSD (see services/offlineDetection.js).
 * - Otherwise → use backend POST /predict.
 *
 * TFLite requires: react-native-fast-tflite + Expo dev build. See docs/TFLITE_SETUP.md.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { predict as backendPredict } from "../api/client";
import {
  isTFLiteAvailable,
  loadTFLiteModel,
  detectWithTFLite,
  buildOfflineResult,
  mapCocoToWaste,
} from "./offlineDetection";

const STORAGE_KEY_OFFLINE_AI = "@wastevision_offline_ai";

let cachedOfflinePreferred = null;
let cachedTFLite = null;
let cachedModel = null;

/** Get user preference: use offline (TFLite) when possible. */
export async function getOfflineAIPreference() {
  if (cachedOfflinePreferred !== null) return cachedOfflinePreferred;
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY_OFFLINE_AI);
    cachedOfflinePreferred = v === "true";
    return cachedOfflinePreferred;
  } catch {
    cachedOfflinePreferred = false;
    return false;
  }
}

/** Set and persist "Use offline AI" preference. */
export async function setOfflineAIPreference(value) {
  cachedOfflinePreferred = !!value;
  try {
    await AsyncStorage.setItem(STORAGE_KEY_OFFLINE_AI, value ? "true" : "false");
  } catch {}
  if (!value) {
    cachedModel = null;
    cachedTFLite = null;
  }
}

/** Check if offline detection is both preferred and available. */
export async function shouldUseOfflineDetection() {
  const preferred = await getOfflineAIPreference();
  if (!preferred) return false;
  return isTFLiteAvailable();
}

/**
 * Ensure TFLite model is loaded (when offline is preferred). Call once at app start
 * or when user enables "Offline AI". No-op if TFLite not available.
 */
export async function ensureOfflineModelLoaded() {
  if (cachedModel && cachedTFLite) return true;
  const preferred = await getOfflineAIPreference();
  if (!preferred) return false;
  const available = await isTFLiteAvailable();
  if (!available) return false;
  try {
    const loaded = await loadTFLiteModel();
    if (loaded) {
      cachedModel = loaded.model;
      cachedTFLite = loaded.tflite;
      return true;
    }
  } catch (e) {
    console.warn("Offline model load failed:", e?.message);
  }
  return false;
}

/**
 * Run detection on an image: offline (TFLite) if preferred and available, else backend.
 * @param {string} imageUri - Local file URI (e.g. from camera or picker)
 * @param {string} [mimeType] - Optional, for backend
 * @returns {Promise<object>} Same shape as backend /predict (object_name, waste_category, recommended_bin, confidence, scan_id?, ...)
 */
export async function predict(imageUri, mimeType = "image/jpeg") {
  const useOffline = await getOfflineAIPreference();
  if (useOffline) {
    const available = await isTFLiteAvailable();
    if (available) {
      await ensureOfflineModelLoaded();
      if (cachedTFLite && cachedModel) {
        try {
          const result = await detectWithTFLite(cachedTFLite, cachedModel, imageUri);
          if (result) return result;
        } catch (_) {
          // fall through to backend
        }
      }
    }
  }
  return backendPredict(imageUri, mimeType);
}

/**
 * Force backend prediction (e.g. when user wants to save to history with server).
 */
export async function predictWithBackend(imageUri, mimeType = "image/jpeg") {
  return backendPredict(imageUri, mimeType);
}

/**
 * Force offline prediction only. Returns null if TFLite not available or inference fails.
 */
export async function predictWithOffline(imageUri) {
  const available = await isTFLiteAvailable();
  if (!available) return null;
  await ensureOfflineModelLoaded();
  if (!cachedTFLite || !cachedModel) return null;
  return detectWithTFLite(cachedTFLite, cachedModel, imageUri);
}

export { mapCocoToWaste, buildOfflineResult, isTFLiteAvailable };
