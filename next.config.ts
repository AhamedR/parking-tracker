import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Suppresses Next.js 16 webpack/turbopack config detection conflicts
  turbopack: {},
  allowedDevOrigins: ["192.168.8.66"],
};

export default withSerwist(nextConfig);
