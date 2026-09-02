import type {
  User,
  SellerProfileData,
  PaymentMethod,
  LoyaltyTier,
} from "@/types/user";
import type { Address } from "@/types/order";
import type { Product } from "@/types/catalog";

/**
 * Mock Customer User Account
 */
export const MOCK_CUSTOMER: User = {
  id: 1,
  name: "محمود أحمد",
  email: "mahmoud@souqi.market",
  phone: "+970 59-912-3456",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  default_neighborhood: "الرمال",
  default_city: "غزة",
  created_at: "2024-01-15T00:00:00Z",
};

/**
 * Mock Seller Profile & Store Information
 */
export const MOCK_SELLER_PROFILE: SellerProfileData = {
  id: 101,
  business_name: "مشغل الياسمين للمنتجات الطبيعية",
  description:
    "مشغل عائلي متخصص في صناعة الصابون البلدي المعتق من زيت الزيتون الفلسطيني الصافي والزيوت العطرية العضوية ومستحضرات العناية الطبيعية بالبشرة.",
  neighborhood: "وسط البلد",
  city: "رام الله",
  phone: "+970 59-911-2233",
  logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=256&q=80",
  is_verified: true,
  is_active: true,
};

/**
 * Mock Seller User Account
 */
export const MOCK_SELLER_USER: User = {
  id: 101,
  name: "ياسمين النابلسي",
  email: "yasmeen@souqi.market",
  phone: "+970 59-911-2233",
  role: "seller",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  default_neighborhood: "وسط البلد",
  default_city: "رام الله",
  created_at: "2023-08-10T00:00:00Z",
};

/**
 * Mock Admin User Account
 */
export const MOCK_ADMIN_USER: User = {
  id: 999,
  name: "إدارة سوقي",
  email: "admin@souqi.market",
  phone: "+970 59-900-0000",
  role: "admin",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
  default_neighborhood: "الرمال",
  default_city: "غزة",
  created_at: "2023-01-01T00:00:00Z",
};

/**
 * Loyalty Tier & Rewards Program Mock Data
 */
export const MOCK_LOYALTY_TIER: LoyaltyTier = {
  tier: "gold",
  points: 850,
  next_tier_points: 1000,
  benefits: [
    "توصيل مجاني لـ 3 طلبات شهرياً من أي متجر",
    "أولوية قصوى في معالجة وتجهيز الطلبات",
    "خصم حصري 10% على كافة متاجر الحرف اليدوية",
    "دعم فني وتواصل مباشر مع فريق سوقي على مدار الساعة",
  ],
};

/**
 * Saved User Addresses Mock Data
 */
export const MOCK_SAVED_ADDRESSES: Address[] = [
  {
    id: 1,
    name: "المنزل",
    street: "شارع عمر المختار بجانب بنك فلسطين، عمارة الأمل، ط 3",
    neighborhood: "حي الرمال",
    city: "غزة",
    phone: "+970 59-912-3456",
    is_default: true,
    notes: "المصعد يعمل - الشقة على اليمين",
  },
  {
    id: 2,
    name: "العمل / المكتب",
    street: "برج الوحدة التجاري، الطابق الخامس، مكتب 502",
    neighborhood: "شارع الوحدة",
    city: "غزة",
    phone: "+970 59-912-3456",
    is_default: false,
    notes: "التسليم في أوقات الدوام من 8 صباحاً حتى 3 مساءً",
  },
  {
    id: 3,
    name: "بيت العائلة",
    street: "شارع اللبابيدي مقابل مدرسة الهدى",
    neighborhood: "حي النصر",
    city: "غزة",
    phone: "+970 59-988-7766",
    is_default: false,
    notes: "الرجاء الاتصال قبل التوصيل بنصف ساعة",
  },
];

/**
 * Saved Payment Methods Mock Data
 */
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_cod",
    type: "cod",
    label: "الدفع نقداً عند الاستلام (COD)",
    description: "ادفع نقداً لمندوب التوصيل عند استلام الطلب وفحصه",
    is_default: true,
  },
  {
    id: "pm_card_1",
    type: "card",
    label: "بطاقة فيزا •••• 4242",
    description: "تنتهي في 08/28",
    is_default: false,
  },
  {
    id: "pm_apple_pay",
    type: "apple_pay",
    label: "Apple Pay",
    description: "دفع سريع وآمن بنقرة واحدة",
    is_default: false,
  },
];

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  orderUpdates?: boolean;
  promotions?: boolean;
  sellerMessages?: boolean;
  emailSummary?: boolean;
  smsAlerts?: boolean;
  order_updates?: boolean;
  sms_enabled?: boolean;
  email_enabled?: boolean;
  promotional_offers?: boolean;
}

export const MOCK_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promotions: true,
  sellerMessages: true,
  emailSummary: false,
  smsAlerts: true,
};

/**
 * Mock Seller Product Inventory Dataset (10 products for Yasmeen Studio)
 */
