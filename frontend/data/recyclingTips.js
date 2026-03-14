/**
 * Recycling tips for daily reminder notifications.
 * One tip per weekday (1 = Sunday … 7 = Saturday). Used by notificationsService.
 */
export const RECYCLING_TIPS = {
  fr: [
    "Rincez les emballages avant de les jeter pour faciliter le recyclage.",
    "Pliez les cartons pour gagner de la place dans le bac bleu.",
    "Les bouchons des bouteilles en plastique se recyclent avec la bouteille.",
    "Un déchet par bac : ne mélangez pas les matières pour ne pas contaminer le tri.",
    "En cas de doute, scannez avec WasteVision ou consultez les consignes de votre commune.",
    "Le verre se dépose en conteneur ou bac vert : ne pas mélanger avec la vaisselle.",
    "Les canettes et boîtes en métal vont dans le bac jaune après rinçage.",
  ],
  en: [
    "Rinse packaging before throwing it away to make recycling easier.",
    "Flatten cardboard to save space in the blue bin.",
    "Plastic bottle caps can be recycled with the bottle.",
    "One type per bin: don't mix materials to avoid contaminating the sort.",
    "When in doubt, scan with WasteVision or check your local guidelines.",
    "Glass goes in the bottle bank or green bin—don't mix with crockery.",
    "Cans and metal tins go in the yellow bin after rinsing.",
  ],
  ar: [
    "اشطف العبوات قبل رميها لتسهيل إعادة التدوير.",
    "اطوِ الكرتون لتوفير المساحة في الحاوية الزرقاء.",
    "أغطية الزجاجات البلاستيكية تُعاد تدويرها مع الزجاجة.",
    "نوع واحد لكل حاوية: لا تخلط المواد حتى لا تتلوث الفرز.",
    "عند الشك، امسح بتطبيق WasteVision أو راجع تعليمات بلديتك.",
    "الزجاج يُوضَع في حاوية الزجاج أو الخضراء—لا تخلط مع الأواني.",
    "علب المعدن تذهب إلى الحاوية الصفراء بعد الشطف.",
  ],
};

/** Get tip for weekday (1–7). lang: "fr" | "en" | "ar". */
export function getTipForWeekday(weekday, lang = "fr") {
  const tips = RECYCLING_TIPS[lang] || RECYCLING_TIPS.fr;
  const index = Math.max(0, Math.min(weekday - 1, tips.length - 1));
  return tips[index];
}
