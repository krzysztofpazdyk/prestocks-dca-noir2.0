import type { NextConfig } from "next";
import path from "path";

/** Static export is for `next build` / GitHub Pages. `next dev` stays a
 *  Node server so we can proxy Jev (TypeSafe blocks browser CORS). */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  ...(!isDev ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  basePath: "/prestocks-dca-noir2.0",
  assetPrefix: "/prestocks-dca-noir2.0",
  trailingSlash: true,
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
