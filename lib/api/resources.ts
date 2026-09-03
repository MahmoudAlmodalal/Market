/**
 * Resource functions for Souqi marketplace backend integration.
 * Thin typed wrappers over apiFetch covering verified backend routes.
 */

import { apiFetch, type Page } from './client';
import type {
  AcceptSuggestionRequest,
  AcceptSuggestionResponse,
  AdminMetrics,
  AdminProduct,
  AdminProductUpdateRequest,
  AdminUser,
  AdminUserUpdateRequest,
  AISuggestionAdminItem,
  AISuggestionResponse,
  AuthResponse,
  AuthUser,
  CancelOrderResponse,
  CartItemAddRequest,
  CartItemUpdateRequest,
  CartResponse,
  Category,
  CheckoutRequest,
  CustomerOrderDetail,
  CustomerOrderListItem,
  LoginRequest,
  ModerateOutput,
  ModerateRequest,
  ProductDetail,
  ProductFilterParams,
  ProductImage,
  ProductListItem,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RejectSuggestionResponse,
  SellerDashboardMetrics,
  SellerOrderDetail,
  SellerOrderListItem,
  SellerOrderTransitionRequest,
  SellerOrderTransitionResponse,
  SellerProductCreateRequest,
  SellerProductCreateResponse,
  SellerProductDetail,
  SellerProductListItem,
  SellerProductPublishResponse,
  SellerProductUpdateRequest,
  SuggestDescriptionOutput,
  SuggestDescriptionRequest,
  SuggestTagsOutput,
  SuggestTagsRequest,
} from './types';

export * from './types';

function toQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// Auth Resources
// ============================================================================

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken(
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  return apiFetch<RefreshTokenResponse>('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me/', {
    method: 'GET',
  });
}

// ============================================================================
// Catalog Resources
// ============================================================================

export async function getProducts(
  params?: ProductFilterParams
): Promise<Page<ProductListItem>> {
  const qs = toQueryString(
    params as Record<string, string | number | boolean | undefined | null>
  );
  return apiFetch<Page<ProductListItem>>(`/products/${qs}`, {
    method: 'GET',
  });
}

export async function getProduct(id: number): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${id}/`, {
    method: 'GET',
  });
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories/', {
    method: 'GET',
  });
}

// ============================================================================
// Cart Resources
// ============================================================================

export async function getCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>('/cart/', {
    method: 'GET',
  });
}

export async function addCartItem(
  data: CartItemAddRequest
): Promise<CartResponse> {
  return apiFetch<CartResponse>('/cart/items/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCartItem(
  id: number,
  data: CartItemUpdateRequest
): Promise<CartResponse> {
  return apiFetch<CartResponse>(`/cart/items/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCartItem(id: number): Promise<void> {
  return apiFetch<void>(`/cart/items/${id}/`, {
    method: 'DELETE',
  });
}

export async function clearCart(): Promise<void> {
  return apiFetch<void>('/cart/', {
    method: 'DELETE',
  });
}

// ============================================================================
// Checkout Resources
// ============================================================================

