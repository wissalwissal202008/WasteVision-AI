/**
 * Live scan screen (équivalent “ScanScreen” avec caméra) : aperçu, POST /detect,
 * rectangles sur les boîtes normalisées de l’API, animation du scan et fade-in du libellé catégorie.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { useTranslation } from "react-i18next";
import { detect } from "../api/client";
import { createShadowStyle } from "../utils/shadowStyles";

const LIVE_INTERVAL_MS = 1200;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LiveScanScreen({ onResult, onBack, navLang }) {
  const { t, i18n } = useTranslation();
  const apiLang = navLang ?? i18n.language;
  const [permission, requestPermission] = useCameraPermissions();
  const [detections, setDetections] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [viewSize, setViewSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  /** Évite les chevauchements : le state `analyzing` dans une closure de setInterval serait périmé. */
  const captureBusyRef = useRef(false);
  /** Garde `t` à jour sans recréer l’intervalle à chaque changement i18n. */
  const tRef = useRef(t);
  tRef.current = t;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const categoryFadeAnim = useRef(new Animated.Value(0)).current;

  const captureAndDetect = useCallback(async () => {
    if (!cameraRef.current || captureBusyRef.current) return;
    captureBusyRef.current = true;
    setAnalyzing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync?.({
        quality: 0.6,
        base64: false,
        mute: true,
      }) ?? await cameraRef.current?.takePicture?.({ quality: 0.6 });
      if (!photo?.uri) {
        return;
      }
      const res = await detect(photo.uri, "image/jpeg", apiLang);
      const list = res?.detections ?? [];
      setDetections(list);
      setPhotoUri(photo.uri);
      if (list.length === 0) setError(tRef.current("liveScan.noDetection"));
    } catch (e) {
      setError(e?.message || tRef.current("liveScan.detectionFailed"));
      setDetections([]);
    } finally {
      captureBusyRef.current = false;
      setAnalyzing(false);
    }
  }, [apiLang]);

  useEffect(() => {
    if (!permission?.granted) return;
    intervalRef.current = setInterval(captureAndDetect, LIVE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted, captureAndDetect]);

  useEffect(() => {
    if (analyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, useNativeDriver: Platform.OS !== "web", duration: 600 }),
          Animated.timing(scanAnim, { toValue: 0, useNativeDriver: Platform.OS !== "web", duration: 600 }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [analyzing]);

  /** Fade-in quand une catégorie / détection s’affiche après analyse */
  useEffect(() => {
    if (detections.length > 0 && !analyzing) {
      categoryFadeAnim.setValue(0);
      Animated.timing(categoryFadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    } else {
      categoryFadeAnim.setValue(0);
    }
  }, [detections, analyzing, categoryFadeAnim]);

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
        <Text style={styles.helperText}>{t("liveScan.checkingCamera")}</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>{t("liveScan.cameraRequiredLive")}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>{t("liveScan.grantPermission")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{t("liveScan.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>{t("liveScan.webOnlyMobile")}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{t("liveScan.backToScan")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanOpacity = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  const primary = detections[0];
  const categoryLabel =
    primary?.category != null && primary.category !== ""
      ? getWasteTypeLabel(primary.category)
      : primary?.label ?? "";

  return (
    <View style={styles.container}>
      {/* Zone caméra + boîtes : même taille que l’image capturée (coords API 0–1) */}
      <View
        style={styles.cameraSurface}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setViewSize({ width, height });
        }}
      >
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />

        {detections.length > 0 && viewSize.width > 0 && (
          <View style={[StyleSheet.absoluteFillObject, styles.bboxLayer]}>
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
                  key={`${i}-${left}-${top}`}
                  style={[
                    styles.bbox,
                    {
                      left,
                      top,
                      width: Math.max(w, 36),
                      height: Math.max(h, 36),
                      borderColor: catColor.bg || colors.primary,
                    },
                  ]}
                >
                  <View style={[styles.bboxLabel, { backgroundColor: catColor.bg || colors.primary }]}>
                    <Text style={styles.bboxLabelText} numberOfLines={1}>
                      {d.label} · {Math.round((d.confidence || 0) * 100)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {analyzing && (
          <Animated.View
            style={[styles.scanLine, { opacity: scanOpacity }]}
          />
        )}
      </View>

      {/* UI par-dessus (ne recouvre pas les coords des boîtes : boîtes dans cameraSurface) */}
      <View style={styles.overlay}>
        {analyzing && (
          <View style={styles.analyzingBadge}>
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
            <Text style={styles.analyzingText}>{t("liveScan.scanning")}</Text>
          </View>
        )}
        {detections.length > 0 && !analyzing && (
          <View style={styles.labelCard}>
            <Animated.View style={{ opacity: categoryFadeAnim }}>
              <Text style={styles.labelCategory}>{categoryLabel}</Text>
              <Text style={styles.labelName}>{primary?.label}</Text>
            </Animated.View>
            <Text style={styles.labelConfidence}>
              {t("liveScan.confidenceShort", {
                percent: Math.round((primary?.confidence || 0) * 100),
              })}
            </Text>
            {primary?.recycling_advice ? (
              <Text style={styles.labelAdvice} numberOfLines={2}>
                ♻️ {primary.recycling_advice}
              </Text>
            ) : null}
            <TouchableOpacity style={styles.validateBtn} onPress={handleUseResult}>
              <Text style={styles.validateBtnText}>{t("liveScan.useResult")}</Text>
            </TouchableOpacity>
          </View>
        )}
        {error && !analyzing && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>{t("liveScan.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t("liveScan.title")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraSurface: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  bboxLayer: {
    zIndex: 2,
    elevation: 2,
    pointerEvents: "none",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    zIndex: 4,
    pointerEvents: "box-none",
  },
  bbox: {
    position: "absolute",
    borderWidth: 3,
    borderRadius: 4,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
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
    zIndex: 3,
    pointerEvents: "none",
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
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  labelCategory: {
    fontSize: fontSize.title,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  labelName: { fontSize: fontSize.small, fontWeight: "600", color: colors.textSecondary, textAlign: "center" },
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
    zIndex: 5,
    pointerEvents: "box-none",
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
