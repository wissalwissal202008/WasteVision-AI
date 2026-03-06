import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { getHistory } from "../api/client";

const WEEKLY_GOAL = 10;
const KG_CO2_PER_SCAN = 0.05;

export default function DashboardScreen() {
  const [scansCount, setScansCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getHistory();
          const list = Array.isArray(data) ? data : [];
          const now = Date.now();
          const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
          const weekItems = list.filter((r) => {
            const t = r.created_at ? new Date(r.created_at).getTime() : 0;
            return t >= weekAgo;
          });
          if (!cancelled) {
            setScansCount(list.length);
            setWeeklyCount(weekItems.length);
          }
        } catch {
          if (!cancelled) setScansCount(0);
          setWeeklyCount(0);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const co2Saved = Math.round(scansCount * KG_CO2_PER_SCAN * 100) / 100;
  const progress = WEEKLY_GOAL > 0 ? Math.min(weeklyCount / WEEKLY_GOAL, 1) : 0;

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
        <Text style={styles.goalLabel}>Objectif hebdo</Text>
        <Text style={styles.goalText}>
          {weeklyCount} / {WEEKLY_GOAL} scans
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progress * 100 + "%" }]} />
        </View>
        <Text style={styles.goalHint}>Scannez pour vous rapprocher de l'objectif</Text>
      </Card>

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
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm / 2,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm / 2,
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
