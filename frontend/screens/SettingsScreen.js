import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { Card, LanguageSwitcher } from "../components";
import { spacing, fontSize } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { scheduleDailyReminder, cancelDailyReminder, setupNotificationChannel } from "../services/notificationsService";
import i18n, { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, applyRTL } from "../i18n";
import { getHistory } from "../api/client";
import { KG_PLASTIC_PER_SCAN, KG_GLASS_PER_SCAN, KG_CO2_PER_SCAN } from "../services/ecoScore";
import { getOfflineAIPreference, setOfflineAIPreference, isTFLiteAvailable } from "../services/detection";
import FeedbackScreen from "./FeedbackScreen";
import HelpScreen from "./HelpScreen";
import NotificationsScreen from "./NotificationsScreen";

const NOTIFICATIONS_KEY = "@wastevision_notifications_enabled";
const PROFILE_STORAGE_KEY = "@wastevision_profile";

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { isDark, colors, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "fr");
  const [profile, setProfile] = useState({ username: "", email: "", avatarUrl: null });
  const [ecoStats, setEcoStats] = useState({ objectsScanned: 0, plasticKg: 0, co2Kg: 0 });
  const [offlineAI, setOfflineAI] = useState(false);
  const [tfliteAvailable, setTfliteAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        setNotifications(v !== "false");
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
          setProfile({ username: p.username || "", email: p.email || "", avatarUrl: p.avatarUrl || null });
          const list = Array.isArray(history) ? history : [];
          const counts = {};
          list.forEach((r) => {
            const cat = r.corrected_category || r.predicted_category || "non_recyclable";
            counts[cat] = (counts[cat] || 0) + 1;
          });
          const plasticKg = ((counts.plastic || 0) * KG_PLASTIC_PER_SCAN) + ((counts.paper_cardboard || 0) * 0.01);
          const glassKg = (counts.glass || 0) * KG_GLASS_PER_SCAN;
          const co2Kg = list.length * KG_CO2_PER_SCAN;
          setEcoStats({ objectsScanned: list.length, plasticKg, co2Kg });
        } catch {
          if (!cancelled) setEcoStats({ objectsScanned: 0, plasticKg: 0, co2Kg: 0 });
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const handleNotificationsChange = async (value) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? "true" : "false");
      if (value) await scheduleDailyReminder();
      else await cancelDailyReminder();
    } catch {}
  };

  const handleLanguageSelect = async (code) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      await i18n.changeLanguage(code);
      applyRTL(code);
      setCurrentLang(code);
      setShowLanguageModal(false);
    } catch {}
  };

  const handleDarkModeChange = async (value) => {
    await setTheme(value);
  };

  const handleOfflineAIChange = async (value) => {
    setOfflineAI(value);
    await setOfflineAIPreference(value);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile({ username: "", email: "", avatarUrl: null });
    } catch {}
    navigation?.navigate?.("Home");
  };

  const currentLanguageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)
    ? t(SUPPORTED_LANGUAGES.find((l) => l.code === currentLang).labelKey)
    : t("settings.french");

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

  const dynamicStyles = { container: { backgroundColor: colors.background }, sectionTitle: { color: colors.textSecondary }, label: { color: colors.text }, value: { color: colors.textSecondary }, valueSub: { color: colors.textSecondary }, cardBorder: { borderTopColor: colors.border }, modalBox: { backgroundColor: colors.surface }, modalTitle: { color: colors.text }, modalSubtitle: { color: colors.textSecondary }, cancelBtnText: { color: colors.textSecondary }, profileName: { color: colors.text }, profileEmail: { color: colors.textSecondary }, statValue: { color: colors.text }, statLabel: { color: colors.textSecondary }, logoutText: { color: colors.error } };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={styles.content}>
      {/* User profile */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.profileSection")}</Text>
      <Card style={styles.card}>
        <View style={styles.profileRow}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>{profile.username ? profile.username.charAt(0).toUpperCase() : "?"}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, dynamicStyles.profileName]}>{profile.username || t("profile.guest")}</Text>
            <Text style={[styles.profileEmail, dynamicStyles.profileEmail]} numberOfLines={1}>{profile.email || "—"}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder, styles.logoutBtn]} onPress={handleLogout}>
          <Text style={[styles.logoutText, dynamicStyles.logoutText]}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </Card>

      {/* Personal eco statistics */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.personalEcoStats")}</Text>
      <Card style={styles.card}>
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("dashboard.objectsRecycled")}</Text>
          <Text style={[styles.statValue, dynamicStyles.statValue]}>{ecoStats.objectsScanned}</Text>
        </View>
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("dashboard.plasticSaved")}</Text>
          <Text style={[styles.statValue, dynamicStyles.statValue]}>{ecoStats.plasticKg.toFixed(2)} kg</Text>
        </View>
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("dashboard.co2Saved")}</Text>
          <Text style={[styles.statValue, dynamicStyles.statValue]}>{ecoStats.co2Kg.toFixed(2)} kg</Text>
        </View>
      </Card>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.notifications")}</Text>
      <Card style={styles.card}>
        <View style={styles.notificationRow}>
          <View style={styles.row}>
            <Text style={[styles.label, dynamicStyles.label]}>{t("settings.enableNotifications")}</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.surface}
            />
          </View>
          <Text style={[styles.valueSub, dynamicStyles.valueSub]}>{t("settings.notificationsSub")}</Text>
        </View>
        <TouchableOpacity style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder]} onPress={() => setShowNotifications(true)}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.notificationsCenter")}</Text>
          <Text style={[styles.value, dynamicStyles.value]}>{t("settings.notificationsCenterSub")}</Text>
        </TouchableOpacity>
      </Card>

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.general")}</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.darkMode")}</Text>
          <Switch
            value={isDark}
            onValueChange={handleDarkModeChange}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={colors.surface}
          />
        </View>
        <View style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder]}>
          <View style={styles.flexCol}>
            <Text style={[styles.label, dynamicStyles.label]}>{t("settings.offlineAI")}</Text>
            <Text style={[styles.valueSub, dynamicStyles.valueSub]}>{t("settings.offlineAISub")}</Text>
          </View>
          <Switch
            value={offlineAI}
            onValueChange={handleOfflineAIChange}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={colors.surface}
            disabled={!tfliteAvailable}
          />
        </View>
        <TouchableOpacity style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder]} onPress={() => setShowLanguageModal(true)}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.language")}</Text>
          <Text style={[styles.value, dynamicStyles.value]}>{currentLanguageLabel}</Text>
        </TouchableOpacity>
      </Card>

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.help")}</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowHelp(true)}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.helpCenter")}</Text>
          <Text style={[styles.value, dynamicStyles.value]}>{t("settings.helpSub")}</Text>
        </TouchableOpacity>
      </Card>

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t("settings.about")}</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowFeedback(true)}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.feedback")}</Text>
          <Text style={[styles.value, dynamicStyles.value]}>{t("settings.feedbackSub")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder]}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.version")}</Text>
          <Text style={[styles.value, dynamicStyles.value]}>1.0.0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder, dynamicStyles.cardBorder]}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.legal")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={[styles.label, dynamicStyles.label]}>{t("settings.privacy")}</Text>
        </TouchableOpacity>
      </Card>

      <Modal visible={showLanguageModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity style={[styles.modalBox, dynamicStyles.modalBox]} activeOpacity={1} onPress={(e) => e?.stopPropagation?.()}>
            <View>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>{t("settings.languageTitle")}</Text>
              <Text style={[styles.modalSubtitle, dynamicStyles.modalSubtitle]}>{t("change_language")}</Text>
              <LanguageSwitcher currentLang={currentLang} onSelect={handleLanguageSelect} style={styles.languageSwitcher} />
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLanguageModal(false)}>
                <Text style={[styles.cancelBtnText, dynamicStyles.cancelBtnText]}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  value: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  notificationRow: {
    paddingVertical: spacing.md,
  },
  valueSub: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  languageSwitcher: {
    marginBottom: spacing.sm,
  },
  langOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 8,
  },
  langOptionActive: {
    backgroundColor: colors.accent,
  },
  langOptionText: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  langOptionTextActive: {
    color: colors.accentForeground,
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: spacing.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: fontSize.body,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: fontSize.title,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSize.small,
  },
  logoutBtn: {
    justifyContent: "center",
  },
  logoutText: {
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  statValue: {
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  flexCol: {
    flex: 1,
  },
});
