export type NotificationCategory = "order" | "promo" | "system" | "delivery";

export interface NotificationAction {
  label_ar: string;
  label_en: string;
  href: string;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  timestamp: string;
  read: boolean;
  link?: string;
  action?: NotificationAction;
  metadata?: {
    orderId?: string;
    storeName?: string;
    points?: number;
    discountCode?: string;
    icon?: string;
  };
}

export interface NotificationPreferences {
  order_updates: boolean;
  sms_updates: boolean;
  promotions: boolean;
  loyalty_rewards: boolean;
}
