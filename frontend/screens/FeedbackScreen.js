import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { submitFeedback } from "../api/client";

const STAR = "★";
const STAR_EMPTY = "☆";

export default function FeedbackScreen({ onBack }) {
  const [bugText, setBugText] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(null);

  const send = async (type, payload) => {
    const key = type;
    setLoading(key);
    try {
      await submitFeedback(payload);
      if (type === "bug") setBugText("");
      if (type === "suggestion") setSuggestionText("");
      if (type === "rating") setRating(0);
      Alert.alert("Merci", "Votre retour a bien été envoyé.");
    } catch (e) {
      Alert.alert("Erreur", e.message || "Envoi impossible. Vérifiez la connexion.");
    } finally {
      setLoading(null);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Donner mon avis</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Signaler un bug</Text>
          <Text style={styles.hint}>Décrivez le problème rencontré.</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : l’app se ferme quand je scanne un objet en verre..."
            placeholderTextColor={colors.textSecondary}
            value={bugText}
            onChangeText={setBugText}
            multiline
            numberOfLines={3}
            editable={loading === null}
          />
          <PrimaryButton
            title={loading === "bug" ? "Envoi..." : "Envoyer"}
            onPress={() => {
              if (!bugText.trim()) {
                Alert.alert("Message vide", "Veuillez décrire le bug.");
                return;
              }
              send("bug", { type: "bug", content: bugText.trim() });
            }}
            style={styles.btn}
            disabled={!!loading}
          />
          {loading === "bug" && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Envoyer une suggestion</Text>
          <Text style={styles.hint}>Une idée pour améliorer l’app ?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : ajouter un mode hors-ligne..."
            placeholderTextColor={colors.textSecondary}
            value={suggestionText}
            onChangeText={setSuggestionText}
            multiline
            numberOfLines={3}
            editable={loading === null}
          />
          <PrimaryButton
            title={loading === "suggestion" ? "Envoi..." : "Envoyer"}
            onPress={() => {
              if (!suggestionText.trim()) {
                Alert.alert("Message vide", "Veuillez écrire votre suggestion.");
                return;
              }
              send("suggestion", { type: "suggestion", content: suggestionText.trim() });
            }}
            style={styles.btn}
            disabled={!!loading}
          />
          {loading === "suggestion" && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Noter l’application</Text>
          <Text style={styles.hint}>De 1 à 5 étoiles.</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setRating(n)}
                onPressIn={() => setHoverRating(n)}
                onPressOut={() => setHoverRating(0)}
                style={styles.starBtn}
                disabled={!!loading}
              >
                <Text style={[styles.star, displayRating >= n && styles.starFilled]}>
                  {displayRating >= n ? STAR : STAR_EMPTY}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton
            title={loading === "rating" ? "Envoi..." : "Envoyer ma note"}
            onPress={() => {
              if (rating < 1) {
                Alert.alert("Note requise", "Sélectionnez une note de 1 à 5 étoiles.");
                return;
              }
              send("rating", { type: "rating", rating });
            }}
            style={styles.btn}
            disabled={!!loading}
          />
          {loading === "rating" && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.subhead, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  hint: { fontSize: fontSize.small, color: colors.textSecondary, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
    minHeight: 88,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  btn: { marginTop: spacing.xs },
  loader: { marginTop: spacing.sm },
  starsRow: { flexDirection: "row", marginBottom: spacing.md, gap: 4 },
  starBtn: { padding: 4 },
  star: { fontSize: 36, color: colors.border },
  starFilled: { color: colors.accent },
});
