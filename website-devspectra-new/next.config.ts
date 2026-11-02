import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Sembunyikan tombol bulat "N" (Next.js Dev Tools) di pojok kiri bawah saat npm run dev.
  // Error tetap muncul kalau ada yang rusak. Tombol ini memang tidak pernah tampil di website online.
  devIndicators: false,
  experimental: {
    agentFeedback: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
