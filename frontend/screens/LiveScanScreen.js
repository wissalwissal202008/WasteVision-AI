/**
 * Real-time camera detection: analyzes camera feed periodically and shows
 * a label overlay with object name and recycling info. User can validate
 * to go to full result screen. Keeps existing photo flow intact.
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, spacing, fontSize, borderRadius, getCategoryColor } from "../constants/theme";
import { getWasteTypeLabel } from "../constants/wasteTypeColors";
import { predict } from "../api/client";

const LIVE_INTERVAL_MS = 2500;

export default function LiveScanScreen({ onResult, onBack }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [liveResult, setLiveResult] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  // Run capture + predict async so the main/UI thread is never blocked (smooth framerate).
  const captureAndPredict = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });
      if (!photo?.uri) {
        setAnalyzing(false);
        return;
      }
      const result = await predict(photo.uri, "image/jpeg");
      setLiveResult(result);
      setPhotoUri(photo.uri);
    } catch (e) {
      setError(e?.message || "Detection failed");
      setLiveResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!permission?.granted) return;
    intervalRef.current = setInterval(captureAndPredict, LIVE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted]);

  const handleValidate = () => {
    if (liveResult && photoUri && onResult) {
      onResult(liveResult, photoUri);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Checking camera…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Camera access is required for live detection.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Live detection is available on mobile (Expo Go or native build).</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back to scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Overlay: label above "object" (centered) */}
      <View style={styles.overlay} pointerEvents="box-none">
        {analyzing && (
          <View style={styles.analyzingBadge}>
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
            <Text style={styles.analyzingText}>Analyzing…</Text>
          </View>
        )}
        {liveResult && !analyzing && (() => {
          const cat = liveResult.waste_category || "non_recyclable";
          const catColor = getCategoryColor(cat);
          return (
            <View style={styles.labelCard}>
              <Text style={styles.labelName} numberOfLines={1}>
                {liveResult.object_name || getWasteTypeLabel(cat)}
              </Text>
              <Text style={styles.labelMaterial} numberOfLines={1}>
                Material: {getWasteTypeLabel(cat)}
              </Text>
              <View style={[styles.labelCategoryPill, { backgroundColor: catColor.light }]}>
                <Text style={[styles.labelCategoryText, { color: catColor.text }]} numberOfLines={1}>
                  ♻️ {getWasteTypeLabel(cat)} · {liveResult.recommended_bin}
                </Text>
              </View>
              <TouchableOpacity style={styles.validateBtn} onPress={handleValidate}>
                <Text style={styles.validateBtnText}>Use this result</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        {error && !analyzing && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Top bar: back */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Live detection</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, width: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  analyzingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  analyzingText: { color: colors.textOnPrimary, fontSize: fontSize.small },
  labelCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 220,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  labelName: {
    fontSize: fontSize.subhead,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  labelMaterial: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  labelCategoryPill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: "center",
  },
  labelCategoryText: {
    fontSize: fontSize.caption,
    fontWeight: "600",
  },
  validateBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  validateBtnText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
    fontSize: fontSize.small,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.small,
    textAlign: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topBarBtn: { padding: spacing.sm },
  topBarBtnText: { color: colors.textOnPrimary, fontWeight: "600" },
  topBarTitle: { color: colors.textOnPrimary, fontWeight: "700", fontSize: fontSize.small },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  helperText: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: colors.textOnPrimary, fontWeight: "600" },
  backBtn: { padding: spacing.md },
  backBtnText: { color: colors.primary, fontWeight: "600" },
});
