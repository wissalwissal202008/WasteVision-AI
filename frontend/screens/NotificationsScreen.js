import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { EmptyState } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

export default function NotificationsScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Alertes et rappels</Text>
      </View>
      <EmptyState
        icon="🔔"
        title="Aucune notification"
        message="Vos rappels de tri et actualités apparaîtront ici lorsque les notifications seront activées."
        actionLabel="Voir l'accueil"
        onAction={() => navigation.navigate("Accueil")}
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
