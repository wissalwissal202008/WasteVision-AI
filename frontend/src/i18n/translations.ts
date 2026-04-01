/**
 * Dictionnaire multilingue (FR par défaut dans i18n.js, EN, AR).
 * Clés accessibles via t('dict.xxx') — préfixe `dict` pour ne pas écraser
 * les objets `settings`, `scan`, `history` des fichiers locales/*.json.
 *
 * RTL : voir applyRTL() dans frontend/i18n.js (I18nManager.forceRTL pour ar).
 */
export const RTL_LOCALES = ["ar"] as const;

export type RTLLanguageCode = (typeof RTL_LOCALES)[number];

export function isRTLLocale(lang: string): boolean {
  if (!lang || typeof lang !== "string") return false;
  const base = lang.split("-")[0].toLowerCase();
  return (RTL_LOCALES as readonly string[]).includes(base);
}

/**
 * Ressources i18next (structure standard). Le contenu plat demandé est sous `translation.dict`.
 */
export const resources = {
  fr: {
    translation: {
      dict: {
        scan: "Scanner",
        history: "Historique",
        impact: "Impact",
        settings: "Paramètres",
        detected: "Déchet détecté",
        advice: "Conseil",
        co2_saved: "CO2 économisé",
        select_lang: "Changer la langue",
        plastic: "Plastique",
        glass: "Verre",
        paper: "Papier",
        recyclingTips: "Conseils de recyclage",
        other: "Autre",
        impact_saved_today: "Vous avez sauvé {{grams}} g de CO₂ aujourd'hui !",
      },
    },
  },
  en: {
    translation: {
      dict: {
        scan: "Scan",
        history: "History",
        impact: "Impact",
        settings: "Settings",
        detected: "Waste detected",
        advice: "Advice",
        co2_saved: "CO2 saved",
        select_lang: "Change language",
        plastic: "Plastic",
        glass: "Glass",
        paper: "Paper",
        recyclingTips: "Recycling tips",
        other: "Other",
        impact_saved_today: "You saved {{grams}} g of CO₂ today!",
      },
    },
  },
  ar: {
    translation: {
      dict: {
        scan: "مسح",
        history: "السجل",
        impact: "التأثير",
        settings: "الإعدادات",
        detected: "تم اكتشاف نفايات",
        advice: "نصيحة",
        co2_saved: "CO2 توفير",
        select_lang: "تغيير اللغة",
        plastic: "بلاستيك",
        glass: "زجاج",
        paper: "ورق",
        recyclingTips: "نصائح إعادة التدوير",
        other: "أخرى",
        impact_saved_today: "لقد وفّرت {{grams}} غرامًا من CO₂ اليوم!",
      },
    },
  },
} as const;
