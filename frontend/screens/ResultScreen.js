import React, { useState } from "react";
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
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { submitCorrection } from "../api/client";

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
  const hasExplanations =
    result.explanation_what || result.explanation_material || result.explanation_use || result.explanation_difference;

  const handleCorrect = async (correctedCategory) => {
    if (!result.scan_id) {
      Alert.alert("Erreur", "Impossible d'enregistrer la correction pour ce scan.");
      return;
    }
    setCorrecting(true);
    try {
      await submitCorrection(result.scan_id, correctedCategory);
      setCorrectionModalVisible(false);
      setCorrected(true);
      Alert.alert(
        "Merci !",
        "Votre correction a bien été enregistrée. Elle nous aide à améliorer WasteVision."
      );
    } catch (e) {
      Alert.alert("Erreur", e?.message || "La correction n'a pas pu être envoyée.");
    } finally {
      setCorrecting(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {photoUri ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        </View>
      ) : null}

      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>Objet détecté</Text>
        <Text style={styles.badgeName}>{productLabel}</Text>
        <Text style={styles.badgeConfidence}>{confidencePercent} % de confiance</Text>
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

      <Card style={[styles.card, styles.tipCard]}>
        <Text style={styles.tipLabel}>Conseil éco</Text>
        <Text style={styles.tipText}>{result.eco_tip}</Text>
      </Card>

      {result.scan_id && !corrected && (
        <SecondaryButton
          title="Ce n'est pas correct ? Corriger la catégorie"
          onPress={() => setCorrectionModalVisible(true)}
          style={styles.correctButton}
        />
      )}
      {corrected && (
        <View style={styles.thankYouBanner}>
          <Text style={styles.thankYouText}>Merci d'avoir aidé à améliorer WasteVision.</Text>
        </View>
      )}

      <PrimaryButton
        title="Scanner un autre déchet"
        onPress={goBack}
        style={styles.button}
      />

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
  photoWrap: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  photo: {
    width: "100%",
    aspectRatio: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: fontSize.caption,
    color: colors.textOnPrimary,
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeName: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.textOnPrimary,
    marginTop: spacing.xs,
  },
  badgeConfidence: {
    fontSize: fontSize.small,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: spacing.xs,
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
    color: colors.primaryDark,
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
  tipCard: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  tipLabel: {
    fontSize: fontSize.caption,
    color: colors.primaryDark,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
  },
  correctButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  thankYouBanner: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  thankYouText: {
    fontSize: fontSize.small,
    color: colors.textOnPrimary,
    textAlign: "center",
  },
  button: {
    marginTop: spacing.lg,
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
