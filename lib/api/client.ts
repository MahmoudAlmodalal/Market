/**
 * Core HTTP client for Souqi marketplace backend integration.
 * Safe for Server Components and client-side execution.
 */

export interface AuthTokens {
  access: string;
  refresh: string;
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'souqi_access_token_v1',
  REFRESH_TOKEN: 'souqi_refresh_token_v1',
} as const;

export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const access = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!access && !refresh) {
      return null;
    }
    return {
      access: access ?? '',
      refresh: refresh ?? '',
    };
  } catch {
    return null;
  }
}

export function setTokens(tokens: { access: string; refresh?: string }): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    if (tokens.refresh !== undefined && tokens.refresh !== null) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    }
  } catch {
    // no-op on localStorage restriction/quota errors
  }
}

export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    // no-op
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(message: string, code: string, status: number, details: unknown = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function listResults<T>(page: Page<T>): T[] {
  return page.results;
}

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:8000/api';
}

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function isAuthBypassEndpoint(path: string): boolean {
  return /\/auth\/(login|register|refresh)\/?($|\?)/.test(path);
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }
  // Every route lives under /[locale]/..., so a bare /login 404s.
  const locale = window.location.pathname.split('/')[1];
  const prefix = locale === 'ar' || locale === 'en' ? locale : 'ar';
  window.location.href = `/${prefix}/login`;
}

let sharedRefreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!sharedRefreshPromise) {
    sharedRefreshPromise = (async () => {
      try {
        const refreshUrl = `${getBaseUrl()}/auth/refresh/`;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) {
          clearTokens();
          redirectToLogin();
          return null;
        }

        const data = (await res.json()) as { access: string; refresh?: string };
        setTokens({ access: data.access, refresh: data.refresh });
        return data.access;
      } catch {
        clearTokens();
        redirectToLogin();
        return null;
      } finally {
        sharedRefreshPromise = null;
      }
    })();
  }

  return sharedRefreshPromise;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return rawApiFetch<T>(path, init, false);
}

async function rawApiFetch<T>(
  path: string,
  init?: RequestInit,
  isRetry = false
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData;

  if (isFormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Authorization')) {
    const tokens = getTokens();
    if (tokens?.access) {
      headers.set('Authorization', `Bearer ${tokens.access}`);
    }
  }

  const sentAuthHeader = headers.get('Authorization');
  const sentToken = sentAuthHeader?.replace(/^Bearer\s+/i, '');

  const url = buildUrl(path);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // 401 handling with single-flight refresh token
  if (response.status === 401 && !isRetry && !isAuthBypassEndpoint(path)) {
    const currentTokens = getTokens();

    // If another concurrent request already refreshed the access token in storage, replay immediately
    if (currentTokens?.access && sentToken && currentTokens.access !== sentToken) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${currentTokens.access}`);
      return rawApiFetch<T>(
        path,
        {
          ...init,
          headers: retryHeaders,
        },
        true
      );
    }

    if (currentTokens?.refresh) {
      const newAccess = await refreshAccessToken(currentTokens.refresh);
      if (newAccess) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newAccess}`);
        return rawApiFetch<T>(
          path,
          {
            ...init,
            headers: retryHeaders,
          },
          true
        );
      }
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      // response is not JSON
    }

    if (
      errorData &&
      typeof errorData === 'object' &&
      'error' in errorData &&
      errorData.error &&
      typeof errorData.error === 'object'
    ) {
      const err = errorData.error as {
        code?: unknown;
        message?: unknown;
        details?: unknown;
      };
      const code = typeof err.code === 'string' ? err.code : 'http_error';
      const message =
        typeof err.message === 'string'
          ? err.message
          : response.statusText || 'Request failed';
      const details = err.details ?? {};
      throw new ApiError(message, code, response.status, details);
    }

    const fallbackMessage = response.statusText || `HTTP error ${response.status}`;
    throw new ApiError(fallbackMessage, 'http_error', response.status, errorData ?? {});
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  // Parse JSON response body
  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