export async function checkout(
  data: CheckoutRequest,
  idempotencyKey: string
): Promise<CustomerOrderDetail> {
  return apiFetch<CustomerOrderDetail>('/checkout/', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Customer Orders Resources
// ============================================================================

export async function getOrders(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<CustomerOrderListItem>> {
  const qs = toQueryString(params);
  return apiFetch<Page<CustomerOrderListItem>>(`/orders/${qs}`, {
    method: 'GET',
  });
}

export async function getOrder(id: number): Promise<CustomerOrderDetail> {
  return apiFetch<CustomerOrderDetail>(`/orders/${id}/`, {
    method: 'GET',
  });
}

export async function cancelOrder(id: number): Promise<CancelOrderResponse> {
  return apiFetch<CancelOrderResponse>(`/orders/${id}/cancel/`, {
    method: 'POST',
  });
}

// ============================================================================
// Seller Resources
// ============================================================================

export async function getSellerProducts(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<SellerProductListItem>> {
  const qs = toQueryString(params);
  return apiFetch<Page<SellerProductListItem>>(`/seller/products/${qs}`, {
    method: 'GET',
  });
}

export async function createSellerProduct(
  data: SellerProductCreateRequest
): Promise<SellerProductCreateResponse> {
  return apiFetch<SellerProductCreateResponse>('/seller/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getSellerProduct(
  id: number
): Promise<SellerProductDetail> {
  return apiFetch<SellerProductDetail>(`/seller/products/${id}/`, {
    method: 'GET',
  });
}

export async function updateSellerProduct(
  id: number,
  data: SellerProductUpdateRequest
): Promise<SellerProductDetail> {
  return apiFetch<SellerProductDetail>(`/seller/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSellerProduct(id: number): Promise<void> {
  return apiFetch<void>(`/seller/products/${id}/`, {
    method: 'DELETE',
  });
}

export async function publishSellerProduct(
  id: number
): Promise<SellerProductPublishResponse> {
  return apiFetch<SellerProductPublishResponse>(
    `/seller/products/${id}/publish/`,
    {
      method: 'POST',
    }
  );
}

export async function uploadSellerProductImage(
  productId: number,
  imageOrFormData: File | Blob | FormData,
  sortOrder?: number
): Promise<ProductImage> {
  let body: FormData;
  if (typeof FormData !== 'undefined' && imageOrFormData instanceof FormData) {
    body = imageOrFormData;
  } else {
    body = new FormData();
    body.append('image', imageOrFormData as Blob);
    if (sortOrder !== undefined && sortOrder !== null) {
      body.append('sort_order', String(sortOrder));
    }
  }

  return apiFetch<ProductImage>(`/seller/products/${productId}/images/`, {
    method: 'POST',
    body,
  });
}

export async function deleteSellerProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  return apiFetch<void>(`/seller/products/${productId}/images/${imageId}/`, {
    method: 'DELETE',
  });
}

export async function getSellerOrders(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<SellerOrderListItem>> {
  const qs = toQueryString(params);
  return apiFetch<Page<SellerOrderListItem>>(`/seller/orders/${qs}`, {
    method: 'GET',
  });
}

export async function getSellerOrder(id: number): Promise<SellerOrderDetail> {
  return apiFetch<SellerOrderDetail>(`/seller/orders/${id}/`, {
    method: 'GET',
  });
}

export async function transitionSellerOrder(
  id: number,
  data: SellerOrderTransitionRequest
): Promise<SellerOrderTransitionResponse> {
  return apiFetch<SellerOrderTransitionResponse>(
    `/seller/orders/${id}/transition/`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function getSellerDashboard(): Promise<SellerDashboardMetrics> {
  return apiFetch<SellerDashboardMetrics>('/seller/dashboard/', {
    method: 'GET',
  });
}

// ============================================================================
// AI Resources
// ============================================================================

export async function suggestDescription(
  data: SuggestDescriptionRequest
): Promise<AISuggestionResponse<SuggestDescriptionOutput>> {
  return apiFetch<AISuggestionResponse<SuggestDescriptionOutput>>(
    '/ai/suggest-description/',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function suggestTags(
  data: SuggestTagsRequest
): Promise<AISuggestionResponse<SuggestTagsOutput>> {
  return apiFetch<AISuggestionResponse<SuggestTagsOutput>>('/ai/suggest-tags/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function moderateProduct(
  data: ModerateRequest
): Promise<AISuggestionResponse<ModerateOutput>> {
  return apiFetch<AISuggestionResponse<ModerateOutput>>('/ai/moderate/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function acceptAISuggestion(
  id: number,
  data?: AcceptSuggestionRequest
): Promise<AcceptSuggestionResponse> {
  return apiFetch<AcceptSuggestionResponse>(`/ai/suggestions/${id}/accept/`, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  });
}

export async function rejectAISuggestion(
  id: number
): Promise<RejectSuggestionResponse> {
  return apiFetch<RejectSuggestionResponse>(`/ai/suggestions/${id}/reject/`, {
    method: 'POST',
  });
}

// ============================================================================
// Admin Resources
// ============================================================================

export async function getAdminMetrics(): Promise<AdminMetrics> {
  return apiFetch<AdminMetrics>('/admin/metrics/', {
    method: 'GET',
  });
}

export async function getAdminOrders(params?: {
  status?: string;
  seller?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<CustomerOrderDetail>> {
  const qs = toQueryString(params);
  return apiFetch<Page<CustomerOrderDetail>>(`/admin/orders/${qs}`, {
    method: 'GET',
  });
}

export async function getAdminAISuggestions(params?: {
  review_status?: string;
  suggestion_type?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<AISuggestionAdminItem>> {
  const qs = toQueryString(params);
  return apiFetch<Page<AISuggestionAdminItem>>(`/admin/ai-suggestions/${qs}`, {
    method: 'GET',
  });
}

export async function getAdminProduct(id: number): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/admin/products/${id}/`, {
    method: 'GET',
  });
}

export async function updateAdminProduct(
  id: number,
  data: AdminProductUpdateRequest
): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/admin/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/users/${id}/`, {
    method: 'GET',
  });
}

export async function updateAdminUser(
  id: number,
  data: AdminUserUpdateRequest
): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
