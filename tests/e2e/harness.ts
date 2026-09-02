/**
 * Souqi Marketplace E2E Testing Harness & Domain Engine
 * 
 * Provides:
 * 1. Assertion framework with rich matchers (expect, describe, it/test, beforeEach, afterEach)
 * 2. Test registration, lifecycle hooks, and reporting engine
 * 3. Authoritative domain models and state machines:
 *    - Design Tokens & WCAG AA Contrast Validator
 *    - Bilingual (Arabic RTL / English LTR) Locale Engine
 *    - Mobile Viewport (390px - 430px) & Layout Engine
 *    - Catalog & Search & Multi-Attribute Filter Engine
 *    - Single-Seller Cart Engine & Conflict Resolver (OD04)
 *    - IssueNotice Resolver (price changes, stock clamps, unavailability)
 *    - Order Pricing Breakdown with Voucher & Delivery Rules
 *    - Mock Checkout & Idempotent Order Submission (UUIDv4)
 *    - 5-State Order Lifecycle Stepper & Cancellation Gate
 *    - Seller Dashboard KPI & Inventory Management Engine
 *    - AI Assistant Suggestion Engine with Manual Review Gate
 *    - ARIA Accessibility & Focus Ring Verifier
 */

// ============================================================================
// 1. Core Assertion Engine & Test Lifecycle Registry
// ============================================================================

export interface TestResult {
  suite: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  featureId?: number;
  passed: boolean;
  durationMs: number;
  error?: string;
  stack?: string;
}

export interface TestSuite {
  name: string;
  tier: 1 | 2 | 3 | 4;
  featureId?: number;
  tests: {
    name: string;
    fn: () => void | Promise<void>;
  }[];
  beforeEachFns: (() => void | Promise<void>)[];
  afterEachFns: (() => void | Promise<void>)[];
}

class TestRegistry {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private globalBeforeEachFns: (() => void | Promise<void>)[] = [];
  private globalAfterEachFns: (() => void | Promise<void>)[] = [];

  registerSuite(name: string, tier: 1 | 2 | 3 | 4, featureId?: number) {
    const suite: TestSuite = {
      name,
      tier,
      featureId,
      tests: [],
      beforeEachFns: [],
      afterEachFns: [],
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    return suite;
  }

  getCurrentSuite(): TestSuite | null {
    return this.currentSuite;
  }

  setCurrentSuite(suite: TestSuite | null) {
    this.currentSuite = suite;
  }

  addBeforeEach(fn: () => void | Promise<void>) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachFns.push(fn);
    } else {
      this.globalBeforeEachFns.push(fn);
    }
  }

  addAfterEach(fn: () => void | Promise<void>) {
    if (this.currentSuite) {
      this.currentSuite.afterEachFns.push(fn);
    } else {
      this.globalAfterEachFns.push(fn);
    }
  }

  getGlobalBeforeEach(): (() => void | Promise<void>)[] {
    return this.globalBeforeEachFns;
  }

  getGlobalAfterEach(): (() => void | Promise<void>)[] {
    return this.globalAfterEachFns;
  }

  getSuites(): TestSuite[] {
    return this.suites.filter(s => s.tests.length > 0);
  }

  clear() {
    this.suites = [];
    this.currentSuite = null;
    this.globalBeforeEachFns = [];
    this.globalAfterEachFns = [];
  }
}

export const registry = new TestRegistry();

export function describe(name: string, fn: () => void, tier: 1 | 2 | 3 | 4 = 1, featureId?: number) {
  const prev = registry.getCurrentSuite();
  const suite = registry.registerSuite(name, tier, featureId);
  try {
    fn();
  } finally {
    registry.setCurrentSuite(prev);
  }
}

export function test(name: string, fn: () => void | Promise<void>) {
  let suite = registry.getCurrentSuite();
  if (!suite) {
    suite = registry.registerSuite('Default Suite', 1);
  }
  suite.tests.push({ name, fn });
}

export const it = test;

export function beforeEach(fn: () => void | Promise<void>) {
  registry.addBeforeEach(fn);
}

export function afterEach(fn: () => void | Promise<void>) {
  registry.addAfterEach(fn);
}

