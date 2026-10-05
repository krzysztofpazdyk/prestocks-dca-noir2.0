import type { NextConfig } from "next";
import path from "path";

const optionalPrivyModule = path.join(
  __dirname,
  "lib/shims/optional-privy-module.js",
);

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
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Privy Solana peers (docs: webpack externals). Next keeps `externals` as
    // an array, so the named keys are also pushed as an object entry.
    // Only the server compile externalizes them. The static Pages client has
    // no CommonJS require and must bundle these modules.
    const privySolanaPeers = {
      "@solana/kit": "commonjs @solana/kit",
      "@solana-program/memo": "commonjs @solana-program/memo",
      "@solana-program/system": "commonjs @solana-program/system",
      "@solana-program/token": "commonjs @solana-program/token",
    };
    if (isServer) {
      Object.assign(config.externals, privySolanaPeers);
      config.externals.push(privySolanaPeers);
    }
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@farcaster/mini-app-solana": optionalPrivyModule,
      "@stripe/stripe-js": optionalPrivyModule,
    };
    return config;
  },
};

export default nextConfig;
