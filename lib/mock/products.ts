import type { Product, ProductFilterParams, StockState } from "@/types/catalog";
import type { Locale } from "@/types/i18n";

export interface LocalizedProduct extends Product {
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  seller_name_ar?: string;
  seller_name_en?: string;
  category_name_ar?: string;
  category_name_en?: string;
}

export const MOCK_PRODUCTS: LocalizedProduct[] = [
  {
    id: 1,
    name: "زيت زيتون بلدي بكر ممتاز (1 لتر)",
    name_ar: "زيت زيتون بلدي بكر ممتاز (1 لتر)",
    name_en: "Artisanal Extra Virgin Olive Oil (1L)",
    description: "عصرة أولى على البارد من أشجار الزيتون الرومي في جبال رام الله ونابلس، بنسبة حموضة أقل من 0.5% ونكهة فاكهية غنية.",
    description_ar: "عصرة أولى على البارد من أشجار الزيتون الرومي في جبال رام الله ونابلس، بنسبة حموضة أقل من 0.5% ونكهة فاكهية غنية.",
    description_en: "Cold first pressed from ancient Rumi olive trees in the hills of Ramallah & Nablus. Acidity < 0.5% with rich peppery notes.",
    price: "45.00",
    unit: "زجاجة / 1L",
    primary_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    images: [
      { id: 101, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80", sort_order: 1, alt_text: "زجاجة زيت زيتون" },
      { id: 102, image: "https://images.unsplash.com/photo-1541256942802-7b29ec6564c8?auto=format&fit=crop&w=600&q=80", sort_order: 2, alt_text: "زيتون طازج" },
    ],
    stock_state: "available",
    available_quantity: 40,
    seller_name: "معصرة البركة البلدية",
    seller_name_ar: "معصرة البركة البلدية",
    seller_name_en: "Al-Baraka Traditional Press",
    seller: {
      id: 1,
      business_name: "معصرة البركة البلدية",
      neighborhood: "البلدة القديمة",
      city: "رام الله",
      rating: 4.9,
      review_count: 128,
      delivery_time: "30-45 دقيقة",
      is_verified: true,
      logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    category: {
      id: 1,
      name: "زيت زيتون بلدي ومخللات",
      slug: "olive-oil",
    },
    category_name_ar: "زيت زيتون بلدي ومخللات",
    category_name_en: "Olive Oil & Pickles",
    tags: ["عضوي", "عصرة أولى", "موسم جديد"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: 2,
    name: "خلطة زعتر بلدي فاخر بالسمسم (500 غرام)",
    name_ar: "خلطة زعتر بلدي فاخر بالسمسم (500 غرام)",
    name_en: "Premium Wild Thyme Zaatar with Sesame (500g)",
    description: "زعتر بري مجفف طبيعياً ممزوج بالسمسم المحمص والسماق البلدي الأصيل ورشة ملح صخري.",
    description_ar: "زعتر بري مجفف طبيعياً ممزوج بالسمسم المحمص والسماق البلدي الأصيل ورشة ملح صخري.",
    description_en: "Naturally dried wild mountain thyme blended with golden roasted sesame, pure wild sumac, and rock sea salt.",
    price: "22.00",
    unit: "عبوة / 500g",
    primary_image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    images: [
      { id: 201, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80", sort_order: 1, alt_text: "طبق زعتر بالسمسم" },
    ],
    stock_state: "available",
    available_quantity: 65,
    seller_name: "بهارات أم خليل",
    seller_name_ar: "بهارات أم خليل",
    seller_name_en: "Um Khalil Spices & Herbs",
    seller: {
      id: 2,
      business_name: "بهارات أم خليل",
      neighborhood: "حي الميدان",
      city: "نابلس",
      rating: 4.8,
      review_count: 94,
      delivery_time: "25-35 دقيقة",
      is_verified: true,
      logo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    },
    category: {
      id: 2,
      name: "زعتر ودقة وتوابل",
      slug: "zaatar-spices",
    },
    category_name_ar: "زعتر ودقة وتوابل",
    category_name_en: "Zaatar & Spices",
    tags: ["يدوي", "خالي من المواد الحافظة", "نباتي"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-05T12:00:00Z",
  },
  {
    id: 3,
    name: "شال كشمير بتطريز فلاحي يدوي حرير",
    name_ar: "شال كشمير بتطريز فلاحي يدوي حرير",
    name_en: "Handmade Tatreez Embroidered Cashmere Shawl",
    description: "شال كشمير ناعم ومطرز يدوياً بنقشات تراثية فلاحية (عرق الزيتون ونجمة بيت لحم) بخيوط حريرية طبيعية.",
    description_ar: "شال كشمير ناعم ومطرز يدوياً بنقشات تراثية فلاحية (عرق الزيتون ونجمة بيت لحم) بخيوط حريرية طبيعية.",
    description_en: "Luxurious soft cashmere shawl hand-embroidered with traditional Palestinian heritage motifs using pure silk threads.",
    price: "180.00",
    unit: "قطعة",
    primary_image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80",
    images: [
      { id: 301, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80", sort_order: 1, alt_text: "شال مطرز" },
    ],
    stock_state: "low_stock",
    available_quantity: 3,
    seller_name: "تراث الأصالة للمطرزات",
    seller_name_ar: "تراث الأصالة للمطرزات",
    seller_name_en: "Asala Heritage Tatreez",
    seller: {
      id: 3,
      business_name: "تراث الأصالة للمطرزات",
      neighborhood: "مركز المدينة",
      city: "بيت لحم",
      rating: 5.0,
      review_count: 67,
      delivery_time: "40-60 دقيقة",
      is_verified: true,
      logo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    },
    category: {
      id: 3,
      name: "تطريز فلاحي وأزياء",
      slug: "tatreez-embroidery",
    },
    category_name_ar: "تطريز فلاحي وأزياء",
    category_name_en: "Tatreez & Embroidery",
    tags: ["تراث", "شغل يدوي", "قطعة فريدة"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-10T09:30:00Z",
  },
  {
    id: 4,
    name: "طقم فناجين قهوة خزف فلسطيني ملون (6 قطع)",
    name_ar: "طقم فناجين قهوة خزف فلسطيني ملون (6 قطع)",
    name_en: "Hand-Painted Palestinian Ceramic Coffee Cups (Set of 6)",
    description: "فناجين قهوة مصنوعة من الخزف اليدوي ومزخرفة بألوان زاهية ونقوش نباتية مستوحاة من التراث الخليلي العريق.",
    description_ar: "فناجين قهوة مصنوعة من الخزف اليدوي ومزخرفة بألوان زاهية ونقوش نباتية مستوحاة من التراث الخليلي العريق.",
    description_en: "Traditional Hebron artisan ceramic coffee set with 6 cups, hand-painted with vibrant floral and arabesque patterns.",
    price: "75.00",
    unit: "طقم 6 قطع",
    primary_image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 12,
    seller_name: "خزفيات الخليل العريقة",
    seller_name_ar: "خزفيات الخليل العريقة",
    seller_name_en: "Hebron Ancient Ceramics",
    seller: {
      id: 4,
      business_name: "خزفيات الخليل العريقة",
      neighborhood: "حارة القزازين",
      city: "الخليل",
      rating: 4.7,
      review_count: 81,
      delivery_time: "35-50 دقيقة",
      is_verified: true,
    },
    category: {
      id: 4,
      name: "فخار وخزف يدوي",
      slug: "pottery-ceramics",
    },
    category_name_ar: "فخار وخزف يدوي",
    category_name_en: "Pottery & Ceramics",
    tags: ["خزف يدوي", "ديكور وضيافة"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-12T14:10:00Z",
  },
  {
    id: 5,
    name: "صابون نابلسي بلدي أصيل بزيت الزيتون (طقم 4 قطع)",
    name_ar: "صابون نابلسي بلدي أصيل بزيت الزيتون (طقم 4 قطع)",
    name_en: "Original Nabulsi Olive Oil Soap (Pack of 4)",
    description: "صابون مطبوخ على الطريقة النابلسية التقليدية منذ 150 عاماً، 100% زيت زيتون نقي وخالي من العطور الصناعية والمواد الكيميائية.",
    description_ar: "صابون مطبوخ على الطريقة النابلسية التقليدية منذ 150 عاماً، 100% زيت زيتون نقي وخالي من العطور الصناعية والمواد الكيميائية.",
    description_en: "Cooked traditionally in historical Nablus soap factories for over 150 years. 100% pure olive oil base, fragrance and chemical free.",
    price: "28.00",
    unit: "طقم / 4 صابونات",
    primary_image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 80,
    seller_name: "صبانة الشكعة التراثية",
    seller_name_ar: "صبانة الشكعة التراثية",
    seller_name_en: "Shakaa Heritage Soap",
    seller: {
      id: 5,
      business_name: "صبانة الشكعة التراثية",
      neighborhood: "الياسمينة",
      city: "نابلس",
      rating: 4.9,
      review_count: 142,
      delivery_time: "20-30 دقيقة",
      is_verified: true,
    },
    category: {
      id: 5,
      name: "صابون وعناية طبيعية",
      slug: "natural-soaps",
    },
    category_name_ar: "صابون وعناية طبيعية",
    category_name_en: "Natural Soaps & Care",
    tags: ["طبيعي 100%", "عناية بالبشرة", "تراث نابلسي"],
    is_featured: true,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-15T11:20:00Z",
  },
  {
    id: 6,
    name: "معمول وكعك بالتمر والسمسم بالسمن البلدي (1 كغم)",
    name_ar: "معمول وكعك بالتمر والسمسم بالسمن البلدي (1 كغم)",
    name_en: "Fresh Date Maamoul & Sesame Cookies (1kg)",
    description: "معمول بيتي هش محشو بعجوة التمر المجهول مع بهارات الكعك الفواحة والسمن البلدي الطبيعي، يخبز طازجاً يومياً.",
    description_ar: "معمول بيتي هش محشو بعجوة التمر المجهول مع بهارات الكعك الفواحة والسمن البلدي الطبيعي، يخبز طازجاً يومياً.",
    description_en: "Crispy melt-in-mouth maamoul filled with Medjool dates paste, aromatic cake spices and natural clarified butter.",
    price: "50.00",
    unit: "علبة / 1kg",
    primary_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 15,
    seller_name: "مطبخ أم أحمد للحلويات",
    seller_name_ar: "مطبخ أم أحمد للحلويات",
    seller_name_en: "Um Ahmad Home Kitchen",
    seller: {
      id: 6,
      business_name: "مطبخ أم أحمد للحلويات",
      neighborhood: "عين مصباح",
      city: "رام الله",
      rating: 4.9,
      review_count: 210,
      delivery_time: "30-40 دقيقة",
      is_verified: true,
    },
    category: {
      id: 6,
      name: "حلويات ومعجنات بيتية",
      slug: "home-baking",
    },
    category_name_ar: "حلويات ومعجنات بيتية",
    category_name_en: "Home Pastries & Sweets",
    tags: ["طازج يومياً", "ضيافة", "سمن بلدي"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-16T08:00:00Z",
  },
  {
    id: 7,
    name: "عسل سدر جبلي خام نقي (500 غرام)",
    name_ar: "عسل سدر جبلي خام نقي (500 غرام)",
    name_en: "Pure Raw Sidr Mountain Honey (500g)",
    description: "عسل سدر طبيعي 100% غير مبستر ومستخرج من مناحل جبال جنين العالية، غني بالمعادن ومضادات الأكسدة.",
    description_ar: "عسل سدر طبيعي 100% غير مبستر ومستخرج من مناحل جبال جنين العالية، غني بالمعادن ومضادات الأكسدة.",
    description_en: "100% unpasteurized raw Sidr honey harvested from high-altitude apiaries in Jenin hills. Rich in enzymes and antioxidants.",
    price: "85.00",
    unit: "مرطبان / 500g",
    primary_image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    stock_state: "low_stock",
    available_quantity: 4,
    seller_name: "مناحل السهل الأخضر",
    seller_name_ar: "مناحل السهل الأخضر",
    seller_name_en: "Green Plain Apiaries",
    seller: {
      id: 7,
      business_name: "مناحل السهل الأخضر",
      neighborhood: "مرج بن عامر",
      city: "جنين",
      rating: 4.8,
      review_count: 53,
      delivery_time: "45-60 دقيقة",
      is_verified: true,
    },
    category: {
      id: 7,
      name: "عسل ومربيات بلدية",
      slug: "honey-preserves",
    },
    category_name_ar: "عسل ومربيات بلدية",
    category_name_en: "Honey & Preserves",
    tags: ["عسل خام", "عضوي", "مقوي طبيعي"],
    is_featured: false,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-18T10:15:00Z",
  },
  {
    id: 8,
    name: "تمر مجدول أريحا درجة أولى فاخر (1 كغم)",
    name_ar: "تمر مجدول أريحا درجة أولى فاخر (1 كغم)",
    name_en: "Jericho Jumbo Medjool Dates Grade A (1kg)",
    description: "تمور مجدول ملكية عملاقة من واحة أريحا، ذات قوام طري ونكهة كراميل طبيعية وحبة ممتازة.",
    description_ar: "تمر مجدول أريحا درجة أولى فاخر (1 كغم)",
    description_en: "Jumbo royal Medjool dates grown in Jericho oasis sun. Naturally sweet, soft flesh with notes of honey caramel.",
    price: "38.00",
    unit: "علبة / 1kg",
    primary_image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 50,
    seller_name: "مزارع نخيل أريحا",
    seller_name_ar: "مزارع نخيل أريحا",
    seller_name_en: "Jericho Palm Farms",
    seller: {
      id: 8,
      business_name: "مزارع نخيل أريحا",
      neighborhood: "طريق المغطس",
      city: "أريحا",
      rating: 4.9,
      review_count: 175,
      delivery_time: "35-50 دقيقة",
      is_verified: true,
    },
    category: {
      id: 8,
      name: "تمور وفواكه مجففة",
      slug: "dates-fruits",
    },
    category_name_ar: "تمور وفواكه مجففة",
    category_name_en: "Dates & Dried Fruits",
    tags: ["تمر مجدول", "سوبر جامبو", "محصول جديد"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-20T07:45:00Z",
  },
  {
    id: 9,
    name: "حقيبة كتف يد بكنفا مطرزة بتطريز تقليدي",
    name_ar: "حقيبة كتف يد بكنفا مطرزة بتطريز تقليدي",
    name_en: "Handmade Tatreez Crossbody Canvas Bag",
    description: "حقيبة أنيقة وعملية مصنوعة من قماش الكتان المقاوم مع جيب أمامي مطرز يدوياً بألوان زاهية وبطانة داخلية متينة.",
    description_ar: "حقيبة أنيقة وعملية مصنوعة من قماش الكتان المقاوم مع جيب أمامي مطرز يدوياً بألوان زاهية وبطانة داخلية متينة.",
    description_en: "Chic and practical durable linen canvas shoulder bag featuring a hand-embroidered front panel and secure zipper lining.",
    price: "95.00",
    unit: "قطعة",
    primary_image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 8,
    seller_name: "تراث الأصالة للمطرزات",
    seller_name_ar: "تراث الأصالة للمطرزات",
    seller_name_en: "Asala Heritage Tatreez",
    seller: {
      id: 3,
      business_name: "تراث الأصالة للمطرزات",
      neighborhood: "مركز المدينة",
      city: "بيت لحم",
      rating: 5.0,
      review_count: 67,
      delivery_time: "40-60 دقيقة",
      is_verified: true,
    },
    category: {
      id: 3,
      name: "تطريز فلاحي وأزياء",
      slug: "tatreez-embroidery",
    },
    category_name_ar: "تطريز فلاحي وأزياء",
    category_name_en: "Tatreez & Embroidery",
    tags: ["حقيبة مطرزة", "هدايا", "يدوي"],
    is_featured: false,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-21T16:00:00Z",
  },
  {
    id: 10,
    name: "مربى تين بلدي بالجوز والسمسم (450 غرام)",
    name_ar: "مربى تين بلدي بالجوز والسمسم (450 غرام)",
    name_en: "Homemade Fig Jam with Walnuts & Sesame (450g)",
    description: "مربى محضر من تين الحماضي الموسمي الطازج مع حبات الجوز البلدي وحبوب السمسم ورشة يانسون طبيعي.",
    description_ar: "مربى محضر من تين الحماضي الموسمي الطازج مع حبات الجوز البلدي وحبوب السمسم ورشة يانسون طبيعي.",
    description_en: "Artisan jam made from fresh Palestinian seasonal figs, crunchy local walnuts, toasted sesame, and a hint of wild aniseed.",
    price: "24.00",
    unit: "مرطبان / 450g",
    primary_image: "https://images.unsplash.com/photo-1568651316333-a3b04753f7c4?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 25,
    seller_name: "مؤونة ستي المنزلية",
    seller_name_ar: "مؤونة ستي المنزلية",
    seller_name_en: "Sitti's Homemade Pantry",
    seller: {
      id: 9,
      business_name: "مؤونة ستي المنزلية",
      neighborhood: "الطيرة",
      city: "رام الله",
      rating: 4.8,
      review_count: 45,
      delivery_time: "25-35 دقيقة",
      is_verified: true,
    },
    category: {
      id: 7,
      name: "عسل ومربيات بلدية",
      slug: "honey-preserves",
    },
    category_name_ar: "عسل ومربيات بلدية",
    category_name_en: "Honey & Preserves",
    tags: ["مربى بيتي", "تين وجوز", "بدون مواد حافظة"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-22T13:40:00Z",
  },
  {
    id: 11,
    name: "سلة قش قمح تراثية مع غطاء مزخرف",
    name_ar: "سلة قش قمح تراثية مع غطاء مزخرف",
    name_en: "Handwoven Wheat Straw Bread Basket with Lid",
    description: "سلة تقليدية تستخدم لتقديم الخبز والكعك وحفظ الأطعمة، منسوجة يدوياً بحرفية ودقة من قش القمح الطبيعي الملون.",
    description_ar: "سلة تقليدية تستخدم لتقديم الخبز والكعك وحفظ الأطعمة، منسوجة يدوياً بحرفية ودقة من قش القمح الطبيعي الملون.",
    description_en: "Heritage Palestinian flat basket with conical lid for serving bread and pastries, hand-woven from colored natural wheat straw.",
    price: "60.00",
    unit: "قطعة",
    primary_image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80",
    stock_state: "out_of_stock",
    available_quantity: 0,
    seller_name: "حرفيات قريتنا",
    seller_name_ar: "حرفيات قريتنا",
    seller_name_en: "Village Artisan Cooperative",
    seller: {
      id: 10,
      business_name: "حرفيات قريتنا",
      neighborhood: "سبسطية",
      city: "نابلس",
      rating: 4.6,
      review_count: 38,
      delivery_time: "40-50 دقيقة",
      is_verified: true,
    },
    category: {
      id: 9,
      name: "سلال وقش يدوي",
      slug: "woven-crafts",
    },
    category_name_ar: "سلال وقش يدوي",
    category_name_en: "Woven Crafts & Baskets",
    tags: ["قش بلدي", "ديكور تراثي", "شغل نسوي"],
    is_featured: false,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-23T11:00:00Z",
  },
  {
    id: 12,
    name: "ميرمية جبلية برية مجففة في الظل (200 غرام)",
    name_ar: "ميرمية جبلية برية مجففة في الظل (200 غرام)",
    name_en: "Wild Sun-Dried Mountain Sage (200g)",
    description: "أوراق ميرمية عطرية برية مقطوفة يدوياً من جبال القدس ورام الله ومجففة ببطء في الظل للحفاظ على زيوتها العطرية.",
    description_ar: "أوراق ميرمية عطرية برية مقطوفة يدوياً من جبال القدس ورام الله ومجففة ببطء في الظل للحفاظ على زيوتها العطرية.",
    description_en: "Organic wild sage leaves hand-picked from Jerusalem hills and shade-dried to lock in essential oils and pungent herbal aroma.",
    price: "16.00",
    unit: "كيس / 200g",
    primary_image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 32,
    seller_name: "بهارات أم خليل",
    seller_name_ar: "بهارات أم خليل",
    seller_name_en: "Um Khalil Spices & Herbs",
    seller: {
      id: 2,
      business_name: "بهارات أم خليل",
      neighborhood: "حي الميدان",
      city: "نابلس",
      rating: 4.8,
      review_count: 94,
      delivery_time: "25-35 دقيقة",
      is_verified: true,
    },
    category: {
      id: 10,
      name: "أعشاب وشاي جبلي",
      slug: "herbal-teas",
    },
    category_name_ar: "أعشاب وشاي جبلي",
    category_name_en: "Herbal Teas & Infusions",
    tags: ["ميرمية برية", "أعشاب طبيعية", "شاي صحي"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-24T09:00:00Z",
  },
  {
    id: 13,
    name: "سماق بلدي حامض نخب أول (250 غرام)",
    name_ar: "سماق بلدي حامض نخب أول (250 غرام)",
    name_en: "Pure Wild Sour Ground Sumac (250g)",
    description: "سماق جبلي أحمر ياقوتي مطحون خشن بطعم حامض طبيعي مميز، مثالي للمسخن والسلطات والمشويات.",
    description_ar: "سماق بلدي حامض نخب أول (250 غرام)",
    description_en: "Vibrant ruby-red wild sumac coarsely ground with an authentic tangy citric bite. Perfect for Musakhan and salads.",
    price: "18.00",
    unit: "عبوة / 250g",
    primary_image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 45,
    seller_name: "بهارات أم خليل",
    seller_name_ar: "بهارات أم خليل",
    seller_name_en: "Um Khalil Spices & Herbs",
    seller: {
      id: 2,
      business_name: "بهارات أم خليل",
      neighborhood: "حي الميدان",
      city: "نابلس",
      rating: 4.8,
      review_count: 94,
      delivery_time: "25-35 دقيقة",
      is_verified: true,
    },
    category: {
      id: 2,
      name: "زعتر ودقة وتوابل",
      slug: "zaatar-spices",
    },
    category_name_ar: "زعتر ودقة وتوابل",
    category_name_en: "Zaatar & Spices",
    tags: ["سماق بلدي", "مسخن", "طبيعي 100%"],
    is_featured: false,
    is_ai_suggested: true,
    status: "published",
    created_at: "2026-08-25T14:30:00Z",
  },
  {
    id: 14,
    name: "زيتون أخضر بلدي مكبوس بالليمون والفلفل (1 كغم)",
    name_ar: "زيتون أخضر بلدي مكبوس بالليمون والفلفل (1 كغم)",
    name_en: "Cured Green Olives with Lemon & Chili (1kg)",
    description: "زيتون نباتي نبالي بلدي مرصوص ومكبوس بزيت الزيتون البكر وعصير الليمون وشرائح الفلفل الحار والزعتر الأخضر.",
    description_ar: "زيتون نباتي نبالي بلدي مرصوص ومكبوس بزيت الزيتون البكر وعصير الليمون وشرائح الفلفل الحار والزعتر الأخضر.",
    description_en: "Hand-cracked green Nabali olives pickled in extra virgin olive oil, fresh lemon slices, and fiery peppers.",
    price: "32.00",
    unit: "مرطبان / 1kg",
    primary_image: "https://images.unsplash.com/photo-1541256942802-7b29ec6564c8?auto=format&fit=crop&w=600&q=80",
    stock_state: "available",
    available_quantity: 20,
    seller_name: "معصرة البركة البلدية",
    seller_name_ar: "معصرة البركة البلدية",
    seller_name_en: "Al-Baraka Traditional Press",
    seller: {
      id: 1,
      business_name: "معصرة البركة البلدية",
      neighborhood: "البلدة القديمة",
      city: "رام الله",
      rating: 4.9,
      review_count: 128,
      delivery_time: "30-45 دقيقة",
      is_verified: true,
    },
    category: {
      id: 1,
      name: "زيت زيتون بلدي ومخللات",
      slug: "olive-oil",
    },
    category_name_ar: "زيت زيتون بلدي ومخللات",
    category_name_en: "Olive Oil & Pickles",
    tags: ["مخلل بيتي", "زيتون نبالي", "طازج"],
    is_featured: true,
    is_ai_suggested: false,
    status: "published",
    created_at: "2026-08-26T08:15:00Z",
  },
];

/**
 * Filter helper for products
 */
export function filterProductsList(products: Product[], filters: ProductFilterParams): Product[] {
  let result = [...products];

  // Search keyword (matches name, description, tags, seller_name, category)
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.seller_name && p.seller_name.toLowerCase().includes(q)) ||
        (p.category && p.category.name.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Category filter
  if (filters.category !== undefined && filters.category !== null && filters.category > 0) {
    result = result.filter((p) => p.category.id === filters.category);
  }

  // Seller filter
  if (filters.seller !== undefined && filters.seller !== null && filters.seller > 0) {
    result = result.filter((p) => (p.seller?.id === filters.seller || p.seller_name === String(filters.seller)));
  }

  // Stock State filter
  if (filters.stock_state) {
    result = result.filter((p) => p.stock_state === filters.stock_state);
  }

  // Ordering
  if (filters.ordering) {
    switch (filters.ordering) {
      case "price":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "-price":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "created_at":
        result.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
        );
        break;
      case "-created_at":
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
    }
  }

  return result;
}

/**
 * Returns localized product list with names and descriptions matching selected locale.
 */
export function getLocalizedProducts(
  locale: Locale = "ar",
  filters?: ProductFilterParams
): Product[] {
  let list: Product[] = MOCK_PRODUCTS.map((prod) => ({
    ...prod,
    name: locale === "ar" ? prod.name_ar : prod.name_en,
    description: locale === "ar" ? prod.description_ar : prod.description_en,
    seller_name: locale === "ar" ? prod.seller_name_ar : prod.seller_name_en,
    category: {
      ...prod.category,
      name: locale === "ar" ? (prod.category_name_ar || prod.category.name) : (prod.category_name_en || prod.category.name),
    },
  }));

  if (filters) {
    list = filterProductsList(list, filters);
  }

  return list;
}

/**
 * Find single product by ID with localization.
 */
export function getProductById(id: number, locale: Locale = "ar"): Product | undefined {
  const prod = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!prod) return undefined;
  return {
    ...prod,
    name: locale === "ar" ? prod.name_ar : prod.name_en,
    description: locale === "ar" ? prod.description_ar : prod.description_en,
    seller_name: locale === "ar" ? prod.seller_name_ar : prod.seller_name_en,
    category: {
      ...prod.category,
      name: locale === "ar" ? (prod.category_name_ar || prod.category.name) : (prod.category_name_en || prod.category.name),
    },
  };
}

/**
 * Filter products with min/max price range support in addition to standard params.
 */
export function filterProductsAdvanced(
  products: Product[],
  params: ProductFilterParams & { minPrice?: number; maxPrice?: number }
): Product[] {
  let result = filterProductsList(products, params);

  if (params.minPrice !== undefined && params.minPrice > 0) {
    result = result.filter((p) => parseFloat(p.price) >= params.minPrice!);
  }

  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    result = result.filter((p) => parseFloat(p.price) <= params.maxPrice!);
  }

  return result;
}
