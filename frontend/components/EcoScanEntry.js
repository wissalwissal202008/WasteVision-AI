/**
 * Eco-Friendly Waste Detection – entry screen component.
 * Matches Figma design: hero card, two CTAs (camera + gallery), "How it works", optional impact.
 * Use in HomeScreen or as the main scan entry.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./Card";
import { createShadowStyle } from "../utils/shadowStyles";

const HERO_DECOR_SIZE = 120;

export function EcoScanEntry({
  onTakePhoto,
  onImportImage,
  isLoading = false,
  showImpact = false,
  totalScans = 0,
  co2Saved = "0",
  impactLabel,
  objectsSortedLabel,
  co2AvoidedLabel,
  impactHintStart,
  impactHintContinue,
  heroImageUri,
}) {
  const { t } = useTranslation();

  const impactLabelText = impactLabel ?? t("home.impactLabel");
  const objectsSortedText = objectsSortedLabel ?? t("home.objectsSorted");
  const co2AvoidedText = co2AvoidedLabel ?? t("home.co2Avoided");
  const hintStart = impactHintStart ?? t("home.impactHintStart");
  const hintContinue = impactHintContinue ?? t("home.impactHintContinue");

  return (
    <View style={styles.container}>
      {/* Hero card – eco design (Figma-style) */}
      <View style={styles.heroCard}>
        <View style={styles.heroDecor1} />
        <View style={styles.heroDecor2} />
        <View style={styles.heroContent}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroIcon}>✨</Text>
            <Text style={styles.heroTitle}>{t("home.title")}</Text>
          </View>
          <Text style={styles.heroSub}>{t("home.subtitle")}</Text>

          {heroImageUri ? (
            <View style={styles.heroImageWrap}>
              <Image source={{ uri: heroImageUri }} style={styles.heroImage} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroImageEmoji}>♻️</Text>
              <Text style={styles.heroImageHint}>Scan to start</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={t("home.cta")}
              onPress={onTakePhoto}
              style={styles.primaryBtn}
              disabled={isLoading}
            />
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onImportImage}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnIcon}>📁</Text>
              <Text style={styles.secondaryBtnText}>{t("scan.pickFromGallery")}</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.analyzingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.analyzingText}>{t("scan.analyzing", "Analyzing…")}</Text>
            </View>
          )}
        </View>
      </View>

      {/* How it works – green gradient card */}
      <View style={styles.howCard}>
        <Text style={styles.howIcon}>ℹ️</Text>
        <Text style={styles.howTitle}>{t("home.howItWorks")}</Text>
        <View style={styles.howList}>
          <Text style={styles.howStep}>
            <Text style={styles.howStepNum}>1.</Text> {t("home.step1")}
          </Text>
          <Text style={styles.howStep}>
            <Text style={styles.howStepNum}>2.</Text> {t("home.step2")}
          </Text>
          <Text style={styles.howStep}>
            <Text style={styles.howStepNum}>3.</Text> {t("home.step3")}
          </Text>
        </View>
      </View>

      {/* Impact – compact */}
      {showImpact && (
        <Card style={styles.impactCard}>
          <Text style={styles.impactLabel}>{impactLabelText}</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{totalScans}</Text>
              <Text style={styles.impactUnit}>{objectsSortedText}</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{co2Saved} kg</Text>
              <Text style={styles.impactUnit}>{co2AvoidedText}</Text>
            </View>
          </View>
          <Text style={styles.impactHint}>
            {totalScans > 0 ? hintContinue : hintStart}
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  heroDecor1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: HERO_DECOR_SIZE,
    height: HERO_DECOR_SIZE,
    borderRadius: HERO_DECOR_SIZE / 2,
    backgroundColor: colors.primaryLight,
    opacity: 0.4,
  },
  heroDecor2: {
    position: "absolute",
    bottom: -16,
    left: -16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    opacity: 0.5,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroIcon: {
    fontSize: 24,
  },
  heroTitle: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
  },
  heroSub: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  heroImageWrap: {
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImagePlaceholder: {
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImageEmoji: { fontSize: 40 },
  heroImageHint: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  buttonRow: {
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  secondaryBtnIcon: { fontSize: 20 },
  secondaryBtnText: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  analyzingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    alignSelf: "center",
  },
  analyzingText: {
    fontSize: fontSize.small,
    fontWeight: "500",
    color: colors.accentForeground,
  },
  howCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  howIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  howTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  howList: {},
  howStep: {
    fontSize: fontSize.small,
    color: "rgba(255,255,255,0.95)",
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  howStepNum: {
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  impactCard: {
    padding: spacing.lg,
  },
  impactLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  impactItem: {
    flex: 1,
    alignItems: "center",
  },
  impactValue: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.primary,
  },
  impactUnit: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  impactDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  impactHint: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
