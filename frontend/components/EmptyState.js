import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";

/**
 * Empty state : illustration + titre + message + bouton d’action.
 * Utilisation : <EmptyState icon="📭" title="Aucune tâche" message="…" actionLabel="Créer" onAction={…} />
 */
export function EmptyState({
  icon = "📭",
  title,
  message,
  action,
  actionLabel,
  onAction,
}) {
  const hasButton = action != null || (actionLabel && onAction);

  return (
    <View style={styles.wrap}>
      <View style={styles.illustrationWrap}>
        <Text style={styles.illustration}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {hasButton && (
        <View style={styles.action}>
          {action != null
            ? action
            : (
              <PrimaryButton
                title={actionLabel}
                onPress={onAction}
              />
            )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    minHeight: 220,
  },
  illustrationWrap: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  illustration: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize.subhead,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.lg,
    minWidth: 200,
    alignSelf: "center",
  },
});