export const MOCK_SELLER_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "صابون زيت زيتون بلدي باللافندر الطبيعي",
    description: "صابون عضوي فاخر مصنوع يدوياً من زيت الزيتون البكر الممتاز المعصور على البارد مع خلاصة زهور اللافندر المهدئة للبشرة.",
    price: "25.00",
    unit: "قطعة",
    stock_state: "available",
    stock_quantity: 15,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["عضوي", "صناعة يدوية", "لافندر", "عناية طبيعية"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-02-20T14:30:00Z",
    primary_image: "https://images.unsplash.com/photo-1607006314644-8854c86d8a39?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "مقشر الجسم العضوي بالقهوة واللوز",
    description: "مقشر مقوي للبشرة ومجدد للخلايا بمطحون حبوب البن المحمصة مع زيت اللوز الحلو وفيتامين E.",
    price: "35.00",
    unit: "عبوة 250 مل",
    stock_state: "low_stock",
    stock_quantity: 4,
    available_quantity: 4,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["مقشر", "قهوة", "ترطيب", "عضوي"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-02-22T16:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "مرطب شفاه طبيعي بشمع النحل وزبدة الشيا",
    description: "بلسم شفاه علاجي ومغذي بخلاصة شمع عسل السدر الطبيعي وزبدة الشيا النقية وزيت جوز الهند البكر.",
    price: "15.00",
    unit: "قطعة",
    stock_state: "out_of_stock",
    stock_quantity: 0,
    available_quantity: 0,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["مرطب", "شمع نحل", "شفاه"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-02-25T12:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "زيت لافندر عطري نقي مستخلص بالتقطير (50 مل)",
    description: "زيت عطري مهدئ ومعقم مستخرج من زهور اللافندر البرية للاسترخاء والعناية بالبشرة والشعر.",
    price: "45.00",
    unit: "زجاجة قطارة",
    stock_state: "available",
    stock_quantity: 20,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["زيوت عطرية", "لافندر", "نقي"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2024-01-18T14:00:00Z",
    updated_at: "2024-02-26T10:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "شاي أعشاب جبلية طبيعية مهدئة للأعصاب",
    description: "مزيج متوازن من الميرمية والزعتر البري والبابونج والنعناع المجفف يدوياً تحت أشعة الشمس.",
    price: "18.00",
    unit: "كيس 150 غرام",
    stock_state: "available",
    stock_quantity: 35,
    seller_name: "مشغل الياسمين",
    category: {
      id: 1,
      name: "مأكولات ومشروبات",
      slug: "food-sweets",
    },
    tags: ["أعشاب", "ميرمية", "شاي طبيعي"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-02-27T11:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 12,
    name: "مجموعة العناية الشاملة بالبشرة (3 منتجات)",
    description: "باقة تحتوي على صابون اللافندر، مقشر القهوة، وزيت اللافندر في صندوق هدايا أنيق من خشب الصنوبر.",
    price: "95.00",
    unit: "طقم كامل",
    stock_state: "available",
    stock_quantity: 8,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["طقم هدايا", "عناية", "عرض خاص"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-28T09:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 13,
    name: "صابون الغار وحبة البركة المعتق",
    description: "صابون تقليدي معتق لمدة 9 أشهر بخلاصة زيت الغار النقي وحبة البركة لتنقية البشرة وفروة الرأس.",
    price: "22.00",
    unit: "قطعة",
    stock_state: "low_stock",
    stock_quantity: 3,
    available_quantity: 3,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["غار", "حبة البركة", "تقليدي"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2024-02-05T12:00:00Z",
    updated_at: "2024-02-28T14:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 14,
    name: "كريم الورد الجوري لترطيب اليدين (مسودة)",
    description: "كريم مهدئ فائق الترطيب بخلاصة ماء الورد الجوري المقطر وزيت اللوز العضوي.",
    price: "28.00",
    unit: "أنبوب 75 مل",
    stock_state: "available",
    stock_quantity: 12,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["ترطيب", "ورد", "كريم"],
    is_featured: false,
    is_ai_suggested: true,
    status: "draft",
    created_at: "2024-02-15T15:00:00Z",
    updated_at: "2024-02-28T16:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1556228722-d0b779a557b4?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 15,
    name: "غسول الوجه برغوة النعناع والشاي الأخضر (قيد المراجعة)",
    description: "غسول لطيف لتنظيف البشرة بعمق والتحكم بالإفرازات الدهنية.",
    price: "32.00",
    unit: "عبوة مضخة 150 مل",
    stock_state: "available",
    stock_quantity: 25,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["غسول", "شاي أخضر", "نعناع"],
    is_featured: false,
    is_ai_suggested: false,
    status: "under_review",
    created_at: "2024-02-20T09:00:00Z",
    updated_at: "2024-02-28T17:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 16,
    name: "صابون النعناع المنعش للبشرة الدهنية (مؤرشف)",
    description: "صابون صيفي منعش بخلاصة النعناع الطبيعي.",
    price: "20.00",
    unit: "قطعة",
    stock_state: "out_of_stock",
    stock_quantity: 0,
    available_quantity: 0,
    seller_name: "مشغل الياسمين",
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["نعناع", "صيف"],
    is_featured: false,
    is_ai_suggested: false,
    status: "archived",
    created_at: "2023-11-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1607006314644-8854c86d8a39?auto=format&fit=crop&w=600&q=80",
  },
];

const SELLER_PRODUCTS_STORAGE_KEY = "souqi_seller_products_v1";

/**
 * Gets seller products from localStorage or default
 */
export function getMockSellerProducts(): Product[] {
  if (typeof window === "undefined") {
    return MOCK_SELLER_PRODUCTS;
  }
  try {
    const raw = localStorage.getItem(SELLER_PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_SELLER_PRODUCTS));
      return MOCK_SELLER_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return MOCK_SELLER_PRODUCTS;
  } catch {
    return MOCK_SELLER_PRODUCTS;
  }
}

/**
 * Saves seller products to localStorage
 */
export function saveMockSellerProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error("Failed to save seller products to localStorage:", err);
  }
}
