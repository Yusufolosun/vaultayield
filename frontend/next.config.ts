import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for monorepo/workspace root
  experimental: {
    // In Next.js 16, some keys moved, but 'root' is often best handled by Next.js automatically
    // unless explicitly needed. Let's try setting it correctly for this workspace.
  },
};

export default nextConfig;
