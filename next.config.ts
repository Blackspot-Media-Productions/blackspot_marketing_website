import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongodb", "bcryptjs", "sanitize-html"],
};

export default nextConfig;
