import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable image optimization - images are too large for Vercel's 4MB limit
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
