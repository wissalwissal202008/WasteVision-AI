/**
 * Sélecteur de langue : drapeaux + libellés natifs (English, Français, العربية).
 * Un clic appelle onSelect(code) → i18n.changeLanguage pour mettre à jour toute l’UI.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { spacing, fontSize, borderRadius } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

/** Libellés fixes pour que l’utilisateur reconnaisse toujours la langue cible. */
const NATIVE_LABELS = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

/**
 * @param {object} props
 * @param {string} props.currentLang
 * @param {(code: string) => void} props.onSelect
 * @param {object} [props.style]
 * @param {boolean} [props.horizontal] — 3 boutons côte à côte (Paramètres)
 */
export function LanguageSwitcher({ currentLang, onSelect, style, horizontal = false }) {
  const { colors } = useTheme();

  return (
    <View style={[horizontal ? styles.wrapperRow : styles.wrapperCol, style]}>
      {SUPPORTED_LANGUAGES.map(({ code, flag }) => {
        const active = currentLang === code || currentLang?.startsWith?.(code);
        return (
          <TouchableOpacity
            key={code}
            style={[
              styles.button,
              horizontal && styles.buttonHorizontal,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primaryLight : colors.surface,
              },
            ]}
            onPress={() => onSelect(code)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={NATIVE_LABELS[code]}
          >
            <Text style={styles.flag}>{flag}</Text>
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.text },
                active && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {NATIVE_LABELS[code]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperCol: {
    gap: spacing.sm,
  },
  wrapperRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  buttonHorizontal: {
    flex: 1,
    minWidth: 96,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  flag: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: "600",
    flexShrink: 1,
  },
  labelActive: {
    fontWeight: "700",
  },
});
