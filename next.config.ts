import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongodb", "bcryptjs", "sanitize-html"],
  images: {
    remotePatterns: [new URL("https://cdn.blackspotmedia.co.uk/team/**")],
  },
};

export default nextConfig;
