import { describe, test, expect } from "./harness";
import { MOCK_NOTIFICATIONS } from "../../lib/mock/notifications";
import arTranslations from "../../lib/i18n/ar.json";
import enTranslations from "../../lib/i18n/en.json";

describe("Feature 42: Notifications Center", () => {
  test("1: Mock notifications list is populated with realistic items", () => {
    expect(MOCK_NOTIFICATIONS.length).toBe(5);
    const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read);
    expect(unread.length).toBe(2);
  });

  test("2: Notification items contain valid categories and localized fields", () => {
    for (const item of MOCK_NOTIFICATIONS) {
      expect(["order", "promo", "system", "delivery"]).toContain(item.category);
      expect(item.title_ar.length).toBeGreaterThan(0);
      expect(item.title_en.length).toBeGreaterThan(0);
      expect(item.message_ar.length).toBeGreaterThan(0);
      expect(item.message_en.length).toBeGreaterThan(0);
      expect(item.timestamp).toBeDefined();
    }
  });

  test("3: Category filtering accurately isolates orders, promos, and system alerts", () => {
    const orders = MOCK_NOTIFICATIONS.filter(
      (n) => n.category === "order" || n.category === "delivery"
    );
    const promos = MOCK_NOTIFICATIONS.filter((n) => n.category === "promo");
    const system = MOCK_NOTIFICATIONS.filter((n) => n.category === "system");

    expect(orders.length).toBe(3);
    expect(promos.length).toBe(1);
    expect(system.length).toBe(1);
  });

  test("4: Unread filter accurately detects items requiring customer attention", () => {
    const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read);
    expect(unread.length).toBe(2);
    expect(unread.map((n) => n.id)).toEqual(["notif-1", "notif-2"]);
  });

  test("5: Translation dictionaries contain all required notificationsPage keys", () => {
    const requiredKeys = [
      "title",
      "subtitle",
      "markAllRead",
      "allRead",
      "clearAll",
      "clearConfirm",
      "tabAll",
      "tabOrders",
      "tabPromos",
      "tabSystem",
      "unreadOnly",
      "unreadCount",
      "emptyTitle",
      "emptySubtitle",
      "exploreMarket",
      "viewOrder",
      "delete",
      "markAsRead",
      "markAsUnread",
    ];

    const arPage = (arTranslations as any).notificationsPage;
    const enPage = (enTranslations as any).notificationsPage;

    expect(arPage).toBeDefined();
    expect(enPage).toBeDefined();

    for (const key of requiredKeys) {
      expect(arPage[key]).toBeDefined();
      expect(enPage[key]).toBeDefined();
    }
  });
}, 1, 42);
