/**
 * Offline corrections queue. When the backend is unreachable, corrections are stored
 * locally (AsyncStorage) and synced when back online. Backend stores in SQLite for retraining.
 * Free, no paid API.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { submitCorrection } from "../api/client";

const STORAGE_KEY = "@wastevision_pending_corrections";

export async function getPendingCorrections() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addPendingCorrection(scanId, correctedCategory) {
  const list = await getPendingCorrections();
  list.push({ scanId, correctedCategory, ts: Date.now() });
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function removePendingCorrection(index) {
  const list = await getPendingCorrections();
  list.splice(index, 1);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Try to send all pending corrections to the backend. Removes each on success.
 * Call on app focus or when NetInfo says online.
 */
export async function flushPendingCorrections() {
  const list = await getPendingCorrections();
  if (list.length === 0) return { sent: 0, failed: 0 };
  let sent = 0;
  let failed = 0;
  const remaining = [];
  for (let i = 0; i < list.length; i++) {
    const { scanId, correctedCategory } = list[i];
    try {
      await submitCorrection(scanId, correctedCategory);
      sent++;
    } catch {
      failed++;
      remaining.push(list[i]);
    }
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return { sent, failed };
}
