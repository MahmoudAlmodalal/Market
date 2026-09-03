import type { NotificationItem } from "@/types";

export const NOTIFICATIONS_STORAGE_KEY = "souqi_notifications_v1";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "order",
    title_ar: "تم تأكيد طلبك #ORD-8421",
    title_en: "Order #ORD-8421 Confirmed",
    message_ar: "مشغل الياسمين للمنتجات الطبيعية بدأ في تجهيز طلبك بعناية، وسنقوم بإشعارك عند استلام المندوب للطلب.",
    message_en: "Al-Yasmeen Organic Workshop has confirmed your order and started preparation.",
    timestamp: "2026-09-03T11:10:00Z",
    read: false,
    link: "/orders/ORD-8421",
    action: {
      label_ar: "تتبع الطلب",
      label_en: "Track Order",
      href: "/orders/ORD-8421",
    },
    metadata: {
      orderId: "ORD-8421",
      storeName: "مشغل الياسمين للمنتجات الطبيعية",
    },
  },
  {
    id: "notif-2",
    category: "delivery",
    title_ar: "المندوب في الطريق إليك",
    title_en: "Courier Out for Delivery",
    message_ar: "طلبك #ORD-7712 قيد التوصيل الآن مع مندوب سوقي وسيتواصل معك قريباً عند الوصول إلى حي الرمال.",
    message_en: "Your order #ORD-7712 is out for delivery with the Souqi courier in Al-Rimal.",
    timestamp: "2026-09-03T09:30:00Z",
    read: false,
    link: "/orders/ORD-7712",
    action: {
      label_ar: "تفاصيل الطلب",
      label_en: "Order Details",
      href: "/orders/ORD-7712",
    },
    metadata: {
      orderId: "ORD-7712",
    },
  },
  {
    id: "notif-3",
    category: "promo",
    title_ar: "خصم الخريف على الخزف اليدوي 20%",
    title_en: "Autumn Handmade Ceramics 20% Off",
    message_ar: "استخدم كود SOUQI20 واستمتع بتخفيض حصري على تشكيلة الفخار والخزف الخليلي المصنوع يدوياً.",
    message_en: "Use coupon code SOUQI20 for an exclusive 20% discount on handmade Hebron ceramics.",
    timestamp: "2026-09-02T16:00:00Z",
    read: true,
    link: "/catalog",
    action: {
      label_ar: "تصفح التشكيلة",
      label_en: "Explore Drop",
      href: "/catalog",
    },
    metadata: {
      discountCode: "SOUQI20",
    },
  },
  {
    id: "notif-4",
    category: "system",
    title_ar: "تهانينا! ترقية إلى العضوية الذهبية",
    title_en: "Congratulations! Upgraded to Gold Tier",
    message_ar: "لقد جمعت 850 نقطة وأصبحت عضواً ذهبياً في سوقي. استمتع بتوصيل مجاني وأولوية في معالجة طلباتك.",
    message_en: "You have earned 850 loyalty points and attained Gold Member status. Enjoy free shipping and priority handling.",
    timestamp: "2026-09-01T12:00:00Z",
    read: true,
    link: "/profile",
    action: {
      label_ar: "عرض مزايا الولاء",
      label_en: "View Loyalty Perks",
      href: "/profile",
    },
    metadata: {
      points: 850,
    },
  },
  {
    id: "notif-5",
    category: "order",
    title_ar: "تم تسليم الطلب #ORD-6540 بنجاح",
    title_en: "Order #ORD-6540 Delivered",
    message_ar: "تم تسليم طلبك من متجر خيرات أرضنا بنجاح. نتمنى أن تنال المنتجات رضاك! يسعدنا مشاركة تقييمك.",
    message_en: "Your order from Kheirat Ardona was delivered successfully. We'd love to hear your feedback.",
    timestamp: "2026-08-30T14:20:00Z",
    read: true,
    link: "/orders/ORD-6540",
    action: {
      label_ar: "تقييم الطلب",
      label_en: "Rate Order",
      href: "/orders/ORD-6540",
    },
    metadata: {
      orderId: "ORD-6540",
    },
  },
];

/**
 * Gets notifications from localStorage with fallback to default mocks
 */
export function getMockNotifications(): NotificationItem[] {
  if (typeof window === "undefined") {
    return MOCK_NOTIFICATIONS;
  }
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
      return MOCK_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return MOCK_NOTIFICATIONS;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

/**
 * Saves notifications list to localStorage
 */
export function saveMockNotifications(items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save notifications to localStorage:", err);
  }
}
