import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "api.fmgetrainer.com", "storage.fmgetrainer.com"],
    formats: ["image/avif", "image/webp"],
  },
  output: "standalone",
  turbopack: {},
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
