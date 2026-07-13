import type { Metadata, Viewport } from "next";
import "./globals.css";
import DoorGate from "@/components/DoorGate";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "Discotecha · Paros",
    template: "%s · Discotecha",
  },
  description:
    "A private 21+ nightclub on Paros. Members and guests only. Reserve a table or request the guest list.",
  openGraph: {
    title: "Discotecha · Paros",
    description: "No matter the question, Paros is always the answer. 21+. Members and guests only.",
    images: ["/images/eye.webp"],
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=Bagel+Fat+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain font-sans antialiased">
        <DoorGate />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
