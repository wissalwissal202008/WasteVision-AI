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

/** Kg per scan for impact stats (plastic, glass, CO₂). */
export const KG_PLASTIC_PER_SCAN = 0.02;
export const KG_GLASS_PER_SCAN = 0.05;
export const KG_CO2_PER_SCAN = 0.05;

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

/** Eco level by total score: Beginner (0-100), Eco Hero (100-300), Waste Warrior (300+). */
export function getEcoLevel(score) {
  if (score >= 300) return { name: "Waste Warrior", emoji: "♻️" };
  if (score >= 100) return { name: "Eco Hero", emoji: "🌍" };
  return { name: "Beginner", emoji: "🌱" };
}

/** Badges: Beginner, Eco Hero, Waste Warrior, AI Helper */
export function getEcoBadges(scansCount, correctionsCount, totalScore) {
  return [
    { id: "beginner", name: "Beginner", emoji: "🌱", unlocked: totalScore >= 0 || scansCount >= 1 },
    { id: "eco10", name: "10 items recycled", emoji: "♻️", unlocked: scansCount >= 10 },
    { id: "hero", name: "Eco Hero", emoji: "🌍", unlocked: totalScore >= 100 },
    { id: "warrior", name: "Waste Warrior", emoji: "⚔️", unlocked: totalScore >= 300 },
    { id: "corrector", name: "AI Helper", emoji: "✏️", unlocked: correctionsCount >= 1 },
  ];
}
