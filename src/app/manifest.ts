import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parking Tracker PWA",
    short_name: "Parking Tracker",
    description: "Save and recover your parking spot in seconds, offline-ready.",
    start_url: "/",
    display: "standalone",
    background_color: "#161A1B",
    theme_color: "#050505",
    display_override: ['window-controls-overlay', 'standalone'],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: '/mobile-screenshot-1.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Dashboard view with all active and past sessions',
      },
      {
        src: '/mobile-screenshot-2.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Parking spot details and timer',
      },
      {
        src: '/desktop-screenshot-1.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop dashboard view with active and past sessions',
      },
      {
        src: '/desktop-screenshot-2.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop view showing detailed session',
      },
    ],
  };
}
