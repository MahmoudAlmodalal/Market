/**
 * Mock fallback layer — serves demo data from lib/mock in the exact API response
 * shapes so the app renders without a backend (e.g. a Vercel deploy where
 * NEXT_PUBLIC_API_URL was never configured).
 *
 * Behavior:
 * - NEXT_PUBLIC_API_URL unset/empty → demo mode: no network call is attempted at all.
 * - NEXT_PUBLIC_API_URL set → real API first; network failures, timeouts (8s) and
 *   5xx responses fall back to mock data. Genuine 4xx answers from the backend
 *   (validation errors, 404, 401...) propagate unchanged.
 */

import { ApiError, type Page } from './client';
import { getProducts, getProduct, getCategories } from './resources';
import type {
  Category,
  ProductDetail,
  ProductFilterParams,
  ProductListItem,
} from './types';
import {
  filterProductsList,
  getLocalizedProducts,
  getProductById as getMockProductById,
} from '@/lib/mock/products';
import { getLocalizedCategories } from '@/lib/mock/categories';
import type { Product } from '@/types/catalog';
import type { Locale } from '@/types/i18n';

/** Matches api/common/pagination.py StandardPagination.page_size. */
const MOCK_PAGE_SIZE = 20;
const BACKEND_TIMEOUT_MS = 8000;

/** True when an explicit backend URL is available (set in .env.local / Vercel env). */
export function isBackendConfigured(): boolean {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return Boolean(envUrl && envUrl.trim() !== '');
}

export function normalizeLocale(locale?: string): Locale {
  return locale === 'en' ? 'en' : 'ar';
}

/**
 * True when the error means "the backend could not be reached"
 * (DNS/connection/abort/timeout, or a 5xx answer). Anything else is a real
 * API answer (401, 404, 422...) and must not be masked by mock data.
 */
export function isBackendUnreachableError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status >= 500 || err.status === 408;
  }
  // fetch() network failures are TypeError; our timeout rejects with plain Error.
  return true;
}

async function raceWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`backend timed out after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Runs `fetcher` against the backend with a timeout, falling back to
 * `fallback` when no backend is configured or the backend is unreachable.
 */
export async function withBackendFallback<T>(
  fetcher: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  if (!isBackendConfigured()) {
    return fallback();
  }
  try {
    return await raceWithTimeout(fetcher(), BACKEND_TIMEOUT_MS);
  } catch (err) {
    if (!isBackendUnreachableError(err)) {
      throw err;
    }
    return fallback();
  }
}

// ============================================================================
// Mock → API shape mappers
// ============================================================================

function toListItem(p: Product): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    primary_image: p.primary_image ?? p.images?.[0]?.image ?? null,
    stock_state: p.stock_state,
    seller_name: p.seller_name ?? p.seller?.business_name ?? '',
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
  };
}

function toDetail(p: Product): ProductDetail {
  const images =
    p.images && p.images.length > 0
      ? p.images
      : p.primary_image
        ? [{ id: p.id, image: p.primary_image, sort_order: 0 }]
        : [];

  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    stock_state: p.stock_state,
    available_quantity: p.available_quantity ?? p.stock_quantity,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
    seller: p.seller
      ? {
          id: p.seller.id,
          business_name: p.seller.business_name,
          description: p.seller.description ?? '',
        }
      : null,
    images,
    created_at: p.created_at ?? new Date(0).toISOString(),
  };
}

// ============================================================================
// Mock implementations (public catalog only — draft/archived excluded, like the API)
// ============================================================================

export function mockGetProducts(
  params: ProductFilterParams | undefined,
  locale: string
): Page<ProductListItem> {
  const loc = normalizeLocale(locale);
  const published = getLocalizedProducts(loc).filter(
    (p) => (p.status ?? 'published') === 'published'
  );
  const filtered = params
    ? filterProductsList(published, params)
    : published;

  const pageSize = Math.min(
    Math.max(params?.page_size ?? MOCK_PAGE_SIZE, 1),
    100
  );
  const page = Math.max(params?.page ?? 1, 1);
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize).map(toListItem);

  return {
    count: filtered.length,
    next: start + pageSize < filtered.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}

export function mockGetCategories(locale: string): Category[] {
  return getLocalizedCategories(normalizeLocale(locale)).map(
    ({ id, name, slug }) => ({ id, name, slug })
  );
}

export function mockGetProduct(
  id: number,
  locale: string
): ProductDetail | null {
  const p = getMockProductById(id, normalizeLocale(locale));
  return p ? toDetail(p) : null;
}

// ============================================================================
// Fallback wrappers used by the server pages / AuthContext
// ============================================================================

export async function getProductsWithFallback(
  params: ProductFilterParams | undefined,
  locale: string
): Promise<Page<ProductListItem>> {
  return withBackendFallback(
    () => getProducts(params),
    () => mockGetProducts(params, locale)
  );
}

export async function getCategoriesWithFallback(
  locale: string
): Promise<Category[]> {
  return withBackendFallback(
    () => getCategories(),
    () => mockGetCategories(locale)
  );
}

/** Returns null when the product genuinely does not exist (→ notFound()). */
export async function getProductWithFallback(
  id: number,
  locale: string
): Promise<ProductDetail | null> {
  if (!isBackendConfigured()) {
    return mockGetProduct(id, locale);
  }
  try {
    return await raceWithTimeout(getProduct(id), BACKEND_TIMEOUT_MS);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    if (!isBackendUnreachableError(err)) {
      throw err;
    }
    return mockGetProduct(id, locale);
  }
}
