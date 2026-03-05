import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize } from "../constants/theme";

import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import ResultScreen from "../screens/ResultScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AssistantScreen from "../screens/AssistantScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Tab = createBottomTabNavigator();

/**
 * Flux Scan sans Stack Navigator (évite le crash "property S of undefined" sur Expo Go).
 * Bascule entre Camera et Result via state.
 */
function ScanTab() {
  const [result, setResult] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  if (result) {
    return (
      <ResultScreen
        result={result}
        photoUri={photoUri}
        onBack={() => setResult(null)}
      />
    );
  }
  return (
    <CameraScreen
      onResult={(r, uri) => {
        setResult(r);
        setPhotoUri(uri);
      }}
    />
  );
}

function TabIcon({ label, focused }) {
  const icons = {
    Accueil: "home",
    Scan: "camera",
    Stats: "bar-chart",
    Coach: "message-circle",
    Historique: "list",
  };
  const name = icons[label] || "circle";
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {label === "Accueil" && (focused ? "🏠" : "🏠")}
        {label === "Scan" && (focused ? "📷" : "📷")}
        {label === "Stats" && (focused ? "📊" : "📊")}
        {label === "Coach" && (focused ? "💬" : "💬")}
        {label === "Historique" && (focused ? "📋" : "📋")}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <View style={styles.navWrapper}>
      <NavigationContainer>
        <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Scan" component={ScanTab} />
        <Tab.Screen name="Stats" component={DashboardScreen} />
        <Tab.Screen name="Coach" component={AssistantScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
      </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    height: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabEmojiFocused: {
    opacity: 1,
  },
});
