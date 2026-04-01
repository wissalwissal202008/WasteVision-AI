/**
 * Accueil – maquette WasteVision AI (hero mint, carte scan, galerie / live, conseils, bandeau).
 * React Native + TypeScript + NativeWind + lucide-react-native.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  I18nManager,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Leaf,
  History,
  Settings,
  TrendingUp,
  Camera,
  Sparkles,
  Image as ImageIcon,
  Zap,
  BookOpen,
  ChevronRight,
} from "lucide-react-native";

import { colors } from "../constants/colors";
import { predict } from "../api/client";
import { isRTLLocale } from "../src/i18n/translations";
import { createShadowStyle } from "../utils/shadowStyles";

type HomeNav = {
  navigate: (name: string, params?: Record<string, unknown>) => void;
};

export type HomeScreenProps = {
  navigation: HomeNav;
  route: { params?: { lang?: string } };
};

const ICON_DARK = "#1B4332";
const ICON_MUTED = "#047857";

const shadowHeaderBtn = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
});
const shadowScanHero = createShadowStyle({
  shadowColor: "#0f766e",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.28,
  shadowRadius: 20,
  elevation: 12,
});
const shadowHomeCard = createShadowStyle({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
});

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL || isRTLLocale(i18n.language);
  const apiLang = route?.params?.lang ?? i18n.language;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScan = () => navigation.navigate("Scan");
  const handleLiveDetection = () =>
    navigation.navigate("Scan", { openLive: true });

  const handleImportImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.permission", "Permission"),
        t(
          "scan.galleryPermission",
          "Photo library access is required."
        )
      );
      return;
    }
    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (pickResult.canceled || !pickResult.assets?.[0]) return;
    const asset = pickResult.assets[0];
    const uri = asset.uri;
    const mimeType = asset.mimeType || "image/jpeg";
    setIsAnalyzing(true);
    try {
      const result = (await predict(uri, mimeType, apiLang)) as Record<
        string,
        unknown
      >;
      const payload = {
        ...result,
        waste_category:
          result.waste_category ?? result.waste_type,
        recycling_advice:
          result.recycling_advice ??
          result.recycling_instructions ??
          result.recommended_bin,
      };
      navigation.navigate("Scan", {
        initialResult: payload,
        initialPhotoUri: uri,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(
        t("common.error", "Error"),
        msg || t("result.predictFailed", "Prediction failed. Is the backend running?")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const rowMain = isRTL ? "flex-row-reverse" : "flex-row";
  const tipsRowDir = isRTL ? "flex-row-reverse" : "flex-row";
  const planetRowDir = isRTL ? "flex-row-reverse" : "flex-row";
  const rowDirStyle = { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse" };

  return (
    <ScrollView
      className="flex-1 bg-[#F0FAF5]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={colors.gradientHeader as [string, string, ...string[]]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: "hidden",
          paddingHorizontal: 24,
          paddingBottom: 32,
          paddingTop: Math.max(insets.top, 12) + 8,
        }}
      >
        <View
          className="mb-8 w-full items-center justify-between"
          style={rowDirStyle}
        >
          <View className="min-w-0 flex-shrink flex-row items-center gap-2" style={rowDirStyle}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/40">
              <Leaf size={22} color={ICON_DARK} strokeWidth={2.2} />
            </View>
            <Text
              className="text-xl font-bold text-[#065f46]"
              style={{
                fontFamily: Platform.select({
                  ios: "System",
                  android: "sans-serif-medium",
                  default: undefined,
                }),
              }}
              numberOfLines={1}
            >
              {t("app_name", "WasteVision AI")}
            </Text>
          </View>
          <View className="flex-row gap-2" style={rowDirStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("tabs.Historique", "History")}
              onPress={() => navigation.navigate("Historique")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
              style={shadowHeaderBtn}
            >
              <History size={20} color={ICON_DARK} strokeWidth={2} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("tabs.Paramètres", "Settings")}
              onPress={() => navigation.navigate("Paramètres")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
              style={shadowHeaderBtn}
            >
              <Settings size={20} color={ICON_DARK} strokeWidth={2} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("tabs.Stats", "Stats")}
              onPress={() => navigation.navigate("Stats")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
              style={shadowHeaderBtn}
            >
              <TrendingUp size={20} color={ICON_DARK} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View className="items-center px-1">
          <Text
            className="mb-2 text-center text-[28px] font-bold leading-8 text-[#064e3b]"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("home.heroScanTitle")}
          </Text>
          <Text
            className="text-center text-base leading-[22px] text-[#047857]"
            style={{
              paddingHorizontal: 8,
              writingDirection: isRTL ? "rtl" : "ltr",
            }}
          >
            {t("home.heroScanSubtitle")}
          </Text>
        </View>
      </LinearGradient>

      <View className="px-6 pt-8">
        <Pressable
          onPress={handleScan}
          disabled={isAnalyzing}
          className="mb-8 overflow-hidden rounded-[32px] active:opacity-95"
          style={shadowScanHero}
        >
          <LinearGradient
            colors={colors.gradientScanCta as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: "center",
              paddingHorizontal: 32,
              paddingVertical: 40,
            }}
          >
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-white/30">
              <Camera size={40} color="#ffffff" strokeWidth={2} />
            </View>
            <View className="mb-3 flex-row items-center gap-1.5 rounded-full bg-white/25 px-3.5 py-2">
              <Sparkles size={14} color="#ffffff" strokeWidth={2.4} />
              <Text className="text-[13px] font-semibold text-white">
                {t("home.aiPoweredBadge")}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white">
              {t("home.startScanning")}
            </Text>
            <Text className="mt-1 text-sm text-white/90">
              {t("home.tapOpenCamera")}
            </Text>
          </LinearGradient>
        </Pressable>

        <View className={`mb-4 gap-4 ${rowMain}`}>
          <Pressable
            onPress={handleImportImage}
            disabled={isAnalyzing}
            className="flex-1 rounded-3xl border border-black/[0.06] bg-white p-5 active:opacity-90"
            style={shadowHomeCard}
          >
            <View className="mb-3 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#d1fae5]">
              <ImageIcon size={26} color="#059669" strokeWidth={2} />
            </View>
            <Text className="text-center text-sm font-bold text-[#1B4332]">
              {t("home.openGalleryCard")}
            </Text>
            <Text className="mt-1 text-center text-xs text-[#6b7280]">
              {t("home.scanFromPhotos")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLiveDetection}
            className="flex-1 rounded-3xl border border-black/[0.06] bg-white p-5 active:opacity-90"
            style={shadowHomeCard}
          >
            <View className="mb-3 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#bfdbfe]">
              <Zap size={26} color="#2563eb" strokeWidth={2} />
            </View>
            <Text className="text-center text-sm font-bold text-[#1B4332]">
              {t("home.liveDetectionCard")}
            </Text>
            <Text className="mt-1 text-center text-xs text-[#6b7280]">
              {t("home.realtimeScan")}
            </Text>
          </Pressable>
        </View>

        {isAnalyzing ? (
          <Text className="mb-4 text-center text-sm text-[#6b7280]">
            {t("scan.analyzing")}
          </Text>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate("Conseils")}
          className={`mb-8 items-center rounded-[20px] bg-white p-4 active:opacity-90 ${tipsRowDir}`}
          style={{ gap: 12 }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#fef3c7]">
            <BookOpen size={22} color="#d97706" strokeWidth={2} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-[#1B4332]">
              {t("home.recyclingTipsCard")}
            </Text>
            <Text className="mt-0.5 text-xs text-[#6b7280]">
              {t("home.recyclingTipsCardSub")}
            </Text>
          </View>
          <ChevronRight
            size={22}
            color="#9ca3af"
            strokeWidth={2}
            style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          />
        </Pressable>

        <View
          className={`items-center justify-center rounded-full bg-[#ecfdf5] px-5 py-3.5 ${planetRowDir}`}
          style={{ gap: 8 }}
        >
          <Leaf size={18} color={ICON_MUTED} strokeWidth={2} />
          <Text className="flex-shrink text-center text-sm font-medium text-[#047857]">
            {t("home.planetMessage")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
