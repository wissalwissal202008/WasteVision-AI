/**
 * Paramètres – maquette (en-tête mint, langue, préférences, qualité caméra, données, à propos).
 * Conserve la logique métier (notifications, thème, IA hors ligne, sous-écrans).
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Image,
  Alert,
  I18nManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Globe,
  CheckCircle2,
  Bell,
  Volume2,
  Moon,
  Camera,
  Trash2,
  Info,
  Shield,
  Smartphone,
  Sprout,
  ChevronRight,
} from "lucide-react-native";

import i18n, { LANGUAGE_STORAGE_KEY, applyRTL, SUPPORTED_LANGUAGES } from "../i18n";
import { useTheme } from "../context/ThemeContext";
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  setupNotificationChannel,
} from "../services/notificationsService";
import { getHistory } from "../api/client";
import { KG_PLASTIC_PER_SCAN, KG_CO2_PER_SCAN } from "../services/ecoScore";
import {
  getOfflineAIPreference,
  setOfflineAIPreference,
  isTFLiteAvailable,
} from "../services/detection";
import { isRTLLocale } from "../src/i18n/translations";
import { createShadowStyle } from "../utils/shadowStyles";
import FeedbackScreen from "./FeedbackScreen";
import HelpScreen from "./HelpScreen";
import NotificationsScreen from "./NotificationsScreen";

const NOTIFICATIONS_KEY = "@wastevision_notifications_enabled";
const PROFILE_STORAGE_KEY = "@wastevision_profile";
const SOUND_KEY = "@wastevision_sound_effects";
const CAMERA_QUALITY_KEY = "@wastevision_camera_quality";

type CameraQuality = "high" | "medium" | "low";
type Nav = { navigate?: (n: string) => void };

const LANG_NATIVE: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};
const LANG_CODE: Record<string, string> = {
  en: "GB",
  fr: "FR",
  ar: "SA",
};

export default function SettingsScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark, setTheme } = useTheme();
  const isRTL = I18nManager.isRTL || isRTLLocale(i18n.language);

  const [notifications, setNotifications] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [cameraQuality, setCameraQuality] = useState<CameraQuality>("high");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "fr");
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatarUrl: null as string | null,
  });
  const [ecoStats, setEcoStats] = useState({
    objectsScanned: 0,
    plasticKg: 0,
    co2Kg: 0,
  });
  const [offlineAI, setOfflineAI] = useState(false);
  const [tfliteAvailable, setTfliteAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        setNotifications(v !== "false");
        const s = await AsyncStorage.getItem(SOUND_KEY);
        setSoundOn(s !== "false");
        const q = await AsyncStorage.getItem(CAMERA_QUALITY_KEY);
        if (q === "medium" || q === "low" || q === "high") setCameraQuality(q);
      } catch {}
      await setupNotificationChannel();
    })();
  }, []);

  useEffect(() => {
    setCurrentLang(i18n.language || "fr");
  }, [i18n.language]);

  useFocusEffect(
    useCallback(() => {
      getOfflineAIPreference().then(setOfflineAI);
      isTFLiteAvailable().then(setTfliteAvailable);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const [rawProfile, history] = await Promise.all([
            AsyncStorage.getItem(PROFILE_STORAGE_KEY),
            getHistory(),
          ]);
          if (cancelled) return;
          const p = rawProfile ? JSON.parse(rawProfile) : {};
          setProfile({
            username: p.username || "",
            email: p.email || "",
            avatarUrl: p.avatarUrl || null,
          });
          const list = Array.isArray(history) ? history : [];
          const counts: Record<string, number> = {};
          list.forEach((r: { corrected_category?: string; predicted_category?: string }) => {
            const cat = r.corrected_category || r.predicted_category || "non_recyclable";
            counts[cat] = (counts[cat] || 0) + 1;
          });
          const plasticKg =
            (counts.plastic || 0) * KG_PLASTIC_PER_SCAN +
            (counts.paper_cardboard || 0) * 0.01;
          const co2Kg = list.length * KG_CO2_PER_SCAN;
          setEcoStats({ objectsScanned: list.length, plasticKg, co2Kg });
        } catch {
          if (!cancelled)
            setEcoStats({ objectsScanned: 0, plasticKg: 0, co2Kg: 0 });
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleNotificationsChange = async (value: boolean) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? "true" : "false");
      if (value) await scheduleDailyReminder();
      else await cancelDailyReminder();
    } catch {}
  };

  const handleSoundChange = async (value: boolean) => {
    setSoundOn(value);
    try {
      await AsyncStorage.setItem(SOUND_KEY, value ? "true" : "false");
    } catch {}
  };

  const handleLanguageSelect = async (code: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      await i18n.changeLanguage(code);
      applyRTL(code);
      setCurrentLang(code);
    } catch {}
  };

  const handleDarkModeChange = async (value: boolean) => {
    await (setTheme as unknown as (dark: boolean) => Promise<void>)(value);
  };

  const handleOfflineAIChange = async (value: boolean) => {
    setOfflineAI(value);
    await setOfflineAIPreference(value);
  };

  const setQuality = async (q: CameraQuality) => {
    setCameraQuality(q);
    try {
      await AsyncStorage.setItem(CAMERA_QUALITY_KEY, q);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile({ username: "", email: "", avatarUrl: null });
    } catch {}
    navigation?.navigate?.("Accueil");
  };

  const storageKb = Math.round(ecoStats.objectsScanned * 48);

  const clearHistoryInfo = () => {
    Alert.alert(
      t("settings.clearHistoryTitle", "Historique"),
      t(
        "settings.clearHistoryMessage",
        "Les scans sont enregistrés sur le serveur. Pour une suppression complète, contactez le support ou utilisez les outils d’administration du backend."
      )
    );
  };

  if (showFeedback) {
    return <FeedbackScreen onBack={() => setShowFeedback(false)} />;
  }
  if (showHelp) {
    return (
      <HelpScreen
        onBack={() => setShowHelp(false)}
        onOpenSupport={() => {
          setShowHelp(false);
          setShowFeedback(true);
        }}
      />
    );
  }
  if (showNotifications) {
    return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
  }

  const topPad = Math.max(insets.top, 12);
  const rowDir = { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse" };

  const cardClass =
    "mb-4 overflow-hidden rounded-3xl bg-white px-4 py-2";
  const cardShadow = createShadowStyle({
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  });

  return (
    <ScrollView
      className="flex-1 bg-[#f0fdf4]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="rounded-b-3xl bg-emerald-200/90 px-5 pb-5"
        style={{ paddingTop: topPad }}
      >
        <View className="flex-row items-center justify-between" style={rowDir}>
          <Pressable
            onPress={() => navigation?.navigate?.("Accueil")}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
          >
            <ArrowLeft
              size={22}
              color="#064e3b"
              style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-bold text-emerald-900">
            {t("tabs.Paramètres")}
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="px-5 pt-5">
        {/* Langue */}
        <View className={cardClass} style={cardShadow}>
          <View className="flex-row items-center gap-3 border-b border-gray-100 py-4" style={rowDir}>
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Globe size={20} color="#fff" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-900">
              {t(
                "settings.languageTrilingual",
                "Language / Langue / اللغة"
              )}
            </Text>
          </View>
          <View className="py-2">
            {SUPPORTED_LANGUAGES.map(({ code }) => {
              const active =
                currentLang === code || currentLang?.startsWith(code);
              return (
                <Pressable
                  key={code}
                  onPress={() => handleLanguageSelect(code)}
                  className={`mb-2 flex-row items-center justify-between rounded-2xl px-3 py-3.5 ${
                    active ? "border border-emerald-500 bg-emerald-50" : "bg-gray-50"
                  }`}
                  style={rowDir}
                >
                  <View className="flex-row items-center gap-3" style={rowDir}>
                    <Text className="text-sm font-bold text-gray-800">
                      {LANG_CODE[code]}
                    </Text>
                    <Text className="text-base text-gray-800">
                      {LANG_NATIVE[code]}
                    </Text>
                  </View>
                  {active ? (
                    <CheckCircle2 size={22} color="#10b981" strokeWidth={2} />
                  ) : (
                    <View className="w-[22px]" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Préférences */}
        <View className={cardClass} style={cardShadow}>
          <Text className="px-1 pb-2 pt-3 text-base font-bold text-gray-900">
            {t("settings.preferencesSection", "Préférences")}
          </Text>
          <View
            className="flex-row items-center justify-between border-b border-gray-100 py-4"
            style={rowDir}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3" style={rowDir}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Bell size={20} color="#ca8a04" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-semibold text-gray-900">
                  {t("settings.notifications")}
                </Text>
                <Text className="text-xs text-gray-500">
                  {t("settings.notificationsSubShort", t("settings.notificationsSub"))}
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor="#fff"
            />
          </View>
          <Pressable
            onPress={() => setShowNotifications(true)}
            className="flex-row items-center justify-between border-b border-gray-100 py-3"
            style={rowDir}
          >
            <Text className="text-sm text-emerald-700">
              {t("settings.notificationsCenter")}
            </Text>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <View
            className="flex-row items-center justify-between border-b border-gray-100 py-4"
            style={rowDir}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3" style={rowDir}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Volume2 size={20} color="#7c3aed" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-semibold text-gray-900">
                  {t("settings.soundEffects", "Effets sonores")}
                </Text>
                <Text className="text-xs text-gray-500">
                  {t("settings.soundEffectsSub", "Sons à la fin du scan")}
                </Text>
              </View>
            </View>
            <Switch
              value={soundOn}
              onValueChange={handleSoundChange}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor="#fff"
            />
          </View>
          <View className="flex-row items-center justify-between py-4" style={rowDir}>
            <View className="min-w-0 flex-1 flex-row items-center gap-3" style={rowDir}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                <Moon size={20} color="#0284c7" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-semibold text-gray-900">
                  {t("settings.darkMode")}
                </Text>
                <Text className="text-xs text-gray-500">
                  {t("settings.darkModeSub", "Interface sombre")}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Qualité caméra */}
        <View className={cardClass} style={cardShadow}>
          <View className="flex-row items-center gap-3 border-b border-gray-100 py-4" style={rowDir}>
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
              <Camera size={20} color="#0d9488" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-900">
              {t("settings.cameraQuality", "Qualité caméra")}
            </Text>
          </View>
          {(
            [
              {
                id: "high" as const,
                title: t("settings.highQuality", "Haute qualité"),
                sub: t("settings.highQualitySub", "Meilleure précision"),
              },
              {
                id: "medium" as const,
                title: t("settings.mediumQuality", "Moyenne"),
                sub: t("settings.mediumBalanced", "Équilibré"),
              },
              {
                id: "low" as const,
                title: t("settings.lowQuality", "Basse"),
                sub: t("settings.lowQualitySub", "Plus rapide"),
              },
            ] as const
          ).map((opt) => {
            const sel = cameraQuality === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setQuality(opt.id)}
                className={`mb-2 rounded-2xl px-3 py-3 ${
                  sel ? "border border-emerald-500 bg-emerald-50" : "bg-gray-50"
                }`}
              >
                <View className="flex-row items-center justify-between" style={rowDir}>
                  <View>
                    <Text className="font-semibold text-gray-900">{opt.title}</Text>
                    <Text className="text-xs text-gray-500">{opt.sub}</Text>
                  </View>
                  {sel ? (
                    <CheckCircle2 size={22} color="#10b981" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Profil */}
        <View className={cardClass} style={cardShadow}>
          <View className="flex-row items-center py-4" style={rowDir}>
            {profile.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="mr-3 h-14 w-14 rounded-full"
              />
            ) : (
              <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
                <Text className="text-2xl font-semibold text-white">
                  {profile.username
                    ? profile.username.charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </View>
            )}
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {profile.username || t("profile.guest")}
              </Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {profile.email || "—"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation?.navigate?.("Historique")}
            className="flex-row items-center justify-between border-t border-gray-100 py-3"
            style={rowDir}
          >
            <Text className="text-base text-gray-900">{t("dict.history")}</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable
            onPress={() => navigation?.navigate?.("Stats")}
            className="flex-row items-center justify-between border-t border-gray-100 py-3"
            style={rowDir}
          >
            <Text className="text-base text-gray-900">{t("profile.myImpact")}</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable
            onPress={handleLogout}
            className="items-center border-t border-gray-100 py-4"
          >
            <Text className="font-semibold text-red-500">{t("profile.logout")}</Text>
          </Pressable>
        </View>

        {/* IA hors ligne */}
        <View className={cardClass} style={cardShadow}>
          <View className="flex-row items-center justify-between py-3" style={rowDir}>
            <View className="min-w-0 flex-1 pr-2">
              <Text className="font-semibold text-gray-900">
                {t("settings.offlineAI")}
              </Text>
              <Text className="text-xs text-gray-500">{t("settings.offlineAISub")}</Text>
            </View>
            <Switch
              value={offlineAI}
              onValueChange={handleOfflineAIChange}
              trackColor={{ false: "#e5e7eb", true: "#86efac" }}
              thumbColor="#fff"
              disabled={!tfliteAvailable}
            />
          </View>
        </View>

        {/* Données */}
        <View className={cardClass} style={cardShadow}>
          <View className="flex-row items-center gap-3 border-b border-gray-100 py-3" style={rowDir}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-900">
              {t("settings.dataManagement", "Données")}
            </Text>
          </View>
          <View className="rounded-2xl bg-gray-50 px-4 py-3">
            <View
              className="flex-row items-center justify-between py-2"
              style={rowDir}
            >
              <Text className="text-gray-600">
                {t("settings.totalScansLabel", "Scans totaux")}
              </Text>
              <Text className="font-bold text-gray-900">
                {ecoStats.objectsScanned}
              </Text>
            </View>
            <View
              className="flex-row items-center justify-between py-2"
              style={rowDir}
            >
              <Text className="text-gray-600">
                {t("settings.storageUsed", "Stockage utilisé")}
              </Text>
              <Text className="font-bold text-gray-900">
                {storageKb >= 1024
                  ? `${(storageKb / 1024).toFixed(1)} MB`
                  : `${storageKb} KB`}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={clearHistoryInfo}
            className="mt-3 rounded-2xl bg-red-50 py-3.5 active:opacity-80"
          >
            <Text className="text-center font-semibold text-red-600">
              {t("settings.clearHistory", "Effacer tout l’historique")}
            </Text>
          </Pressable>
        </View>

        {/* Aide */}
        <Pressable
          onPress={() => setShowHelp(true)}
          className={`${cardClass} flex-row items-center justify-between`}
          style={cardShadow}
        >
          <Text className="font-semibold text-gray-900">
            {t("settings.helpCenter")}
          </Text>
          <ChevronRight size={20} color="#9ca3af" />
        </Pressable>

        <Pressable
          onPress={() => setShowFeedback(true)}
          className={`${cardClass} flex-row items-center justify-between`}
          style={cardShadow}
        >
          <Text className="font-semibold text-gray-900">{t("settings.feedback")}</Text>
          <ChevronRight size={20} color="#9ca3af" />
        </Pressable>

        {/* À propos */}
        <View className={cardClass} style={cardShadow}>
          <Text className="py-3 text-base font-bold text-gray-900">
            {t("settings.about")}
          </Text>
          <Pressable
            className="flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-3.5"
            style={rowDir}
          >
            <View className="flex-row items-center gap-3" style={rowDir}>
              <Info size={20} color="#6b7280" />
              <Text className="text-gray-900">{t("settings.appInfo", "Infos application")}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable
            className="mt-2 flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-3.5"
            style={rowDir}
          >
            <View className="flex-row items-center gap-3" style={rowDir}>
              <Shield size={20} color="#6b7280" />
              <Text className="text-gray-900">{t("settings.privacy")}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <View
            className="mt-2 flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-3.5"
            style={rowDir}
          >
            <View className="flex-row items-center gap-3" style={rowDir}>
              <Smartphone size={20} color="#6b7280" />
              <Text className="text-gray-900">{t("settings.version")}</Text>
            </View>
            <Text className="text-gray-500">1.0.0</Text>
          </View>
        </View>

        <View className="items-center pb-6 pt-2">
          <View className="flex-row items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
            <Sprout size={18} color="#047857" />
            <Text className="font-semibold text-emerald-900">
              {t("app_name", "WasteVision AI")}
            </Text>
          </View>
          <Text className="mt-2 text-center text-xs text-gray-500">
            {t("settings.tagline", "Recycler devient simple et agréable")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
