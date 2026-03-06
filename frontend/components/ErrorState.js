import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import { SecondaryButton } from "./SecondaryButton";

export function ErrorState({ icon = "⚠️", title, message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <SecondaryButton title="Réessayer" onPress={onRetry} style={styles.button} />
      ) : null}
    </View>
  );
}

export function NoInternetState({ onRetry }) {
  return (
    <ErrorState
      icon="📡"
      title="Pas de connexion"
      message="Vérifiez votre connexion internet et réessayez."
      onRetry={onRetry}
    />
  );
}

export function ServerErrorState({ onRetry }) {
  return (
    <ErrorState
      icon="🔧"
      title="Service indisponible"
      message="Le serveur ne répond pas. Réessayez dans un instant."
      onRetry={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    minHeight: 180,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
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
  },
  button: {
    marginTop: spacing.lg,
  },
});
