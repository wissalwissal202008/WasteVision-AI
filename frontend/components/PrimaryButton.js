import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

export function PrimaryButton({ title, onPress, icon: Icon, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {Icon ? <Icon size={22} color={colors.textOnPrimary} style={styles.icon} /> : null}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  icon: { marginRight: spacing.sm },
  text: {
    color: colors.textOnPrimary,
    fontSize: fontSize.body,
    fontWeight: "600",
  },
});
