import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: false,
  },
  // Contoh template dibaca dari docs/ saat diunduh admin, jadi harus ikut dalam hasil build.
  outputFileTracingIncludes: {
    "/admin/okb/pengumuman/template/contoh": ["./docs/templates/surat-penerimaan.pdf"],
  },
  redirects() {
    return [
      { source: "/admin/name-tag", destination: "/admin/okb/name-tag", permanent: false },
      { source: "/admin/okb/scan", destination: "/admin/scan", permanent: false },
      { source: "/admin/pengumuman/:path*", destination: "/admin/okb/pengumuman/:path*", permanent: false },
      { source: "/admin/kuota", destination: "/admin/pengaturan/kuota", permanent: false },
    ];
  },
};

export default nextConfig;
