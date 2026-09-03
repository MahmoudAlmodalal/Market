import type { Order, OrderStatus, OrderTimelineItem, Address, OrderSeller } from "@/types/order";

// Deterministic fixed base timestamp (2026-09-03T10:00:00.000Z) to prevent SSR/client hydration mismatches
const MOCK_BASE_TIME = 1788429600000;

/**
 * Initial Authoritative Mock Orders Dataset
 * Covers all 6 lifecycle statuses: pending, confirmed, preparing, ready, completed, cancelled.
 */
export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    order_number: "SQ-1001",
    status: "pending",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      phone: "+970 59-911-2233",
    },
    items: [
      {
        id: 1,
        product_id: 1,
        product_name_snapshot: "صابون زيت زيتون بلدي باللافندر الطبيعي",
        unit_price_snapshot: "25.00",
        quantity: 2,
        line_total: "50.00",
        primary_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 2,
        product_id: 2,
        product_name_snapshot: "مقشر الجسم العضوي بالقهوة واللوز",
        unit_price_snapshot: "35.00",
        quantity: 1,
        line_total: "35.00",
        primary_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "85.00",
    delivery_fee: "15.00",
    total: "100.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، حي الرمال، شارع عمر المختار بجانب بنك فلسطين، عمارة الأمل، ط 3",
    item_count: 3,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 25).toISOString(), // 25 mins ago
    notes: "يرجى تغليف العبوة كهدية بعناية مع الشكر",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 25).toISOString(),
        note: "تم استلام الطلب وبانتظار تأكيد المتجر للبدء بالتجهيز",
      },
    ],
  },
  {
    id: 1002,
    order_number: "SQ-1002",
    status: "confirmed",
    seller: {
      id: 102,
      business_name: "مطبخ أم خليل للحلويات البيتية",
      phone: "+970 59-944-5566",
    },
    items: [
      {
        id: 3,
        product_id: 4,
        product_name_snapshot: "معمول تمر بلدي بالسمن البلدي (1 كغم)",
        unit_price_snapshot: "60.00",
        quantity: 2,
        line_total: "120.00",
        primary_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 4,
        product_id: 5,
        product_name_snapshot: "زعتر بلدي متبل مع سمسم محمص فاخر (500 غرام)",
        unit_price_snapshot: "20.00",
        quantity: 1,
        line_total: "20.00",
        primary_image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "140.00",
    delivery_fee: "15.00",
    total: "155.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، حي النصر، شارع اللبابيدي، مقابل مدرسة الهدى",
    item_count: 3,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    notes: "الاتصال عند الوصول",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 90).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "confirmed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 75).toISOString(),
        note: "تمت مراجعة وتأكيد توفر كافة المكونات من قبل المتجر",
      },
    ],
  },
  {
    id: 1003,
    order_number: "SQ-1003",
    status: "preparing",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      phone: "+970 59-911-2233",
    },
    items: [
      {
        id: 5,
        product_id: 6,
        product_name_snapshot: "زيت لافندر عطري نقي مستخلص بالتقطير (50 مل)",
        unit_price_snapshot: "45.00",
        quantity: 1,
        line_total: "45.00",
        primary_image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 6,
        product_id: 7,
        product_name_snapshot: "شاي أعشاب جبلية طبيعية مهدئة للأعصاب",
        unit_price_snapshot: "18.00",
        quantity: 2,
        line_total: "36.00",
        primary_image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "81.00",
    delivery_fee: "15.00",
    total: "96.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، شارع الوحدة، بجوار مجمع الشفاء الطبي",
    item_count: 3,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 180).toISOString(), // 3 hours ago
    notes: "",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 180).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "confirmed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 150).toISOString(),
        note: "تم تأكيد الطلب من الحرفي",
      },
      {
        from_status: "confirmed",
        to_status: "preparing",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 45).toISOString(),
        note: "يقوم الحرفي حالياً بتحضير وتغليف الزيوت والأعشاب",
      },
    ],
  },
  {
    id: 1004,
    order_number: "SQ-1004",
    status: "ready",
    seller: {
      id: 103,
      business_name: "شموع الواحة",
      phone: "+970 59-977-8899",
    },
    items: [
      {
        id: 7,
        product_id: 8,
        product_name_snapshot: "شمعة صويا طبيعية معطرة برائحة العود والعنبر",
        unit_price_snapshot: "50.00",
        quantity: 2,
        line_total: "100.00",
        primary_image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "100.00",
    delivery_fee: "15.00",
    total: "115.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، تل الهوى، بالقرب من مستشفى القدس",
    item_count: 2,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 300).toISOString(), // 5 hours ago
    notes: "شحنة قابلة للكسر",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 300).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "confirmed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 240).toISOString(),
        note: "تم تأكيد توفر الشموع",
      },
      {
        from_status: "confirmed",
        to_status: "preparing",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 120).toISOString(),
        note: "تم صب وتجهيز الشموع بعناية",
      },
      {
        from_status: "preparing",
        to_status: "ready",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 15).toISOString(),
        note: "الطلب جاهز للتسليم، وجاري التنسيق مع مندوب التوصيل",
      },
    ],
  },
  {
    id: 1005,
    order_number: "SQ-1005",
    status: "completed",
    seller: {
      id: 101,
      business_name: "مشغل الياسمين",
      phone: "+970 59-911-2233",
    },
    items: [
      {
        id: 8,
        product_id: 1,
        product_name_snapshot: "صابون زيت زيتون بلدي باللافندر الطبيعي",
        unit_price_snapshot: "25.00",
        quantity: 3,
        line_total: "75.00",
        primary_image: "https://images.unsplash.com/photo-1607006314644-8854c86d8a39?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "75.00",
    delivery_fee: "15.00",
    total: "90.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، حي الرمال، شارع عمر المختار",
    item_count: 3,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    notes: "",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 48).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "confirmed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 47).toISOString(),
        note: "تم تأكيد الطلب",
      },
      {
        from_status: "confirmed",
        to_status: "preparing",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 44).toISOString(),
        note: "تم التجهيز والتغليف",
      },
      {
        from_status: "preparing",
        to_status: "ready",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 40).toISOString(),
        note: "تم تسليم الطلب للمندوب",
      },
      {
        from_status: "ready",
        to_status: "completed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 38).toISOString(),
        note: "تم استلام الطلب من قبل العميل بنجاح وتم تحصيل المبلغ نقداً",
      },
    ],
  },
  {
    id: 1006,
    order_number: "SQ-1006",
    status: "cancelled",
    seller: {
      id: 102,
      business_name: "مطبخ أم خليل للحلويات البيتية",
      phone: "+970 59-944-5566",
    },
    items: [
      {
        id: 9,
        product_id: 4,
        product_name_snapshot: "معمول تمر بلدي بالسمن البلدي (1 كغم)",
        unit_price_snapshot: "60.00",
        quantity: 1,
        line_total: "60.00",
        primary_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "60.00",
    delivery_fee: "15.00",
    total: "75.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، حي النصر",
    item_count: 1,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    cancellation_reason: "طلب بالخطأ - تم تعديل العنوان وإلغاء الطلب القديم",
    notes: "",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 72).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "cancelled",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 71).toISOString(),
        note: "تم إلغاء الطلب بناءً على رغبة العميل وإعادة حجز المخزون",
      },
    ],
  },
  {
    id: 1007,
    order_number: "SQ-1007",
    status: "completed",
    seller: {
      id: 104,
      business_name: "خيوط وفنون للتطريز الفلسطيني",
      phone: "+970 59-933-4455",
    },
    items: [
      {
        id: 10,
        product_id: 10,
        product_name_snapshot: "حقيبة قماشية مطرزة تطريزاً فلاحياً يدوياً بنقشة شجرة السرو",
        unit_price_snapshot: "70.00",
        quantity: 1,
        line_total: "70.00",
        primary_image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 11,
        product_id: 11,
        product_name_snapshot: "ميدالية مفاتيح مطرزة بتطريز تقليدي",
        unit_price_snapshot: "15.00",
        quantity: 2,
        line_total: "30.00",
        primary_image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: "100.00",
    delivery_fee: "15.00",
    total: "115.00",
    contact_name: "محمود أحمد",
    contact_phone: "+970 59-912-3456",
    delivery_address: "فلسطين، غزة، حي الرمال الجنوبي، شارع الشهداء",
    item_count: 3,
    created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    notes: "",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 120).toISOString(),
        note: "تم استلام الطلب",
      },
      {
        from_status: "pending",
        to_status: "confirmed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 118).toISOString(),
        note: "تم تأكيد الطلب",
      },
      {
        from_status: "confirmed",
        to_status: "preparing",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 100).toISOString(),
        note: "تم التطريز والتغليف",
      },
      {
        from_status: "preparing",
        to_status: "ready",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 96).toISOString(),
        note: "جاهز للتسليم",
      },
      {
        from_status: "ready",
        to_status: "completed",
        created_at: new Date(MOCK_BASE_TIME - 1000 * 60 * 60 * 90).toISOString(),
        note: "تم الاستلام بنجاح",
      },
    ],
  },
];

