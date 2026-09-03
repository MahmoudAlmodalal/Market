import type { Metadata, Viewport } from "next";
import { cairo, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "سوقي | Souqi — سوق المنتجات المنزلية والحرفية",
  description:
    "سوق محلي يربط الحرفيين، الطهاة المنزليين، والمشاريع المحلية بالمستهلكين.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E9495E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white text-neutral-800 antialiased selection:bg-brand-100 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
