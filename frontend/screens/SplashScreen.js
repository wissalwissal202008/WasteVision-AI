import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const useNative = Platform.OS !== "web";
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: useNative,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: useNative,
      }),
    ]).start();
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: useNative,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [fadeAnim, scaleAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>WasteVision</Text>
        <Text style={styles.tagline}>Tri intelligent, impact positif</Text>
      </Animated.View>
      <View style={styles.loaderWrap}>
        <Animated.View style={[styles.loader, { transform: [{ rotate: spin }] }]} />
        <Text style={styles.loaderText}>Chargement…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: {
    fontSize: fontSize.display + 8,
    fontWeight: "800",
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: fontSize.body,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  loaderWrap: {
    position: "absolute",
    bottom: spacing.xxl * 2,
    alignItems: "center",
  },
  loader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    borderTopColor: colors.textOnPrimary,
  },
  loaderText: {
    fontSize: fontSize.caption,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: spacing.md,
  },
});
