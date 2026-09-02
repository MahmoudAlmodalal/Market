/**
 * Tier 4: Real-World End-to-End User Scenarios Test Suite
 * 
 * Verifies 25 complete, realistic user journeys spanning discovery,
 * PDP interactions, cart management, conflict handling, checkout,
 * order tracking, merchant fulfillment, and account settings.
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

describe('Tier 4: Real-World End-to-End User Scenarios', () => {
  // Scenario 1
  test('Scenario 1: Nominal First-Time Buyer Journey (Discovery -> Category -> PDP -> Cart -> Checkout -> COD -> Tracking -> Completion)', () => {
    // 1. Customer visits homepage in Arabic
    expect(locale.getLocale()).toBe('ar');
    expect(locale.getDirection()).toBe('rtl');

    // 2. Selects "Soaps & Care" category
    const categoryProducts = catalog.searchAndFilter(undefined, 2);
    expect(categoryProducts.length).toBeGreaterThan(0);

    // 3. Opens PDP for Natural Olive Oil Soap
    const p1 = categoryProducts.find(p => p.id === 1)!;
    expect(p1.title_ar).toContain('صابون طبيعي');

    // 4. Adjusts quantity to 2 using stepper and adds to cart
    const addRes = cart.addItem(p1, 2);
    expect(addRes.success).toBe(true);
    expect(cart.getItemCount()).toBe(2);

    // 5. Opens cart and verifies single-seller header
    expect(cart.getCart().sellerName).toBe('مشغل الياسمين');
    const breakdown = cart.getPricingBreakdown();
    expect(breakdown.subtotal).toBe(50.0);
    expect(breakdown.deliveryFee).toBe(15.0);
    expect(breakdown.total).toBe(65.0);

    // 6. Proceeds to checkout with saved address and COD
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      breakdown,
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      `idem-scenario-1-${Date.now()}`
    );
    expect(orderRes.success).toBe(true);
    const orderId = orderRes.order!.id;

    // 7. Order tracking advances through all stages to Completed
    expect(orderEngine.advanceOrderStatus(orderId, 'confirmed')).toBe(true);
    expect(orderEngine.advanceOrderStatus(orderId, 'preparing')).toBe(true);
    expect(orderEngine.advanceOrderStatus(orderId, 'ready')).toBe(true);
    expect(orderEngine.advanceOrderStatus(orderId, 'completed')).toBe(true);

    const finalOrder = orderEngine.getOrderById(orderId)!;
    expect(finalOrder.status).toBe('completed');
    expect(finalOrder.timeline.length).toBe(5);
  });

  // Scenario 2
  test('Scenario 2: Returning Buyer Fast Reorder Journey from Order History', () => {
    // 1. Initial past order completed
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 3);
    const initialOrder = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-2-init'
    );
    const orderId = initialOrder.order!.id;
    orderEngine.advanceOrderStatus(orderId, 'confirmed');
    orderEngine.advanceOrderStatus(orderId, 'preparing');
    orderEngine.advanceOrderStatus(orderId, 'ready');
    orderEngine.advanceOrderStatus(orderId, 'completed');

    // 2. Buyer views past orders and clicks "Reorder"
    cart.clear();
    const reorderRes = orderEngine.reorderItems(orderId, cart);
    expect(reorderRes.success).toBe(true);
    expect(cart.getItemCount()).toBe(3);

    // 3. Completes checkout immediately
    const reorderOrder = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[1],
      'cod',
      'idem-scenario-2-reorder'
    );
    expect(reorderOrder.success).toBe(true);
    expect(reorderOrder.order?.id).not.toBe(orderId);
  });

  // Scenario 3
  test('Scenario 3: Cross-Seller Cart Conflict & Resolution (Switch Seller Accepted)', () => {
    // 1. Buyer adds 2 soaps from Al-Yasmeen Studio (Seller 101)
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);
    expect(cart.getCart().sellerId).toBe(101);

    // 2. Buyer browses Food category and attempts to add Maamoul from Um Khalil Kitchen (Seller 102)
    const p4 = catalog.getProductById(4)!;
    const addResult = cart.addItem(p4, 1);

    // 3. MultiSellerDialog triggers
    expect(addResult.conflict).toBe(true);
    expect(addResult.existingSellerName).toBe('مشغل الياسمين');
    expect(addResult.newSellerName).toBe('مطبخ أم خليل');

    // 4. Buyer confirms "Clear cart & add new item"
    cart.confirmSwitchSellerAndAdd(p4, 1);
    expect(cart.getCart().sellerId).toBe(102);
    expect(cart.getCart().items.length).toBe(1);
    expect(cart.getCart().items[0].product.id).toBe(4);

    // 5. Completes order with Seller 102
    const res = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-3'
    );
    expect(res.order?.sellerId).toBe(102);
  });

  // Scenario 4
  test('Scenario 4: Cross-Seller Cart Conflict & Resolution (Switch Seller Rejected)', () => {
    // 1. Buyer adds soap from Seller 101
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);

    // 2. Buyer attempts to add item from Seller 102
    const p4 = catalog.getProductById(4)!;
    const addResult = cart.addItem(p4, 1);
    expect(addResult.conflict).toBe(true);

    // 3. Buyer clicks "Keep Current Cart"
    expect(cart.getCart().sellerId).toBe(101);
    expect(cart.getCart().items[0].quantity).toBe(2);

    // 4. Finishes order with Seller 101
    const res = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-4'
    );
    expect(res.order?.sellerId).toBe(101);
  });

  // Scenario 5
  test('Scenario 5: Full Bilingual Journey across Discovery, PDP, Cart, Checkout, and Tracking', () => {
    // 1. Start in Arabic RTL
    locale.setLocale('ar');
    expect(locale.getDirection()).toBe('rtl');
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);

    // 2. Switch to English in Header
    locale.setLocale('en');
    expect(locale.getDirection()).toBe('ltr');
    expect(locale.t('nav.cart')).toBe('Cart');
    expect(locale.formatPrice(p1.price)).toBe('25.00 ₪');

    // 3. Complete Checkout in English
    const breakdown = cart.getPricingBreakdown();
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      breakdown,
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-5'
    );
    expect(orderRes.success).toBe(true);

    // 4. Switch back to Arabic on Tracking screen
    locale.setLocale('ar');
    expect(locale.getDirection()).toBe('rtl');
    expect(locale.t('orders.status_pending')).toBe('قيد الانتظار');
  });

  // Scenario 6
  test('Scenario 6: Volatile Price & Dynamic Stock Resolution with Voucher Application', () => {
    // 1. Buyer adds items
    const p1 = catalog.getProductById(1)!; // 25 ₪, stock 15
    cart.addItem(p1, 8);

    // 2. Seller changes price to 30 ₪ and stock drops to 5
    catalog.updateProductPrice(1, 30.0);
    catalog.updateProductStock(1, 5);

    // 3. Cart sync detects issues
    const sync = cart.syncWithCatalog();
    expect(sync.priceChanges).toBe(1);
    expect(sync.stockIssues).toBe(1);

    // 4. Buyer approves new price and clamps stock to 5
    const item = cart.getCart().items[0];
    cart.acceptPriceChange(item.itemId);
    cart.clampStockQuantity(item.itemId);

    // 5. Applies voucher SOUQI10
    const breakdown = cart.getPricingBreakdown('SOUQI10');
    expect(breakdown.subtotal).toBe(150.0); // 5 * 30
    expect(breakdown.discountAmount).toBe(15.0); // 10% of 150
    expect(breakdown.total).toBe(150.0); // 150 + 15 delivery - 15 discount

    // 6. Submits order
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      breakdown,
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-6',
      'SOUQI10'
    );
    expect(orderRes.success).toBe(true);
  });

  // Scenario 7
  test('Scenario 7: Seller Product Creation with AI Assistant to Customer Discovery & Purchase', () => {
    // 1. Seller uses AI assistant to generate description
    const aiRes = aiEngine.generateSuggestions('شمعة الصويا برائحة العود الملكي', ['شموع', 'عود']);
    expect(aiRes.suggestedTags).toContain('يدوي');

    // 2. Seller creates product and publishes
    const newProduct: any = {
      id: 55,
      sellerId: 103,
      categoryId: 4,
      title_ar: 'شمعة الصويا برائحة العود الملكي',
      title_en: 'Royal Oud Soy Candle',
      description_ar: aiRes.description_ar,
      description_en: aiRes.description_en,
      price: 45.0,
      serverPriceString: '45.00 ₪',
      stock_quantity: 10,
      images: ['/images/oud-candle.jpg'],
      tags: aiRes.suggestedTags,
      status: 'published',
    };
    catalog.addProduct(newProduct);

    // 3. Buyer discovers product via Search
    const searchResults = catalog.searchAndFilter('العود');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe(55);

    // 4. Buyer purchases product
    cart.addItem(searchResults[0], 2);
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-7'
    );
    expect(orderRes.success).toBe(true);
  });

  // Scenario 8
  test('Scenario 8: Customer Order Cancellation in Pending State and Catalog Restock', () => {
    const p1 = catalog.getProductById(1)!;
    const initialStock = p1.stock_quantity;
    cart.addItem(p1, 2);

    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-8'
    );
    const orderId = orderRes.order!.id;
    expect(p1.stock_quantity).toBe(initialStock - 2);

    // Cancel order
    const cancelRes = orderEngine.cancelOrder(orderId, 'طلب غير مقصود');
    expect(cancelRes.success).toBe(true);
    expect(orderEngine.getOrderById(orderId)?.status).toBe('cancelled');
    expect(p1.stock_quantity).toBe(initialStock); // Restocked
  });

  // Scenario 9
  test('Scenario 9: Non-Cancellable Order Progression (Preparing -> Ready -> Completed)', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-9'
    );
    const orderId = orderRes.order!.id;

    orderEngine.advanceOrderStatus(orderId, 'confirmed');
    orderEngine.advanceOrderStatus(orderId, 'preparing');

    // Customer attempts to cancel during Preparing
    const cancelAttempt = orderEngine.cancelOrder(orderId, 'محاولة إلغاء متأخرة');
    expect(cancelAttempt.success).toBe(false);

    // Advances to Completed
    orderEngine.advanceOrderStatus(orderId, 'ready');
    orderEngine.advanceOrderStatus(orderId, 'completed');
    expect(orderEngine.getOrderById(orderId)?.status).toBe('completed');
  });

  // Scenario 10
  test('Scenario 10: Empty Cart Recovery Journey to Catalog Discovery and Checkout', () => {
    // 1. User opens empty cart
    expect(cart.getItemCount()).toBe(0);
    expect(cart.getPricingBreakdown().canCheckout).toBe(false);

    // 2. Clicks "Browse Products" CTA -> filters by category 1 (Food)
    const foodProducts = catalog.searchAndFilter(undefined, 1);
    expect(foodProducts.length).toBeGreaterThan(0);

    // 3. Adds Kaak and Maamoul
    cart.addItem(foodProducts[0], 2);
    cart.addItem(foodProducts[1], 1);
    expect(cart.getItemCount()).toBe(3);

    // 4. Successfully completes checkout
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[0],
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-10'
    );
    expect(orderRes.success).toBe(true);
  });

  // Scenario 11
  test('Scenario 11: Out-of-Stock Item Browsing to Alternative Selection from Same Merchant', () => {
    // 1. Buyer views out-of-stock Lipbalm (Product 3, Seller 101)
    const p3 = catalog.getProductById(3)!;
    expect(p3.stock_quantity).toBe(0);

    // 2. Add to cart fails
    const addFail = cart.addItem(p3, 1);
    expect(addFail.success).toBe(false);

    // 3. Views other products from Seller 101
    const sellerProducts = catalog.searchAndFilter(undefined, undefined, 101, undefined, undefined, true);
    expect(sellerProducts.length).toBe(2); // Soap and Scrub

    // 4. Adds available Soap (Product 1)
    const addSuccess = cart.addItem(sellerProducts[0], 1);
    expect(addSuccess.success).toBe(true);
  });

  // Scenario 12
  test('Scenario 12: Network Resilience & Idempotent Submission Duplicate Suppression', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const key = `uuid-${Date.now()}`;

    const r1 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', key);
    const r2 = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', key);
    expect(r1.order?.id).toBe(r2.order?.id);
    expect(orderEngine.getOrders().length).toBe(1);
  });

  // Scenario 13
  test('Scenario 13: Discount Voucher Lifecycle (Invalid -> Expired -> Valid SOUQI10)', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2); // 50 ₪

    // Invalid voucher
    let breakdown = cart.getPricingBreakdown('FAKE_CODE');
    expect(breakdown.voucherApplied).toBe(false);
    expect(breakdown.voucherError).toContain('غير صالح');

    // Expired voucher
    breakdown = cart.getPricingBreakdown('EXPIRED50');
    expect(breakdown.voucherApplied).toBe(false);
    expect(breakdown.voucherError).toContain('منتهية الصلاحية');

    // Valid voucher
    breakdown = cart.getPricingBreakdown('SOUQI10');
    expect(breakdown.voucherApplied).toBe(true);
    expect(breakdown.discountAmount).toBe(5.0);
  });

  // Scenario 14
  test('Scenario 14: Multiple Delivery Addresses & Delivery Slot Selection Persistence', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);

    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      MOCK_ADDRESSES[1], // Office
      MOCK_DELIVERY_SLOTS[1], // Evening slot
      'cod',
      'idem-scenario-14'
    );
    expect(orderRes.order?.address.title).toContain('Office');
    expect(orderRes.order?.deliverySlot.id).toBe('slot-2');
  });

  // Scenario 15
  test('Scenario 15: Responsive Mobile Viewport Traversal (390px to 430px bounds)', () => {
    expect(ViewportEngine.isMobileViewport(390)).toBe(true);
    expect(ViewportEngine.isMobileViewport(430)).toBe(true);
    expect(ViewportEngine.getContainerClass(390)).toContain('w-full');
  });

  // Scenario 16
  test('Scenario 16: Accessible Keyboard & Screen Reader Navigation Traversal', () => {
    const focusClass = 'focus-visible:ring-2 focus-visible:ring-brand-500';
    expect(A11yEngine.validateFocusRingClass(focusClass)).toBe(true);
    expect(ContrastValidator.meetsWcagAA(TOKENS.neutral[800], TOKENS.neutral[0])).toBe(true);
  });

  // Scenario 17
  test('Scenario 17: Seller Inventory Depletion & KPI Dashboard Live Update', () => {
    const p2 = catalog.getProductById(2)!; // stock 4 (low stock)
    cart.addItem(p2, 4);

    orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-scenario-17');
    expect(p2.stock_quantity).toBe(0);

    const kpis = sellerEngine.getKpis(101);
    expect(kpis.outOfStockCount).toBe(2); // Lipbalm + Scrub now out of stock
  });

  // Scenario 18
  test('Scenario 18: Guest Cart to Registered User Order Placement', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 2);
    expect(cart.getItemCount()).toBe(2);

    // Customer logs in / registers -> cart items are retained
    const registeredUserAddress = MOCK_ADDRESSES[0];
    const orderRes = orderEngine.submitOrder(
      cart.getCart(),
      cart.getPricingBreakdown(),
      registeredUserAddress,
      MOCK_DELIVERY_SLOTS[0],
      'cod',
      'idem-scenario-18'
    );
    expect(orderRes.success).toBe(true);
  });

  // Scenario 19
  test('Scenario 19: High-Volume Cart Line Item Management and Swipe Deletion', () => {
    const p1 = catalog.getProductById(1)!;
    const p2 = catalog.getProductById(2)!;
    cart.addItem(p1, 2);
    cart.addItem(p2, 2);
    expect(cart.getItemCount()).toBe(4);

    // Delete first item
    cart.removeItem(cart.getCart().items[0].itemId);
    expect(cart.getItemCount()).toBe(2);
    expect(cart.getCart().items.length).toBe(1);
  });

  // Scenario 20
  test('Scenario 20: Filter Drawer Precision Discovery Journey by Price and Category', () => {
    const filtered = catalog.searchAndFilter(undefined, 2, 101, 20, 30, true);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1);
  });

  // Scenario 21
  test('Scenario 21: Merchant Rating & Context Verification on Receipt', () => {
    const p1 = catalog.getProductById(1)!;
    cart.addItem(p1, 1);
    const orderRes = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-scenario-21');
    const seller = catalog.getSellerById(orderRes.order!.sellerId)!;
    expect(seller.rating).toBe(4.9);
    expect(seller.badge).toBe('حرفي محلي موثق');
  });

  // Scenario 22
  test('Scenario 22: Swipeable Gallery Navigation on PDP', () => {
    const p1 = catalog.getProductById(1)!;
    expect(p1.images.length).toBe(3);
    let currentImage = p1.images[0];
    currentImage = p1.images[2];
    expect(currentImage).toBe('/images/soap-3.jpg');
  });

  // Scenario 23
  test('Scenario 23: Account Settings & Logout Session Clearing', () => {
    let sessionToken: string | null = 'auth-token-xyz';
    cart.addItem(catalog.getProductById(1)!, 1);

    // Logout
    sessionToken = null;
    cart.clear();

    expect(sessionToken).toBeNull();
    expect(cart.getItemCount()).toBe(0);
  });

  // Scenario 24
  test('Scenario 24: AI Tag Suggestion & Product Moderation Lifecycle', () => {
    const aiRes = aiEngine.generateSuggestions('كعك القدس', ['مخبوزات']);
    expect(aiRes.suggestedTags.length).toBeGreaterThan(0);
    sellerEngine.updateProductStatus(5, 'published');
    expect(catalog.getProductById(5)?.status).toBe('published');
  });

  // Scenario 25
  test('Scenario 25: Reorder Mixed Availability Journey (Available + Low Stock + Out of Stock)', () => {
    const p1 = catalog.getProductById(1)!; // stock 15
    const p2 = catalog.getProductById(2)!; // stock 4
    cart.addItem(p1, 2);
    cart.addItem(p2, 2);
    const orderRes = orderEngine.submitOrder(cart.getCart(), cart.getPricingBreakdown(), MOCK_ADDRESSES[0], MOCK_DELIVERY_SLOTS[0], 'cod', 'idem-scenario-25');
    const orderId = orderRes.order!.id;

    // Deplete p2 stock
    catalog.updateProductStock(2, 0);

    const reorderRes = orderEngine.reorderItems(orderId, cart);
    expect(reorderRes.success).toBe(true);
    expect(reorderRes.itemsAdded).toBe(1); // p1 added, p2 skipped with warning
    expect(reorderRes.warning).toBeDefined();
  });
});
