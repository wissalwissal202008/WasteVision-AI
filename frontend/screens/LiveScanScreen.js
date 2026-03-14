/**
 * Real-time waste detection: camera preview, periodic capture, POST /detect,
 * draw bounding boxes and labels. Scanning animation while analyzing.
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, spacing, fontSize, borderRadius, getCategoryColor } from "../constants/theme";
import { getWasteTypeLabel } from "../constants/wasteTypeColors";
import { detect } from "../api/client";
import { predict } from "../services/detection";

const LIVE_INTERVAL_MS = 1200;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LiveScanScreen({ onResult, onBack }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [viewSize, setViewSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const captureAndDetect = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync?.({
        quality: 0.6,
        base64: false,
        mute: true,
      }) ?? await cameraRef.current?.takePicture?.({ quality: 0.6 });
      if (!photo?.uri) {
        setAnalyzing(false);
        return;
      }
      const res = await detect(photo.uri, "image/jpeg");
      const list = res?.detections ?? [];
      setDetections(list);
      setPhotoUri(photo.uri);
      if (list.length === 0) setError("No waste detected. Try again.");
    } catch (e) {
      setError(e?.message || "Detection failed");
      setDetections([]);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!permission?.granted) return;
    intervalRef.current = setInterval(captureAndDetect, LIVE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted]);

  useEffect(() => {
    if (analyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, useNativeDriver: true, duration: 600 }),
          Animated.timing(scanAnim, { toValue: 0, useNativeDriver: true, duration: 600 }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [analyzing]);

  const handleUseResult = async () => {
    if (detections.length > 0 && photoUri && onResult) {
      const d = detections[0];
      const cat = d.category || "non_recyclable";
      const result = {
        object_name: d.label,
        waste_type: cat,
        waste_category: cat,
        confidence: d.confidence,
        recycling_advice: d.recycling_advice,
        recommended_bin: d.recycling_advice?.slice(0, 50) || "",
      };
      onResult(result, photoUri);
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

  const scanOpacity = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <View style={styles.container} onLayout={(e) => setViewSize(e.nativeEvent.layout)}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Bounding box overlays (normalized 0-1 → view size) */}
      {detections.length > 0 && viewSize.width > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {detections.map((d, i) => {
            const bbox = d.bounding_box || [0, 0, 1, 1];
            const [x1, y1, x2, y2] = bbox.map(Number);
            const left = x1 * viewSize.width;
            const top = y1 * viewSize.height;
            const w = (x2 - x1) * viewSize.width;
            const h = (y2 - y1) * viewSize.height;
            const cat = d.category || "non_recyclable";
            const catColor = getCategoryColor(cat);
            return (
              <View
                key={i}
                style={[
                  styles.bbox,
                  {
                    left,
                    top,
                    width: Math.max(w, 40),
                    height: Math.max(h, 40),
                    borderColor: catColor.bg || colors.primary,
                  },
                ]}
              >
                <View style={[styles.bboxLabel, { backgroundColor: catColor.bg || colors.primary }]}>
                  <Text style={styles.bboxLabelText} numberOfLines={1}>
                    {d.label} {Math.round((d.confidence || 0) * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Scanning animation */}
      {analyzing && (
        <Animated.View style={[styles.scanLine, { opacity: scanOpacity }]} pointerEvents="none" />
      )}

      {/* Overlay UI */}
      <View style={styles.overlay} pointerEvents="box-none">
        {analyzing && (
          <View style={styles.analyzingBadge}>
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
            <Text style={styles.analyzingText}>Scanning…</Text>
          </View>
        )}
        {detections.length > 0 && !analyzing && (
          <View style={styles.labelCard}>
            <Text style={styles.labelName}>{detections[0].label}</Text>
            <Text style={styles.labelConfidence}>
              {Math.round((detections[0].confidence || 0) * 100)}% confidence
            </Text>
            {detections[0].recycling_advice ? (
              <Text style={styles.labelAdvice} numberOfLines={2}>
                ♻️ {detections[0].recycling_advice}
              </Text>
            ) : null}
            <TouchableOpacity style={styles.validateBtn} onPress={handleUseResult}>
              <Text style={styles.validateBtnText}>Use this result</Text>
            </TouchableOpacity>
          </View>
        )}
        {error && !analyzing && <Text style={styles.errorText}>{error}</Text>}
      </View>

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
  bbox: {
    position: "absolute",
    borderWidth: 3,
    borderRadius: 4,
  },
  bboxLabel: {
    position: "absolute",
    top: -24,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 200,
  },
  bboxLabelText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    top: "48%",
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
  labelName: { fontSize: fontSize.subhead, fontWeight: "700", color: colors.text, textAlign: "center" },
  labelConfidence: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: spacing.xs },
  labelAdvice: { fontSize: fontSize.caption, color: colors.text, marginTop: spacing.sm, textAlign: "center" },
  validateBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  validateBtnText: { color: colors.textOnPrimary, fontWeight: "600", fontSize: fontSize.small },
  errorText: { color: colors.error, fontSize: fontSize.small, textAlign: "center" },
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
