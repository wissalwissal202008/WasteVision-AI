import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";
import { getHistory } from "../api/client";

const KG_CO2_PER_SCAN = 0.05;

export default function HomeScreen({ navigation }) {
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
      <View style={styles.header}>
        <Text style={styles.logo}>WasteVision</Text>
        <Text style={styles.tagline}>Tri intelligent, impact positif</Text>
      </View>

      <Card style={styles.ctaCard} elevated>
        <Text style={styles.ctaTitle}>Scannez un déchet</Text>
        <Text style={styles.ctaSub}>
          Une photo, un geste pour la planète. Obtenez le bon bac en une seconde.
        </Text>
        <PrimaryButton
          title="Scanner un déchet"
          onPress={() => navigation.navigate("Scan")}
          style={styles.mainButton}
        />
      </Card>

      <Card style={styles.impactCard}>
        <Text style={styles.impactLabel}>Votre impact cette semaine</Text>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{showImpact ? totalScans : "—"}</Text>
            <Text style={styles.impactUnit}>objets triés</Text>
          </View>
          <View style={styles.impactDivider} />
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{showImpact ? co2Saved + " kg" : "—"}</Text>
            <Text style={styles.impactUnit}>CO₂ évité</Text>
          </View>
        </View>
        <Text style={styles.impactHint}>
          {showImpact && totalScans > 0 ? "Continuez comme ça !" : "Scannez pour commencer à compter"}
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
  header: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: fontSize.display,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ctaCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  ctaTitle: {
    fontSize: fontSize.title,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ctaSub: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  mainButton: {
    marginTop: spacing.xs,
  },
  impactCard: {
    padding: spacing.lg,
  },
  impactLabel: {
    fontSize: fontSize.small,
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
