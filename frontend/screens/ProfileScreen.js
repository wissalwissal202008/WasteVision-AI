import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, fontSize } from "../constants/theme";

export default function ProfileScreen({ navigation }) {
  const isGuest = true; // À remplacer par un contexte Auth quand login sera branché

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{isGuest ? "Invité" : "Utilisateur"}</Text>
        {!isGuest && <Text style={styles.email}>email@exemple.com</Text>}
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("Paramètres")}>
          <Text style={styles.menuLabel}>Paramètres</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuRow, styles.menuRowBorder]} onPress={() => navigation.navigate("Historique")}>
          <Text style={styles.menuLabel}>Historique des scans</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("Stats")}>
          <Text style={styles.menuLabel}>Mon impact</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      {isGuest ? (
        <PrimaryButton
          title="Se connecter (bientôt)"
          onPress={() => {}}
          style={styles.loginBtn}
        />
      ) : (
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
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
