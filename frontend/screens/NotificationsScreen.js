import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

export default function NotificationsScreen({ onBack }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleAction = () => {
    if (onBack) onBack();
    else navigation.navigate("Accueil");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← {t("common.back")}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{t("settings.notifications")}</Text>
        <Text style={styles.subtitle}>{t("notifications.subtitle")}</Text>
      </View>
      <EmptyState
        icon="🔔"
        title={t("notifications.emptyTitle")}
        message={t("notifications.emptyMessage")}
        actionLabel={onBack ? t("notifications.backToSettings") : t("notifications.goHome")}
        onAction={handleAction}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  backBtnText: {
    fontSize: fontSize.body,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
});
