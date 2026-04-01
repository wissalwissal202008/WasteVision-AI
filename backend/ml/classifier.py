"""
Classifier wrapper + conseils de recyclage multilingues (fr / en / ar).

Les poids du modèle sont chargés via `ml.model_loader` ; les textes d’aide
sont centralisés dans `ADVICE_MAP` pour /predict et /detect.
"""

from ml.model_loader import get_model, predict_proba

__all__ = [
    "get_model",
    "predict_proba",
    "ADVICE_MAP",
    "normalize_advice_lang",
    "recycling_advice_for_category",
]

# Clés = config.CATEGORY_NAMES (plastic, paper_cardboard, glass, metal, organic, non_recyclable)
ADVICE_MAP: dict[str, dict[str, str]] = {
    "plastic": {
        "fr": (
            "Videz et rincez l’emballage. Retirez les bouchons si votre commune le demande. "
            "Placez dans le bac ou la borne recyclage (souvent jaune). "
            "N’enfermez pas les recyclables dans un sac plastique classique."
        ),
        "en": (
            "1. Empty and rinse the item. 2. Remove caps if your local program accepts them separately. "
            "3. Place in the yellow/recycling bin. 4. Do not bag recyclables in plastic bags."
        ),
        "ar": (
            "اشطف العبوات البلاستيكية وأزل الأغطية إن طلبت البلدية ذلك، ثم ضعها في حاوية إعادة التدوير "
            "(الصندوق الأصفر). لا تضع المواد القابلة لإعادة التدوير داخل أكياس بلاستيكية عادية."
        ),
    },
    "paper_cardboard": {
        "fr": (
            "Aplatissez les cartons. Retirez film plastique et ruban adhésif si possible. "
            "Gardez le papier sec et propre ; placez-le au bac papier/carton (souvent bleu)."
        ),
        "en": (
            "1. Flatten cardboard boxes to save space. 2. Remove plastic wrap or tape when possible. "
            "3. Keep paper dry and clean. 4. Place in the blue/paper bin."
        ),
        "ar": (
            "سطح صناديق الكرتون لتوفير المساحة. أزل الأغلفة البلاستيكية والشريط قدر الإمكان. "
            "احتفظ بالورق جافاً ونظيفاً وضعه في حاوية الورق أو الكرتون (الأزرق حسب نظامك المحلي)."
        ),
    },
    "glass": {
        "fr": (
            "Rincez le contenant, retirez les bouchons selon les consignes locales. "
            "Verre au bac verre ou point d’apport ; séparez les couleurs si demandé. "
            "Ne mélangez pas avec céramique ou autres matériaux."
        ),
        "en": (
            "1. Rinse the container. 2. Remove caps and place in the correct bin (often separate). "
            "3. Place glass in the green/glass bin or bottle bank. 4. Do not mix with ceramics or other materials."
        ),
        "ar": (
            "اشطف عبوات الزجاج وأزل الأغطية وضعها في الحاوية المناسبة. افصل الألوان إذا طُلب منك ذلك. "
            "لا تخلط الزجاج مع الخزف أو مواد أخرى."
        ),
    },
    "metal": {
        "fr": (
            "Videz et rincez boîtes et conserves. Barquettes et aluminium si acceptés chez vous. "
            "Placez dans le bac métaux ou le recyclage selon votre commune."
        ),
        "en": (
            "1. Empty and rinse cans and tins. 2. Place aluminium foil and trays in the same bin if accepted. "
            "3. Put in the yellow or dedicated metal bin. 4. Do not include other materials."
        ),
        "ar": (
            "افرغ العلب والقواطير المعدنية واشطفها. يمكن جمع رقائق الألمنيوم والصواني مع العلب إن قبلتها البلدية. "
            "ضعها في حاوية المعادن أو الصندوق الأصفر حسب التعليمات المحلية."
        ),
    },
    "organic": {
        "fr": (
            "Utilisez un petit bac de cuisine et videz-le souvent. Pas de sac plastique non compostable. "
            "Déchets alimentaires et biodéchets au bac organique (marron ou vert selon les lieux)."
        ),
        "en": (
            "1. Use a small kitchen bin and empty it regularly. 2. Do not put plastic bags in the organic bin "
            "unless they are compostable. 3. Place in the brown or green organic bin. "
            "4. Check local rules for what is accepted (e.g. meat, dairy)."
        ),
        "ar": (
            "استخدم سلة صغيرة للبقايا العضوية في المطبخ وأفرغها بانتظام. لا تضع أكياس بلاستيكية عادية "
            "ما لم تكن قابلة للتحلل الحيوي. ضع النفايات العضوية في الحاوية البنية أو الخضراء وفق قواعد منطقتك."
        ),
    },
    "non_recyclable": {
        "fr": (
            "Placez dans la poubelle résiduelle (bac gris/noir). Évitez de mélanger avec le recyclage "
            "pour ne pas contaminer le tri. Réduisez et réutilisez lorsque c’est possible."
        ),
        "en": (
            "1. Place in the general waste (grey/black) bin. 2. Avoid putting recyclables in the same bag. "
            "3. When possible, reduce and reuse to minimise waste."
        ),
        "ar": (
            "هذا النوع غير قابل لإعادة التدوير عادة في الحاويات المعتادة. ضعه في سلة النفايات العامة. "
            "تجنب خلطه مع التجميع الأصفر أو الأزرق حتى لا تلوث فرزاً صالحاً."
        ),
    },
}


def normalize_advice_lang(lang: str | None, default: str = "fr") -> str:
    """Retourne 'fr', 'en' ou 'ar' pour choisir la variante dans ADVICE_MAP."""
    if not lang or not str(lang).strip():
        return default
    code = str(lang).strip().split("-")[0].lower()
    if code in ("fr", "en", "ar"):
        return code
    return default


def recycling_advice_for_category(category_key: str, lang: str | None = None) -> str:
    """
    Conseil de recyclage court pour une catégorie et une langue.
    `lang` optionnel : défaut français (aligné avec POST /predict et /detect).
    """
    lng = normalize_advice_lang(lang, "fr")
    key = category_key if category_key in ADVICE_MAP else "non_recyclable"
    text = ADVICE_MAP[key].get(lng) or ADVICE_MAP[key]["fr"]
    return text[:500]
