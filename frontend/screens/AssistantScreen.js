import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

const ECO_TIPS = [
  "Rincez les emballages avant de les jeter pour faciliter le recyclage.",
  "Pliez les cartons pour gagner de la place dans le bac bleu.",
  "Les bouchons des bouteilles en plastique se recyclent avec la bouteille.",
  "Un déchet par bac : ne mélangez pas les matières pour ne pas contaminer le tri.",
  "En cas de doute, consultez les consignes de votre commune.",
];

export default function AssistantScreen({ navigation }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Coach éco</Text>
        <Text style={styles.subtitle}>Conseils simples pour mieux trier</Text>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          Bonjour ! Je suis là pour vous aider à trier. Voici quelques conseils utiles.
        </Text>
      </View>

      {ECO_TIPS.map((tip, i) => (
        <View key={i} style={styles.tipRow}>
          <View style={styles.tipBullet} />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      <Card style={styles.ctaCard}>
        <Text style={styles.ctaText}>
          Identifiez un déchet en un instant avec le scan.
        </Text>
        <PrimaryButton
          title="Ouvrir le scanner"
          onPress={() => navigation.navigate("Scan")}
          style={styles.ctaButton}
        />
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
  header: {
    marginBottom: spacing.lg,
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
  },
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "90%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bubbleText: {
    fontSize: fontSize.body,
    color: colors.textOnPrimary,
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
  ctaCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  ctaText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  ctaButton: {
    marginTop: spacing.xs,
  },
});
