import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { PrimaryButton } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

const { width } = Dimensions.get("window");
const SLIDES = [
  {
    title: "Bienvenue sur WasteVision",
    subtitle: "Scannez un déchet avec votre appareil photo et l’IA vous indique dans quel bac le jeter.",
  },
  {
    title: "Tri simple et utile",
    subtitle: "Obtenez une explication claire (matière, usage), le bon bac, l’impact environnemental et un conseil éco.",
  },
  {
    title: "Prêt à agir ?",
    subtitle: "Chaque scan compte. Commencez maintenant pour mieux trier au quotidien.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        {!isLast ? (
          <>
            <TouchableOpacity onPress={() => setIndex(index + 1)} style={styles.nextBtn}>
              <Text style={styles.nextText}>Suivant</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          </>
        ) : (
          <PrimaryButton title="Commencer" onPress={onDone} style={styles.startBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  actions: {
    alignItems: "center",
  },
  nextBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  nextText: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.primary,
  },
  skipBtn: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  startBtn: {
    minWidth: width * 0.6,
  },
});