const STORAGE_KEY = "souqi_mock_orders_v1";

/**
 * Reads orders from localStorage if in client environment, else initial dataset
 */
export function getMockOrders(): Order[] {
  if (typeof window === "undefined") {
    return INITIAL_MOCK_ORDERS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return INITIAL_MOCK_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_MOCK_ORDERS;
  } catch {
    return INITIAL_MOCK_ORDERS;
  }
}

/**
 * Saves current orders to localStorage
 */
export function saveMockOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to save orders to localStorage:", err);
  }
}

/**
 * Retrieves a single order by ID or order_number
 */
export function getOrderById(id: number | string): Order | undefined {
  const orders = getMockOrders();
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return orders.find(
    (o) => o.id === numId || o.order_number === String(id) || String(o.id) === String(id)
  );
}

/**
 * Retrieves orders filtered by status category
 */
export function getOrdersByStatus(status: OrderStatus | "active" | "all"): Order[] {
  const orders = getMockOrders();
  if (status === "all") return orders;
  if (status === "active") {
    return orders.filter((o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status));
  }
  return orders.filter((o) => o.status === status);
}

/**
 * Retrieves orders placed with a specific seller
 */
export function getOrdersBySeller(sellerId: number): Order[] {
  const orders = getMockOrders();
  return orders.filter((o) => o.seller?.id === sellerId);
}

