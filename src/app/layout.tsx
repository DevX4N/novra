import type { Metadata, Viewport } from "next";
import { Manrope, Rajdhani } from "next/font/google";
import imageManifest from "@/content/image-manifest.json";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NØVRA X-01 — Beyond Velocity",
  description:
    "NØVRA X-01, a premium electric hypercar. An independent fictional automotive concept: cinematic reveal, performance, design and finishes.",
  // Fictional concept: keep it out of search results.
  robots: { index: false, follow: false },
  openGraph: {
    title: "NØVRA X-01 — Beyond Velocity",
    description: "Engineered for what comes next. An independent fictional automotive concept.",
    type: "website",
    images: imageManifest.og
      ? [{ url: imageManifest.og.src, width: imageManifest.og.width, height: imageManifest.og.height, alt: "The NØVRA X-01 in a dark studio." }]
      : [],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so the hero can start in the dark. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
