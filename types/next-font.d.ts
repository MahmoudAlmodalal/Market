declare module "next/font/google" {
  export interface FontOptions {
    subsets?: string[];
    weight?: string | string[];
    style?: string | string[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
  }

  export interface NextFontWithVariable {
    className: string;
    variable: string;
    style: {
      fontFamily: string;
      fontWeight?: number;
      fontStyle?: string;
    };
  }

  export function Cairo(options?: FontOptions): NextFontWithVariable;
  export function Inter(options?: FontOptions): NextFontWithVariable;
}
