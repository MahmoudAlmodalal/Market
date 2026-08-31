import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        surface: {
          DEFAULT: "var(--surface)",
          white: "#FFFFFF",
          canvas: "#FAFAFA",
          dim: "#DCD9D9",
          bright: "#FCF9F8",
          container: {
            lowest: "#FFFFFF",
            low: "#F6F3F2",
            DEFAULT: "#F0EDED",
            high: "#EAE7E7",
            highest: "#E5E2E1",
          },
          tint: "#B5213C",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EAEAEA",
          300: "#D6D6D6",
          400: "#A8A8A8",
          500: "#737373",
          600: "#525252",
          700: "#363636",
          800: "#202020",
          900: "#111111",
        },
        hairline: "#EAEAEA",
        semantic: {
          success: "#22A06B",
          warning: "#E9A23B",
          error: "#D92D3F",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        card: "20px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        pill: "9999px",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px rgba(0, 0, 0, 0.05)",
        soft: "0 8px 24px rgba(0, 0, 0, 0.08)",
        "soft-md": "0 8px 24px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 16px 40px rgba(0, 0, 0, 0.10)",
        glow: "0 8px 20px rgba(233, 73, 94, 0.18)",
        "glow-hover": "0 8px 20px rgba(233, 73, 94, 0.25)",
      },
      spacing: {
        gutter: "16px",
        "margin-mobile": "16px",
        "margin-desktop": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
