/**
 * TypeScript definitions derived directly from Django REST Framework (DRF) serializers
 * and views across accounts, catalog, orders, and ai apps.
 */

// ============================================================================
// Common / Auth Types
// ============================================================================

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}

export interface AuthResponse {
  user: AuthUser;
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'seller';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

// ============================================================================
// Catalog Types
// ============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategorySimple {
  id: number;
  name: string;
}

export interface SellerSimple {
  id: number;
  business_name: string;
  description: string;
}

export interface ProductImage {
  id: number;
  image: string;
  sort_order: number;
}

export type ProductStockState = 'available' | 'low_stock' | 'out_of_stock' | string;
export type ProductPublishStatus = 'draft' | 'published' | 'rejected' | 'archived' | string;

export interface ProductListItem {
  id: number;
  name: string;
  price: string;
  primary_image: string | null;
  stock_state: ProductStockState;
  seller_name: string;
  category: CategorySimple | null;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_state: ProductStockState;
  /**
   * Omitted when stock is above the low-stock threshold;
   * type is optional and undefined must never be treated as 0.
   */
  available_quantity?: number;
  category: CategorySimple | null;
  seller: SellerSimple | null;
  images: ProductImage[];
  created_at: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: number;
  seller?: number;
  ordering?: 'price' | '-price' | 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
}

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItemIssue {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  stock_state: ProductStockState;
  issues: CartItemIssue[];
}

export interface CartResponse {
  id: number | null;
  seller: {
    id: number;
    business_name: string;
  } | null;
  items: CartItem[];
  subtotal: string;
  total: string;
}

export interface CartItemAddRequest {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

// ============================================================================
// Checkout Types
// ============================================================================

export interface PriceAcknowledgement {
  product_id: number;
  new_price: string | number;
}

export interface CheckoutRequest {
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  price_acknowledgements?: PriceAcknowledgement[];
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | string;

export interface OrderItem {
  product_id: number;
  product_name_snapshot: string;
  unit_price_snapshot: string;
  quantity: number;
  line_total: string;
}

export interface OrderStatusHistory {
  from_status: string | null;
  to_status: string;
  created_at: string;
}

export interface CustomerOrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  total: string;
  item_count: number;
  seller: SellerSimple | null;
  created_at: string;
}

export interface CustomerOrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  seller: SellerSimple | null;
  items: OrderItem[];
  subtotal: string;
  total: string;
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  timeline: OrderStatusHistory[];
  created_at: string;
}

export interface CancelOrderResponse {
  order_number: string;
  status: 'cancelled';
}

// ============================================================================
// Seller Types
// ============================================================================

export interface SellerProductListItem {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  stock_state: ProductStockState;
  status: ProductPublishStatus;
  category: CategorySimple | null;
  image_count: number;
  created_at: string;
}

export interface SellerProductDetail {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  stock_state: ProductStockState;
  status: ProductPublishStatus;
  moderation_note: string;
  category: CategorySimple | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface SellerProductCreateRequest {
  name: string;
  description?: string;
  price: string | number;
  stock_quantity: number;
  category_id?: number | null;
}

export interface SellerProductCreateResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  status: ProductPublishStatus;
  category_id: number | null;
}

export interface SellerProductUpdateRequest {
  name?: string;
  description?: string;
  price?: string | number;
  stock_quantity?: number;
  category_id?: number | null;
}

export interface SellerProductPublishResponse {
  id: number;
  status: string;
}

export interface SellerOrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  total: string;
  item_count: number;
  contact_name: string;
  created_at: string;
}

export interface SellerOrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: string;
  total: string;
  contact_name: string;
  contact_phone: string;
  delivery_address: string;
  timeline: OrderStatusHistory[];
  created_at: string;
}

export interface SellerOrderTransitionRequest {
  to_status: string;
}

export interface SellerOrderTransitionResponse {
  order_number: string;
  from_status: string;
  status: string;
}

export interface SellerDashboardMetrics {
  product_count: number;
  out_of_stock_count: number;
  low_stock_count: number;
  orders_by_status: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
    [key: string]: number;
  };
}

// ============================================================================
// AI Types
// ============================================================================

export interface SuggestDescriptionRequest {
  name: string;
  category_id?: number | null;
  attributes?: Record<string, unknown>;
  notes?: string;
}

export interface SuggestDescriptionOutput {
  title: string;
  short_description: string;
  description: string;
  highlights: string[];
  suggested_tags: string[];
  confidence: number;
}

export interface SuggestTagsRequest {
  title: string;
  description?: string;
}

export interface SuggestTagsOutput {
  tags: string[];
  category?: string;
  confidence: number;
}

export interface ModerateRequest {
  product_id: number;
}

export interface ModerateOutput {
  notes: Array<{
    type: 'missing_info' | 'suspicious_claims' | 'inappropriate_terms' | string;
    message: string;
  }>;
  confidence: number;
}

export interface AISuggestionResponse<T> {
  suggestion_id: number;
  status: 'pending' | 'needs_regeneration';
  reason?: string;
  output?: T;
}

export interface AcceptSuggestionRequest {
  product_id?: number | null;
}

export interface AcceptSuggestionResponse {
  suggestion_id: number;
  review_status: 'accepted';
  product_id: number;
  product_status: string;
}

export interface RejectSuggestionResponse {
  suggestion_id: number;
  review_status: 'rejected';
}

export interface AISuggestionAdminItem {
  id: number;
  target_type: string;
  target_id: number | null;
  suggestion_type: 'description' | 'tags' | 'moderation' | string;
  input_payload: Record<string, unknown>;
  structured_output: Record<string, unknown>;
  confidence: string;
  review_status: 'pending' | 'accepted' | 'rejected' | string;
  requested_by_email: string;
  reviewed_by_email: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface AdminMetrics {
  total_orders: number;
  total_sales: string;
  published_product_count: number;
  active_seller_count: number;
  orders_by_status: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
    [key: string]: number;
  };
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  status: ProductPublishStatus;
  moderation_note: string;
  category: CategorySimple | null;
  seller: SellerSimple | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface AdminProductUpdateRequest {
  status?: ProductPublishStatus;
  moderation_note?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | string;
  status: 'active' | 'suspended' | string;
}

export interface AdminUserUpdateRequest {
  status: 'active' | 'suspended';
}
