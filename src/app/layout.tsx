import type { Metadata, Viewport } from "next";
import "./globals.css";
import DoorGate from "@/components/DoorGate";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "Nocturne · Ios",
    template: "%s · Nocturne",
  },
  description:
    "A private 21+ nightclub on Ios. Members and guests only. Reserve a table or request the guest list.",
  openGraph: {
    title: "Nocturne · Ios",
    description: "No matter the question, Ios is always the answer. 21+. Members and guests only.",
    images: ["/images/crowd-wide.webp"],
    type: "website",
    url: "/",
  },
  robots: { index: true, follow: true },
  // Served under moon.* rather than favicon.* on purpose: browsers cache a
  // favicon by URL and hold it well past a hard refresh, so a changed icon
  // needs a changed path to be picked up.
  icons: {
    icon: [
      { url: "/images/moon.svg", type: "image/svg+xml" },
      { url: "/images/moon.ico", sizes: "16x16 32x32 48x48 64x64 128x128 256x256" },
    ],
    shortcut: "/images/moon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0705",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=Bungee&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain font-sans antialiased">
        <DoorGate />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