// ----------------------------------------------------------------------------
// Matcher Utilities
// ----------------------------------------------------------------------------

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export interface Matchers<T> {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
  toContain(expected: any): void;
  toHaveLength(length: number): void;
  toMatch(pattern: RegExp | string): void;
  toThrow(expectedError?: string | RegExp): void;
  toBeCloseTo(expected: number, delta?: number): void;
  not: Matchers<T>;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect<T = any>(actual: T): Matchers<T> {
  const makeMatchers = (isNot: boolean): Matchers<T> => ({
    toBe(expected: any) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to be' : 'to be'} ${JSON.stringify(expected)}`
        );
      }
    },
    toEqual(expected: any) {
      const pass = deepEqual(actual, expected);
      if (isNot ? pass : !pass) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to equal' : 'to equal'} ${JSON.stringify(expected)}`
        );
      }
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'to be undefined' : 'to be defined'}, got ${actual}`);
      }
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'NOT to be undefined' : 'to be undefined'}, got ${actual}`);
      }
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected value ${isNot ? 'NOT to be null' : 'to be null'}, got ${actual}`);
      }
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'to be falsy' : 'to be truthy'}`);
      }
    },
    toBeFalsy() {
      const pass = !Boolean(actual);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'to be truthy' : 'to be falsy'}`);
      }
    },
    toBeGreaterThan(n: number) {
      const pass = typeof actual === 'number' && actual > n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be >' : 'to be >'} ${n}`);
      }
    },
    toBeGreaterThanOrEqual(n: number) {
      const pass = typeof actual === 'number' && actual >= n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be >=' : 'to be >='} ${n}`);
      }
    },
    toBeLessThan(n: number) {
      const pass = typeof actual === 'number' && actual < n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be <' : 'to be <'} ${n}`);
      }
    },
    toBeLessThanOrEqual(n: number) {
      const pass = typeof actual === 'number' && actual <= n;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} ${isNot ? 'NOT to be <=' : 'to be <='} ${n}`);
      }
    },
    toContain(expected: any) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(String(expected));
      } else if (Array.isArray(actual)) {
        pass = actual.some(item => deepEqual(item, expected) || item === expected);
      } else if (actual instanceof Set || actual instanceof Map) {
        pass = actual.has(expected);
      }
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} ${isNot ? 'NOT to contain' : 'to contain'} ${JSON.stringify(expected)}`);
      }
    },
    toHaveLength(length: number) {
      const actualLength = (actual as any)?.length;
      const pass = actualLength === length;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected length ${length}, but got ${actualLength}`);
      }
    },
    toMatch(pattern: RegExp | string) {
      const str = String(actual);
      const pass = typeof pattern === 'string' ? str.includes(pattern) : pattern.test(str);
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected "${str}" ${isNot ? 'NOT to match' : 'to match'} ${pattern}`);
      }
    },
    toThrow(expectedError?: string | RegExp) {
      if (typeof actual !== 'function') {
        throw new AssertionError('expect(actual).toThrow() requires actual to be a function');
      }
      let threw = false;
      let errorThrown: any = null;
      try {
        (actual as any)();
      } catch (err: any) {
        threw = true;
        errorThrown = err;
      }
      if (!threw && !isNot) {
        throw new AssertionError('Expected function to throw an error, but it did not throw.');
      }
      if (threw && isNot) {
        throw new AssertionError(`Expected function NOT to throw, but it threw: ${errorThrown?.message || errorThrown}`);
      }
      if (threw && expectedError && !isNot) {
        const message = errorThrown?.message || String(errorThrown);
        if (typeof expectedError === 'string') {
          if (!message.includes(expectedError)) {
            throw new AssertionError(`Expected error message to include "${expectedError}", got "${message}"`);
          }
        } else if (!expectedError.test(message)) {
          throw new AssertionError(`Expected error message to match ${expectedError}, got "${message}"`);
        }
      }
    },
    toBeCloseTo(expected: number, delta: number = 0.001) {
      const diff = Math.abs((actual as any) - expected);
      const pass = diff <= delta;
      if (isNot ? pass : !pass) {
        throw new AssertionError(`Expected ${actual} to be close to ${expected} (within +/- ${delta}), difference was ${diff}`);
      }
    },
    get not() {
      return makeMatchers(!isNot);
    },
  });

  return makeMatchers(false);
}

// ============================================================================
// 2. Design Tokens & WCAG Contrast Engine (Features 1, 2, 40, 41)
// ============================================================================

export interface ColorTokenMap {
  [key: string]: string;
}

export const TOKENS = {
  brand: {
    coral: '#E9495E',
    hover: '#D9364D',
    active: '#B92B3F',
    soft: '#FFF1F3',
    50: '#FFF1F3',
    100: '#FFE3E7',
    200: '#FFC9D1',
    300: '#F8AEBB',
    400: '#EB8996',
    500: '#E9495E',
    600: '#D9364D',
    700: '#B92B3F',
    800: '#932338',
    900: '#641423',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EAEAEA',
    300: '#D6D6D6',
    400: '#A8A8A8',
    500: '#737373',
    600: '#525252',
    700: '#363636',
    800: '#202020',
    900: '#111111',
  },
  surface: {
    default: '#FCF9F8',
    lowest: '#FFFFFF',
    canvas: '#FAFAFA',
    container: '#F0EDED',
  },
  semantic: {
    success: '#22A06B',
    successSoft: '#E8F8F0',
    warning: '#E9A23B',
    warningSoft: '#FFF6E9',
    error: '#D92D3F',
    errorSoft: '#FDE8EA',
    info: '#3B82F6',
    infoSoft: '#F0F5FF',
  },
  radius: {
    sm: '4px',
    default: '8px',
    md: '12px',
    lg: '16px',
    card: '20px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    pill: '9999px',
  },
  shadows: {
    softSm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    soft: '0 8px 24px rgba(0, 0, 0, 0.08)',
    softMd: '0 8px 24px rgba(0, 0, 0, 0.08)',
    softLg: '0 16px 40px rgba(0, 0, 0, 0.10)',
    glow: '0 8px 20px rgba(233, 73, 94, 0.18)',
    glowHover: '0 8px 20px rgba(233, 73, 94, 0.25)',
  },
  fonts: {
    arabic: 'Cairo, sans-serif',
    english: 'Inter, sans-serif',
  },
  spacing: {
    base: '4px',
    gutter: '16px',
    marginMobile: '16px',
    marginDesktop: '24px',
  },
  viewports: {
    mobileMin: 390,
    mobileMax: 430,
    desktopContainer: 1200,
  },
} as const;

/**
 * Calculates relative luminance and WCAG AA contrast ratio
 */
export class ContrastValidator {
  private static parseHex(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16),
      ];
    }
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }

  private static getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  static getContrastRatio(hex1: string, hex2: string): number {
    const [r1, g1, b1] = this.parseHex(hex1);
    const [r2, g2, b2] = this.parseHex(hex2);
    const l1 = this.getLuminance(r1, g1, b1);
    const l2 = this.getLuminance(r2, g2, b2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  static meetsWcagAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
  }
}

// ============================================================================
// 3. Bilingual (Arabic RTL / English LTR) Engine (Features 3, 4, 6, 34)
// ============================================================================

