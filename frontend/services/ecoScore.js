/**
 * Score écologique : points par action, niveau, badges.
 * Stockage local (AsyncStorage) pour persistance sans compte utilisateur.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_SCORE = "@wastevision_eco_score";
const STORAGE_KEY_CORRECTIONS = "@wastevision_eco_corrections";
const STORAGE_KEY_LAST_AWARDED_SCAN = "@wastevision_last_awarded_scan";

/** Points par catégorie (recycler = bien trier) */
export const ECO_POINTS_BY_CATEGORY = {
  plastic: 10,
  paper_cardboard: 10,
  glass: 15,
  metal: 10,
  organic: 10,
  non_recyclable: 5,
};
export const ECO_POINTS_CORRECTION = 5;

export async function getEcoScore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SCORE);
    return raw != null ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function getCorrectionsCount() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CORRECTIONS);
    return raw != null ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function addEcoPoints(points, reason = "") {
  const current = await getEcoScore();
  const next = current + points;
  await AsyncStorage.setItem(STORAGE_KEY_SCORE, String(next));
  return next;
}

/** Appelé quand l'utilisateur a bien trié (affiche un résultat). Évite double attribution via lastAwardedScanId. */
export async function awardPointsForScan(scanId, categoryKey) {
  if (!scanId || !categoryKey) return 0;
  const last = await AsyncStorage.getItem(STORAGE_KEY_LAST_AWARDED_SCAN);
  if (last === String(scanId)) return await getEcoScore();
  const points = ECO_POINTS_BY_CATEGORY[categoryKey] ?? 5;
  await addEcoPoints(points, "scan");
  await AsyncStorage.setItem(STORAGE_KEY_LAST_AWARDED_SCAN, String(scanId));
  return points;
}

/** Appelé quand l'utilisateur a corrigé l'IA. */
export async function awardPointsForCorrection() {
  const countRaw = await AsyncStorage.getItem(STORAGE_KEY_CORRECTIONS);
  const count = countRaw != null ? parseInt(countRaw, 10) : 0;
  await AsyncStorage.setItem(STORAGE_KEY_CORRECTIONS, String(count + 1));
  await addEcoPoints(ECO_POINTS_CORRECTION, "correction");
  return ECO_POINTS_CORRECTION;
}

/** Eco level by total score – motivating and fun */
export function getEcoLevel(score) {
  if (score >= 500) return { name: "Eco Master", emoji: "🏆" };
  if (score >= 200) return { name: "Eco Hero", emoji: "🌍" };
  if (score >= 50) return { name: "Waste Warrior", emoji: "♻️" };
  if (score >= 10) return { name: "Beginner Recycler", emoji: "🌱" };
  return { name: "Starter", emoji: "✨" };
}

/** Badges: Beginner Recycler, Eco Hero, Waste Warrior (and more) */
export function getEcoBadges(scansCount, correctionsCount, totalScore) {
  return [
    { id: "beginner", name: "Beginner Recycler", emoji: "🌱", unlocked: scansCount >= 1 },
    { id: "eco10", name: "10 items recycled", emoji: "♻️", unlocked: scansCount >= 10 },
    { id: "warrior", name: "Waste Warrior", emoji: "⚔️", unlocked: scansCount >= 25 || totalScore >= 100 },
    { id: "corrector", name: "AI Helper", emoji: "✏️", unlocked: correctionsCount >= 1 },
    { id: "hero", name: "Eco Hero", emoji: "🌍", unlocked: scansCount >= 50 || totalScore >= 200 },
  ];
}
