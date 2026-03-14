/**
 * i18n: French, English, Arabic.
 * Language is persisted in AsyncStorage (@wastevision_lang) and applied in App.js.
 * Arabic uses RTL (Right-to-Left) layout.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { Platform, I18nManager } from "react-native";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ar: { translation: ar },
};

let deviceLocale = "fr";
try {
  if (typeof Localization.getLocales === "function") {
    const first = Localization.getLocales()[0];
    if (first?.languageCode) deviceLocale = first.languageCode.slice(0, 2);
  }
} catch {
  deviceLocale = "fr";
}
const supported = ["fr", "en", "ar"];
const fallbackLng = supported.includes(deviceLocale) ? deviceLocale : "fr";

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng: "fr",
  supportedLngs: supported,
  interpolation: {
    escapeValue: false,
  },
});

export const LANGUAGE_STORAGE_KEY = "@wastevision_lang";
export const SUPPORTED_LANGUAGES = [
  { code: "fr", labelKey: "settings.french", flag: "🇫🇷" },
  { code: "en", labelKey: "settings.english", flag: "🇬🇧" },
  { code: "ar", labelKey: "settings.arabic", flag: "🇲🇦" },
];

/**
 * Apply RTL layout for Arabic. Call after changeLanguage('ar') or on app load.
 * On native, RTL may require app restart to take full effect.
 */
export function applyRTL(lang) {
  if (Platform.OS === "web") return;
  const isRTL = lang === "ar";
  if (typeof I18nManager.forceRTL === "function") {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(true);
  }
}

export default i18n;
