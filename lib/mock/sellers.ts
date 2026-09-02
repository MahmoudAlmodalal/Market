import type { Seller, SellerSummary, Product, Review, StockState } from "@/types/catalog";
import { MOCK_PRODUCTS } from "./products";

export interface ExtendedSeller extends Seller {
  name: string;
  name_en: string;
  business_name_en?: string;
  badge: string;
  badge_en?: string;
  rating: number;
  reviewCount: number;
  review_count: number;
  deliveryTimeEstimate: string;
  delivery_time: string;
  branch: string;
  phone: string;
  whatsapp?: string;
  bio_ar?: string;
  bio_en?: string;
  owner_name?: string;
  owner_name_en?: string;
  avatar?: string;
  banner?: string;
  joined_date?: string;
  is_verified: boolean;
  product_count: number;
  categories?: string[];
  minimum_order?: number;
}

export interface ExtendedReview extends Review {
  productId?: number;
  sellerId?: number;
  user_name_en?: string;
  avatar?: string;
  is_verified_buyer: boolean;
  helpful_count?: number;
  reply?: {
    seller_name: string;
    comment: string;
    created_at: string;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  name_en?: string;
  type: "size" | "weight" | "color" | "packaging" | "flavor";
  priceDelta?: number;
  priceOverride?: string;
  in_stock: boolean;
  stock_quantity?: number;
  badge?: string;
  badge_en?: string;
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  name_en: string;
  type: "size" | "weight" | "color" | "packaging" | "flavor";
  options: ProductVariant[];
}

export const MOCK_SELLERS: ExtendedSeller[] = [
  {
    id: 101,
    name: "مشغل الياسمين",
    business_name: "مشغل الياسمين",
    name_en: "Al-Yasmeen Studio",
    business_name_en: "Al-Yasmeen Studio",
    badge: "حرفي محلي موثق",
    badge_en: "Verified Local Artisan",
    rating: 4.9,
    reviewCount: 128,
    review_count: 128,
    deliveryTimeEstimate: "30-45 دقيقة",
    delivery_time: "30-45 دقيقة",
    neighborhood: "وسط البلد",
    city: "رام الله",
    branch: "رام الله - وسط البلد",
    address: "شارع يافا، عمارة الكروان، طابق 2",
    phone: "+970599112233",
    whatsapp: "+970599112233",
    logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80",
    avatar: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    owner_id: 201,
    owner_name: "ياسمين النابلسي",
    owner_name_en: "Yasmeen Al-Nabulsi",
    bio_ar: "مشروع منزلي متخصص في صناعة الصابون الطبيعي ومنتجات العناية بالبشرة يدوياً من زيت الزيتون البكر والأعشاب البرية الفلسطينية.",
    bio_en: "Home-based studio specializing in handmade natural soap and skincare products from virgin olive oil and local Palestinian herbs.",
    joined_date: "2023-04-15",
    is_active: true,
    is_verified: true,
    product_count: 15,
    categories: ["عناية وصابون", "منتجات طبيعية"],
    minimum_order: 20,
  },
  {
    id: 102,
    name: "مطبخ أم خليل",
    business_name: "مطبخ أم خليل",
    name_en: "Um Khalil Kitchen",
    business_name_en: "Um Khalil Kitchen",
    badge: "طاهية منزلية معتمدة",
    badge_en: "Certified Home Chef",
    rating: 4.8,
    reviewCount: 94,
    review_count: 94,
    deliveryTimeEstimate: "45-60 دقيقة",
    delivery_time: "45-60 دقيقة",
    neighborhood: "رفيديا",
    city: "نابلس",
    branch: "نابلس - رفيديا",
    address: "شارع رفيديا الرئيسي، بجانب مسجد الروضة",
    phone: "+970599445566",
    whatsapp: "+970599445566",
    logo: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80",
    avatar: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    owner_id: 202,
    owner_name: "أم خليل العمد",
    owner_name_en: "Um Khalil Al-Amd",
    bio_ar: "أشهى الحلويات والمخبوزات النابلسية التقليدية والمعمول الفاخر بالسمن البلدي الطازج يومياً.",
    bio_en: "Traditional authentic Nablus sweets, stone-oven pastries, and premium date maamoul baked fresh daily with pure ghee.",
    joined_date: "2022-11-10",
    is_active: true,
    is_verified: true,
    product_count: 24,
    categories: ["مأكولات وحلويات", "مخبوزات"],
    minimum_order: 30,
  },
  {
    id: 103,
    name: "شموع الواحة",
    business_name: "شموع الواحة",
    name_en: "Oasis Candles",
    business_name_en: "Oasis Candles",
    badge: "مشروع منزلي مميز",
    badge_en: "Featured Artisan Brand",
    rating: 4.7,
    reviewCount: 42,
    review_count: 42,
    deliveryTimeEstimate: "2-3 أيام",
    delivery_time: "2-3 أيام",
    neighborhood: "عين سارة",
    city: "الخليل",
    branch: "الخليل - عين سارة",
    address: "شارع عين سارة، مجمع النور",
    phone: "+970599778899",
    whatsapp: "+970599778899",
    logo: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80",
    avatar: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1570823468538-e78950d16ce3?auto=format&fit=crop&w=800&q=80",
    owner_id: 203,
    owner_name: "سارة التميمي",
    owner_name_en: "Sara Al-Tamimi",
    bio_ar: "شموع الصويا الصديقة للبيئة المعطرة بزيوت عطرية فاخرة وفتائل خشبية طبيعية تمنحك أجواء دافئة ومريحة.",
    bio_en: "Eco-friendly natural soy candles scented with premium botanical oils and crackling wooden wicks for a cozy atmosphere.",
    joined_date: "2023-01-20",
    is_active: true,
    is_verified: true,
    product_count: 12,
    categories: ["شموع وديكور", "هدايا"],
    minimum_order: 25,
  },
  {
    id: 104,
    name: "خزف القدس العتيق",
    business_name: "خزف القدس العتيق",
    name_en: "Jerusalem Heritage Ceramics",
    business_name_en: "Jerusalem Heritage Ceramics",
    badge: "تراث فلسطيني أصيل",
    badge_en: "Authentic Heritage Maker",
    rating: 4.9,
    reviewCount: 65,
    review_count: 65,
    deliveryTimeEstimate: "1-2 أيام",
    delivery_time: "1-2 أيام",
    neighborhood: "البلدة القديمة",
    city: "القدس",
    branch: "القدس - خان الزيت",
    address: "سوق خان الزيت، البلدة القديمة، القدس",
    phone: "+970599223344",
    whatsapp: "+970599223344",
    logo: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=150&q=80",
    avatar: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    owner_id: 204,
    owner_name: "خالد البيطار",
    owner_name_en: "Khaled Al-Bitar",
    bio_ar: "أواني وتحف خزفية مرسومة يدوياً بالنقوش والزخارف المقدسية العريقة منذ أكثر من ثلاثين عاماً.",
    bio_en: "Hand-painted ceramic tableware and traditional decorative tiles preserving centuries of Palestinian craftsmanship.",
    joined_date: "2021-08-05",
    is_active: true,
    is_verified: true,
    product_count: 18,
    categories: ["حرف وأشغال", "ديكور"],
    minimum_order: 35,
  },
  {
    id: 105,
    name: "مطرزات كنعان",
    business_name: "مطرزات كنعان",
    name_en: "Kanaan Embroidery",
    business_name_en: "Kanaan Embroidery",
    badge: "تطريز فلاحي يدوي",
    badge_en: "Handmade Tatreez Studio",
    rating: 5.0,
    reviewCount: 88,
    review_count: 88,
    deliveryTimeEstimate: "2-4 أيام",
    delivery_time: "2-4 أيام",
    neighborhood: "البلدة القديمة",
    city: "بيت لحم",
    branch: "بيت لحم - شارع النجمة",
    address: "شارع النجمة، بالقرب من ساحة المهد",
    phone: "+970599881122",
    whatsapp: "+970599881122",
    logo: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=150&q=80",
    avatar: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=150&q=80",
    banner: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80",
    owner_id: 205,
    owner_name: "فاطمة عيسى",
    owner_name_en: "Fatima Issa",
    bio_ar: "قطع تطريز فلسطيني يدوي أصيل بخيوط حريرية فاخرة تعكس تراث كل قرية ومدينة فلسطينية.",
    bio_en: "Authentic Palestinian cross-stitch embroidery with silk threads celebrating our rich cultural identity.",
    joined_date: "2022-03-12",
    is_active: true,
    is_verified: true,
    product_count: 20,
    categories: ["حرف وأشغال", "أزياء وتطريز"],
    minimum_order: 40,
  },
];

export const MOCK_REVIEWS: ExtendedReview[] = [
  {
    id: 1,
    productId: 1,
    sellerId: 101,
    user_name: "منى القدسي",
    user_name_en: "Mona Al-Qudsi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "الصابون رائع جداً ورائحته مهدئة ولطيفة على البشرة الحساسة. التغليف أنيق ومثالي كهدية. سأطلب منه باستمرار!",
    created_at: "2026-08-27T14:30:00Z",
    is_verified_buyer: true,
    helpful_count: 14,
    reply: {
      seller_name: "مشغل الياسمين",
      comment: "شكراً لثقتك وكلماتك اللطيفة أخت منى! نسعد دائماً بخدمتك وبتقديم الأفضل.",
      created_at: "2026-08-27T16:00:00Z",
    },
  },
  {
    id: 2,
    productId: 1,
    sellerId: 101,
    user_name: "طارق زياد",
    user_name_en: "Tariq Ziyad",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "جودة ممتازة وصناعة يدوية حقيقية بزيت زيتون صافي. التوصيل كان سريعاً في نفس اليوم.",
    created_at: "2026-08-24T09:15:00Z",
    is_verified_buyer: true,
    helpful_count: 8,
  },
  {
    id: 3,
    productId: 1,
    sellerId: 101,
    user_name: "ليلى حسن",
    user_name_en: "Layla Hassan",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    rating: 4,
    comment: "منتج طبيعي رائع، الترطيب ممتاز ورائحة اللافندر تدوم طويلاً. أتمنى توفير أحجام أكبر في المستقبل.",
    created_at: "2026-08-19T11:45:00Z",
    is_verified_buyer: true,
    helpful_count: 5,
  },
  {
    id: 4,
    productId: 2,
    sellerId: 101,
    user_name: "رنا محمود",
    user_name_en: "Rana Mahmoud",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "أفضل مقشر جربته على الإطلاق! القهوة وزيت الزيتون ينعمان البشرة فوراً دون أي جفاف.",
    created_at: "2026-08-25T17:20:00Z",
    is_verified_buyer: true,
    helpful_count: 11,
  },
  {
    id: 5,
    productId: 2,
    sellerId: 101,
    user_name: "سناء خليل",
    user_name_en: "Sanaa Khalil",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    rating: 4,
    comment: "مقشر ممتاز ورائحته منعشة جداً بالصباح، حبات السكر متوازنة ولا تسبب خدوش.",
    created_at: "2026-08-20T13:10:00Z",
    is_verified_buyer: true,
    helpful_count: 3,
  },
  {
    id: 6,
    productId: 4,
    sellerId: 102,
    user_name: "أحمد النجار",
    user_name_en: "Ahmad Al-Najjar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "معمول فاخر ودايب بالثم! طعم السمن البلدي والتمر الهش لا يوصف. ضيافة راقية لكل المناسبات.",
    created_at: "2026-08-28T18:00:00Z",
    is_verified_buyer: true,
    helpful_count: 19,
    reply: {
      seller_name: "مطبخ أم خليل",
      comment: "صحة وهنا على قلبكم يا رب! يسعدنا جداً إعجابك بالمعمول البلدي.",
      created_at: "2026-08-28T19:30:00Z",
    },
  },
  {
    id: 7,
    productId: 5,
    sellerId: 102,
    user_name: "يوسف عودة",
    user_name_en: "Yousef Odeh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "الكعك المقدسي وصل ساخناً ومقرمشاً، والزعتر البلدي متبل بإتقان. فطور ولا أروع!",
    created_at: "2026-08-29T08:30:00Z",
    is_verified_buyer: true,
    helpful_count: 7,
  },
  {
    id: 8,
    productId: 6,
    sellerId: 103,
    user_name: "دينا المصري",
    user_name_en: "Dina Al-Masri",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "الشمعة تنشر رائحة فانيلا دافئة ومهدئة في كل الغرفة، والفتيل الخشبي يصدر صوت فرقعة مريح جداً.",
    created_at: "2026-08-26T21:10:00Z",
    is_verified_buyer: true,
    helpful_count: 12,
  },
  {
    id: 9,
    productId: 3,
    sellerId: 105,
    user_name: "ريم الحمد",
    user_name_en: "Reem Al-Hamad",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "الشال في غاية الجمال والإتقان، غرزة التطريز دقيقة وخيوط الحرير ذات لمعة راقية. فخورة بارتداء هذا العمل التراثي.",
    created_at: "2026-08-28T10:00:00Z",
    is_verified_buyer: true,
    helpful_count: 16,
    reply: {
      seller_name: "مطرزات كنعان",
      comment: "يسعدنا جداً فخرك واعتزازك بتراثنا الأصيل، مبارك عليكِ القطعة أخت ريم!",
      created_at: "2026-08-28T12:00:00Z",
    },
  },
  {
    id: 10,
    productId: 7,
    sellerId: 104,
    user_name: "محمود الكردي",
    user_name_en: "Mahmoud Al-Kurdi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    rating: 5,
    comment: "الإبريق تحفة فنية تزين طاولة الشاي، الألوان زاهية والتغليف كان ممتازاً ومحمياً بشكل كامل ضد الكسر.",
    created_at: "2026-08-25T15:30:00Z",
    is_verified_buyer: true,
    helpful_count: 9,
  },
];

export const MOCK_PRODUCTS_FIXTURE: Product[] = [
  {
    id: 1,
    name: "صابون طبيعي بزيت الزيتون واللافندر",
    description: "صابون عضوي مصنوع يدوياً من زيت الزيتون البكر مع مستخلص اللافندر الطبيعي لترطيب وتغذية البشرة بعمق وبمكونات نباتية نقية 100%.",
    price: "25.00",
    unit: "قطعة (120 غرام)",
    primary_image: "https://images.unsplash.com/photo-1607006314644-884813589b25?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 101, image: "https://images.unsplash.com/photo-1607006314644-884813589b25?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "صابون زيت الزيتون واللافندر الطبيعي" },
      { id: 102, image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "تغليف صابون اللافندر اليدوي" },
      { id: 103, image: "https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=800&q=80", sort_order: 3, alt_text: "مكونات طبيعية وأزهار اللافندر" },
    ],
    stock_state: "available",
    stock_quantity: 15,
    available_quantity: 15,
    seller_name: "مشغل الياسمين",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      neighborhood: "وسط البلد",
      city: "رام الله",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      review_count: 128,
      delivery_time: "30-45 دقيقة",
      is_verified: true,
    },
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["عضوي", "صناعة يدوية", "طبيعي", "لافندر", "زيت زيتون"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: 2,
    name: "مقشر طبيعي بالسكر والقهوة",
    description: "مقشر للجسم بمكونات طبيعية 100% يمنح البشرة إشراقاً ونعومة فائقة، يزيل الخلايا الميتة ويحفز الدورة الدموية بفضل حبوب القهوة والزيوت الطبيعية.",
    price: "40.00",
    unit: "عبوة (250 غرام)",
    primary_image: "https://images.unsplash.com/photo-1567928815116-258055627258?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 201, image: "https://images.unsplash.com/photo-1567928815116-258055627258?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "مقشر السكر والقهوة الطبيعي" },
      { id: 202, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "قوام مقشر القهوة الطبيعي" },
    ],
    stock_state: "low_stock",
    stock_quantity: 4,
    available_quantity: 4,
    seller_name: "مشغل الياسمين",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      neighborhood: "وسط البلد",
      city: "رام الله",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      review_count: 128,
      delivery_time: "30-45 دقيقة",
      is_verified: true,
    },
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["عناية", "تقشير", "قهوة", "طبيعي", "بشرة"],
    is_featured: false,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-05T12:00:00Z",
  },
  {
    id: 3,
    name: "مرطب شفاه بزبدة الشيا والورد",
    description: "مرطب طبيعي غني بزبدة الشيا العضوية وخلاصة الورد الجوري لحماية وترطيب الشفاه الجافة والمشققة طوال اليوم.",
    price: "15.00",
    unit: "قطعة (15 مل)",
    primary_image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 301, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "مرطب شفاه بزبدة الشيا والورد" },
    ],
    stock_state: "out_of_stock",
    stock_quantity: 0,
    available_quantity: 0,
    seller_name: "مشغل الياسمين",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      neighborhood: "وسط البلد",
      city: "رام الله",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      review_count: 128,
      delivery_time: "30-45 دقيقة",
      is_verified: true,
    },
    category: {
      id: 2,
      name: "عناية وصابون",
      slug: "soaps-care",
    },
    tags: ["شفاه", "ترطيب", "ورد", "زبدة شيا"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-10T09:00:00Z",
  },
  {
    id: 4,
    name: "معمول بالتمر البلدي الفاخر (1 كغم)",
    description: "معمول تقليدي هش بالسمن البلدي الفاخر محشو بأجود أنواع التمر المتبل بالهيل والمحلب والقرفة، مخبوز بعناية وحب.",
    price: "60.00",
    unit: "علبة (1 كغم - حوالي 35 حبة)",
    primary_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 401, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "معمول بالتمر البلدي الفاخر" },
      { id: 402, image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "حبات المعمول الهش المرشوش بالسكر" },
    ],
    stock_state: "available",
    stock_quantity: 8,
    available_quantity: 8,
    seller_name: "مطبخ أم خليل",
    seller: {
      id: 102,
      business_name: "مطبخ أم خليل",
      neighborhood: "رفيديا",
      city: "نابلس",
      logo: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80",
      rating: 4.8,
      review_count: 94,
      delivery_time: "45-60 دقيقة",
      is_verified: true,
    },
    category: {
      id: 1,
      name: "مأكولات وحلويات",
      slug: "food-sweets",
    },
    tags: ["حلويات", "معمول", "ضيافة", "تمر", "سمن بلدي"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-12T11:00:00Z",
  },
  {
    id: 5,
    name: "كعك مقدسي بالسمسم الطازج (6 قطع)",
    description: "كعك فلسطيني تقليدي هش بالسمسم المحمص مخبوز في الفرن الحجري، يقدم مع الزعتر والزيت البلدي والجبنة البيضاء.",
    price: "20.00",
    unit: "حزمة (6 حبات)",
    primary_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 501, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "كعك مقدسي طازج بالسمسم" },
    ],
    stock_state: "low_stock",
    stock_quantity: 2,
    available_quantity: 2,
    seller_name: "مطبخ أم خليل",
    seller: {
      id: 102,
      business_name: "مطبخ أم خليل",
      neighborhood: "رفيديا",
      city: "نابلس",
      logo: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=150&q=80",
      rating: 4.8,
      review_count: 94,
      delivery_time: "45-60 دقيقة",
      is_verified: true,
    },
    category: {
      id: 1,
      name: "مأكولات وحلويات",
      slug: "food-sweets",
    },
    tags: ["مخبوزات", "إفطار", "طازج", "كعك", "سمسم"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-14T07:30:00Z",
  },
  {
    id: 6,
    name: "شمعة صويا معطرة بالفانيلا وخشب الصندل",
    description: "شمعة صويا نباتية نقية 100% بفتيل خشبي طبيعي يصدر فرقعة هادئة، ممزوجة بزيوت عطرية فاخرة تدوم لأكثر من 45 ساعة احتراق.",
    price: "35.00",
    unit: "شمعة في برطمان زجاجي (200 غرام)",
    primary_image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 601, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "شمعة صويا معطرة بالفانيلا" },
      { id: 602, image: "https://images.unsplash.com/photo-1570823468538-e78950d16ce3?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "إضاءة شمعة الصويا بفتيل خشب" },
    ],
    stock_state: "available",
    stock_quantity: 12,
    available_quantity: 12,
    seller_name: "شموع الواحة",
    seller: {
      id: 103,
      business_name: "شموع الواحة",
      neighborhood: "عين سارة",
      city: "الخليل",
      logo: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80",
      rating: 4.7,
      review_count: 42,
      delivery_time: "2-3 أيام",
      is_verified: true,
    },
    category: {
      id: 4,
      name: "شموع وديكور",
      slug: "candles-decor",
    },
    tags: ["شموع", "ديكور", "فانيلا", "صويا", "استرخاء"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-16T15:00:00Z",
  },
  {
    id: 7,
    name: "إبريق خزفي مقدسي مرسوم يدوياً",
    description: "إبريق شاي وتحفة خزفية تقليدية مرسومة ومزخرفة يدوياً بزخارف الأرابيسك وأزهار التوليب المقدسية المقاومة للحرارة.",
    price: "75.00",
    unit: "قطعة واحدة (سعة 800 مل)",
    primary_image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 701, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "إبريق خزفي مقدسي مرسوم يدوياً" },
      { id: 702, image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "تفاصيل النقوش الخزفية الزرقاء" },
    ],
    stock_state: "available",
    stock_quantity: 6,
    available_quantity: 6,
    seller_name: "خزف القدس العتيق",
    seller: {
      id: 104,
      business_name: "خزف القدس العتيق",
      neighborhood: "البلدة القديمة",
      city: "القدس",
      logo: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      review_count: 65,
      delivery_time: "1-2 أيام",
      is_verified: true,
    },
    category: {
      id: 3,
      name: "حرف وأشغال",
      slug: "crafts-crochet",
    },
    tags: ["خزف", "فخار", "تراث", "يدوي", "القدس"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-18T16:20:00Z",
  },
  {
    id: 8,
    name: "حقيبة قماشية مطرزة بتطريز فلسطيني يدوي",
    description: "حقيبة كتف عصرية من الكتان الطبيعي مزينة بقطعة تطريز فلاحي يدوي بنقشة السرو وزهر اللوز، مبطنة بجيوب داخلية عملية.",
    price: "85.00",
    unit: "حقيبة واحدة",
    primary_image: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=800&q=80",
    images: [
      { id: 801, image: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=800&q=80", sort_order: 1, alt_text: "حقيبة كتف بتطريز فلسطيني يدوي" },
      { id: 802, image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80", sort_order: 2, alt_text: "تفاصيل غرزة التطريز الفلاحي" },
    ],
    stock_state: "available",
    stock_quantity: 5,
    available_quantity: 5,
    seller_name: "مطرزات كنعان",
    seller: {
      id: 105,
      business_name: "مطرزات كنعان",
      neighborhood: "البلدة القديمة",
      city: "بيت لحم",
      logo: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=150&q=80",
      rating: 5.0,
      review_count: 88,
      delivery_time: "2-4 أيام",
      is_verified: true,
    },
    category: {
      id: 3,
      name: "حرف وأشغال",
      slug: "crafts-crochet",
    },
    tags: ["تطريز", "تراث", "صناعة يدوية", "حقائب", "كتان"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-20T10:00:00Z",
  },
];

export function getSellerById(id: number | string): ExtendedSeller | undefined {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return MOCK_SELLERS.find((s) => s.id === numId);
}

export function getAllSellers(): ExtendedSeller[] {
  return MOCK_SELLERS;
}

export function getVerifiedSellers(): ExtendedSeller[] {
  return MOCK_SELLERS.filter((s) => s.is_verified);
}

export function getProductById(id: number | string): (Product & { title_ar?: string; title_en?: string; description_ar?: string; description_en?: string; serverPriceString?: string }) | undefined {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  
  // 1. Search in fixture products
  const fixtureProd = MOCK_PRODUCTS_FIXTURE.find((p) => p.id === numId);
  if (fixtureProd) {
    const pNum = parseFloat(fixtureProd.price) || 0;
    return {
      ...fixtureProd,
      title_ar: fixtureProd.name,
      title_en: fixtureProd.name,
      description_ar: fixtureProd.description,
      description_en: fixtureProd.description,
      serverPriceString: `${pNum.toFixed(2)} ₪`,
    };
  }

  // 2. Search in localized catalog mock products
  const catProd = MOCK_PRODUCTS.find((p) => p.id === numId);
  if (catProd) {
    const pNum = parseFloat(catProd.price) || 0;
    return {
      ...catProd,
      title_ar: catProd.name_ar,
      title_en: catProd.name_en,
      description_ar: catProd.description_ar,
      description_en: catProd.description_en,
      serverPriceString: `${pNum.toFixed(2)} ₪`,
    };
  }

  return undefined;
}

export function getAllProducts(): Product[] {
  return MOCK_PRODUCTS_FIXTURE;
}

export function getRelatedProducts(productId: number | string, limit = 4): Product[] {
  const current = getProductById(productId);
  const pool = [...MOCK_PRODUCTS_FIXTURE, ...MOCK_PRODUCTS];
  if (!current) return pool.slice(0, limit);
  
  const related = pool.filter(
    (p) => p.id !== current.id && (p.category?.id === current.category?.id || p.seller_name === current.seller_name)
  );

  if (related.length >= limit) {
    return related.slice(0, limit);
  }

  // Fallback to distinct products
  const remaining = pool.filter((p) => p.id !== current.id && !related.some((r) => r.id === p.id));
  return [...related, ...remaining].slice(0, limit);
}

export function getReviewsByProductId(productId: number | string): ExtendedReview[] {
  const numId = typeof id_to_num(productId) === "number" ? id_to_num(productId) : 1;
  const directReviews = MOCK_REVIEWS.filter((r) => r.productId === numId);
  if (directReviews.length > 0) return directReviews;

  // Fallback to sample reviews for realistic presentation on all products
  return MOCK_REVIEWS.slice(0, 3).map((r, i) => ({
    ...r,
    id: 100 + i,
    productId: numId,
  }));
}

export function getReviewsBySellerId(sellerId: number | string): ExtendedReview[] {
  const numId = id_to_num(sellerId);
  return MOCK_REVIEWS.filter((r) => r.sellerId === numId);
}

export function getRatingStats(reviews: Review[]) {
  const total = reviews.length;
  if (total === 0) {
    return {
      average: 5.0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Number((sum / total).toFixed(1));

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
  });

  return { average, total, distribution };
}

/**
 * Returns mock variant configuration options for a given product ID.
 */
export function getProductVariants(productId: number | string): ProductVariantGroup[] {
  const numId = id_to_num(productId);

  switch (numId) {
    case 1: // Olive Oil or Lavender Soap
      return [
        {
          id: "size",
          name: "الحجم / العبوة",
          name_en: "Size / Packaging",
          type: "size",
          options: [
            {
              id: "v1_single",
              name: "قطعة واحدة (120 غرام)",
              name_en: "Single Bar (120g)",
              type: "size",
              priceDelta: 0,
              in_stock: true,
              stock_quantity: 15,
            },
            {
              id: "v1_pack3",
              name: "حزمة توفير (3 قطع)",
              name_en: "Value Pack (3 Bars)",
              type: "size",
              priceDelta: 40,
              badge: "خصم 15%",
              badge_en: "Save 15%",
              in_stock: true,
              stock_quantity: 8,
            },
            {
              id: "v1_gift",
              name: "صندوق هدايا خشبي فاخر",
              name_en: "Luxury Wooden Gift Box",
              type: "packaging",
              priceDelta: 65,
              badge: "هدية راقية",
              badge_en: "Gift Set",
              in_stock: false,
              stock_quantity: 0,
            },
          ],
        },
      ];

    case 2: // Sugar scrub or Zaatar
      return [
        {
          id: "weight",
          name: "الوزن",
          name_en: "Weight",
          type: "weight",
          options: [
            {
              id: "v2_250g",
              name: "عبوة 250 غرام",
              name_en: "250g Tub",
              type: "weight",
              priceDelta: 0,
              in_stock: true,
              stock_quantity: 4,
            },
            {
              id: "v2_500g",
              name: "عبوة عائلية 500 غرام",
              name_en: "Family Tub 500g",
              type: "weight",
              priceDelta: 25,
              in_stock: true,
              stock_quantity: 6,
            },
            {
              id: "v2_1kg",
              name: "عبوة صالونات 1 كغم",
              name_en: "Salon Size 1kg",
              type: "weight",
              priceDelta: 60,
              in_stock: false,
              stock_quantity: 0,
            },
          ],
        },
      ];

    case 3: // Shawl or Lip Balm
      return [
        {
          id: "color",
          name: "النقشة التراثية",
          name_en: "Heritage Motif",
          type: "color",
          options: [
            {
              id: "v3_olive",
              name: "عرق الزيتون (أحمر قاني)",
              name_en: "Olive Branch (Crimson Red)",
              type: "color",
              priceDelta: 0,
              in_stock: true,
              stock_quantity: 3,
            },
            {
              id: "v3_star",
              name: "نجمة بيت لحم (كحلي ملكي)",
              name_en: "Bethlehem Star (Royal Navy)",
              type: "color",
              priceDelta: 15,
              in_stock: true,
              stock_quantity: 2,
            },
            {
              id: "v3_cypress",
              name: "سرو يافا (أسود وتطريز ذهبي)",
              name_en: "Jaffa Cypress (Black & Gold)",
              type: "color",
              priceDelta: 25,
              in_stock: false,
              stock_quantity: 0,
            },
          ],
        },
      ];

    case 4: // Maamoul or Cups Set
      return [
        {
          id: "set_size",
          name: "سعة الطقم",
          name_en: "Set Size",
          type: "size",
          options: [
            {
              id: "v4_6pcs",
              name: "طقم 6 فناجين",
              name_en: "Set of 6 Cups",
              type: "size",
              priceDelta: 0,
              in_stock: true,
              stock_quantity: 12,
            },
            {
              id: "v4_12pcs",
              name: "طقم 12 فنجان + صحون",
              name_en: "Set of 12 Cups + Saucers",
              type: "size",
              priceDelta: 65,
              badge: "الأكثر طلباً",
              badge_en: "Best Seller",
              in_stock: true,
              stock_quantity: 5,
            },
            {
              id: "v4_full",
              name: "طقم الضيافة الكامل مع صينية خزف",
              name_en: "Full Set with Ceramic Tray",
              type: "packaging",
              priceDelta: 130,
              in_stock: false,
              stock_quantity: 0,
            },
          ],
        },
      ];

    case 6: // Candle or Pastries
      return [
        {
          id: "scent",
          name: "الرائحة العطرية",
          name_en: "Aromatherapy Scent",
          type: "flavor",
          options: [
            {
              id: "v6_vanilla",
              name: "فانيلا وخشب الصندل",
              name_en: "Warm Vanilla & Sandalwood",
              type: "flavor",
              priceDelta: 0,
              in_stock: true,
              stock_quantity: 12,
            },
            {
              id: "v6_lavender",
              name: "خزامى جبلية ومهدئ أعصاب",
              name_en: "Wild Lavender & Chamomile",
              type: "flavor",
              priceDelta: 5,
              in_stock: true,
              stock_quantity: 6,
            },
            {
              id: "v6_cinnamon",
              name: "قرفة وهيل دافئ",
              name_en: "Spiced Cardamom & Cinnamon",
              type: "flavor",
              priceDelta: 5,
              in_stock: false,
              stock_quantity: 0,
            },
          ],
        },
      ];

    default:
      return [
        {
          id: "general_size",
          name: "الخيار / الحجم",
          name_en: "Option / Size",
          type: "size",
          options: [
            {
              id: "opt_standard",
              name: "الحجم القياسي",
              name_en: "Standard Size",
              type: "size",
              priceDelta: 0,
              in_stock: true,
            },
            {
              id: "opt_large",
              name: "الحجم الكبير (توفير)",
              name_en: "Large Size (Value)",
              type: "size",
              priceDelta: 20,
              in_stock: true,
            },
          ],
        },
      ];
  }
}

function id_to_num(id: number | string): number {
  return typeof id === "string" ? parseInt(id, 10) : id;
}
