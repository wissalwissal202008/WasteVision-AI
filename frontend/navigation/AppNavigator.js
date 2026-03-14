import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, fontSize } from "../constants/theme";
import HomeScreen from "../screens/HomeScreen";
import CameraScreen from "../screens/CameraScreen";
import ResultScreen from "../screens/ResultScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AssistantScreen from "../screens/AssistantScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LiveScanScreen from "../screens/LiveScanScreen";
import RecyclingTipsScreen from "../screens/RecyclingTipsScreen";
const Tab = createBottomTabNavigator();

/**
 * Scan tab: Camera (photo/gallery), Live detection, or Result.
 */
function ScanTab({ route, navigation }) {
  const [result, setResult] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    if (route?.params?.openLive) {
      setLiveMode(true);
      navigation.setParams({ openLive: false });
    }
  }, [route?.params?.openLive, navigation]);

  if (result) {
    return (
      <ResultScreen
        result={result}
        photoUri={photoUri}
        onBack={() => { setResult(null); setPhotoUri(null); }}
      />
    );
  }
  if (liveMode) {
    return (
      <LiveScanScreen
        onResult={(r, uri) => {
          setResult(r);
          setPhotoUri(uri);
          setLiveMode(false);
        }}
        onBack={() => setLiveMode(false)}
      />
    );
  }
  return (
    <CameraScreen
      onResult={(r, uri) => {
        setResult(r);
        setPhotoUri(uri);
      }}
      onSwitchToLive={() => setLiveMode(true)}
    />
  );
}

function TabIcon({ label, focused }) {
  const emoji = {
    Accueil: "🏠",
    Scan: "📷",
    Stats: "📊",
    Coach: "💬",
    Conseils: "♻️",
    Historique: "📋",
    Profil: "👤",
    Paramètres: "⚙️",
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {emoji[label] || "•"}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { t } = useTranslation();
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
          tabBarLabel: t("tabs." + route.name),
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Scan" component={ScanTab} />
        <Tab.Screen name="Stats" component={DashboardScreen} />
        <Tab.Screen name="Coach" component={AssistantScreen} />
        <Tab.Screen name="Conseils" component={RecyclingTipsScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
        <Tab.Screen name="Paramètres" component={SettingsScreen} />
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
