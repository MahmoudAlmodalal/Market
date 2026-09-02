import type { Category } from "@/types/catalog";
import type { Locale } from "@/types/i18n";

export interface LocalizedCategory extends Category {
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
}

export const MOCK_CATEGORIES: LocalizedCategory[] = [
  {
    id: 1,
    name: "زيت زيتون بلدي ومخللات",
    name_ar: "زيت زيتون بلدي ومخللات",
    name_en: "Olive Oil & Pickles",
    slug: "olive-oil",
    description: "زيت زيتون بكر ممتاز معصور على البارد ومخللات بلدية مجهزة منزلياً",
    description_ar: "زيت زيتون بكر ممتاز معصور على البارد ومخللات بلدية مجهزة منزلياً",
    description_en: "Cold-pressed extra virgin olive oil and homemade artisanal pickles",
    icon: "Droplet",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    product_count: 24,
    status: "active",
  },
  {
    id: 2,
    name: "زعتر ودقة وتوابل",
    name_ar: "زعتر ودقة وتوابل",
    name_en: "Zaatar & Spices",
    slug: "zaatar-spices",
    description: "خلطات زعتر بلدي متبل بالسمسم ودقة غريانية وتوابل طازجة",
    description_ar: "خلطات زعتر بلدي متبل بالسمسم ودقة غريانية وتوابل طازجة",
    description_en: "Authentic wild thyme zaatar blends, dukkah, and freshly ground spice mixes",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    product_count: 18,
    status: "active",
  },
  {
    id: 3,
    name: "تطريز فلاحي وأزياء",
    name_ar: "تطريز فلاحي وأزياء",
    name_en: "Tatreez & Embroidery",
    slug: "tatreez-embroidery",
    description: "مطرزات يدوية أصيلة، شالات، أثواب وقطع ديكور بتطريز تقليدي",
    description_ar: "مطرزات يدوية أصيلة، شالات، أثواب وقطع ديكور بتطريز تقليدي",
    description_en: "Handmade Palestinian cross-stitch garments, shawls, bags and wall art",
    icon: "Scissors",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80",
    product_count: 31,
    status: "active",
  },
  {
    id: 4,
    name: "فخار وخزف يدوي",
    name_ar: "فخار وخزف يدوي",
    name_en: "Pottery & Ceramics",
    slug: "pottery-ceramics",
    description: "أواني خزفية مطلية يدوياً وفخاريات تراثية للطهي والديكور",
    description_ar: "أواني خزفية مطلية يدوياً وفخاريات تراثية للطهي والديكور",
    description_en: "Hand-painted ceramic dishes, serving bowls and traditional clay cookware",
    icon: "Coffee",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    product_count: 15,
    status: "active",
  },
  {
    id: 5,
    name: "صابون وعناية طبيعية",
    name_ar: "صابون وعناية طبيعية",
    name_en: "Natural Soaps & Care",
    slug: "natural-soaps",
    description: "صابون نابلسي أصيل بزيت الزيتون الخالص وزيوت عطرية ومستحضرات طبيعية",
    description_ar: "صابون نابلسي أصيل بزيت الزيتون الخالص وزيوت عطرية ومستحضرات طبيعية",
    description_en: "Authentic olive oil Nabulsi soap bars, herbal scrubs and pure botanical care",
    icon: "Heart",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    product_count: 12,
    status: "active",
  },
  {
    id: 6,
    name: "حلويات ومعجنات بيتية",
    name_ar: "حلويات ومعجنات بيتية",
    name_en: "Home Pastries & Sweets",
    slug: "home-baking",
    description: "كعك ومعمول بالتمر، مناقيش طازجة وحلويات منزلية محضرة يومياً",
    description_ar: "كعك ومعمول بالتمر، مناقيش طازجة وحلويات منزلية محضرة يومياً",
    description_en: "Freshly baked date maamoul, Palestinian cookies and home-baked delicacies",
    icon: "Cake",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    product_count: 22,
    status: "active",
  },
  {
    id: 7,
    name: "عسل ومربيات بلدية",
    name_ar: "عسل ومربيات بلدية",
    name_en: "Honey & Preserves",
    slug: "honey-preserves",
    description: "عسل سدر وزهور جبلي خام ومربيات فواكه موسمية بدون مواد حافظة",
    description_ar: "عسل سدر وزهور جبلي خام ومربيات فواكه موسمية بدون مواد حافظة",
    description_en: "Pure mountain flower and sidr raw honey, artisan seasonal fruit preserves",
    icon: "Sun",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    product_count: 14,
    status: "active",
  },
  {
    id: 8,
    name: "تمور وفواكه مجففة",
    name_ar: "تمور وفواكه مجففة",
    name_en: "Dates & Dried Fruits",
    slug: "dates-fruits",
    description: "تمر مجدول فاخر من مزارع أريحا وتين وقطين مجفف بلدي",
    description_ar: "تمر مجدول فاخر من مزارع أريحا وتين وقطين مجفف بلدي",
    description_en: "Premium Jericho Medjool dates, dried sun figs and natural fruit snacks",
    icon: "Package",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    product_count: 19,
    status: "active",
  },
  {
    id: 9,
    name: "سلال وقش يدوي",
    name_ar: "سلال وقش يدوي",
    name_en: "Woven Crafts & Baskets",
    slug: "woven-crafts",
    description: "سلال وأطباق قش منسوجة يدوياً من قش القمح وأغصان الزيتون",
    description_ar: "سلال وأطباق قش منسوجة يدوياً من قش القمح وأغصان الزيتون",
    description_en: "Hand-woven straw baskets, decorative trays and olive wood craft items",
    icon: "ShoppingBag",
    image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80",
    product_count: 9,
    status: "active",
  },
  {
    id: 10,
    name: "أعشاب وشاي جبلي",
    name_ar: "أعشاب وشاي جبلي",
    name_en: "Herbal Teas & Infusions",
    slug: "herbal-teas",
    description: "ميرمية، بابونج، يانسون، ونعناع بلدي مجفف بعناية",
    description_ar: "ميرمية، بابونج، يانسون، ونعناع بلدي مجفف بعناية",
    description_en: "Wild mountain sage, chamomile flowers, aniseed and sun-dried organic mint",
    icon: "Feather",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    product_count: 11,
    status: "active",
  },
];

/**
 * Returns localized category view based on selected locale.
 */
export function getLocalizedCategories(locale: Locale = "ar"): Category[] {
  return MOCK_CATEGORIES.map((cat) => ({
    ...cat,
    name: locale === "ar" ? cat.name_ar : cat.name_en,
    description: locale === "ar" ? cat.description_ar : cat.description_en,
  }));
}

export function getCategoryBySlug(slug: string, locale: Locale = "ar"): Category | undefined {
  const cat = MOCK_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return undefined;
  return {
    ...cat,
    name: locale === "ar" ? cat.name_ar : cat.name_en,
    description: locale === "ar" ? cat.description_ar : cat.description_en,
  };
}

export function getCategoryById(id: number, locale: Locale = "ar"): Category | undefined {
  const cat = MOCK_CATEGORIES.find((c) => c.id === id);
  if (!cat) return undefined;
  return {
    ...cat,
    name: locale === "ar" ? cat.name_ar : cat.name_en,
    description: locale === "ar" ? cat.description_ar : cat.description_en,
  };
}
