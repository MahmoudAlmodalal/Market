/**
 * Bilingual catalog mappings for Palestinian marketplace demo data.
 * Used to provide localized Arabic names, categories, and descriptions
 * when viewing the site in Arabic.
 */

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Bath & Body": "العناية والجسم",
  "Home & Living": "المنزل والديكور",
  "Ceramics & Pottery": "خزف وفخار",
  "Jewelry & Accessories": "مجوهرات وإكسسوارات",
  "Soaps": "صابون طبيعي",
  "Handcrafts": "أعمال يدوية",
};

export const SELLER_TRANSLATIONS: Record<string, string> = {
  "Sara Handmade": "منتجات سارة اليدوية",
  "Gaza Crafts": "حرف ومشغولات غزة",
  "Artisan Olive Wood": "حرفيو خشب الزيتون",
  "Seller Shop": "متجر البائع",
};

export const PRODUCT_TRANSLATIONS: Record<
  string,
  { name_ar: string; description_ar?: string }
> = {
  "Natural Lavender Soap": {
    name_ar: "صابون اللافندر الطبيعي",
    description_ar: "صابون لافندر طبيعي معصور على البارد وغني بالزيوت العطرية العضوية لترطيب وتهدئة البشرة.",
  },
  "Olive Oil Soap Bar": {
    name_ar: "صابون زيت زيتون بلدي أصيل",
    description_ar: "صابون زيت زيتون فلسطيني بكر نقي مصنوع بالطريقة التقليدية لترطيب ونعومة فائقة.",
  },
  "Dead Sea Mineral Body Scrub": {
    name_ar: "مقشر أملاح البحر الميت للجسم",
    description_ar: "مقشر ملحي غني بالمعادن الطبيعية المستخرجة من البحر الميت لتجديد البشرة وإزالة الخلايا الميتة.",
  },
  "Organic Herbal Bath Salts": {
    name_ar: "أملاح استحمام عشبية عضوية",
    description_ar: "مزيج مهدئ ومريح من أملاح الاستحمام مع بتلات الورد والبابونج المجفف.",
  },
  "Handmade Ceramic Coffee Cup": {
    name_ar: "فنجان قهوة فخاري مصنوع يدوياً",
    description_ar: "فنجان قهوة مصنوع من الخزف والصلصال ومطلي يدوياً بزخارف زهرية تراثية.",
  },
  "Decorative Clay Serving Bowl": {
    name_ar: "وعاء تقديم فخاري مزخرف",
    description_ar: "طبق تقديم فخاري كبير مرسوم يدوياً بتصاميم فلسطينية تقليدية للسفرة والديكور.",
  },
  "Embroidered Tatreez Cushion Cover": {
    name_ar: "غطاء وسادة بتطريز فلاحي أصيل",
    description_ar: "غطاء وسادة مزين بتطريز فلسطيني يدوي أصيل بخيوط حريرية فاخرة.",
  },
  "Handwoven Table Runner": {
    name_ar: "مفرش طاولة منسوج يدوياً",
    description_ar: "مفرش طاولة تراثي محبوك على النول التقليدي بألوان ونقوش شرقية دافئة.",
  },
  "Carved Olive Wood Salad Bowls Set": {
    name_ar: "طقم أوعية سلطة من خشب الزيتون",
    description_ar: "طقم مكون من وعائين منحوتين يدوياً من خشب الزيتون القديم بنقوش خشبية طبيعية جذابة.",
  },
  "Olive Wood Coasters (Set of 6)": {
    name_ar: "قواعد أكواب من خشب الزيتون (طقم 6 قطع)",
    description_ar: "قواعد أكواب ريفية فريدة مقطوعة ومصقولة من أغصان شجر الزيتون الطبيعي.",
  },
  "Handmade Olive Wood Cutting Board": {
    name_ar: "لوح تقطيع وتقديم من خشب الزيتون",
    description_ar: "لوح تقطيع صلب وفاخر معالج بزيوت طبيعية آمنة تماماً للأطعمة والمطبخ.",
  },
  "Traditional Olive Wood Rosary / Misbaha": {
    name_ar: "مسبحة تقليدية من خشب الزيتون",
    description_ar: "مسبحة تراثية متقنة مكونة من 33 حبة مصقولة بعناية من خشب الزيتون المبارك.",
  },
  "Lavender Soap": {
    name_ar: "صابون اللافندر",
    description_ar: "صابون لافندر طبيعي ونقي.",
  },
  "Embroidered Purse": {
    name_ar: "حقيبة يد مطرزة",
    description_ar: "حقيبة يد فاخرة مشغولة بحرير التطريز اليدوي.",
  },
};

/**
 * Helper to localize a product name based on current locale.
 */
export function getLocalizedProductName(name: string, locale: string): string {
  if (locale === "ar") {
    return PRODUCT_TRANSLATIONS[name]?.name_ar || name;
  }
  return name;
}

/**
 * Helper to localize a product description based on current locale.
 */
export function getLocalizedProductDescription(
  name: string,
  originalDesc: string,
  locale: string
): string {
  if (locale === "ar") {
    return PRODUCT_TRANSLATIONS[name]?.description_ar || originalDesc;
  }
  return originalDesc;
}

/**
 * Helper to localize a category name based on current locale.
 */
export function getLocalizedCategoryName(name: string, locale: string): string {
  if (locale === "ar") {
    return CATEGORY_TRANSLATIONS[name] || name;
  }
  return name;
}

/**
 * Helper to localize a seller business name based on current locale.
 */
export function getLocalizedSellerName(name: string, locale: string): string {
  if (locale === "ar") {
    return SELLER_TRANSLATIONS[name] || name;
  }
  return name;
}
