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
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { PrimaryButton, SecondaryButton, Card } from "../components";
import { useTranslation } from "react-i18next";
import { predict as apiPredict, getApiBase } from "../api/client";

const DEBUG = __DEV__;

export default function CameraScreen({ navigation, onResult, onSwitchToLive, navLang }) {
  const { t, i18n } = useTranslation();
  /** Langue API : priorité aux paramètres du navigateur (onglet Scan), sinon i18n. */
  const apiLang = navLang ?? i18n.language;
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
      const result = await apiPredict(uri, type, apiLang);
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
        Alert.alert(t("cameraScreen.alertPermission"), t("cameraScreen.cameraRequired"));
        return;
      }
    }
    if (!cameraRef.current) {
      setError(t("cameraScreen.cameraNotReady"));
      return;
    }
    try {
      const cam = cameraRef.current;
      const photo = await (cam?.takePictureAsync ?? cam?.takePicture)?.({ quality: 0.8 });
      if (photo?.uri) {
        await handlePredict(photo.uri, "image/jpeg");
      } else {
        setError(t("cameraScreen.captureFailed"));
      }
    } catch (e) {
      setError(e?.message || t("cameraScreen.captureError"));
      if (DEBUG) console.error("[Camera] Capture error:", e);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("cameraScreen.alertPermission"), t("cameraScreen.galleryRequired"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
        <Text style={styles.helperText}>{t("cameraScreen.checkingPermission")}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>{t("cameraScreen.cameraAccessNeeded")}</Text>
        <PrimaryButton title={t("cameraScreen.allowCamera")} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        {/* Figma Scanner: top bar */}
        <View style={styles.scannerTopBar}>
          <View style={styles.scannerTopSpacer} />
          <View style={styles.aiReadyPill}>
            <View style={styles.aiReadyDot} />
            <Text style={styles.aiReadyText}>{t("cameraScreen.aiReady")}</Text>
          </View>
          <TouchableOpacity style={styles.galleryIconBtn} onPress={pickImage} disabled={loading}>
            <Text style={styles.galleryIconText}>🖼️</Text>
          </TouchableOpacity>
        </View>
        {/* Instruction */}
        <View style={styles.instructionWrap}>
          {loading ? (
            <View style={styles.analyzingPill}>
              <ActivityIndicator size="small" color="#6ee7b7" />
              <Text style={styles.analyzingPillText}>{t("cameraScreen.analyzingPill")}</Text>
            </View>
          ) : (
            <View style={styles.instructionPill}>
              <Text style={styles.instructionIcon}>🎯</Text>
              <Text style={styles.instructionText}>{t("cameraScreen.positionItem")}</Text>
            </View>
          )}
        </View>
        {/* Bottom: tips + Scan Item button (Figma) */}
        <View style={styles.scannerBottom}>
          {!loading && (
            <View style={styles.tipsWrap}>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{t("cameraScreen.tipLighting")}</Text>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{t("cameraScreen.tipSteady")}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.scanItemBtnWrap}
            onPress={takePhoto}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={loading ? ["#4b5563", "#4b5563"] : colors.gradientScanCta}
              style={styles.scanItemBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scanItemBtnIcon}>📷</Text>
              <Text style={styles.scanItemBtnText}>{loading ? t("cameraScreen.scanning") : t("cameraScreen.scanItem")}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.poweredBy}>{t("cameraScreen.poweredBy")}</Text>
        </View>
      </View>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>{t("cameraScreen.errorBackendHint")}</Text>
        </Card>
      ) : null}

      {prediction && !loading && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>{t("cameraScreen.prediction")}</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{t("cameraScreen.wasteType")}</Text>
            <Text style={styles.resultValue}>{wasteType.replace(/_/g, " ") || prediction?.object_name}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{t("cameraScreen.confidence")}</Text>
            <Text style={styles.resultValue}>{(confidence * 100).toFixed(0)}%</Text>
          </View>
          {recyclingAdvice ? (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{t("dict.advice")}</Text>
              <Text style={styles.resultAdvice}>{recyclingAdvice}</Text>
            </View>
          ) : null}
          <PrimaryButton
            title={t("cameraScreen.seeFullResult")}
            onPress={() => {
              if (onResult) onResult(prediction, photoUri);
              else navigation?.navigate?.("Result", { result: prediction, photoUri });
            }}
            style={styles.fullResultBtn}
          />
        </Card>
      )}

      {onSwitchToLive && (
        <TouchableOpacity style={styles.liveButton} onPress={onSwitchToLive}>
          <Text style={styles.liveButtonText}>{t("cameraScreen.liveDetectionCta")}</Text>
        </TouchableOpacity>
      )}
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
    minHeight: 420,
    width: "100%",
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    width: "100%",
    minHeight: 360,
  },
  scannerTopBar: {
    position: "absolute",
    top: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  scannerTopSpacer: { width: 44 },
  aiReadyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 999,
  },
  aiReadyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6ee7b7" },
  aiReadyText: { fontSize: fontSize.small, fontWeight: "600", color: "#fff" },
  galleryIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryIconText: { fontSize: 22 },
  instructionWrap: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  instructionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  instructionIcon: { fontSize: 20 },
  instructionText: { fontSize: fontSize.body, fontWeight: "600", color: "#fff" },
  analyzingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 28,
  },
  analyzingPillText: { fontSize: fontSize.body, fontWeight: "600", color: "#fff" },
  scannerBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  tipsWrap: { marginBottom: spacing.md },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6ee7b7" },
  tipText: { fontSize: fontSize.small, color: "rgba(255,255,255,0.9)" },
  scanItemBtnWrap: { borderRadius: 32, overflow: "hidden", marginBottom: spacing.md },
  scanItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 32,
  },
  scanItemBtnIcon: { fontSize: 28 },
  scanItemBtnText: { fontSize: fontSize.title, fontWeight: "700", color: "#fff" },
  poweredBy: { fontSize: fontSize.small, color: "rgba(255,255,255,0.6)", textAlign: "center" },
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
  liveButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  liveButtonText: { fontSize: fontSize.body, fontWeight: "600", color: colors.primary },
});
