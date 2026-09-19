import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.0.126:3000", "192.168.0.126"],
};

export default nextConfig;