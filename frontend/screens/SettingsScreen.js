import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Card } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";
import FeedbackScreen from "./FeedbackScreen";
import HelpScreen from "./HelpScreen";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Général</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={colors.surface}
          />
        </View>
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={styles.label}>Mode sombre</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={colors.surface}
          />
        </View>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Langue</Text>
          <Text style={styles.value}>Français</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>Aide</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowHelp(true)}>
          <Text style={styles.label}>Centre d’aide</Text>
          <Text style={styles.value}>FAQ, guide, support</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>À propos</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowFeedback(true)}>
          <Text style={styles.label}>Donner mon avis</Text>
          <Text style={styles.value}>Bug, suggestion, note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder]}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.rowBorder]}>
          <Text style={styles.label}>Mentions légales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Confidentialité</Text>
        </TouchableOpacity>
      </Card>
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
});
