import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display-face",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body-face",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Motorbikes for sale in Tanzania`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "pikipiki",
    "pikipiki bei",
    "motorbikes for sale Tanzania",
    "motorcycle Dar es Salaam",
    "boda boda",
    "Bajaj Boxer",
    "Honda",
    "Yamaha",
    "TVS",
    "KTM",
    "Haojue",
    "Sinoray",
    "electric motorbike Tanzania",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — Motorbikes for sale in Tanzania`,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    locale: "en_TZ",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