export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface TranslationDictionary {
  [locale: string]: {
    [key: string]: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  ar: {
    'app.name': 'سوقي',
    'app.tagline': 'من يد صانعيها إليك مباشرة',
    'nav.home': 'الرئيسية',
    'nav.categories': 'التصنيفات',
    'nav.cart': 'السلة',
    'nav.orders': 'طلباتي',
    'nav.profile': 'حسابي',
    'catalog.search_placeholder': 'ابحث عن منتج، متجر، أو تصنيف...',
    'catalog.filter': 'تصفية',
    'catalog.add_to_cart': 'إضافة للسلة',
    'catalog.out_of_stock': 'غير متوفر',
    'catalog.low_stock': 'متبقي {count} فقط',
    'catalog.available': 'متوفر',
    'cart.single_seller_notice': 'منتجات من متجر: {sellerName}',
    'cart.multi_seller_warning': 'سلتك تحتوي حالياً على منتجات من متجر آخر. الطلب في سوقي يتم من متجر واحد في المرة الواحدة.',
    'cart.switch_seller_confirm': 'تفريغ السلة وإضافة المنتج الجديد',
    'cart.keep_current_cart': 'الإبقاء على السلة الحالية',
    'cart.empty_title': 'سلتك فارغة حالياً',
    'cart.empty_cta': 'تصفح المنتجات الآن',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.delivery_fee': 'رسوم التوصيل',
    'cart.discount': 'خصم القسيمة',
    'cart.total': 'الإجمالي',
    'cart.checkout_cta': 'متابعة الشراء',
    'cart.price_changed_notice': 'تغير سعر هذا المنتج من {oldPrice} ₪ إلى {newPrice} ₪',
    'cart.price_changed_accept': 'أوافق على السعر الجديد',
    'cart.insufficient_stock_notice': 'الكمية المتبقية {available} فقط',
    'cart.clamp_stock_cta': 'تعديل الكمية إلى {available}',
    'checkout.title': 'إتمام الطلب',
    'checkout.delivery_address': 'عنوان التوصيل',
    'checkout.delivery_time': 'وقت التوصيل المفضل',
    'checkout.payment_method': 'طريقة الدفع',
    'checkout.cod': 'الدفع عند الاستلام',
    'checkout.digital_card': 'بطاقة بنكية',
    'checkout.apple_pay': 'Apple Pay',
    'checkout.submit_order': 'تأكيد وإرسال الطلب',
    'orders.status_pending': 'قيد الانتظار',
    'orders.status_confirmed': 'تم التأكيد',
    'orders.status_preparing': 'جاري التجهيز',
    'orders.status_ready': 'جاهز للتسليم',
    'orders.status_completed': 'مكتمل',
    'orders.status_cancelled': 'ملغي',
    'orders.cancel_order': 'إلغاء الطلب',
    'orders.reorder': 'إعادة الطلب',
    'seller.dashboard_title': 'لوحة تحكم البائع',
    'seller.kpi_products': 'إجمالي المنتجات',
    'seller.kpi_new_orders': 'الطلبات الجديدة',
    'seller.kpi_stock_alerts': 'تنبيهات المخزون',
    'seller.kpi_revenue': 'المبيعات المكتملة',
    'ai.panel_title': 'مساعد سوقي الذكي',
    'ai.generate_cta': 'توليد وصف بالذكاء الاصطناعي',
    'ai.accept_cta': 'استخدام هذا الاقتراح',
    'ai.reject_cta': 'رفض الاقتراح',
  },
  en: {
    'app.name': 'Souqi',
    'app.tagline': 'Directly from local makers to you',
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'catalog.search_placeholder': 'Search products, sellers, or categories...',
    'catalog.filter': 'Filter',
    'catalog.add_to_cart': 'Add to Cart',
    'catalog.out_of_stock': 'Out of Stock',
    'catalog.low_stock': 'Only {count} left',
    'catalog.available': 'Available',
    'cart.single_seller_notice': 'Items from store: {sellerName}',
    'cart.multi_seller_warning': 'Your cart currently contains items from another store. In Souqi, orders are placed from one store at a time.',
    'cart.switch_seller_confirm': 'Clear cart & add new item',
    'cart.keep_current_cart': 'Keep current cart',
    'cart.empty_title': 'Your cart is currently empty',
    'cart.empty_cta': 'Browse Products Now',
    'cart.subtotal': 'Subtotal',
    'cart.delivery_fee': 'Estimated Delivery',
    'cart.discount': 'Voucher Discount',
    'cart.total': 'Total',
    'cart.checkout_cta': 'Proceed to Checkout',
    'cart.price_changed_notice': 'Price changed from {oldPrice} ₪ to {newPrice} ₪',
    'cart.price_changed_accept': 'Accept new price',
    'cart.insufficient_stock_notice': 'Only {available} items available',
    'cart.clamp_stock_cta': 'Adjust quantity to {available}',
    'checkout.title': 'Checkout',
    'checkout.delivery_address': 'Delivery Address',
    'checkout.delivery_time': 'Preferred Delivery Window',
    'checkout.payment_method': 'Payment Method',
    'checkout.cod': 'Cash on Delivery',
    'checkout.digital_card': 'Debit / Credit Card',
    'checkout.apple_pay': 'Apple Pay',
    'checkout.submit_order': 'Place Order',
    'orders.status_pending': 'Pending',
    'orders.status_confirmed': 'Confirmed',
    'orders.status_preparing': 'Preparing',
    'orders.status_ready': 'Ready for Delivery',
    'orders.status_completed': 'Completed',
    'orders.status_cancelled': 'Cancelled',
    'orders.cancel_order': 'Cancel Order',
    'orders.reorder': 'Reorder',
    'seller.dashboard_title': 'Seller Dashboard',
    'seller.kpi_products': 'Total Products',
    'seller.kpi_new_orders': 'New Orders',
    'seller.kpi_stock_alerts': 'Stock Alerts',
    'seller.kpi_revenue': 'Completed Revenue',
    'ai.panel_title': 'Souqi AI Assistant',
    'ai.generate_cta': 'Generate AI Description',
    'ai.accept_cta': 'Use this suggestion',
    'ai.reject_cta': 'Reject suggestion',
  },
};

export class LocaleEngine {
  private locale: Locale = 'ar';

  constructor(initialLocale: Locale = 'ar') {
    this.locale = initialLocale;
  }

  getLocale(): Locale {
    return this.locale;
  }

  getDirection(): Direction {
    return this.locale === 'ar' ? 'rtl' : 'ltr';
  }

  getFontFamily(): string {
    return this.locale === 'ar' ? TOKENS.fonts.arabic : TOKENS.fonts.english;
  }

  setLocale(locale: Locale) {
    this.locale = locale;
  }

  toggleLocale() {
    this.locale = this.locale === 'ar' ? 'en' : 'ar';
  }

  t(key: string, params?: Record<string, any>): string {
    let str = TRANSLATIONS[this.locale]?.[key] || TRANSLATIONS.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }

  formatPrice(amount: number): string {
    const formattedNum = amount.toFixed(2);
    // Currency formatting rule: ₪ symbol with tabular numbers
    return `${formattedNum} ₪`;
  }
}

// ============================================================================
// 4. Domain Data Models & Mock Stores
// ============================================================================

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'digital_card' | 'apple_pay';
export type ProductStatus = 'draft' | 'under_review' | 'published' | 'rejected' | 'archived';

export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
}

