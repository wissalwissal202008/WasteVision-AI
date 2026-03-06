import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GUIDE_STEPS = [
  { step: 1, title: "Ouvrir l’onglet Scan", text: "Allez dans l’onglet Scan en bas de l’écran." },
  { step: 2, title: "Prendre une photo", text: "Photographiez un déchet (emballage, bouteille, etc.). L’IA analyse l’image." },
  { step: 3, title: "Consulter le résultat", text: "Vous voyez la catégorie de tri, la poubelle conseillée et des conseils éco." },
  { step: 4, title: "Corriger si besoin", text: "Si le tri est incorrect, ouvrez Historique, trouvez le scan et corrigez la catégorie. Cela améliore l’app." },
];

const FAQ_ITEMS = [
  {
    q: "Quelles catégories de tri sont reconnues ?",
    a: "Plastique, papier/carton, verre, métal, organique et non recyclable. L’app vous indique la poubelle conseillée (jaune, bleue, verte, etc.).",
  },
  {
    q: "L’app fonctionne-t-elle hors connexion ?",
    a: "Non. La classification des images se fait sur notre serveur. Pensez à vous connecter en Wi‑Fi ou 4G avant de scanner.",
  },
  {
    q: "Pourquoi corriger un scan ?",
    a: "Quand vous corrigez une prédiction, nous utilisons ces données (de manière anonyme) pour améliorer le modèle. Votre aide rend l’app plus précise.",
  },
  {
    q: "Où voir l’historique de mes scans ?",
    a: "Onglet Historique. Vous pouvez rechercher par produit ou filtrer par catégorie (plastique, verre, etc.).",
  },
  {
    q: "Comment signaler un bug ou proposer une idée ?",
    a: "Paramètres → Donner mon avis. Vous pouvez signaler un bug, envoyer une suggestion ou noter l’application.",
  },
];

function FaqItem({ item, isOpen, onToggle, isLast }) {
  return (
    <TouchableOpacity style={[styles.faqItem, isLast && styles.faqItemLast]} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.faqRow}>
        <Text style={styles.faqQuestion}>{item.q}</Text>
        <Text style={styles.faqChevron}>{isOpen ? "−" : "+"}</Text>
      </View>
      {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen({ onBack, onOpenSupport }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq((i) => (i === index ? null : index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Centre d’aide</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Guide rapide</Text>
        <Card style={styles.card}>
          {GUIDE_STEPS.map(({ step, title, text }) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>{step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepText}>{text}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>FAQ</Text>
        <Card style={styles.card}>
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={expandedFaq === index}
              onToggle={() => toggleFaq(index)}
              isLast={index === FAQ_ITEMS.length - 1}
            />
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.card}>
          <Text style={styles.supportText}>
            Un problème, une question ? Envoyez-nous un message ou signalez un bug. Nous vous répondons dès que possible.
          </Text>
          <PrimaryButton
            title="Contacter le support"
            onPress={onOpenSupport}
            style={styles.supportButton}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginRight: spacing.sm },
  backText: { fontSize: fontSize.body, color: colors.primary, fontWeight: "600" },
  title: { fontSize: fontSize.title, fontWeight: "700", color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: { marginBottom: spacing.sm },
  stepRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  stepNumber: {
    fontSize: fontSize.small,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqItemLast: { borderBottomWidth: 0 },
  faqRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: "500",
    color: colors.text,
    paddingRight: spacing.sm,
  },
  faqChevron: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  faqAnswer: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
    paddingRight: spacing.md,
  },
  supportText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  supportButton: { alignSelf: "flex-start" },
});
