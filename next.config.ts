import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images as-is instead of through Vercel Image Optimization, which bills per
    // transformation (every photo × every width). Bike photos are already resized and
    // re-encoded to WebP in the browser before upload (src/lib/image-compress.ts), and
    // the files in /public are pre-sized WebP.
    unoptimized: true,
  },
};

export default nextConfig;
