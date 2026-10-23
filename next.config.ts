import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback. Next picks per request from the
    // browser's Accept header, so older browsers still get WebP.
    formats: ["image/avif", "image/webp"],
    // Admin uploads land in Supabase Storage, so next/image has to be told
    // those hosts are allowed. Narrowed to the public storage path rather
    // than opening the whole host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // The local stack, for development.
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  /* config options here */
  // sharp is a native module; it must not be bundled into the server build.
  serverExternalPackages: ["sharp"],
  cacheComponents: true,
  partialPrefetching: true,
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
