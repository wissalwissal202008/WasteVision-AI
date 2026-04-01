/**
 * i18n: French, English, Arabic.
 * Language is persisted in AsyncStorage (@wastevision_lang) and applied in App.js.
 * Arabic uses RTL (Right-to-Left) layout.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform, I18nManager } from "react-native";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import { resources as dictResources, isRTLLocale } from "./src/i18n/translations";

const resources = {
  fr: { translation: { ...fr, dict: dictResources.fr.translation.dict } },
  en: { translation: { ...en, dict: dictResources.en.translation.dict } },
  ar: { translation: { ...ar, dict: dictResources.ar.translation.dict } },
};

/** Langue par défaut : français (surchargée par AsyncStorage dans App.js si l’utilisateur a choisi une langue). */
const supported = ["fr", "en", "ar"];

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  supportedLngs: supported,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export const LANGUAGE_STORAGE_KEY = "@wastevision_lang";
export const SUPPORTED_LANGUAGES = [
  { code: "fr", labelKey: "settings.french", flag: "🇫🇷" },
  { code: "en", labelKey: "settings.english", flag: "🇬🇧" },
  { code: "ar", labelKey: "settings.arabic", flag: "🇲🇦" },
];

/**
 * Applique la direction de l’interface : arabe → RTL (miroir), sinon LTR.
 * - **Native** : `I18nManager.allowRTL(true)` puis `forceRTL(true)` si langue arabe,
 *   sinon `forceRTL(false)`. Certaines versions Android/iOS peuvent nécessiter un
 *   redémarrage de l’app pour un retour LTR parfait après l’arabe.
 * - **Web** : `document.documentElement.dir = 'rtl' | 'ltr'`.
 */
export function applyRTL(lang) {
  const rtl = isRTLLocale(lang || "");

  if (Platform.OS === "web") {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
      const base = (lang && String(lang).split("-")[0].toLowerCase()) || "fr";
      document.documentElement.setAttribute("lang", base);
    }
    return;
  }

  if (typeof I18nManager.allowRTL === "function") {
    I18nManager.allowRTL(true);
  }
  if (typeof I18nManager.forceRTL === "function") {
    I18nManager.forceRTL(rtl);
  }
}

/** À chaque changement de langue i18next, garde I18nManager / le DOM alignés. */
i18n.on("languageChanged", (lng) => {
  applyRTL(lng);
});

applyRTL(i18n.language);

export { isRTLLocale, RTL_LOCALES } from "./src/i18n/translations";

export default i18n;
