import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongodb", "bcryptjs", "sanitize-html"],
  allowedDevOrigins: ['192.168.0.194']
};

export default nextConfig;
