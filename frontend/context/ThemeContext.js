import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getThemeColors } from "../constants/theme";

export const THEME_STORAGE_KEY = "@wastevision_theme";

const ThemeContext = createContext({ isDark: false, colors: getThemeColors(false), setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        setIsDark(saved === "dark");
      } catch {
        // keep default false
      }
      setLoaded(true);
    })();
  }, []);

  const setTheme = async (dark) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {}
  };

  const value = useMemo(
    () => ({
      isDark,
      colors: getThemeColors(isDark),
      setTheme,
      loaded,
    }),
    [isDark, loaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { isDark: false, colors: getThemeColors(false), setTheme: () => {}, loaded: true };
  return ctx;
}
