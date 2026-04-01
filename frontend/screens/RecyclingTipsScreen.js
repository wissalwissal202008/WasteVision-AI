/**
 * Recycling tips (Learn) – Figma "Learning Center" design.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { RECYCLING_TIPS, getTipForWeekday } from "../data/recyclingTips";
import { createShadowStyle } from "../utils/shadowStyles";

export default function RecyclingTipsScreen({ navigation }) {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language || "fr").slice(0, 2) === "ar" ? "ar" : (i18n.language || "fr").slice(0, 2) === "en" ? "en" : "fr";
  const tips = RECYCLING_TIPS[lang] || RECYCLING_TIPS.en;
  const weekday = new Date().getDay() || 7;
  const tipOfDay = getTipForWeekday(weekday, lang);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Figma Learn: gradient header */}
      <LinearGradient
        colors={colors.gradientLearnHeader || colors.gradientHeader}
        style={styles.learnHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.learnHeaderRow}>
          <TouchableOpacity style={styles.learnBackBtn} onPress={() => navigation.navigate("Accueil")}>
            <Text style={styles.learnBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.learnHeaderTitle}>{t("dict.recyclingTips")}</Text>
          <View style={styles.learnHeaderSpacer} />
        </View>
        <Text style={styles.learnHeaderSub}>Let's learn recycling together! 📚✨</Text>
      </LinearGradient>

      <View style={styles.body}>
      {/* Figma: Quick Tips (yellow card, 4 bullets) */}
      <View style={styles.quickTipsCard}>
        <Text style={styles.quickTipsTitle}>📖 Quick Tips</Text>
        <Text style={styles.quickTipItem}>💧 Always rinse containers before recycling</Text>
        <Text style={styles.quickTipItem}>📍 Check local recycling guidelines</Text>
        <Text style={styles.quickTipItem}>✋ Remove caps and lids when required</Text>
        <Text style={styles.quickTipItem}>🚫 Don't bag recyclables unless instructed</Text>
      </View>

      {/* Figma: Recycling Categories */}
      <Text style={styles.sectionTitle}>📁 Recycling Categories</Text>
      {[
        { title: "Plastic Recycling", desc: "Learn about different types of plastics", icon: "♻️", bg: "#dbeafe", items: "12" },
        { title: "Paper & Cardboard", desc: "How to recycle paper products correctly", icon: "📄", bg: "#fef3c7", items: "8" },
        { title: "Glass & Metal", desc: "Recycling glass bottles and metal cans", icon: "🫙", bg: "#d1fae5", items: "6" },
        { title: "Electronic Waste", desc: "Safely dispose of electronics", icon: "📱", bg: "#f3e8ff", items: "10" },
        { title: "Organic Waste", desc: "Composting and organic recycling", icon: "🌱", bg: "#dcfce7", items: "7" },
        { title: "Hazardous Waste", desc: "Special handling for dangerous materials", icon: "⚠️", bg: "#fee2e2", items: "5" },
      ].map((cat, i) => (
        <TouchableOpacity key={i} style={[styles.categoryCard, { backgroundColor: cat.bg }]} activeOpacity={0.8}>
          <View style={styles.categoryIconWrap}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
          </View>
          <View style={styles.categoryText}>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
            <Text style={styles.categoryDesc}>{cat.desc}</Text>
            <Text style={styles.categoryItems}>{cat.items} items</Text>
          </View>
          <Text style={styles.categoryChevron}>›</Text>
        </TouchableOpacity>
      ))}

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

      {/* Figma: Fun Fact card */}
      <LinearGradient colors={["#86efac", "#5eead4"]} style={styles.funFactCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.funFactTitle}>🌱 Fun Fact! ☀️</Text>
        <Text style={styles.funFactBody}>
          Recycling one aluminum can saves enough energy to run a TV for 3 hours! Aluminum can be recycled infinitely without losing quality.
        </Text>
        <TouchableOpacity style={styles.funFactBtn} activeOpacity={0.9}>
          <Text style={styles.funFactBtnText}>Learn More Facts ✨</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Use WasteVision scan to identify waste and get instant advice.</Text>
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  learnHeader: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: spacing.xl + 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  learnHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  learnBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  learnBackText: { fontSize: 22, color: "#fff", fontWeight: "600" },
  learnHeaderTitle: { fontSize: fontSize.title, fontWeight: "700", color: "#fff" },
  learnHeaderSpacer: { width: 44 },
  learnHeaderSub: { fontSize: fontSize.small, color: "rgba(255,255,255,0.95)", textAlign: "center" },
  body: { padding: spacing.lg },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSize.headline, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },
  quickTipsCard: {
    backgroundColor: "#fef9c3",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    }),
  },
  quickTipsTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  quickTipItem: { fontSize: fontSize.body, color: colors.text, marginBottom: spacing.sm, paddingLeft: spacing.sm },
  sectionTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  categoryIcon: { fontSize: 24 },
  categoryText: { flex: 1 },
  categoryTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text },
  categoryDesc: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2 },
  categoryItems: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  categoryChevron: { fontSize: 20, color: colors.textSecondary, fontWeight: "600" },
  funFactCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  funFactTitle: { fontSize: fontSize.subhead, fontWeight: "700", color: "#fff", marginBottom: spacing.sm },
  funFactBody: { fontSize: fontSize.body, color: "#fff", lineHeight: 22, opacity: 0.95 },
  funFactBtn: {
    alignSelf: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  funFactBtnText: { fontSize: fontSize.subhead, fontWeight: "600", color: "#fff" },
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

