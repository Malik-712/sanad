import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { ar } from "@/lib/copy/ar";
import "./globals.css";

// The main font. Latin subset too, so URLs and edition names in source lines
// render in the same family instead of the fallback.
const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-plex-arabic",
});

// Fallback for one sign only: «﵁» (U+FD41), which IBM Plex Sans Arabic does not have.
// The unmodified Scheherazade New file (SIL OFL 1.1, see app/fonts/OFL-ScheherazadeNew.txt);
// not preloaded, so browsers fetch it only on pages that contain the sign. Owner decision, 6 Oct.
const honorificSign = localFont({
  src: "./fonts/ScheherazadeNew-Regular.ttf",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-honorific-sign",
  declarations: [{ prop: "unicode-range", value: "U+FD41" }],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: ar.meta.title, template: ar.meta.titleTemplate },
  description: ar.meta.description,
  applicationName: ar.siteName,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E4B3B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${plexArabic.variable} ${honorificSign.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <SkipLink />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
