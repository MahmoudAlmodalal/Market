import type { Cart, CartItem, CartSeller, PricingBreakdown } from "@/types/cart";
import type { Address } from "@/types/order";

export interface DeliveryTimeSlot {
  id: string;
  label_ar: string;
  label_en: string;
  date: string;
  isAvailable: boolean;
}

export interface VoucherDefinition {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minSubtotal: number;
  isValid: boolean;
  description_ar?: string;
  description_en?: string;
}

export const MOCK_ACTIVE_SELLER: CartSeller = {
  id: 101,
  business_name: "مشغل الياسمين",
  neighborhood: "رام الله - وسط البلد",
  phone: "+970599112233",
};

export const MOCK_OTHER_SELLER: CartSeller = {
  id: 102,
  business_name: "مطبخ أم خليل",
  neighborhood: "نابلس - رفيديا",
  phone: "+970599445566",
};

export const MOCK_INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    product_id: 1,
    name: "صابون طبيعي بزيت الزيتون واللافندر",
    unit_price: "25.00",
    quantity: 2,
    line_total: "50.00",
    stock_state: "available",
    primary_image: "/images/soap-1.jpg",
    seller_name: "مشغل الياسمين",
    seller_id: 101,
    issues: [],
    max_quantity: 15,
    price_at_addition: "25.00",
    current_server_price: "25.00",
  },
  {
    id: 2,
    product_id: 2,
    name: "مقشر طبيعي بالسكر والقهوة",
    unit_price: "40.00",
    quantity: 1,
    line_total: "40.00",
    stock_state: "low_stock",
    primary_image: "/images/scrub-1.jpg",
    seller_name: "مشغل الياسمين",
    seller_id: 101,
    issues: [
      {
        code: "price_changed",
        message: "تغير سعر هذا المنتج من 35.00 ₪ إلى 40.00 ₪",
        old_price: "35.00",
        new_price: "40.00",
        product_id: 2,
      },
    ],
    max_quantity: 4,
    price_at_addition: "35.00",
    current_server_price: "40.00",
  },
  {
    id: 3,
    product_id: 5,
    name: "مرطب شفاه بزبدة الشيا والورد",
    unit_price: "15.00",
    quantity: 6,
    line_total: "90.00",
    stock_state: "low_stock",
    primary_image: "/images/lipbalm-1.jpg",
    seller_name: "مشغل الياسمين",
    seller_id: 101,
    issues: [
      {
        code: "insufficient_stock",
        message: "الكمية المتبقية 3 فقط في المخزون",
        available: 3,
        product_id: 5,
      },
    ],
    max_quantity: 3,
    price_at_addition: "15.00",
    current_server_price: "15.00",
  },
];

export const MOCK_SAVED_ADDRESSES: Address[] = [
  {
    id: 1,
    name: "المنزل (Home)",
    street: "شارع الإرسال، عمارة الأمل، طابق 3",
    neighborhood: "حي الإرسال",
    city: "رام الله",
    phone: "+970599123456",
    is_default: true,
    notes: "بالقرب من برج فلسطين",
  },
  {
    id: 2,
    name: "العمل (Office)",
    street: "شارع القدس، مجمع الأعمال، طابق 5",
    neighborhood: "المنطقة الصناعية",
    city: "البيرة",
    phone: "+970599123456",
    is_default: false,
    notes: "خلال ساعات الدوام الرسمي 8:00 ص - 4:00 م",
  },
];

export const MOCK_DELIVERY_SLOTS: DeliveryTimeSlot[] = [
  {
    id: "slot-1",
    label_ar: "اليوم (14:00 - 16:00)",
    label_en: "Today (2:00 PM - 4:00 PM)",
    date: "2026-08-31",
    isAvailable: true,
  },
  {
    id: "slot-2",
    label_ar: "اليوم (17:00 - 19:00)",
    label_en: "Today (5:00 PM - 7:00 PM)",
    date: "2026-08-31",
    isAvailable: true,
  },
  {
    id: "slot-3",
    label_ar: "غداً (10:00 - 12:00)",
    label_en: "Tomorrow (10:00 AM - 12:00 PM)",
    date: "2026-09-01",
    isAvailable: false, // Fully booked
  },
];

export const MOCK_VOUCHERS: Record<string, VoucherDefinition> = {
  SOUQI10: {
    code: "SOUQI10",
    discountPercent: 10,
    maxDiscount: 20,
    minSubtotal: 30,
    isValid: true,
    description_ar: "خصم 10% بحد أقصى 20 ₪ للطلبات فوق 30 ₪",
    description_en: "10% off up to 20 ₪ on orders above 30 ₪",
  },
  WELCOME20: {
    code: "WELCOME20",
    discountPercent: 20,
    maxDiscount: 50,
    minSubtotal: 50,
    isValid: true,
    description_ar: "خصم ترحيبي 20% بحد أقصى 50 ₪ للطلبات فوق 50 ₪",
    description_en: "20% welcome discount up to 50 ₪ on orders above 50 ₪",
  },
  EXPIRED50: {
    code: "EXPIRED50",
    discountPercent: 50,
    maxDiscount: 100,
    minSubtotal: 50,
    isValid: false,
    description_ar: "قسيمة منتهية الصلاحية",
    description_en: "Expired voucher",
  },
};

export const INITIAL_EMPTY_CART: Cart = {
  id: 1,
  seller: null,
  items: [],
  subtotal: "0.00",
  estimated_delivery: "0.00",
  discount_amount: "0.00",
  total: "0.00",
  has_blocking_issues: false,
};

export const INITIAL_DEMO_CART: Cart = {
  id: 1,
  seller: MOCK_ACTIVE_SELLER,
  items: MOCK_INITIAL_CART_ITEMS,
  subtotal: "180.00",
  estimated_delivery: "15.00",
  discount_amount: "0.00",
  total: "195.00",
  has_blocking_issues: true,
};
