import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: false,
  },
  redirects() {
    return [
      { source: "/admin/name-tag", destination: "/admin/okb/name-tag", permanent: false },
      { source: "/admin/scan", destination: "/admin/okb/scan", permanent: false },
    ];
  },
};

export default nextConfig;
