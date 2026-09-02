/**
 * Souqi Marketplace Design Tokens
 * Source of Truth: Stitch Design System (Project: 7281356532551726718) & design.md
 */

export const TOKENS = {
  brand: {
    coral: "#E9495E",
    hover: "#D9364D",
    active: "#B92B3F",
    soft: "#FFF1F3",
    50: "#FFF1F3",
    100: "#FFE3E7",
    200: "#FFC9D1",
    300: "#F8AEBB",
    400: "#EB8996",
    500: "#E9495E",
    600: "#D9364D",
    700: "#B92B3F",
    800: "#932338",
    900: "#641423",
  },
  viewports: {
    mobileMin: "390px",
    mobileMax: "430px",
  },
  colors: {
    primary: {
      50: "#FFF1F3",
      100: "#FFE3E7",
      200: "#FFC9D1",
      300: "#F8AEBB",
      400: "#EB8996",
      500: "#E9495E", // Main brand coral
      600: "#D9364D", // Hover coral
      700: "#B92B3F", // Active/pressed coral
      800: "#932338",
      900: "#641423",
      fixed: "#FFDADA",
      fixedDim: "#FFB3B6",
    },
    neutral: {
      0: "#FFFFFF",
      50: "#FAFAFA", // Page canvas
      100: "#F5F5F5",
      200: "#EAEAEA", // Hairline border
      300: "#D6D6D6",
      400: "#A8A8A8",
      500: "#737373", // Muted text
      600: "#525252",
      700: "#363636",
      800: "#202020", // Primary dark text
      900: "#111111",
    },
    surface: {
      default: "#FCF9F8",
      dim: "#DCD9D9",
      bright: "#FCF9F8",
      lowest: "#FFFFFF",
      low: "#F6F3F2",
      container: "#F0EDED",
      high: "#EAE7E7",
      highest: "#E5E2E1",
      tint: "#B5213C",
    },
    semantic: {
      success: "#22A06B",
      warning: "#E9A23B",
      error: "#D92D3F",
      info: "#3B82F6",
    },
    hairline: "#EAEAEA",
    canvas: "#FAFAFA",
  },
  typography: {
    fonts: {
      arabic: "Cairo, sans-serif",
      english: "Inter, sans-serif",
    },
    scale: {
      display: { fontSize: "48px", lineHeight: "55px", fontWeight: "700" },
      headlineH1: { fontSize: "36px", lineHeight: "43px", fontWeight: "700" },
      headlineH1Mobile: { fontSize: "28px", lineHeight: "34px", fontWeight: "700" },
      headlineH2: { fontSize: "30px", lineHeight: "38px", fontWeight: "700" },
      headlineH2Mobile: { fontSize: "24px", lineHeight: "30px", fontWeight: "700" },
      headlineH3: { fontSize: "24px", lineHeight: "31px", fontWeight: "700" },
      headlineH4: { fontSize: "20px", lineHeight: "27px", fontWeight: "600" },
      bodyLg: { fontSize: "18px", lineHeight: "29px", fontWeight: "400" },
      bodyMd: { fontSize: "16px", lineHeight: "26px", fontWeight: "400" },
      bodySm: { fontSize: "14px", lineHeight: "21px", fontWeight: "400" },
      caption: { fontSize: "12px", lineHeight: "17px", fontWeight: "500" },
      action: { fontSize: "15px", lineHeight: "15px", fontWeight: "600" },
    },
  },
  radius: {
    sm: "4px",
    default: "8px",
    md: "12px",
    lg: "16px",
    card: "20px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    pill: "9999px",
  },
  shadows: {
    softSm: "0 2px 8px rgba(0, 0, 0, 0.05)",
    softMd: "0 8px 24px rgba(0, 0, 0, 0.08)",
    softLg: "0 16px 40px rgba(0, 0, 0, 0.10)",
    glow: "0 8px 20px rgba(233, 73, 94, 0.18)",
    glowHover: "0 8px 20px rgba(233, 73, 94, 0.25)",
  },
  spacing: {
    base: "4px",
    gutter: "16px",
    marginMobile: "16px",
    marginDesktop: "24px",
  },
} as const;

export type DesignTokens = typeof TOKENS;
