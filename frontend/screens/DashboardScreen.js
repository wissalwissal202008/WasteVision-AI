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
      <Text style={styles.title}>Votre impact</Text>
      <Text style={styles.subtitle}>Statistiques et objectif de la semaine</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{scansCount}</Text>
          <Text style={styles.statLabel}>Déchets triés</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{co2Saved} kg</Text>
          <Text style={styles.statLabel}>CO₂ évité</Text>
        </Card>
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
    gap: spacing.md,
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
