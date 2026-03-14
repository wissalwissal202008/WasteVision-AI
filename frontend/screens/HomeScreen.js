import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { getHistory } from "../api/client";

const KG_CO2_PER_SCAN = 0.05;

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [totalScans, setTotalScans] = useState(null);
  const [co2Saved, setCo2Saved] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const data = await getHistory();
          const list = Array.isArray(data) ? data : [];
          if (!cancelled) {
            setTotalScans(list.length);
            setCo2Saved(Math.round(list.length * KG_CO2_PER_SCAN * 100) / 100);
          }
        } catch {
          if (!cancelled) setTotalScans(0);
          setCo2Saved(0);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const showImpact = totalScans !== null;

  return (
    <View style={styles.container}>
      {/* Hero card – eco design */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroIcon}>✨</Text>
          <Text style={styles.heroTitle}>{t("home.title")}</Text>
          <Text style={styles.heroSub}>{t("home.subtitle")}</Text>
          <PrimaryButton
            title={t("home.cta")}
            onPress={() => navigation.navigate("Scan")}
            style={styles.mainButton}
          />
        </View>
      </View>

      {/* Comment ça marche – eco design */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoTitle}>{t("home.howItWorks")}</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoStep}><Text style={styles.infoStepNum}>1.</Text> {t("home.step1")}</Text>
          <Text style={styles.infoStep}><Text style={styles.infoStepNum}>2.</Text> {t("home.step2")}</Text>
          <Text style={styles.infoStep}><Text style={styles.infoStepNum}>3.</Text> {t("home.step3")}</Text>
        </View>
      </View>

      {/* Impact – compact */}
      <Card style={styles.impactCard}>
        <Text style={styles.impactLabel}>{t("home.impactLabel")}</Text>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{showImpact ? totalScans : "—"}</Text>
            <Text style={styles.impactUnit}>{t("home.objectsSorted")}</Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{showImpact ? co2Saved + " kg" : "—"}</Text>
            <Text style={styles.impactUnit}>{t("home.co2Avoided")}</Text>
          </View>
        </View>
        <Text style={styles.impactHint}>
          {showImpact && totalScans > 0 ? t("home.impactHintContinue") : t("home.impactHintStart")}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContent: {},
  heroIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  mainButton: {
    backgroundColor: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  infoTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  infoList: {},
  infoStep: {
    fontSize: fontSize.small,
    color: "rgba(255,255,255,0.95)",
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  infoStepNum: {
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
