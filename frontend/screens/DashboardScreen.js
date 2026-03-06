import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, AnimatedProgressBar } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { getHistory } from "../api/client";
import {
  getEcoScore,
  getCorrectionsCount,
  getEcoLevel,
  getEcoBadges,
} from "../services/ecoScore";

const WEEKLY_GOAL = 10;
const KG_CO2_PER_SCAN = 0.05;
const KG_PLASTIC_PER_SCAN = 0.02;
const KG_GLASS_PER_SCAN = 0.05;

export default function DashboardScreen({ navigation }) {
  const [scansCount, setScansCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ecoScore, setEcoScore] = useState(0);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const [data, score, corrections] = await Promise.all([
            getHistory(),
            getEcoScore(),
            getCorrectionsCount(),
          ]);
          const list = Array.isArray(data) ? data : [];
          const now = Date.now();
          const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
          const weekItems = list.filter((r) => {
            const t = r.created_at ? new Date(r.created_at).getTime() : 0;
            return t >= weekAgo;
          });
          const counts = {};
          list.forEach((r) => {
            const cat = r.corrected_category || r.predicted_category || "non_recyclable";
            counts[cat] = (counts[cat] || 0) + 1;
          });
          if (!cancelled) {
            setScansCount(list.length);
            setWeeklyCount(weekItems.length);
            setEcoScore(score);
            setCorrectionsCount(corrections);
            setCategoryCounts(counts);
          }
        } catch {
          if (!cancelled) {
            setScansCount(0);
            setWeeklyCount(0);
            setEcoScore(0);
            setCorrectionsCount(0);
            setCategoryCounts({});
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const co2Saved = Math.round(scansCount * KG_CO2_PER_SCAN * 100) / 100;
  const progress = WEEKLY_GOAL > 0 ? Math.min(weeklyCount / WEEKLY_GOAL, 1) : 0;
  const level = getEcoLevel(ecoScore);
  const badges = getEcoBadges(scansCount, correctionsCount, ecoScore);
  const plasticCount = categoryCounts.plastic || 0;
  const glassCount = categoryCounts.glass || 0;
  const kgPlasticAvoided = Math.round((plasticCount * KG_PLASTIC_PER_SCAN) * 100) / 100;
  const kgGlassRecycled = Math.round((glassCount * KG_GLASS_PER_SCAN) * 100) / 100;

  if (loading && scansCount === 0 && weeklyCount === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tableau de bord</Text>
      <Text style={styles.subtitle}>Suivez votre impact écologique</Text>

      {/* Score écologique + niveau */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreEmoji}>{level.emoji}</Text>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreValue}>{ecoScore} pts</Text>
            <Text style={styles.scoreLabel}>Score écologique</Text>
            <Text style={styles.levelName}>{level.name}</Text>
          </View>
        </View>
      </View>

      {/* Eco design: gradient stat cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCardEco, styles.statCardEmerald]}>
          <Text style={styles.statCardEcoEmoji}>♻️</Text>
          <Text style={styles.statCardEcoValue}>{scansCount}</Text>
          <Text style={styles.statCardEcoLabel}>Déchets triés</Text>
        </View>
        <View style={[styles.statCardEco, styles.statCardBlue]}>
          <Text style={styles.statCardEcoEmoji}>💧</Text>
          <Text style={styles.statCardEcoValue}>{co2Saved} kg</Text>
          <Text style={styles.statCardEcoLabel}>CO₂ évité</Text>
        </View>
        <View style={[styles.statCardEco, styles.statCardLime]}>
          <Text style={styles.statCardEcoEmoji}>🌱</Text>
          <Text style={styles.statCardEcoValue}>{weeklyCount}</Text>
          <Text style={styles.statCardEcoLabel}>Cette semaine</Text>
        </View>
      </View>

      <Card style={styles.goalCard}>
        <Text style={styles.goalLabel}>Weekly goal</Text>
        <Text style={styles.goalText}>
          {weeklyCount} / {WEEKLY_GOAL} scans
        </Text>
        <AnimatedProgressBar progress={progress} height={10} style={styles.goalProgressBar} />
        <Text style={styles.goalHint}>Keep scanning to reach your goal</Text>
      </Card>

      {/* Global environmental impact with progress indicators */}
      <Card style={styles.envStatsCard}>
        <Text style={styles.envStatsTitle}>Environmental impact</Text>
        <View style={styles.envStatsGrid}>
          <View style={styles.envStatsItem}>
            <Text style={styles.envStatsValue}>{scansCount}</Text>
            <Text style={styles.envStatsLabel}>Objects recycled</Text>
            <AnimatedProgressBar progress={Math.min(scansCount / 50, 1)} height={6} fillColor={colors.primary} style={styles.envStatBar} />
          </View>
          <View style={styles.envStatsItem}>
            <Text style={styles.envStatsValue}>{kgPlasticAvoided} kg</Text>
            <Text style={styles.envStatsLabel}>Plastic saved</Text>
            <AnimatedProgressBar progress={Math.min(kgPlasticAvoided / 2, 1)} height={6} fillColor="#eab308" style={styles.envStatBar} />
          </View>
          <View style={styles.envStatsItem}>
            <Text style={styles.envStatsValue}>{kgGlassRecycled} kg</Text>
            <Text style={styles.envStatsLabel}>Glass recycled</Text>
            <AnimatedProgressBar progress={Math.min(kgGlassRecycled / 2, 1)} height={6} fillColor="#3b82f6" style={styles.envStatBar} />
          </View>
          <View style={styles.envStatsItem}>
            <Text style={styles.envStatsValue}>{co2Saved} kg</Text>
            <Text style={styles.envStatsLabel}>CO₂ saved</Text>
            <AnimatedProgressBar progress={Math.min(co2Saved / 1, 1)} height={6} fillColor={colors.primary} style={styles.envStatBar} />
          </View>
        </View>
      </Card>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.badgesTitle}>🌟 Badges</Text>
        <View style={styles.badgesRow}>
          {badges.map((b) => (
            <View
              key={b.id}
              style={[styles.badgeChip, b.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}
            >
              <Text style={styles.badgeEmoji}>{b.unlocked ? b.emoji : "🔒"}</Text>
              <Text style={styles.badgeName} numberOfLines={1}>{b.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Eco design: impact block */}
      <View style={styles.impactBlock}>
        <Text style={styles.impactBlockEmoji}>🌍</Text>
        <Text style={styles.impactBlockTitle}>Votre impact écologique</Text>
        <View style={styles.impactBlockRow}>
          <View style={styles.impactBlockItem}>
            <Text style={styles.impactBlockValue}>{co2Saved} kg</Text>
            <Text style={styles.impactBlockLabel}>CO₂ économisé</Text>
          </View>
          <View style={styles.impactBlockItem}>
            <Text style={styles.impactBlockValue}>{scansCount}</Text>
            <Text style={styles.impactBlockLabel}>objets triés</Text>
          </View>
        </View>
      </View>

      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>Le saviez-vous ?</Text>
        <Text style={styles.tipBody}>
          Bien trier un emballage en plastique permet de le recycler et de réduire la demande en pétrole.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCardEco: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  statCardEmerald: { backgroundColor: colors.primary },
  statCardBlue: { backgroundColor: "#3b82f6" },
  statCardLime: { backgroundColor: "#84cc16" },
  statCardEcoEmoji: { fontSize: 24, marginBottom: spacing.xs },
  statCardEcoValue: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  statCardEcoLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    marginTop: spacing.xs,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  scoreEmoji: { fontSize: 48, marginRight: spacing.md },
  scoreContent: {},
  scoreValue: { fontSize: fontSize.headline, fontWeight: "700", color: colors.text },
  scoreLabel: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2 },
  levelName: { fontSize: fontSize.small, fontWeight: "600", color: colors.primary, marginTop: 4 },
  envStatsCard: { marginBottom: spacing.lg },
  envStatsTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  envStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  envStatsItem: {
    minWidth: "47%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  envStatsValue: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.primary },
  envStatsLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  badgesSection: { marginBottom: spacing.lg },
  badgesTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  badgeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    minWidth: 80,
  },
  badgeUnlocked: { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.primary },
  badgeLocked: { backgroundColor: colors.muted, opacity: 0.7 },
  badgeEmoji: { fontSize: 20 },
  badgeName: { fontSize: 10, marginTop: 2, color: colors.text },
  impactBlock: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  impactBlockEmoji: { fontSize: 28, marginBottom: spacing.xs },
  impactBlockTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.textOnPrimary,
    marginBottom: spacing.md,
  },
  impactBlockRow: { flexDirection: "row" },
  impactBlockItem: { flex: 1, alignItems: "center" },
  impactBlockValue: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  impactBlockLabel: {
    fontSize: fontSize.caption,
    color: "rgba(255,255,255,0.9)",
    marginTop: spacing.xs,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.display,
    fontWeight: "700",
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  goalLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  goalText: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  goalHint: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  goalProgressBar: { marginTop: spacing.sm },
  envStatBar: { marginTop: spacing.xs },
  tipCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tipTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipBody: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
});
