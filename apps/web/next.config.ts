import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/rpc/:path*", destination: "http://server:3000/rpc/:path*" },
      { source: "/api/auth/:path*", destination: "http://server:3000/api/auth/:path*" },
    ];
  },
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone",
  transpilePackages: ["shiki"],
};

export default withVarlock(nextConfig);

