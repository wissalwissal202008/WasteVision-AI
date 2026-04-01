/**
 * ImpactCard — affiche le CO₂ économisé aujourd’hui (backend GET /stats).
 * (Demande initiale en .tsx ; le projet Expo est en .js.)
 */
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { getStats } from "../api/client";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

export function ImpactCard() {
  const { t } = useTranslation();
  const [gramsToday, setGramsToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStats();
      const g = Number(data?.co2_saved_today_grams ?? 0);
      setGramsToday(Number.isFinite(g) ? g : 0);
    } catch {
      setGramsToday(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const display = Math.round(gramsToday);

  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.icon} accessibilityLabel="feuille">
        🌿
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : (
        <Text style={styles.text}>{t("dict.impact_saved_today", { grams: display })}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  loader: {
    marginLeft: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: "600",
    lineHeight: 22,
  },
  highlight: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
});
