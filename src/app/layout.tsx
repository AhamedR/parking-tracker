import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
const baseUrl = process.env.SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Safe Parking Tracker",
  description: "Save and recover your parking spot in seconds, offline-ready.",
  verification: {
    google: 'DRUP8bAO5gXudSg1jlfTwy25qzJIQrItZUjo8_WiAis',
  },
  openGraph: {
    title: "Safe Parking Tracker",
    description: "An offline-first web application to track parking spots without GPS.",
    siteName: "Safe Parking Tracker",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Parking Tracker",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6b00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Parking Tracker",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NZD"
    },
    "description": "An offline-first web application for tracking parking spots without GPS."
  };

  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}