export interface Seller {
  id: number;
  name: string;
  name_en: string;
  badge: string;
  rating: number;
  reviewCount: number;
  deliveryTimeEstimate: string;
  branch: string;
  phone: string;
}

export interface Product {
  id: number;
  sellerId: number;
  categoryId: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  price: number; // Server-authoritative price in ILS (₪)
  serverPriceString: string; // "25.00 ₪"
  stock_quantity: number;
  images: string[];
  tags: string[];
  status: ProductStatus;
  isAiSuggested?: boolean;
  moderation_note?: string;
}

export interface CartItem {
  itemId: number;
  product: Product;
  quantity: number;
  priceAtAddition: number;
  hasPriceChange?: boolean;
  currentServerPrice?: number;
  priceChangeApproved?: boolean;
  stockIssue?: 'insufficient_stock' | 'out_of_stock' | null;
  maxAvailableQuantity?: number;
}

export interface Cart {
  sellerId: number | null;
  sellerName: string | null;
  items: CartItem[];
}

export interface Address {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  street: string;
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  label_ar: string;
  label_en: string;
  date: string;
  isAvailable: boolean;
}

export interface OrderItemSnapshot {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  sellerId: number;
  sellerName: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  voucherCode?: string;
  total: number;
  address: Address;
  deliverySlot: DeliverySlot;
  paymentMethod: PaymentMethod;
  cancellationReason?: string;
  createdAt: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

// ----------------------------------------------------------------------------
// Authoritative Mock Fixtures
// ----------------------------------------------------------------------------

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, slug: 'food-sweets', name_ar: 'مأكولات وحلويات', name_en: 'Food & Sweets', icon: 'Cake' },
  { id: 2, slug: 'soaps-care', name_ar: 'عناية وصابون', name_en: 'Soaps & Care', icon: 'Sparkles' },
  { id: 3, slug: 'crafts-crochet', name_ar: 'حرف وأشغال', name_en: 'Crafts & Crochet', icon: 'Scissors' },
  { id: 4, slug: 'candles-decor', name_ar: 'شموع وديكور', name_en: 'Candles & Decor', icon: 'Flame' },
];

