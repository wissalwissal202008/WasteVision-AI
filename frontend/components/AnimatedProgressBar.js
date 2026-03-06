/**
 * Reusable animated progress bar for eco score, level progress, and stats.
 * Smooth animation on mount and when progress value changes.
 */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors, borderRadius } from "../constants/theme";

export function AnimatedProgressBar({
  progress = 0,
  height = 8,
  backgroundColor = colors.border,
  fillColor = colors.primary,
  style,
  ...rest
}) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, animated]);

  return (
    <View style={[styles.track, { height }, style]} {...rest}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fillColor,
            transform: [{ scaleX: animated }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    width: "100%",
    borderRadius: borderRadius.sm,
    transformOrigin: "left",
  },
});
