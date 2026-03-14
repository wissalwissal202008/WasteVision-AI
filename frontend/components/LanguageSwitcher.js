/**
 * Reusable language selector: 3 buttons (🇫🇷 Français, 🇬🇧 English, 🇲🇦 العربية).
 * Use in Settings or any screen where the user can change the app language.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

export function LanguageSwitcher({ currentLang, onSelect, style }) {
  const { t } = useTranslation();

  return (
    <View style={[styles.wrapper, style]}>
      {SUPPORTED_LANGUAGES.map(({ code, labelKey, flag }) => (
        <TouchableOpacity
          key={code}
          style={[styles.button, currentLang === code && styles.buttonActive]}
          onPress={() => onSelect(code)}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>{flag}</Text>
          <Text style={[styles.label, currentLang === code && styles.labelActive]}>
            {t(labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.primary,
  },
  flag: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: fontSize.body,
    color: colors.text,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.accentForeground,
    fontWeight: "600",
  },
});
