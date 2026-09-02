export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id?: number;
  product_id?: number;
  product_name_snapshot: string;
  unit_price_snapshot: string;
  quantity: number;
  line_total: string;
  primary_image?: string;
}

export interface OrderTimelineItem {
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  created_at: string;
  note?: string;
}

export interface DeliverySlot {
  id: string;
  label: string;
  time?: string;
  date?: string;
  is_available?: boolean;
}

export interface Address {
  id?: number;
  name?: string;
  street: string;
  neighborhood?: string;
  city: string;
  phone: string;
  is_default?: boolean;
  notes?: string;
}

export interface OrderSeller {
  id: number;
  business_name: string;
  phone?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  seller?: OrderSeller;
  items: OrderItem[];
  subtotal: string;
  delivery_fee?: string;
  total: string;
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  timeline?: OrderTimelineItem[];
  item_count?: number;
  created_at: string;
  cancellation_reason?: string;
  notes?: string;
}

export interface CheckoutPayload {
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  delivery_time_slot?: string;
  payment_method?: string;
  notes?: string;
  acknowledged_issues?: Array<{
    code: "price_changed";
    product_id: number;
    new_price: string;
  }>;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}
