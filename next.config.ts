import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
