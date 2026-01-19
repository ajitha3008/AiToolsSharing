import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Middleware runs on Edge Runtime by default - this is correct for Supabase
  // No need to explicitly set runtime - Edge is the default and required for middleware
};

export default nextConfig;
