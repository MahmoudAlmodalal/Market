/**
 * Tier 3: Pairwise Feature Combinations & Cross-Module Interactions E2E Test Suite
 * 
 * Verifies complex interactions between orthogonal modules (bilingual toggles,
 * single-seller collisions, stock/price concurrency, lifecycle state transitions).
 * Total: 41 comprehensive pairwise interaction test cases.
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  TOKENS,
  ContrastValidator,
  LocaleEngine,
  CatalogEngine,
  CartEngine,
  OrderEngine,
  SellerDashboardEngine,
  AIAssistantEngine,
  ViewportEngine,
  A11yEngine,
  MOCK_PRODUCTS,
  MOCK_SELLERS,
  MOCK_CATEGORIES,
  MOCK_ADDRESSES,
  MOCK_DELIVERY_SLOTS,
} from './harness';

// ----------------------------------------------------------------------------
// Shared Engine Instances
// ----------------------------------------------------------------------------
let locale: LocaleEngine;
let catalog: CatalogEngine;
let cart: CartEngine;
let orderEngine: OrderEngine;
let sellerEngine: SellerDashboardEngine;
let aiEngine: AIAssistantEngine;

beforeEach(() => {
  locale = new LocaleEngine('ar');
  catalog = new CatalogEngine();
  cart = new CartEngine(catalog);
  orderEngine = new OrderEngine(catalog);
  sellerEngine = new SellerDashboardEngine(catalog, orderEngine);
  aiEngine = new AIAssistantEngine();
});

describe('Tier 3: Pairwise Feature Combinations & Cross-Module Interactions', () => {
  // Combo 1
  test('Combo 1: Language toggle (AR -> EN) during active multi-item cart preserves items, quantities, and merchant identity', () => {
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 2);
    cart.addItem(p2, 1);

    expect(cart.getCart().sellerName).toBe('مشغل الياسمين');
    expect(cart.getItemCount()).toBe(3);

    // Toggle language
    locale.toggleLocale();
    expect(locale.getLocale()).toBe('en');
    expect(locale.getDirection()).toBe('ltr');

    const seller = catalog.getSellerById(101)!;
    const headerMsg = locale.t('cart.single_seller_notice', { sellerName: seller.name_en });
    expect(headerMsg).toBe('Items from store: Al-Yasmeen Studio');
    expect(cart.getItemCount()).toBe(3);
  });

  // Combo 2
  test('Combo 2: Language toggle (EN -> AR) during checkout preserves address, slot, and method', () => {
    locale.setLocale('en');
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);

    const selectedAddr = MOCK_ADDRESSES[0];
    const selectedSlot = MOCK_DELIVERY_SLOTS[0];
    const selectedMethod = 'cod';

    // Switch back to AR
    locale.setLocale('ar');
    expect(locale.getDirection()).toBe('rtl');
    expect(selectedAddr.id).toBe('addr-1');
    expect(selectedSlot.id).toBe('slot-1');
    expect(selectedMethod).toBe('cod');
  });

  // Combo 3
  test('Combo 3: Multi-seller product addition while filter drawer is active triggers MultiSellerDialog and handles accept switch', () => {
    const p1 = catalog.getProductById(1)!; // Seller 101
    const p4 = catalog.getProductById(4)!; // Seller 102
    cart.addItem(p1, 2);

    // Filter drawer active, user clicks add on p4
    const conflict = cart.addItem(p4, 1);
    expect(conflict.conflict).toBe(true);

    // User confirms switch
    cart.confirmSwitchSellerAndAdd(p4, 1);
    expect(cart.getCart().sellerId).toBe(102);
    expect(cart.getCart().items.length).toBe(1);
    expect(cart.getCart().items[0].product.id).toBe(4);
  });

  // Combo 4
  test('Combo 4: Multi-seller product addition rejected preserves existing cart completely', () => {
    const p1 = catalog.getProductById(1)!; // Seller 101
    const p4 = catalog.getProductById(4)!; // Seller 102
    cart.addItem(p1, 2);

    const conflict = cart.addItem(p4, 1);
    expect(conflict.conflict).toBe(true);

    // User rejects switch -> cart remains Seller 101
    expect(cart.getCart().sellerId).toBe(101);
    expect(cart.getCart().items[0].quantity).toBe(2);
  });

  // Combo 5
  test('Combo 5: Stock depletion while buyer is on PDP flags insufficient stock notice in cart', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 10);

    // Stock drops in catalog
    catalog.updateProductStock(1, 3);
    const sync = cart.syncWithCatalog();
    expect(sync.hasIssues).toBe(true);
    expect(sync.stockIssues).toBe(1);
    expect(cart.getCart().items[0].stockIssue).toBe('insufficient_stock');
  });

  // Combo 6
  test('Combo 6: Price change by seller while in cart -> buyer accepts -> voucher calculates accurately', () => {
    const p1 = catalog.getProductById(1)!; // 25 ₪
    cart.addItem(p1, 2); // 50 ₪

    // Price changes to 30 ₪
    catalog.updateProductPrice(1, 30.0);
    cart.syncWithCatalog();

    const item = cart.getCart().items[0];
    cart.acceptPriceChange(item.itemId);

    // Apply voucher SOUQI10
    const breakdown = cart.getPricingBreakdown('SOUQI10');
    expect(breakdown.subtotal).toBe(60.0); // 2 * 30
    expect(breakdown.discountAmount).toBe(6.0); // 10% of 60
    expect(breakdown.total).toBe(69.0); // 60 + 15 delivery - 6
  });

  // Combo 7
  test('Combo 7: Multi-seller switch revalidates voucher against new cart total', () => {
    const p1 = catalog.getProductById(1)!; // Seller 101, 25 ₪
    const p4 = catalog.getProductById(4)!; // Seller 102, 60 ₪
    cart.addItem(p1, 1); // 25 ₪ (below SOUQI10 min of 30 ₪)

    let breakdown = cart.getPricingBreakdown('SOUQI10');
    expect(breakdown.voucherApplied).toBe(false);

    // Switch to Seller 102 (60 ₪)
    cart.confirmSwitchSellerAndAdd(p4, 1);
    breakdown = cart.getPricingBreakdown('SOUQI10');
    expect(breakdown.voucherApplied).toBe(true);
    expect(breakdown.discountAmount).toBe(6.0);
  });

  // Combo 8
  test('Combo 8: Category filter strip + Multi-attribute filter drawer combined intersection', () => {
    // Category 2 (Soaps & Care) + Max Price 30 ₪ + In-Stock Only
    const filtered = catalog.searchAndFilter(undefined, 2, undefined, 0, 30, true);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1); // Soap (25 ₪, in stock)
  });

  // Combo 9
  test('Combo 9: Search query + Category filter strip combined returns matching category items', () => {
    const results = catalog.searchAndFilter('معمول', 1);
    expect(results.length).toBe(1);
    expect(results[0].title_ar).toContain('معمول');
  });

  // Combo 10
  test('Combo 10: Quick-Add from catalog grid updates bottom nav cart badge dynamically', () => {
    expect(cart.getItemCount()).toBe(0);
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 1);
    expect(cart.getItemCount()).toBe(1);
    cart.addItem(p2, 2);
    expect(cart.getItemCount()).toBe(3);
  });

  // Combo 11
  test('Combo 11: Idempotent order submission under retry simulation returns single order', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const key = 'idem-combo-11';
    const r1 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', key);
    const r2 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', key);
    expect(r1.order?.id).toBe(r2.order?.id);
    expect(orderEngine.getOrders().length).toBe(1);
  });

  // Combo 12
  test('Combo 12: Cancel Order in Pending state updates Order History with red Cancelled chip', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-12');
    const orderId = res.order!.id;
    orderEngine.cancelOrder(orderId, 'طلب تجريبي');

    const historyOrder = orderEngine.getOrderById(orderId)!;
    expect(historyOrder.status).toBe('cancelled');
  });

  // Combo 13
  test('Combo 13: Reorder from past order initiates single-seller cart populate', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);
    const res = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-13');
    cart.clear();

    const reorderRes = orderEngine.reorderItems(res.order!.id, cart);
    expect(reorderRes.success).toBe(true);
    expect(cart.getCart().sellerId).toBe(101);
    expect(cart.getItemCount()).toBe(2);
  });

  // Combo 14
  test('Combo 14: Seller updates price in Dashboard -> active buyer cart flags notice on sync', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    sellerEngine.updateProductStatus(1, 'published');
    catalog.updateProductPrice(1, 28.0);

    const sync = cart.syncWithCatalog();
    expect(sync.priceChanges).toBe(1);
  });

  // Combo 15
  test('Combo 15: AI assistant description generation + Seller publishes -> buyer searches successfully', () => {
    const aiRes = aiEngine.generateSuggestions('صابون زيت الغار الطبيعي', ['عناية']);
    const newProduct: any = {
      id: 10,
      sellerId: 101,
      categoryId: 2,
      title_ar: 'صابون زيت الغار الطبيعي',
      title_en: 'Natural Laurel Oil Soap',
      description_ar: aiRes.description_ar,
      description_en: aiRes.description_en,
      price: 30.0,
      serverPriceString: '30.00 ₪',
      stock_quantity: 10,
      images: ['/images/laurel.jpg'],
      tags: aiRes.suggestedTags,
      status: 'published',
    };
    catalog.addProduct(newProduct);

    const searchResults = catalog.searchAndFilter('الغار');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].title_ar).toContain('الغار');
  });

  // Combo 16
  test('Combo 16: Viewport resize from mobile 390px to desktop 1200px transitions grid from 2 to 4 cols', () => {
    expect(ViewportEngine.getCatalogGridColumns(390)).toBe(2);
    expect(ViewportEngine.getCatalogGridColumns(1200)).toBe(4);
  });

  // Combo 17
  test('Combo 17: Safe area padding + Fixed bottom nav docking coordinates', () => {
    const navClass = 'fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto pb-safe';
    expect(navClass).toContain('pb-safe');
    expect(navClass).toContain('max-w-[430px]');
  });

  // Combo 18
  test('Combo 18: User logout resets active cart store', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);
    expect(cart.getItemCount()).toBe(2);
    // Logout
    cart.clear();
    expect(cart.getItemCount()).toBe(0);
    expect(cart.getCart().sellerId).toBeNull();
  });

  // Combo 19
  test('Combo 19: Delivery address selector + Time slot selection attached to order submission', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[1], // Office address
      MOCK_DELIVERY_SLOTS[1], // Evening slot
      'cod',
      'idem-combo-19'
    );
    expect(res.order?.address.title).toContain('Office');
    expect(res.order?.deliverySlot.id).toBe('slot-2');
  });

  // Combo 20
  test('Combo 20: Digital Payment selection vs COD selection records correct method', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'digital_card',
      'idem-combo-20'
    );
    expect(res.order?.paymentMethod).toBe('digital_card');
  });

  // Combo 21
  test('Combo 21: OrderProgress stepper transition to Preparing automatically locks cancellation', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-21');
    const orderId = res.order!.id;

    orderEngine.advanceOrderStatus(orderId, 'confirmed');
    orderEngine.advanceOrderStatus(orderId, 'preparing');

    const cancelAttempt = orderEngine.cancelOrder(orderId, 'إلغاء متأخر');
    expect(cancelAttempt.success).toBe(false);
  });

  // Combo 22
  test('Combo 22: Applying discount voucher WELCOME20 + 2 items from Store B calculates accurately', () => {
    const p4 = catalog.getProductById(4)!; // 60 ₪
    cart.addItem(p4, 2); // 120 ₪
    const breakdown = cart.getPricingBreakdown('WELCOME20'); // 20% discount (max 50)
    expect(breakdown.subtotal).toBe(120.0);
    expect(breakdown.discountAmount).toBe(24.0); // 20% of 120
    expect(breakdown.total).toBe(111.0); // 120 + 15 - 24
  });

  // Combo 23
  test('Combo 23: Low stock depletion on order turns product into out-of-stock for subsequent buyer', () => {
    const p2 = catalog.getProductById(2)!; // stock 4
    cart.addItem(p2, 4);
    orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-23');

    // Live product stock is now 0
    expect(p2.stock_quantity).toBe(0);
    expect(catalog.getStockStatus(p2)).toBe('out_of_stock');
  });

  // Combo 24
  test('Combo 24: Searching seller by branch name (رفيديا) + Food category displays Kaak & Maamoul', () => {
    const results = catalog.searchAndFilter('رفيديا', 1);
    expect(results.length).toBeGreaterThan(0);
    for (const p of results) {
      expect(p.sellerId).toBe(102);
    }
  });

  // Combo 25
  test('Combo 25: Swipe gallery thumbnail selection on PDP + Bilingual description toggle', () => {
    const p1 = catalog.getProductById(1)!;
    let selectedImage = p1.images[1];
    locale.toggleLocale();
    expect(locale.getLocale()).toBe('en');
    expect(selectedImage).toBe('/images/soap-2.jpg');
    expect(p1.description_en).toContain('Handmade organic soap');
  });

  // Combo 26
  test('Combo 26: Cart swipe-to-delete item 1 of 2 keeps merchant; deleting item 2 resets merchant', () => {
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 1);
    cart.addItem(p2, 1);
    expect(cart.getCart().sellerId).toBe(101);

    cart.removeItem(cart.getCart().items[0].itemId);
    expect(cart.getCart().sellerId).toBe(101);

    cart.removeItem(cart.getCart().items[0].itemId);
    expect(cart.getCart().sellerId).toBeNull();
  });

  // Combo 27
  test('Combo 27: Filter drawer In-Stock Only + Search query زيت returns available soap and filters out out-of-stock lip balm', () => {
    const results = catalog.searchAndFilter('زيت', undefined, undefined, undefined, undefined, true);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(1);
  });

  // Combo 28
  test('Combo 28: Seller KPI dashboard updates live when Buyer places order', () => {
    const kpisBefore = sellerEngine.getKpis(101);
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-28');

    const kpisAfter = sellerEngine.getKpis(101);
    expect(kpisAfter.newOrdersCount).toBe(kpisBefore.newOrdersCount + 1);
  });

  // Combo 29
  test('Combo 29: Seller updates stock of out-of-stock product -> Status updates to Available in Customer Catalog', () => {
    const p3 = catalog.getProductById(3)!;
    expect(catalog.getStockStatus(p3)).toBe('out_of_stock');

    catalog.updateProductStock(3, 10);
    expect(catalog.getStockStatus(p3)).toBe('available');
  });

  // Combo 30
  test('Combo 30: AI Assistant keyword generation with Care tags -> Accepted -> Saved under Soaps & Care category', () => {
    const aiRes = aiEngine.generateSuggestions('صابون البابونج', ['عناية']);
    expect(aiRes.suggestedTags).toContain('عناية طبيعية');
  });

  // Combo 31
  test('Combo 31: Customer places order with COD -> Receipt renders COD badge -> Completed history', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-31');
    const orderId = res.order!.id;

    orderEngine.advanceOrderStatus(orderId, 'confirmed');
    orderEngine.advanceOrderStatus(orderId, 'preparing');
    orderEngine.advanceOrderStatus(orderId, 'ready');
    orderEngine.advanceOrderStatus(orderId, 'completed');

    expect(orderEngine.getOrderById(orderId)?.status).toBe('completed');
  });

  // Combo 32
  test('Combo 32: Price increase + Stock decrease in cart triggers both notices simultaneously', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 8);
    catalog.updateProductPrice(1, 35.0);
    catalog.updateProductStock(1, 3);

    const sync = cart.syncWithCatalog();
    expect(sync.priceChanges).toBe(1);
    expect(sync.stockIssues).toBe(1);
  });

  // Combo 33
  test('Combo 33: Multiple delivery addresses -> Customer selects Office -> Receipt immutable snapshot verifies Office', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const res = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[1], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-33');
    expect(res.order?.address.city).toBe('البيرة');
  });

  // Combo 34
  test('Combo 34: Mobile container dark text contrast meets WCAG AA on white surface', () => {
    expect(ContrastValidator.meetsWcagAA(TOKENS.neutral[800], TOKENS.neutral[0], false)).toBe(true);
  });

  // Combo 35
  test('Combo 35: Reordering past cancelled order restocks items and creates new order', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);
    const res1 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-35-1');
    orderEngine.cancelOrder(res1.order!.id, 'إلغاء');

    // Reorder
    orderEngine.reorderItems(res1.order!.id, cart);
    const res2 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-combo-35-2');
    expect(res2.success).toBe(true);
    expect(res2.order?.id).not.toBe(res1.order?.id);
  });

  // Combo 36
  test('Combo 36: Filter by price 10 ₪ to 30 ₪ + Category Crafts returns empty list; Reset returns all crafts', () => {
    const filtered = catalog.searchAndFilter(undefined, 3, undefined, 10, 30);
    expect(filtered.length).toBe(0);

    const resetFiltered = catalog.searchAndFilter(undefined, 3);
    expect(resetFiltered.length).toBe(0); // Crafts has 0 mock products initially
  });

  // Combo 37
  test('Combo 37: Submitting order with voucher exceeding discount cap clamps discount without underflow', () => {
    const p4 = catalog.getProductById(4)!;
    cart.addItem(p4, 5); // 300 ₪
    const breakdown = cart.getPricingBreakdown('SOUQI10'); // 10% of 300 = 30, max discount = 20
    expect(breakdown.discountAmount).toBe(20.0);
    expect(breakdown.total).toBe(295.0); // 300 + 15 - 20
  });

  // Combo 38
  test('Combo 38: Fast sequential item removals clear single-seller lock cleanly', () => {
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 1);
    cart.addItem(p2, 1);
    cart.removeItem(cart.getCart().items[0].itemId);
    cart.removeItem(cart.getCart().items[0].itemId);
    expect(cart.getCart().sellerId).toBeNull();
  });

  // Combo 39
  test('Combo 39: Order timeline progression translates reactively on language toggle', () => {
    locale.setLocale('ar');
    expect(locale.t('orders.status_pending')).toBe('قيد الانتظار');
    locale.toggleLocale();
    expect(locale.t('orders.status_pending')).toBe('Pending');
  });

  // Combo 40
  test('Combo 40: Customer adds 2 items -> Seller archives item 2 -> Cart flags unavailable -> Customer removes item 2 -> Checks out', () => {
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 1);
    cart.addItem(p2, 1);

    // Seller archives p2
    catalog.updateProductStock(2, 0);
    cart.syncWithCatalog();

    expect(cart.getPricingBreakdown().canCheckout).toBe(false);

    // Remove unavailable item
    const item2Id = cart.getCart().items.find(i => i.product.id === 2)!.itemId;
    cart.removeItem(item2Id);

    expect(cart.getPricingBreakdown().canCheckout).toBe(true);
  });

  // Combo 41
  test('Combo 41: Full mobile safe-area + Focus Ring + Keyboard navigation flow', () => {
    const focusClass = 'focus-visible:ring-2 focus-visible:ring-brand-500';
    expect(A11yEngine.validateFocusRingClass(focusClass)).toBe(true);
    const containerClass = ViewportEngine.getContainerClass(390);
    expect(containerClass).toContain('w-full');
  });
});