/**
 * Sequential order status sequence
 */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

/**
 * Advances an order to next status or specific status
 */
export function advanceOrderStatus(
  orderId: number,
  targetStatus?: OrderStatus,
  note?: string
): { success: boolean; order?: Order; error?: string } {
  const orders = getMockOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: "الطلب غير موجود" };
  }

  const order = { ...orders[index] };
  if (order.status === "completed" || order.status === "cancelled") {
    return { success: false, error: "لا يمكن تعديل حالة طلب مكتمل أو ملغي" };
  }

  let nextStatus = targetStatus;
  if (!nextStatus) {
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < ORDER_STATUS_SEQUENCE.length - 1) {
      nextStatus = ORDER_STATUS_SEQUENCE[currentIndex + 1];
    } else {
      return { success: false, error: "الطلب وصل للمرحلة النهائية" };
    }
  }

  const defaultNotes: Record<OrderStatus, string> = {
    pending: "تم إنشاء الطلب",
    confirmed: "تم تأكيد توفر كافة المنتجات من قبل المتجر",
    preparing: "جاري تجهيز وتغليف المنتجات بعناية",
    ready: "الطلب جاهز للتسليم وجاري التنسيق مع مندوب التوصيل",
    completed: "تم استلام الطلب بنجاح",
    cancelled: "تم إلغاء الطلب",
  };

  const timelineItem: OrderTimelineItem = {
    from_status: order.status,
    to_status: nextStatus,
    created_at: new Date().toISOString(),
    note: note || defaultNotes[nextStatus],
  };

  order.status = nextStatus;
  order.timeline = [...(order.timeline || []), timelineItem];

  orders[index] = order;
  saveMockOrders(orders);

  return { success: true, order };
}

/**
 * Updates an order directly to any status (useful for live UI simulation and testing)
 */
