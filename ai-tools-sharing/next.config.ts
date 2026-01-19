import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: Next.js 16 may show a middleware deprecation warning, but middleware.ts
  // is required and recommended by Supabase for SSR authentication. This warning
  // can be safely ignored - see MIDDLEWARE_WARNING.md for details.
};

export default nextConfig;
