import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parking Tracker PWA",
    short_name: "Parking Tracker",
    description: "Save and recover your parking spot in seconds, offline-ready.",
    start_url: "/",
    display: "standalone",
    background_color: "#161A1B",
    theme_color: "#ff6b00",
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
  };
}
