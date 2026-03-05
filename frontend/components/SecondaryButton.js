import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

export function SecondaryButton({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontWeight: "600",
  },
});