export const MOCK_SELLERS: Seller[] = [
  {
    id: 101,
    name: 'مشغل الياسمين',
    name_en: 'Al-Yasmeen Studio',
    badge: 'حرفي محلي موثق',
    rating: 4.9,
    reviewCount: 128,
    deliveryTimeEstimate: '30-45 دقيقة',
    branch: 'رام الله - وسط البلد',
    phone: '+970599112233',
  },
  {
    id: 102,
    name: 'مطبخ أم خليل',
    name_en: 'Um Khalil Kitchen',
    badge: 'طاهية منزلية معتمدة',
    rating: 4.8,
    reviewCount: 94,
    deliveryTimeEstimate: '45-60 دقيقة',
    branch: 'نابلس - رفيديا',
    phone: '+970599445566',
  },
  {
    id: 103,
    name: 'شموع الواحة',
    name_en: 'Oasis Candles',
    badge: 'مشروع منزلي مميز',
    rating: 4.7,
    reviewCount: 42,
    deliveryTimeEstimate: '2-3 أيام',
    branch: 'الخليل - عين سارة',
    phone: '+970599778899',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    sellerId: 101,
    categoryId: 2,
    title_ar: 'صابون طبيعي بزيت الزيتون واللافندر',
    title_en: 'Natural Olive Oil & Lavender Soap',
    description_ar: 'صابون عضوي مصنوع يدوياً من زيت الزيتون البكر مع مستخلص اللافندر الطبيعي لترطيب البشرة.',
    description_en: 'Handmade organic soap made from virgin olive oil with natural lavender extract.',
    price: 25.00,
    serverPriceString: '25.00 ₪',
    stock_quantity: 15,
    images: ['/images/soap-1.jpg', '/images/soap-2.jpg', '/images/soap-3.jpg'],
    tags: ['عضوي', 'صناعة يدوية', 'طبيعي'],
    status: 'published',
  },
  {
    id: 2,
    sellerId: 101,
    categoryId: 2,
    title_ar: 'مقشر طبيعي بالسكر والقهوة',
    title_en: 'Natural Sugar & Coffee Body Scrub',
    description_ar: 'مقشر للجسم بمكونات طبيعية 100% يمنح البشرة إشراقاً ونعومة فائقة.',
    description_en: '100% natural body scrub that leaves skin radiant and silky smooth.',
    price: 40.00,
    serverPriceString: '40.00 ₪',
    stock_quantity: 4, // Low stock (<= 5)
    images: ['/images/scrub-1.jpg', '/images/scrub-2.jpg'],
    tags: ['عناية', 'تقشير', 'قهوة'],
    status: 'published',
  },
  {
    id: 3,
    sellerId: 101,
    categoryId: 2,
    title_ar: 'مرطب شفاه بزبدة الشيا والورد',
    title_en: 'Rose & Shea Butter Lip Balm',
    description_ar: 'مرطب طبيعي غني بزبدة الشيا وخلاصة الورد الجوري.',
    description_en: 'Natural lip balm rich in shea butter and Damask rose extract.',
    price: 15.00,
    serverPriceString: '15.00 ₪',
    stock_quantity: 0, // Out of stock
    images: ['/images/lipbalm-1.jpg'],
    tags: ['شفاه', 'ترطيب', 'ورد'],
    status: 'published',
  },
  {
    id: 4,
    sellerId: 102,
    categoryId: 1,
    title_ar: 'معمول بالتمر البلدي الفاخر (1 كغم)',
    title_en: 'Premium Artisan Date Maamoul (1 kg)',
    description_ar: 'معمول تقليدي هش بالسمن البلدي محشو بالتمر الفاخر المتبل بالهيل والقرفة.',
    description_en: 'Traditional melt-in-mouth maamoul with ghee and spiced dates.',
    price: 60.00,
    serverPriceString: '60.00 ₪',
    stock_quantity: 8,
    images: ['/images/maamoul-1.jpg', '/images/maamoul-2.jpg'],
    tags: ['حلويات', 'معمول', 'ضيافة'],
    status: 'published',
  },
  {
    id: 5,
    sellerId: 102,
    categoryId: 1,
    title_ar: 'كعك مقدسي بالسمسم الطازج (6 قطع)',
    title_en: 'Fresh Sesame Jerusalem Kaak (6 pcs)',
    description_ar: 'كعك فلسطيني تقليدي مخبوز بالفرن الحجري يقدم مع الزعتر.',
    description_en: 'Traditional stone-oven baked sesame kaak served with zaatar.',
    price: 20.00,
    serverPriceString: '20.00 ₪',
    stock_quantity: 2, // Low stock
    images: ['/images/kaak-1.jpg'],
    tags: ['مخبوزات', 'إفطار', 'طازج'],
    status: 'published',
  },
  {
    id: 6,
    sellerId: 103,
    categoryId: 4,
    title_ar: 'شمعة صويا معطرة بالفانيلا وخشب الصندل',
    title_en: 'Vanilla & Sandalwood Soy Candle',
    description_ar: 'شمعة صويا نباتية نقية بفتيل خشبي طبيعي يدوم احتراقها 45 ساعة.',
    description_en: 'Pure vegan soy candle with natural wood wick, 45-hour burn time.',
    price: 35.00,
    serverPriceString: '35.00 ₪',
    stock_quantity: 12,
    images: ['/images/candle-1.jpg', '/images/candle-2.jpg'],
    tags: ['شموع', 'ديكور', 'فانيلا'],
    status: 'published',
    isAiSuggested: true,
  },
];

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    title: 'المنزل (Home)',
    recipientName: 'محمود أحمد',
    phone: '+970599123456',
    city: 'رام الله',
    street: 'شارع الإرسال، عمارة الأمل، طابق 3',
    isDefault: true,
  },
  {
    id: 'addr-2',
    title: 'العمل (Office)',
    recipientName: 'محمود أحمد',
    phone: '+970599123456',
    city: 'البيرة',
    street: 'شارع القدس، مجمع الأعمال، طابق 5',
    isDefault: false,
  },
];

export const MOCK_DELIVERY_SLOTS: DeliverySlot[] = [
  { id: 'slot-1', label_ar: 'اليوم (14:00 - 16:00)', label_en: 'Today (2:00 PM - 4:00 PM)', date: '2026-08-31', isAvailable: true },
  { id: 'slot-2', label_ar: 'اليوم (17:00 - 19:00)', label_en: 'Today (5:00 PM - 7:00 PM)', date: '2026-08-31', isAvailable: true },
  { id: 'slot-3', label_ar: 'غداً (10:00 - 12:00)', label_en: 'Tomorrow (10:00 AM - 12:00 PM)', date: '2026-09-01', isAvailable: false }, // Fully booked
];

export const MOCK_VOUCHERS: Record<string, { code: string; discountPercent: number; maxDiscount: number; minSubtotal: number; isValid: boolean }> = {
  'SOUQI10': { code: 'SOUQI10', discountPercent: 10, maxDiscount: 20, minSubtotal: 30, isValid: true },
  'WELCOME20': { code: 'WELCOME20', discountPercent: 20, maxDiscount: 50, minSubtotal: 50, isValid: true },
  'EXPIRED50': { code: 'EXPIRED50', discountPercent: 50, maxDiscount: 100, minSubtotal: 50, isValid: false },
};

// ============================================================================
// 5. Domain Engines (Catalog, Cart, Checkout, Orders, Seller, AI)
// ============================================================================

