import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { PrimaryButton, SecondaryButton, Card } from "../components";
import { predict } from "../api/client";

export default function CameraScreen({ navigation, onResult, onSwitchToLive }) {
  const [loading, setLoading] = useState(false);

  const handlePredict = async (uri, type) => {
    setLoading(true);
    try {
      const result = await predict(uri, type || "image/jpeg");
      setLoading(false);
      if (onResult) {
        onResult(result, uri);
      } else if (navigation?.navigate) {
        navigation.navigate("Result", { result, photoUri: uri });
      }
    } catch (e) {
      setLoading(false);
      const msg = e?.message || "Image non reconnue. Vérifiez que le backend tourne (port 8001) et réessayez.";
      if (typeof Alert !== "undefined" && Alert.alert) {
        Alert.alert("Erreur", msg);
      } else {
        console.error("Predict error:", msg);
        alert(msg);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Autorisation", "L'accès à la caméra est nécessaire pour scanner.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePredict(result.assets[0].uri, "image/jpeg");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Autorisation", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePredict(result.assets[0].uri, "image/jpeg");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Pour un meilleur résultat</Text>
        <Text style={styles.instructionText}>
          Cadrez le déchet au centre, bonne luminosité, évitez les reflets.
        </Text>
      </Card>

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyse en cours…</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton title="Prendre une photo" onPress={takePhoto} style={styles.button} />
          <SecondaryButton title="Choisir une image" onPress={pickImage} style={styles.button} />
          {onSwitchToLive && (
            <TouchableOpacity style={styles.liveButton} onPress={onSwitchToLive}>
              <Text style={styles.liveButtonText}>📹 Live detection</Text>
              <Text style={styles.liveButtonHint}>AI analyzes camera in real time</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  instructionCard: {
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  loadingBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  liveButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
  },
  liveButtonText: { fontSize: fontSize.body, fontWeight: "600", color: colors.primary },
  liveButtonHint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
});
