/**
 * Eco Q&A for coach. Questions (keywords) map to answers in fr, en, ar.
 */
function normalizePhrase(phrase) {
  if (phrase == null || typeof phrase !== "string") return "";
  return phrase.toLowerCase().trim().replace(/\s+/g, " ");
}

export const ECO_QA = [
  {
    keywords: [
      "recycle plastic", "recycling plastic", "plastic recycling", "how to recycle plastic",
      "recycler plastique", "plastique", "bac plastique", "bac jaune", "recyclage plastique",
      "بلاستيك", "إعادة تدوير البلاستيك",
    ],
    answerFr: "Rince les emballages plastique et enlève les bouchons si ta commune l'accepte. Bouteilles et contenants vont en général dans le bac jaune (recyclage). Vérifie les consignes de ta commune.",
    answerEn: "Rinse plastic containers and remove caps if your local program accepts them. Most bottles and containers go in the yellow or recycling bin. Check your municipality for exact rules.",
    answerAr: "اشطف العبوات البلاستيكية وانزع الأغطية إن قبلت بلديتك ذلك. الزجاجات والحاويات تذهب عادة إلى الحاوية الصفراء (إعادة التدوير). راجع تعليمات بلديتك.",
  },
  {
    keywords: [
      "recycle glass", "glass recycling", "glass bin", "where glass",
      "verre", "recycler verre", "bac verre", "bac vert", "bouteille verre",
      "زجاج", "إعادة تدوير الزجاج",
    ],
    answerFr: "Les bouteilles et pots en verre vont dans le bac vert ou conteneur à verre. Rince-les et ne mélange pas avec d'autres matières. Les bouchons peuvent aller ailleurs selon ta commune.",
    answerEn: "Glass bottles and jars go in the green or glass bin. Rinse them and do not mix with other materials. Lids may go in a different bin depending on your area.",
    answerAr: "الزجاجات والبرطمانات الزجاجية تذهب إلى الحاوية الخضراء أو حاوية الزجاج. اشطفها ولا تخلطها بمواد أخرى. الأغطية قد تذهب لحاوية أخرى حسب منطقتك.",
  },
  {
    keywords: [
      "co2", "carbon", "impact", "co2 impact", "carbon impact", "environmental impact",
      "impact co2", "carbone", "impact environnemental", "recyclage impact",
      "ثاني أكسيد الكربون", "تأثير",
    ],
    answerFr: "Le recyclage réduit le CO₂ en évitant de produire à partir de matières premières. Chaque objet recyclé économise environ 0,05 kg de CO₂. Ton tableau de bord montre ton impact total.",
    answerEn: "Recycling reduces CO₂ by avoiding new production from raw materials. Each item you recycle saves about 0.05 kg of CO₂. Your dashboard shows your total impact.",
    answerAr: "إعادة التدوير تقلل من CO₂ بتجنب الإنتاج الجديد من المواد الخام. كل عنصر تعيد تدويره يوفر نحو 0,05 كغ من CO₂. لوحة التحكم تعرض تأثيرك الإجمالي.",
  },
  {
    keywords: [
      "paper", "cardboard", "recycle paper",
      "papier", "carton", "recycler papier", "bac bleu", "bac papier",
      "ورق", "كرتون",
    ],
    answerFr: "Le papier et le carton vont dans le bac bleu. Plie les cartons pour gagner de la place. Enlève le film plastique ou le scotch quand c'est possible.",
    answerEn: "Paper and cardboard go in the blue or paper bin. Flatten boxes to save space. Remove plastic wrap or tape when possible.",
    answerAr: "الورق والكرتون يذهبان إلى الحاوية الزرقاء. اطوِ الكراتين لتوفير المساحة. أزل الغلاف البلاستيكي أو الشريط عند الإمكان.",
  },
  {
    keywords: [
      "metal", "recycle metal", "cans",
      "métal", "recycler métal", "canette", "ferraille", "bac métal",
      "معدن", "علب",
    ],
    answerFr: "Les canettes et l'aluminium vont dans le bac jaune ou bac métal. Rince-les. Dans certaines zones, aluminium et acier sont collectés ensemble.",
    answerEn: "Metal cans and foil go in the yellow or metal bin. Rinse them. In some areas, aluminum and steel are collected together.",
    answerAr: "علب المعدن والألومنيوم تذهب إلى الحاوية الصفراء أو حاوية المعدن. اشطفها. في بعض المناطق يُجمع الألومنيوم والصلب معاً.",
  },
  {
    keywords: [
      "organic", "compost", "food waste", "biowaste",
      "organique", "compost", "déchet alimentaire", "bac marron", "bac vert organique",
      "عضوي", "سماد", "نفايات غذائية",
    ],
    answerFr: "Les déchets organiques (restes alimentaires, déchets de jardin) vont dans le bac marron ou vert (compost). Évite les sacs plastique dans le bac.",
    answerEn: "Organic waste (food scraps, garden waste) goes in the brown or green bin for composting. Avoid plastic bags in the bin.",
    answerAr: "النفايات العضوية (بقايا الطعام، نفايات الحديقة) تذهب إلى الحاوية البنية أو الخضراء (السماد). تجنب الأكياس البلاستيكية في الحاوية.",
  },
  {
    keywords: [
      "not recyclable", "non recyclable", "trash", "throw away",
      "non recyclable", "poubelle", "ordure", "déchet non recyclable", "bac gris",
      "غير قابل لإعادة التدوير", "قمامة",
    ],
    answerFr: "Ce qui n'est pas recyclable va dans la poubelle ordinaire (bac gris/noir). En cas de doute, consulte les consignes de ta commune ou scanne l'objet avec WasteVision.",
    answerEn: "Items that are not recyclable go in the general waste bin. When in doubt, check your local guidelines or use WasteVision to scan the item.",
    answerAr: "ما لا يمكن إعادة تدويره يذهب إلى حاوية النفايات العامة. عند الشك، راجع تعليمات منطقتك أو امسح العنصر بتطبيق WasteVision.",
  },
  {
    keywords: [
      "eco score", "points", "badges", "gamification",
      "points éco", "points eco", "score éco", "badges", "niveau", "gagner points",
      "نقاط بيئية", "شارات",
    ],
    answerFr: "Tu gagnes des points éco à chaque scan : 10 pour plastique, papier, métal, organique ; 15 pour le verre ; 5 pour les corrections. Débloque des niveaux (Waste Warrior, Eco Hero) et des badges dans ton tableau de bord.",
    answerEn: "You earn eco points for each scan: 10 for plastic, paper, metal, organic; 15 for glass; 5 for corrections. Unlock levels (Waste Warrior, Eco Hero) and badges on your dashboard.",
    answerAr: "تحصل على نقاط بيئية عند كل مسح: 10 للبلاستيك والورق والمعدن والعضوي؛ 15 للزجاج؛ 5 للتصحيحات. افتح المستويات والشارات في لوحة التحكم.",
  },
];

function getAnswerInLang(item, lang) {
  if (lang === "ar" && item.answerAr) return item.answerAr;
  if (lang === "en" && item.answerEn) return item.answerEn;
  return item.answerFr;
}

/**
 * Find best matching answer for a phrase. Optional lang: "fr" | "en" | "ar".
 */
export function getEcoAnswer(phrase, lang = "fr") {
  const normalized = normalizePhrase(phrase);
  if (!normalized) return null;
  for (const item of ECO_QA) {
    for (const kw of item.keywords) {
      if (normalized.includes(normalizePhrase(kw))) return getAnswerInLang(item, lang);
    }
  }
  return null;
}
