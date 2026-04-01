import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import HomeScreen from "../../screens/HomeScreen";
import CameraScreen from "../../screens/CameraScreen";
import ResultScreen from "../../screens/ResultScreen";
import DashboardScreen from "../../screens/DashboardScreen";
import AssistantScreen from "../../screens/AssistantScreen";
import HistoryScreen from "../../screens/HistoryScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import LiveScanScreen from "../../screens/LiveScanScreen";
import RecyclingTipsScreen from "../../screens/RecyclingTipsScreen";

import { TabBar3Parts } from "../../components/TabBar3Parts";

const Tab = createBottomTabNavigator();

/**
 * Scan tab: Camera (photo/gallery), Live detection, or Result.
 */
function ScanTab({ route, navigation }) {
  const { i18n } = useTranslation();
  const [result, setResult] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [liveMode, setLiveMode] = useState(false);

  /** Garde `route.params.lang` aligné sur la langue i18n (Paramètres, etc.). */
  useFocusEffect(
    useCallback(() => {
      navigation.setParams({ lang: i18n.language });
    }, [i18n.language, navigation])
  );

  const navLang = route?.params?.lang ?? i18n.language;

  useEffect(() => {
    if (route?.params?.openLive) {
      setLiveMode(true);
      navigation.setParams({ openLive: false });
    }
  }, [route?.params?.openLive, navigation]);

  useEffect(() => {
    const initial = route?.params?.initialResult;
    const initialUri = route?.params?.initialPhotoUri;
    if (initial) {
      setResult(initial);
      setPhotoUri(initialUri ?? null);
      navigation.setParams({ initialResult: undefined, initialPhotoUri: undefined });
    }
  }, [route?.params?.initialResult, route?.params?.initialPhotoUri, navigation]);

  if (result) {
    return (
      <ResultScreen
        result={result}
        photoUri={photoUri}
        onBack={() => {
          setResult(null);
          setPhotoUri(null);
        }}
      />
    );
  }

  if (liveMode) {
    return (
      <LiveScanScreen
        navLang={navLang}
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
      navLang={navLang}
      onResult={(r, uri) => {
        setResult(r);
        setPhotoUri(uri);
      }}
      onSwitchToLive={() => setLiveMode(true)}
    />
  );
}

export default function AppNavigator() {
  return (
    <View style={styles.navWrapper}>
      <NavigationContainer>
        <Tab.Navigator tabBar={(props) => <TabBar3Parts {...props} />} screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Accueil" component={HomeScreen} initialParams={{ lang: "fr" }} />
          <Tab.Screen
            name="Scan"
            component={ScanTab}
            initialParams={{ lang: "fr", openLive: false }}
          />
          <Tab.Screen name="Stats" component={DashboardScreen} initialParams={{ lang: "fr" }} />
          <Tab.Screen name="Coach" component={AssistantScreen} initialParams={{ lang: "fr" }} />
          <Tab.Screen name="Conseils" component={RecyclingTipsScreen} initialParams={{ lang: "fr" }} />
          <Tab.Screen name="Historique" component={HistoryScreen} initialParams={{ lang: "fr" }} />
          <Tab.Screen name="Paramètres" component={SettingsScreen} initialParams={{ lang: "fr" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: { flex: 1 },
});

