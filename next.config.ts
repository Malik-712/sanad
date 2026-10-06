import type { NextConfig } from "next";

// The model (11.7 MB) and the wasm (14 MB) are kept by Transformers.js in the browser's Cache Storage, which has room for
// them. The HTTP cache must not also try to store them: a fresh browser profile refuses an entry that large
// (net::ERR_CACHE_WRITE_FAILURE) and that aborts the download. no-store keeps them out of it; no-transform stops
// the CDN recompressing the stream.
const bigFile = "no-store, no-transform";

const nextConfig: NextConfig = {
  // `next dev` would otherwise append its own block to CLAUDE.md, which only the owner edits.
  agentRules: false,
  async redirects() {
    // The paste page is now the Home page.
    return [{ source: "/parse", destination: "/", permanent: false }];
  },
  async rewrites() {
    // One static client page serves every hadith of the corpus: /c/bukhari/1 → /c.
    return [{ source: "/c/:book/:n", destination: "/c" }];
  },
  async headers() {
    return [
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: bigFile }] },
      { source: "/ort/:path*", headers: [{ key: "Cache-Control", value: bigFile }] },
      { source: "/corpus/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
