export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";

export interface LocaleContextValue {
  locale: Locale;
  direction: Direction;
  isRtl: boolean;
  isLtr: boolean;
  t: (key: string, fallback?: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};
