import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const isGuest = true; // Replace with Auth context when login is wired

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{isGuest ? t("profile.guest") : t("profile.user")}</Text>
        {!isGuest && <Text style={styles.email}>email@exemple.com</Text>}
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("Paramètres")}>
          <Text style={styles.menuLabel}>{t("dict.settings")}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate("Historique")}>
          <Text style={styles.menuLabel}>{t("dict.history")}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate("Stats")}>
          <Text style={styles.menuLabel}>{t("dict.impact")}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      {isGuest ? (
        <PrimaryButton
          title={t("profile.loginSoon")}
          onPress={() => {}}
          style={styles.loginBtn}
        />
      ) : (
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 40 },
  name: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  menuRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  menuArrow: {
    fontSize: fontSize.title,
    color: colors.textSecondary,
  },
  loginBtn: { marginTop: spacing.md },
  logoutBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: fontSize.body,
    color: colors.error,
    fontWeight: "600",
  },
});