export function updateOrderStatusDirectly(
  orderId: number,
  targetStatus: OrderStatus,
  note?: string
): { success: boolean; order?: Order; error?: string } {
  const orders = getMockOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: "الطلب غير موجود" };
  }

  const order = { ...orders[index] };
  const defaultNotes: Record<OrderStatus, string> = {
    pending: "تم استلام الطلب وبانتظار تأكيد المتجر للبدء بالتجهيز",
    confirmed: "تمت مراجعة وتأكيد توفر كافة المكونات من قبل المتجر",
    preparing: "يقوم الحرفي حالياً بتحضير وتغليف المنتجات بعناية",
    ready: "الطلب جاهز للتسليم، وجاري التنسيق مع مندوب التوصيل",
    completed: "تم استلام الطلب من قبل العميل بنجاح وتم تحصيل المبلغ",
    cancelled: "تم إلغاء الطلب وإعادة حجز المنتجات للمخزون",
  };

  const timelineItem: OrderTimelineItem = {
    from_status: order.status,
    to_status: targetStatus,
    created_at: new Date().toISOString(),
    note: note || defaultNotes[targetStatus],
  };

  order.status = targetStatus;
  if (targetStatus === "cancelled") {
    order.cancellation_reason = note || "إلغاء تجريبي بواسطة العميل";
  }
  order.timeline = [...(order.timeline || []), timelineItem];

  orders[index] = order;
  saveMockOrders(orders);

  return { success: true, order };
}


/**
 * Customer Cancellation Gate: Allowed ONLY when status is "pending" or "confirmed"
 */
export function cancelOrder(
  orderId: number,
  reason: string
): { success: boolean; order?: Order; error?: string } {
  const orders = getMockOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: "الطلب غير موجود" };
  }

  const order = { ...orders[index] };

  const statusNamesAr: Record<OrderStatus, string> = {
    pending: "قيد الانتظار",
    confirmed: "تم التأكيد",
    preparing: "جاري التجهيز",
    ready: "جاهز للتسليم",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  // Strict check: Cancellation is strictly disallowed if already preparing/ready/completed
  if (order.status !== "pending" && order.status !== "confirmed") {
    const statusAr = statusNamesAr[order.status] || order.status;
    return {
      success: false,
      error: `لا يمكن إلغاء الطلب في مرحلة "${statusAr}". الإلغاء متاح فقط في مرحلتي قيد الانتظار وتم التأكيد.`,
    };
  }

  const timelineItem: OrderTimelineItem = {
    from_status: order.status,
    to_status: "cancelled",
    created_at: new Date().toISOString(),
    note: `تم إلغاء الطلب بواسطة العميل: ${reason}`,
  };

  order.status = "cancelled";
  order.cancellation_reason = reason;
  order.timeline = [...(order.timeline || []), timelineItem];

  orders[index] = order;
  saveMockOrders(orders);

  return { success: true, order };
}

/**
 * Creates and registers a new mock order
 */
export function createMockOrder(payload: Partial<Order>): Order {
  const orders = getMockOrders();
  const newId = 1000 + orders.length + 1;
  const orderNumber = `SQ-${newId}`;

  const defaultSeller: OrderSeller = {
    id: 101,
    business_name: "مشغل الياسمين",
    phone: "+970 59-911-2233",
  };

  const newOrder: Order = {
    id: newId,
    order_number: orderNumber,
    status: "pending",
    seller: payload.seller || defaultSeller,
    items: payload.items || [],
    subtotal: payload.subtotal || "0.00",
    delivery_fee: payload.delivery_fee || "15.00",
    total: payload.total || "15.00",
    contact_name: payload.contact_name || "محمود أحمد",
    contact_phone: payload.contact_phone || "+970 59-912-3456",
    delivery_address: payload.delivery_address || "فلسطين، غزة، حي الرمال",
    item_count: payload.items ? payload.items.reduce((sum, i) => sum + i.quantity, 0) : 0,
    created_at: new Date().toISOString(),
    notes: payload.notes || "",
    timeline: [
      {
        from_status: null,
        to_status: "pending",
        created_at: new Date().toISOString(),
        note: "تم استلام الطلب بنجاح وبانتظار تأكيد المتجر",
      },
    ],
  };

  orders.unshift(newOrder);
  saveMockOrders(orders);
  return newOrder;
}
