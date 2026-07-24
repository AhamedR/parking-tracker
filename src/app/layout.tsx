import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Safe Parking Tracker",
    "url": process.env.SITE_URL || "http://localhost:3000",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires IndexedDB and Service Worker support",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NZD"
    },
    "description": "An offline-first web application to track parking spots without GPS signal.",
    "featureList": [
      "Offline location capture",
      "Local photo storage",
      "Visual expiration timers"
    ]
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
        <div className="flex flex-col min-h-screen bg-neutral-950 font-sans text-neutral-100">
          {/* App Header Bar */}
          <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 mx-auto max-w-md w-full">
              {/* Stylized PWA Logo Accent */}
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-neutral-100 uppercase">
                  Parking Tracker
                </span>
                <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">
                  Offline PWA
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col justify-start px-4 py-8 md:py-12 overflow-y-auto">
            {children}
          </main>

          {/* Footer / Info */}
          <footer className="w-full text-center py-6 border-t border-neutral-950 text-[10px] font-semibold text-neutral-600 tracking-wider uppercase">
            Privacy-First &bull; Offline Native Storage
          </footer>
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}