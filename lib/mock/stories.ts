import type { Story, PromotionalBanner } from "@/types/catalog";
import type { Locale } from "@/types/i18n";

export interface LocalizedStory extends Story {
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  seller_name_ar?: string;
  seller_name_en?: string;
  badge_ar?: string;
  badge_en?: string;
  avatar?: string;
  has_unseen?: boolean;
}

export interface LocalizedPromotionalBanner extends PromotionalBanner {
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  description_ar?: string;
  description_en?: string;
  cta_text_ar?: string;
  cta_text_en?: string;
  badge_ar?: string;
  badge_en?: string;
}

export const MOCK_STORIES: LocalizedStory[] = [
  {
    id: 1,
    title: "موسم الزيتون الجديد",
    title_ar: "موسم الزيتون الجديد",
    title_en: "New Olive Harvest",
    subtitle: "عصرة أولى طازجة",
    subtitle_ar: "عصرة أولى طازجة",
    subtitle_en: "Fresh first cold press",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    seller_id: 1,
    seller_name: "معصرة البركة",
    seller_name_ar: "معصرة البركة",
    seller_name_en: "Al-Baraka Press",
    badge: "جديد",
    badge_ar: "جديد",
    badge_en: "New",
    link: "/catalog?category=1",
    has_unseen: true,
  },
  {
    id: 2,
    title: "معمول العيد الفاخر",
    title_ar: "معمول العيد الفاخر",
    title_en: "Artisan Maamoul",
    subtitle: "بالسمن والتمر",
    subtitle_ar: "بالسمن والتمر",
    subtitle_en: "Pure ghee & date paste",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    seller_id: 6,
    seller_name: "أم أحمد للحلويات",
    seller_name_ar: "أم أحمد للحلويات",
    seller_name_en: "Um Ahmad Kitchen",
    badge: "مميز",
    badge_ar: "مميز",
    badge_en: "Featured",
    link: "/catalog?category=6",
    has_unseen: true,
  },
  {
    id: 3,
    title: "تطريز يدوي أصيل",
    title_ar: "تطريز يدوي أصيل",
    title_en: "Handmade Tatreez",
    subtitle: "قطع تراثية محدودة",
    subtitle_ar: "قطع تراثية محدودة",
    subtitle_en: "Limited heritage pieces",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    seller_id: 3,
    seller_name: "تراث الأصالة",
    seller_name_ar: "تراث الأصالة",
    seller_name_en: "Asala Heritage",
    badge: "حصري",
    badge_ar: "حصري",
    badge_en: "Exclusive",
    link: "/catalog?category=3",
    has_unseen: true,
  },
  {
    id: 4,
    title: "صابون الغار والزيتون",
    title_ar: "صابون الغار والزيتون",
    title_en: "Laurel & Olive Soap",
    subtitle: "عناية طبيعية 100%",
    subtitle_ar: "عناية طبيعية 100%",
    subtitle_en: "100% natural pure care",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    seller_id: 5,
    seller_name: "صبانة الشكعة",
    seller_name_ar: "صبانة الشكعة",
    seller_name_en: "Shakaa Soap",
    badge: "عرض",
    badge_ar: "عرض",
    badge_en: "Offer",
    link: "/catalog?category=5",
    has_unseen: false,
  },
  {
    id: 5,
    title: "عسل سدر جبلي خام",
    title_ar: "عسل سدر جبلي خام",
    title_en: "Raw Sidr Honey",
    subtitle: "جني مباشر من المنحل",
    subtitle_ar: "جني مباشر من المنحل",
    subtitle_en: "Direct from mountain hives",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    seller_id: 7,
    seller_name: "مناحل السهل",
    seller_name_ar: "مناحل السهل",
    seller_name_en: "Al-Sahl Apiaries",
    badge: "نقي",
    badge_ar: "نقي",
    badge_en: "Pure",
    link: "/catalog?category=7",
    has_unseen: false,
  },
  {
    id: 6,
    title: "خزف وفخار الخليل",
    title_ar: "خزف وفخار الخليل",
    title_en: "Hebron Pottery",
    subtitle: "رسم يدوي متقن",
    subtitle_ar: "رسم يدوي متقن",
    subtitle_en: "Intricate hand-painted ceramics",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    seller_id: 4,
    seller_name: "خزفيات الخليل",
    seller_name_ar: "خزفيات الخليل",
    seller_name_en: "Hebron Pottery",
    badge: "يدوي",
    badge_ar: "يدوي",
    badge_en: "Artisan",
    link: "/catalog?category=4",
    has_unseen: false,
  },
];