export class CatalogEngine {
  private products: Product[] = [];
  private categories: Category[] = [];
  private sellers: Seller[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.products = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
    this.categories = JSON.parse(JSON.stringify(MOCK_CATEGORIES));
    this.sellers = JSON.parse(JSON.stringify(MOCK_SELLERS));
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getSellerById(id: number): Seller | undefined {
    return this.sellers.find(s => s.id === id);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getStockStatus(product: Product): StockStatus {
    if (product.stock_quantity <= 0) return 'out_of_stock';
    if (product.stock_quantity <= 5) return 'low_stock';
    return 'available';
  }

  searchAndFilter(query?: string, categoryId?: number, sellerId?: number, minPrice?: number, maxPrice?: number, inStockOnly: boolean = false): Product[] {
    return this.products.filter(p => {
      if (p.status !== 'published') return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      if (sellerId && p.sellerId !== sellerId) return false;
      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;
      if (inStockOnly && p.stock_quantity <= 0) return false;

      if (query && query.trim() !== '') {
        const q = query.trim().toLowerCase();
        const matchTitleAr = p.title_ar.toLowerCase().includes(q);
        const matchTitleEn = p.title_en.toLowerCase().includes(q);
        const matchDescAr = p.description_ar.toLowerCase().includes(q);
        const matchTags = p.tags.some(t => t.toLowerCase().includes(q));
        const seller = this.getSellerById(p.sellerId);
        const matchSeller = seller?.name.toLowerCase().includes(q) || seller?.name_en.toLowerCase().includes(q) || (seller?.branch && seller.branch.toLowerCase().includes(q));
        if (!matchTitleAr && !matchTitleEn && !matchDescAr && !matchTags && !matchSeller) {
          return false;
        }
      }
      return true;
    });
  }

  updateProductStock(productId: number, newStock: number) {
    const product = this.getProductById(productId);
    if (product) {
      product.stock_quantity = Math.max(0, newStock);
    }
  }

  updateProductPrice(productId: number, newPrice: number) {
    const product = this.getProductById(productId);
    if (product) {
      product.price = newPrice;
      product.serverPriceString = `${newPrice.toFixed(2)} ₪`;
    }
  }

  addProduct(product: Product) {
    this.products.push(product);
  }
}

export class CartEngine {
  private cart: Cart = {
    sellerId: null,
    sellerName: null,
    items: [],
  };
  private catalog: CatalogEngine;

  constructor(catalog: CatalogEngine) {
    this.catalog = catalog;
  }

  getCart(): Cart {
    return this.cart;
  }

  getItemCount(): number {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.cart = {
      sellerId: null,
      sellerName: null,
      items: [],
    };
  }

  /**
   * Adds an item with strict single-seller enforcement (OD04)
   */
  addItem(product: Product, quantity: number = 1): { success: boolean; conflict?: boolean; existingSellerName?: string; newSellerName?: string } {
    if (product.stock_quantity <= 0) {
      return { success: false };
    }

    const seller = this.catalog.getSellerById(product.sellerId);
    const sellerName = seller?.name || 'متجر غير معروف';

    // Single-seller rule check
    if (this.cart.sellerId !== null && this.cart.sellerId !== product.sellerId && this.cart.items.length > 0) {
      return {
        success: false,
        conflict: true,
        existingSellerName: this.cart.sellerName || undefined,
        newSellerName: sellerName,
      };
    }

    // Set active merchant
    this.cart.sellerId = product.sellerId;
    this.cart.sellerName = sellerName;

    const existingIndex = this.cart.items.findIndex(i => i.product.id === product.id);
    if (existingIndex >= 0) {
      const current = this.cart.items[existingIndex];
      const newQty = Math.min(current.quantity + quantity, product.stock_quantity);
      current.quantity = newQty;
    } else {
      const finalQty = Math.min(quantity, product.stock_quantity);
      this.cart.items.push({
        itemId: Date.now() + Math.floor(Math.random() * 1000),
        product: { ...product },
        quantity: finalQty,
        priceAtAddition: product.price,
        currentServerPrice: product.price,
      });
    }

    return { success: true };
  }

  /**
   * MultiSellerDialog confirmation: wipe cart and add item from new merchant
   */
  confirmSwitchSellerAndAdd(product: Product, quantity: number = 1) {
    this.clear();
    return this.addItem(product, quantity);
  }

  updateQuantity(itemId: number, quantity: number) {
    const item = this.cart.items.find(i => i.itemId === itemId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const liveProduct = this.catalog.getProductById(item.product.id);
    const maxStock = liveProduct ? liveProduct.stock_quantity : item.product.stock_quantity;
    item.quantity = Math.min(quantity, maxStock);
  }

  removeItem(itemId: number) {
    this.cart.items = this.cart.items.filter(i => i.itemId !== itemId);
    if (this.cart.items.length === 0) {
      this.cart.sellerId = null;
      this.cart.sellerName = null;
    }
  }

  /**
   * Synchronize cart with live catalog to detect price changes & stock issues
   */
  syncWithCatalog(): { hasIssues: boolean; priceChanges: number; stockIssues: number } {
    let priceChanges = 0;
    let stockIssues = 0;

    for (const item of this.cart.items) {
      const liveProduct = this.catalog.getProductById(item.product.id);
      if (!liveProduct) {
        item.stockIssue = 'out_of_stock';
        stockIssues++;
        continue;
      }

      // Check price change
      if (liveProduct.price !== item.priceAtAddition && !item.priceChangeApproved) {
        item.hasPriceChange = true;
        item.currentServerPrice = liveProduct.price;
        priceChanges++;
      } else {
        item.currentServerPrice = liveProduct.price;
      }

      // Check stock sufficiency
      if (liveProduct.stock_quantity <= 0) {
        item.stockIssue = 'out_of_stock';
        stockIssues++;
      } else if (item.quantity > liveProduct.stock_quantity) {
        item.stockIssue = 'insufficient_stock';
        item.maxAvailableQuantity = liveProduct.stock_quantity;
        stockIssues++;
      } else {
        item.stockIssue = null;
      }
    }

    return {
      hasIssues: priceChanges > 0 || stockIssues > 0,
      priceChanges,
      stockIssues,
    };
  }

  acceptPriceChange(itemId: number) {
    const item = this.cart.items.find(i => i.itemId === itemId);
    if (item && item.currentServerPrice !== undefined) {
      item.priceAtAddition = item.currentServerPrice;
      item.hasPriceChange = false;
      item.priceChangeApproved = true;
    }
  }

  clampStockQuantity(itemId: number) {
    const item = this.cart.items.find(i => i.itemId === itemId);
    if (item && item.maxAvailableQuantity !== undefined) {
      item.quantity = item.maxAvailableQuantity;
      item.stockIssue = null;
    }
  }

  /**
   * Calculates authoritative server pricing breakdown
   */
  getPricingBreakdown(voucherCode?: string): {
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    voucherApplied: boolean;
    voucherError?: string;
    total: number;
    canCheckout: boolean;
    blockingReason?: string;
  } {
    const subtotal = this.cart.items.reduce((sum, item) => {
      const price = item.currentServerPrice ?? item.priceAtAddition;
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal > 0 ? 15.00 : 0; // Flat 15 ₪ delivery fee
    let discountAmount = 0;
    let voucherApplied = false;
    let voucherError: string | undefined;

    if (voucherCode && voucherCode.trim() !== '') {
      const v = MOCK_VOUCHERS[voucherCode.trim().toUpperCase()];
      if (!v) {
        voucherError = 'رمز القسيمة غير صالح (Invalid Voucher Code)';
      } else if (!v.isValid) {
        voucherError = 'هذه القسيمة منتهية الصلاحية (Voucher Expired)';
      } else if (subtotal < v.minSubtotal) {
        voucherError = `الحد الأدنى لاستخدام القسيمة هو ${v.minSubtotal} ₪`;
      } else {
        const rawDiscount = (subtotal * v.discountPercent) / 100;
        discountAmount = Math.min(rawDiscount, v.maxDiscount);
        voucherApplied = true;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discountAmount);

    // Verify if checkout is allowed (no unresolved issues or empty cart)
    let canCheckout = this.cart.items.length > 0;
    let blockingReason: string | undefined;

    if (this.cart.items.length === 0) {
      canCheckout = false;
      blockingReason = 'Cart is empty';
    } else {
      const hasUnresolvedPriceChange = this.cart.items.some(i => i.hasPriceChange && !i.priceChangeApproved);
      const hasUnresolvedStockIssue = this.cart.items.some(i => i.stockIssue === 'out_of_stock' || (i.stockIssue === 'insufficient_stock' && i.quantity > (i.maxAvailableQuantity ?? 0)));
      if (hasUnresolvedPriceChange) {
        canCheckout = false;
        blockingReason = 'Unresolved price change notice';
      } else if (hasUnresolvedStockIssue) {
        canCheckout = false;
        blockingReason = 'Unresolved out of stock or insufficient stock notice';
      }
    }

    return {
      subtotal,
      deliveryFee,
      discountAmount,
      voucherApplied,
      voucherError,
      total,
      canCheckout,
      blockingReason,
    };
  }
}

export class OrderEngine {
  private orders: Order[] = [];
  private submittedIdempotencyKeys: Set<string> = new Set();
  private catalog: CatalogEngine;

  constructor(catalog: CatalogEngine) {
    this.catalog = catalog;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  /**
   * Idempotent order placement with duplicate key suppression
   */
  submitOrder(
    cart: Cart,
    breakdown: ReturnType<CartEngine['getPricingBreakdown']>,
    address: Address,
    slot: DeliverySlot,
    paymentMethod: PaymentMethod,
    idempotencyKey: string,
    voucherCode?: string
  ): { success: boolean; order?: Order; error?: string } {
    if (!breakdown.canCheckout) {
      return { success: false, error: breakdown.blockingReason || 'Cannot checkout cart' };
    }

    if (this.submittedIdempotencyKeys.has(idempotencyKey)) {
      const existing = this.orders.find(o => o.idempotencyKey === idempotencyKey);
      if (existing) {
        return { success: true, order: existing };
      }
      return { success: false, error: 'Duplicate submission detected' };
    }

    this.submittedIdempotencyKeys.add(idempotencyKey);

    const snapshots: OrderItemSnapshot[] = cart.items.map(item => {
      const p = item.currentServerPrice ?? item.priceAtAddition;
      return {
        productId: item.product.id,
        title: item.product.title_ar,
        price: p,
        quantity: item.quantity,
        lineTotal: p * item.quantity,
        imageUrl: item.product.images[0] || '',
      };
    });

    // Deduct stock in catalog
    for (const item of cart.items) {
      const live = this.catalog.getProductById(item.product.id);
      if (live) {
        live.stock_quantity = Math.max(0, live.stock_quantity - item.quantity);
      }
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: `#${orderId.replace('ORD-', '')}`,
      idempotencyKey,
      sellerId: cart.sellerId!,
      sellerName: cart.sellerName!,
      status: 'pending',
      items: snapshots,
      subtotal: breakdown.subtotal,
      deliveryFee: breakdown.deliveryFee,
      discountAmount: breakdown.discountAmount,
      voucherCode,
      total: breakdown.total,
      address: { ...address },
      deliverySlot: { ...slot },
      paymentMethod,
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'تم إنشاء الطلب بنجاح' },
      ],
    };

    this.orders.unshift(newOrder);
    return { success: true, order: newOrder };
  }

  /**
   * Advances order lifecycle: Pending -> Confirmed -> Preparing -> Ready -> Completed
   */
  advanceOrderStatus(orderId: string, nextStatus: OrderStatus): boolean {
    const order = this.getOrderById(orderId);
    if (!order) return false;

    if (order.status === 'cancelled' || order.status === 'completed') {
      return false; // Terminal states
    }

    const validSequence: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentIndex = validSequence.indexOf(order.status);
    const nextIndex = validSequence.indexOf(nextStatus);

    if (nextIndex !== currentIndex + 1 && nextStatus !== 'cancelled') {
      return false; // Must advance sequentially unless cancelled
    }

    order.status = nextStatus;
    order.timeline.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      note: `تغيرت حالة الطلب إلى: ${nextStatus}`,
    });
    return true;
  }

  /**
   * Customer cancellation gate: allowed ONLY in 'pending' or 'confirmed'
   */
  cancelOrder(orderId: string, reason: string): { success: boolean; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      const statusLabels: Record<string, string> = {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        preparing: 'جاري التجهيز',
        ready: 'جاهز للاستلام',
        completed: 'مكتمل',
        cancelled: 'ملغي',
      };
      const statusLabel = statusLabels[order.status] || order.status;
      return {
        success: false,
        error: `لا يمكن إلغاء الطلب في مرحلة "${statusLabel}". الإلغاء متاح فقط في مرحلتي قيد الانتظار وتم التأكيد.`,
      };
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: `تم إلغاء الطلب: ${reason}`,
    });

    // Restock catalog items
    for (const item of order.items) {
      const live = this.catalog.getProductById(item.productId);
      if (live) {
        live.stock_quantity += item.quantity;
      }
    }

    return { success: true };
  }

  /**
   * Reorder feature: re-adds past order items to cart with single-seller validation
   */
  reorderItems(orderId: string, cartEngine: CartEngine): { success: boolean; warning?: string; error?: string; itemsAdded: number } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found', itemsAdded: 0 };

    cartEngine.clear();
    let addedCount = 0;
    let hasStockWarning = false;

    for (const item of order.items) {
      const liveProduct = this.catalog.getProductById(item.productId);
      if (liveProduct && liveProduct.stock_quantity > 0) {
        const qty = Math.min(item.quantity, liveProduct.stock_quantity);
        cartEngine.addItem(liveProduct, qty);
        addedCount++;
        if (qty < item.quantity) {
          hasStockWarning = true;
        }
      } else {
        hasStockWarning = true;
      }
    }

    return {
      success: addedCount > 0,
      warning: hasStockWarning ? 'بعض المنتجات غير متوفرة بالكمية الأصلية وتم تعديلها حسب المخزون المتاح' : undefined,
      itemsAdded: addedCount,
    };
  }
}

