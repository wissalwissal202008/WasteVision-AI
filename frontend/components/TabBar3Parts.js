/**
 * Bottom tab bar with 3 parts matching Figma design:
 * - Left: Home (active = green + light green blob)
 * - Center: Scan (elevated teal circle, no label)
 * - Right: Learn/Conseils (active = green + blob)
 * Icons: lucide-react-native (Leaf, Camera, BookOpen).
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Leaf, Camera, BookOpen } from "lucide-react-native";
import { colors } from "../constants/theme";
import { createShadowStyle } from "../utils/shadowStyles";

const ACCUEIL_GROUP = ["Accueil", "Stats", "Coach", "Historique", "Paramètres"];

function isAccueilFocused(state) {
  const name = state.routes[state.index]?.name;
  return ACCUEIL_GROUP.includes(name);
}

export function TabBar3Parts({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const currentRouteName = state.routes[state.index]?.name;

  const items = [
    { name: "Accueil", focused: isAccueilFocused(state) },
    { name: "Scan", focused: currentRouteName === "Scan" },
    { name: "Conseils", focused: currentRouteName === "Conseils" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {items.map(({ name, focused }) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const isCenter = name === "Scan";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerWrap}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onPress}
                  style={styles.centerButton}
                >
                  <Camera size={26} color="#ffffff" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            );
          }

          const label = name === "Scan" ? t("dict.scan") : t("tabs." + name);
          const SideIcon = name === "Accueil" ? Leaf : BookOpen;
          const iconColor = focused ? colors.primary : colors.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.sideItem}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <SideIcon size={22} color={iconColor} strokeWidth={2.2} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 64,
    ...createShadowStyle({
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 12,
    }),
  },
  sideItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#d1fae5",
    ...createShadowStyle({
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    }),
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -8,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...createShadowStyle({
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    }),
  },
});
