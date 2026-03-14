import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { PrimaryButton, SecondaryButton, Card } from "../components";
import { predict as apiPredict, getApiBase } from "../api/client";

const DEBUG = __DEV__;

export default function CameraScreen({ navigation, onResult, onSwitchToLive }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  const handlePredict = async (uri, type = "image/jpeg") => {
    setError(null);
    setPrediction(null);
    setPhotoUri(uri);
    setLoading(true);
    if (DEBUG) console.log("[Camera] Captured image URI:", uri);
    if (DEBUG) console.log("[Camera] API base:", getApiBase());
    try {
      const result = await apiPredict(uri, type);
      if (DEBUG) console.log("[Camera] Backend response:", result);
      setPrediction(result);
      setLoading(false);
      if (onResult) onResult(result, uri);
    } catch (e) {
      setLoading(false);
      setError(e?.message || "Prediction failed");
      if (DEBUG) console.error("[Camera] Predict error:", e);
      if (typeof Alert !== "undefined" && Alert.alert) {
        Alert.alert("Error", e?.message || "Cannot reach backend. Start it with: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001");
      }
    }
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission", "Camera access is required to scan waste.");
        return;
      }
    }
    if (!cameraRef.current) {
      setError("Camera not ready.");
      return;
    }
    try {
      const cam = cameraRef.current;
      const photo = await (cam?.takePictureAsync ?? cam?.takePicture)?.({ quality: 0.8 });
      if (photo?.uri) {
        await handlePredict(photo.uri, "image/jpeg");
      } else {
        setError("Could not capture photo.");
      }
    } catch (e) {
      setError(e?.message || "Camera capture failed.");
      if (DEBUG) console.error("[Camera] Capture error:", e);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Photo library access is required.");
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

  const wasteType = prediction?.waste_type ?? prediction?.waste_category ?? "";
  const confidence = prediction?.confidence ?? 0;
  const recyclingAdvice = prediction?.recycling_advice ?? prediction?.recycling_instructions ?? prediction?.recommended_bin ?? "";

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Camera access is needed to scan waste.</Text>
        <PrimaryButton title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Frame waste in the center</Text>
          <PrimaryButton title="Capture" onPress={takePhoto} style={styles.captureBtn} disabled={loading} />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing…</Text>
        </View>
      )}

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Ensure backend is running: uvicorn main:app --host 0.0.0.0 --port 8001</Text>
          <Text style={styles.errorHint}>On device, set your PC IP in app.json (expo.extra.apiBaseUrl)</Text>
        </Card>
      ) : null}

      {prediction && !loading && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Prediction</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Waste type</Text>
            <Text style={styles.resultValue}>{wasteType.replace(/_/g, " ") || prediction?.object_name}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence</Text>
            <Text style={styles.resultValue}>{(confidence * 100).toFixed(0)}%</Text>
          </View>
          {recyclingAdvice ? (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Recycling advice</Text>
              <Text style={styles.resultAdvice}>{recyclingAdvice}</Text>
            </View>
          ) : null}
          <PrimaryButton
            title="See full result"
            onPress={() => {
              if (onResult) onResult(prediction, photoUri);
              else navigation?.navigate?.("Result", { result: prediction, photoUri });
            }}
            style={styles.fullResultBtn}
          />
        </Card>
      )}

      <View style={styles.actions}>
        <SecondaryButton title="Choose from gallery" onPress={pickImage} style={styles.button} disabled={loading} />
        {onSwitchToLive && (
          <TouchableOpacity style={styles.liveButton} onPress={onSwitchToLive}>
            <Text style={styles.liveButtonText}>Live detection</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  helperText: { marginTop: spacing.md, fontSize: fontSize.body, color: colors.textSecondary, textAlign: "center" },
  previewWrap: {
    height: 320,
    width: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: fontSize.caption,
    marginBottom: spacing.sm,
  },
  captureBtn: { minWidth: 140 },
  loadingBlock: {
    padding: spacing.xl,
    alignItems: "center",
  },
  loadingText: { marginTop: spacing.sm, fontSize: fontSize.body, color: colors.textSecondary },
  errorCard: { margin: spacing.lg, borderColor: colors.error, borderWidth: 1 },
  errorText: { color: colors.error, fontWeight: "600", marginBottom: spacing.sm },
  errorHint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  resultCard: { margin: spacing.lg },
  resultTitle: { fontSize: fontSize.subhead, fontWeight: "700", marginBottom: spacing.md, color: colors.text },
  resultRow: { marginBottom: spacing.sm },
  resultLabel: { fontSize: fontSize.caption, color: colors.textSecondary },
  resultValue: { fontSize: fontSize.body, fontWeight: "600", color: colors.text, marginTop: 2 },
  resultAdvice: { fontSize: fontSize.body, color: colors.text, marginTop: 2 },
  fullResultBtn: { marginTop: spacing.md },
  actions: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  button: { marginBottom: spacing.md },
  liveButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  liveButtonText: { fontSize: fontSize.body, fontWeight: "600", color: colors.primary },
});
