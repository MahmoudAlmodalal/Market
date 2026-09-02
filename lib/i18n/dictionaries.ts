import arDict from "./ar.json";
import enDict from "./en.json";
import type { Locale } from "@/types/i18n";

export const dictionaries = {
  ar: arDict,
  en: enDict,
};

export type Dictionary = typeof arDict;

/**
 * Returns the dictionary for the specified locale, falling back to Arabic.
 */
export function getDictionary(locale: Locale = "ar"): Dictionary {
  return dictionaries[locale] || dictionaries.ar;
}

/**
 * Resolves a dot-notated key path (e.g. 'catalog.addToCart' or 'common.appName') in a dictionary.
 */
export function resolveTranslationKey(
  dict: Record<string, any>,
  keyPath: string,
  fallback?: string
): string {
  const parts = keyPath.split(".");
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return fallback !== undefined ? fallback : keyPath;
    }
  }

  if (typeof current === "string") {
    return current;
  }

  return fallback !== undefined ? fallback : keyPath;
}

/**
 * Interpolates template variables in string (e.g., "Hello {name}" with { name: "Sara" }).
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}
