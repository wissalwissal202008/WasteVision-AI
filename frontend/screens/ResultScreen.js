import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { colors, spacing, fontSize, borderRadius, getCategoryColor } from "../constants/theme";
import { submitCorrection } from "../api/client";
import { awardPointsForScan, awardPointsForCorrection } from "../services/ecoScore";

const CATEGORY_OPTIONS = [
  { key: "plastic", label: "Plastique" },
  { key: "paper_cardboard", label: "Papier / Carton" },
  { key: "glass", label: "Verre" },
  { key: "metal", label: "Métal" },
  { key: "organic", label: "Organique" },
  { key: "non_recyclable", label: "Non recyclable" },
];

const CONFIDENCE_LOW_THRESHOLD = 0.6;

export default function ResultScreen({ route, navigation, result: resultProp, photoUri: photoUriProp, onBack }) {
  const fromParams = route?.params || {};
  const result = resultProp ?? fromParams.result;
  const photoUri = photoUriProp ?? fromParams.photoUri;
  const [correctionModalVisible, setCorrectionModalVisible] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const goBack = () => {
    if (onBack) onBack();
    else if (navigation?.popToTop) navigation.popToTop();
    else if (navigation?.navigate) navigation.navigate("Accueil");
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Aucun résultat.</Text>
        <PrimaryButton title="Retour" onPress={goBack} />
      </View>
    );
  }

  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const isLowConfidence = (result.confidence || 0) < CONFIDENCE_LOW_THRESHOLD;
  const productLabel = result.product_type || result.object_name;
  const categoryKey = result.waste_category || "non_recyclable";
  const categoryColor = getCategoryColor(categoryKey);
  const hasExplanations =
    result.explanation_what || result.explanation_material || result.explanation_use || result.explanation_difference;

  useEffect(() => {
    if (result?.scan_id && result?.waste_category) {
      awardPointsForScan(result.scan_id, result.waste_category).catch(() => {});
    }
  }, [result?.scan_id, result?.waste_category]);

  const handleCorrect = async (correctedCategory) => {
    if (!result.scan_id) {
      Alert.alert("Erreur", "Impossible d'enregistrer la correction pour ce scan.");
      return;
    }
    setCorrecting(true);
    try {
      await submitCorrection(result.scan_id, correctedCategory);
      await awardPointsForCorrection();
      setCorrectionModalVisible(false);
      setCorrected(true);
      Alert.alert(
        "Merci !",
        "Votre correction a bien été enregistrée et aide l'IA à s'améliorer. +5 points éco !"
      );
    } catch (e) {
      Alert.alert("Erreur", e?.message || "La correction n'a pas pu être envoyée.");
    } finally {
      setCorrecting(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Eco design: white result card */}
      <View style={styles.resultCard}>
        {photoUri ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.photoOverlay} />
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeIcon}>✓</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.resultBody}>
          <Text style={styles.resultObjectName}>{productLabel}</Text>
          <Text style={styles.resultMaterial}>{result.object_name || categoryKey.replace(/_/g, " ")}</Text>

          {/* Category badge – eco colored pill */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor.light }]}>
            <Text style={[styles.categoryBadgeText, { color: categoryColor.text }]}>
              ♻️ {CATEGORY_OPTIONS.find((o) => o.key === categoryKey)?.label || categoryKey.replace(/_/g, " ")}
            </Text>
          </View>
        </View>
      </View>

      {isLowConfidence && (
        <Card style={styles.lowConfidenceCard}>
          <Text style={styles.lowConfidenceText}>
            Nous ne sommes pas très sûrs de cette détection. Vous pouvez corriger ci-dessous pour nous aider à nous améliorer.
          </Text>
        </Card>
      )}

      {/* Object explanation (before recycling) */}
      {hasExplanations && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Comprendre l'objet</Text>
          {result.explanation_what ? (
            <View style={styles.explanationBlock}>
              <Text style={styles.explanationLabel}>Qu'est-ce que c'est ?</Text>
              <Text style={styles.explanationText}>{result.explanation_what}</Text>
            </View>
          ) : null}
          {result.explanation_material ? (
            <View style={styles.explanationBlock}>
              <Text style={styles.explanationLabel}>De quoi c'est fait ?</Text>
              <Text style={styles.explanationText}>{result.explanation_material}</Text>
            </View>
          ) : null}
          {result.explanation_use ? (
            <View style={styles.explanationBlock}>
              <Text style={styles.explanationLabel}>À quoi ça sert ?</Text>
              <Text style={styles.explanationText}>{result.explanation_use}</Text>
            </View>
          ) : null}
          {result.explanation_difference ? (
            <View style={styles.explanationBlock}>
              <Text style={styles.explanationLabel}>En quoi c'est différent d'objets similaires ?</Text>
              <Text style={styles.explanationText}>{result.explanation_difference}</Text>
            </View>
          ) : null}
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Catégorie</Text>
        <Text style={styles.cardValue}>{result.waste_category.replace(/_/g, " ")}</Text>
      </Card>

      <Card style={[styles.card, styles.binCard]}>
        <Text style={styles.cardLabel}>Bac recommandé</Text>
        <Text style={styles.binValue}>{result.recommended_bin}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Impact environnemental</Text>
        <Text style={styles.cardText}>{result.environmental_impact}</Text>
      </Card>

      {/* Eco design: conseil écologique with category tint */}
      <View style={[styles.tipCardEco, { backgroundColor: categoryColor.light }]}>
        <View style={[styles.tipCardEcoIcon, { backgroundColor: categoryColor.bg }]}>
          <Text style={styles.tipCardEcoIconText}>🌱</Text>
        </View>
        <View style={styles.tipCardEcoContent}>
          <Text style={[styles.tipCardEcoTitle, { color: categoryColor.text }]}>Conseil écologique</Text>
          <Text style={[styles.tipCardEcoText, { color: categoryColor.text }]}>{result.eco_tip}</Text>
        </View>
      </View>

      {/* Eco design: action buttons row */}
      <View style={styles.actionRow}>
        {result.scan_id && !corrected && (
          <SecondaryButton
            title="Corriger"
            onPress={() => setCorrectionModalVisible(true)}
            style={[styles.correctButton, styles.actionButton]}
          />
        )}
        <PrimaryButton
          title="Nouveau scan"
          onPress={goBack}
          style={styles.actionButton}
        />
      </View>
      {corrected && (
        <View style={styles.thankYouBanner}>
          <Text style={styles.thankYouText}>Merci d'avoir aidé à améliorer WasteVision.</Text>
          <Text style={styles.thankYouHint}>Your corrections are stored and used to build a clean dataset for retraining the AI—every fix makes WasteVision smarter.</Text>
        </View>
      )}

      {/* Eco design: tip */}
      <View style={styles.ecoTip}>
        <Text style={styles.ecoTipText}>💡 Si la détection est incorrecte, utilisez "Corriger" pour améliorer l'IA</Text>
      </View>

      <Modal
        visible={correctionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !correcting && setCorrectionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !correcting && setCorrectionModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quelle est la bonne catégorie ?</Text>
            {CATEGORY_OPTIONS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={styles.modalOption}
                onPress={() => handleCorrect(key)}
                disabled={correcting}
              >
                <Text style={styles.modalOptionText}>{label}</Text>
              </TouchableOpacity>
            ))}
            {correcting && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            <SecondaryButton
              title="Annuler"
              onPress={() => setCorrectionModalVisible(false)}
              style={styles.modalCancel}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  photoWrap: {
    position: "relative",
    height: 220,
    backgroundColor: colors.muted,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  successBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 3,
  },
  successBadgeIcon: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "700",
  },
  resultBody: {
    padding: spacing.lg,
  },
  resultObjectName: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultMaterial: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBadgeText: {
    fontSize: fontSize.small,
    fontWeight: "700",
  },
  lowConfidenceCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.accentLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  lowConfidenceText: {
    fontSize: fontSize.small,
    color: colors.text,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  explanationBlock: {
    marginBottom: spacing.md,
  },
  explanationLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.text,
  },
  cardText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
  binCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  binValue: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.primary,
  },
  tipCardEco: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  tipCardEcoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  tipCardEcoIconText: { fontSize: 20 },
  tipCardEcoContent: { flex: 1 },
  tipCardEcoTitle: {
    fontSize: fontSize.small,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  tipCardEcoText: {
    fontSize: fontSize.small,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: { flex: 1 },
  correctButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  thankYouBanner: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  thankYouText: {
    fontSize: fontSize.small,
    color: colors.accentForeground,
    textAlign: "center",
  },
  thankYouHint: {
    fontSize: fontSize.caption,
    color: colors.accentForeground,
    textAlign: "center",
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  ecoTip: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: "#dbeafe",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
  ecoTipText: {
    fontSize: fontSize.small,
    color: "#1e40af",
    textAlign: "center",
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  modalLoading: {
    padding: spacing.md,
    alignItems: "center",
  },
  modalCancel: {
    marginTop: spacing.md,
  },
});
