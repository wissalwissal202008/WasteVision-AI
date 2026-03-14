// Ordre important pour Expo Go / Android
import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens(false);

import "./constants/theme";
import "./i18n";

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import i18n, { LANGUAGE_STORAGE_KEY, applyRTL } from "./i18n";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import OnboardingScreen from "./screens/OnboardingScreen";
import SplashScreen from "./screens/SplashScreen";
import { ThemeProvider } from "./context/ThemeContext";

const ONBOARDING_KEY = "@wastevision_onboarding_done";
const SPLASH_DURATION_MS = 2200;

function ErrorFallback({ error }) {
  return (
    <View style={styles.errorRoot}>
      <Text style={styles.errorTitle}>Erreur</Text>
      <Text style={styles.errorText}>{error?.message || "Une erreur est survenue."}</Text>
    </View>
  );
}

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootWeb: {
    minHeight: "100vh",
  },
  errorRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F7F5",
  },
  errorTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  errorText: { fontSize: 14, color: "#5C635C", textAlign: "center" },
});

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [onboarding, lang] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
        ]);
        setHasSeenOnboarding(onboarding === "true");
        if (lang && ["fr", "en", "ar"].includes(lang)) {
          i18n.changeLanguage(lang);
          applyRTL(lang);
        }
      } catch {
        setHasSeenOnboarding(true);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
    setHasSeenOnboarding(true);
  };

  const rootStyle = [styles.root, Platform.OS === "web" && styles.rootWeb];

  if (!splashDone) {
    return (
      <ErrorBoundary>
        <View style={rootStyle}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <SplashScreen />
          </SafeAreaProvider>
        </View>
      </ErrorBoundary>
    );
  }

  if (hasSeenOnboarding === null) {
    return (
      <ErrorBoundary>
        <View style={[styles.root, Platform.OS === "web" && styles.rootWeb, { justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7F5" }]}>
          <Text style={styles.errorText}>Chargement...</Text>
        </View>
      </ErrorBoundary>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <ErrorBoundary>
        <View style={rootStyle}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <OnboardingScreen onDone={handleOnboardingDone} />
          </SafeAreaProvider>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <View style={rootStyle}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </SafeAreaProvider>
        </View>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