export const MOCK_HERO_BANNERS: LocalizedPromotionalBanner[] = [
  {
    id: 1,
    title: "موسم قطاف الزيتون والخيرات البلدية",
    title_ar: "موسم قطاف الزيتون والخيرات البلدية",
    title_en: "Olive Harvest & Artisanal Treasures",
    subtitle: "زيت زيتون بكر معصور على البارد ومنتجات ريفية طازجة",
    subtitle_ar: "زيت زيتون بكر معصور على البارد ومنتجات ريفية طازجة",
    subtitle_en: "Cold-pressed extra virgin olive oil & fresh rural delicacies",
    description: "اكتشف تشكيلة الزيت البلدي، المخللات والزعتر من المزارعين والأسر المنتجة مباشرة إلى باب بيتك.",
    description_ar: "اكتشف تشكيلة الزيت البلدي، المخللات والزعتر من المزارعين والأسر المنتجة مباشرة إلى باب بيتك.",
    description_en: "Discover fresh seasonal olive oil, artisan pickles and mountain zaatar delivered directly from local makers.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
    cta_text: "تسوق منتجات الموسم",
    cta_text_ar: "تسوق منتجات الموسم",
    cta_text_en: "Shop Harvest Specials",
    link: "/catalog?category=1",
    badge: "موسم جديد",
    badge_ar: "موسم جديد",
    badge_en: "New Harvest",
  },
  {
    id: 2,
    title: "أصالة التطريز الفلسطيني المعاصر",
    title_ar: "أصالة التطريز الفلسطيني المعاصر",
    title_en: "Authentic Palestinian Tatreez",
    subtitle: "شالات، أثواب وقطع فنية يدوية بأيدي حرفيات ماهرات",
    subtitle_ar: "شالات، أثواب وقطع فنية يدوية بأيدي حرفيات ماهرات",
    subtitle_en: "Hand-embroidered shawls, bags, and heritage home decor",
    description: "كل غرزة تحكي قصة أصالة وتراث، ادعم المشاريع النسوية وحرفنا التقليدية.",
    description_ar: "كل غرزة تحكي قصة أصالة وتراث، ادعم المشاريع النسوية وحرفنا التقليدية.",
    description_en: "Every cross-stitch tells a rich heritage story. Support women-led local embroidery cooperatives.",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
    cta_text: "استكشف المطرزات",
    cta_text_ar: "استكشف المطرزات",
    cta_text_en: "Explore Tatreez",
    link: "/catalog?category=3",
    badge: "حرف يدوية",
    badge_ar: "حرف يدوية",
    badge_en: "Handmade",
  },
  {
    id: 3,
    title: "مخبوزات وحلويات الأسر المنتجة الطازجة",
    title_ar: "مخبوزات وحلويات الأسر المنتجة الطازجة",
    title_en: "Fresh Home-Baked Pastries & Sweets",
    subtitle: "معمول بالتمر، كعك بالسمسم وحلويات منزلية بالسمن البلدي",
    subtitle_ar: "معمول بالتمر، كعك بالسمسم وحلويات منزلية بالسمن البلدي",
    subtitle_en: "Handmade date maamoul, aniseed cookies & pure ghee sweets",
    description: "محضرة بكل حب وعناية ونظافة فائقة، لتصلك دافئة وطازجة بنفس اليوم.",
    description_ar: "محضرة بكل حب وعناية ونظافة فائقة، لتصلك دافئة وطازجة بنفس اليوم.",
    description_en: "Lovingly crafted in home kitchens with finest ingredients and delivered fresh daily.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    cta_text: "اطلب حلوياتك الآن",
    cta_text_ar: "اطلب حلوياتك الآن",
    cta_text_en: "Order Fresh Bakery",
    link: "/catalog?category=6",
    badge: "طازج يومياً",
    badge_ar: "طازج يومياً",
    badge_en: "Daily Fresh",
  },
];

export function getLocalizedStories(locale: Locale = "ar"): Story[] {
  return MOCK_STORIES.map((s) => ({
    ...s,
    title: locale === "ar" ? s.title_ar : s.title_en,
    subtitle: locale === "ar" ? s.subtitle_ar : s.subtitle_en,
    seller_name: locale === "ar" ? s.seller_name_ar : s.seller_name_en,
    badge: locale === "ar" ? s.badge_ar : s.badge_en,
  }));
}

export function getLocalizedBanners(locale: Locale = "ar"): PromotionalBanner[] {
  return MOCK_HERO_BANNERS.map((b) => ({
    ...b,
    title: locale === "ar" ? b.title_ar : b.title_en,
    subtitle: locale === "ar" ? b.subtitle_ar : b.subtitle_en,
    description: locale === "ar" ? b.description_ar : b.description_en,
    cta_text: locale === "ar" ? b.cta_text_ar : b.cta_text_en,
    badge: locale === "ar" ? b.badge_ar : b.badge_en,
  }));
}
