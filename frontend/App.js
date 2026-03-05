// Ordre important pour Expo Go / Android
import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens(false);

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";

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
  const rootStyle = [
    styles.root,
    Platform.OS === "web" && styles.rootWeb,
  ];
  return (
    <ErrorBoundary>
      <View style={rootStyle}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </SafeAreaProvider>
      </View>
    </ErrorBoundary>
  );
}