export class SellerDashboardEngine {
  private catalog: CatalogEngine;
  private orderEngine: OrderEngine;

  constructor(catalog: CatalogEngine, orderEngine: OrderEngine) {
    this.catalog = catalog;
    this.orderEngine = orderEngine;
  }

  getKpis(sellerId: number): {
    productCount: number;
    outOfStockCount: number;
    lowStockCount: number;
    newOrdersCount: number;
    completedRevenue: number;
  } {
    const products = this.catalog.getAllProducts().filter(p => p.sellerId === sellerId);
    const productCount = products.length;
    const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length;
    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;

    const orders = this.orderEngine.getOrders().filter(o => o.sellerId === sellerId);
    const newOrdersCount = orders.filter(o => o.status === 'pending').length;
    const completedRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      productCount,
      outOfStockCount,
      lowStockCount,
      newOrdersCount,
      completedRevenue,
    };
  }

  updateProductStatus(productId: number, status: ProductStatus, moderationNote?: string) {
    const p = this.catalog.getProductById(productId);
    if (p) {
      p.status = status;
      if (moderationNote) p.moderation_note = moderationNote;
    }
  }
}

export class AIAssistantEngine {
  generateSuggestions(title: string, keywords: string[]): {
    description_ar: string;
    description_en: string;
    suggestedTags: string[];
    confidenceScore: number;
  } {
    const isCare = title.includes('صابون') || title.includes('Soap') || keywords.includes('عناية');
    const isFood = title.includes('معمول') || title.includes('كعك') || keywords.includes('حلويات');

    if (isCare) {
      return {
        description_ar: `منتج فاخر من مستخلصات طبيعية 100%، صُمم بعناية فائقة ليمنحك تجربة استرخاء وانتعاش يومية تدوم طويلاً.`,
        description_en: `A luxurious 100% natural extract product, crafted with care to provide lasting daily freshness.`,
        suggestedTags: ['عضوي', 'صناعة يدوية', 'عناية طبيعية', 'خالٍ من الكيماويات'],
        confidenceScore: 0.95,
      };
    } else if (isFood) {
      return {
        description_ar: `مخبوزات وحلويات منزلية طازجة محضرة بأجود المكونات البلدية والسمن الأصيل لإضفاء نكهة الضيافة الأصيلة.`,
        description_en: `Fresh home-baked treats made with premium traditional ingredients and authentic hospitality flavor.`,
        suggestedTags: ['طازج', 'حلويات بلدية', 'ضيافة', 'صنع منزلي'],
        confidenceScore: 0.92,
      };
    }

    return {
      description_ar: `منتج يدوي مميز ومصنوع بحب وإتقان ليناسب مختلف الاحتياجات بلمسة محلية أصيلة.`,
      description_en: `A unique handmade product crafted with passion and precision with an authentic local touch.`,
      suggestedTags: ['محلي', 'يدوي', 'سوقي'],
      confidenceScore: 0.88,
    };
  }
}

