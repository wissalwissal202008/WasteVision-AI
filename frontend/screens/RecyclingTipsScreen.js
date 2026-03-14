/**
 * Recycling tips page: daily tips and best practices. Simple list UI.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { RECYCLING_TIPS, getTipForWeekday } from "../data/recyclingTips";

export default function RecyclingTipsScreen({ navigation }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "fr").slice(0, 2) === "ar" ? "ar" : (i18n.language || "fr").slice(0, 2) === "en" ? "en" : "fr";
  const tips = RECYCLING_TIPS[lang] || RECYCLING_TIPS.en;
  const weekday = new Date().getDay() || 7;
  const tipOfDay = getTipForWeekday(weekday, lang);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Recycling tips</Text>
        <Text style={styles.subtitle}>Best practices for better sorting</Text>
      </View>
      <View style={styles.tipOfDayCard}>
        <Text style={styles.tipOfDayLabel}>Tip of the day</Text>
        <Text style={styles.tipOfDayText}>{tipOfDay}</Text>
      </View>
      <Text style={styles.sectionTitle}>All tips</Text>
      {tips.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <Text style={styles.tipNumber}>{i + 1}</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Use WasteVision scan to identify waste and get instant advice.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSize.headline, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },
  tipOfDayCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipOfDayLabel: { fontSize: fontSize.caption, fontWeight: "600", color: colors.primaryDark, marginBottom: spacing.sm },
  tipOfDayText: { fontSize: fontSize.body, color: colors.text },
  sectionTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.textOnPrimary,
    fontSize: fontSize.caption,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
    marginRight: spacing.sm,
  },
  tipText: { flex: 1, fontSize: fontSize.body, color: colors.text, lineHeight: 22 },
  footer: { marginTop: spacing.xl, padding: spacing.md },
  footerText: { fontSize: fontSize.caption, color: colors.textSecondary, textAlign: "center" },
});
