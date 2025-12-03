import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  env: {
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      process.env.AUTH_SECRET ||
      "project-proofy-secret",
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
};

export default nextConfig;