// ============================================================================
// 6. Viewport, Micro-Interactions & ARIA Accessibility Engine (Features 5, 40, 41)
// ============================================================================

export class ViewportEngine {
  static getContainerClass(viewportWidth: number): string {
    if (viewportWidth <= 430) {
      return 'w-full min-h-screen bg-white shadow-none';
    }
    return 'max-w-[430px] mx-auto min-h-screen bg-white shadow-soft';
  }

  static getCatalogGridColumns(viewportWidth: number): number {
    if (viewportWidth < 640) return 2; // Mobile 2-column grid
    if (viewportWidth < 1024) return 3; // Tablet 3-column grid
    return 4; // Desktop 4-column grid
  }

  static isMobileViewport(width: number): boolean {
    return width >= 390 && width <= 430;
  }
}

export class A11yEngine {
  static validateFocusRingClass(className: string): boolean {
    return className.includes('focus-visible:ring') || className.includes('focus:ring');
  }

  static validateAriaRole(element: { role?: string; ariaLabel?: string; ariaLive?: string }): boolean {
    return Boolean(element.role || element.ariaLabel || element.ariaLive);
  }

  static validateButtonAccessibleName(buttonText?: string, ariaLabel?: string): boolean {
    return Boolean((buttonText && buttonText.trim().length > 0) || (ariaLabel && ariaLabel.trim().length > 0));
  }
}
